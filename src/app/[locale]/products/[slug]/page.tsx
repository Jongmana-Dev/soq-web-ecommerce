import Navbar from '@/components/sections/Navbar'
import Footer from '@/components/sections/Footer'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { slug, locale } = await params

  return (
    <>
      <Navbar />
      <section className="container py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="card glow">
            <h1 className="display leading-tight">Product: {slug}</h1>
            <p className="text-white/70 mt-3">Locale: {locale}</p>
            <div className="prose prose-invert max-w-none mt-5">
              <p>
                This is a minimal product page placeholder. Replace with real product
                content, gallery, and purchase flow as needed.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-white/70 space-y-2">
              <div>• Premium formulation</div>
              <div>• Safe for stainless</div>
              <div>• Low odor</div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
