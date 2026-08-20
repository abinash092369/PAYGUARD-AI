import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, RefreshCw, Bell, ShieldAlert, Radio, UserCheck } from 'lucide-react'
import { getAlertStats } from '../../api/alerts'

export function Header({ onToggleMobileMenu }) {
  const location = useLocation()
  const [openAlertCount, setOpenAlertCount] = useState(0)

  useEffect(() => {
    getAlertStats()
      .then((data) => {
        if (data && data.open !== undefined) {
          setOpenAlertCount(data.open)
        }
      })
      .catch(() => {})
  }, [location.pathname])

  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard':
        return { title: 'Dashboard', sub: 'Real-Time Fraud Monitoring Console' }
      case '/payment':
      case '/test-payment':
        return { title: 'Test Payment', sub: 'Razorpay Test Mode Fraud Evaluation' }
      case '/payments':
        return { title: 'Payments History', sub: 'Razorpay Verified Payment Telemetry' }
      case '/transactions':
        return { title: 'Transactions', sub: 'Transaction Telemetry Explorer' }
      case '/analyze':
      case '/analyze-risk':
        return { title: 'Analyze Risk', sub: 'Custom Payload Risk Scoring Engine' }
      case '/alerts':
        return { title: 'Security Alerts', sub: 'Active Risk Alert Queue' }
      case '/analytics':
      case '/risk-analytics':
        return { title: 'Risk Analytics', sub: 'Deep Threat Vector & Feature Distribution' }
      default:
        return { title: 'Security Console', sub: 'PayGuard AI Platform' }
    }
  }

  const currentInfo = getPageTitle(location.pathname)

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <header className="sticky top-0 z-30 bg-[#070b17]/90 border-b border-slate-800/80 backdrop-blur-xl h-16 px-4 sm:px-6 flex items-center justify-between">
      
      {/* Left: Mobile Hamburger & Page Titles */}
      <div className="flex items-center space-x-3 min-w-0">
        
        {/* Hamburger Toggle Button on Mobile */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Title & Breadcrumbs */}
        <div className="min-w-0">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="hidden sm:inline">PayGuard AI</span>
            <span className="hidden sm:inline">/</span>
            <span className="font-semibold text-cyan-400 truncate">{currentInfo.title}</span>
          </div>
          <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight truncate leading-tight">
            {currentInfo.title}
          </h1>
        </div>

      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        
        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Notification / Alerts Bell Icon */}
        <Link
          to="/alerts"
          className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all"
          title="Security Alerts Queue"
        >
          <Bell className="w-4 h-4" />
          {openAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
              {openAlertCount}
            </span>
          )}
        </Link>

        {/* Model Engine Status Badge */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-300">Model Engine: Active</span>
        </div>

        {/* SOC Analyst Badge */}
        <div className="hidden sm:flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300">
          <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>SOC Console</span>
        </div>

      </div>

    </header>
  )
}
