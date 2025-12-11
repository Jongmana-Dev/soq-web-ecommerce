"use client";

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { Product } from '../lib/products';
import { useCartStore } from '../store/cart';
import type { CartStore } from '../store/cart';

interface ProductCardProps { product: Product; }

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations();
  // กำหนดชนิด state: CartStore
  const addItem = useCartStore((state: CartStore) => state.addItem);
  return (
    <div className="border rounded-lg overflow-hidden shadow hover:shadow-md transition">
      <div className="relative w-full aspect-square">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4 flex flex-col gap-2">
        <h2 className="text-lg font-medium">{product.name}</h2>
        <p className="text-primary font-bold">${product.price.toFixed(2)}</p>
        <button
          onClick={() => addItem(product)}
          className="mt-auto px-3 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
          aria-label={t('add_to_cart') || 'Add to cart'}
        >
          {t('add_to_cart')}
        </button>
      </div>
    </div>
  );
}