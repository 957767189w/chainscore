/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 环境变量
  env: {
    NEXT_PUBLIC_GENLAYER_NETWORK: process.env.NEXT_PUBLIC_GENLAYER_NETWORK || 'testnet',
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
  },
  
  // 静态导出（如果需要）
  // output: 'export',
  
  // 忽略 ESLint 错误（开发阶段）
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
