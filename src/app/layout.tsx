import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GRS Smart Park Platform',
  description: 'A connected guest experience and park operations platform.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
