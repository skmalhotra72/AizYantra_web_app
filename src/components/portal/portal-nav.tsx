'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/logo'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Receipt,
  LogOut,
  Settings,
  ChevronRight,
  Loader2
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
}

const navItems = [
  {
    label: 'Dashboard',
    href: '/portal/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Projects',
    href: '/portal/projects',
    icon: Briefcase,
  },
  {
    label: 'Documents',
    href: '/portal/documents',
    icon: FileText,
  },
  {
    label: 'Invoices',
    href: '/portal/invoices',
    icon: Receipt,
  },
]

export function PortalNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
        
        if (profile) {
          setUser(profile)
        }
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/portal/login')
    router.refresh()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
            <Logo width={48} height={48} />
          </div>
          <div>
            <div className="font-bold text-white">AIzYantra</div>
            <div className="text-xs text-slate-500">Client Portal</div>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-medium">
            {user ? getInitials(user.full_name) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-white truncate">
              {user?.full_name || 'Loading...'}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {user?.email || ''}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-teal-500 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 space-y-1">
        <Link
          href="/portal/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium text-sm">Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          <span className="font-medium text-sm">
            {isLoggingOut ? 'Signing out...' : 'Sign Out'}
          </span>
        </button>
      </div>
    </div>
  )
}