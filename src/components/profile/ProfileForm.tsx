'use client'

import { useState, useEffect, useMemo } from 'react'
import { z } from 'zod'
import type { Session } from 'next-auth'
import { useAlertStore } from '@/lib/alert-store'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'

type Props = {
  session: Session | null
  onUpdate: (data?: any) => Promise<Session | null>
  locale: string
  onDirtyChange?: (dirty: boolean) => void
}

const profileSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z
    .string()
    .regex(/^\d{10}$/, 'phone_invalid')
    .or(z.literal('')),
  email: z.string().email('email_invalid').max(255).or(z.literal('')),
})

export default function ProfileForm({ session, onUpdate, locale, onDirtyChange }: Props) {
  const user = session?.user
  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState(user?.email ?? '')
  const [canEditEmail, setCanEditEmail] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isEditing, setIsEditing] = useState(false)
  const [originalName, setOriginalName] = useState(user?.name ?? '')
  const [originalPhone, setOriginalPhone] = useState('')
  const [originalEmail, setOriginalEmail] = useState(user?.email ?? '')

  const isDirty = useMemo(
    () => isEditing && (name !== originalName || phone !== originalPhone || email !== originalEmail),
    [isEditing, name, originalName, phone, originalPhone, email, originalEmail],
  )
  useUnsavedChanges(isDirty)

  useEffect(() => { onDirtyChange?.(isDirty) }, [isDirty, onDirtyChange])

  // Fetch profile from backend (phone + email may differ from JWT session)
  const fetchProfile = () => {
    fetch('/api/auth-proxy/profile')
      .then((res) => res.json())
      .then((res) => {
        if (res.data?.name) {
          setName(res.data.name)
          setOriginalName(res.data.name)
        }
        if (res.data?.phone) {
          setPhone(res.data.phone)
          setOriginalPhone(res.data.phone)
        } else {
          setPhone('')
          setOriginalPhone('')
        }
        // Use DB email as source of truth for editability
        const dbEmail = res.data?.email ?? ''
        if (dbEmail) {
          setEmail(dbEmail)
          setOriginalEmail(dbEmail)
          setCanEditEmail(false)
        } else {
          setCanEditEmail(true)
        }
      })
      .catch(() => {})
  }

  // Fetch on mount
  useEffect(() => { fetchProfile() }, [])

  // Re-fetch when user comes back to this tab (e.g. after admin changes data)
  useEffect(() => {
    const handleFocus = () => {
      if (!isEditing) fetchProfile()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [isEditing])

  const t = {
    nameLabel: locale === 'th' ? 'ชื่อ' : 'Name',
    phoneLabel: locale === 'th' ? 'เบอร์โทร' : 'Phone',
    emailLabel: locale === 'th' ? 'อีเมล' : 'Email',
    save: locale === 'th' ? 'บันทึก' : 'Save',
    saving: locale === 'th' ? 'กำลังบันทึก...' : 'Saving...',
    nameRequired: locale === 'th' ? 'กรุณากรอกชื่อ' : 'Name is required',
    nameTooLong: locale === 'th' ? 'ชื่อต้องไม่เกิน 100 ตัวอักษร' : 'Name must be 100 characters or less',
    phoneInvalid: locale === 'th' ? 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก' : 'Phone must be 10 digits',
    emailInvalid: locale === 'th' ? 'รูปแบบอีเมลไม่ถูกต้อง' : 'Invalid email format',
    emailInUse: locale === 'th' ? 'อีเมลนี้ถูกใช้งานแล้ว' : 'This email is already in use',
    emailAlreadySet: locale === 'th' ? 'ไม่สามารถเปลี่ยนอีเมลได้' : 'Email cannot be changed',
    emailPlaceholder: locale === 'th' ? 'กรอกอีเมลของคุณ' : 'Enter your email',
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
    setEmail(originalEmail)
    setErrors({})
    setIsEditing(false)
  }

  const doSave = async (data: z.infer<typeof profileSchema>) => {
    setSaving(true)
    try {
      const body: Record<string, string | undefined> = {
        name: data.name,
        phone: data.phone || undefined,
      }
      if (canEditEmail && data.email) {
        body.email = data.email
      }

      const res = await fetch('/api/auth-proxy/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        await onUpdate({ name: data.name })
        setOriginalName(data.name)
        setOriginalPhone(data.phone || '')
        if (canEditEmail && data.email) {
          setOriginalEmail(data.email)
          setCanEditEmail(false)
        }
        setIsEditing(false)
        useAlertStore.getState().showAlert('success', t.successTitle, t.successMsg)
      } else {
        const err = await res.json().catch(() => null)
        const msg = err?.message ?? ''
        if (msg.includes('already in use')) {
          useAlertStore.getState().showAlert('error', t.emailInUse)
        } else if (msg.includes('already set')) {
          useAlertStore.getState().showAlert('error', t.emailAlreadySet)
        } else {
          useAlertStore.getState().showAlert('error', t.errorMsg)
        }
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

    const result = profileSchema.safeParse({ name, phone, email })
    if (!result.success) {
      const errs: Record<string, string> = {}
      result.error.issues.forEach((i) => {
        const f = i.path[0] as string
        if (!errs[f]) {
          if (f === 'phone') errs[f] = t.phoneInvalid
          else if (f === 'email') errs[f] = t.emailInvalid
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

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {t.emailLabel}
        </label>
        {canEditEmail ? (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors({}) }}
              className={inputCls('email')}
              placeholder={t.emailPlaceholder}
              autoComplete="email"
              maxLength={255}
              disabled={!isEditing}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </>
        ) : (
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-2.5 border border-neutral-100 text-sm text-neutral-400 bg-neutral-50"
          />
        )}
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
          className="px-6 py-2.5 bg-neutral-800 text-sm font-medium text-white hover:bg-neutral-700 transition-all"
        >
          <i className="fa-solid fa-pen mr-2 text-xs" />
          {t.editBtn}
        </button>
      )}
    </form>
  )
}
