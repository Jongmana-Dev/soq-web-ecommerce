"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
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

  // Order state (created before showing QR)
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [orderCreatedAt, setOrderCreatedAt] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState<number>(0);

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

  // --- Sync qty changes to backend when order exists ---
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevItemsRef = useRef<string>('');

  const syncItemsToBackend = useCallback(async () => {
    if (!orderId || items.length === 0) return;
    try {
      const res = await fetch(`/api/orders-proxy/${orderId}/update-items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            size_id: item.size_id,
            quantity: item.qty,
          })),
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setOrderTotal(result.data.total);
      }
    } catch {
      // non-critical sync failure
    }
  }, [orderId, items]);

  useEffect(() => {
    if (!orderId) return;
    const serialized = JSON.stringify(items.map((i) => ({ id: i.id, qty: i.qty })));
    if (serialized === prevItemsRef.current) return;
    prevItemsRef.current = serialized;

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(syncItemsToBackend, 500);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [orderId, items, syncItemsToBackend]);

  if (!hydrated) {
    return <FullscreenLoading />;
  }

  // Empty cart guard (allow payment step since cart is still present)
  if (items.length === 0 && step !== 'payment') {
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

  // --- Shipping submit: confirm → create order → show QR ---
  const handleShippingSubmit = (data: ShippingData) => {
    setShippingData(data);
    setSelectedProvince(data.shipping_province);

    useAlertStore.getState().showConfirm({
      title: locale === 'th' ? 'ยืนยันคำสั่งซื้อ' : 'Confirm Order',
      message: locale === 'th'
        ? `ยืนยันสั่งซื้อสินค้ารวม ฿${total.toLocaleString()} ใช่หรือไม่?`
        : `Confirm order totaling ฿${total.toLocaleString()}?`,
      confirmText: locale === 'th' ? 'ยืนยัน' : 'Confirm',
      cancelText: locale === 'th' ? 'ยกเลิก' : 'Cancel',
      variant: 'info',
      onConfirm: () => createOrder(data),
    });
  };

  const createOrder = async (data: ShippingData) => {
    setError(null);

    // Save new address if requested
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
        // non-critical
      }
    }

    // Auto-save tax info
    if (data.tax_invoice && data.tax_info) {
      try {
        await fetch('/api/auth-proxy/tax-info', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.tax_info),
        });
      } catch {
        // non-critical
      }
    }

    try {
      const orderBody = {
        ...(data.address_id ? { address_id: data.address_id } : {}),
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        shipping_address: data.shipping_address,
        shipping_subdistrict: data.shipping_subdistrict || undefined,
        shipping_district: data.shipping_district || undefined,
        shipping_province: data.shipping_province,
        shipping_postal_code: data.shipping_postal_code,
        items: items.map((item) => ({
          product_id: item.product_id,
          size_id: item.size_id,
          quantity: item.qty,
        })),
        referral_source: data.referral_source || undefined,
        tax_invoice: data.tax_invoice,
        tax_info: data.tax_info,
        note: data.note || undefined,
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

      setOrderId(order.id);
      setOrderNumber(order.order_number);
      setOrderCreatedAt(order.created_at);
      setOrderTotal(order.total);
      prevItemsRef.current = JSON.stringify(items.map((i) => ({ id: i.id, qty: i.qty })));
      setStep('payment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      useAlertStore.getState().showAlert('error',
        locale === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
        err instanceof Error ? err.message : 'Something went wrong',
      );
    }
  };

  // --- Upload slip (order already exists) ---
  const handleUploadSlip = async (slipBase64: string) => {
    if (!orderId) return;
    setSubmitting(true);
    setError(null);

    try {
      const paymentRes = await fetch(`/api/orders-proxy/${orderId}/payment`, {
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
      router.push({ pathname: '/checkout/confirmation', query: { order: orderNumber ?? '' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  };

  // --- Back button: cancel order → go back to shipping ---
  const handleBack = async () => {
    if (orderId) {
      try {
        await fetch(`/api/orders-proxy/${orderId}/cancel`, { method: 'PATCH' });
      } catch {
        // non-critical
      }
      setOrderId(null);
      setOrderNumber(null);
      setOrderCreatedAt(null);
      setOrderTotal(0);
    }
    setStep('shipping');
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
            {/* ShippingForm stays mounted (hidden) to preserve state */}
            <div className={step === 'shipping' ? '' : 'hidden'}>
              <ShippingForm
                onSubmit={handleShippingSubmit}
                onProvinceChange={setSelectedProvince}
              />
            </div>

            {step === 'payment' && (
              <PaymentStep
                total={orderTotal}
                orderNumber={orderNumber ?? undefined}
                createdAt={orderCreatedAt ?? undefined}
                onSubmit={handleUploadSlip}
                onBack={handleBack}
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
