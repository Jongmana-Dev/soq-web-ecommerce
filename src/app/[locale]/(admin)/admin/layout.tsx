import type { Metadata } from 'next'
import AdminShell from '@/components/admin/AdminShell'
import AlertToast from '@/components/ui/AlertToast'

export const metadata: Metadata = {
  title: 'Admin | SOQ',
  robots: 'noindex, nofollow',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminShell>{children}</AdminShell>
      <AlertToast />
    </>
  )
}
