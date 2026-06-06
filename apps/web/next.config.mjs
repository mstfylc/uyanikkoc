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
