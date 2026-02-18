"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useCart } from '@/lib/store';
import ShippingForm, { type ShippingData } from '@/components/checkout/ShippingForm';
import PaymentStep from '@/components/checkout/PaymentStep';
import OrderSummary from '@/components/checkout/OrderSummary';
import { Link } from '@/i18n/navigation';

const SHIPPING_FEE = 50;
const FREE_SHIPPING_THRESHOLD = 500;

type Step = 'shipping' | 'payment' | 'submitting';

export default function CheckoutPage() {
  const t = useTranslations();
  const router = useRouter();
  const items = useCart((state) => state.items);
  const clear = useCart((state) => state.clear);

  const [step, setStep] = useState<Step>('shipping');
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  // Empty cart guard
  if (items.length === 0 && step !== 'submitting') {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold mb-4">{t('cart.title')}</h1>
        <p className="text-neutral-500 mb-8">{t('cart.empty')}</p>
        <Link href="/" className="inline-block bg-[var(--accent)] text-neutral-900 px-8 py-3 font-semibold hover:scale-105 transition-transform">
          {t('cart.continueShopping')}
        </Link>
      </div>
    );
  }

  const handleShippingSubmit = async (data: ShippingData) => {
    // If user wants to save this new address
    if (data.save_address && !data.address_id) {
      try {
        await fetch('/api/auth-proxy/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient_name: data.customer_name,
            phone: data.customer_phone,
            address_line: data.shipping_address,
            subdistrict: data.shipping_subdistrict || undefined,
            district: data.shipping_district,
            province: data.shipping_province,
            postal_code: data.shipping_postal_code,
          }),
        });
      } catch {
        // non-critical, continue with checkout
      }
    }

    setShippingData(data);
    setStep('payment');
  };

  const handlePlaceOrder = async (slipBase64: string) => {
    if (!shippingData) return;
    setSubmitting(true);
    setStep('submitting');
    setError(null);

    try {
      // 1. Create order
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

      // 2. Upload payment slip
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

      // 3. Clear cart and redirect
      clear();
      router.push({ pathname: '/checkout/confirmation', query: { order: order.order_number } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStep('payment');
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">{t('checkout.title')}</h1>

      {error && (
        <div className="mb-6 border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Forms */}
        <div className="lg:col-span-2">
          {step === 'shipping' && (
            <ShippingForm onSubmit={handleShippingSubmit} />
          )}

          {(step === 'payment' || step === 'submitting') && (
            <PaymentStep
              total={total}
              onSubmit={handlePlaceOrder}
              onBack={() => setStep('shipping')}
              submitting={submitting}
            />
          )}
        </div>

        {/* Right: Summary */}
        <div>
          <OrderSummary items={items} />
        </div>
      </div>
    </div>
  );
}
