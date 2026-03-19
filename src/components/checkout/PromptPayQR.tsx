'use client'

import generatePayload from 'promptpay-qr'
import { QRCodeSVG } from 'qrcode.react'

interface PromptPayQRProps {
  amount: number
  promptpayId: string
}

export default function PromptPayQR({ amount, promptpayId }: PromptPayQRProps) {
  if (!promptpayId || !amount) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="w-[256px] h-[256px] border border-neutral-200 p-1 flex items-center justify-center">
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
        size={256}
        level="M"
        includeMargin
        className="border border-neutral-200 p-1"
      />
      <p className="text-xs text-neutral-400">PromptPay: {promptpayId}</p>
    </div>
  )
}
