"use client";

import { useState, useRef, useMemo, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAlertStore } from '@/lib/alert-store';
import PromptPayQR from './PromptPayQR';

export interface PaymentAccount {
  type: 'promptpay' | 'bank_transfer';
  account_number: string;
  account_name: string;
  bank_name?: string | null;
  bank_branch?: string | null;
}

interface PaymentStepProps {
  total: number;
  orderNumber?: string;
  expiredAt?: string;
  onSubmit: (slipBase64: string) => void;
  onBack: () => void;
  onExpired?: () => void;
  submitting: boolean;
  paymentAccounts: PaymentAccount[];
  error?: string | null;
}

export default function PaymentStep({ total, orderNumber, expiredAt, onSubmit, onBack, onExpired, submitting, paymentAccounts, error }: PaymentStepProps) {
  const t = useTranslations();
  const locale = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [slipBase64, setSlipBase64] = useState<string>('');
  const [countdown, setCountdown] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  // Auto-clear slip when verification fails so user can re-upload
  useEffect(() => {
    if (error) {
      setPreview(null);
      setSlipBase64('');
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [error]);

  // Countdown timer
  useEffect(() => {
    if (!expiredAt) return;

    const update = () => {
      const diff = new Date(expiredAt).getTime() - Date.now();
      if (diff <= 0) {
        setCountdown('00:00');
        setIsExpired(true);
        onExpired?.();
        return false;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const pad = (n: number) => n.toString().padStart(2, '0');
      setCountdown(h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`);
      return true;
    };

    update();
    const interval = setInterval(() => {
      if (!update()) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiredAt, onExpired]);

  const promptpay = paymentAccounts.find((a) => a.type === 'promptpay');
  const bankTransfer = paymentAccounts.find((a) => a.type === 'bank_transfer');
  const hasBoth = !!promptpay && !!bankTransfer;

  const [activeTab, setActiveTab] = useState<'promptpay' | 'bank_transfer'>(
    promptpay ? 'promptpay' : 'bank_transfer',
  );

  const deadline = useMemo(() => {
    if (!expiredAt) return null;
    return new Date(expiredAt).toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [expiredAt]);

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

      {/* Payment Method Section */}
      <div className="border border-emerald-200 bg-emerald-50/30 p-6 space-y-5">
        <div className="flex items-center gap-2 justify-center">
          <i className="fa-solid fa-building-columns text-emerald-600" />
          <h4 className="font-semibold text-emerald-900">{t('checkout.promptpayTitle')}</h4>
        </div>
        <p className="text-sm text-neutral-500 text-center">{t('checkout.promptpayDesc')}</p>

        {/* Tabs */}
        {hasBoth && (
          <div className="flex border border-neutral-200 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveTab('promptpay')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'promptpay'
                  ? 'bg-emerald-600 text-white'
                  : 'text-neutral-500 hover:bg-neutral-50'
              }`}
            >
              <i className="fa-solid fa-qrcode mr-1.5" />
              {locale === 'th' ? 'พร้อมเพย์' : 'PromptPay'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bank_transfer')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'bank_transfer'
                  ? 'bg-emerald-600 text-white'
                  : 'text-neutral-500 hover:bg-neutral-50'
              }`}
            >
              <i className="fa-solid fa-building-columns mr-1.5" />
              {locale === 'th' ? 'โอนเงิน' : 'Bank Transfer'}
            </button>
          </div>
        )}

        {/* PromptPay Content */}
        {activeTab === 'promptpay' && promptpay && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <PromptPayQR amount={total} promptpayId={promptpay.account_number} />
            </div>
            <p className="text-sm text-neutral-600 text-center font-medium">{promptpay.account_name}</p>
          </div>
        )}

        {/* Bank Transfer Content */}
        {activeTab === 'bank_transfer' && bankTransfer && (
          <div className="bg-white border border-neutral-200 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-neutral-400 w-20 shrink-0">{locale === 'th' ? 'ธนาคาร' : 'Bank'}</span>
              <span className="font-medium text-neutral-900">{bankTransfer.bank_name}</span>
            </div>
            {bankTransfer.bank_branch && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-neutral-400 w-20 shrink-0">{locale === 'th' ? 'สาขา' : 'Branch'}</span>
                <span className="text-neutral-700">{bankTransfer.bank_branch}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-neutral-400 w-20 shrink-0">{locale === 'th' ? 'เลขบัญชี' : 'Account'}</span>
              <span className="font-mono font-semibold text-neutral-900 tracking-wide">{bankTransfer.account_number}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-neutral-400 w-20 shrink-0">{locale === 'th' ? 'ชื่อบัญชี' : 'Name'}</span>
              <span className="text-neutral-700">{bankTransfer.account_name}</span>
            </div>
          </div>
        )}

        <div className="text-center">
          <div className="text-2xl font-bold text-neutral-900">฿{total.toLocaleString()}</div>
        </div>

        {/* Deadline + Countdown */}
        {deadline && (
          <div className={`text-center space-y-2 px-4 py-3 border ${isExpired ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center justify-center gap-2">
              <i className={`fa-solid fa-clock text-sm ${isExpired ? 'text-red-500' : 'text-amber-600'}`} />
              <p className={`text-sm ${isExpired ? 'text-red-700' : 'text-amber-800'}`}>
                {isExpired
                  ? (locale === 'th' ? 'หมดเวลาชำระเงินแล้ว' : 'Payment deadline has passed')
                  : (locale === 'th' ? 'กรุณาชำระเงินก่อน' : 'Please pay before')}{' '}
                {!isExpired && <span className="font-semibold">{deadline}</span>}
              </p>
            </div>
            {countdown && !isExpired && (
              <div className="text-2xl font-bold tabular-nums tracking-wider text-amber-700">
                {countdown}
              </div>
            )}
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

        {/* Slip verification warning */}
        <div className="flex gap-3 bg-neutral-100 border border-neutral-300 px-4 py-3">
          <i className="fa-solid fa-shield-halved text-neutral-600 mt-0.5 shrink-0" />
          <div className="text-sm text-neutral-700 space-y-1">
            <p className="font-medium">
              {locale === 'th' ? 'สลิปจะถูกตรวจสอบอัตโนมัติ' : 'Slip will be verified automatically'}
            </p>
            <ul className="list-disc list-inside text-neutral-600 text-xs space-y-0.5">
              <li>{locale === 'th' ? 'ยอดเงินต้องตรงกับคำสั่งซื้อ' : 'Amount must match the order total'}</li>
              <li>{locale === 'th' ? 'สลิปแต่ละใบใช้ได้เพียงครั้งเดียว' : 'Each slip can only be used once'}</li>
              <li>{locale === 'th' ? 'กรุณาใช้สลิปที่ชัดเจนและไม่ถูกครอบตัด' : 'Please use a clear and uncropped slip'}</li>
            </ul>
          </div>
        </div>

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
        onClick={() => {
          useAlertStore.getState().showConfirm({
            title: locale === 'th' ? 'ยืนยันการชำระเงิน' : 'Confirm Payment',
            message: locale === 'th'
              ? `ยืนยันส่งหลักฐานการชำระเงิน ฿${total.toLocaleString()} ใช่หรือไม่?\n\nสลิปจะถูกตรวจสอบอัตโนมัติก่อนยืนยันคำสั่งซื้อ`
              : `Confirm payment of ฿${total.toLocaleString()}?\n\nThe slip will be verified automatically before confirming your order.`,
            confirmText: locale === 'th' ? 'ยืนยัน' : 'Confirm',
            cancelText: locale === 'th' ? 'ยกเลิก' : 'Cancel',
            variant: 'info',
            onConfirm: () => onSubmit(slipBase64),
          });
        }}
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
