/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@mui/material',
    '@mui/icons-material',
    '@mui/system',
    '@mui/base',
    '@emotion/react',
    '@emotion/styled',
  ],
  experimental: {
    // Removed the duplicate packages from here
    serverComponentsExternalPackages: [],
  },
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
