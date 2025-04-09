/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
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