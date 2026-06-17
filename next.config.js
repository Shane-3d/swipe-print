/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This project sits under a home dir that also has a package-lock.json;
  // pin the tracing root so Next doesn't pick the wrong workspace.
  outputFileTracingRoot: __dirname,
  images: {
    // Allow remote thumbnails from the 3D model sources we aggregate.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

module.exports = nextConfig;
