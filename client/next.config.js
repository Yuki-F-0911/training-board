/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    // appDirは最新のNext.jsではデフォルトになったため削除
  },
  distDir: '.next',
  transpilePackages: []
};

module.exports = nextConfig; 