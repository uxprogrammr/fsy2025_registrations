/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
        // This will ignore ESLint errors during build
        ignoreDuringBuilds: true,
      },
    async redirects() {
        return [
            {
                source: '/companies',
                destination: '/company',
                permanent: true,
            },
            {
                source: '/companies/:path*',
                destination: '/company/:path*',
                permanent: true,
            },
        ];
    },
};

module.exports = nextConfig; 