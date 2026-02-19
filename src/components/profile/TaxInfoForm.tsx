'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useAlertStore } from '@/lib/alert-store'

type Props = { locale: string }

const taxSchema = z.object({
  name: z.string().min(1).max(255),
  tax_id: z.string().min(1).max(20),
  address: z.string().min(1).max(500),
  note: z.string().max(500).optional().or(z.literal('')),
})

export default function TaxInfoForm({ locale }: Props) {
  const [name, setName] = useState('')
  const [taxId, setTaxId] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isEditing, setIsEditing] = useState(false)
  const [originals, setOriginals] = useState({ name: '', tax_id: '', address: '', note: '' })
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    fetch('/api/auth-proxy/tax-info')
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          setName(res.data.name)
          setTaxId(res.data.tax_id)
          setAddress(res.data.address)
          setNote(res.data.note ?? '')
          setOriginals({
            name: res.data.name,
            tax_id: res.data.tax_id,
            address: res.data.address,
            note: res.data.note ?? '',
          })
          setHasData(true)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const t = {
    nameLabel: locale === 'th' ? 'ชื่อ/บริษัท' : 'Name/Company',
    taxIdLabel: locale === 'th' ? 'เลขประจำตัวผู้เสียภาษี' : 'Tax ID',
    addressLabel: locale === 'th' ? 'ที่อยู่ออกใบกำกับ' : 'Billing Address',
    noteLabel: locale === 'th' ? 'หมายเหตุเพิ่มเติม' : 'Additional Notes',
    save: locale === 'th' ? 'บันทึก' : 'Save',
    saving: locale === 'th' ? 'กำลังบันทึก...' : 'Saving...',
    editBtn: locale === 'th' ? 'แก้ไข' : 'Edit',
    cancelBtn: locale === 'th' ? 'ยกเลิก' : 'Cancel',
    required: locale === 'th' ? 'จำเป็น' : 'Required',
    successTitle: locale === 'th' ? 'บันทึกสำเร็จ' : 'Saved',
    successMsg: locale === 'th' ? 'ข้อมูลใบกำกับภาษีถูกอัปเดตแล้ว' : 'Tax invoice info has been updated.',
    errorMsg: locale === 'th' ? 'เกิดข้อผิดพลาด' : 'Something went wrong',
    confirmSaveTitle: locale === 'th' ? 'ยืนยันการบันทึก' : 'Confirm Save',
    confirmSaveMsg: locale === 'th' ? 'ต้องการบันทึกข้อมูลใบกำกับภาษีหรือไม่?' : 'Save tax invoice info?',
    confirmBtn: locale === 'th' ? 'บันทึก' : 'Save',
    confirmCancelBtn: locale === 'th' ? 'ยกเลิก' : 'Cancel',
    empty: locale === 'th' ? 'ยังไม่มีข้อมูลใบกำกับภาษี' : 'No tax invoice info saved',
    addBtn: locale === 'th' ? 'เพิ่มข้อมูล' : 'Add Info',
  }

  const handleCancel = () => {
    setName(originals.name)
    setTaxId(originals.tax_id)
    setAddress(originals.address)
    setNote(originals.note)
    setErrors({})
    setIsEditing(false)
  }

  const doSave = async (data: z.infer<typeof taxSchema>) => {
    setSaving(true)
    try {
      const res = await fetch('/api/auth-proxy/tax-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          tax_id: data.tax_id,
          address: data.address,
          note: data.note || undefined,
        }),
      })
      if (res.ok) {
        setOriginals({ name: data.name, tax_id: data.tax_id, address: data.address, note: data.note || '' })
        setHasData(true)
        setIsEditing(false)
        useAlertStore.getState().showAlert('success', t.successTitle, t.successMsg)
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
    setErrors({})

    const result = taxSchema.safeParse({ name, tax_id: taxId, address, note })
    if (!result.success) {
      const errs: Record<string, string> = {}
      result.error.issues.forEach((i) => {
        const f = i.path[0] as string
        if (!errs[f]) errs[f] = t.required
      })
      setErrors(errs)
      return
    }

    useAlertStore.getState().showConfirm({
      title: t.confirmSaveTitle,
      message: t.confirmSaveMsg,
      confirmText: t.confirmBtn,
      cancelText: t.confirmCancelBtn,
      variant: 'info',
      onConfirm: () => doSave(result.data),
    })
  }

  const inputCls = (field: string) =>
    isEditing
      ? `w-full px-4 py-2.5 border text-sm text-neutral-900 outline-none focus:border-neutral-900 transition-colors ${
          errors[field] ? 'border-red-400' : 'border-neutral-200'
        }`
      : 'w-full px-4 py-2.5 border border-neutral-100 text-sm text-neutral-400 bg-neutral-50'

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <i className="fa-solid fa-spinner fa-spin text-neutral-300 text-xl" />
      </div>
    )
  }

  // Empty state — no data yet
  if (!hasData && !isEditing) {
    return (
      <div className="text-center py-12">
        <i className="fa-solid fa-file-invoice text-4xl text-neutral-200 mb-4" />
        <p className="text-neutral-400 text-sm mb-6">{t.empty}</p>
        <button
          onClick={() => setIsEditing(true)}
          className="px-5 py-2.5 border border-neutral-200 text-sm font-medium text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 transition-all"
        >
          <i className="fa-solid fa-plus mr-2 text-xs" />
          {t.addBtn}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">{t.nameLabel}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors({}) }}
          className={inputCls('name')}
          maxLength={255}
          disabled={!isEditing}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{t.required}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">{t.taxIdLabel}</label>
        <input
          type="text"
          value={taxId}
          onChange={(e) => { setTaxId(e.target.value.replace(/\D/g, '').slice(0, 13)); setErrors({}) }}
          className={inputCls('tax_id')}
          maxLength={13}
          placeholder="0000000000000"
          disabled={!isEditing}
        />
        {errors.tax_id && <p className="text-xs text-red-500 mt-1">{t.required}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">{t.addressLabel}</label>
        <textarea
          value={address}
          onChange={(e) => { setAddress(e.target.value); setErrors({}) }}
          className={`${inputCls('address')} min-h-[80px] resize-y`}
          maxLength={500}
          disabled={!isEditing}
        />
        {errors.address && <p className="text-xs text-red-500 mt-1">{t.required}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">{t.noteLabel}</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={`${inputCls('note')} min-h-[60px] resize-y`}
          maxLength={500}
          disabled={!isEditing}
        />
      </div>

      {isEditing ? (
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
          >
            {saving ? (
              <><i className="fa-solid fa-spinner fa-spin mr-2" />{t.saving}</>
            ) : (
              t.save
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="px-6 py-2.5 border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            {t.cancelBtn}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="px-6 py-2.5 border border-neutral-200 text-sm font-medium text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 transition-all"
        >
          <i className="fa-solid fa-pen mr-2 text-xs" />
          {t.editBtn}
        </button>
      )}
    </form>
  )
}
