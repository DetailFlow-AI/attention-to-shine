import type { Metadata } from "next";
import { Inter, Archivo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";
import { BASE_PRICES, QUARTERLY_PLAN, MONTHLY_PLAN } from "@/lib/pricing";

// Self-hosted by next/font: no render-blocking request to Google at runtime.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Display face for headings. The width axis lets headings run slightly
// expanded — a wide, automotive stance — without loading a second family.
//
// "optional" rather than "swap": the headline is the page's Largest Contentful
// Paint, and swapping fonts under it pushed LCP back ~0.8s on mobile. With
// "optional" a slow first visit keeps the (metric-matched) fallback for that
// one page view and gets Archivo from cache after that.
const archivo = Archivo({
  subsets: ["latin"],
  display: "optional",
  axes: ["wdth"],
  variable: "--font-display",
});

// The live domain. This previously read "attentiontoshinedetailing.com",
// which is missing "mobile" and does not resolve — every link preview pointed
// at a dead host. Kept in one constant so the canonical URL and the OpenGraph
// URL can't drift apart again.
const SITE_URL = "https://www.attentiontoshinemobiledetailing.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Attention to Shine | Mobile Car Detailing in Lakeland, FL",
    template: "%s | Attention to Shine",
  },
  // Built from lib/pricing.ts so the search snippet can't drift from the
  // prices on the page.
  description: `Mobile car detailing in Lakeland, FL — we come to you. Full Detail from $${BASE_PRICES.full}, Exterior from $${BASE_PRICES.exterior}, Interior from $${BASE_PRICES.interior}. Request an appointment in under two minutes.`,
  keywords: [
    "car detailing Lakeland FL",
    "mobile detailing Florida",
    "auto detailing Lakeland",
    "car wash Lakeland",
    "request a detailing quote Lakeland",
    "car maintenance plan Lakeland",
    "interior detailing",
    "exterior detailing",
    "Attention to Shine",
  ],
  openGraph: {
    title: "Attention to Shine | Mobile Car Detailing in Lakeland, FL",
    description: `Mobile detailing that comes to you in Lakeland, FL. Full details start at $${BASE_PRICES.full}, plus ${QUARTERLY_PLAN.name} and ${MONTHLY_PLAN.name} plans. Request a quote — no payment up front.`,
    url: SITE_URL,
    siteName: "Attention to Shine",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${archivo.variable}`}>
      <body>
        <RevealObserver />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
