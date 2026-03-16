'use client'

import { useEffect, useState, useCallback } from 'react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import DataTable, { type Column } from '@/components/admin/DataTable'
import FormDialog from '@/components/admin/FormDialog'
import { useDeleteConfirm } from '@/components/admin/DeleteConfirm'
import { adminFetch } from '@/lib/admin-api'
import { useAlertStore } from '@/lib/alert-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { paymentAccountSchema } from '@/lib/admin-schemas'
import type { PaymentAccount } from '@/types/admin'
import type { PaymentAccountFormData } from '@/lib/admin-schemas'

const emptyForm: PaymentAccountFormData = {
  type: 'bank_transfer',
  account_number: '',
  account_name: '',
  bank_name: null,
  bank_branch: null,
  is_active: true,
}

export default function PaymentAccountsPage() {
  const [accounts, setAccounts] = useState<PaymentAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PaymentAccountFormData>({ ...emptyForm })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const showAlert = useAlertStore((s) => s.showAlert)
  const deleteConfirm = useDeleteConfirm()

  const fetchAccounts = useCallback(() => {
    setLoading(true)
    adminFetch<PaymentAccount[]>('payment-accounts')
      .then(setAccounts)
      .catch(() => showAlert('error', 'ไม่สามารถโหลดข้อมูลบัญชีได้'))
      .finally(() => setLoading(false))
  }, [showAlert])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm })
    setErrors({})
    setDialogOpen(true)
  }

  const openEdit = (account: PaymentAccount) => {
    setEditingId(account.id)
    setForm({
      type: account.type,
      account_number: account.account_number,
      account_name: account.account_name,
      bank_name: account.bank_name,
      bank_branch: account.bank_branch,
      is_active: account.is_active,
    })
    setErrors({})
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const result = paymentAccountSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((e) => {
        const key = e.path[0] as string
        fieldErrors[key] = e.message
      })
      setErrors(fieldErrors)
      return
    }

    const body = { ...result.data }
    // Clear bank fields for promptpay type
    if (body.type === 'promptpay') {
      body.bank_name = null
      body.bank_branch = null
    }

    try {
      if (editingId) {
        const updated = await adminFetch<PaymentAccount>(`payment-accounts/${editingId}`, {
          method: 'PUT',
          body,
        })
        setAccounts((prev) => prev.map((a) => (a.id === editingId ? updated : a)))
        showAlert('success', 'แก้ไขสำเร็จ')
      } else {
        const created = await adminFetch<PaymentAccount>('payment-accounts', {
          method: 'POST',
          body,
        })
        setAccounts((prev) => [...prev, created])
        showAlert('success', 'เพิ่มบัญชีสำเร็จ')
      }
      setDialogOpen(false)
    } catch (err) {
      showAlert('error', 'บันทึกไม่สำเร็จ', err instanceof Error ? err.message : undefined)
    }
  }

  const handleDelete = (account: PaymentAccount) => {
    deleteConfirm({
      itemName: account.account_name,
      onConfirm: async () => {
        try {
          await adminFetch(`payment-accounts/${account.id}`, { method: 'DELETE' })
          setAccounts((prev) => prev.filter((a) => a.id !== account.id))
          showAlert('success', 'ลบสำเร็จ')
        } catch (err) {
          showAlert('error', 'ลบไม่สำเร็จ', err instanceof Error ? err.message : undefined)
        }
      },
    })
  }

  const toggleActive = async (account: PaymentAccount) => {
    try {
      const updated = await adminFetch<PaymentAccount>(`payment-accounts/${account.id}`, {
        method: 'PATCH',
        body: { is_active: !account.is_active },
      })
      setAccounts((prev) => prev.map((a) => (a.id === account.id ? updated : a)))
      showAlert('success', updated.is_active ? 'เปิดใช้งานแล้ว' : 'ปิดใช้งานแล้ว')
    } catch (err) {
      showAlert('error', 'อัปเดตไม่สำเร็จ', err instanceof Error ? err.message : undefined)
    }
  }

  const columns: Column<PaymentAccount>[] = [
    {
      key: 'type',
      label: 'ประเภท',
      render: (a) => (
        <span className="text-[#1D1D1F]">
          {a.type === 'bank_transfer' ? 'ธนาคาร' : 'พร้อมเพย์'}
        </span>
      ),
    },
    { key: 'account_name', label: 'ชื่อบัญชี' },
    { key: 'account_number', label: 'เลขบัญชี' },
    {
      key: 'bank_name',
      label: 'ธนาคาร',
      render: (a) => (
        <span className="text-[#1D1D1F]/80">{a.bank_name ?? '-'}</span>
      ),
    },
    {
      key: 'is_active',
      label: 'สถานะ',
      render: (a) => (
        <Switch
          checked={a.is_active}
          onCheckedChange={() => toggleActive(a)}
        />
      ),
    },
  ]

  return (
    <>
      <AdminPageHeader
        title="บัญชีรับเงิน"
        description="จัดการบัญชีธนาคารและพร้อมเพย์"
        action={
          <Button onClick={openCreate} className="bg-[#007AFF] text-white hover:bg-[#0056CC]">
            <i className="fa-solid fa-plus mr-2" />
            เพิ่มบัญชี
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={accounts}
        loading={loading}
        searchable
        searchPlaceholder="ค้นหาชื่อบัญชี..."
        searchKeys={['account_name', 'account_number']}
        actions={(account) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEdit(account)}
              className="text-[#86868B] hover:text-[#1D1D1F]"
            >
              <i className="fa-solid fa-pen-to-square" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(account)}
              className="text-[#FF3B30] hover:text-[#FF3B30]/80"
            >
              <i className="fa-solid fa-trash" />
            </Button>
          </div>
        )}
      />

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingId ? 'แก้ไขบัญชี' : 'เพิ่มบัญชี'}
        onSave={handleSave}
      >
        {/* ประเภท */}
        <div className="space-y-1.5">
          <Label className="text-[#1D1D1F]/80">ประเภท</Label>
          <Select
            value={form.type}
            onValueChange={(val: 'bank_transfer' | 'promptpay') =>
              setForm((prev) => ({ ...prev, type: val }))
            }
          >
            <SelectTrigger className="w-full bg-[#F5F5F7] border-[#D2D2D7] text-[#1D1D1F]">
              <SelectValue placeholder="เลือกประเภท" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank_transfer">ธนาคาร</SelectItem>
              <SelectItem value="promptpay">พร้อมเพย์</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && <p className="text-xs text-[#FF3B30]">{errors.type}</p>}
        </div>

        {/* เลขบัญชี */}
        <div className="space-y-1.5">
          <Label className="text-[#1D1D1F]/80">เลขบัญชี</Label>
          <Input
            value={form.account_number}
            onChange={(e) => setForm((prev) => ({ ...prev, account_number: e.target.value }))}
            className="bg-[#F5F5F7] border-[#D2D2D7]"
            placeholder="เลขบัญชี / หมายเลขพร้อมเพย์"
          />
          {errors.account_number && <p className="text-xs text-[#FF3B30]">{errors.account_number}</p>}
        </div>

        {/* ชื่อบัญชี */}
        <div className="space-y-1.5">
          <Label className="text-[#1D1D1F]/80">ชื่อบัญชี</Label>
          <Input
            value={form.account_name}
            onChange={(e) => setForm((prev) => ({ ...prev, account_name: e.target.value }))}
            className="bg-[#F5F5F7] border-[#D2D2D7]"
            placeholder="ชื่อเจ้าของบัญชี"
          />
          {errors.account_name && <p className="text-xs text-[#FF3B30]">{errors.account_name}</p>}
        </div>

        {/* ธนาคาร (เฉพาะ bank) */}
        {form.type === 'bank_transfer' && (
          <>
            <div className="space-y-1.5">
              <Label className="text-[#1D1D1F]/80">ชื่อธนาคาร</Label>
              <Input
                value={form.bank_name ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, bank_name: e.target.value || null }))}
                className="bg-[#F5F5F7] border-[#D2D2D7]"
                placeholder="เช่น ธนาคารกสิกรไทย"
              />
              {errors.bank_name && <p className="text-xs text-[#FF3B30]">{errors.bank_name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[#1D1D1F]/80">สาขา</Label>
              <Input
                value={form.bank_branch ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, bank_branch: e.target.value || null }))}
                className="bg-[#F5F5F7] border-[#D2D2D7]"
                placeholder="สาขาธนาคาร"
              />
              {errors.bank_branch && <p className="text-xs text-[#FF3B30]">{errors.bank_branch}</p>}
            </div>
          </>
        )}

        {/* เปิดใช้งาน */}
        <div className="flex items-center justify-between">
          <Label className="text-[#1D1D1F]/80">เปิดใช้งาน</Label>
          <Switch
            checked={form.is_active}
            onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))}
          />
        </div>
      </FormDialog>
    </>
  )
}
