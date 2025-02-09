/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  distDir: process.env.NODE_ENV === 'production' ? '../app' : '.next',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    IBM_SYSTEM_HOST: process.env.IBM_SYSTEM_HOST
  },
  webpack: (config, { isServer }) => {
    config.output.globalObject = 'self';

    // Ensuring ES module compatibility for server-side code
    if (isServer) {
      config.module.rules.push({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false, // Prevent Webpack from processing the fully specified ESM imports
        },
      });
    }

    return config;
  },
}
