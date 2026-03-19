"use client";

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCart, type CartItem } from '@/lib/store';

interface OrderSummaryProps {
  items: CartItem[];
  shippingFee: number;
  remoteAreaFee: number;
  locked?: boolean;
}

export default function OrderSummary({ items, shippingFee, remoteAreaFee, locked = false }: OrderSummaryProps) {
  const t = useTranslations();
  const updateQty = useCart((s) => s.updateQty);
  const remove = useCart((s) => s.remove);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + shippingFee + remoteAreaFee;

  return (
    <div className="border border-neutral-200 overflow-hidden h-fit lg:sticky lg:top-24">
      <div className="bg-neutral-900 px-6 py-4">
        <h3 className="text-lg font-semibold text-white">{t('checkout.orderSummary')}</h3>
      </div>

      <div className="p-6 space-y-3 mb-4">
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
              {/* Qty controls */}
              {locked ? (
                <p className="text-xs text-neutral-400 mt-1">x{item.qty}</p>
              ) : (
                <div className="flex items-center gap-1.5 mt-1">
                  <button
                    type="button"
                    disabled={item.qty <= 1}
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-7 h-7 flex items-center justify-center border border-neutral-300 text-neutral-500 hover:bg-neutral-100 transition-colors text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <span className="text-xs font-medium w-6 text-center">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-7 h-7 flex items-center justify-center border border-neutral-300 text-neutral-500 hover:bg-neutral-100 transition-colors text-xs"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm font-medium whitespace-nowrap">
              ฿{(item.price * item.qty).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-neutral-200 mx-6 pt-3 pb-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-500">{t('cart.subtotal')}</span>
          <span>฿{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">{t('checkout.shippingFee')}</span>
          <span>{shippingFee === 0 ? t('checkout.freeShipping') : `฿${shippingFee}`}</span>
        </div>
        {remoteAreaFee > 0 && (
          <div className="flex justify-between">
            <span className="text-neutral-500">{t('checkout.remoteAreaFee')}</span>
            <span>+฿{remoteAreaFee.toLocaleString()}</span>
          </div>
        )}
        <div className="border-t border-neutral-200 pt-2 flex justify-between font-semibold text-base">
          <span>{t('cart.total')}</span>
          <span>฿{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
