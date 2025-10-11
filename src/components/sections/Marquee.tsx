export default function Marquee(){
  const logos = [
    'SOQ','FTI','ISO','GMP','FDA','NSF'
  ]
  return (
    <div className="relative border-y border-border/60 py-6">
      <div className="animate-[marquee] whitespace-nowrap will-change-transform">
        <div className="inline-flex gap-12 px-6">
          {Array.from({length:2}).map((_,k)=>(
            <div key={k} className="inline-flex gap-12">
              {logos.map((t,i)=>(
                <span key={i} className="text-sm text-muted-foreground">{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
