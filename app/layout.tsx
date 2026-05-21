import type React from "react";
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AppWrapper } from "@/components/app-wrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "RE Platform - Global Real Estate Marketplace",
  description: "Buy, rent, invest & explore properties in 195 countries on Pi Network. Features 360° virtual tours, interactive world map, and tokenized real estate.",
  keywords: "real estate, buy property, rent apartments, invest, Pi Network, crypto",
  openGraph: {
    title: "RE Platform",
    description: "Global real estate marketplace on Pi Network",
    type: "website",
  },
  generator: 'v0.app'
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
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
      </head>
      <body className="dark">
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
