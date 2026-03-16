'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { adminFetch } from '@/lib/admin-api'
import { useAlertStore } from '@/lib/alert-store'
import { useDeleteConfirm } from '@/components/admin/DeleteConfirm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import DataTable, { type Column } from '@/components/admin/DataTable'
import FormDialog from '@/components/admin/FormDialog'
import { productSchema, type ProductFormData } from '@/lib/admin-schemas'
import type { Product, ProductSize } from '@/types/admin'

type SizeFormRow = {
  id?: string
  label_th: string
  label_en: string
  volume: string
  price: string
  stock: string
  sku: string
  sort_order: string
}

const emptySizeRow = (): SizeFormRow => ({
  label_th: '',
  label_en: '',
  volume: '',
  price: '',
  stock: '0',
  sku: '',
  sort_order: '0',
})

const initialForm = {
  slug: '',
  name_th: '',
  name_en: '',
  short_desc_th: '',
  short_desc_en: '',
  image: '',
}

export default function ProductsPage() {
  const showAlert = useAlertStore((s) => s.showAlert)
  const confirmDelete = useDeleteConfirm()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  // Form state
  const [form, setForm] = useState(initialForm)
  const [sizes, setSizes] = useState<SizeFormRow[]>([emptySizeRow()])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminFetch<Product[]>('products')
      setProducts(data)
    } catch {
      showAlert('error', 'ไม่สามารถโหลดข้อมูลสินค้าได้')
    } finally {
      setLoading(false)
    }
  }, [showAlert])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // --- helpers ---

  const getPriceRange = (product: Product) => {
    if (!product.sizes || product.sizes.length === 0) return '-'
    const prices = product.sizes.map((s) => s.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    if (min === max) return `฿${min.toLocaleString()}`
    return `฿${min.toLocaleString()} - ฿${max.toLocaleString()}`
  }

  const getTotalStock = (product: Product) => {
    if (!product.sizes || product.sizes.length === 0) return 0
    return product.sizes.reduce((sum, s) => sum + s.stock, 0)
  }

  // --- dialog ---

  const openCreate = () => {
    setEditing(null)
    setForm(initialForm)
    setSizes([emptySizeRow()])
    setDialogOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setForm({
      slug: product.slug,
      name_th: product.name_th,
      name_en: product.name_en,
      short_desc_th: product.short_desc_th,
      short_desc_en: product.short_desc_en,
      image: product.image,
    })
    setSizes(
      product.sizes.length > 0
        ? product.sizes.map((s) => ({
            id: s.id,
            label_th: s.label_th,
            label_en: s.label_en,
            volume: s.volume,
            price: String(s.price),
            stock: String(s.stock),
            sku: s.sku,
            sort_order: String(s.sort_order),
          }))
        : [emptySizeRow()],
    )
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditing(null)
  }

  // --- sizes management ---

  const addSize = () => {
    setSizes((prev) => [...prev, emptySizeRow()])
  }

  const removeSize = (index: number) => {
    setSizes((prev) => prev.filter((_, i) => i !== index))
  }

  const updateSize = (index: number, field: keyof SizeFormRow, value: string) => {
    setSizes((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  // --- save ---

  const handleSave = async () => {
    const payload: ProductFormData = {
      ...form,
      sizes: sizes.map((s) => ({
        ...(s.id ? { id: s.id } : {}),
        label_th: s.label_th,
        label_en: s.label_en,
        volume: s.volume,
        price: Number(s.price),
        stock: Number(s.stock),
        sku: s.sku,
        sort_order: Number(s.sort_order),
      })),
    }

    const result = productSchema.safeParse(payload)
    if (!result.success) {
      const firstError = result.error.errors[0]
      showAlert('error', firstError.message)
      return
    }

    try {
      if (editing) {
        await adminFetch(`products/${editing.id}`, { method: 'PUT', body: result.data })
      } else {
        await adminFetch('products', { method: 'POST', body: result.data })
      }
      showAlert('success', editing ? 'แก้ไขสินค้าสำเร็จ' : 'เพิ่มสินค้าสำเร็จ')
      closeDialog()
      loadProducts()
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    }
  }

  // --- delete ---

  const handleDelete = (product: Product) => {
    confirmDelete({
      itemName: product.name_th,
      onConfirm: async () => {
        try {
          await adminFetch(`products/${product.id}`, { method: 'DELETE' })
          showAlert('success', 'ลบสินค้าสำเร็จ')
          loadProducts()
        } catch (err) {
          showAlert('error', err instanceof Error ? err.message : 'ลบไม่สำเร็จ')
        }
      },
    })
  }

  // --- columns ---

  const columns: Column<Product>[] = [
    {
      key: 'image',
      label: 'รูปภาพ',
      className: 'w-16',
      render: (p) =>
        p.image ? (
          <Image
            src={p.image}
            alt={p.name_th}
            width={40}
            height={40}
            className="rounded object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded bg-[#E8E8ED] flex items-center justify-center">
            <i className="fa-solid fa-image text-[#86868B]" />
          </div>
        ),
    },
    {
      key: 'name_th',
      label: 'ชื่อสินค้า',
      render: (p) => <span className="font-medium text-[#1D1D1F]">{p.name_th}</span>,
    },
    {
      key: 'sizes',
      label: 'ขนาด',
      className: 'w-20 text-center',
      render: (p) => <span>{p.sizes?.length ?? 0}</span>,
    },
    {
      key: 'price',
      label: 'ราคา',
      className: 'w-40',
      render: (p) => <span className="text-[#007AFF]">{getPriceRange(p)}</span>,
    },
    {
      key: 'stock',
      label: 'สต็อกรวม',
      className: 'w-28 text-center',
      render: (p) => {
        const total = getTotalStock(p)
        return (
          <span className={total <= 0 ? 'text-[#FF3B30]' : 'text-[#1D1D1F]/80'}>
            {total.toLocaleString()}
          </span>
        )
      },
    },
  ]

  // --- render ---

  return (
    <>
      <AdminPageHeader
        title="จัดการสินค้า"
        description="เพิ่ม แก้ไข ลบ สินค้าและขนาดสินค้า"
        action={
          <Button onClick={openCreate} className="bg-[#007AFF] text-white hover:bg-[#0056CC]">
            <i className="fa-solid fa-plus mr-2" />
            เพิ่มสินค้า
          </Button>
        }
      />

      <DataTable<Product>
        columns={columns}
        data={products}
        loading={loading}
        searchable
        searchPlaceholder="ค้นหาชื่อสินค้า..."
        searchKeys={['name_th', 'name_en']}
        actions={(product) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEdit(product)}
              className="text-[#86868B] hover:text-[#1D1D1F]"
            >
              <i className="fa-solid fa-pen-to-square" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(product)}
              className="text-[#86868B] hover:text-[#FF3B30]"
            >
              <i className="fa-solid fa-trash" />
            </Button>
          </div>
        )}
      />

      {/* Create / Edit Dialog */}
      <FormDialog
        open={dialogOpen}
        onClose={closeDialog}
        title={editing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}
        onSave={handleSave}
      >
        {/* Product fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#1D1D1F]/80">Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="product-slug"
              className="bg-[#F5F5F7] border-[#D2D2D7]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#1D1D1F]/80">URL รูปภาพ</Label>
            <Input
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              placeholder="https://..."
              className="bg-[#F5F5F7] border-[#D2D2D7]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#1D1D1F]/80">ชื่อสินค้า (TH)</Label>
            <Input
              value={form.name_th}
              onChange={(e) => setForm((f) => ({ ...f, name_th: e.target.value }))}
              placeholder="ชื่อสินค้าภาษาไทย"
              className="bg-[#F5F5F7] border-[#D2D2D7]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#1D1D1F]/80">ชื่อสินค้า (EN)</Label>
            <Input
              value={form.name_en}
              onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))}
              placeholder="Product name in English"
              className="bg-[#F5F5F7] border-[#D2D2D7]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[#1D1D1F]/80">รายละเอียดสั้น (TH)</Label>
          <Textarea
            value={form.short_desc_th}
            onChange={(e) => setForm((f) => ({ ...f, short_desc_th: e.target.value }))}
            placeholder="รายละเอียดสินค้าภาษาไทย"
            rows={3}
            className="bg-[#F5F5F7] border-[#D2D2D7]"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[#1D1D1F]/80">รายละเอียดสั้น (EN)</Label>
          <Textarea
            value={form.short_desc_en}
            onChange={(e) => setForm((f) => ({ ...f, short_desc_en: e.target.value }))}
            placeholder="Short product description in English"
            rows={3}
            className="bg-[#F5F5F7] border-[#D2D2D7]"
          />
        </div>

        {/* Sizes section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-[#1D1D1F]/80 text-base font-semibold">ขนาดสินค้า</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSize}
              className="border-[#D2D2D7] text-[#1D1D1F]/80 hover:bg-[#F5F5F7]"
            >
              <i className="fa-solid fa-plus mr-2" />
              เพิ่มขนาด
            </Button>
          </div>

          <div className="max-h-[320px] overflow-y-auto space-y-4 pr-1">
            {sizes.map((size, idx) => (
              <div
                key={idx}
                className="relative border border-[#E8E8ED] rounded-lg p-4 bg-[#F5F5F7]/50"
              >
                {/* Remove button */}
                {sizes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSize(idx)}
                    className="absolute top-2 right-2 text-[#86868B] hover:text-[#FF3B30] transition-colors"
                    title="ลบขนาดนี้"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-[#86868B]">ชื่อขนาด (TH)</Label>
                    <Input
                      value={size.label_th}
                      onChange={(e) => updateSize(idx, 'label_th', e.target.value)}
                      placeholder="เช่น ขนาดเล็ก"
                      className="bg-[#F5F5F7] border-[#D2D2D7] h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-[#86868B]">ชื่อขนาด (EN)</Label>
                    <Input
                      value={size.label_en}
                      onChange={(e) => updateSize(idx, 'label_en', e.target.value)}
                      placeholder="e.g. Small"
                      className="bg-[#F5F5F7] border-[#D2D2D7] h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-[#86868B]">ปริมาตร</Label>
                    <Input
                      value={size.volume}
                      onChange={(e) => updateSize(idx, 'volume', e.target.value)}
                      placeholder="เช่น 500ml"
                      className="bg-[#F5F5F7] border-[#D2D2D7] h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-[#86868B]">SKU</Label>
                    <Input
                      value={size.sku}
                      onChange={(e) => updateSize(idx, 'sku', e.target.value)}
                      placeholder="เช่น SOQ-001"
                      className="bg-[#F5F5F7] border-[#D2D2D7] h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-[#86868B]">ราคา</Label>
                    <Input
                      type="number"
                      value={size.price}
                      onChange={(e) => updateSize(idx, 'price', e.target.value)}
                      placeholder="0"
                      min="0"
                      className="bg-[#F5F5F7] border-[#D2D2D7] h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-[#86868B]">สต็อก</Label>
                    <Input
                      type="number"
                      value={size.stock}
                      onChange={(e) => updateSize(idx, 'stock', e.target.value)}
                      placeholder="0"
                      min="0"
                      className="bg-[#F5F5F7] border-[#D2D2D7] h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-[#86868B]">ลำดับ</Label>
                    <Input
                      type="number"
                      value={size.sort_order}
                      onChange={(e) => updateSize(idx, 'sort_order', e.target.value)}
                      placeholder="0"
                      min="0"
                      className="bg-[#F5F5F7] border-[#D2D2D7] h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FormDialog>
    </>
  )
}
