import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Discord CDN — user avatars, guild icons
        protocol: "https",
        hostname: "cdn.discordapp.com",
        pathname: "/**",
      },
      {
        // Roblox CDN — player thumbnails, avatar images
        protocol: "https",
        hostname: "rbxcdn.com",
        pathname: "/**",
      },
      {
        // Roblox thumbnails API images
        protocol: "https",
        hostname: "tr.rbxcdn.com",
        pathname: "/**",
      },
      {
        // Roblox static assets
        protocol: "https",
        hostname: "static.rbxcdn.com",
        pathname: "/**",
      },
    ],
  },

  // Headers for security hardening
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Expose only safe public env vars to the client bundle
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
  },
};

export default nextConfig;