import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// TASK 8 — reserves the bottom-right chatbot slot ("Shine") on every page except /booking: DONE 2026-06-25
import ShinePlaceholder from "@/components/ShinePlaceholder";

export const metadata: Metadata = {
  title: {
    default: "Attention to Shine | Mobile Car Detailing in Lakeland, FL",
    template: "%s | Attention to Shine",
  },
  description:
    "Premium mobile car detailing in Lakeland, Florida. We bring the shine to you — expert interior & exterior detailing, paint protection, and monthly maintenance packages. Book online today.",
  keywords: [
    "car detailing Lakeland FL",
    "mobile detailing Florida",
    "auto detailing Lakeland",
    "car wash Lakeland",

    "interior detailing",
    "exterior detailing",
    "Attention to Shine",
  ],
  openGraph: {
    title: "Attention to Shine | Mobile Car Detailing in Lakeland, FL",
    description:
      "Expert mobile car detailing that comes to you. Interior, exterior, and full detail packages starting at $79.99.",
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
        {/* Future AI chatbot "Shine" mounts in this reserved bottom-right slot (not on /booking). */}
        <ShinePlaceholder />
      </body>
    </html>
  );
}
