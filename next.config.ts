import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  serverExternalPackages: ["argon2"],
};

export default createNextIntlPlugin("./src/i18n/request.ts")(nextConfig);
