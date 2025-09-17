import type { Metadata } from 'next'
import { ReactNode } from 'react'
import './globals.css'
import { Providers } from './providers/Providers'

export const metadata: Metadata = {
  title: 'AutoCrate Platform',
  description: 'Progressive Web App for automated crate design and NX integration'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
