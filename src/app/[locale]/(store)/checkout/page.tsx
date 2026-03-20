"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter as useNextIntlRouter } from '@/i18n/navigation';
import { useRouter as useNextRouter } from 'next/navigation';
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
  postal_code: string | null;
  surcharge: number;
}

interface PaymentAccount {
  type: 'promptpay' | 'bank_transfer';
  account_number: string;
  account_name: string;
  bank_name?: string | null;
  bank_branch?: string | null;
}

type Step = 'shipping' | 'payment';

export default function CheckoutPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useNextIntlRouter();
  const nextRouter = useNextRouter();
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
  const orderNumberRef = useRef<string | null>(null);
  const [orderExpiredAt, setOrderExpiredAt] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState<number>(0);

  // Snapshot of cart items + fees at order creation (cart gets cleared after)
  const [orderItems, setOrderItems] = useState<typeof items>([]);
  const [orderShippingFee, setOrderShippingFee] = useState<number>(0);
  const [orderRemoteAreaFee, setOrderRemoteAreaFee] = useState<number>(0);

  // Shipping config from API
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [remoteProvinces, setRemoteProvinces] = useState<RemoteProvince[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedPostalCode, setSelectedPostalCode] = useState<string>('');

  // Payment accounts from API
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);

  // Shipping config load error (EC-08)
  const [shippingConfigError, setShippingConfigError] = useState<string | null>(null);

  // Fetch shipping config + payment accounts on mount
  useEffect(() => {
    fetch('/api/settings-proxy/shipping')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load shipping config');
        return res.json();
      })
      .then((data) => {
        setShippingRates(data.rates ?? []);
        setRemoteProvinces(data.remote_provinces ?? []);
      })
      .catch(() => {
        setShippingConfigError(
          locale === 'th'
            ? 'ไม่สามารถโหลดข้อมูลการจัดส่งได้ กรุณาลองรีเฟรชหน้า'
            : 'Failed to load shipping info. Please refresh the page.'
        );
      });

    fetch('/api/settings-proxy/payment-accounts')
      .then((res) => res.json())
      .then((json) => {
        setPaymentAccounts(json.data ?? []);
      })
      .catch(() => {});
  }, [locale]);

  // Calculate shipping from rates
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  let shippingFee = 0;
  for (const rate of shippingRates) {
    if (totalQty >= rate.min_qty && (rate.max_qty === null || totalQty <= rate.max_qty)) {
      shippingFee = rate.fee;
      break;
    }
  }

  // Match remote area by postal code first (exact), then fallback to province (null postal_code = whole province)
  const remoteMatch = selectedPostalCode
    ? remoteProvinces.find((p) => p.postal_code === selectedPostalCode)
      ?? remoteProvinces.find((p) => p.province_name === selectedProvince && !p.postal_code)
    : remoteProvinces.find((p) => p.province_name === selectedProvince && !p.postal_code);
  const remoteAreaFee = remoteMatch ? remoteMatch.surcharge : 0;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + shippingFee + remoteAreaFee;

  // --- Sync qty changes to backend when order exists ---
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevItemsRef = useRef<string>('');
  // EC-04: track in-flight sync so submit can be blocked while syncing
  const syncingRef = useRef(false);

  const syncItemsToBackend = useCallback(async () => {
    if (!orderId || items.length === 0) return;
    syncingRef.current = true;
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
    } finally {
      syncingRef.current = false;
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

  // --- Expired: show alert modal then go back to shipping ---
  // Must be defined before early returns (Rules of Hooks)
  const handleExpired = useCallback(() => {
    useAlertStore.getState().showResultAlert({
      type: 'error',
      title: locale === 'th' ? 'หมดเวลาชำระเงิน' : 'Payment Expired',
      message: locale === 'th'
        ? 'คำสั่งซื้อหมดเวลาชำระเงินแล้ว กรุณาสั่งซื้อใหม่อีกครั้ง'
        : 'Your order has expired. Please place a new order.',
      buttonText: locale === 'th' ? 'ตกลง' : 'OK',
      onClose: () => {
        setOrderId(null);
        setOrderNumber(null);
        setOrderExpiredAt(null);
        setOrderTotal(0);
        setStep('shipping');
      },
    });
  }, [locale]);

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
    setError(null); // EC-10: clear stale errors when user re-submits
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

    // ตรวจสอบ pending orders ไม่เกิน 3 รายการ
    try {
      const pendingRes = await fetch('/api/orders-proxy');
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        const orders = pendingData.data ?? pendingData ?? [];
        const pendingOrders = Array.isArray(orders)
          ? orders.filter((o: { status: string }) => o.status === 'pending_payment')
          : [];
        if (pendingOrders.length >= 3) {
          useAlertStore.getState().showResultAlert({
            type: 'error',
            title: locale === 'th' ? 'ไม่สามารถสั่งซื้อได้' : 'Cannot place order',
            message: locale === 'th'
              ? 'คุณมีคำสั่งซื้อที่รอชำระเงินอยู่ 3 รายการแล้ว กรุณาชำระเงินหรือยกเลิกคำสั่งซื้อเดิมก่อนสั่งใหม่'
              : 'You already have 3 pending orders. Please complete payment or cancel existing orders before placing a new one.',
            buttonText: locale === 'th' ? 'ไปที่คำสั่งซื้อ' : 'Go to Orders',
            onClose: () => router.push('/orders'),
          });
          return;
        }
      }
    } catch {
      // ถ้าเช็คไม่ได้ ให้ดำเนินการต่อ backend จะ validate อีกชั้น
    }

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
      orderNumberRef.current = order.order_number;
      setOrderExpiredAt(order.expired_at);
      setOrderTotal(order.total);
      prevItemsRef.current = JSON.stringify(items.map((i) => ({ id: i.id, qty: i.qty })));

      // Snapshot items + fees before clearing cart for OrderSummary display
      setOrderItems([...items]);
      setOrderShippingFee(shippingFee);
      setOrderRemoteAreaFee(remoteAreaFee);

      // Set step BEFORE clearing cart — Zustand clear() triggers re-render independently
      // from React setState, so without this order the empty-cart guard fires briefly
      setStep('payment');
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      useAlertStore.getState().showAlert('error',
        locale === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
        err instanceof Error ? err.message : 'Something went wrong',
      );
    }
  };

  // --- Upload slip → verify with SlipOk → forward to backend ---
  const handleUploadSlip = async (slipBase64: string) => {
    if (!orderId) return;

    // EC-04: flush pending debounced sync before submitting
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
      await syncItemsToBackend();
    }
    // Wait for any in-flight sync to finish
    if (syncingRef.current) {
      await new Promise<void>((resolve) => {
        const poll = setInterval(() => {
          if (!syncingRef.current) { clearInterval(poll); resolve(); }
        }, 50);
      });
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/verify-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slip_image: slipBase64,
          order_id: orderId,
          amount: orderTotal,
          locale,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify slip');
      }

      useAlertStore.getState().showResultAlert({
        type: 'success',
        title: locale === 'th' ? 'ตรวจสอบสลิปสำเร็จ' : 'Slip Verified',
        message: locale === 'th' ? 'สลิปถูกต้อง กำลังยืนยันคำสั่งซื้อ...' : 'Slip is valid. Confirming your order...',
        buttonText: locale === 'th' ? 'ตกลง' : 'OK',
        onClose: () => {
          clear();
          window.location.href = `/${locale}/checkout/confirmation?order=${encodeURIComponent(orderNumberRef.current ?? '')}`;
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      setSubmitting(false);

      useAlertStore.getState().showResultAlert({
        type: 'error',
        title: locale === 'th' ? 'ตรวจสอบสลิปไม่ผ่าน' : 'Slip Verification Failed',
        message,
        buttonText: locale === 'th' ? 'ตกลง' : 'OK',
      });
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
      setOrderExpiredAt(null);
      setOrderTotal(0);
    }
    setStep('shipping');
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 pt-24">
      <div className="container mx-auto px-4 pb-12">
        <h1 className="text-3xl font-semibold mb-8">{t('checkout.title')}</h1>

        {shippingConfigError && (
          <div className="mb-6 border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm">
            {shippingConfigError}
          </div>
        )}

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
                onPostalCodeChange={setSelectedPostalCode}
              />
            </div>

            {step === 'payment' && (
              <PaymentStep
                total={orderTotal}
                orderNumber={orderNumber ?? undefined}
                expiredAt={orderExpiredAt ?? undefined}
                onSubmit={handleUploadSlip}
                onBack={handleBack}
                onExpired={handleExpired}
                submitting={submitting}
                paymentAccounts={paymentAccounts}
                error={error}
              />
            )}
          </div>

          {/* Right: Summary */}
          <div>
            <OrderSummary
              items={step === 'payment' ? orderItems : items}
              shippingFee={step === 'payment' ? orderShippingFee : shippingFee}
              remoteAreaFee={step === 'payment' ? orderRemoteAreaFee : remoteAreaFee}
              locked={step === 'payment'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
