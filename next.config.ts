import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["*"],
  async redirects() {
    return [
      {
        source: "/forecasts",
        destination: "/forecast",
        permanent: true,
      },
    ];
  },
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
