/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
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
    webpack: (config) => {
        return config;
    },
};

module.exports = nextConfig; 