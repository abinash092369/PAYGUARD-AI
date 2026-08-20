import React, { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import {
  ShieldCheck,
  LayoutDashboard,
  Lock,
  CreditCard,
  ListFilter,
  ShieldAlert,
  Cpu,
  BarChart2,
  Radio,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { getAlertStats } from '../../api/alerts'

export function Sidebar({ mobileOpen, onClose }) {
  const [openAlertCount, setOpenAlertCount] = useState(0)
  const location = useLocation()

  useEffect(() => {
    getAlertStats()
      .then((data) => {
        if (data && data.open !== undefined) {
          setOpenAlertCount(data.open)
        }
      })
      .catch(() => {})
  }, [location.pathname])

  const navigationSections = [
    {
      title: 'MAIN',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { to: '/payment', label: 'Test Payment', icon: <Lock className="w-4 h-4" /> },
      ],
    },
    {
      title: 'MONITORING',
      items: [
        { to: '/payments', label: 'Payments History', icon: <CreditCard className="w-4 h-4" /> },
        { to: '/transactions', label: 'Transactions', icon: <ListFilter className="w-4 h-4" /> },
        {
          to: '/alerts',
          label: 'Alerts',
          icon: <ShieldAlert className="w-4 h-4" />,
          badge: openAlertCount > 0 ? openAlertCount : null,
        },
      ],
    },
    {
      title: 'ANALYTICS',
      items: [
        { to: '/analyze', label: 'Analyze Risk', icon: <Cpu className="w-4 h-4" /> },
        { to: '/analytics', label: 'Risk Analytics', icon: <BarChart2 className="w-4 h-4" /> },
      ],
    },
  ]

  const navContent = (
    <div className="flex flex-col h-full bg-[#070b17] text-slate-200 border-r border-slate-800/80 select-none">
      
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <Link to="/" onClick={onClose} className="flex items-center space-x-3 group cursor-pointer">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:border-cyan-400 group-hover:bg-cyan-500/20 transition-all shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="text-base font-extrabold tracking-tight text-white group-hover:text-cyan-300 transition-colors">PayGuard</span>
              <span className="text-base font-extrabold tracking-tight text-cyan-400">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium truncate">
              Intelligent Fraud Engine
            </p>
          </div>
        </Link>

        {/* Close Button on Mobile */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        {navigationSections.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            <p className="px-3 text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
              {section.title}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== null && item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        {/* SYSTEM STATUS CARD */}
        <div className="pt-2">
          <p className="px-3 text-[10px] font-extrabold tracking-wider text-slate-500 uppercase mb-2">
            SYSTEM
          </p>
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Model Engine</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
              <span>Latency: &lt; 50ms</span>
              <span>Acc: 99.4%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Bottom Footer */}
      <div className="p-4 border-t border-slate-800/80 space-y-3 shrink-0 bg-slate-950/40">
        
        {/* Landing Page Return Link */}
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-all group"
        >
          <span className="flex items-center space-x-2">
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span>Landing Page</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Status Indicators */}
        <div className="flex items-center justify-between text-[11px] pt-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
            TEST MODE
          </span>
          <div className="flex items-center space-x-1.5 text-slate-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="font-semibold text-slate-300">Online</span>
          </div>
        </div>

        <p className="text-[10px] text-slate-500 text-center font-mono">
          v1.0.0 • Razorpay AI 2026
        </p>
      </div>

    </div>
  )

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden md:block fixed top-0 left-0 bottom-0 w-64 z-40">
        {navContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          {/* Drawer Panel */}
          <div className="relative flex-1 w-full max-w-xs z-50">
            {navContent}
          </div>
        </div>
      )}
    </>
  )
}
