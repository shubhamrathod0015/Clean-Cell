import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Data Management Dashboard',
  description: 'Created with Next.js, Tailwind CSS, and Shadcn UI',
  generator: 'harshtr8',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
