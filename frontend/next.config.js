/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/studio/:path*',
        destination: 'http://localhost:3001/api/studio/:path*',
      },
      {
        source: '/api/workflows/:path*',
        destination: 'http://localhost:3002/api/workflows/:path*',
      },
      {
        source: '/api/agents/:path*',
        destination: 'http://localhost:3003/api/agents/:path*',
      },
      {
        source: '/api/integrations/:path*',
        destination: 'http://localhost:3004/api/integrations/:path*',
      },
      {
        source: '/api/export/:path*',
        destination: 'http://localhost:3005/api/export/:path*',
      },
      {
        source: '/api/python/:path*',
        destination: 'http://localhost:3006/api/python/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
