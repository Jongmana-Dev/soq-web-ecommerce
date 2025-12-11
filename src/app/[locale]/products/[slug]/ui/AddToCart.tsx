"use client";

import { useTranslations } from 'next-intl';
import { useCart } from '@/store/cart';

export default function AddToCart({ price }: { price: number }) {
  const t = useTranslations();
  const addItem = useCart((state) => state.addItem);

  const handleAddToCart = () => {
    const product = {
      id: Math.random().toString(36).slice(2),
      name: 'Custom Product',
      price,
      image: '',
    };
    addItem(product);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="rounded-full bg-muted px-4 py-2 text-sm">
        ฿{price.toLocaleString()}
      </div>
      <button
        className="flex-1 rounded-full border px-6 py-2 transition hover:bg-foreground hover:text-background"
        onClick={handleAddToCart}
      >
        {t('product.addToCart')}
      </button>
      <button className="flex-1 rounded-full bg-foreground px-6 py-2 text-background">
        {t('product.buyNow')}
      </button>
    </div>
  );
}