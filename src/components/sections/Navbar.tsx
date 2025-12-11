"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCartIcon, UserIcon } from "@heroicons/react/24/outline";
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
  const [isScrolled, setIsScrolled] = React.useState(false);

  // นับจำนวนสินค้าทั้งหมดในรถเข็น
  const itemCount = useCartStore((state: CartStore) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );

  // เช็คว่า scroll เกิน 10px หรือยัง
  React.useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll(); // เช็คครั้งแรกตอน mount
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // เปลี่ยน locale แล้ว push path เดิมแต่เปลี่ยน segment แรก
  const changeLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    if (segments.length > 1) {
      segments[1] = newLocale;
    }
    router.push(segments.join("/") as any);
  };

  const navClass =
    "fixed top-0 left-0 right-0 z-40 transition-all duration-300 " +
    (isScrolled
      ? "bg-black/60 backdrop-blur-md border-b border-white/10 translate-y-0"
      : "bg-transparent border-b border-transparent translate-y-0");

  const menuLinkColor = isScrolled
    ? "text-white/90 hover:text-white"
    : "text-black hover:text-black/60";

  const iconColor = isScrolled
    ? "text-white/80 hover:text-white"
    : "text-black/70 hover:text-black";

  const langColor = isScrolled
    ? "text-white/90 hover:text-white"
    : "text-black hover:text-black/70";

  return (
    <nav className={navClass}>
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center px-8">
        {/* โลโก้ */}
        <Link
          href={`/${locale}`}
          className="mr-20 flex items-center"
          aria-label="Home"
        >
          <Image
            src="/logo.svg"
            alt="SOQ logo"
            width={120}
            height={36}
            className={
              "h-9 w-auto transition-all duration-300 " +
              (isScrolled ? "invert brightness-100" : "invert-0 brightness-100")
            }
          />
        </Link>

        {/* กลุ่มเมนู + ไอคอน ชิดขวา */}
        <div className="hidden flex-1 items-center justify-end lg:flex">
          {/* เมนูหลัก */}
          <ul className="flex items-center gap-[50px] text-[16px] font-normal">
            <li>
              <Link
                href={`/${locale}#reviews`}
                className={`transition-colors ${menuLinkColor}`}
              >
                {tHeader("reviews")}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}#products`}
                className={`transition-colors ${menuLinkColor}`}
              >
                {tHeader("products")}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}#standards`}
                className={`transition-colors ${menuLinkColor}`}
              >
                {tHeader("standards")}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}#faq`}
                className={`transition-colors ${menuLinkColor}`}
              >
                {tHeader("faq")}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}#contact`}
                className={`transition-colors ${menuLinkColor}`}
              >
                {tHeader("contact")}
              </Link>
            </li>
          </ul>

          {/* ไอคอน account / cart / language */}
          <div className="ml-[50px] flex items-center gap-5">
            {/* account */}
            <Link
              href={(`/${locale}/profile` as any)}
              className={`inline-flex p-2 transition-colors ${iconColor}`}
              aria-label={tHeader("account")}
            >
              <UserIcon className="w-6 h-6" />
            </Link>

            {/* cart */}
            <button
              onClick={() => setCartOpen((open) => !open)}
              className={`relative inline-flex p-2 transition-colors ${iconColor}`}
              aria-label={tHeader("cart")}
            >
              <ShoppingCartIcon className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 rounded-full bg-red-500 px-[6px] text-[9px] leading-none text-white">
                  {itemCount}
                </span>
              )}
            </button>

            {/* language */}
            <button
              onClick={() => changeLocale(locale === "en" ? "th" : "en")}
              className={`inline-flex items-center gap-1 text-[16px] transition-colors ${langColor}`}
              aria-label={tCommon("language") || "Change language"}
            >
              {locale === "en" ? "EN" : "ไทย"}
              <span className="text-xs align-middle">▼</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mini cart panel ด้านขวาใต้ navbar */}
      {isCartOpen && (
        <div className="absolute right-8 top-[76px] z-50">
          <MiniCart onClose={() => setCartOpen(false)} />
        </div>
      )}
    </nav>
  );
}

export default Navbar;
export { Navbar };