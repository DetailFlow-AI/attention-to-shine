import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const footerLinks = {
  Services: [
    { label: "Exterior Detail", href: "/services#exterior" },
    { label: "Interior Detail", href: "/services#interior" },
    { label: "Full Detail Package", href: "/services#full" },
    { label: "Monthly Checkup Plan", href: "/services#checkup" },
  ],
  Company: [
    { label: "About Us", href: "/#about" },
    { label: "Gallery", href: "/gallery" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact", href: "/contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-semibold text-sm tracking-tight">
                Attention to Shine
              </span>
            </div>
            {/* TASK 3 — DONE 2026-06-20: social media icons (Instagram &
                Facebook) removed entirely, not replaced. */}
            <p className="text-sm text-white/60 leading-relaxed">
              Bringing show-quality results to your driveway. Mobile detailing
              that comes to you — no appointment hassle, just a perfect shine.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gold mb-4">
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gold mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+18639349779"
                  className="flex items-start gap-2.5 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <Phone size={14} className="mt-0.5 shrink-0" />
                  (863) 934-9779
                </a>
              </li>
              <li>
                <a
                  href="mailto:lilliechris06@gmail.com"
                  className="flex items-start gap-2.5 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <Mail size={14} className="mt-0.5 shrink-0" />
                  lilliechris06@gmail.com
                </a>
              </li>
              {/* TASK 4 — DONE 2026-06-20: physical address replaced with
                  mobile-service line. */}
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                Stationed in Lakeland, Florida — We come to you.
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <Clock size={14} className="mt-0.5 shrink-0" />
                <span>
                  Mon – Sat: 7:00 AM – 7:00 PM
                  <br />
                  <span className="text-white/40">Sunday: Closed</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Attention to Shine Detailing. All
            rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
