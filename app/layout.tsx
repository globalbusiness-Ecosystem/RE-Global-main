import type React from "react";
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AppWrapper } from "@/components/app-wrapper";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  title: "RE Platform - Global Real Estate Marketplace",
  description: "Buy, rent, invest & explore properties in 195 countries on Pi Network. Features 360° virtual tours, interactive world map, and tokenized real estate.",
  keywords: "real estate, buy property, rent apartments, invest, Pi Network, crypto",
  metadataBase: new URL(siteUrl()),
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "RE Platform",
    description: "Global real estate marketplace on Pi Network",
    type: "website",
    siteName: "RE Platform",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "RE Platform - Global Real Estate Marketplace",
    description: "Buy, rent, invest & explore properties on Pi Network.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d0722",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "try{if(localStorage.getItem('re_theme_preference')==='light')document.documentElement.classList.remove('dark')}catch(e){}" }} />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="RE Platform" />
        <meta name="theme-color" content="#000000" />
        <script src="https://sdk.minepi.com/pi-sdk.js"></script>
      </head>
      <body>
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
