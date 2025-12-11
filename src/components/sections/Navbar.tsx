"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { MiniCart } from "@/components/MiniCart";
import { useCartStore } from "@/store/cart";
import type { CartStore } from "@/store/cart";

function Navbar() {
  const tCommon = useTranslations();
  const tHeader = useTranslations("Header");

  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [isCartOpen, setCartOpen] = React.useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const itemCount = useCartStore((state: CartStore) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );

  React.useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const changeLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    if (segments.length > 1) {
      segments[1] = newLocale;
    }
    router.push(segments.join("/") as any);
  };

  const navLinks = [
    { href: `/${locale}#testimonials`, label: tHeader("reviews") },
    { href: `/${locale}#products`, label: tHeader("products") },
    { href: `/${locale}#industrial-standards`, label: tHeader("standards") },
    { href: `/${locale}#faq`, label: tHeader("faq") },
    { href: `/${locale}#footer`, label: tHeader("contact") },
  ];


  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen
            ? "bg-white/90 backdrop-blur-xl border-b border-neutral-200 shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center" aria-label="Home">
            <span className="font-bold text-3xl tracking-tight text-neutral-900">SOQ.</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.href}>
                    <Link
                      href={link.href as any}
                      className="relative text-[15px] font-medium text-neutral-600 transition-colors hover:text-black"
                    >
                      {link.label}
                    </Link>
                </li>
              ))}
            </ul>

            {/* Desktop Icons */}
            <div className="flex items-center gap-2 ml-8 pl-0">
              <Link
                href={`/${locale}/profile` as any}
                className="p-2 text-neutral-600 hover:text-black hover:bg-black/5 transition-colors"
                aria-label={tHeader("account")}
              >
                <UserIcon className="w-5 h-5" strokeWidth={1.5} />
              </Link>

              <button
                onClick={() => setCartOpen((open) => !open)}
                className="relative p-2 text-neutral-600 hover:text-black hover:bg-black/5 transition-colors"
                aria-label={tHeader("cart")}
              >
                <ShoppingCartIcon className="w-5 h-5" strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center bg-red-500 text-[10px] font-semibold text-white">
                    {itemCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => changeLocale(locale === "en" ? "th" : "en")}
                className="flex items-center gap-1 px-3 py-1.5 text-[15px] font-medium text-neutral-600 hover:text-black transition-colors"
                aria-label={tCommon("language") || "Change language"}
              >
                {locale === "en" ? "EN -" : "ไทย -"}
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setCartOpen((open) => !open)}
              className="relative p-2 text-white/70 hover:text-white transition-colors"
              aria-label={tHeader("cart")}
            >
              <ShoppingCartIcon className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center bg-[var(--accent)] text-[10px] font-semibold text-black">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mini cart panel */}
        <AnimatePresence>
          {isCartOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-4 sm:right-8 top-[76px] z-50"
            >
              <MiniCart onClose={() => setCartOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-[76px] right-0 bottom-0 z-40 w-full max-w-sm bg-[#0f0f23]/95 backdrop-blur-xl border-l border-white/10 lg:hidden"
            >
              <div className="flex flex-col h-full p-6">
                {/* Nav Links */}
                <nav className="flex-1 py-8">
                  <ul className="space-y-2">
                    {navLinks.map((link, i) => (
                      <motion.li
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.3 }}
                      >
                        <Link
                          href={link.href as any}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-4 px-4 py-4 text-lg font-medium text-white/80 hover:text-white hover:bg-white/5 transition-all"
                        >
                          {link.label}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </nav>

                {/* Bottom Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                  className="pt-6 border-t border-white/10 space-y-4"
                >
                  <Link
                    href={`/${locale}/profile` as any}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>{tHeader("account")}</span>
                  </Link>

                  <button
                    onClick={() => changeLocale(locale === "en" ? "th" : "en")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-all"
                  >
                    <span className="text-lg">{locale === "en" ? "🇺🇸" : "🇹🇭"}</span>
                    <span>{locale === "en" ? "English" : "ภาษาไทย"}</span>
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
export { Navbar };