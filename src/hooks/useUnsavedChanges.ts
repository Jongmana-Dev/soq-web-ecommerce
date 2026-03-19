'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAlertStore } from '@/lib/alert-store'

const CONFIRM_TITLE = 'ข้อมูลยังไม่ได้บันทึก'
const CONFIRM_MESSAGE = 'คุณมีข้อมูลที่ยังไม่ได้บันทึก ต้องการออกโดยไม่บันทึกหรือไม่?'
const CONFIRM_OK = 'ออกโดยไม่บันทึก'
const CONFIRM_CANCEL = 'กลับไปแก้ไข'

/**
 * Show the unsaved-changes confirm dialog.
 * Returns a Promise that resolves to `true` if user confirms (discard), `false` if cancel.
 */
export function confirmUnsaved(): Promise<boolean> {
  return new Promise((resolve) => {
    useAlertStore.getState().showConfirm({
      title: CONFIRM_TITLE,
      message: CONFIRM_MESSAGE,
      confirmText: CONFIRM_OK,
      cancelText: CONFIRM_CANCEL,
      variant: 'info',
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    })
  })
}

/**
 * Hook that warns the user when they try to leave a page with unsaved changes.
 *
 * Handles:
 * - Browser tab close / reload (`beforeunload`)
 * - Browser back/forward buttons (`popstate`)
 * - Click on links that navigate away (`<a>`, `<Link>`)
 */
export function useUnsavedChanges(isDirty: boolean) {
  const isDirtyRef = useRef(isDirty)
  isDirtyRef.current = isDirty

  // --- beforeunload: tab close / reload ---
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  // --- popstate: browser back/forward ---
  useEffect(() => {
    const handler = () => {
      if (!isDirtyRef.current) return

      history.pushState(null, '', window.location.href)

      setTimeout(() => {
        useAlertStore.getState().showConfirm({
          title: CONFIRM_TITLE,
          message: CONFIRM_MESSAGE,
          confirmText: CONFIRM_OK,
          cancelText: CONFIRM_CANCEL,
          variant: 'info',
          onConfirm: () => {
            isDirtyRef.current = false
            history.back()
          },
        })
      }, 0)
    }

    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  // --- Click intercept: links that navigate away ---
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!isDirtyRef.current) return

      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Skip hash links, external links, same page
      if (href.startsWith('#')) return
      if (href.startsWith('http') && !href.startsWith(window.location.origin)) return
      if (href === window.location.pathname) return

      // Prevent navigation
      e.preventDefault()
      e.stopPropagation()

      setTimeout(() => {
        useAlertStore.getState().showConfirm({
          title: CONFIRM_TITLE,
          message: CONFIRM_MESSAGE,
          confirmText: CONFIRM_OK,
          cancelText: CONFIRM_CANCEL,
          variant: 'info',
          onConfirm: () => {
            isDirtyRef.current = false
            window.location.href = anchor.href
          },
        })
      }, 0)
    }

    // Use capture phase to intercept before Next.js Link handles the click
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [])

  const resetDirty = useCallback(() => {
    isDirtyRef.current = false
  }, [])

  return { resetDirty }
}
