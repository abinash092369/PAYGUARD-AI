import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { ShieldCheck, LayoutDashboard, ListFilter, Cpu, BarChart2, ShieldAlert } from 'lucide-react'
import { getAlertStats } from '../../api/alerts'

export function Navbar() {
  const [openAlertCount, setOpenAlertCount] = useState(0)

  useEffect(() => {
    getAlertStats()
      .then((data) => {
        if (data && data.open !== undefined) {
          setOpenAlertCount(data.open)
        }
      })
      .catch(() => {})
  }, [])

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/transactions', label: 'Transactions', icon: <ListFilter className="w-4 h-4" /> },
    { to: '/analyze', label: 'Analyze Risk', icon: <Cpu className="w-4 h-4" /> },
    {
      to: '/alerts',
      label: 'Alerts',
      icon: <ShieldAlert className="w-4 h-4" />,
      badge: openAlertCount > 0 ? openAlertCount : null,
    },
    { to: '/analytics', label: 'Risk Analytics', icon: <BarChart2 className="w-4 h-4" /> },
  ]

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-extrabold tracking-tight text-white">PayGuard</span>
              <span className="text-lg font-extrabold tracking-tight text-cyan-400">AI</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 uppercase">
                Risk Console
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden md:block">
              Intelligent Fraud Detection Engine — Razorpay AI Builder 2026
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
              {item.badge !== null && item.badge !== undefined && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Status Indicator */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-medium text-slate-300">Model Engine: Active</span>
        </div>

      </div>
    </header>
  )
}
