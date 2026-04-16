import { Connection } from 'jsforce';
import { createSign } from 'node:crypto';

/**
 * Salesforce JWT Bearer client with module-level connection cache.
 *
 * Server-only. Never import from a client component — doing so would bundle
 * the private key into the browser.
 *
 * Auth flow (OAuth 2.0 JWT Bearer, server-to-server, no interactive login):
 * 1. Build a JWT with iss=client_id, sub=username, aud=login URL, exp=+3min.
 * 2. Sign it with RS256 using SFDC_PRIVATE_KEY.
 * 3. POST it to /services/oauth2/token with grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer.
 * 4. Receive access_token + instance_url; hand to a jsforce Connection.
 *
 * jsforce 3.x doesn't expose JWT helpers, so we build the assertion ourselves
 * with Node's built-in crypto — no extra deps.
 */

interface CachedConnection {
  conn: Connection;
  /** Epoch millis when this connection is considered expired and must be re-authed. */
  expiresAt: number;
}

// Salesforce tokens typically last 30 minutes (configured in the Connected App).
// We refresh a few minutes early to avoid edge cases.
const TOKEN_TTL_MS = 25 * 60 * 1000;
const JWT_EXPIRY_SECONDS = 180; // Salesforce requires exp < now + 5 min

let cached: CachedConnection | null = null;
let inFlight: Promise<Connection> | null = null;

function normalizePrivateKey(raw: string): string {
  // Vercel / dotenv sometimes store keys with literal \n escapes.
  if (raw.includes('\\n') && !raw.includes('\n')) {
    return raw.replace(/\\n/g, '\n');
  }
  return raw;
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`Missing required Salesforce env var: ${name}`);
  return v;
}

function base64url(buf: Buffer | string): string {
  const b = typeof buf === 'string' ? Buffer.from(buf) : buf;
  return b.toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function buildJwtAssertion(
  clientId: string,
  username: string,
  audience: string,
  privateKey: string,
): string {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientId,
    sub: username,
    aud: audience,
    exp: now + JWT_EXPIRY_SECONDS,
  };

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = base64url(signer.sign(privateKey));
  return `${unsigned}.${signature}`;
}

interface JwtTokenResponse {
  access_token: string;
  instance_url: string;
  id: string;
  token_type: string;
  issued_at: string;
  scope: string;
}

interface JwtErrorResponse {
  error: string;
  error_description?: string;
}

async function authenticate(): Promise<Connection> {
  const instanceUrl = requireEnv('SFDC_INSTANCE_URL');
  const loginUrl = process.env.SFDC_LOGIN_URL || 'https://login.salesforce.com';
  const clientId = requireEnv('SFDC_CLIENT_ID');
  const username = requireEnv('SFDC_USERNAME');
  const privateKey = normalizePrivateKey(requireEnv('SFDC_PRIVATE_KEY'));
  const version = (process.env.SFDC_API_VERSION || '62.0').replace(/^v/i, '');

  const assertion = buildJwtAssertion(clientId, username, loginUrl, privateKey);

  const tokenUrl = `${loginUrl.replace(/\/$/, '')}/services/oauth2/token`;
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    let detail = text;
    try {
      const parsed = JSON.parse(text) as JwtErrorResponse;
      detail = parsed.error_description
        ? `${parsed.error}: ${parsed.error_description}`
        : parsed.error;
    } catch {
      // keep raw text
    }
    throw new Error(`Salesforce JWT auth failed (${res.status}): ${detail}`);
  }

  const token = JSON.parse(text) as JwtTokenResponse;

  return new Connection({
    instanceUrl: token.instance_url ?? instanceUrl,
    accessToken: token.access_token,
    version,
  });
}

/**
 * Returns a ready-to-use Salesforce connection.
 * Reuses the cached connection if still valid, otherwise re-authenticates.
 * De-duplicates concurrent callers so we don't mint multiple tokens at once.
 */
export async function getSalesforceConnection(): Promise<Connection> {
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.conn;
  if (inFlight) return inFlight;

  inFlight = authenticate()
    .then((conn) => {
      cached = { conn, expiresAt: Date.now() + TOKEN_TTL_MS };
      return conn;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

/** Clear the cached connection — useful in tests or when we detect a 401. */
export function resetSalesforceConnection(): void {
  cached = null;
  inFlight = null;
}

/**
 * Wrapper that retries once on 401 INVALID_SESSION_ID. Salesforce sometimes
 * revokes tokens early (e.g., admin rotates permissions). We bust the cache
 * and re-auth.
 */
export async function withSalesforce<T>(fn: (conn: Connection) => Promise<T>): Promise<T> {
  const conn = await getSalesforceConnection();
  try {
    return await fn(conn);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/INVALID_SESSION_ID|session expired|authentication failure/i.test(msg)) {
      resetSalesforceConnection();
      const fresh = await getSalesforceConnection();
      return await fn(fresh);
    }
    throw err;
  }
}
