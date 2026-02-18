"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface PaymentStepProps {
  total: number;
  onSubmit: (slipBase64: string) => void;
  onBack: () => void;
  submitting: boolean;
}

export default function PaymentStep({ total, onSubmit, onBack, submitting }: PaymentStepProps) {
  const t = useTranslations();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [slipBase64, setSlipBase64] = useState<string>('');

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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('checkout.payment')}</h3>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-neutral-500 hover:text-neutral-700 underline underline-offset-4"
        >
          {t('checkout.backToShipping')}
        </button>
      </div>

      {/* PromptPay Section */}
      <div className="border border-neutral-200 p-6 text-center space-y-4">
        <h4 className="font-semibold">{t('checkout.promptpayTitle')}</h4>
        <p className="text-sm text-neutral-500">{t('checkout.promptpayDesc')}</p>

        {/* QR Code placeholder — replace with actual QR image */}
        <div className="mx-auto w-48 h-48 bg-neutral-100 border border-neutral-200 flex items-center justify-center relative">
          <Image
            src="/images/promptpay-qr.png"
            alt="PromptPay QR"
            fill
            sizes="192px"
            className="object-contain p-2"
            onError={(e) => {
              // If image doesn't exist, show placeholder text
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <span className="text-neutral-400 text-sm">PromptPay QR</span>
        </div>

        <div className="text-lg font-bold">฿{total.toLocaleString()}</div>
      </div>

      {/* Upload Slip */}
      <div className="border border-neutral-200 p-6 space-y-3">
        <h4 className="font-semibold">{t('checkout.uploadSlip')}</h4>
        <p className="text-sm text-neutral-500">{t('checkout.uploadSlipDesc')}</p>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50 transition-colors"
        >
          {t('checkout.chooseFile')}
        </button>

        {preview && (
          <div className="mt-3">
            <img
              src={preview}
              alt="Slip preview"
              className="max-w-xs max-h-60 border border-neutral-200 object-contain"
            />
          </div>
        )}
      </div>

      {/* Place Order */}
      <button
        type="button"
        disabled={!slipBase64 || submitting}
        onClick={() => onSubmit(slipBase64)}
        className="w-full bg-[var(--accent)] text-neutral-900 py-3 font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
      >
        {submitting ? t('checkout.processing') : t('checkout.placeOrder')}
      </button>
    </div>
  );
}
