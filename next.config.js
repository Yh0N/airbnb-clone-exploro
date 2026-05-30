/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'unpkg.com',
      },
      {
        protocol: 'https',
        hostname: 'exploro-api.onrender.com',
      },
      {
        protocol: 'https',
        hostname: '**.onrender.com',
      },
    ],
  },
};

module.exports = nextConfig;
