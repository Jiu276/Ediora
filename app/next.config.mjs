/** @type {import('next').NextConfig} */
const lowMemBuild = process.env.LOW_MEM_BUILD === '1'

const nextConfig = {
  eslint: {
    // 低配服务器部署时设 LOW_MEM_BUILD=1，跳过 ESLint 以降低内存占用
    ignoreDuringBuilds: lowMemBuild,
  },
  typescript: {
    ignoreBuildErrors: lowMemBuild,
  },
  ...(lowMemBuild
    ? {
        experimental: {
          cpus: 1,
        },
      }
    : {}),
};

export default nextConfig;
