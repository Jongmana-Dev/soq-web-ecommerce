"use client";

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useCartStore } from '../../../store/cart';
import type { CartStore } from '../../../store/cart';

export default function CartPage() {
  const t = useTranslations();
  const locale = useLocale();
  const items = useCartStore((state: CartStore) => state.items);
  const increment = useCartStore((state: CartStore) => state.increment);
  const decrement = useCartStore((state: CartStore) => state.decrement);
  const removeItem = useCartStore((state: CartStore) => state.removeItem);

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-4">{t('cart')}</h1>
        <p className="mb-4">{t('empty_cart')}</p>
        <Link href={`/${locale}`} className="text-primary underline">
          {t('title')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">{t('cart')}</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.product.id} className="flex items-center gap-4 border p-3 rounded">
            <div className="w-16 h-16 relative">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="object-cover w-full h-full rounded"
              />
            </div>
            <div className="flex-1">
              <h2 className="font-medium">{item.product.name}</h2>
              <p>${item.product.price.toFixed(2)}</p>
              <div className="flex items-center mt-2">
                <button
                  onClick={() => decrement(item.product.id)}
                  className="px-2 py-1 bg-gray-200"
                  aria-label="decrease quantity"
                >
                  -
                </button>
                <span className="px-3">{item.quantity}</span>
                <button
                  onClick={() => increment(item.product.id)}
                  className="px-2 py-1 bg-gray-200"
                  aria-label="increase quantity"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="ml-4 text-red-500"
                  aria-label="remove item"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 font-bold text-xl">
        Total: ${total.toFixed(2)}
      </div>
    </div>
  );
}