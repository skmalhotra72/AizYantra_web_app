import { PortalNav } from '@/components/portal/portal-nav'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--bg-primary))]">
      <PortalNav />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}