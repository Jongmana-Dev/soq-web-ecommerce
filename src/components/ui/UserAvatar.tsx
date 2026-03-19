'use client'

import { useState } from 'react'
import Image from 'next/image'

interface UserAvatarProps {
  src?: string | null
  name?: string | null
  size?: number
  className?: string
}

function getInitial(name?: string | null): string {
  if (!name) return '?'
  // Use first character — works for Thai, English, etc.
  return name.charAt(0).toUpperCase()
}

export default function UserAvatar({ src, name, size = 32, className = '' }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false)

  if (src && !imgError) {
    return (
      <Image
        src={src}
        alt={name ?? 'User'}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div
      className={`rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 font-bold flex-shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.375 }}
    >
      {getInitial(name)}
    </div>
  )
}
