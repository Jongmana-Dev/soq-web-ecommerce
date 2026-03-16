'use client'

import { useEffect, useState, useCallback } from 'react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { useDeleteConfirm } from '@/components/admin/DeleteConfirm'
import { adminFetch } from '@/lib/admin-api'
import { useAlertStore } from '@/lib/alert-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import type { ShippingRate, RemoteProvince } from '@/types/admin'

// ── Shipping Rate row ──
type RateRow = {
  id: string | null
  min_qty: string
  max_qty: string
  fee: string
  isNew?: boolean
}

// ── Remote Province row ──
type ProvinceRow = {
  id: string | null
  province_name: string
  surcharge: string
  isNew?: boolean
}

export default function ShippingPage() {
  // ── Shipping Rates state ──
  const [rates, setRates] = useState<RateRow[]>([])
  const [ratesLoading, setRatesLoading] = useState(true)
  const [rateSavingIds, setRateSavingIds] = useState<Set<string | null>>(new Set())

  // ── Remote Provinces state ──
  const [provinces, setProvinces] = useState<ProvinceRow[]>([])
  const [provincesLoading, setProvincesLoading] = useState(true)
  const [provinceSavingIds, setProvinceSavingIds] = useState<Set<string | null>>(new Set())

  const showAlert = useAlertStore((s) => s.showAlert)
  const deleteConfirm = useDeleteConfirm()

  // ── Fetch shipping rates ──
  const fetchRates = useCallback(() => {
    setRatesLoading(true)
    adminFetch<ShippingRate[]>('shipping/rates')
      .then((data) => {
        setRates(
          data.map((r) => ({
            id: r.id,
            min_qty: String(r.min_qty),
            max_qty: r.max_qty !== null ? String(r.max_qty) : '',
            fee: String(r.fee),
          }))
        )
      })
      .catch(() => showAlert('error', 'ไม่สามารถโหลดอัตราค่าจัดส่งได้'))
      .finally(() => setRatesLoading(false))
  }, [showAlert])

  // ── Fetch remote provinces ──
  const fetchProvinces = useCallback(() => {
    setProvincesLoading(true)
    adminFetch<RemoteProvince[]>('shipping/remote-provinces')
      .then((data) => {
        setProvinces(
          data.map((p) => ({
            id: p.id,
            province_name: p.province_name,
            surcharge: String(p.surcharge),
          }))
        )
      })
      .catch(() => showAlert('error', 'ไม่สามารถโหลดจังหวัดพื้นที่ห่างไกลได้'))
      .finally(() => setProvincesLoading(false))
  }, [showAlert])

  useEffect(() => {
    fetchRates()
    fetchProvinces()
  }, [fetchRates, fetchProvinces])

  // ── Rate helpers ──
  const addRateRow = () => {
    setRates((prev) => [
      ...prev,
      { id: null, min_qty: '', max_qty: '', fee: '', isNew: true },
    ])
  }

  const updateRateRow = (index: number, field: keyof RateRow, value: string) => {
    setRates((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)))
  }

  const saveRate = async (index: number) => {
    const row = rates[index]
    const minQty = parseInt(row.min_qty)
    const maxQty = row.max_qty ? parseInt(row.max_qty) : null
    const fee = parseFloat(row.fee)

    if (isNaN(minQty) || minQty < 1) {
      showAlert('error', 'กรุณากรอกจำนวนขั้นต่ำที่ถูกต้อง')
      return
    }
    if (isNaN(fee) || fee < 0) {
      showAlert('error', 'กรุณากรอกค่าจัดส่งที่ถูกต้อง')
      return
    }

    const body = { min_qty: minQty, max_qty: maxQty, fee }
    const rowKey = row.id ?? `new-${index}`
    setRateSavingIds((prev) => new Set(prev).add(rowKey))

    try {
      if (row.id) {
        const updated = await adminFetch<ShippingRate>(`shipping/rates/${row.id}`, {
          method: 'PUT',
          body,
        })
        setRates((prev) =>
          prev.map((r, i) =>
            i === index
              ? {
                  id: updated.id,
                  min_qty: String(updated.min_qty),
                  max_qty: updated.max_qty !== null ? String(updated.max_qty) : '',
                  fee: String(updated.fee),
                }
              : r
          )
        )
      } else {
        const created = await adminFetch<ShippingRate>('shipping/rates', {
          method: 'POST',
          body,
        })
        setRates((prev) =>
          prev.map((r, i) =>
            i === index
              ? {
                  id: created.id,
                  min_qty: String(created.min_qty),
                  max_qty: created.max_qty !== null ? String(created.max_qty) : '',
                  fee: String(created.fee),
                }
              : r
          )
        )
      }
      showAlert('success', 'บันทึกอัตราค่าจัดส่งสำเร็จ')
    } catch (err) {
      showAlert('error', 'บันทึกไม่สำเร็จ', err instanceof Error ? err.message : undefined)
    } finally {
      setRateSavingIds((prev) => {
        const next = new Set(prev)
        next.delete(rowKey)
        return next
      })
    }
  }

  const deleteRate = (index: number) => {
    const row = rates[index]
    if (!row.id) {
      // Remove unsaved row
      setRates((prev) => prev.filter((_, i) => i !== index))
      return
    }

    deleteConfirm({
      itemName: `ช่วง ${row.min_qty} - ${row.max_qty || 'ขึ้นไป'}`,
      onConfirm: async () => {
        try {
          await adminFetch(`shipping/rates/${row.id}`, { method: 'DELETE' })
          setRates((prev) => prev.filter((_, i) => i !== index))
          showAlert('success', 'ลบสำเร็จ')
        } catch (err) {
          showAlert('error', 'ลบไม่สำเร็จ', err instanceof Error ? err.message : undefined)
        }
      },
    })
  }

  // ── Province helpers ──
  const addProvinceRow = () => {
    setProvinces((prev) => [
      ...prev,
      { id: null, province_name: '', surcharge: '', isNew: true },
    ])
  }

  const updateProvinceRow = (index: number, field: keyof ProvinceRow, value: string) => {
    setProvinces((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)))
  }

  const saveProvince = async (index: number) => {
    const row = provinces[index]
    const fee = parseFloat(row.surcharge)

    if (!row.province_name.trim()) {
      showAlert('error', 'กรุณากรอกชื่อจังหวัด')
      return
    }
    if (isNaN(fee) || fee < 0) {
      showAlert('error', 'กรุณากรอกค่าธรรมเนียมเพิ่มเติมที่ถูกต้อง')
      return
    }

    const body = { province_name: row.province_name.trim(), surcharge: fee }
    const rowKey = row.id ?? `new-${index}`
    setProvinceSavingIds((prev) => new Set(prev).add(rowKey))

    try {
      if (row.id) {
        const updated = await adminFetch<RemoteProvince>(`shipping/remote-provinces/${row.id}`, {
          method: 'PUT',
          body,
        })
        setProvinces((prev) =>
          prev.map((p, i) =>
            i === index
              ? {
                  id: updated.id,
                  province_name: updated.province_name,
                  surcharge: String(updated.surcharge),
                }
              : p
          )
        )
      } else {
        const created = await adminFetch<RemoteProvince>('shipping/remote-provinces', {
          method: 'POST',
          body,
        })
        setProvinces((prev) =>
          prev.map((p, i) =>
            i === index
              ? {
                  id: created.id,
                  province_name: created.province_name,
                  surcharge: String(created.surcharge),
                }
              : p
          )
        )
      }
      showAlert('success', 'บันทึกจังหวัดสำเร็จ')
    } catch (err) {
      showAlert('error', 'บันทึกไม่สำเร็จ', err instanceof Error ? err.message : undefined)
    } finally {
      setProvinceSavingIds((prev) => {
        const next = new Set(prev)
        next.delete(rowKey)
        return next
      })
    }
  }

  const deleteProvince = (index: number) => {
    const row = provinces[index]
    if (!row.id) {
      setProvinces((prev) => prev.filter((_, i) => i !== index))
      return
    }

    deleteConfirm({
      itemName: row.province_name,
      onConfirm: async () => {
        try {
          await adminFetch(`shipping/remote-provinces/${row.id}`, { method: 'DELETE' })
          setProvinces((prev) => prev.filter((_, i) => i !== index))
          showAlert('success', 'ลบสำเร็จ')
        } catch (err) {
          showAlert('error', 'ลบไม่สำเร็จ', err instanceof Error ? err.message : undefined)
        }
      },
    })
  }

  return (
    <>
      <AdminPageHeader title="การจัดส่ง" description="จัดการอัตราค่าจัดส่งและพื้นที่ห่างไกล" />

      {/* ── Section 1: Shipping Rates ── */}
      <Card className="bg-white border-[#E8E8ED] mb-6">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1D1D1F]">อัตราค่าจัดส่ง</h2>
            <Button
              size="sm"
              onClick={addRateRow}
              className="bg-[#007AFF] text-white hover:bg-[#0056CC]"
            >
              <i className="fa-solid fa-plus mr-2" />
              เพิ่มช่วง
            </Button>
          </div>

          {ratesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="border border-[#D2D2D7] rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#D2D2D7] hover:bg-transparent">
                    <TableHead className="text-[#86868B]">จำนวนขั้นต่ำ</TableHead>
                    <TableHead className="text-[#86868B]">จำนวนสูงสุด</TableHead>
                    <TableHead className="text-[#86868B]">ค่าจัดส่ง (฿)</TableHead>
                    <TableHead className="text-[#86868B] w-28">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-[#86868B]">
                        ยังไม่มีอัตราค่าจัดส่ง
                      </TableCell>
                    </TableRow>
                  ) : (
                    rates.map((row, index) => {
                      const rowKey = row.id ?? `new-${index}`
                      const saving = rateSavingIds.has(rowKey)
                      return (
                        <TableRow key={rowKey} className="border-[#D2D2D7]">
                          <TableCell>
                            <Input
                              type="number"
                              min={1}
                              value={row.min_qty}
                              onChange={(e) => updateRateRow(index, 'min_qty', e.target.value)}
                              className="w-28 bg-[#F5F5F7] border-[#D2D2D7]"
                              placeholder="1"
                              disabled={saving}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={0}
                                value={row.max_qty}
                                onChange={(e) => updateRateRow(index, 'max_qty', e.target.value)}
                                className="w-28 bg-[#F5F5F7] border-[#D2D2D7]"
                                placeholder="ว่าง = ขึ้นไป"
                                disabled={saving}
                              />
                              {!row.max_qty && (
                                <span className="text-xs text-[#86868B] whitespace-nowrap">ขึ้นไป</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              value={row.fee}
                              onChange={(e) => updateRateRow(index, 'fee', e.target.value)}
                              className="w-28 bg-[#F5F5F7] border-[#D2D2D7]"
                              placeholder="0"
                              disabled={saving}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => saveRate(index)}
                                disabled={saving}
                                className="text-[#007AFF] hover:text-[#007AFF]/80"
                              >
                                {saving ? (
                                  <i className="fa-solid fa-spinner fa-spin" />
                                ) : (
                                  <i className="fa-solid fa-floppy-disk" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteRate(index)}
                                disabled={saving}
                                className="text-[#FF3B30] hover:text-[#FF3B30]/80"
                              >
                                <i className="fa-solid fa-trash" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section 2: Remote Provinces ── */}
      <Card className="bg-white border-[#E8E8ED]">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1D1D1F]">จังหวัดพื้นที่ห่างไกล</h2>
            <Button
              size="sm"
              onClick={addProvinceRow}
              className="bg-[#007AFF] text-white hover:bg-[#0056CC]"
            >
              <i className="fa-solid fa-plus mr-2" />
              เพิ่มจังหวัด
            </Button>
          </div>

          {provincesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="border border-[#D2D2D7] rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#D2D2D7] hover:bg-transparent">
                    <TableHead className="text-[#86868B]">จังหวัด</TableHead>
                    <TableHead className="text-[#86868B]">ค่าธรรมเนียมเพิ่มเติม (฿)</TableHead>
                    <TableHead className="text-[#86868B] w-28">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {provinces.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-[#86868B]">
                        ยังไม่มีจังหวัดพื้นที่ห่างไกล
                      </TableCell>
                    </TableRow>
                  ) : (
                    provinces.map((row, index) => {
                      const rowKey = row.id ?? `new-${index}`
                      const saving = provinceSavingIds.has(rowKey)
                      return (
                        <TableRow key={rowKey} className="border-[#D2D2D7]">
                          <TableCell>
                            <Input
                              type="text"
                              value={row.province_name}
                              onChange={(e) => updateProvinceRow(index, 'province_name', e.target.value)}
                              className="w-48 bg-[#F5F5F7] border-[#D2D2D7]"
                              placeholder="ชื่อจังหวัด"
                              disabled={saving}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              value={row.surcharge}
                              onChange={(e) => updateProvinceRow(index, 'surcharge', e.target.value)}
                              className="w-36 bg-[#F5F5F7] border-[#D2D2D7]"
                              placeholder="0"
                              disabled={saving}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => saveProvince(index)}
                                disabled={saving}
                                className="text-[#007AFF] hover:text-[#007AFF]/80"
                              >
                                {saving ? (
                                  <i className="fa-solid fa-spinner fa-spin" />
                                ) : (
                                  <i className="fa-solid fa-floppy-disk" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteProvince(index)}
                                disabled={saving}
                                className="text-[#FF3B30] hover:text-[#FF3B30]/80"
                              >
                                <i className="fa-solid fa-trash" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
