import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    /* config options here */
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "gaming-cdn.com",
            },
        ],
    },
    output: "standalone"
};

export default nextConfig;
