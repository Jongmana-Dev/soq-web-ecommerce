'use client'

type Props = {
  title: string
  description?: string
  action?: React.ReactNode
}

export default function AdminPageHeader({ title, description, action }: Props) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-[#1D1D1F]">{title}</h1>
        {description && <p className="text-[15px] text-[#86868B] mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
