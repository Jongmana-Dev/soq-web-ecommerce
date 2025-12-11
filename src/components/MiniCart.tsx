"use client";

import { useTranslations } from 'next-intl';
import { useCartStore } from '../store/cart';
import type { CartStore } from '../store/cart';
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface MiniCartProps { onClose: () => void; }

export function MiniCart({ onClose }: MiniCartProps) {
  const t = useTranslations();
  const items = useCartStore((state: CartStore) => state.items);
  const increment = useCartStore((state: CartStore) => state.increment);
  const decrement = useCartStore((state: CartStore) => state.decrement);
  const removeItem = useCartStore((state: CartStore) => state.removeItem);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 0 ? parseFloat((subtotal * 0.15).toFixed(2)) : 0;
  const total = subtotal + shipping;

  return (
    <div className="w-80 bg-white border rounded shadow-xl text-gray-900">
      <div className="flex justify-between items-center px-4 py-3 border-b">
        <h3 className="font-semibold text-lg">{t('cart') ?? 'ตะกร้าของฉัน'}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="close mini cart">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {items.length === 0 ? (
          <p className="p-4 text-center text-gray-500">{t('empty_cart')}</p>
        ) : (
          items.map((item) => (
            <div key={item.product.id} className="flex items-center px-4 py-3 border-b">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{item.product.name}</p>
                <p className="text-xs text-gray-500">{item.product.price.toFixed(2)}</p>
                <div className="flex items-center mt-1">
                  <button
                    onClick={() => decrement(item.product.id)}
                    className="p-1 text-gray-600 hover:text-primary"
                    aria-label="decrease quantity"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="mx-2 text-sm">{item.quantity}</span>
                  <button
                    onClick={() => increment(item.product.id)}
                    className="p-1 text-gray-600 hover:text-primary"
                    aria-label="increase quantity"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="p-1 ml-2 text-gray-600 hover:text-red-500"
                    aria-label="remove item"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {items.length > 0 && (
        <div className="p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{t('subtotal') ?? 'ราคารวมย่อย'}</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('shipping') ?? 'ค่าจัดส่ง'}</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>{t('total') ?? 'รวม'}</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            className="w-full mt-3 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
            onClick={() => alert('Proceed to checkout')}
            aria-label="checkout"
          >
            {t('checkout') ?? 'ชำระเงิน'}
          </button>
        </div>
      )}
    </div>
  );
}