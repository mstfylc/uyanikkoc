import type { Metadata } from "next";
import Script from "next/script";

import { AuthProvider } from "./providers";
import "./globals.css";
import "../styles/uk-design.css";

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
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
