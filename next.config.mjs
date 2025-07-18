/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude express from the client bundle
    if (!isServer) {
      config.externals.push('express');
    }

    return config;
  },
};

export default nextConfig;
