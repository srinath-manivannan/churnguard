// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // ✅ Add these for better production compatibility
//   experimental: {
//     serverActions: {
//       bodySizeLimit: '2mb',
//     },
//   },
//   // ✅ Important for NextAuth
//   typescript: {
//     ignoreBuildErrors: false,
//   },
//   eslint: {
//     ignoreDuringBuilds: false,
//   },
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // ❌ Do NOT add: output: "export"
};

export default nextConfig;
