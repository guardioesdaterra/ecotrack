/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['unpkg.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'unpkg.com',
      },
    ],
  },
  webpack: (config) => {
    // Fixes npm packages that depend on `fs` module
    config.resolve.fallback = { fs: false };
    return config;
  },
  // Configuração para melhor compatibilidade com Vercel
  output: 'standalone',
  transpilePackages: ['leaflet', 'react-leaflet'],
  // Otimizações para SPA
  experimental: {
    missingSuspenseWithCSRBailout: false,
  }
}

export default nextConfig 