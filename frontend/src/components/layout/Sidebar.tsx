import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, MessageSquare,
  Search, BarChart2, LogOut, Zap, Menu, X,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { clsx } from 'clsx'
import { useState } from 'react'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/contracts', icon: FileText, label: 'Contracts' },
  { to: '/negotiate', icon: MessageSquare, label: 'Negotiate' },
  { to: '/vin', icon: Search, label: 'VIN Lookup' },
  { to: '/compare', icon: BarChart2, label: 'Compare' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#0f0f1a]/90 backdrop-blur-md border-b border-purple-900/30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg">LeaseIQ</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {nav.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-purple-900/30'
                  )
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* User badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-purple-900/30 border border-purple-800/40 rounded-xl">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <span className="text-sm text-slate-300 max-w-[120px] truncate">
                {user?.full_name || user?.email}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-xl text-sm transition-all"
            >
              <LogOut size={15} />
              Logout
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-purple-900/30 px-4 py-3 space-y-1">
            {nav.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-purple-900/30'
                  )
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/20 transition-all"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </header>
    </>
  )
}
