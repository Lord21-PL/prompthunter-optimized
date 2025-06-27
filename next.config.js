/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Remove appDir as it's now stable in Next.js 14
  },
  env: {
    // Remove these custom env variables or set them properly
    CUSTOM_KEY: process.env.CUSTOM_KEY || '',
    TWITTER_MONTHLY_LIMIT: process.env.TWITTER_MONTHLY_LIMIT || '95',
    TWITTER_MAX_PROFILES: process.env.TWITTER_MAX_PROFILES || '3',
  },
  // Remove output: standalone for development
  // output: 'standalone', // Only use this for production builds
}

module.exports = nextConfig