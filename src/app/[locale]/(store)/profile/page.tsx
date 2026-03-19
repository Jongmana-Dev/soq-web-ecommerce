'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import UserAvatar from '@/components/ui/UserAvatar'
import { motion } from 'framer-motion'
import ProfileForm from '@/components/profile/ProfileForm'
import FullscreenLoading from '@/components/ui/FullscreenLoading'
import AddressList from '@/components/profile/AddressList'
import TaxInfoForm from '@/components/profile/TaxInfoForm'
import Footer from '@/components/sections/Footer'
import { confirmUnsaved } from '@/hooks/useUnsavedChanges'

type Tab = 'personal' | 'addresses' | 'tax-info'

const FEATURE_TAX_INFO = process.env.NEXT_PUBLIC_FEATURE_TAX_INFO === 'true'

const validTabs: Tab[] = FEATURE_TAX_INFO
  ? ['personal', 'addresses', 'tax-info']
  : ['personal', 'addresses']

export default function ProfilePage() {
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status, update } = useSession()

  const tabParam = searchParams.get('tab') as Tab | null
  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam && validTabs.includes(tabParam) ? tabParam : 'personal'
  )

  // Track dirty state from child forms
  const dirtyRef = useRef(false)
  const handleDirtyChange = useCallback((dirty: boolean) => {
    dirtyRef.current = dirty
  }, [])

  const handleTabChange = useCallback(async (tab: Tab) => {
    if (tab === activeTab) return

    if (dirtyRef.current) {
      const discard = await confirmUnsaved()
      if (!discard) return
    }

    setActiveTab(tab)
  }, [activeTab])

  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const t = {
    title: locale === 'th' ? 'โปรไฟล์' : 'Profile',
    personal: locale === 'th' ? 'ข้อมูลส่วนตัว' : 'Personal Info',
    addresses: locale === 'th' ? 'ที่อยู่จัดส่ง' : 'Addresses',
    taxInfo: locale === 'th' ? 'ใบกำกับภาษี' : 'Tax Invoice',
    loading: locale === 'th' ? 'กำลังโหลด...' : 'Loading...',
  }

  if (status === 'loading') {
    return <FullscreenLoading />
  }

  if (status === 'unauthenticated') {
    router.replace('/')
    return null
  }

  const user = session?.user
  const tabs: { key: Tab; label: string }[] = [
    { key: 'personal', label: t.personal },
    { key: 'addresses', label: t.addresses },
    ...(FEATURE_TAX_INFO ? [{ key: 'tax-info' as Tab, label: t.taxInfo }] : []),
  ]

  return (
    <>
      <main className="min-h-screen bg-neutral-50 pt-[76px]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <UserAvatar
              src={user?.image}
              name={user?.name}
              size={64}
            />
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{user?.name ?? t.title}</h1>
              {user?.email && (
                <p className="text-sm text-neutral-500">{user.email}</p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="relative flex gap-0 border-b border-neutral-200 mb-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`relative px-4 sm:px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-neutral-900'
                    : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="profile-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-white border border-neutral-200 p-6 sm:p-8">
            {activeTab === 'personal' && (
              <ProfileForm
                session={session}
                onUpdate={update}
                locale={locale}
                onDirtyChange={handleDirtyChange}
              />
            )}
            {activeTab === 'addresses' && (
              <AddressList locale={locale} onDirtyChange={handleDirtyChange} />
            )}
            {FEATURE_TAX_INFO && activeTab === 'tax-info' && (
              <TaxInfoForm locale={locale} onDirtyChange={handleDirtyChange} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
