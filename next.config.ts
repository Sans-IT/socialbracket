import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["lh3.googleusercontent.com", "homtlbtqpwruozmsgxkw.supabase.co"],
  },
  eslint: {
    // Disable ESLint during production build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
