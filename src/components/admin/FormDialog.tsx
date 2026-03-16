'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  onSave: () => Promise<void> | void
  children: React.ReactNode
  saveLabel?: string
}

export default function FormDialog({ open, onClose, title, onSave, children, saveLabel = 'บันทึก' }: Props) {
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-white border-[#E8E8ED] text-[#1D1D1F] text-[15px] max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[20px] text-[#1D1D1F] tracking-tight">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {children}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="border-[#D2D2D7] text-[#1D1D1F] text-[15px] hover:bg-[#F5F5F7]"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#007AFF] text-white text-[15px] hover:bg-[#0056CC]"
          >
            {saving ? <i className="fa-solid fa-spinner fa-spin mr-2" /> : null}
            {saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
