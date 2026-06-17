import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'images.ygoprodeck.com' },
      { hostname: 'static.wikia.nocookie.net' },
      { hostname: 'ms.yugipedia.com' },
    ],
  },
};

export default nextConfig;
