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
 * - Next.js client-side navigation (`pushState` / `replaceState`)
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

  // --- Intercept pushState / replaceState for SPA navigation ---
  useEffect(() => {
    const originalPushState = history.pushState.bind(history)
    const originalReplaceState = history.replaceState.bind(history)

    const intercept = (
      original: typeof history.pushState,
      data: unknown,
      unused: string,
      url?: string | URL | null,
    ) => {
      if (!isDirtyRef.current) {
        return original(data, unused, url)
      }

      useAlertStore.getState().showConfirm({
        title: CONFIRM_TITLE,
        message: CONFIRM_MESSAGE,
        confirmText: CONFIRM_OK,
        cancelText: CONFIRM_CANCEL,
        variant: 'info',
        onConfirm: () => {
          isDirtyRef.current = false
          original(data, unused, url)
          window.dispatchEvent(new PopStateEvent('popstate'))
        },
      })
    }

    history.pushState = function (data, unused, url) {
      intercept(originalPushState, data, unused, url)
    }

    history.replaceState = function (data, unused, url) {
      intercept(originalReplaceState, data, unused, url)
    }

    return () => {
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [])

  // --- popstate: browser back/forward ---
  useEffect(() => {
    const handler = (e: PopStateEvent) => {
      if (!isDirtyRef.current) return

      e.preventDefault()
      history.pushState(null, '', window.location.href)

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
    }

    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  const resetDirty = useCallback(() => {
    isDirtyRef.current = false
  }, [])

  return { resetDirty }
}
