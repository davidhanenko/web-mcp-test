import type { NextConfig } from "next";

// WebMCP origin trial token, set in Vercel. Unset on localhost, where the Chrome flag is used.
const webMcpOriginTrialToken = process.env.WEBMCP_ORIGIN_TRIAL_TOKEN;

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    if (!webMcpOriginTrialToken) return [];
    return [
      {
        source: "/:path*",
        headers: [{ key: "Origin-Trial", value: webMcpOriginTrialToken }],
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
