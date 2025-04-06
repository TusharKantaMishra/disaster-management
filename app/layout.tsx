import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { ClerkProvider } from '@clerk/nextjs'
import { HomeButton } from '@/components/home-button'

export const metadata: Metadata = {
  title: 'Disaster Management',
  description: 'Disaster Management Application',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <HomeButton />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
