'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  const isCRMRoute = pathname?.startsWith('/crm')
  const isPortalRoute = pathname?.startsWith('/portal')
  const isLoginRoute = pathname === '/login'
  const isAuthRoute = pathname?.startsWith('/auth')
  
  // Hide header and footer for CRM, Portal, and Login routes
  const hideLayout = isCRMRoute || isPortalRoute || isLoginRoute || isAuthRoute
  
  return (
    <div className="relative flex min-h-screen flex-col">
      {!hideLayout && <Header />}
      <main className="flex-1">{children}</main>
      {!hideLayout && <Footer />}
    </div>
  )
}