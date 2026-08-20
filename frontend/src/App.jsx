import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { LandingPage } from './pages/LandingPage'
import { Dashboard } from './pages/Dashboard'
import { Payment } from './pages/Payment'
import { Payments } from './pages/Payments'
import { Transactions } from './pages/Transactions'
import { Analyze } from './pages/Analyze'
import { Alerts } from './pages/Alerts'
import { Analytics } from './pages/Analytics'

function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#070b17] text-slate-100 flex font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Fixed Left Sidebar (Desktop) / Slide-out Drawer (Mobile) */}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 transition-all duration-300">
        
        {/* Compact Top Header */}
        <Header onToggleMobileMenu={() => setMobileOpen(!mobileOpen)} />

        {/* Page Content Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <Outlet />
        </main>

        {/* App Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 px-6 text-center text-xs text-slate-500 font-mono">
          PayGuard AI • Razorpay AI Builder Internship 2026 — Track 2: AI Risk Manager (Razorpay Test Mode)
        </footer>

      </div>

    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page Route */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Security Console Dashboard & Tooling Routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/test-payment" element={<Payment />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/analyze-risk" element={<Analyze />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/risk-analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
