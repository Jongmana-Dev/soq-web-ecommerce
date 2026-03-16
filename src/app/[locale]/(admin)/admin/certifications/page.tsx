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
import { certificationSchema, type CertificationFormData } from '@/lib/admin-schemas'
import type { Certification } from '@/types/admin'

const emptyForm: CertificationFormData = {
  icon: '',
  label_th: '',
  label_en: '',
  description_th: '',
  description_en: '',
  pdf_url: null,
  document_images: [],
  sort_order: 0,
}

export default function CertificationsPage() {
  const [items, setItems] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Certification | null>(null)
  const [form, setForm] = useState<CertificationFormData>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof CertificationFormData, string>>>({})

  const showAlert = useAlertStore((s) => s.showAlert)
  const deleteConfirm = useDeleteConfirm()

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminFetch<Certification[]>('certifications')
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

  const openEdit = (item: Certification) => {
    setEditing(item)
    setForm({
      icon: item.icon,
      label_th: item.label_th,
      label_en: item.label_en,
      description_th: item.description_th,
      description_en: item.description_en,
      pdf_url: item.pdf_url,
      document_images: item.document_images ?? [],
      sort_order: item.sort_order,
    })
    setErrors({})
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const result = certificationSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CertificationFormData, string>> = {}
      result.error.errors.forEach((e) => {
        const key = e.path[0] as keyof CertificationFormData
        if (!fieldErrors[key]) fieldErrors[key] = e.message
      })
      setErrors(fieldErrors)
      return
    }

    try {
      if (editing) {
        await adminFetch(`certifications/${editing.id}`, { method: 'PUT', body: result.data })
        showAlert('success', 'แก้ไขใบรับรองสำเร็จ')
      } else {
        await adminFetch('certifications', { method: 'POST', body: result.data })
        showAlert('success', 'เพิ่มใบรับรองสำเร็จ')
      }
      setDialogOpen(false)
      loadItems()
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ')
    }
  }

  const handleDelete = (item: Certification) => {
    deleteConfirm({
      itemName: item.label_th,
      onConfirm: async () => {
        try {
          await adminFetch(`certifications/${item.id}`, { method: 'DELETE' })
          showAlert('success', 'ลบใบรับรองสำเร็จ')
          loadItems()
        } catch {
          showAlert('error', 'ลบไม่สำเร็จ')
        }
      },
    })
  }

  const columns: Column<Certification>[] = [
    {
      key: 'icon',
      label: 'ไอคอน',
      className: 'w-20 text-center',
      render: (item) => <i className={item.icon} />,
    },
    {
      key: 'label_th',
      label: 'ชื่อ (TH)',
    },
    {
      key: 'sort_order',
      label: 'ลำดับ',
      className: 'w-20 text-center',
    },
    {
      key: 'document_images',
      label: 'เอกสาร',
      className: 'w-24',
      render: (item) =>
        item.document_images?.length > 0 ? (
          <div className="flex -space-x-1">
            {item.document_images.slice(0, 3).map((img, i) => (
              <Image
                key={i}
                src={img}
                alt=""
                width={28}
                height={28}
                className="rounded border border-white object-cover w-7 h-7"
                unoptimized
              />
            ))}
            {item.document_images.length > 3 && (
              <span className="w-7 h-7 rounded bg-[#F5F5F7] border border-white flex items-center justify-center text-[10px] text-[#86868B]">
                +{item.document_images.length - 3}
              </span>
            )}
          </div>
        ) : (
          <span className="text-[#86868B] text-sm">-</span>
        ),
    },
    {
      key: 'pdf_url',
      label: 'PDF',
      className: 'w-24',
      render: (item) =>
        item.pdf_url ? (
          <a
            href={item.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#007AFF] hover:text-[#007AFF]/80 text-sm underline"
            onClick={(e) => e.stopPropagation()}
          >
            <i className="fa-solid fa-file-pdf mr-1" />
            ดูไฟล์
          </a>
        ) : (
          <span className="text-[#86868B] text-sm">-</span>
        ),
    },
  ]

  return (
    <>
      <AdminPageHeader
        title="ใบรับรอง"
        description="จัดการใบรับรองที่แสดงบนเว็บไซต์"
        action={
          <Button onClick={openCreate} className="bg-[#007AFF] hover:bg-[#0056CC]">
            <i className="fa-solid fa-plus mr-2" />
            เพิ่มใบรับรอง
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        searchable
        searchPlaceholder="ค้นหาใบรับรอง..."
        searchKeys={['label_th', 'label_en']}
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
        title={editing ? 'แก้ไขใบรับรอง' : 'เพิ่มใบรับรองใหม่'}
        onSave={handleSave}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>ไอคอน *</Label>
            <Input
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="fa-solid fa-certificate"
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

        <div className="space-y-1">
          <Label>ชื่อ (TH) *</Label>
          <Input
            value={form.label_th}
            onChange={(e) => setForm({ ...form, label_th: e.target.value })}
            placeholder="ชื่อใบรับรองภาษาไทย"
            className="bg-[#F5F5F7] border-[#D2D2D7]"
          />
          {errors.label_th && <p className="text-sm text-[#FF3B30]">{errors.label_th}</p>}
        </div>

        <div className="space-y-1">
          <Label>ชื่อ (EN) *</Label>
          <Input
            value={form.label_en}
            onChange={(e) => setForm({ ...form, label_en: e.target.value })}
            placeholder="Certification label in English"
            className="bg-[#F5F5F7] border-[#D2D2D7]"
          />
          {errors.label_en && <p className="text-sm text-[#FF3B30]">{errors.label_en}</p>}
        </div>

        <div className="space-y-1">
          <Label>รายละเอียด (TH) *</Label>
          <Textarea
            value={form.description_th}
            onChange={(e) => setForm({ ...form, description_th: e.target.value })}
            placeholder="รายละเอียดภาษาไทย"
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
            placeholder="Description in English"
            rows={3}
            className="bg-[#F5F5F7] border-[#D2D2D7]"
          />
          {errors.description_en && <p className="text-sm text-[#FF3B30]">{errors.description_en}</p>}
        </div>

        <div className="space-y-1">
          <Label>URL ไฟล์ PDF (ไม่บังคับ)</Label>
          <Input
            value={form.pdf_url ?? ''}
            onChange={(e) => setForm({ ...form, pdf_url: e.target.value || null })}
            placeholder="https://example.com/cert.pdf"
            className="bg-[#F5F5F7] border-[#D2D2D7]"
          />
          {errors.pdf_url && <p className="text-sm text-[#FF3B30]">{errors.pdf_url}</p>}
        </div>

        <div className="space-y-2">
          <Label>รูปเอกสาร (ไม่บังคับ)</Label>
          {(form.document_images ?? []).map((img, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-[#D2D2D7] bg-[#F5F5F7] p-2">
              <Image
                src={img}
                alt=""
                width={48}
                height={48}
                className="rounded-lg object-cover w-12 h-12"
                unoptimized
              />
              <p className="flex-1 text-xs text-[#86868B] truncate">{img}</p>
              <button
                type="button"
                onClick={() => {
                  const updated = [...(form.document_images ?? [])]
                  updated.splice(i, 1)
                  setForm({ ...form, document_images: updated })
                }}
                className="shrink-0 w-7 h-7 rounded-full bg-[#FF3B30]/10 flex items-center justify-center text-[#FF3B30]"
              >
                <i className="fa-solid fa-xmark text-xs" />
              </button>
            </div>
          ))}
          <FileUpload
            value=""
            onChange={(url) => {
              if (url) {
                setForm({ ...form, document_images: [...(form.document_images ?? []), url] })
              }
            }}
            accept="image/*"
            preview="document"
          />
        </div>
      </FormDialog>
    </>
  )
}
