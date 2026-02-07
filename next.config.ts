import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    process.env.REPLIT_DEV_DOMAIN || "",
    ...(process.env.REPLIT_DOMAINS ? process.env.REPLIT_DOMAINS.split(",") : []),
  ].filter(Boolean),
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
