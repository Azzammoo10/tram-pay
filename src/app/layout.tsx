import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tram Pay — Billettique Tramway Rabat-Salé',
  description: 'Achetez et gérez vos titres de transport pour le Tramway Rabat-Salé',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="h-full" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-screen bg-surface antialiased">{children}</body>
    </html>
  )
}
