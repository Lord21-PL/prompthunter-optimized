/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['pbs.twimg.com', 'abs.twimg.com', 'placehold.co'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    // Expose optimized settings to client
    TWITTER_MONTHLY_LIMIT: process.env.TWITTER_MONTHLY_LIMIT,
    TWITTER_MAX_PROFILES: process.env.TWITTER_MAX_PROFILES,
  },
  output: 'standalone',
}

module.exports = nextConfig