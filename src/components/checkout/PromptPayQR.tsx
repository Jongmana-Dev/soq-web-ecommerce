'use client'

import generatePayload from 'promptpay-qr'
import { QRCodeSVG } from 'qrcode.react'

interface PromptPayQRProps {
  amount: number
  promptpayId: string
  size?: number
}

export default function PromptPayQR({ amount, promptpayId, size = 256 }: PromptPayQRProps) {
  if (!promptpayId || !amount) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="border border-neutral-200 p-1 flex items-center justify-center" style={{ width: size, height: size }}>
          <i className="fa-solid fa-spinner fa-spin text-2xl text-neutral-300" />
        </div>
      </div>
    )
  }

  const payload = generatePayload(promptpayId, { amount })

  return (
    <div className="flex flex-col items-center gap-3">
      <QRCodeSVG
        value={payload}
        size={size}
        level="M"
        includeMargin
        className="border border-neutral-200 p-1"
      />
      <p className="text-xs text-neutral-400">PromptPay: {promptpayId}</p>
    </div>
  )
}
