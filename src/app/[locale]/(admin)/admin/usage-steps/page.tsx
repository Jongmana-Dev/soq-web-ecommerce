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
import { Textarea } from '@/components/ui/textarea'
import { usageStepSchema, type UsageStepFormData } from '@/lib/admin-schemas'
import type { UsageStep } from '@/types/admin'

const emptyForm: UsageStepFormData = {
  title_th: '',
  title_en: '',
  description_th: '',
  description_en: '',
  image: '',
  sort_order: 0,
}

export default function UsageStepsPage() {
  const [items, setItems] = useState<UsageStep[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<UsageStep | null>(null)
  const [form, setForm] = useState<UsageStepFormData>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof UsageStepFormData, string>>>({})

  const showAlert = useAlertStore((s) => s.showAlert)
  const deleteConfirm = useDeleteConfirm()

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminFetch<UsageStep[]>('usage-steps')
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

  const openEdit = (item: UsageStep) => {
    setEditing(item)
    setForm({
      title_th: item.title_th,
      title_en: item.title_en,
      description_th: item.description_th,
      description_en: item.description_en,
      image: item.image,
      sort_order: item.sort_order,
    })
    setErrors({})
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const result = usageStepSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof UsageStepFormData, string>> = {}
      result.error.errors.forEach((e) => {
        const key = e.path[0] as keyof UsageStepFormData
        if (!fieldErrors[key]) fieldErrors[key] = e.message
      })
      setErrors(fieldErrors)
      return
    }

    try {
      if (editing) {
        await adminFetch(`usage-steps/${editing.id}`, { method: 'PUT', body: result.data })
        showAlert('success', 'แก้ไขขั้นตอนสำเร็จ')
      } else {
        await adminFetch('usage-steps', { method: 'POST', body: result.data })
        showAlert('success', 'เพิ่มขั้นตอนสำเร็จ')
      }
      setDialogOpen(false)
      loadItems()
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ')
    }
  }

  const handleDelete = (item: UsageStep) => {
    deleteConfirm({
      itemName: item.title_th,
      onConfirm: async () => {
        try {
          await adminFetch(`usage-steps/${item.id}`, { method: 'DELETE' })
          showAlert('success', 'ลบขั้นตอนสำเร็จ')
          loadItems()
        } catch {
          showAlert('error', 'ลบไม่สำเร็จ')
        }
      },
    })
  }

  const columns: Column<UsageStep>[] = [
    {
      key: 'image',
      label: 'รูป',
      className: 'w-16',
      render: (item) => (
        <Image
          src={item.image}
          alt={item.title_th}
          width={40}
          height={40}
          className="rounded-lg object-cover w-10 h-10"
          unoptimized
        />
      ),
    },
    {
      key: 'title_th',
      label: 'ชื่อ (TH)',
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
        title="ขั้นตอนการใช้งาน"
        description="จัดการขั้นตอนการใช้งานที่แสดงบนเว็บไซต์"
        action={
          <Button onClick={openCreate} className="bg-[#007AFF] hover:bg-[#0056CC]">
            <i className="fa-solid fa-plus mr-2" />
            เพิ่มขั้นตอน
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        searchable
        searchPlaceholder="ค้นหาขั้นตอน..."
        searchKeys={['title_th', 'title_en']}
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
        title={editing ? 'แก้ไขขั้นตอน' : 'เพิ่มขั้นตอนใหม่'}
        onSave={handleSave}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>ชื่อ (TH) *</Label>
            <Input
              value={form.title_th}
              onChange={(e) => setForm({ ...form, title_th: e.target.value })}
              placeholder="เช่น ผสมผลิตภัณฑ์"
              className="bg-[#F5F5F7] border-[#D2D2D7]"
            />
            {errors.title_th && <p className="text-sm text-[#FF3B30]">{errors.title_th}</p>}
          </div>

          <div className="space-y-1">
            <Label>ชื่อ (EN) *</Label>
            <Input
              value={form.title_en}
              onChange={(e) => setForm({ ...form, title_en: e.target.value })}
              placeholder="e.g. Simple Mix"
              className="bg-[#F5F5F7] border-[#D2D2D7]"
            />
            {errors.title_en && <p className="text-sm text-[#FF3B30]">{errors.title_en}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <Label>รายละเอียด (TH) *</Label>
          <Textarea
            value={form.description_th}
            onChange={(e) => setForm({ ...form, description_th: e.target.value })}
            placeholder="รายละเอียดขั้นตอนภาษาไทย"
            rows={3}
            className="bg-[#F5F5F7] border-[#D2D2D7]"
          />
          {errors.description_th && <p className="text-sm text-[#FF3B30]">{errors.description_th}</p>}
        </div>

        <div className="space-y-1">
          <Label>รายละเอียด (EN) *</Label>
          <Textarea
            value={form.description_en}
            onChange={(e) => setForm({ ...form, description_en: e.target.value })}
            placeholder="Step description in English"
            rows={3}
            className="bg-[#F5F5F7] border-[#D2D2D7]"
          />
          {errors.description_en && <p className="text-sm text-[#FF3B30]">{errors.description_en}</p>}
        </div>

        <div className="space-y-1">
          <Label>รูปภาพ *</Label>
          <FileUpload
            value={form.image}
            onChange={(url) => setForm({ ...form, image: url })}
            accept="image/*"
            preview="image"
          />
          {errors.image && <p className="text-sm text-[#FF3B30]">{errors.image}</p>}
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
