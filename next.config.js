/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['jkvwuvvfqyqrcyxfgfef.supabase.co'], // env - NEXT_PUBLIC_SUPABASE_URL
  },
};

module.exports = nextConfig;
