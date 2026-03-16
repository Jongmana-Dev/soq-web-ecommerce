'use client'

import { useEffect, useState } from 'react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import DataTable, { type Column } from '@/components/admin/DataTable'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { adminFetch } from '@/lib/admin-api'
import type { Member } from '@/types/admin'

function formatThaiDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function ProviderBadge({ provider }: { provider: string }) {
  const map: Record<string, { label: string; icon: string; color: string }> = {
    google: { label: 'Google', icon: 'fa-brands fa-google', color: 'text-[#007AFF] bg-[#007AFF]/10 border-[#007AFF]/20' },
    line: { label: 'LINE', icon: 'fa-brands fa-line', color: 'text-[#34C759] bg-[#34C759]/10 border-[#34C759]/20' },
  }
  const p = map[provider] ?? { label: provider, icon: 'fa-solid fa-user', color: 'text-[#86868B] bg-[#86868B]/10 border-[#86868B]/20' }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded border ${p.color}`}>
      <i className={p.icon} />
      {p.label}
    </span>
  )
}

function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border text-[#34C759] bg-[#34C759]/10 border-[#34C759]/20">
      ใช้งาน
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border text-[#FF3B30] bg-[#FF3B30]/10 border-[#FF3B30]/20">
      ปิดใช้งาน
    </span>
  )
}

function AddressBlock({ label, address }: { label: string; address: Member['primary_address'] }) {
  if (!address) return <p className="text-sm text-[#86868B]">-</p>

  return (
    <div>
      <h4 className="text-sm font-medium text-[#1D1D1F]/80 mb-1">{label}</h4>
      <div className="text-sm text-[#86868B] space-y-0.5">
        <p>{address.recipient_name} ({address.phone})</p>
        <p>{address.address_line}</p>
        <p>
          {[address.subdistrict, address.district, address.province].filter(Boolean).join(' ')}
          {address.postal_code && ` ${address.postal_code}`}
        </p>
      </div>
    </div>
  )
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Member | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const fetchMembers = () => {
    setLoading(true)
    adminFetch<Member[]>('members')
      .then(setMembers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleToggleActive = async (member: Member) => {
    setToggling(member.id)
    try {
      const updated = await adminFetch<Member>(`members/${member.id}/toggle-active`, {
        method: 'PATCH',
        body: { is_active: !member.is_active },
      })
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, is_active: updated.is_active } : m)),
      )
      if (selected?.id === member.id) {
        setSelected((prev) => prev ? { ...prev, is_active: updated.is_active } : null)
      }
    } catch {
      // silently fail
    } finally {
      setToggling(null)
    }
  }

  const columns: Column<Member>[] = [
    {
      key: 'name',
      label: 'ชื่อสมาชิก',
      render: (m) => (
        <div className="flex items-center gap-3">
          {m.image ? (
            <img src={m.image} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#E8E8ED] flex items-center justify-center">
              <i className="fa-solid fa-user text-xs text-[#86868B]" />
            </div>
          )}
          <div>
            <p className="text-sm text-[#1D1D1F]">{m.name || '-'}</p>
            <p className="text-xs text-[#86868B]">{m.email || '-'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'เบอร์โทร',
      render: (m) => <span className="text-[#1D1D1F]/80">{m.phone || '-'}</span>,
    },
    {
      key: 'registered_provider',
      label: 'ผู้ให้บริการ',
      render: (m) => <ProviderBadge provider={m.registered_provider} />,
    },
    {
      key: 'is_active',
      label: 'สถานะ',
      render: (m) => <ActiveBadge active={m.is_active} />,
    },
    {
      key: 'created_at',
      label: 'วันที่สมัคร',
      render: (m) => <span className="text-[#86868B]">{formatThaiDate(m.created_at)}</span>,
    },
  ]

  return (
    <>
      <AdminPageHeader title="สมาชิก" description="จัดการสมาชิกทั้งหมด" />

      <DataTable
        columns={columns}
        data={members}
        loading={loading}
        searchable
        searchPlaceholder="ค้นหาชื่อ, อีเมล หรือเบอร์โทร..."
        searchKeys={['name', 'email', 'phone']}
        onRowClick={(m) => setSelected(m)}
        actions={(m) => (
          <button
            onClick={() => handleToggleActive(m)}
            disabled={toggling === m.id}
            className={`text-xs px-2.5 py-1 rounded border transition-colors ${
              m.is_active
                ? 'text-[#FF3B30] border-[#FF3B30]/20 hover:bg-[#FF3B30]/10'
                : 'text-[#34C759] border-[#34C759]/20 hover:bg-[#34C759]/10'
            } disabled:opacity-50`}
          >
            {toggling === m.id ? (
              <i className="fa-solid fa-spinner fa-spin" />
            ) : m.is_active ? (
              'ปิดใช้งาน'
            ) : (
              'เปิดใช้งาน'
            )}
          </button>
        )}
      />

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg bg-white border-[#E8E8ED] text-[#1D1D1F]">
          <DialogHeader>
            <DialogTitle>รายละเอียดสมาชิก</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-6 mt-2">
              {/* Profile */}
              <div className="flex items-center gap-4">
                {selected.image ? (
                  <img src={selected.image} alt="" className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#E8E8ED] flex items-center justify-center">
                    <i className="fa-solid fa-user text-xl text-[#86868B]" />
                  </div>
                )}
                <div>
                  <p className="text-base font-medium">{selected.name || '-'}</p>
                  <p className="text-sm text-[#86868B]">{selected.email || '-'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ProviderBadge provider={selected.registered_provider} />
                    <ActiveBadge active={selected.is_active} />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#86868B] mb-0.5">เบอร์โทร</p>
                  <p className="text-[#1D1D1F]">{selected.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-[#86868B] mb-0.5">วันที่สมัคร</p>
                  <p className="text-[#1D1D1F]">{formatThaiDate(selected.created_at)}</p>
                </div>
              </div>

              {/* Addresses */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#1D1D1F] border-b border-[#E8E8ED] pb-1">
                  ที่อยู่
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <AddressBlock label="ที่อยู่หลัก" address={selected.primary_address} />
                  <AddressBlock label="ที่อยู่สำรอง" address={selected.secondary_address} />
                </div>
              </div>

              {/* Tax Info */}
              {selected.tax_info && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#1D1D1F] border-b border-[#E8E8ED] pb-1">
                    ข้อมูลใบกำกับภาษี
                  </h3>
                  <div className="text-sm text-[#86868B] space-y-1">
                    <p>
                      <span className="text-[#86868B]">ชื่อ:</span>{' '}
                      {selected.tax_info.name}
                    </p>
                    <p>
                      <span className="text-[#86868B]">เลขประจำตัวผู้เสียภาษี:</span>{' '}
                      {selected.tax_info.tax_id}
                    </p>
                    <p>
                      <span className="text-[#86868B]">ที่อยู่:</span>{' '}
                      {selected.tax_info.address}
                    </p>
                    {selected.tax_info.note && (
                      <p>
                        <span className="text-[#86868B]">หมายเหตุ:</span>{' '}
                        {selected.tax_info.note}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end pt-2 border-t border-[#E8E8ED]">
                <button
                  onClick={() => handleToggleActive(selected)}
                  disabled={toggling === selected.id}
                  className={`text-sm px-4 py-2 rounded border transition-colors ${
                    selected.is_active
                      ? 'text-[#FF3B30] border-[#FF3B30]/20 hover:bg-[#FF3B30]/10'
                      : 'text-[#34C759] border-[#34C759]/20 hover:bg-[#34C759]/10'
                  } disabled:opacity-50`}
                >
                  {toggling === selected.id ? (
                    <i className="fa-solid fa-spinner fa-spin mr-1" />
                  ) : null}
                  {selected.is_active ? 'ปิดใช้งานสมาชิก' : 'เปิดใช้งานสมาชิก'}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
