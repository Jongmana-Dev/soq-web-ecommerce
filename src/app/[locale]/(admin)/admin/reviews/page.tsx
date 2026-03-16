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
import { reviewSchema, type ReviewFormData } from '@/lib/admin-schemas'
import type { Review } from '@/types/admin'

const emptyForm: ReviewFormData = {
  name: '',
  role: '',
  avatar: '',
  quote_th: '',
  quote_en: '',
  rating: 5,
  video_url: null,
  brand_name: null,
  brand_logo: null,
  sort_order: 0,
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-[#FF9500]">
      {Array.from({ length: 5 }, (_, i) => (
        <i
          key={i}
          className={i < rating ? 'fa-solid fa-star text-xs' : 'fa-regular fa-star text-xs text-[#86868B]'}
        />
      ))}
    </span>
  )
}

export default function ReviewsPage() {
  const [items, setItems] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Review | null>(null)
  const [form, setForm] = useState<ReviewFormData>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof ReviewFormData, string>>>({})

  const showAlert = useAlertStore((s) => s.showAlert)
  const deleteConfirm = useDeleteConfirm()

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminFetch<Review[]>('reviews')
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

  const openEdit = (item: Review) => {
    setEditing(item)
    setForm({
      name: item.name,
      role: item.role,
      avatar: item.avatar,
      quote_th: item.quote_th,
      quote_en: item.quote_en,
      rating: item.rating,
      video_url: item.video_url,
      brand_name: item.brand_name,
      brand_logo: item.brand_logo,
      sort_order: item.sort_order,
    })
    setErrors({})
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const result = reviewSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ReviewFormData, string>> = {}
      result.error.errors.forEach((e) => {
        const key = e.path[0] as keyof ReviewFormData
        if (!fieldErrors[key]) fieldErrors[key] = e.message
      })
      setErrors(fieldErrors)
      return
    }

    try {
      if (editing) {
        await adminFetch(`reviews/${editing.id}`, { method: 'PUT', body: result.data })
        showAlert('success', 'แก้ไขรีวิวสำเร็จ')
      } else {
        await adminFetch('reviews', { method: 'POST', body: result.data })
        showAlert('success', 'เพิ่มรีวิวสำเร็จ')
      }
      setDialogOpen(false)
      loadItems()
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ')
    }
  }

  const handleDelete = (item: Review) => {
    deleteConfirm({
      itemName: item.name,
      onConfirm: async () => {
        try {
          await adminFetch(`reviews/${item.id}`, { method: 'DELETE' })
          showAlert('success', 'ลบรีวิวสำเร็จ')
          loadItems()
        } catch {
          showAlert('error', 'ลบไม่สำเร็จ')
        }
      },
    })
  }

  const columns: Column<Review>[] = [
    {
      key: 'avatar',
      label: 'รูป',
      className: 'w-16',
      render: (item) => (
        <Image
          src={item.avatar}
          alt={item.name}
          width={32}
          height={32}
          className="rounded-full object-cover w-8 h-8"
          unoptimized
        />
      ),
    },
    {
      key: 'name',
      label: 'ชื่อ',
    },
    {
      key: 'rating',
      label: 'คะแนน',
      className: 'w-32',
      render: (item) => <StarRating rating={item.rating} />,
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
        title="รีวิวจากลูกค้า"
        description="จัดการรีวิวที่แสดงบนเว็บไซต์"
        action={
          <Button onClick={openCreate} className="bg-[#007AFF] hover:bg-[#0056CC]">
            <i className="fa-solid fa-plus mr-2" />
            เพิ่มรีวิว
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        searchable
        searchPlaceholder="ค้นหาชื่อ..."
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
        title={editing ? 'แก้ไขรีวิว' : 'เพิ่มรีวิวใหม่'}
        onSave={handleSave}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>ชื่อ *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="ชื่อผู้รีวิว"
              className="bg-[#F5F5F7] border-[#D2D2D7]"
            />
            {errors.name && <p className="text-sm text-[#FF3B30]">{errors.name}</p>}
          </div>

          <div className="space-y-1">
            <Label>ตำแหน่ง / บทบาท *</Label>
            <Input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="เช่น เจ้าของร้านอาหาร"
              className="bg-[#F5F5F7] border-[#D2D2D7]"
            />
            {errors.role && <p className="text-sm text-[#FF3B30]">{errors.role}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <Label>รูปโปรไฟล์ *</Label>
          <FileUpload
            value={form.avatar}
            onChange={(url) => setForm({ ...form, avatar: url })}
            accept="image/*"
            preview="image"
          />
          {errors.avatar && <p className="text-sm text-[#FF3B30]">{errors.avatar}</p>}
        </div>

        <div className="space-y-1">
          <Label>รีวิว (TH) *</Label>
          <Textarea
            value={form.quote_th}
            onChange={(e) => setForm({ ...form, quote_th: e.target.value })}
            placeholder="เนื้อหารีวิวภาษาไทย"
            rows={3}
            className="bg-[#F5F5F7] border-[#D2D2D7]"
          />
          {errors.quote_th && <p className="text-sm text-[#FF3B30]">{errors.quote_th}</p>}
        </div>

        <div className="space-y-1">
          <Label>รีวิว (EN) *</Label>
          <Textarea
            value={form.quote_en}
            onChange={(e) => setForm({ ...form, quote_en: e.target.value })}
            placeholder="Review content in English"
            rows={3}
            className="bg-[#F5F5F7] border-[#D2D2D7]"
          />
          {errors.quote_en && <p className="text-sm text-[#FF3B30]">{errors.quote_en}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>คะแนน (1-5) *</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              className="bg-[#F5F5F7] border-[#D2D2D7]"
            />
            {form.rating >= 1 && form.rating <= 5 && (
              <div className="mt-1">
                <StarRating rating={form.rating} />
              </div>
            )}
            {errors.rating && <p className="text-sm text-[#FF3B30]">{errors.rating}</p>}
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
          <Label>วิดีโอ (ไม่บังคับ)</Label>
          <FileUpload
            value={form.video_url ?? ''}
            onChange={(url) => setForm({ ...form, video_url: url || null })}
            accept="video/*"
            preview="video"
          />
          {errors.video_url && <p className="text-sm text-[#FF3B30]">{errors.video_url}</p>}
        </div>

        <div className="space-y-1">
          <Label>แบรนด์ (ไม่บังคับ)</Label>
          <Input
            value={form.brand_name ?? ''}
            onChange={(e) => setForm({ ...form, brand_name: e.target.value || null })}
            placeholder="ชื่อแบรนด์"
            className="bg-[#F5F5F7] border-[#D2D2D7]"
          />
          {errors.brand_name && <p className="text-sm text-[#FF3B30]">{errors.brand_name}</p>}
        </div>

        <div className="space-y-1">
          <Label>โลโก้แบรนด์ (ไม่บังคับ)</Label>
          <FileUpload
            value={form.brand_logo ?? ''}
            onChange={(url) => setForm({ ...form, brand_logo: url || null })}
            accept="image/*"
            preview="image"
          />
        </div>
      </FormDialog>
    </>
  )
}
