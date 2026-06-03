/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  transpilePackages: [
    "@uyanik/contracts",
    "@uyanik/database",
    "@uyanik/shared",
    "@uyanik/tokens",
    "@uyanik/ui-web",
  ],
};

export default nextConfig;
