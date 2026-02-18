"use client";

import { useTranslations } from 'next-intl';
import { useCart } from '@/lib/store';
import { useCartToast } from '@/lib/cart-toast';

interface AddToCartProps {
  productId: string
  sizeId: string
  sizeLabel: string
  name: string
  price: number
  image?: string
}

export default function AddToCart({ productId, sizeId, sizeLabel, name, price, image }: AddToCartProps) {
  const t = useTranslations();
  const add = useCart((state) => state.add);
  const showToast = useCartToast((s) => s.show);

  const handleAddToCart = () => {
    const item = {
      id: `${productId}::${sizeId}`,
      product_id: productId,
      size_id: sizeId,
      size_label: sizeLabel,
      name,
      price,
      qty: 1,
      image: image ?? '',
    };
    add(item);
    showToast({ ...item, size_label: sizeLabel });
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
