/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
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
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
        };
        return config;
    },
};

module.exports = nextConfig; 