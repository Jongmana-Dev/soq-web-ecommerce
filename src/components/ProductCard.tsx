"use client";

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import type { ProductData } from '@/lib/products';
import { useCart } from '@/lib/store';
import { useCartToast } from '@/lib/cart-toast';

interface ProductCardProps { product: ProductData; }

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const add = useCart((state) => state.add);
  const showToast = useCartToast((s) => s.show);

  const name = locale === 'th' ? product.name_th : product.name_en;
  const defaultSize = product.sizes[0];
  const defaultPrice = defaultSize?.price ?? 0;

  return (
    <div className="border rounded-lg overflow-hidden shadow hover:shadow-md transition">
      <div className="relative w-full aspect-square">
        <Image
          src={product.image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4 flex flex-col gap-2">
        <h2 className="text-lg font-medium">{name}</h2>
        <p className="text-neutral-900 font-bold">฿{defaultPrice.toLocaleString()}</p>
        <button
          onClick={() => {
            if (!defaultSize) return;
            const item = {
              id: `${product.id}::${defaultSize.id}`,
              product_id: product.id,
              size_id: defaultSize.id,
              size_label: locale === 'th' ? defaultSize.label_th : defaultSize.label_en,
              name,
              price: defaultPrice,
              qty: 1,
              image: product.image,
            };
            add(item);
            showToast({ ...item, size_label: item.size_label });
          }}
          className="mt-auto px-4 py-2.5 bg-neutral-900 text-white rounded hover:bg-neutral-800 transition text-sm"
          aria-label={t('product.addToCart')}
        >
          {t('product.addToCart')}
        </button>
      </div>
    </div>
  );
}
