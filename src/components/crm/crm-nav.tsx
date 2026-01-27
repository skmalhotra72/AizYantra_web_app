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
  ChevronDown,
  Bell,
  Search,
  Menu,
  Brain,
  Lightbulb,
  Phone,
  MessageSquare,
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
  photo_url?: string
}

interface NavItem {
  name: string
  href?: string
  icon: any
  children?: NavItem[]
  badge?: number
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/crm', icon: LayoutDashboard },
  { 
    name: 'Leads', 
    icon: Users,
    children: [
      { name: 'All Leads', href: '/crm/leads', icon: Users },
      { name: 'Voice Agent', href: '/crm/leads?source=voice_agent', icon: Phone },
      { name: 'AI Assessment', href: '/crm/leads?source=ai_assessment', icon: Brain },
      { name: 'Voice Calls', href: '/crm/leads?source=voice_call', icon: MessageSquare },
    ]
  },
  { 
    name: 'Innovation', 
    icon: Lightbulb,
    children: [
      { name: 'Dashboard', href: '/crm/innovation', icon: LayoutDashboard },
      { name: 'Submit Idea', href: '/crm/innovation/ideas/new', icon: Lightbulb },
    ]
  },
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Leads', 'Innovation'])

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
        .select('name, role')
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

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(m => m !== menuName)
        : [...prev, menuName]
    )
  }

  const isMenuExpanded = (menuName: string) => {
    return expandedMenus.includes(menuName)
  }

  const isItemActive = (item: NavItem): boolean => {
    if (item.href) {
      // Extract base path without query params for comparison
      const basePath = item.href.split('?')[0]
      const currentBasePath = pathname.split('?')[0]
      
      return currentBasePath === basePath || 
        (basePath !== '/crm' && currentBasePath.startsWith(basePath))
    }
    if (item.children) {
      return item.children.some(child => isItemActive(child))
    }
    return false
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'team_member': 'Team Member',
      'CEO': 'CEO',
      'CPO': 'CPO',
      'CMO': 'CMO',
      'CTO': 'CTO',
      'Director Business Development': 'Director BizDev',
      'Engineer': 'Engineer',
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

  const renderNavItem = (item: NavItem, isChild: boolean = false) => {
    const isActive = isItemActive(item)
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = isMenuExpanded(item.name)

    if (hasChildren && !isCollapsed) {
      // Parent item with children
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleMenu(item.name)}
            className={`
              w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all
              ${isActive 
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-teal-400' : ''}`} />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          
          {/* Children */}
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-2">
              {item.children.map(child => renderNavItem(child, true))}
            </div>
          )}
        </div>
      )
    }

    // Regular item or child item
    if (item.href) {
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
            ${isChild ? 'text-sm' : ''}
          `}
          title={isCollapsed ? item.name : undefined}
        >
          <item.icon className={`w-${isChild ? '4' : '5'} h-${isChild ? '4' : '5'} shrink-0 ${isActive ? 'text-teal-400' : ''}`} />
          {!isCollapsed && <span className={`${isChild ? 'text-xs' : 'text-sm'} font-medium`}>{item.name}</span>}
        </Link>
      )
    }

    return null
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
          {navItems.map(item => renderNavItem(item))}
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