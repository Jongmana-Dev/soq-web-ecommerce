'use client'

import { useEffect, useState, useCallback } from 'react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { adminFetch } from '@/lib/admin-api'
import { useAlertStore } from '@/lib/alert-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import type { Setting } from '@/types/admin'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set())
  const [clearing, setClearing] = useState(false)
  const showAlert = useAlertStore((s) => s.showAlert)

  const handleClearCache = async () => {
    setClearing(true)
    try {
      const res = await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tags: ['landing', 'reviews', 'certifications', 'settings', 'faqs', 'usage-steps', 'terms', 'brand-history', 'client-logos', 'history', 'about'],
        }),
      })
      if (res.ok) {
        showAlert('success', 'ล้าง Cache สำเร็จ', 'ข้อมูลหน้าเว็บจะอัปเดตทันที')
      } else {
        throw new Error('Failed')
      }
    } catch {
      showAlert('error', 'ล้าง Cache ไม่สำเร็จ', 'กรุณาลองอีกครั้ง')
    } finally {
      setClearing(false)
    }
  }

  const fetchSettings = useCallback(() => {
    setLoading(true)
    adminFetch<Setting[]>('settings')
      .then((data) => {
        setSettings(data)
        const values: Record<string, string> = {}
        data.forEach((s) => {
          values[s.key] = s.value
        })
        setEditValues(values)
      })
      .catch(() => showAlert('error', 'ไม่สามารถโหลดการตั้งค่าได้'))
      .finally(() => setLoading(false))
  }, [showAlert])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async (setting: Setting) => {
    const newValue = editValues[setting.key]
    if (newValue === setting.value) return

    setSavingKeys((prev) => new Set(prev).add(setting.key))
    try {
      await adminFetch(`settings/${setting.key}`, {
        method: 'PUT',
        body: { value: newValue },
      })
      setSettings((prev) =>
        prev.map((s) => (s.key === setting.key ? { ...s, value: newValue } : s))
      )
      const displayName = setting.description || setting.key
      showAlert('success', 'บันทึกสำเร็จ', `อัปเดต "${displayName}" เรียบร้อยแล้ว`)
    } catch (err) {
      showAlert('error', 'บันทึกไม่สำเร็จ', err instanceof Error ? err.message : undefined)
    } finally {
      setSavingKeys((prev) => {
        const next = new Set(prev)
        next.delete(setting.key)
        return next
      })
    }
  }

  const groups = Array.from(new Set(settings.map((s) => s.group)))

  // Determine whether to show a textarea or text input based on value length
  const isLongValue = (value: string) => value.length > 100 || value.includes('\n')

  const renderInput = (setting: Setting) => {
    const value = editValues[setting.key] ?? setting.value
    const saving = savingKeys.has(setting.key)

    if (isLongValue(value)) {
      return (
        <div className="space-y-2">
          <textarea
            value={value}
            onChange={(e) =>
              setEditValues((prev) => ({ ...prev, [setting.key]: e.target.value }))
            }
            rows={4}
            className="w-full rounded-md border border-[#D2D2D7] bg-white px-3 py-2 text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
            disabled={saving}
          />
          {value !== setting.value && (
            <Button
              size="sm"
              onClick={() => handleSave(setting)}
              disabled={saving}
              className="bg-[#007AFF] text-white hover:bg-[#0056CC]"
            >
              {saving && <i className="fa-solid fa-spinner fa-spin mr-2" />}
              บันทึก
            </Button>
          )}
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={value}
          onChange={(e) =>
            setEditValues((prev) => ({ ...prev, [setting.key]: e.target.value }))
          }
          className="max-w-md bg-white border-[#D2D2D7]"
          disabled={saving}
        />
        {value !== setting.value && (
          <Button
            size="sm"
            onClick={() => handleSave(setting)}
            disabled={saving}
            className="bg-[#007AFF] text-white hover:bg-[#0056CC]"
          >
            {saving && <i className="fa-solid fa-spinner fa-spin mr-2" />}
            บันทึก
          </Button>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <>
        <AdminPageHeader title="ตั้งค่าระบบ" description="จัดการการตั้งค่าทั่วไป" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <AdminPageHeader
        title="ตั้งค่าระบบ"
        description="จัดการการตั้งค่าทั่วไป"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
            disabled={clearing}
            className="border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#F5F5F7]"
          >
            {clearing
              ? <><i className="fa-solid fa-spinner fa-spin mr-2" />กำลังล้าง...</>
              : <><i className="fa-solid fa-arrows-rotate mr-2" />ล้าง Cache เว็บ</>
            }
          </Button>
        }
      />

      {groups.length === 0 ? (
        <p className="text-[#86868B]">ไม่พบการตั้งค่า</p>
      ) : (
        <Tabs defaultValue={groups[0]} className="w-full">
          <TabsList className="mb-4">
            {groups.map((group) => (
              <TabsTrigger key={group} value={group}>
                {group}
              </TabsTrigger>
            ))}
          </TabsList>

          {groups.map((group) => (
            <TabsContent key={group} value={group}>
              <div className="space-y-4">
                {settings
                  .filter((s) => s.group === group)
                  .map((setting) => (
                    <Card key={setting.key} className="bg-white border-[#E8E8ED]">
                      <CardContent className="p-5">
                        <Label className="text-sm font-medium text-[#1D1D1F] mb-2 block">
                          {setting.description || setting.key}
                        </Label>
                        <p className="text-xs text-[#86868B] mb-3">{setting.key}</p>
                        {renderInput(setting)}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </>
  )
}
