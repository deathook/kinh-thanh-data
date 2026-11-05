import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['nodemailer'],
  outputFileTracingIncludes: {
    '/**': ['./database/*.db'],
  },
};

export default nextConfig;
