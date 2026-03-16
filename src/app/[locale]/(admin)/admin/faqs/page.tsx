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
import { faqSchema, type FAQFormData } from '@/lib/admin-schemas'
import type { FAQ } from '@/types/admin'

const emptyForm: FAQFormData = {
  question_th: '',
  question_en: '',
  answer_th: '',
  answer_en: '',
  icon: '',
  sort_order: 0,
}

export default function FAQsPage() {
  const [items, setItems] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<FAQ | null>(null)
  const [form, setForm] = useState<FAQFormData>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FAQFormData, string>>>({})

  const showAlert = useAlertStore((s) => s.showAlert)
  const deleteConfirm = useDeleteConfirm()

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminFetch<FAQ[]>('faqs')
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

  const openEdit = (item: FAQ) => {
    setEditing(item)
    setForm({
      question_th: item.question_th,
      question_en: item.question_en,
      answer_th: item.answer_th,
      answer_en: item.answer_en,
      icon: item.icon,
      sort_order: item.sort_order,
    })
    setErrors({})
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const result = faqSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FAQFormData, string>> = {}
      result.error.errors.forEach((e) => {
        const key = e.path[0] as keyof FAQFormData
        if (!fieldErrors[key]) fieldErrors[key] = e.message
      })
      setErrors(fieldErrors)
      return
    }

    try {
      if (editing) {
        await adminFetch(`faqs/${editing.id}`, { method: 'PUT', body: result.data })
        showAlert('success', 'แก้ไขคำถามสำเร็จ')
      } else {
        await adminFetch('faqs', { method: 'POST', body: result.data })
        showAlert('success', 'เพิ่มคำถามสำเร็จ')
      }
      setDialogOpen(false)
      loadItems()
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ')
    }
  }

  const handleDelete = (item: FAQ) => {
    deleteConfirm({
      itemName: item.question_th,
      onConfirm: async () => {
        try {
          await adminFetch(`faqs/${item.id}`, { method: 'DELETE' })
          showAlert('success', 'ลบคำถามสำเร็จ')
          loadItems()
        } catch {
          showAlert('error', 'ลบไม่สำเร็จ')
        }
      },
    })
  }

  const columns: Column<FAQ>[] = [
    {
      key: 'question_th',
      label: 'คำถาม (TH)',
      render: (item) => (
        <span className="line-clamp-1 max-w-xs">{item.question_th}</span>
      ),
    },
    {
      key: 'icon',
      label: 'ไอคอน',
      className: 'w-20 text-center',
      render: (item) => <i className={item.icon} />,
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
        title="คำถามที่พบบ่อย"
        description="จัดการ FAQ ที่แสดงบนเว็บไซต์"
        action={
          <Button onClick={openCreate} className="bg-[#007AFF] hover:bg-[#0056CC]">
            <i className="fa-solid fa-plus mr-2" />
            เพิ่มคำถาม
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        searchable
        searchPlaceholder="ค้นหาคำถาม..."
        searchKeys={['question_th', 'question_en']}
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
        title={editing ? 'แก้ไขคำถาม' : 'เพิ่มคำถามใหม่'}
        onSave={handleSave}
      >
        <div className="space-y-1">
          <Label>คำถาม (TH) *</Label>
          <Input
            value={form.question_th}
            onChange={(e) => setForm({ ...form, question_th: e.target.value })}
            placeholder="คำถามภาษาไทย"
            className="bg-[#F5F5F7] border-[#D2D2D7]"
          />
          {errors.question_th && <p className="text-sm text-[#FF3B30]">{errors.question_th}</p>}
        </div>

        <div className="space-y-1">
          <Label>คำถาม (EN) *</Label>
          <Input
            value={form.question_en}
            onChange={(e) => setForm({ ...form, question_en: e.target.value })}
            placeholder="Question in English"
            className="bg-[#F5F5F7] border-[#D2D2D7]"
          />
          {errors.question_en && <p className="text-sm text-[#FF3B30]">{errors.question_en}</p>}
        </div>

        <div className="space-y-1">
          <Label>คำตอบ (TH) *</Label>
          <Textarea
            value={form.answer_th}
            onChange={(e) => setForm({ ...form, answer_th: e.target.value })}
            placeholder="คำตอบภาษาไทย"
            rows={3}
            className="bg-[#F5F5F7] border-[#D2D2D7]"
          />
          {errors.answer_th && <p className="text-sm text-[#FF3B30]">{errors.answer_th}</p>}
        </div>

        <div className="space-y-1">
          <Label>คำตอบ (EN) *</Label>
          <Textarea
            value={form.answer_en}
            onChange={(e) => setForm({ ...form, answer_en: e.target.value })}
            placeholder="Answer in English"
            rows={3}
            className="bg-[#F5F5F7] border-[#D2D2D7]"
          />
          {errors.answer_en && <p className="text-sm text-[#FF3B30]">{errors.answer_en}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>ไอคอน *</Label>
            <Input
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="fa-solid fa-spray-can"
              className="bg-[#F5F5F7] border-[#D2D2D7]"
            />
            {form.icon && (
              <div className="flex items-center gap-2 text-sm text-[#86868B] mt-1">
                <span>ตัวอย่าง:</span>
                <i className={form.icon} />
              </div>
            )}
            {errors.icon && <p className="text-sm text-[#FF3B30]">{errors.icon}</p>}
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
        </div>
      </FormDialog>
    </>
  )
}
