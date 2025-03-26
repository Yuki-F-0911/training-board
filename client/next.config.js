/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    // appDirは最新のNext.jsではデフォルトになったため削除
  },
  distDir: '.next',
  transpilePackages: [],
  crossOrigin: 'anonymous',
  images: {
    domains: ['training-board-server.vercel.app'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 