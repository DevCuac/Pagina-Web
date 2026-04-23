/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['169.254.47.52'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
