"use client";

import React from "react";
import { usePathname as useNextPathname, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { MiniCart } from "@/components/MiniCart";
import { useCart } from "@/lib/store";
import ContactModal from "@/components/modals/ContactModal";
import LoginModal from "@/components/modals/LoginModal";
import { useSession, signOut } from "next-auth/react";

function Navbar() {
  const tCommon = useTranslations();
  const tHeader = useTranslations("Header");

  const locale = useLocale();
  const router = useRouter();
  const pathname = useNextPathname();
  const searchParams = useSearchParams();

  const { data: session, status } = useSession();

  const [isCartOpen, setCartOpen] = React.useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isContactOpen, setContactOpen] = React.useState(false);
  const [isLoginOpen, setLoginOpen] = React.useState(false);
  const [isUserDropdownOpen, setUserDropdownOpen] = React.useState(false);

  const itemCount = useCart((state) =>
    state.items.reduce((total, item) => total + item.qty, 0)
  );

  // Track previous count to trigger badge animation
  const prevCountRef = React.useRef(itemCount);
  const [badgeBounce, setBadgeBounce] = React.useState(false);

  React.useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setBadgeBounce(true);
      const timer = setTimeout(() => setBadgeBounce(false), 600);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  React.useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 10);
        ticking = false;
      });
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
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

  // Auto-open login modal from ?login=true
  React.useEffect(() => {
    if (searchParams.get("login") === "true" && status !== "authenticated") {
      setLoginOpen(true);
    }
  }, [searchParams, status]);

  const changeLocale = (newLocale: "th" | "en") => {
    router.replace("/", { locale: newLocale });
  };

  // Check if we're on the landing page (home)
  const isHomePage = pathname === `/${locale}` || pathname === "/";

  const navLinks = [
    { hash: "testimonials", label: tHeader("reviews") },
    { hash: "products", label: tHeader("products") },
    { hash: "industrial-standards", label: tHeader("standards") },
    { hash: "faq", label: tHeader("faq") },
  ];

  // If on home page, use #hash only; otherwise navigate to /{locale}/#hash
  const getNavHref = (hash: string) =>
    isHomePage ? `#${hash}` : `/${locale}/#${hash}`;

  const contactLabel = tHeader("contact");
  const isAuthenticated = status === "authenticated" && session?.user;

  const handleUserClick = () => {
    if (isAuthenticated) {
      setUserDropdownOpen((o) => !o);
    } else {
      setLoginOpen(true);
    }
  };

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    if (isUserDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserDropdownOpen]);


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
          <Link href="/" className="flex items-center" aria-label="Home">
            <span className="font-bold text-3xl tracking-tight text-neutral-900">SOQ.</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.hash}>
                    <a
                      href={getNavHref(link.hash)}
                      className="relative text-[15px] font-medium text-neutral-600 transition-colors hover:text-black"
                    >
                      {link.label}
                    </a>
                </li>
              ))}
              <li>
                <button
                  onClick={() => setContactOpen(true)}
                  className="relative text-[15px] font-medium text-neutral-600 transition-colors hover:text-black"
                >
                  {contactLabel}
                </button>
              </li>
            </ul>

            {/* Desktop Icons */}
            <div className="flex items-center gap-2 ml-8 pl-0">
              {/* User / Auth */}
              <div className="relative" ref={dropdownRef}>
                {isAuthenticated && session.user.image ? (
                  <button
                    onClick={handleUserClick}
                    className="p-1 rounded-full hover:ring-2 hover:ring-neutral-300 transition-all"
                    aria-label={tHeader("account")}
                  >
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </button>
                ) : (
                  <button
                    onClick={handleUserClick}
                    className="p-2 text-neutral-600 hover:text-black hover:bg-black/5 transition-colors"
                    aria-label={tHeader("account")}
                  >
                    <UserIcon className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                )}

                {/* Dropdown */}
                <AnimatePresence>
                  {isUserDropdownOpen && isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white border border-neutral-200 shadow-lg py-1 z-50"
                    >
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {session.user.email}
                        </p>
                      </div>
                      <a
                        href={`/${locale}/profile`}
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <i className="fa-solid fa-user mr-2 text-xs opacity-50" />
                        {locale === "th" ? "โปรไฟล์" : "Profile"}
                      </a>
                      <a
                        href={`/${locale}/orders`}
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <i className="fa-solid fa-box-open mr-2 text-xs opacity-50" />
                        {locale === "th" ? "คำสั่งซื้อของฉัน" : "My Orders"}
                      </a>
                      <button
                        onClick={() => { setUserDropdownOpen(false); signOut({ callbackUrl: "/" }); }}
                        className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <i className="fa-solid fa-right-from-bracket mr-2 text-xs opacity-50" />
                        {locale === "th" ? "ออกจากระบบ" : "Sign Out"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setCartOpen((open) => !open)}
                className="relative p-2 text-neutral-600 hover:text-black hover:bg-black/5 transition-colors"
                aria-label={tHeader("cart")}
              >
                <ShoppingCartIcon className="w-5 h-5" strokeWidth={1.5} />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key={itemCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center bg-[var(--accent)] text-[10px] font-bold text-neutral-900 rounded-full"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <div
                className="relative flex items-center bg-neutral-100 rounded-full p-0.5 ml-1"
                role="radiogroup"
                aria-label={tCommon("language") || "Change language"}
              >
                <motion.div
                  className="absolute top-0.5 h-[calc(100%-4px)] w-[calc(50%-2px)] bg-white rounded-full shadow-sm"
                  animate={{ x: locale === "en" ? 0 : "100%" }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
                <button
                  onClick={() => changeLocale("en")}
                  className={`relative z-[1] px-2.5 py-1 text-[11px] font-semibold tracking-wide rounded-full transition-colors ${locale === "en" ? "text-neutral-900" : "text-neutral-400"}`}
                  role="radio"
                  aria-checked={locale === "en"}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLocale("th")}
                  className={`relative z-[1] px-2.5 py-1 text-[11px] font-semibold tracking-wide rounded-full transition-colors ${locale === "th" ? "text-neutral-900" : "text-neutral-400"}`}
                  role="radio"
                  aria-checked={locale === "th"}
                >
                  TH
                </button>
              </div>
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
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center bg-[var(--accent)] text-[10px] font-bold text-neutral-900 rounded-full"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
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

      </nav>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <MiniCart onClose={() => setCartOpen(false)} />
        )}
      </AnimatePresence>

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
                        key={link.hash}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.3 }}
                      >
                        <a
                          href={getNavHref(link.hash)}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-4 px-4 py-4 text-lg font-medium text-white/80 hover:text-white hover:bg-white/5 transition-all"
                        >
                          {link.label}
                        </a>
                      </motion.li>
                    ))}
                    <motion.li
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navLinks.length * 0.1, duration: 0.3 }}
                    >
                      <button
                        onClick={() => { setMobileMenuOpen(false); setContactOpen(true); }}
                        className="flex items-center gap-4 px-4 py-4 text-lg font-medium text-white/80 hover:text-white hover:bg-white/5 transition-all w-full text-left"
                      >
                        {contactLabel}
                      </button>
                    </motion.li>
                  </ul>
                </nav>

                {/* Bottom Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                  className="pt-6 border-t border-white/10 space-y-4"
                >
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center gap-3 px-4 py-2">
                        {session.user.image && (
                          <Image
                            src={session.user.image}
                            alt={session.user.name ?? "User"}
                            width={36}
                            height={36}
                            className="rounded-full"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
                          <p className="text-xs text-white/50 truncate">{session.user.email}</p>
                        </div>
                      </div>
                      <a
                        href={`/${locale}/profile`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <UserIcon className="w-5 h-5" />
                        <span>{locale === "th" ? "โปรไฟล์" : "Profile"}</span>
                      </a>
                      <a
                        href={`/${locale}/orders`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <i className="fa-solid fa-box-open w-5 text-center" />
                        <span>{locale === "th" ? "คำสั่งซื้อของฉัน" : "My Orders"}</span>
                      </a>
                      <button
                        onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                        className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-all w-full text-left"
                      >
                        <i className="fa-solid fa-right-from-bracket w-5 text-center" />
                        <span>{locale === "th" ? "ออกจากระบบ" : "Sign Out"}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setMobileMenuOpen(false); setLoginOpen(true); }}
                      className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-all w-full text-left"
                    >
                      <UserIcon className="w-5 h-5" />
                      <span>{locale === "th" ? "เข้าสู่ระบบ" : "Sign In"}</span>
                    </button>
                  )}

                  <div
                    className="relative flex items-center justify-center bg-white/10 rounded-full p-0.5 mx-auto w-fit"
                    role="radiogroup"
                    aria-label={tCommon("language") || "Change language"}
                  >
                    <motion.div
                      className="absolute top-0.5 h-[calc(100%-4px)] w-[calc(50%-2px)] bg-white/20 rounded-full"
                      animate={{ x: locale === "en" ? 0 : "100%" }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                    <button
                      onClick={() => changeLocale("en")}
                      className={`relative z-[1] px-5 py-2 text-sm font-semibold tracking-wide rounded-full transition-colors ${locale === "en" ? "text-white" : "text-white/40"}`}
                      role="radio"
                      aria-checked={locale === "en"}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => changeLocale("th")}
                      className={`relative z-[1] px-5 py-2 text-sm font-semibold tracking-wide rounded-full transition-colors ${locale === "th" ? "text-white" : "text-white/40"}`}
                      role="radio"
                      aria-checked={locale === "th"}
                    >
                      TH
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {isContactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
      {isLoginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
    </>
  );
}

export default Navbar;
export { Navbar };
