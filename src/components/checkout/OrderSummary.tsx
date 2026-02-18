"use client";

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { CartItem } from '@/lib/store';

const SHIPPING_FEE = 50;
const FREE_SHIPPING_THRESHOLD = 500;

interface OrderSummaryProps {
  items: CartItem[];
}

export default function OrderSummary({ items }: OrderSummaryProps) {
  const t = useTranslations();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  return (
    <div className="border border-neutral-200 p-6 h-fit lg:sticky lg:top-24">
      <h3 className="text-lg font-semibold mb-4">{t('checkout.orderSummary')}</h3>

      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            {item.image && (
              <div className="w-14 h-14 relative shrink-0 bg-neutral-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              {item.size_label && (
                <p className="text-xs text-neutral-400">{item.size_label}</p>
              )}
              <p className="text-xs text-neutral-500">x{item.qty}</p>
            </div>
            <p className="text-sm font-medium whitespace-nowrap">
              ฿{(item.price * item.qty).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-neutral-200 pt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-500">{t('cart.subtotal')}</span>
          <span>฿{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">{t('checkout.shippingFee')}</span>
          <span>{shipping === 0 ? t('checkout.freeShipping') : `฿${shipping}`}</span>
        </div>
        <div className="border-t border-neutral-200 pt-2 flex justify-between font-semibold text-base">
          <span>{t('cart.total')}</span>
          <span>฿{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
