"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useThaiGeography, useGeoSelections } from '@/hooks/useThaiGeography';

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
  tax_info?: { name: string; tax_id: string; address: string };
  note: string;
}

interface ShippingFormProps {
  onSubmit: (data: ShippingData) => void;
}

const REFERRAL_OPTIONS = ['search', 'facebook', 'line', 'friend', 'ig', 'event', 'other'] as const;

export default function ShippingForm({ onSubmit }: ShippingFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [addressMode, setAddressMode] = useState<'saved' | 'new'>('new');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [subdistrict, setSubdistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  const [referralSource, setReferralSource] = useState('');
  const [taxInvoice, setTaxInvoice] = useState(false);
  const [taxName, setTaxName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [taxAddress, setTaxAddress] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Thai geography
  const { data: geoData } = useThaiGeography();
  const { provinces, districts, subdistricts } = useGeoSelections(geoData, province, district, locale);

  useEffect(() => {
    fetch('/api/auth-proxy/addresses')
      .then((res) => res.json())
      .then((res) => {
        const addresses = res.data ?? [];
        setSavedAddresses(addresses);
        if (addresses.length > 0) {
          setAddressMode('saved');
          const defaultAddr = addresses.find((a: Address) => a.is_default) ?? addresses[0];
          setSelectedAddressId(defaultAddr.id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleProvinceChange = (value: string) => {
    setProvince(value);
    setDistrict('');
    setSubdistrict('');
    setPostalCode('');
  };

  const handleDistrictChange = (value: string) => {
    setDistrict(value);
    setSubdistrict('');
    setPostalCode('');
  };

  const handleSubdistrictChange = (value: string) => {
    setSubdistrict(value);
    const sub = subdistricts.find((s) => s.value === value);
    if (sub) setPostalCode(sub.zipcode);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (addressMode === 'new') {
      if (!customerName.trim()) errs.customerName = (locale === 'th' ? 'จำเป็น' : 'Required');
      else if (customerName.trim().length > 100) errs.customerName = locale === 'th' ? 'ชื่อต้องไม่เกิน 100 ตัวอักษร' : 'Max 100 characters';
      if (!phone.trim()) errs.phone = (locale === 'th' ? 'จำเป็น' : 'Required');
      else if (!/^\d{10}$/.test(phone)) errs.phone = locale === 'th' ? 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก' : 'Must be 10 digits';
      if (!addressLine.trim()) errs.addressLine = (locale === 'th' ? 'จำเป็น' : 'Required');
      if (!province) errs.province = (locale === 'th' ? 'จำเป็น' : 'Required');
      if (!district) errs.district = (locale === 'th' ? 'จำเป็น' : 'Required');
      if (!subdistrict) errs.subdistrict = (locale === 'th' ? 'จำเป็น' : 'Required');
      if (!postalCode.trim()) errs.postalCode = (locale === 'th' ? 'จำเป็น' : 'Required');
    } else {
      if (!selectedAddressId) errs.selectedAddress = (locale === 'th' ? 'จำเป็น' : 'Required');
    }

    if (taxInvoice) {
      if (!taxName.trim()) errs.taxName = (locale === 'th' ? 'จำเป็น' : 'Required');
      if (!taxId.trim()) errs.taxId = (locale === 'th' ? 'จำเป็น' : 'Required');
      if (!taxAddress.trim()) errs.taxAddress = (locale === 'th' ? 'จำเป็น' : 'Required');
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (addressMode === 'saved') {
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
        tax_info: taxInvoice ? { name: taxName, tax_id: taxId, address: taxAddress } : undefined,
        note,
      });
    } else {
      onSubmit({
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
        tax_info: taxInvoice ? { name: taxName, tax_id: taxId, address: taxAddress } : undefined,
        note,
      });
    }
  };

  const inputClass = 'w-full border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-500 transition-colors';
  const selectClass = (hasError?: boolean) =>
    `w-full border px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-500 transition-colors bg-white ${
      hasError ? 'border-red-400' : 'border-neutral-300'
    }`;
  const labelClass = 'block text-sm font-medium text-neutral-700 mb-1';
  const errorClass = 'text-xs text-red-500 mt-1';

  if (loading) {
    return <div className="animate-pulse h-64 bg-neutral-100" />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Address Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">{t('checkout.shipping')}</h3>

        {/* Address Mode Toggle */}
        {savedAddresses.length > 0 && (
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="addressMode"
                checked={addressMode === 'saved'}
                onChange={() => setAddressMode('saved')}
                className="accent-[var(--accent)]"
              />
              <span className="text-sm">{t('checkout.useExisting')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="addressMode"
                checked={addressMode === 'new'}
                onChange={() => setAddressMode('new')}
                className="accent-[var(--accent)]"
              />
              <span className="text-sm">{t('checkout.newAddress')}</span>
            </label>
          </div>
        )}

        {/* Saved Addresses */}
        {addressMode === 'saved' && (
          <div className="space-y-2">
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
                  onChange={() => setSelectedAddressId(addr.id)}
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
            {errors.selectedAddress && <p className={errorClass}>{errors.selectedAddress}</p>}
          </div>
        )}

        {/* New Address Form */}
        {addressMode === 'new' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="accent-[var(--accent)]"
                />
                <span className="text-sm text-neutral-600">{t('checkout.saveAddress')}</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Referral Source */}
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

      {/* Tax Invoice */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={taxInvoice}
            onChange={(e) => setTaxInvoice(e.target.checked)}
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
          </div>
        )}
      </div>

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
        className="w-full bg-[var(--accent)] text-neutral-900 py-3 font-semibold hover:scale-[1.02] transition-transform"
      >
        {t('checkout.continueToPayment')}
      </button>
    </form>
  );
}
