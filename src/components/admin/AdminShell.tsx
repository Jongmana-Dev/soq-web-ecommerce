'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import Link from 'next/link'

type MenuItem = { label: string; path: string; icon: string }
type MenuGroup = { group: string; items: MenuItem[] }

const menuGroups: MenuGroup[] = [
  {
    group: 'ภาพรวม',
    items: [
      { label: 'แดชบอร์ด', path: '/admin', icon: 'fa-solid fa-chart-line' },
    ],
  },
  {
    group: 'การขาย',
    items: [
      { label: 'คำสั่งซื้อ', path: '/admin/orders', icon: 'fa-solid fa-receipt' },
      { label: 'สินค้า', path: '/admin/products', icon: 'fa-solid fa-box' },
      { label: 'สมาชิก', path: '/admin/members', icon: 'fa-solid fa-users' },
    ],
  },
  {
    group: 'จัดการเนื้อหา (CMS)',
    items: [
      { label: 'รีวิวลูกค้า', path: '/admin/reviews', icon: 'fa-solid fa-star' },
      { label: 'ขั้นตอนการใช้', path: '/admin/usage-steps', icon: 'fa-solid fa-list-ol' },
      { label: 'ใบรับรองมาตรฐาน', path: '/admin/certifications', icon: 'fa-solid fa-certificate' },
      { label: 'คำถามที่พบบ่อย', path: '/admin/faqs', icon: 'fa-solid fa-circle-question' },
      { label: 'โลโก้ลูกค้า', path: '/admin/client-logos', icon: 'fa-solid fa-handshake' },
      { label: 'เงื่อนไข/นโยบาย', path: '/admin/terms', icon: 'fa-solid fa-file-contract' },
    ],
  },
  {
    group: 'ตั้งค่าระบบ',
    items: [
      { label: 'ตั้งค่าเว็บ', path: '/admin/settings', icon: 'fa-solid fa-gear' },
      { label: 'บัญชีรับเงิน', path: '/admin/payment-accounts', icon: 'fa-solid fa-building-columns' },
      { label: 'ค่าจัดส่ง', path: '/admin/shipping', icon: 'fa-solid fa-truck' },
    ],
  },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const prefix = `/${locale}`

  // Force redirect to change-password page if must_change_password
  useEffect(() => {
    if (
      status === 'authenticated' &&
      (session?.user as any)?.role === 'admin' &&
      (session?.user as any)?.must_change_password === true &&
      !pathname.endsWith('/admin/change-password')
    ) {
      router.replace(`${prefix}/admin/change-password` as any)
    }
  }, [status, session, pathname, router, prefix])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <i className="fa-solid fa-spinner fa-spin text-2xl text-[#86868B]" />
      </div>
    )
  }

  if ((session?.user as any)?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#FF3B30]/10 flex items-center justify-center">
            <i className="fa-solid fa-lock text-2xl text-[#FF3B30]" />
          </div>
          <h1 className="text-xl font-semibold text-[#1D1D1F] mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-sm text-[#86868B] mb-6">คุณไม่มีสิทธิ์เข้าถึงหน้า Admin</p>
          <Link
            href={`/${locale}`}
            className="inline-block px-6 py-2.5 bg-[#007AFF] text-sm text-white rounded-[10px] hover:bg-[#0056CC] transition-colors"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    )
  }

  const isActive = (path: string) => {
    const href = `${prefix}${path}`
    if (path === '/admin') return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — frosted glass light */}
      <aside
        className={`fixed z-50 inset-y-0 left-0 w-64 bg-white/80 backdrop-blur-xl border-r border-black/[0.06] transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-black/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-[#007AFF] flex items-center justify-center">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          <span className="font-semibold text-[#1D1D1F] tracking-tight">SOQ Admin</span>
        </div>

        {/* Menu */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          {menuGroups.map((group) => (
            <div key={group.group}>
              <p className="px-3 pt-4 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-[#86868B]">
                {group.group}
              </p>
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  href={`${prefix}${item.path}` as any}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] transition-all ${
                    isActive(item.path)
                      ? 'bg-[#007AFF]/10 text-[#007AFF] font-medium'
                      : 'text-[#1D1D1F]/70 hover:text-[#1D1D1F] hover:bg-black/[0.04]'
                  }`}
                >
                  <i className={`${item.icon} w-5 text-center text-[16px]`} />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* User section at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-black/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F5F5F7] flex items-center justify-center">
              <i className="fa-solid fa-user text-xs text-[#86868B]" />
            </div>
            <span className="text-[15px] text-[#1D1D1F] truncate">{session?.user?.name ?? 'Admin'}</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar — frosted glass */}
        <header className="h-16 flex items-center gap-4 px-6 lg:px-8 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors"
          >
            <i className="fa-solid fa-bars text-lg" />
          </button>
          <div className="flex-1" />
          <span className="text-[15px] text-[#86868B]">
            {session?.user?.name ?? 'Admin'}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
