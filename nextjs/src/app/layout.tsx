import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Yugioh Search',
  description: 'Yu-Gi-Oh Forbidden Memories card search',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
