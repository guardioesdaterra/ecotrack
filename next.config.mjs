/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Desativa modo estrito para evitar duplas renderizações
  images: {
    domains: ['unpkg.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'unpkg.com',
      },
      {
        protocol: 'https',
        hostname: 'cartodb-basemaps-*.global.ssl.fastly.net',
      },
    ],
  },
  webpack: (config) => {
    // Fix para pacotes que dependem do módulo 'fs'
    config.resolve.fallback = { 
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  // Configuração para melhor compatibilidade com Vercel
  output: 'standalone',
  transpilePackages: ['leaflet', 'react-leaflet'],
  // Desativa otimização experimental que pode causar problemas
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
}

export default nextConfig