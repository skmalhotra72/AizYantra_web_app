import CRMNav from '@/components/crm/crm-nav'

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation Sidebar */}
      <CRMNav />
      
      {/* Main Content */}
      <main className="lg:pl-64 min-h-screen transition-all duration-300">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}