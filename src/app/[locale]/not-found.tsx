import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ECEDEA] px-4">
      <div className="text-center max-w-md">
        <h1 className="font-poppins text-8xl font-extralight text-[var(--accent)] mb-4">404</h1>
        <h2 className="font-poppins text-2xl font-light text-neutral-800 mb-3">
          ไม่พบหน้าที่ต้องการ
        </h2>
        <p className="text-neutral-500 font-light mb-8">
          หน้าที่คุณกำลังมองหาอาจถูกย้าย ลบ หรือไม่เคยมีอยู่
        </p>
        <Link
          href="/th"
          className="inline-flex h-12 items-center justify-center bg-[var(--accent)] px-8 font-prompt text-sm font-normal text-black hover:brightness-110 transition-all"
        >
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  )
}
