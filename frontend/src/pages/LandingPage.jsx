import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Zap,
  Cpu,
  ShieldAlert,
  Lock,
  ArrowRight,
  ChevronRight,
  Menu,
  X,
  CreditCard,
  Search,
  Activity,
  CheckCircle2,
  Database,
  Terminal,
  Server,
  Code2,
  Layers,
  Sparkles,
  Radio
} from 'lucide-react'

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (id) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const features = [
    {
      icon: <Activity className="w-6 h-6 text-cyan-400" />,
      title: 'Real-Time Fraud Detection',
      description:
        'Monitor payment activity and detect suspicious transaction patterns in real time.',
      badge: 'LIVE MONITORING',
    },
    {
      icon: <Cpu className="w-6 h-6 text-blue-400" />,
      title: 'AI Risk Scoring',
      description:
        'Machine-learning models evaluate transaction behavior and generate risk scores.',
      badge: 'ML INFERENCE',
    },
    {
      icon: <ShieldAlert className="w-6 h-6 text-amber-400" />,
      title: 'Automated Threat Alerts',
      description:
        'Identify high-risk transactions and surface security alerts for investigation.',
      badge: 'ALERT ENGINE',
    },
    {
      icon: <Lock className="w-6 h-6 text-emerald-400" />,
      title: 'Secure Payment Monitoring',
      description:
        'Track Razorpay test payments, transaction status, and fraud assessment in one console.',
      badge: 'RAZORPAY INTEGRATION',
    },
  ]

  const workflowSteps = [
    {
      step: '01',
      title: 'Payment',
      description: 'Customer initiates payment via Razorpay test mode or API request.',
      icon: <CreditCard className="w-6 h-6 text-cyan-400" />,
    },
    {
      step: '02',
      title: 'Transaction Analysis',
      description: 'Payload attributes, IP, geolocation, and payment rail metadata are parsed.',
      icon: <Search className="w-6 h-6 text-blue-400" />,
    },
    {
      step: '03',
      title: 'AI Risk Scoring',
      description: 'Machine learning model evaluates transaction features & calculates risk score.',
      icon: <Cpu className="w-6 h-6 text-indigo-400" />,
    },
    {
      step: '04',
      title: 'Fraud Decision',
      description: 'System automatically flags high-risk payments or approves safe transactions.',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
    },
  ]

  const techStack = [
    {
      name: 'React',
      category: 'Frontend Framework',
      description: 'Fast interactive UI with Vite build system',
      icon: <Code2 className="w-5 h-5 text-cyan-400" />,
    },
    {
      name: 'FastAPI',
      category: 'Backend REST API',
      description: 'High-performance async Python framework',
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
    },
    {
      name: 'Python',
      category: 'Core Runtime',
      description: 'Robust language for ML & data processing',
      icon: <Terminal className="w-5 h-5 text-amber-400" />,
    },
    {
      name: 'PostgreSQL',
      category: 'Production DB',
      description: 'Reliable relational storage for transactions',
      icon: <Database className="w-5 h-5 text-blue-400" />,
    },
    {
      name: 'SQLite',
      category: 'Embedded DB',
      description: 'Lightweight local database support',
      icon: <Server className="w-5 h-5 text-purple-400" />,
    },
    {
      name: 'Machine Learning',
      category: 'Risk Engine',
      description: 'Trained model for fraud probability scoring',
      icon: <Cpu className="w-5 h-5 text-rose-400" />,
    },
    {
      name: 'Razorpay',
      category: 'Payment Gateway',
      description: 'Test mode integration & webhook handling',
      icon: <CreditCard className="w-5 h-5 text-cyan-300" />,
    },
    {
      name: 'REST API',
      category: 'Architecture',
      description: 'Clean RESTful JSON API endpoints',
      icon: <Layers className="w-5 h-5 text-teal-400" />,
    },
  ]

  return (
    <div className="min-h-screen bg-[#070b17] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white overflow-x-hidden">
      
      {/* Background Subtle Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-1/3 w-[30rem] h-[30rem] bg-cyan-900/10 rounded-full blur-3xl"></div>
      </div>

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#070b17]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Left Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:border-cyan-400 group-hover:bg-cyan-500/20 transition-all">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white">PayGuard</span>
                <span className="text-xl font-extrabold tracking-tight text-cyan-400">AI</span>
              </div>
              <span className="text-[10px] tracking-wider text-slate-400 uppercase font-semibold block">
                Intelligent Fraud Detection
              </span>
            </div>
          </Link>

          {/* Desktop Right Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-300">
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('technology')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Technology
            </button>
            <Link
              to="/dashboard"
              className="hover:text-cyan-400 transition-colors"
            >
              Dashboard
            </Link>
          </nav>

          {/* Desktop Open Dashboard CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all transform hover:-translate-y-0.5"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 border-b border-slate-800 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200">
            <div className="flex flex-col space-y-3 font-semibold text-slate-200">
              <button
                onClick={() => scrollToSection('features')}
                className="text-left py-2 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-left py-2 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('technology')}
                className="text-left py-2 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                Technology
              </button>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-cyan-400 transition-colors"
              >
                Dashboard
              </Link>
            </div>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center space-x-2 w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-cyan-500/20"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intelligent Fraud Detection Engine</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Stop Fraud{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Before It Happens.
              </span>
            </h1>

            {/* Subtitle / Supporting text */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              PayGuard AI combines real-time payment monitoring, machine learning risk scoring, and automated threat detection to identify suspicious transactions before they become costly.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold px-8 py-4 rounded-xl shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all transform hover:-translate-y-0.5 text-base"
              >
                <ShieldCheck className="w-5 h-5 text-slate-950" />
                <span>Launch Security Console</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={() => scrollToSection('features')}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold px-6 py-4 rounded-xl transition-all cursor-pointer text-base"
              >
                <span>View Features</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Quick Metrics Strip */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              <div>
                <p className="text-2xl font-black text-white">100%</p>
                <p className="text-xs text-slate-400 font-medium">Real-Time Evaluation</p>
              </div>
              <div>
                <p className="text-2xl font-black text-cyan-400">&lt; 50ms</p>
                <p className="text-xs text-slate-400 font-medium">Model Inference</p>
              </div>
              <div>
                <p className="text-2xl font-black text-blue-400">Razorpay</p>
                <p className="text-xs text-slate-400 font-medium">Test Mode Ready</p>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Fraud Monitoring Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-cyan-950/40 relative group overflow-hidden">
              
              {/* Top Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="ml-2 text-xs font-mono text-slate-400">PAYGUARD_AI_CONSOLE</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-500/30">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>MONITORING ACTIVE</span>
                </div>
              </div>

              {/* Central Radar Graphic */}
              <div className="my-6 relative flex items-center justify-center py-6">
                
                {/* Radar Concentric Circles */}
                <div className="w-56 h-56 rounded-full border border-cyan-500/20 flex items-center justify-center relative bg-slate-950/60">
                  <div className="w-40 h-40 rounded-full border border-cyan-500/30 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border border-cyan-500/40 flex items-center justify-center bg-cyan-500/5">
                      <ShieldCheck className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
                    </div>
                  </div>

                  {/* Axis lines */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-[1px] bg-cyan-500/10"></div>
                    <div className="h-full w-[1px] bg-cyan-500/10 absolute"></div>
                  </div>

                  {/* Pulse Dot Nodes */}
                  <div className="absolute top-8 right-12 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
                  <div className="absolute bottom-10 left-10 w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  <div className="absolute top-14 left-14 w-2 h-2 rounded-full bg-rose-400 animate-pulse"></div>
                </div>

              </div>

              {/* Simulated Live Transaction Feed */}
              <div className="space-y-2.5">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white">pay_N9k2xL09a</p>
                      <p className="text-[10px] text-slate-400">UPI • ₹1,250.00</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      RISK SCORE: 0.04
                    </span>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">PASSED</p>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white">pay_Tx992mP1q</p>
                      <p className="text-[10px] text-slate-400">CREDIT CARD • ₹89,500.00</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      RISK SCORE: 0.94
                    </span>
                    <p className="text-[9px] text-rose-400 font-mono mt-0.5">HIGH RISK ALERT</p>
                  </div>
                </div>
              </div>

              {/* Glass Footer note inside card */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between items-center font-mono">
                <span>MODEL ENGINE: XGBoost + RF</span>
                <span className="text-cyan-400 font-bold">LATENCY: 14ms</span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Intelligent Fraud Protection Features
          </h2>
          <p className="text-slate-400 text-base">
            Designed for modern fintech applications needing enterprise-grade risk analysis and automated payment threat detection.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-cyan-950/10 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-cyan-500/30 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                <Link to="/dashboard" className="flex items-center">
                  <span>Explore in Dashboard</span>
                  <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 sm:p-12">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold text-blue-400 uppercase tracking-widest">
              Workflow & Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How PayGuard AI Protects Payments
            </h2>
            <p className="text-slate-400 text-base">
              A transparent, end-to-end telemetry pipeline from transaction authorization to instant decisioning.
            </p>
          </div>

          {/* 4-Step Visual Flow */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {workflowSteps.map((step, index) => (
              <div key={index} className="relative group">
                
                {/* Step Card */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-cyan-500/40 transition-all h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        {step.icon}
                      </div>
                      <span className="text-2xl font-black text-slate-600 font-mono group-hover:text-cyan-400 transition-colors">
                        {step.step}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">
                      {step.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 flex items-center text-[11px] font-mono text-slate-500">
                    <span>STATUS: ACTIVE</span>
                  </div>
                </div>

                {/* Connecting Arrow for Desktop */}
                {index < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20 text-slate-600">
                    <ChevronRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

      </section>

      {/* TECHNOLOGY SECTION */}
      <section id="technology" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Verified Stack
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Powered by Project Technologies
          </h2>
          <p className="text-slate-400 text-base">
            Built using modern, high-performance tools powering the PayGuard AI backend and frontend architecture.
          </p>
        </div>

        {/* Tech Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {techStack.map((tech, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all flex items-start space-x-4"
            >
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                {tech.icon}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-white text-base">{tech.name}</h3>
                </div>
                <p className="text-[11px] font-semibold text-cyan-400 mb-1">{tech.category}</p>
                <p className="text-xs text-slate-400 leading-snug">{tech.description}</p>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* SECURITY CONSOLE CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl shadow-cyan-950/50">
          
          {/* Subtle Graphic background element */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
              <span>LIVE SECURITY CONSOLE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Ready to analyze your payment risk?
            </h2>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Enter the PayGuard AI security console and monitor transactions, analyze risk, and investigate fraud alerts.
            </p>

            <div className="pt-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold px-8 py-4 rounded-xl shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all transform hover:-translate-y-0.5 text-base"
              >
                <span>Open PayGuard AI Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left Brand Details */}
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-lg font-black text-white">PayGuard</span>
              <span className="text-lg font-black text-cyan-400">AI</span>
            </div>
            <p className="text-xs font-semibold text-cyan-400">
              Intelligent Fraud Detection Engine
            </p>
            <p className="text-xs text-slate-400">
              AI-powered payment fraud monitoring and risk analysis.
            </p>
          </div>

          {/* Quick Footer Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-400">
            <button onClick={() => scrollToSection('features')} className="hover:text-cyan-400 transition-colors cursor-pointer">
              Features
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-cyan-400 transition-colors cursor-pointer">
              How It Works
            </button>
            <button onClick={() => scrollToSection('technology')} className="hover:text-cyan-400 transition-colors cursor-pointer">
              Technology
            </button>
            <Link to="/dashboard" className="hover:text-cyan-400 transition-colors">
              Dashboard
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-xs text-slate-500 text-center md:text-right font-mono">
            <p>© 2026 PayGuard AI</p>
            <p className="text-[10px] text-slate-600">Razorpay AI Builder 2026</p>
          </div>

        </div>
      </footer>

    </div>
  )
}
