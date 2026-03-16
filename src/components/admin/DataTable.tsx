'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

export type Column<T> = {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
  className?: string
}

type Props<T> = {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  searchKeys?: (keyof T)[]
  onRowClick?: (item: T) => void
  actions?: (item: T) => React.ReactNode
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  searchable,
  searchPlaceholder = 'ค้นหา...',
  searchKeys,
  onRowClick,
  actions,
}: Props<T>) {
  const [search, setSearch] = useState('')

  const filtered = search && searchKeys
    ? data.filter((item) =>
        searchKeys.some((key) => {
          const val = item[key]
          return typeof val === 'string' && val.toLowerCase().includes(search.toLowerCase())
        }),
      )
    : data

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
        {searchable && (
          <div className="p-5 border-b border-[#E8E8ED]">
            <Skeleton className="h-10 w-72" />
          </div>
        )}
        <div className="p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
      {searchable && (
        <div className="p-5 border-b border-[#E8E8ED]">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="max-w-md h-10 text-[15px] bg-[#F5F5F7] border-[#D2D2D7] focus:border-[#007AFF] focus:ring-[#007AFF]/20"
          />
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow className="border-[#E8E8ED] hover:bg-transparent">
            {columns.map((col) => (
              <TableHead key={col.key} className={`text-[#86868B] text-[14px] font-medium ${col.className ?? ''}`}>
                {col.label}
              </TableHead>
            ))}
            {actions && <TableHead className="text-[#86868B] text-[14px] font-medium w-28">จัดการ</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions ? 1 : 0)}
                className="text-center py-12 text-[#86868B]"
              >
                ไม่พบข้อมูล
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((item) => (
              <TableRow
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={`border-[#E8E8ED] ${onRowClick ? 'cursor-pointer hover:bg-[#F5F5F7]' : ''}`}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render
                      ? col.render(item)
                      : String((item as any)[col.key] ?? '')}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {actions(item)}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
