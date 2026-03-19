export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ECEDEA]">
      <div className="flex flex-col items-center gap-4">
        <img src="/logo.svg" alt="SOQ" className="h-10 w-auto opacity-40 animate-pulse" />
        <span className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
}
