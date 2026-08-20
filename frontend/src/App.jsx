import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Dashboard } from './pages/Dashboard'
import { Transactions } from './pages/Transactions'
import { Analyze } from './pages/Analyze'
import { Analytics } from './pages/Analytics'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
        
        {/* Top Navbar */}
        <Navbar />

        {/* Main Content Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-900/50 py-4 text-center text-xs text-slate-500">
          PayGuard AI • Razorpay AI Builder Internship 2026 — Track 2: AI Risk Manager
        </footer>

      </div>
    </BrowserRouter>
  )
}

export default App
