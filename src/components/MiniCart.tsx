"use client";

import { useTranslations } from 'next-intl';
import { useCart } from '@/lib/store';
import { useRouter } from '@/i18n/navigation';
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface MiniCartProps { onClose: () => void; }

export function MiniCart({ onClose }: MiniCartProps) {
  const t = useTranslations();
  const router = useRouter();
  const items = useCart((state) => state.items);
  const updateQty = useCart((state) => state.updateQty);
  const remove = useCart((state) => state.remove);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-neutral-100">
          <h3 className="font-semibold text-lg text-neutral-900">{t('cart.title')}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors"
            aria-label="close cart"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-400 p-8">
              <i className="fa-solid fa-cart-shopping text-4xl mb-4 opacity-30" />
              <p className="text-sm">{t('cart.empty')}</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {items.map((item) => (
                <div key={item.id} className="relative flex gap-4 p-4 pr-10">
                  {/* Remove button */}
                  <button
                    onClick={() => remove(item.id)}
                    className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-neutral-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors"
                    aria-label="remove item"
                  >
                    <i className="fa-solid fa-xmark text-xs" />
                  </button>

                  {item.image && (
                    <div className="w-16 h-16 relative shrink-0 bg-neutral-50 rounded">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{item.name}</p>
                    {item.size_label && (
                      <p className="text-xs text-neutral-400 mt-0.5">{item.size_label}</p>
                    )}
                    <p className="text-sm text-neutral-500 mt-1">฿{item.price.toLocaleString()}</p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-0 mt-2">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="w-7 h-7 flex items-center justify-center border border-neutral-200 text-neutral-500 hover:bg-neutral-100 transition-colors"
                        aria-label="decrease quantity"
                      >
                        <MinusIcon className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-neutral-900">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-7 h-7 flex items-center justify-center border border-neutral-200 text-neutral-500 hover:bg-neutral-100 transition-colors"
                        aria-label="increase quantity"
                      >
                        <PlusIcon className="w-3 h-3" />
                      </button>
                      <span className="ml-auto text-sm font-semibold text-neutral-900">
                        ฿{(item.price * item.qty).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-neutral-200 p-5 space-y-4">
            <div className="flex justify-between text-base font-semibold text-neutral-900">
              <span>{t('cart.total')}</span>
              <span>฿{subtotal.toLocaleString()}</span>
            </div>
            <button
              className="w-full py-3 bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors"
              onClick={() => {
                onClose();
                router.push('/cart');
              }}
            >
              {t('cart.checkout')}
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}
