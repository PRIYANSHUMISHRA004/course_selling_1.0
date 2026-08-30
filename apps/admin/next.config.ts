import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["store", "ui", "db", "auth"],
  // Prevents worker thread memory spikes on Vercel build servers
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;

