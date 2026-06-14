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
    const contentSecurityPolicyReportOnly = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicyReportOnly },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
