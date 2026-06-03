"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/gallery" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const isHome = pathname === "/";
  const dark = !scrolled && isHome && !menuOpen;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHome || menuOpen
          ? "nav-blur shadow-sm border-b border-black/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex items-center justify-between h-16 md:h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative h-10 w-36 transition-opacity group-hover:opacity-80">
              <Image
                src="/logo.png"
                alt="Attention to Shine"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    pathname === link.href
                      ? dark
                        ? "text-white bg-white/15"
                        : "text-navy bg-navy/5"
                      : dark
                      ? "text-white/80 hover:text-white hover:bg-white/10"
                      : "text-apple-text-secondary hover:text-apple-text-primary hover:bg-black/5"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:+18639349779"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                dark
                  ? "text-white/80 hover:text-white"
                  : "text-apple-text-secondary hover:text-apple-text-primary"
              }`}
            >
              <Phone size={14} />
              (863) 934-9779
            </a>
            <Link href="/booking" className="btn-gold text-xs px-5 py-2.5">
              Book Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${
              dark
                ? "text-white hover:bg-white/10"
                : "text-apple-text-primary hover:bg-black/5"
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden nav-blur border-t border-black/5 px-6 py-4">
          <ul className="flex flex-col gap-1 mb-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "text-navy bg-navy/5"
                      : "text-apple-text-secondary hover:text-apple-text-primary hover:bg-black/5"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 pt-2 border-t border-black/5">
            <a
              href="tel:+18639349779"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-apple-text-secondary"
            >
              <Phone size={14} />
              (863) 934-9779
            </a>
            <Link href="/booking" className="btn-gold text-sm text-center">
              Book Your Detail
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
