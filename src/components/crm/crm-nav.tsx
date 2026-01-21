'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCircle,
  Kanban,
  FileText,
  Receipt,
  FolderOpen,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Menu,
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
  avatar_url?: string
}

interface TeamMember {
  name: string
  role: string
  department: string
  photo_url?: string
}

const navItems = [
  { name: 'Dashboard', href: '/crm', icon: LayoutDashboard },
  { name: 'Leads', href: '/crm/leads', icon: Users },
  { name: 'Pipeline', href: '/crm/pipeline', icon: Kanban },
  { name: 'Contacts', href: '/crm/contacts', icon: UserCircle },
  { name: 'Organizations', href: '/crm/organizations', icon: Building2 },
  { name: 'Projects', href: '/crm/projects', icon: FolderOpen },
  { name: 'Proposals', href: '/crm/proposals', icon: FileText },
  { name: 'Invoices', href: '/crm/invoices', icon: Receipt },
  { name: 'Analytics', href: '/crm/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/crm/settings', icon: Settings },
]

export default function CRMNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
        
        if (profile) {
          setUser(profile)
        }

        // Fetch team member details
        const { data: member } = await supabase
          .from('team_members')
          .select('name, role, department, photo_url')
          .eq('user_id', authUser.id)
          .single()
        
        if (member) {
          setTeamMember(member)
        }
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'team_member': 'Team Member',
      'ceo': 'CEO',
      'cpo': 'CPO',
      'cmo': 'CMO',
      'cto': 'CTO',
      'tech_lead': 'Tech Lead',
      'analytics_lead': 'Analytics Lead',
      'advisor': 'Advisor',
      'customer_success': 'Customer Success',
    }
    return labels[role] || role
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
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg text-white"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-800 z-40
          transition-all duration-300 flex flex-col
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className={`p-4 border-b border-slate-800 ${isCollapsed ? 'px-2' : ''}`}>
          <Link href="/crm" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-white">AI</span>
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-white">AIzYantra</h1>
                <p className="text-xs text-slate-500">CRM Dashboard</p>
              </div>
            )}
          </Link>
        </div>

        {/* Search (desktop only) */}
        {!isCollapsed && (
          <div className="p-4 border-b border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/crm' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-teal-400' : ''}`} />
                {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-800">
          {user && (
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
              {/* Avatar */}
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center shrink-0">
                {teamMember?.photo_url ? (
                  <img 
                    src={teamMember.photo_url} 
                    alt={user.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-white">
                    {getInitials(user.full_name)}
                  </span>
                )}
              </div>
              
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.full_name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {getRoleLabel(teamMember?.role || user.role)}
                  </p>
                </div>
              )}
              
              {!isCollapsed && (
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Logout button for collapsed state */}
          {isCollapsed && (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full mt-3 p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors flex justify-center"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>
    </>
  )
}