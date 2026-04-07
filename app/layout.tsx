import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jean Rufino',
  description: 'Personal site',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
