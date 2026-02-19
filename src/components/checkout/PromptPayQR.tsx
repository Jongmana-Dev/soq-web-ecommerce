'use client'

import generatePayload from 'promptpay-qr'
import { QRCodeSVG } from 'qrcode.react'

interface PromptPayQRProps {
  amount: number
}

const PROMPTPAY_ID = '0612344899'

export default function PromptPayQR({ amount }: PromptPayQRProps) {
  const payload = generatePayload(PROMPTPAY_ID, { amount })

  return (
    <div className="flex flex-col items-center gap-3">
      <QRCodeSVG
        value={payload}
        size={256}
        level="M"
        includeMargin
        className="border border-neutral-200 p-1"
      />
      <p className="text-xs text-neutral-400">PromptPay: {PROMPTPAY_ID}</p>
    </div>
  )
}
