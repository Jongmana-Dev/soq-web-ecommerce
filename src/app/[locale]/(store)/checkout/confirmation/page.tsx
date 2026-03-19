"use client";

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CheckCircle } from 'lucide-react';

export default function ConfirmationPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') ?? '—';

  return (
    <div className="container mx-auto px-4 py-20 text-center max-w-lg">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />

      <h1 className="text-3xl font-semibold text-neutral-900 mb-2">{t('confirmation.title')}</h1>

      <p className="text-lg text-neutral-700 mb-2">
        {t('confirmation.orderNumber')}: <span className="font-bold text-neutral-900">{orderNumber}</span>
      </p>

      <p className="text-xl font-medium text-neutral-800 mb-4">{t('confirmation.thankYou')}</p>

      <p className="text-neutral-500 mb-8">{t('confirmation.desc')}</p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="px-8 py-3 border border-neutral-400 text-neutral-900 font-semibold hover:bg-neutral-100 transition-colors"
        >
          {t('confirmation.backHome')}
        </Link>
        <Link
          href="/orders"
          className="px-8 py-3 bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors"
        >
          {t('confirmation.viewOrders')}
        </Link>
      </div>
    </div>
  );
}
