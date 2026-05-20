import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: ['192.168.1.110'],
  }),
};

export default nextConfig;
