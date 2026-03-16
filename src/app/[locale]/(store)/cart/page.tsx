"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useCart, useCartHydrated } from '@/lib/store';
import { Minus, Plus } from 'lucide-react';
import LoginModal from '@/components/modals/LoginModal';

export default function CartPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { data: session } = useSession();
  const items = useCart((state) => state.items);
  const hydrated = useCartHydrated();
  const updateQty = useCart((state) => state.updateQty);
  const remove = useCart((state) => state.remove);
  const clear = useCart((state) => state.clear);
  const [showLogin, setShowLogin] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = () => {
    if (session?.user) {
      router.push('/checkout');
    } else {
      setShowLogin(true);
    }
  };

  // รอ hydration จาก localStorage ก่อนแสดงผล
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-neutral-100" />
            <div className="h-24 bg-neutral-100" />
            <div className="h-24 bg-neutral-100" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 pt-24">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-semibold mb-4">{t('cart.title')}</h1>
          <p className="text-neutral-500 mb-8">{t('cart.empty')}</p>
          <Link href="/" className="inline-block bg-[var(--accent)] text-neutral-900 px-8 py-3 font-semibold hover:scale-105 transition-transform">
            {t('cart.continueShopping')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 pt-24">
    <div className="container mx-auto px-4 pb-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">{t('cart.title')}</h1>
        <button
          onClick={clear}
          className="text-sm text-neutral-400 hover:text-red-400 underline underline-offset-4 transition-colors"
        >
          {t('cart.clear')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="relative border border-neutral-200 p-3 sm:p-4">
              {/* Remove button — top right */}
              <button
                onClick={() => remove(item.id)}
                className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-7 h-7 flex items-center justify-center text-neutral-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors"
                aria-label="remove item"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>

              <div className="flex gap-3 sm:gap-4">
                {item.image && (
                  <div className="w-14 h-14 sm:w-20 sm:h-20 relative shrink-0 bg-neutral-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 56px, 80px"
                      className="object-contain"
                    />
                  </div>
                )}

                {/* Info + Qty + Price */}
                <div className="flex-1 min-w-0 pr-6 sm:pr-8">
                  <h2 className="font-medium text-sm sm:text-base leading-snug">{item.name}</h2>
                  {item.size_label && (
                    <p className="text-xs text-neutral-400 mt-0.5">{t('cart.sizeLabel')}: {item.size_label}</p>
                  )}
                  <p className="text-xs text-neutral-500 mt-0.5">
                    ฿{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>

                  {/* Qty controls + Total — same row below product info */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-neutral-300 hover:bg-neutral-100 transition-colors"
                        aria-label="decrease quantity"
                      >
                        <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </button>
                      <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-neutral-300 hover:bg-neutral-100 transition-colors"
                        aria-label="increase quantity"
                      >
                        <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </button>
                    </div>
                    <p className="font-semibold text-sm sm:text-base tabular-nums">
                      ฿{(item.price * item.qty).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="border border-neutral-200 p-6 h-fit">
          <h3 className="text-lg font-semibold mb-4">{t('cart.title')}</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">{t('cart.subtotal')}</span>
              <span className="tabular-nums">฿{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t border-neutral-200 pt-3 flex justify-between font-semibold text-base">
              <span>{t('cart.total')}</span>
              <span className="tabular-nums">฿{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Auth-gated checkout */}
          {!session?.user && (
            <p className="text-xs text-amber-600 mt-3">{t('cart.loginToCheckout')}</p>
          )}

          <button
            onClick={handleCheckout}
            className="w-full mt-6 bg-neutral-900 text-white py-3.5 text-base font-bold tracking-wide hover:bg-neutral-800 transition-colors shadow-lg"
          >
            {t('cart.checkout')}
          </button>
          <Link
            href="/"
            className="block text-center mt-3 text-sm text-neutral-500 hover:text-neutral-700 underline underline-offset-4 transition-colors"
          >
            {t('cart.continueShopping')}
          </Link>
        </div>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} callbackUrl={`/${locale}/checkout`} />}
    </div>
    </div>
  );
}
