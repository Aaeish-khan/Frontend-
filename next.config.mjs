/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: false,
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["tesseract.js"],
}

export default nextConfig
