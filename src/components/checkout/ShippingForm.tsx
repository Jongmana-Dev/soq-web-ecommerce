"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useThaiGeography, useGeoSelections } from '@/hooks/useThaiGeography';
import { useAlertStore } from '@/lib/alert-store';

interface Address {
  id: string;
  label: string | null;
  recipient_name: string;
  phone: string;
  address_line: string;
  subdistrict: string | null;
  district: string | null;
  province: string;
  postal_code: string;
  is_default: boolean;
}

export interface ShippingData {
  address_id?: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  shipping_subdistrict: string;
  shipping_district: string;
  shipping_province: string;
  shipping_postal_code: string;
  save_address: boolean;
  referral_source: string;
  tax_invoice: boolean;
  tax_info?: { name: string; tax_id: string; address: string; note?: string };
  note: string;
}

interface ShippingFormProps {
  onSubmit: (data: ShippingData) => void;
  onProvinceChange?: (province: string) => void;
}

const REFERRAL_OPTIONS = ['search', 'facebook', 'line', 'friend', 'ig', 'event', 'other'] as const;
const FEATURE_TAX_INFO = process.env.NEXT_PUBLIC_FEATURE_TAX_INFO === 'true';

export default function ShippingForm({ onSubmit, onProvinceChange }: ShippingFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Form fields (for "other" or no-saved-address mode)
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [subdistrict, setSubdistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [taxInvoice, setTaxInvoice] = useState(false);
  const [taxName, setTaxName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [taxAddress, setTaxAddress] = useState('');
  const [taxNote, setTaxNote] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedTaxInfo, setSavedTaxInfo] = useState<{ name: string; tax_id: string; address: string; note?: string } | null>(null);
  const [isReturning, setIsReturning] = useState(false);

  // "other" = กรอกที่อยู่ใหม่ (กรณีมีที่อยู่อยู่แล้วแต่ต้องการส่งที่อื่น)
  const isOtherMode = selectedAddressId === '__other__';
  const showForm = savedAddresses.length === 0 || isOtherMode;

  // Thai geography
  const { data: geoData } = useThaiGeography();
  const { provinces, districts, subdistricts } = useGeoSelections(geoData, province, district, locale);

  useEffect(() => {
    const fetchAddr = async () => {
      const res = await fetch('/api/auth-proxy/addresses');
      if (!res.ok) throw new Error(`addresses ${res.status}`);
      return res.json();
    };
    const fetchTax = async () => {
      if (!FEATURE_TAX_INFO) return { data: null };
      const res = await fetch('/api/auth-proxy/tax-info');
      if (!res.ok) return { data: null };
      return res.json();
    };
    const fetchReturning = async () => {
      const res = await fetch('/api/orders-proxy/is-returning');
      if (!res.ok) return { data: { returning: false } };
      return res.json();
    };

    Promise.all([fetchAddr(), fetchTax(), fetchReturning()])
      .then(([addrRes, taxRes, returningRes]) => {
        const addresses = addrRes.data ?? [];
        setSavedAddresses(addresses);
        if (addresses.length > 0) {
          const defaultAddr = addresses.find((a: Address) => a.is_default) ?? addresses[0];
          setSelectedAddressId(defaultAddr.id);
          onProvinceChange?.(defaultAddr.province);
        }
        if (taxRes.data) {
          setSavedTaxInfo(taxRes.data);
        }
        setIsReturning(returningRes.data?.returning ?? false);
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleProvinceChange = (value: string) => {
    setProvince(value);
    setDistrict('');
    setSubdistrict('');
    setPostalCode('');
    onProvinceChange?.(value);
  };

  const handleDistrictChange = (value: string) => {
    setDistrict(value);
    setSubdistrict('');
    setPostalCode('');
  };

  const handleSubdistrictChange = (value: string) => {
    // Extract real subdistrict name (value may contain "||zipcode" for duplicates)
    const subdistrictName = value.includes('||') ? value.split('||')[0] : value;
    setSubdistrict(subdistrictName);
    const sub = subdistricts.find((s) => s.value === value);
    if (sub) setPostalCode(sub.zipcode);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const req = locale === 'th' ? 'จำเป็น' : 'Required';

    if (showForm) {
      // กรอกใหม่
      if (!customerName.trim()) errs.customerName = req;
      else if (customerName.trim().length > 100) errs.customerName = locale === 'th' ? 'ชื่อต้องไม่เกิน 100 ตัวอักษร' : 'Max 100 characters';
      if (!phone.trim()) errs.phone = req;
      else if (!/^\d{10}$/.test(phone)) errs.phone = locale === 'th' ? 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก' : 'Must be 10 digits';
      if (!addressLine.trim()) errs.addressLine = req;
      if (!province) errs.province = req;
      if (!district) errs.district = req;
      if (!subdistrict) errs.subdistrict = req;
      if (!postalCode.trim()) errs.postalCode = req;
    } else {
      // เลือกที่อยู่เดิม
      if (!selectedAddressId) errs.selectedAddress = req;
    }

    if (taxInvoice) {
      if (!taxName.trim()) errs.taxName = req;
      if (!taxId.trim()) errs.taxId = req;
      if (!taxAddress.trim()) errs.taxAddress = req;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildNewAddressData = (saveAddress: boolean): ShippingData => ({
    customer_name: customerName,
    customer_phone: phone,
    shipping_address: addressLine,
    shipping_subdistrict: subdistrict,
    shipping_district: district,
    shipping_province: province,
    shipping_postal_code: postalCode,
    save_address: saveAddress,
    referral_source: referralSource,
    tax_invoice: taxInvoice,
    tax_info: taxInvoice ? { name: taxName, tax_id: taxId, address: taxAddress, note: taxNote || undefined } : undefined,
    note,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Case 1-2: เลือกจากที่อยู่ที่บันทึกไว้
    if (!showForm) {
      const addr = savedAddresses.find((a) => a.id === selectedAddressId)!;
      onSubmit({
        address_id: addr.id,
        customer_name: addr.recipient_name,
        customer_phone: addr.phone,
        shipping_address: addr.address_line,
        shipping_subdistrict: addr.subdistrict ?? '',
        shipping_district: addr.district ?? '',
        shipping_province: addr.province,
        shipping_postal_code: addr.postal_code,
        save_address: false,
        referral_source: referralSource,
        tax_invoice: taxInvoice,
        tax_info: taxInvoice ? { name: taxName, tax_id: taxId, address: taxAddress, note: taxNote || undefined } : undefined,
        note,
      });
      return;
    }

    // Case 3: มีที่อยู่อยู่แล้ว แต่เลือก "อื่นๆ" → ไม่บันทึก
    if (isOtherMode) {
      onSubmit(buildNewAddressData(false));
      return;
    }

    // Case 4: ไม่เคยมีที่อยู่เลย → ถาม confirmbox ว่าจะบันทึกเป็นที่อยู่หลักหรือไม่
    useAlertStore.getState().showConfirm({
      title: locale === 'th' ? 'บันทึกที่อยู่' : 'Save Address',
      message: locale === 'th'
        ? 'ต้องการบันทึกที่อยู่นี้เป็นที่อยู่หลักสำหรับการสั่งซื้อครั้งถัดไปหรือไม่?'
        : 'Save this address as your primary address for future orders?',
      confirmText: locale === 'th' ? 'บันทึก' : 'Save',
      cancelText: locale === 'th' ? 'ไม่บันทึก' : "Don't Save",
      variant: 'info',
      onConfirm: () => onSubmit(buildNewAddressData(true)),
      onCancel: () => onSubmit(buildNewAddressData(false)),
    });
  };

  const inputClass = 'w-full border border-neutral-300 px-3 py-2.5 text-base text-neutral-900 focus:outline-none focus:border-neutral-500 transition-colors';
  const selectClass = (hasError?: boolean) =>
    `w-full border px-3 py-2.5 text-base text-neutral-900 focus:outline-none focus:border-neutral-500 transition-colors bg-white ${
      hasError ? 'border-red-400' : 'border-neutral-300'
    }`;
  const labelClass = 'block text-sm font-medium text-neutral-700 mb-1';
  const errorClass = 'text-xs text-red-500 mt-1';

  if (loading) {
    return <div className="animate-pulse h-64 bg-neutral-100" />;
  }

  if (fetchError) {
    return (
      <div className="border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700 text-sm mb-3">
          {locale === 'th' ? 'ไม่สามารถโหลดข้อมูลที่อยู่ได้ กรุณาลองใหม่อีกครั้ง' : 'Could not load address data. Please try again.'}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-sm text-red-600 underline underline-offset-4 hover:text-red-800"
        >
          {locale === 'th' ? 'โหลดใหม่' : 'Reload'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Address Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">{t('checkout.shipping')}</h3>

        {savedAddresses.length > 0 ? (
          <div className="space-y-2">
            {/* ที่อยู่ที่บันทึกไว้ */}
            {savedAddresses.map((addr) => (
              <label
                key={addr.id}
                className={`block border p-3 cursor-pointer transition-colors ${
                  selectedAddressId === addr.id
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                    : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <input
                  type="radio"
                  name="savedAddress"
                  value={addr.id}
                  checked={selectedAddressId === addr.id}
                  onChange={() => { setSelectedAddressId(addr.id); onProvinceChange?.(addr.province); }}
                  className="sr-only"
                />
                <p className="font-medium text-sm">{addr.recipient_name} — {addr.phone}</p>
                <p className="text-sm text-neutral-500">
                  {addr.address_line}
                  {addr.subdistrict ? ` ${addr.subdistrict}` : ''}
                  {addr.district ? ` ${addr.district}` : ''}
                  {`, ${addr.province} ${addr.postal_code}`}
                </p>
                {addr.is_default && (
                  <span className="inline-block mt-1 text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5">
                    {t('profile.default')}
                  </span>
                )}
              </label>
            ))}

            {/* ตัวเลือก "อื่นๆ" */}
            <label
              className={`block border p-3 cursor-pointer transition-colors ${
                isOtherMode
                  ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                  : 'border-neutral-200 hover:border-neutral-400'
              }`}
            >
              <input
                type="radio"
                name="savedAddress"
                value="__other__"
                checked={isOtherMode}
                onChange={() => setSelectedAddressId('__other__')}
                className="sr-only"
              />
              <p className="text-sm text-neutral-600">
                <i className="fa-solid fa-plus text-xs mr-1.5" />
                {locale === 'th' ? 'จัดส่งที่อยู่อื่น' : 'Ship to another address'}
              </p>
            </label>

            {errors.selectedAddress && <p className={errorClass}>{errors.selectedAddress}</p>}
          </div>
        ) : null}

        {/* ฟอร์มกรอกที่อยู่ใหม่ — แสดงเมื่อไม่มีที่อยู่เลย หรือเลือก "อื่นๆ" */}
        {showForm && (
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${isOtherMode ? 'mt-4' : ''}`}>
            <div>
              <label className={labelClass}>{t('checkout.recipientName')}</label>
              <input className={inputClass} value={customerName} onChange={(e) => setCustomerName(e.target.value)} maxLength={100} />
              {errors.customerName && <p className={errorClass}>{errors.customerName}</p>}
            </div>
            <div>
              <label className={labelClass}>{t('checkout.phone')}</label>
              <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} type="tel" maxLength={10} placeholder="0xxxxxxxxx" />
              {errors.phone && <p className={errorClass}>{errors.phone}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>{t('checkout.addressLine')}</label>
              <input className={inputClass} value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
              {errors.addressLine && <p className={errorClass}>{errors.addressLine}</p>}
            </div>

            {/* Cascading selects */}
            <div>
              <label className={labelClass}>{t('checkout.province')}</label>
              <select
                value={province}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className={selectClass(!!errors.province)}
              >
                <option value="">{locale === 'th' ? '-- เลือกจังหวัด --' : '-- Select Province --'}</option>
                {provinces.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              {errors.province && <p className={errorClass}>{errors.province}</p>}
            </div>
            <div>
              <label className={labelClass}>{t('checkout.district')}</label>
              <select
                value={district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={!province}
                className={selectClass(!!errors.district)}
              >
                <option value="">{locale === 'th' ? '-- เลือกอำเภอ --' : '-- Select District --'}</option>
                {districts.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              {errors.district && <p className={errorClass}>{errors.district}</p>}
            </div>
            <div>
              <label className={labelClass}>{locale === 'th' ? 'ตำบล/แขวง' : 'Subdistrict'}</label>
              <select
                value={subdistrict}
                onChange={(e) => handleSubdistrictChange(e.target.value)}
                disabled={!district}
                className={selectClass(!!errors.subdistrict)}
              >
                <option value="">{locale === 'th' ? '-- เลือกตำบล --' : '-- Select Subdistrict --'}</option>
                {subdistricts.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              {errors.subdistrict && <p className={errorClass}>{errors.subdistrict}</p>}
            </div>
            <div>
              <label className={labelClass}>{t('checkout.postalCode')}</label>
              <input
                className={`${inputClass} bg-neutral-50 text-neutral-500`}
                value={postalCode}
                readOnly
              />
              {errors.postalCode && <p className={errorClass}>{errors.postalCode}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Referral Source — only for new customers */}
      {!isReturning && (
        <div>
          <label className={labelClass}>{t('checkout.referralSource')}</label>
          <select
            className={inputClass}
            value={referralSource}
            onChange={(e) => setReferralSource(e.target.value)}
          >
            <option value="">—</option>
            {REFERRAL_OPTIONS.map((key) => (
              <option key={key} value={key}>
                {t(`checkout.referralOptions.${key}`)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tax Invoice */}
      {FEATURE_TAX_INFO && (
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={taxInvoice}
              onChange={(e) => {
                const checked = e.target.checked;
                setTaxInvoice(checked);
                if (checked && savedTaxInfo && !taxName && !taxId && !taxAddress) {
                  setTaxName(savedTaxInfo.name);
                  setTaxId(savedTaxInfo.tax_id);
                  setTaxAddress(savedTaxInfo.address);
                  setTaxNote(savedTaxInfo.note ?? '');
                }
              }}
              className="accent-[var(--accent)]"
            />
            <span className="text-sm font-medium text-neutral-700">{t('checkout.taxInvoice')}</span>
          </label>

          {taxInvoice && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pl-6">
              <div>
                <label className={labelClass}>{t('checkout.taxName')}</label>
                <input className={inputClass} value={taxName} onChange={(e) => setTaxName(e.target.value)} />
                {errors.taxName && <p className={errorClass}>{errors.taxName}</p>}
              </div>
              <div>
                <label className={labelClass}>{t('checkout.taxId')}</label>
                <input className={inputClass} value={taxId} onChange={(e) => setTaxId(e.target.value)} />
                {errors.taxId && <p className={errorClass}>{errors.taxId}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>{t('checkout.taxAddress')}</label>
                <input className={inputClass} value={taxAddress} onChange={(e) => setTaxAddress(e.target.value)} />
                {errors.taxAddress && <p className={errorClass}>{errors.taxAddress}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>{locale === 'th' ? 'หมายเหตุเพิ่มเติม' : 'Additional Notes'}</label>
                <textarea
                  className={`${inputClass} min-h-[60px] resize-y`}
                  value={taxNote}
                  onChange={(e) => setTaxNote(e.target.value)}
                  placeholder={locale === 'th' ? 'ระบุรายละเอียดเพิ่มเติม (ถ้ามี)' : 'Additional details (if any)'}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Note */}
      <div>
        <label className={labelClass}>{t('checkout.note')}</label>
        <textarea
          className={`${inputClass} min-h-[80px] resize-y`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('checkout.notePh')}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-[var(--accent)] text-neutral-900 py-3 font-semibold transition-transform"
      >
        {t('checkout.continueToPayment')}
      </button>
    </form>
  );
}
