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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
