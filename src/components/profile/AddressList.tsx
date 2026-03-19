'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { z } from 'zod'
import { useAlertStore } from '@/lib/alert-store'
import { useThaiGeography, useGeoSelections } from '@/hooks/useThaiGeography'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'

type Address = {
  id: string
  label: string | null
  recipient_name: string
  phone: string
  address_line: string
  subdistrict: string | null
  district: string | null
  province: string
  postal_code: string
  is_default: boolean
}

type Props = { locale: string; onDirtyChange?: (dirty: boolean) => void }

const addressSchema = z.object({
  recipient_name: z.string().min(1, 'required').max(100, 'name_too_long'),
  phone: z.string().regex(/^\d{10}$/, 'phone_invalid'),
  address_line: z.string().min(1, 'required'),
  province: z.string().min(1, 'required').max(100),
  district: z.string().min(1, 'required').max(100),
  subdistrict: z.string().min(1, 'required').max(100),
  postal_code: z.string().min(1, 'required').max(10),
  is_default: z.boolean().optional(),
})

type AddressForm = z.infer<typeof addressSchema>

const emptyForm: AddressForm = {
  recipient_name: '',
  phone: '',
  address_line: '',
  province: '',
  district: '',
  subdistrict: '',
  postal_code: '',
  is_default: false,
}

export default function AddressList({ locale, onDirtyChange }: Props) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AddressForm>(emptyForm)
  const [originalForm, setOriginalForm] = useState<AddressForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof AddressForm, string>>>({})

  const isDirty = useMemo(
    () => showForm && JSON.stringify(form) !== JSON.stringify(originalForm),
    [showForm, form, originalForm],
  )
  useUnsavedChanges(isDirty)

  useEffect(() => { onDirtyChange?.(isDirty) }, [isDirty, onDirtyChange])

  // Thai geography
  const { data: geoData } = useThaiGeography()
  const { provinces, districts, subdistricts } = useGeoSelections(
    geoData,
    form.province,
    form.district,
    locale,
  )

  const t = {
    add: locale === 'th' ? 'เพิ่มที่อยู่' : 'Add Address',
    edit: locale === 'th' ? 'แก้ไข' : 'Edit',
    delete: locale === 'th' ? 'ลบ' : 'Delete',
    setDefault: locale === 'th' ? 'ตั้งเป็นค่าเริ่มต้น' : 'Set as Default',
    primary: locale === 'th' ? 'ที่อยู่หลัก' : 'Primary',
    secondary: locale === 'th' ? 'ที่อยู่รอง' : 'Secondary',
    save: locale === 'th' ? 'บันทึก' : 'Save',
    cancel: locale === 'th' ? 'ยกเลิก' : 'Cancel',
    saving: locale === 'th' ? 'กำลังบันทึก...' : 'Saving...',
    empty: locale === 'th' ? 'ยังไม่มีที่อยู่' : 'No addresses yet',
    maxAddr: locale === 'th' ? 'สูงสุด 2 ที่อยู่' : 'Maximum 2 addresses',
    recipientName: locale === 'th' ? 'ชื่อผู้รับ' : 'Recipient',
    phone: locale === 'th' ? 'เบอร์โทร' : 'Phone',
    addressLine: locale === 'th' ? 'ที่อยู่' : 'Address',
    province: locale === 'th' ? 'จังหวัด' : 'Province',
    district: locale === 'th' ? 'เขต/อำเภอ' : 'District',
    subdistrict: locale === 'th' ? 'ตำบล/แขวง' : 'Subdistrict',
    postalCode: locale === 'th' ? 'รหัสไปรษณีย์' : 'Postal Code',
    makeDefault: locale === 'th' ? 'ตั้งเป็นที่อยู่หลัก' : 'Set as primary',
    required: locale === 'th' ? 'จำเป็น' : 'Required',
    nameTooLong: locale === 'th' ? 'ชื่อต้องไม่เกิน 100 ตัวอักษร' : 'Max 100 characters',
    phoneInvalid: locale === 'th' ? 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก' : 'Must be 10 digits',
    selectProvince: locale === 'th' ? '-- เลือกจังหวัด --' : '-- Select Province --',
    selectDistrict: locale === 'th' ? '-- เลือกอำเภอ --' : '-- Select District --',
    selectSubdistrict: locale === 'th' ? '-- เลือกตำบล --' : '-- Select Subdistrict --',
    confirmDeleteTitle: locale === 'th' ? 'ยืนยันการลบ' : 'Confirm Delete',
    confirmDeleteMsg: locale === 'th' ? 'ต้องการลบที่อยู่นี้หรือไม่?' : 'Delete this address?',
    confirmBtn: locale === 'th' ? 'ลบ' : 'Delete',
    cancelBtn: locale === 'th' ? 'ยกเลิก' : 'Cancel',
    deleteSuccess: locale === 'th' ? 'ลบที่อยู่แล้ว' : 'Address Deleted',
    saveSuccess: locale === 'th' ? 'บันทึกที่อยู่แล้ว' : 'Address Saved',
    updateSuccess: locale === 'th' ? 'อัปเดตที่อยู่แล้ว' : 'Address Updated',
    errorMsg: locale === 'th' ? 'เกิดข้อผิดพลาด' : 'Something went wrong',
    autoDefault: locale === 'th' ? 'ที่อยู่แรกเป็นที่อยู่หลักอัตโนมัติ' : 'First address is automatically set as primary',
    confirmSaveTitle: locale === 'th' ? 'ยืนยันการบันทึก' : 'Confirm Save',
    confirmSaveMsg: locale === 'th' ? 'ต้องการบันทึกที่อยู่นี้หรือไม่?' : 'Save this address?',
    confirmSaveBtn: locale === 'th' ? 'บันทึก' : 'Save',
    confirmCancelBtn: locale === 'th' ? 'ยกเลิก' : 'Cancel',
  }

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch('/api/auth-proxy/addresses')
      if (res.ok) {
        const json = await res.json()
        setAddresses(json.data ?? [])
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAddresses() }, [fetchAddresses])

  const handleChange = (field: keyof AddressForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleProvinceChange = (value: string) => {
    setForm((prev) => ({ ...prev, province: value, district: '', subdistrict: '', postal_code: '' }))
  }

  const handleDistrictChange = (value: string) => {
    setForm((prev) => ({ ...prev, district: value, subdistrict: '', postal_code: '' }))
  }

  const handleSubdistrictChange = (value: string) => {
    const sub = subdistricts.find((s) => s.value === value)
    setForm((prev) => ({
      ...prev,
      subdistrict: value,
      postal_code: sub?.zipcode ?? prev.postal_code,
    }))
  }

  const isFirstAddress = addresses.length === 0

  const openAdd = () => {
    const initial = isFirstAddress ? { ...emptyForm, is_default: true } : emptyForm
    setEditingId(null)
    setForm(initial)
    setOriginalForm(initial)
    setErrors({})
    setShowForm(true)
  }

  const openEdit = (addr: Address) => {
    const data: AddressForm = {
      recipient_name: addr.recipient_name,
      phone: addr.phone,
      address_line: addr.address_line,
      province: addr.province,
      district: addr.district ?? '',
      subdistrict: addr.subdistrict ?? '',
      postal_code: addr.postal_code,
      is_default: addr.is_default,
    }
    setEditingId(addr.id)
    setForm(data)
    setOriginalForm(data)
    setErrors({})
    setShowForm(true)
  }

  const doSaveAddress = async (data: AddressForm) => {
    setSaving(true)
    try {
      const url = editingId
        ? `/api/auth-proxy/addresses/${editingId}`
        : '/api/auth-proxy/addresses'
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setShowForm(false)
        fetchAddresses()
        useAlertStore.getState().showAlert(
          'success',
          editingId ? t.updateSuccess : t.saveSuccess,
        )
      } else {
        useAlertStore.getState().showAlert('error', t.errorMsg)
      }
    } catch {
      useAlertStore.getState().showAlert('error', t.errorMsg)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = addressSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof AddressForm, string>> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof AddressForm
        if (!fieldErrors[field]) {
          if (issue.message === 'phone_invalid') fieldErrors[field] = t.phoneInvalid
          else if (issue.message === 'name_too_long') fieldErrors[field] = t.nameTooLong
          else fieldErrors[field] = t.required
        }
      }
      setErrors(fieldErrors)
      return
    }

    useAlertStore.getState().showConfirm({
      title: t.confirmSaveTitle,
      message: t.confirmSaveMsg,
      confirmText: t.confirmSaveBtn,
      cancelText: t.confirmCancelBtn,
      variant: 'info',
      onConfirm: () => doSaveAddress(result.data),
    })
  }

  const handleDelete = (id: string) => {
    useAlertStore.getState().showConfirm({
      title: t.confirmDeleteTitle,
      message: t.confirmDeleteMsg,
      confirmText: t.confirmBtn,
      cancelText: t.cancelBtn,
      onConfirm: async () => {
        try {
          await fetch(`/api/auth-proxy/addresses/${id}`, { method: 'DELETE' })
          fetchAddresses()
          useAlertStore.getState().showAlert('success', t.deleteSuccess)
        } catch {
          useAlertStore.getState().showAlert('error', t.errorMsg)
        }
      },
    })
  }

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/auth-proxy/addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_default: true }),
      })
      if (res.ok) {
        fetchAddresses()
        useAlertStore.getState().showAlert('success',
          locale === 'th' ? 'ตั้งเป็นที่อยู่หลักแล้ว' : 'Set as primary',
        )
      }
    } catch {
      useAlertStore.getState().showAlert('error', t.errorMsg)
    }
  }

  const inputCls = (field: keyof AddressForm) =>
    `w-full px-3 py-2 border text-sm text-neutral-900 outline-none focus:border-neutral-900 transition-colors ${
      errors[field] ? 'border-red-400' : 'border-neutral-200'
    }`

  const selectCls = (field: keyof AddressForm) =>
    `w-full px-3 py-2 border text-sm text-neutral-900 outline-none focus:border-neutral-900 transition-colors bg-white ${
      errors[field] ? 'border-red-400' : 'border-neutral-200'
    }`

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <i className="fa-solid fa-spinner fa-spin text-neutral-300 text-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add button or max message */}
      {!showForm && addresses.length < 2 && (
        <button
          onClick={openAdd}
          className="px-5 py-2.5 border border-neutral-200 text-sm font-medium text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 transition-all"
        >
          <i className="fa-solid fa-plus mr-2 text-xs" />
          {t.add}
        </button>
      )}
      {!showForm && addresses.length >= 2 && (
        <p className="text-xs text-neutral-400 italic">{t.maxAddr}</p>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 p-5 border border-neutral-200 bg-neutral-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">{t.recipientName} *</label>
              <input
                type="text"
                value={form.recipient_name}
                onChange={(e) => handleChange('recipient_name', e.target.value)}
                className={inputCls('recipient_name')}
                maxLength={100}
              />
              {errors.recipient_name && <p className="text-xs text-red-500 mt-1">{t.required}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">{t.phone} *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                className={inputCls('phone')}
                maxLength={10}
                placeholder="0xxxxxxxxx"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{t.required}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">{t.addressLine} *</label>
            <textarea
              value={form.address_line}
              onChange={(e) => handleChange('address_line', e.target.value)}
              rows={2}
              className={`${inputCls('address_line')} resize-none`}
            />
            {errors.address_line && <p className="text-xs text-red-500 mt-1">{t.required}</p>}
          </div>

          {/* Cascading selects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">{t.province} *</label>
              <select
                value={form.province}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className={selectCls('province')}
              >
                <option value="">{t.selectProvince}</option>
                {provinces.map((p) => (
                  <option key={`prov-${p.value}`} value={p.value}>{p.label}</option>
                ))}
              </select>
              {errors.province && <p className="text-xs text-red-500 mt-1">{t.required}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">{t.district} *</label>
              <select
                value={form.district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={!form.province}
                className={selectCls('district')}
              >
                <option value="">{t.selectDistrict}</option>
                {districts.map((d) => (
                  <option key={`dist-${d.value}`} value={d.value}>{d.label}</option>
                ))}
              </select>
              {errors.district && <p className="text-xs text-red-500 mt-1">{t.required}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">{t.subdistrict} *</label>
              <select
                value={form.subdistrict}
                onChange={(e) => handleSubdistrictChange(e.target.value)}
                disabled={!form.district}
                className={selectCls('subdistrict')}
              >
                <option value="">{t.selectSubdistrict}</option>
                {subdistricts.map((s, i) => (
                  <option key={`${s.value}-${i}`} value={s.value}>{s.label}</option>
                ))}
              </select>
              {errors.subdistrict && <p className="text-xs text-red-500 mt-1">{t.required}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">{t.postalCode} *</label>
              <input
                type="text"
                value={form.postal_code}
                readOnly
                className="w-full px-3 py-2 border border-neutral-200 text-sm bg-neutral-100 text-neutral-500"
              />
              {errors.postal_code && <p className="text-xs text-red-500 mt-1">{t.required}</p>}
            </div>
          </div>

          <div>
            <label className={`flex items-center gap-2 text-sm text-neutral-600 ${isFirstAddress && !editingId ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                checked={form.is_default ?? false}
                onChange={(e) => handleChange('is_default', e.target.checked)}
                className="accent-neutral-900"
                disabled={isFirstAddress && !editingId}
              />
              {t.makeDefault}
            </label>
            {isFirstAddress && !editingId && (
              <p className="text-xs text-neutral-400 mt-1 ml-5">{t.autoDefault}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-neutral-900 text-white text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
            >
              {saving ? t.saving : t.save}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <i className="fa-solid fa-map-location-dot text-4xl text-neutral-200 mb-4" />
          <p className="text-neutral-400 text-sm">{t.empty}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-4 border transition-colors ${
                addr.is_default
                  ? 'border-neutral-900 bg-neutral-50'
                  : 'border-neutral-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 ${
                      addr.is_default
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {addr.is_default ? t.primary : t.secondary}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-neutral-900">
                    {addr.recipient_name} &middot; {addr.phone}
                  </p>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {addr.address_line}
                    {addr.subdistrict ? ` ${addr.subdistrict}` : ''}
                    {addr.district ? ` ${addr.district}` : ''}
                    {` ${addr.province} ${addr.postal_code}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!addr.is_default && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="w-9 h-9 flex items-center justify-center text-sm text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors"
                      title={t.setDefault}
                    >
                      <i className="fa-solid fa-star" />
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(addr)}
                    className="w-9 h-9 flex items-center justify-center text-sm text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors"
                    title={t.edit}
                  >
                    <i className="fa-solid fa-pen" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="w-9 h-9 flex items-center justify-center text-sm text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title={t.delete}
                  >
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
