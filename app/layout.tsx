import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BASE_PRICES, QUARTERLY_PLAN, MONTHLY_PLAN } from "@/lib/pricing";

export const metadata: Metadata = {
  title: {
    default: "Attention to Shine | Mobile Car Detailing in Lakeland, FL",
    template: "%s | Attention to Shine",
  },
  description:
    "Mobile car detailing in Lakeland, Florida — we come to you. Request a quote in under two minutes, or keep your car showroom-clean year-round with a Shine Standard maintenance plan.",
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
    url: "https://www.attentiontoshinedetailing.com",
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
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
