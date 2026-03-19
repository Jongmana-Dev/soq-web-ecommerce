"use client";

import React from "react";
import { usePathname as useNextPathname, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart as ShoppingCartIcon, User as UserIcon, Menu as Bars3Icon, X as XMarkIcon, ShoppingBag as ShoppingBagIcon } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import { MiniCart } from "@/components/MiniCart";
import { useCart } from "@/lib/store";
import dynamic from "next/dynamic"
const ContactModal = dynamic(() => import("@/components/modals/ContactModal"))
const LoginModal = dynamic(() => import("@/components/modals/LoginModal"))
const LogoutConfirmModal = dynamic(() => import("@/components/modals/LogoutConfirmModal"))
const ProductModal = dynamic(() => import("@/components/modals/ProductModal"))
import type { ProductData } from "@/lib/products";
import { useSession } from "next-auth/react";
import { usePendingOrders } from "@/lib/pending-orders-store";

function Navbar() {
  const tCommon = useTranslations();
  const tHeader = useTranslations("Header");

  const locale = useLocale();
  const router = useRouter();
  const pathname = useNextPathname();
  const searchParams = useSearchParams();

  const { data: session, status } = useSession();

  const pendingCount = usePendingOrders((s) => s.count);
  const fetchPending = usePendingOrders((s) => s.fetch);
  const clearPending = usePendingOrders((s) => s.clear);

  React.useEffect(() => {
    if (status === "authenticated") {
      fetchPending();
    } else {
      clearPending();
    }
  }, [status, fetchPending, clearPending]);

  const [isCartOpen, setCartOpen] = React.useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isContactOpen, setContactOpen] = React.useState(false);
  const [isLoginOpen, setLoginOpen] = React.useState(false);
  const [isUserDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const [isLogoutModalOpen, setLogoutModalOpen] = React.useState(false);
  const [orderProduct, setOrderProduct] = React.useState<ProductData | null>(null);
  const [orderLoading, setOrderLoading] = React.useState(false);

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

  // Dark navbar for member pages (profile, orders)
  const isDarkNav = pathname.includes("/profile") || pathname.includes("/orders");

  const navLinks = [
    { hash: "testimonials", label: tHeader("reviews") },
    { hash: "products", label: tHeader("products") },
    { hash: "industrial-standards", label: tHeader("standards") },
    { hash: "about", label: tHeader("about") },
    { hash: "faq", label: tHeader("faq") },
  ];

  // If on home page, use #hash only; otherwise navigate to /{locale}/#hash
  const getNavHref = (hash: string) =>
    isHomePage ? `#${hash}` : `/${locale}/#${hash}`;

  const contactLabel = tHeader("contact");
  // Prevent hydration mismatch: treat as unauthenticated until client mounts
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isAuthenticated = mounted && status === "authenticated" && session?.user;

  const handleUserClick = () => {
    if (isAuthenticated) {
      setUserDropdownOpen((o) => !o);
    } else {
      setLoginOpen(true);
    }
  };

  const handleOrderClick = React.useCallback(async () => {
    if (orderLoading) return;
    setOrderLoading(true);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      const products: ProductData[] = json.data ?? json;
      if (products[0]) setOrderProduct(products[0]);
    } catch {
      // silently ignore
    } finally {
      setOrderLoading(false);
    }
  }, [orderLoading]);

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
          isDarkNav
            ? "bg-neutral-950 border-b border-neutral-800"
            : isScrolled || isMobileMenuOpen
              ? "bg-white/90 backdrop-blur-xl border-b border-neutral-200 shadow-sm"
              : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center" aria-label="Home">
            <img
              src="/logo.svg"
              alt="SOQ"
              className={`h-7 w-auto ${isDarkNav ? "invert" : ""}`}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.hash}>
                    <a
                      href={getNavHref(link.hash)}
                      className={`relative text-[15px] font-medium transition-colors ${
                        isDarkNav
                          ? "text-neutral-400 hover:text-white"
                          : "text-neutral-600 hover:text-black"
                      }`}
                    >
                      {link.label}
                    </a>
                </li>
              ))}
              <li>
                <button
                  onClick={() => setContactOpen(true)}
                  className={`relative text-[15px] font-medium transition-colors ${
                    isDarkNav
                      ? "text-neutral-400 hover:text-white"
                      : "text-neutral-600 hover:text-black"
                  }`}
                >
                  {contactLabel}
                </button>
              </li>
            </ul>

            {/* Order Button */}
            <button
              onClick={handleOrderClick}
              disabled={orderLoading}
              className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold transition-all bg-[var(--accent)] text-neutral-900 hover:brightness-110 disabled:opacity-50"
            >
              {orderLoading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShoppingBagIcon className="w-4 h-4" strokeWidth={2} />
              )}
              {locale === "th" ? "ซื้อเลย" : "Buy Now"}
            </button>

            {/* Desktop Icons */}
            <div className="flex items-center gap-2 ml-8 pl-0">
              {/* User / Auth */}
              <div className="relative group" ref={dropdownRef}>
                {isAuthenticated ? (
                  <button
                    onClick={handleUserClick}
                    className="relative p-1 rounded-full hover:ring-2 hover:ring-neutral-300 transition-all"
                    aria-label={tHeader("account")}
                  >
                    <UserAvatar
                      src={session.user.image}
                      name={session.user.name}
                      size={32}
                    />
                    {pendingCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center bg-red-500 text-[10px] font-bold text-white rounded-full">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleUserClick}
                    className={`relative p-2 transition-colors ${
                      isDarkNav
                        ? "text-neutral-400 hover:text-white hover:bg-white/10"
                        : "text-neutral-600 hover:text-black hover:bg-black/5"
                    }`}
                    aria-label={tHeader("account")}
                  >
                    <UserIcon className="w-5 h-5" strokeWidth={1.5} />
                    {pendingCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center bg-red-500 text-[10px] font-bold text-white rounded-full">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Pending orders tooltip */}
                {pendingCount > 0 && !isUserDropdownOpen && (
                  <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    <div className="bg-neutral-900 text-white text-xs px-3 py-1.5 rounded shadow-lg">
                      {locale === "th"
                        ? `มี ${pendingCount} รายการรอแจ้งชำระเงิน`
                        : `${pendingCount} order${pendingCount > 1 ? "s" : ""} pending payment`}
                    </div>
                  </div>
                )}

                {/* Dropdown */}
                <AnimatePresence>
                  {isUserDropdownOpen && isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute right-0 top-full mt-2 w-48 shadow-lg py-1 z-50 ${
                        isDarkNav
                          ? "bg-neutral-900 border border-neutral-700"
                          : "bg-white border border-neutral-200"
                      }`}
                    >
                      <div className={`px-4 py-2 border-b ${isDarkNav ? "border-neutral-700" : "border-neutral-100"}`}>
                        <p className={`text-sm font-medium truncate ${isDarkNav ? "text-white" : "text-neutral-900"}`}>
                          {session.user.name}
                        </p>
                        <p className={`text-xs truncate ${isDarkNav ? "text-neutral-400" : "text-neutral-500"}`}>
                          {session.user.email}
                        </p>
                      </div>
                      <a
                        href={`/${locale}/profile`}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          isDarkNav
                            ? "text-neutral-300 hover:bg-white/5 hover:text-white"
                            : "text-neutral-700 hover:bg-neutral-50"
                        }`}
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <i className="fa-solid fa-user mr-2 text-xs opacity-50" />
                        {locale === "th" ? "โปรไฟล์" : "Profile"}
                      </a>
                      <a
                        href={`/${locale}/orders`}
                        className={`flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                          isDarkNav
                            ? "text-neutral-300 hover:bg-white/5 hover:text-white"
                            : "text-neutral-700 hover:bg-neutral-50"
                        }`}
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <span>
                          <i className="fa-solid fa-box-open mr-2 text-xs opacity-50" />
                          {locale === "th" ? "คำสั่งซื้อของฉัน" : "My Orders"}
                        </span>
                        {pendingCount > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center bg-red-500 text-[10px] font-bold text-white rounded-full px-1.5">
                            {pendingCount}
                          </span>
                        )}
                      </a>
                      <button
                        onClick={() => { setUserDropdownOpen(false); setLogoutModalOpen(true); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          isDarkNav
                            ? "text-neutral-300 hover:bg-white/5 hover:text-white"
                            : "text-neutral-700 hover:bg-neutral-50"
                        }`}
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
                className={`relative p-2 transition-colors ${
                  isDarkNav
                    ? "text-neutral-400 hover:text-white hover:bg-white/10"
                    : "text-neutral-600 hover:text-black hover:bg-black/5"
                }`}
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
                className={`relative flex items-center rounded-full p-0.5 ml-1 ${
                  isDarkNav ? "bg-white/10" : "bg-neutral-100"
                }`}
                role="radiogroup"
                aria-label={tCommon("language") || "Change language"}
              >
                <motion.div
                  className={`absolute top-0.5 h-[calc(100%-4px)] w-[calc(50%-2px)] rounded-full ${
                    isDarkNav ? "bg-white/20" : "bg-white shadow-sm"
                  }`}
                  animate={{ x: locale === "en" ? 0 : "100%" }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
                <button
                  onClick={() => changeLocale("en")}
                  className={`relative z-[1] px-2.5 py-1 text-[11px] font-semibold tracking-wide rounded-full transition-colors ${
                    isDarkNav
                      ? locale === "en" ? "text-white" : "text-white/40"
                      : locale === "en" ? "text-neutral-900" : "text-neutral-400"
                  }`}
                  role="radio"
                  aria-checked={locale === "en"}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLocale("th")}
                  className={`relative z-[1] px-2.5 py-1 text-[11px] font-semibold tracking-wide rounded-full transition-colors ${
                    isDarkNav
                      ? locale === "th" ? "text-white" : "text-white/40"
                      : locale === "th" ? "text-neutral-900" : "text-neutral-400"
                  }`}
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
              onClick={handleOrderClick}
              disabled={orderLoading}
              className={`p-2 transition-colors ${
                isDarkNav
                  ? "text-[var(--accent)]"
                  : "text-neutral-600 hover:text-neutral-900"
              } disabled:opacity-50`}
              aria-label={locale === "th" ? "สั่งซื้อสินค้า" : "Order products"}
            >
              {orderLoading ? (
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin block" />
              ) : (
                <ShoppingBagIcon className="w-5 h-5" strokeWidth={1.5} />
              )}
            </button>

            <button
              onClick={() => setCartOpen((open) => !open)}
              className={`relative p-2 transition-colors ${
                isDarkNav
                  ? "text-neutral-400 hover:text-white"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
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
              className={`p-2 transition-colors ${
                isDarkNav
                  ? "text-neutral-400 hover:text-white"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
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
              className="fixed top-[76px] right-0 bottom-0 z-40 w-full max-w-sm bg-neutral-950/98 backdrop-blur-xl border-l border-neutral-800 lg:hidden"
            >
              <div className="flex flex-col h-full p-6">
                {/* Nav Links */}
                <nav className="flex-1 py-6">
                  <ul className="space-y-1">
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
                          className="flex items-center gap-4 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-all"
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
                        className="flex items-center gap-4 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-all w-full text-left"
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
                  className="pt-6 border-t border-neutral-800 space-y-3"
                >
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center gap-3 px-4 py-2">
                        <UserAvatar
                          src={session.user.image}
                          name={session.user.name}
                          size={32}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{session.user.name}</p>
                          <p className="text-[11px] text-white/50 truncate">{session.user.email}</p>
                        </div>
                      </div>
                      <a
                        href={`/${locale}/profile`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>{locale === "th" ? "โปรไฟล์" : "Profile"}</span>
                      </a>
                      <a
                        href={`/${locale}/orders`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <i className="fa-solid fa-box-open w-4 text-xs text-center" />
                        <span className="flex-1">{locale === "th" ? "คำสั่งซื้อของฉัน" : "My Orders"}</span>
                        {pendingCount > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center bg-red-500 text-[10px] font-bold text-white rounded-full px-1.5">
                            {pendingCount}
                          </span>
                        )}
                      </a>
                      <button
                        onClick={() => { setMobileMenuOpen(false); setLogoutModalOpen(true); }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-all w-full text-left"
                      >
                        <i className="fa-solid fa-right-from-bracket w-4 text-xs text-center" />
                        <span>{locale === "th" ? "ออกจากระบบ" : "Sign Out"}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setMobileMenuOpen(false); setLoginOpen(true); }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-all w-full text-left"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>{locale === "th" ? "เข้าสู่ระบบ" : "Sign In"}</span>
                    </button>
                  )}

                  <div
                    className="flex items-center gap-2 px-4 mt-2"
                    role="radiogroup"
                    aria-label={tCommon("language") || "Change language"}
                  >
                    <button
                      onClick={() => changeLocale("en")}
                      className={`flex-1 py-3 text-xs font-semibold tracking-wider text-center transition-all ${
                        locale === "en"
                          ? "bg-white text-neutral-900"
                          : "bg-neutral-800 text-neutral-500 hover:text-neutral-300"
                      }`}
                      role="radio"
                      aria-checked={locale === "en"}
                    >
                      English
                    </button>
                    <button
                      onClick={() => changeLocale("th")}
                      className={`flex-1 py-3 text-xs font-semibold tracking-wider text-center transition-all ${
                        locale === "th"
                          ? "bg-white text-neutral-900"
                          : "bg-neutral-800 text-neutral-500 hover:text-neutral-300"
                      }`}
                      role="radio"
                      aria-checked={locale === "th"}
                    >
                      ไทย
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
      {isLogoutModalOpen && <LogoutConfirmModal onClose={() => setLogoutModalOpen(false)} />}
      {orderProduct && (
        <ProductModal
          product={{
            id: orderProduct.id,
            name_th: orderProduct.name_th,
            name_en: orderProduct.name_en,
            long_desc_th: orderProduct.long_desc_th ?? orderProduct.short_desc_th,
            long_desc_en: orderProduct.long_desc_en ?? orderProduct.short_desc_en,
            image: orderProduct.image,
            images: orderProduct.images,
            sizes: orderProduct.sizes,
          }}
          onClose={() => setOrderProduct(null)}
          locale={locale}
        />
      )}
    </>
  );
}

export default Navbar;
export { Navbar };
