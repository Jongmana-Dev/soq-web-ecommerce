"use client";

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useCart, useCartHydrated } from '@/lib/store';
import { useAlertStore } from '@/lib/alert-store';
import ShippingForm, { type ShippingData } from '@/components/checkout/ShippingForm';
import PaymentStep from '@/components/checkout/PaymentStep';
import OrderSummary from '@/components/checkout/OrderSummary';
import { Link } from '@/i18n/navigation';
import FullscreenLoading from '@/components/ui/FullscreenLoading';

interface ShippingRate {
  min_qty: number;
  max_qty: number | null;
  fee: number;
}

interface RemoteProvince {
  province_name: string;
  surcharge: number;
}

type Step = 'shipping' | 'payment';

export default function CheckoutPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const items = useCart((state) => state.items);
  const hydrated = useCartHydrated();
  const clear = useCart((state) => state.clear);

  const [step, setStep] = useState<Step>('shipping');
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Shipping config from API
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [remoteProvinces, setRemoteProvinces] = useState<RemoteProvince[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');

  // Fetch shipping config on mount
  useEffect(() => {
    fetch('/api/settings-proxy/shipping')
      .then((res) => res.json())
      .then((data) => {
        setShippingRates(data.rates ?? []);
        setRemoteProvinces(data.remote_provinces ?? []);
      })
      .catch(() => {});
  }, []);

  // Calculate shipping from rates
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  let shippingFee = 0;
  for (const rate of shippingRates) {
    if (totalQty >= rate.min_qty && (rate.max_qty === null || totalQty <= rate.max_qty)) {
      shippingFee = rate.fee;
      break;
    }
  }

  const remoteMatch = remoteProvinces.find((p) => p.province_name === selectedProvince);
  const remoteAreaFee = remoteMatch ? remoteMatch.surcharge : 0;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + shippingFee + remoteAreaFee;

  if (!hydrated) {
    return <FullscreenLoading />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 pt-24">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-semibold mb-4">{t('cart.title')}</h1>
          <p className="text-neutral-500 mb-8">{t('cart.empty')}</p>
          <Link href="/" className="inline-block bg-[var(--accent)] text-neutral-900 px-8 py-3 font-semibold hover:scale-105 transition-transform">
            {t('cart.continueShopping')}
          </Link>
        </div>
      </div>
    );
  }

  const handleShippingSubmit = (data: ShippingData) => {
    setShippingData(data);
    setSelectedProvince(data.shipping_province);
    setStep('payment');
  };

  const handleUploadSlip = (slipBase64: string) => {
    useAlertStore.getState().showConfirm({
      title: locale === 'th' ? 'ยืนยันคำสั่งซื้อ' : 'Confirm Order',
      message: locale === 'th'
        ? `ยืนยันสั่งซื้อสินค้ารวม ฿${total.toLocaleString()} ใช่หรือไม่?`
        : `Confirm order totaling ฿${total.toLocaleString()}?`,
      confirmText: locale === 'th' ? 'ยืนยัน' : 'Confirm',
      cancelText: locale === 'th' ? 'ยกเลิก' : 'Cancel',
      variant: 'info',
      onConfirm: () => submitOrder(slipBase64),
    });
  };

  const submitOrder = async (slipBase64: string) => {
    if (!shippingData) return;
    setSubmitting(true);
    setError(null);

    try {
      // Save new address if requested
      if (shippingData.save_address && !shippingData.address_id) {
        try {
          await fetch('/api/auth-proxy/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipient_name: shippingData.customer_name,
              phone: shippingData.customer_phone,
              address_line: shippingData.shipping_address,
              subdistrict: shippingData.shipping_subdistrict || undefined,
              district: shippingData.shipping_district,
              province: shippingData.shipping_province,
              postal_code: shippingData.shipping_postal_code,
            }),
          });
        } catch {
          // non-critical
        }
      }

      // Auto-save tax info
      if (shippingData.tax_invoice && shippingData.tax_info) {
        try {
          await fetch('/api/auth-proxy/tax-info', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(shippingData.tax_info),
          });
        } catch {
          // non-critical
        }
      }

      // Create order
      const orderBody = {
        ...(shippingData.address_id ? { address_id: shippingData.address_id } : {}),
        customer_name: shippingData.customer_name,
        customer_phone: shippingData.customer_phone,
        shipping_address: shippingData.shipping_address,
        shipping_subdistrict: shippingData.shipping_subdistrict || undefined,
        shipping_district: shippingData.shipping_district || undefined,
        shipping_province: shippingData.shipping_province,
        shipping_postal_code: shippingData.shipping_postal_code,
        items: items.map((item) => ({
          product_id: item.product_id,
          size_id: item.size_id,
          quantity: item.qty,
        })),
        referral_source: shippingData.referral_source || undefined,
        tax_invoice: shippingData.tax_invoice,
        tax_info: shippingData.tax_info,
        note: shippingData.note || undefined,
      };

      const orderRes = await fetch('/api/orders-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderBody),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.message || 'Failed to create order');
      }

      const orderResult = await orderRes.json();
      const order = orderResult.data;

      // Upload payment slip
      const paymentRes = await fetch(`/api/orders-proxy/${order.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'promptpay',
          slip_image: slipBase64,
        }),
      });

      if (!paymentRes.ok) {
        const errData = await paymentRes.json();
        throw new Error(errData.message || 'Failed to upload payment');
      }

      clear();
      router.push({ pathname: '/checkout/confirmation', query: { order: order.order_number ?? '' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      useAlertStore.getState().showAlert('error',
        locale === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
        err instanceof Error ? err.message : 'Something went wrong',
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 pt-24">
      <div className="container mx-auto px-4 pb-12">
        <h1 className="text-3xl font-semibold mb-8">{t('checkout.title')}</h1>

        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Forms */}
          <div className="lg:col-span-2">
            {/* ShippingForm stays mounted (hidden when payment step) to preserve state */}
            <div className={step === 'shipping' ? '' : 'hidden'}>
              <ShippingForm
                onSubmit={handleShippingSubmit}
                onProvinceChange={setSelectedProvince}
              />
            </div>

            {step === 'payment' && (
              <PaymentStep
                total={total}
                onSubmit={handleUploadSlip}
                onBack={() => setStep('shipping')}
                submitting={submitting}
              />
            )}
          </div>

          {/* Right: Summary */}
          <div>
            <OrderSummary
              items={items}
              shippingFee={shippingFee}
              remoteAreaFee={remoteAreaFee}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
