'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { adminFetch } from '@/lib/admin-api'
import { useAlertStore } from '@/lib/alert-store'
import { useDeleteConfirm } from '@/components/admin/DeleteConfirm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import DataTable, { type Column } from '@/components/admin/DataTable'
import FormDialog from '@/components/admin/FormDialog'
import FileUpload from '@/components/admin/FileUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { clientLogoSchema, type ClientLogoFormData } from '@/lib/admin-schemas'
import type { ClientLogo } from '@/types/admin'

const emptyForm: ClientLogoFormData = {
  name: '',
  logo_url: '',
  website_url: null,
  sort_order: 0,
}

export default function ClientLogosPage() {
  const [items, setItems] = useState<ClientLogo[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ClientLogo | null>(null)
  const [form, setForm] = useState<ClientLogoFormData>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof ClientLogoFormData, string>>>({})

  const showAlert = useAlertStore((s) => s.showAlert)
  const deleteConfirm = useDeleteConfirm()

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminFetch<ClientLogo[]>('client-logos')
      setItems(data)
    } catch {
      showAlert('error', 'โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }, [showAlert])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setDialogOpen(true)
  }

  const openEdit = (item: ClientLogo) => {
    setEditing(item)
    setForm({
      name: item.name,
      logo_url: item.logo_url,
      website_url: item.website_url || null,
      sort_order: item.sort_order,
    })
    setErrors({})
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const result = clientLogoSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ClientLogoFormData, string>> = {}
      result.error.errors.forEach((e) => {
        const key = e.path[0] as keyof ClientLogoFormData
        if (!fieldErrors[key]) fieldErrors[key] = e.message
      })
      setErrors(fieldErrors)
      return
    }

    try {
      if (editing) {
        await adminFetch(`client-logos/${editing.id}`, { method: 'PUT', body: result.data })
        showAlert('success', 'แก้ไขโลโก้สำเร็จ')
      } else {
        await adminFetch('client-logos', { method: 'POST', body: result.data })
        showAlert('success', 'เพิ่มโลโก้สำเร็จ')
      }
      setDialogOpen(false)
      loadItems()
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ')
    }
  }

  const handleDelete = (item: ClientLogo) => {
    deleteConfirm({
      itemName: item.name,
      onConfirm: async () => {
        try {
          await adminFetch(`client-logos/${item.id}`, { method: 'DELETE' })
          showAlert('success', 'ลบโลโก้สำเร็จ')
          loadItems()
        } catch {
          showAlert('error', 'ลบไม่สำเร็จ')
        }
      },
    })
  }

  const columns: Column<ClientLogo>[] = [
    {
      key: 'logo_url',
      label: 'โลโก้',
      className: 'w-24',
      render: (item) => (
        <div className="w-16 h-10 relative rounded-lg overflow-hidden bg-[#F5F5F7] border border-[#D2D2D7] flex items-center justify-center">
          {item.logo_url ? (
            <Image
              src={item.logo_url}
              alt={item.name}
              width={64}
              height={40}
              className="object-contain w-full h-full p-1"
              unoptimized
            />
          ) : (
            <i className="fa-solid fa-image text-[#86868B]" />
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'ชื่อลูกค้า',
      render: (item) => (
        <span className="font-medium text-[#1D1D1F]">{item.name}</span>
      ),
    },
    {
      key: 'website_url',
      label: 'เว็บไซต์',
      render: (item) =>
        item.website_url ? (
          <a
            href={item.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#007AFF] text-sm hover:underline truncate max-w-[200px] block"
          >
            {item.website_url}
          </a>
        ) : (
          <span className="text-[#86868B] text-sm">-</span>
        ),
    },
    {
      key: 'sort_order',
      label: 'ลำดับ',
      className: 'w-20 text-center',
    },
  ]

  return (
    <>
      <AdminPageHeader
        title="โลโก้ลูกค้า"
        description="จัดการโลโก้ลูกค้าที่แสดงเป็นแถบแบนเนอร์วิ่งบนหน้าเว็บไซต์"
        action={
          <Button onClick={openCreate} className="bg-[#007AFF] hover:bg-[#0056CC]">
            <i className="fa-solid fa-plus mr-2" />
            เพิ่มโลโก้
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        searchable
        searchPlaceholder="ค้นหาชื่อลูกค้า..."
        searchKeys={['name']}
        actions={(item) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openEdit(item)}
              className="text-[#86868B] hover:text-[#1D1D1F]"
            >
              <i className="fa-solid fa-pen-to-square" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(item)}
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
        title={editing ? 'แก้ไขโลโก้ลูกค้า' : 'เพิ่มโลโก้ลูกค้าใหม่'}
        onSave={handleSave}
      >
        <div className="space-y-1">
          <Label>ชื่อลูกค้า *</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="เช่น บริษัท ABC จำกัด"
            className="bg-[#F5F5F7] border-[#D2D2D7]"
          />
          {errors.name && <p className="text-sm text-[#FF3B30]">{errors.name}</p>}
        </div>

        <div className="space-y-1">
          <Label>โลโก้ *</Label>
          <FileUpload
            value={form.logo_url}
            onChange={(url) => setForm({ ...form, logo_url: url })}
            accept="image/*"
          />
          {errors.logo_url && <p className="text-sm text-[#FF3B30]">{errors.logo_url}</p>}
        </div>

        <div className="space-y-1">
          <Label>เว็บไซต์ (ไม่บังคับ)</Label>
          <Input
            value={form.website_url ?? ''}
            onChange={(e) =>
              setForm({ ...form, website_url: e.target.value || null })
            }
            placeholder="https://example.com"
            className="bg-[#F5F5F7] border-[#D2D2D7]"
          />
          {errors.website_url && <p className="text-sm text-[#FF3B30]">{errors.website_url}</p>}
        </div>

        <div className="space-y-1">
          <Label>ลำดับการแสดง</Label>
          <Input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            className="bg-[#F5F5F7] border-[#D2D2D7]"
          />
          {errors.sort_order && <p className="text-sm text-[#FF3B30]">{errors.sort_order}</p>}
        </div>
      </FormDialog>
    </>
  )
}
