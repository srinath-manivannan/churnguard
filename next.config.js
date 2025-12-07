/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Add these for better production compatibility
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // ✅ Important for NextAuth
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;