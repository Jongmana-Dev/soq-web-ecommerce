'use client'

import { useEffect, useState, useCallback } from 'react'
import { adminFetch } from '@/lib/admin-api'
import { useAlertStore } from '@/lib/alert-store'
import { useDeleteConfirm } from '@/components/admin/DeleteConfirm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import DataTable, { type Column } from '@/components/admin/DataTable'
import FormDialog from '@/components/admin/FormDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { termsSectionSchema, type TermsSectionFormData } from '@/lib/admin-schemas'
import type { TermsSection } from '@/types/admin'

const emptyForm: TermsSectionFormData = {
  title_th: '',
  title_en: '',
  body_th: '',
  body_en: '',
  sort_order: 0,
}

export default function TermsPage() {
  const [items, setItems] = useState<TermsSection[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TermsSection | null>(null)
  const [form, setForm] = useState<TermsSectionFormData>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof TermsSectionFormData, string>>>({})

  const showAlert = useAlertStore((s) => s.showAlert)
  const deleteConfirm = useDeleteConfirm()

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminFetch<TermsSection[]>('terms-sections')
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

  const openEdit = (item: TermsSection) => {
    setEditing(item)
    setForm({
      title_th: item.title_th,
      title_en: item.title_en,
      body_th: item.body_th,
      body_en: item.body_en,
      sort_order: item.sort_order,
    })
    setErrors({})
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const result = termsSectionSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof TermsSectionFormData, string>> = {}
      result.error.errors.forEach((e) => {
        const key = e.path[0] as keyof TermsSectionFormData
        if (!fieldErrors[key]) fieldErrors[key] = e.message
      })
      setErrors(fieldErrors)
      return
    }

    try {
      if (editing) {
        await adminFetch(`terms-sections/${editing.id}`, { method: 'PUT', body: result.data })
        showAlert('success', 'แก้ไขเงื่อนไขสำเร็จ')
      } else {
        await adminFetch('terms-sections', { method: 'POST', body: result.data })
        showAlert('success', 'เพิ่มเงื่อนไขสำเร็จ')
      }
      setDialogOpen(false)
      loadItems()
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ')
    }
  }

  const handleDelete = (item: TermsSection) => {
    deleteConfirm({
      itemName: item.title_th,
      onConfirm: async () => {
        try {
          await adminFetch(`terms-sections/${item.id}`, { method: 'DELETE' })
          showAlert('success', 'ลบเงื่อนไขสำเร็จ')
          loadItems()
        } catch {
          showAlert('error', 'ลบไม่สำเร็จ')
        }
      },
    })
  }

  const columns: Column<TermsSection>[] = [
    {
      key: 'title_th',
      label: 'หัวข้อ (TH)',
    },
    {
      key: 'title_en',
      label: 'หัวข้อ (EN)',
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
        title="เงื่อนไข / นโยบาย"
        description="จัดการเงื่อนไขและนโยบายที่แสดงบนเว็บไซต์"
        action={
          <Button onClick={openCreate} className="bg-[#007AFF] hover:bg-[#0056CC]">
            <i className="fa-solid fa-plus mr-2" />
            เพิ่มเงื่อนไข
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        searchable
        searchPlaceholder="ค้นหาเงื่อนไข..."
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
        title={editing ? 'แก้ไขเงื่อนไข' : 'เพิ่มเงื่อนไขใหม่'}
        onSave={handleSave}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>หัวข้อ (TH) *</Label>
            <Input
              value={form.title_th}
              onChange={(e) => setForm({ ...form, title_th: e.target.value })}
              placeholder="เช่น เงื่อนไขทั่วไป"
              className="bg-[#F5F5F7] border-[#D2D2D7]"
            />
            {errors.title_th && <p className="text-sm text-[#FF3B30]">{errors.title_th}</p>}
          </div>

          <div className="space-y-1">
            <Label>หัวข้อ (EN) *</Label>
            <Input
              value={form.title_en}
              onChange={(e) => setForm({ ...form, title_en: e.target.value })}
              placeholder="e.g. General Terms"
              className="bg-[#F5F5F7] border-[#D2D2D7]"
            />
            {errors.title_en && <p className="text-sm text-[#FF3B30]">{errors.title_en}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <Label>เนื้อหา (TH) *</Label>
          <Textarea
            value={form.body_th}
            onChange={(e) => setForm({ ...form, body_th: e.target.value })}
            placeholder="เนื้อหาเงื่อนไขภาษาไทย"
            rows={5}
            className="bg-[#F5F5F7] border-[#D2D2D7]"
          />
          {errors.body_th && <p className="text-sm text-[#FF3B30]">{errors.body_th}</p>}
        </div>

        <div className="space-y-1">
          <Label>เนื้อหา (EN) *</Label>
          <Textarea
            value={form.body_en}
            onChange={(e) => setForm({ ...form, body_en: e.target.value })}
            placeholder="Terms content in English"
            rows={5}
            className="bg-[#F5F5F7] border-[#D2D2D7]"
          />
          {errors.body_en && <p className="text-sm text-[#FF3B30]">{errors.body_en}</p>}
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
