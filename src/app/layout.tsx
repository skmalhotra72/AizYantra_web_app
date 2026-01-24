import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ConditionalLayout } from '@/components/layout/conditional-layout'
import { ThemeProvider } from '@/providers/theme-provider'
import { TriptiFloatingWidget } from '@/components/voice-agent'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AIzYantra | AI Consulting & Automation Engineering',
  description: 'Transform your business with intelligent AI solutions. We engineer AI & automation systems that deliver real results.',
  keywords: ['AI consulting', 'automation engineering', 'voice agents', 'AI integration', 'process automation', 'n8n', 'workflow automation'],
  authors: [{ name: 'AIzYantra' }],
  openGraph: {
    title: 'AIzYantra | AI Consulting & Automation Engineering',
    description: 'Transform your business with intelligent AI solutions.',
    url: 'https://aizyantra.com',
    siteName: 'AIzYantra',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          {/* Global Background */}
          <div className="fixed inset-0 -z-10">
            {/* Base background */}
            <div className="absolute inset-0 bg-[hsl(240,5%,96%)] dark:bg-[hsl(220,15%,8%)] transition-colors duration-500"></div>
            {/* Grid pattern - Stripe style */}
            <div className="absolute inset-0 bg-grid-stripe opacity-40 dark:opacity-20"></div>
            {/* Gradient mesh */}
            <div className="absolute inset-0 bg-gradient-mesh opacity-60 dark:opacity-40"></div>
          </div>
          
          {/* Page Content */}
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          
          {/* Tripti Floating Avatar Widget - Pre-loads 3D avatar on page load */}
          <TriptiFloatingWidget position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
