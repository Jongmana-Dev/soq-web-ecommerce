'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { adminFetch } from '@/lib/admin-api'

export default function ChangePasswordPage() {
  const { update: updateSession } = useSession()
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน')
      return
    }

    setLoading(true)
    try {
      await adminFetch('change-password', {
        method: 'POST',
        body: { new_password: newPassword, confirm_password: confirmPassword },
      })

      // Refresh the JWT so must_change_password becomes false
      await updateSession()

      router.replace('/th/admin')
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#007AFF]/10 flex items-center justify-center">
              <i className="fa-solid fa-key text-2xl text-[#007AFF]" />
            </div>
            <h1 className="text-xl font-semibold text-[#1D1D1F] tracking-tight">
              ตั้งรหัสผ่านใหม่
            </h1>
            <p className="text-sm text-[#86868B] mt-2">
              กรุณาตั้งรหัสผ่านใหม่เพื่อความปลอดภัย
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-1.5">
                รหัสผ่านใหม่
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F5F5F7] border border-[#D2D2D7] rounded-[10px] text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20"
                placeholder="อย่างน้อย 8 ตัวอักษร"
                minLength={8}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-1.5">
                ยืนยันรหัสผ่าน
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F5F5F7] border border-[#D2D2D7] rounded-[10px] text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20"
                placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                minLength={8}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl">
                <p className="text-sm text-[#FF3B30]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#007AFF] hover:bg-[#0056CC] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-[10px] transition-colors"
            >
              {loading ? (
                <i className="fa-solid fa-spinner fa-spin mr-2" />
              ) : null}
              ตั้งรหัสผ่าน
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
