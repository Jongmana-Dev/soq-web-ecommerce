"use client";

import { useState, useRef, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import PromptPayQR from './PromptPayQR';

interface PaymentStepProps {
  total: number;
  orderNumber?: string;
  createdAt?: string;
  onSubmit: (slipBase64: string) => void;
  onBack: () => void;
  submitting: boolean;
}

export default function PaymentStep({ total, orderNumber, createdAt, onSubmit, onBack, submitting }: PaymentStepProps) {
  const t = useTranslations();
  const locale = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [slipBase64, setSlipBase64] = useState<string>('');

  const deadline = useMemo(() => {
    if (!createdAt) return null;
    const d = new Date(new Date(createdAt).getTime() + 6 * 60 * 60 * 1000);
    return d.toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [createdAt]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      setSlipBase64(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="SOQ" className="h-6 w-auto" />
          <div>
            <h3 className="text-lg font-semibold">{t('checkout.payment')}</h3>
            {orderNumber && (
              <p className="text-xs text-neutral-400">Order #{orderNumber}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-neutral-500 hover:text-neutral-700 underline underline-offset-4"
        >
          {t('checkout.backToShipping')}
        </button>
      </div>

      {/* PromptPay Section */}
      <div className="border border-emerald-200 bg-emerald-50/30 p-6 space-y-5">
        <div className="flex items-center gap-2 justify-center">
          <i className="fa-solid fa-building-columns text-emerald-600" />
          <h4 className="font-semibold text-emerald-900">{t('checkout.promptpayTitle')}</h4>
        </div>
        <p className="text-sm text-neutral-500 text-center">{t('checkout.promptpayDesc')}</p>

        <div className="flex justify-center">
          <PromptPayQR amount={total} />
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-neutral-900">฿{total.toLocaleString()}</div>
        </div>

        {/* Deadline */}
        {deadline && (
          <div className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2.5">
            <i className="fa-solid fa-clock text-amber-600 text-sm" />
            <p className="text-sm text-amber-800">
              {locale === 'th' ? 'กรุณาชำระเงินก่อน' : 'Please pay before'}{' '}
              <span className="font-semibold">{deadline}</span>
            </p>
          </div>
        )}
      </div>

      {/* Upload Slip */}
      <div className="border-2 border-neutral-900 bg-neutral-50 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-receipt text-neutral-700" />
          <h4 className="font-semibold">{t('checkout.uploadSlip')}</h4>
        </div>
        <p className="text-sm text-neutral-500">{t('checkout.uploadSlipDesc')}</p>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Slip preview"
              className="w-full max-h-72 object-contain border border-neutral-200 bg-white"
            />
            <button
              type="button"
              onClick={() => { setPreview(null); setSlipBase64(''); if (fileRef.current) fileRef.current.value = ''; }}
              className="absolute top-2 right-2 w-7 h-7 bg-white border border-neutral-200 rounded-full flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors shadow-sm"
            >
              <i className="fa-solid fa-xmark text-xs" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-neutral-300 py-10 text-center hover:border-neutral-500 hover:bg-white transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-cloud-arrow-up text-3xl text-neutral-300 mb-3 block" />
            <p className="text-sm font-medium text-neutral-600">{t('checkout.chooseFile')}</p>
            <p className="text-xs text-neutral-400 mt-1">JPG, PNG</p>
          </button>
        )}
      </div>

      {/* Submit */}
      <button
        type="button"
        disabled={!slipBase64 || submitting}
        onClick={() => onSubmit(slipBase64)}
        className="w-full bg-neutral-900 text-white py-3.5 font-semibold hover:bg-black transition-colors disabled:opacity-50"
      >
        {submitting ? (
          <i className="fa-solid fa-spinner fa-spin" />
        ) : (
          <>
            <i className="fa-solid fa-paper-plane mr-2 text-sm" />
            {t('checkout.placeOrder')}
          </>
        )}
      </button>
    </div>
  );
}
