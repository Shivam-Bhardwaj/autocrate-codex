import Link from 'next/link'

const highlights = [
  'Parametric crate modeling with deterministic results',
  'Real-time constraint validation and standards compliance',
  'STEP AP242 export with semantic PMI',
  'NX expression automation and health monitoring'
]

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-16 px-6 py-24 text-center">
      <div className="max-w-4xl space-y-8">
        <p className="text-sm uppercase tracking-[0.3em] text-primary-300">AutoCrate Platform</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Production-ready automated crate engineering for Applied Materials
        </h1>
        <p className="text-lg text-slate-300">
          AutoCrate delivers a modern Progressive Web App that merges NX CAD automation, semantic PMI
          workflows, and collaborative engineering tooling into a single cohesive platform.
        </p>
        <ul className="grid gap-3 text-left sm:grid-cols-2">
          {highlights.map((item) => (
            <li key={item} className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <span className="text-sm font-medium text-primary-200">{item}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/(dashboard)/design"
            className="rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-elevation transition hover:bg-primary-400"
          >
            Launch Design Studio
          </Link>
          <Link
            href="/(dashboard)/library"
            className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-primary-500 hover:text-primary-200"
          >
            Explore Template Library
          </Link>
        </div>
      </div>
    </main>
  )
}
