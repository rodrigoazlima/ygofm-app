import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
    remotePatterns: [
      { hostname: 'images.ygoprodeck.com' },
      { hostname: 'static.wikia.nocookie.net' },
      { hostname: 'ms.yugipedia.com' },
    ],
  },
};

export default nextConfig;
