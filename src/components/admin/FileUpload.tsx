'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface FileUploadProps {
  value: string
  onChange: (url: string) => void
  accept?: string
  label?: string
  preview?: 'image' | 'video' | 'document'
}

export default function FileUpload({ value, onChange, accept, label, preview = 'image' }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin-proxy/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Upload failed')
      }

      const data = await res.json()
      onChange(data.url)
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    onChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-[#1D1D1F]">{label}</p>}

      {value ? (
        <div className="relative rounded-2xl border border-[#D2D2D7] bg-[#F5F5F7] p-3">
          {/* Preview */}
          <div className="flex items-center gap-3">
            {preview === 'image' && (
              <Image
                src={value}
                alt="Preview"
                width={64}
                height={64}
                className="rounded-xl object-cover w-16 h-16"
                unoptimized
              />
            )}
            {preview === 'video' && (
              <video
                src={value}
                className="rounded-xl w-16 h-16 object-cover"
                muted
              />
            )}
            {preview === 'document' && (
              <div className="w-16 h-16 rounded-xl bg-white border border-[#D2D2D7] flex items-center justify-center">
                <i className="fa-solid fa-file-image text-xl text-[#86868B]" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#86868B] truncate">{value}</p>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="shrink-0 w-8 h-8 rounded-full bg-[#FF3B30]/10 flex items-center justify-center text-[#FF3B30] hover:bg-[#FF3B30]/20 transition-colors"
            >
              <i className="fa-solid fa-xmark text-xs" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-[#007AFF] bg-[#007AFF]/5'
              : 'border-[#D2D2D7] bg-[#F5F5F7] hover:border-[#86868B]'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <i className="fa-solid fa-spinner fa-spin text-xl text-[#007AFF]" />
              <p className="text-sm text-[#86868B]">กำลังอัพโหลด...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <i className="fa-solid fa-cloud-arrow-up text-2xl text-[#86868B]" />
              <p className="text-sm text-[#86868B]">
                ลากไฟล์มาวาง หรือ <span className="text-[#007AFF] font-medium">เลือกไฟล์</span>
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
