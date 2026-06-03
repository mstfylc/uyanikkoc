import type { Metadata } from "next";
import Script from "next/script";

import { AuthProvider } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Uyanık Koç",
    template: "%s | Uyanık Koç",
  },
  description: "YKS ve LGS için akıllı koçluk platformu",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="stylesheet" href="/assets/metronic/css/core.bundle.css" />
        <link rel="stylesheet" href="/assets/metronic/css/styles.css" />
        <link rel="stylesheet" href="/assets/metronic/vendors/keenicons/styles.bundle.css" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Script src="/assets/metronic/js/core.bundle.js" strategy="afterInteractive" />
        <Script src="/assets/metronic/js/demo1.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
