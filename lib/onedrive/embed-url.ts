// Helpers to coerce common OneDrive / SharePoint share URLs into a form that
// renders inside an <iframe>. Most failures we've seen on the Marketing Content
// page come from users pasting a "Copy link" URL instead of an embed URL.
//
// We can't reach Microsoft Graph from the browser without auth, so this is
// purely heuristic URL rewriting + a diagnostic so the UI can warn early.

export type EmbedKind =
  | "onedrive-embed"      // already an /embed URL — pass through
  | "onedrive-personal"   // onedrive.live.com/?id=... — convert to /embed
  | "sharepoint"          // *.sharepoint.com/... — append action=embedview
  | "shortlink"           // 1drv.ms/* — can't expand without Graph; warn
  | "unknown";

export type EmbedAnalysis = {
  kind: EmbedKind;
  embedUrl: string;
  warning?: string;
};

/**
 * Best-effort transform of a OneDrive / SharePoint share URL into an
 * iframe-friendly embed URL.
 *
 * Returns the original URL untouched if it can't be confidently rewritten,
 * paired with a `warning` describing the likely problem.
 */
export function analyzeOneDriveUrl(input: string): EmbedAnalysis {
  const raw = (input || "").trim();
  if (!raw) return { kind: "unknown", embedUrl: "" };

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return {
      kind: "unknown",
      embedUrl: raw,
      warning:
        "That doesn't look like a valid URL. Paste the full https:// link from OneDrive's Embed dialog.",
    };
  }

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname;

  // 1drv.ms short links — can't expand without an HTTP redirect / Graph call.
  if (host === "1drv.ms") {
    return {
      kind: "shortlink",
      embedUrl: raw,
      warning:
        "1drv.ms short links won't render in an iframe. Open the link in a browser and use the long onedrive.live.com or sharepoint.com URL — or use OneDrive's Embed dialog and paste the iframe src URL.",
    };
  }

  // OneDrive Personal — already /embed
  if (host === "onedrive.live.com" && path.startsWith("/embed")) {
    return { kind: "onedrive-embed", embedUrl: raw };
  }

  // OneDrive Personal sharing URL (cid + id + authkey style)
  if (host === "onedrive.live.com") {
    const params = parsed.searchParams;
    const cid = params.get("cid");
    const id = params.get("id") || params.get("resid");
    const authkey = params.get("authkey");
    if (cid && id) {
      const next = new URL("https://onedrive.live.com/embed");
      next.searchParams.set("cid", cid);
      next.searchParams.set("resid", id);
      if (authkey) next.searchParams.set("authkey", authkey);
      return { kind: "onedrive-personal", embedUrl: next.toString() };
    }
    return {
      kind: "unknown",
      embedUrl: raw,
      warning:
        "This OneDrive URL is missing cid/id parameters. Use OneDrive's Embed dialog and copy the iframe src URL.",
    };
  }

  // SharePoint / OneDrive for Business
  if (host.endsWith(".sharepoint.com")) {
    // If it already has action=embedview, pass through.
    if (parsed.searchParams.get("action") === "embedview") {
      return { kind: "sharepoint", embedUrl: raw };
    }
    // For folder/document share links, appending action=embedview is the
    // commonly documented workaround (SharePoint folders + Office files).
    parsed.searchParams.set("action", "embedview");
    const warning = path.includes("/:f:/")
      ? "SharePoint folder links require the folder to be shared as 'Anyone with the link'. If the iframe stays blank, check the folder's sharing permissions."
      : undefined;
    return { kind: "sharepoint", embedUrl: parsed.toString(), warning };
  }

  return {
    kind: "unknown",
    embedUrl: raw,
    warning:
      "Unrecognized host. Embeds work best with onedrive.live.com or *.sharepoint.com URLs from the Embed dialog.",
  };
}

/** Convenience wrapper that just returns the rewritten URL. */
export function toEmbedUrl(input: string): string {
  return analyzeOneDriveUrl(input).embedUrl;
}
