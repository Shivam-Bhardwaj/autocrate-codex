import Link from 'next/link'
import { ReactNode } from 'react'

const navItems = [
  { href: '/design', label: 'Design Studio' },
  { href: '/library', label: 'Template Library' },
  { href: '/validation', label: 'Validation Center' },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold text-primary-200">
            AutoCrate Dashboard
          </Link>
          <nav className="flex items-center gap-6 text-sm text-slate-300">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-primary-200">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-slate-950">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">{children}</div>
      </main>
    </div>
  )
}
