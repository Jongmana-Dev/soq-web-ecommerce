'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import type { Session } from 'next-auth'
import { useAlertStore } from '@/lib/alert-store'

type Props = {
  session: Session | null
  onUpdate: (data?: any) => Promise<Session | null>
  locale: string
}

const profileSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z
    .string()
    .regex(/^\d{10}$/, 'phone_invalid')
    .or(z.literal('')),
})

export default function ProfileForm({ session, onUpdate, locale }: Props) {
  const user = session?.user
  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isEditing, setIsEditing] = useState(false)
  const [originalName, setOriginalName] = useState(user?.name ?? '')
  const [originalPhone, setOriginalPhone] = useState('')

  // Fetch phone from backend (not in JWT session)
  useEffect(() => {
    fetch('/api/auth-proxy/profile')
      .then((res) => res.json())
      .then((res) => {
        if (res.data?.phone) {
          setPhone(res.data.phone)
          setOriginalPhone(res.data.phone)
        }
      })
      .catch(() => {})
  }, [])

  const t = {
    nameLabel: locale === 'th' ? 'ชื่อ' : 'Name',
    phoneLabel: locale === 'th' ? 'เบอร์โทร' : 'Phone',
    emailLabel: locale === 'th' ? 'อีเมล' : 'Email',
    save: locale === 'th' ? 'บันทึก' : 'Save',
    saving: locale === 'th' ? 'กำลังบันทึก...' : 'Saving...',
    nameRequired: locale === 'th' ? 'กรุณากรอกชื่อ' : 'Name is required',
    nameTooLong: locale === 'th' ? 'ชื่อต้องไม่เกิน 100 ตัวอักษร' : 'Name must be 100 characters or less',
    phoneInvalid: locale === 'th' ? 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก' : 'Phone must be 10 digits',
    successTitle: locale === 'th' ? 'บันทึกสำเร็จ' : 'Profile Updated',
    successMsg: locale === 'th' ? 'ข้อมูลของคุณถูกอัปเดตแล้ว' : 'Your information has been updated.',
    errorMsg: locale === 'th' ? 'เกิดข้อผิดพลาด' : 'Something went wrong',
    editBtn: locale === 'th' ? 'แก้ไข' : 'Edit',
    cancelBtn: locale === 'th' ? 'ยกเลิก' : 'Cancel',
    confirmSaveTitle: locale === 'th' ? 'ยืนยันการบันทึก' : 'Confirm Save',
    confirmSaveMsg: locale === 'th' ? 'ต้องการบันทึกข้อมูลส่วนตัวหรือไม่?' : 'Save your profile changes?',
    confirmBtn: locale === 'th' ? 'บันทึก' : 'Save',
    confirmCancelBtn: locale === 'th' ? 'ยกเลิก' : 'Cancel',
  }

  const handleCancel = () => {
    setName(originalName)
    setPhone(originalPhone)
    setErrors({})
    setIsEditing(false)
  }

  const doSave = async (data: z.infer<typeof profileSchema>) => {
    setSaving(true)
    try {
      const res = await fetch('/api/auth-proxy/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone || undefined,
        }),
      })

      if (res.ok) {
        await onUpdate({ name: data.name })
        setOriginalName(data.name)
        setOriginalPhone(data.phone || '')
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

    const result = profileSchema.safeParse({ name, phone })
    if (!result.success) {
      const errs: Record<string, string> = {}
      result.error.issues.forEach((i) => {
        const f = i.path[0] as string
        if (!errs[f]) {
          if (f === 'phone') errs[f] = t.phoneInvalid
          else if (i.code === 'too_big') errs[f] = t.nameTooLong
          else errs[f] = t.nameRequired
        }
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {t.nameLabel}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors({}) }}
          className={inputCls('name')}
          maxLength={100}
          disabled={!isEditing}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {t.phoneLabel}
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors({}) }}
          className={inputCls('phone')}
          placeholder="0xxxxxxxxx"
          autoComplete="tel"
          maxLength={10}
          disabled={!isEditing}
        />
        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
      </div>

      {/* Email (read-only) */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {t.emailLabel}
        </label>
        <input
          type="email"
          value={user?.email ?? ''}
          disabled
          className="w-full px-4 py-2.5 border border-neutral-100 text-sm text-neutral-400 bg-neutral-50"
        />
      </div>

      {/* Buttons */}
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
