/** @type {import('next').NextConfig} */
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(rootDir, "../..");
const reactRoot = path.join(monorepoRoot, "node_modules/react");
const reactDomRoot = path.join(monorepoRoot, "node_modules/react-dom");

const nextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  transpilePackages: [
    "@uyanik/contracts",
    "@uyanik/database",
    "@uyanik/shared",
    "@uyanik/tokens",
    "@uyanik/ui-web",
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      react: reactRoot,
      "react-dom": reactDomRoot,
    };
    return config;
  },
  async redirects() {
    return [
      { source: "/admin", destination: "/yonetim/dashboard", permanent: false },
      { source: "/admin/:path*", destination: "/yonetim/:path*", permanent: false },
      { source: "/branch", destination: "/yonetim/dashboard", permanent: false },
      { source: "/branch/:path*", destination: "/yonetim/:path*", permanent: false },
    ];
  },
};

export default nextConfig;
