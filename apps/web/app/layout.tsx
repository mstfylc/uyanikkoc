import type { Metadata } from "next";

import { AuthProvider } from "./providers";
import "./globals.css";
import "../styles/uk-design.css";
import "../styles/odev-ata.css";

export const dynamic = "force-dynamic";

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
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
