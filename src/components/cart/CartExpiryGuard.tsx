'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useCart } from '@/lib/store'

const TWELVE_HOURS = 12 * 60 * 60 * 1000
const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000

/**
 * ตรวจสอบ cart expiry ตอน mount:
 * - member → เก็บไว้ 48 ชม.
 * - guest  → เก็บไว้ 12 ชม.
 */
export default function CartExpiryGuard() {
  const { status } = useSession()

  useEffect(() => {
    if (status === 'loading') return

    const { items, updatedAt, clear, refreshTimestamp } = useCart.getState()
    if (items.length === 0) return

    const age = Date.now() - updatedAt

    if (status === 'authenticated') {
      if (age > FORTY_EIGHT_HOURS) {
        clear()
      } else {
        refreshTimestamp()
      }
    } else {
      if (age > TWELVE_HOURS) {
        clear()
      }
    }
  }, [status])

  return null
}
