import * as React from 'react'
import { cn } from '@/lib/utils'

// ใช้ type alias (ไม่ใช่ interface ว่าง)
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-[10px] border border-border bg-transparent px-3.5 py-2 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/30 focus-visible:border-[#007AFF]',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input } 
