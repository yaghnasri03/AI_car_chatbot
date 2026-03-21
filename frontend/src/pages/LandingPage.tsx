import { Link } from 'react-router-dom'
import { Shield, Zap, Search, MessageCircle, ArrowRight, Star, CheckCircle } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white overflow-hidden">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-purple-900/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">LeaseIQ</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-slate-400 hover:text-white text-sm transition-colors">Login</Link>
          <Link to="/login" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative px-8 pt-20 pb-16 text-center max-w-5xl mx-auto">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/40 border border-purple-700/50 rounded-full text-purple-300 text-sm mb-6">
            <Star size={14} className="fill-purple-400 text-purple-400" />
            AI Powered Car Contract Analysis
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Understand Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">
              Car Lease Deal
            </span>
            Instantly
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your car lease or loan contract and get instant AI analysis —
            fairness score, red flags, negotiation tips and a smart chatbot to answer all your questions.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link to="/login" className="flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-lg transition-all hover:scale-105">
              Analyze My Contract <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="px-8 py-4 bg-[#1a1a2e] border border-purple-800/50 hover:border-purple-600 text-slate-300 font-semibold rounded-2xl text-lg transition-all">
              View Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="px-8 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-3">Everything You Need</h2>
        <p className="text-slate-500 text-center mb-12">Powerful features to protect you from unfair deals</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Search size={24} />,
              title: 'Smart OCR',
              desc: 'Reads any PDF, scanned document or image automatically',
              color: 'text-purple-400',
              bg: 'bg-purple-900/30',
            },
            {
              icon: <Shield size={24} />,
              title: 'Risk Detection',
              desc: 'Identifies red flags and unfair clauses instantly',
              color: 'text-red-400',
              bg: 'bg-red-900/30',
            },
            {
              icon: <Zap size={24} />,
              title: 'Fairness Score',
              desc: 'AI calculates a 0-100 score for your deal quality',
              color: 'text-yellow-400',
              bg: 'bg-yellow-900/30',
            },
            {
              icon: <MessageCircle size={24} />,
              title: 'AI Chatbot',
              desc: 'Ask anything about your contract in plain language',
              color: 'text-emerald-400',
              bg: 'bg-emerald-900/30',
            },
          ].map((f) => (
            <div key={f.title} className="card p-6 hover:border-purple-700/50 transition-all group">
              <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4 ${f.color} group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="px-8 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-3">How It Works</h2>
        <p className="text-slate-500 text-center mb-12">Get your contract analyzed in 4 simple steps</p>

        <div className="space-y-4">
          {[
            { step: '01', title: 'Upload Contract', desc: 'Upload your PDF, image or scanned document' },
            { step: '02', title: 'AI Analysis', desc: 'Gemini AI reads and understands every clause' },
            { step: '03', title: 'Get Results', desc: 'View fairness score, red flags and suggestions' },
            { step: '04', title: 'Negotiate Better', desc: 'Use AI chatbot to get the best deal' },
          ].map((item) => (
            <div key={item.step} className="card p-5 flex items-center gap-6 hover:border-purple-700/50 transition-all">
              <div className="text-4xl font-black text-purple-800 shrink-0 w-16 text-center">{item.step}</div>
              <div>
                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
              <CheckCircle size={20} className="text-purple-600 shrink-0 ml-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-8 py-16 text-center">
        <div className="max-w-2xl mx-auto card p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Analyze Your Deal?</h2>
          <p className="text-slate-400 mb-8">Join thousands of smart car buyers who use LeaseIQ to get fair deals</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-lg transition-all hover:scale-105">
            Get Started Free <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-purple-900/30 px-8 py-6 text-center text-slate-600 text-sm">
        © 2025 LeaseIQ — Built with FastAPI, React, Google Gemini AI
      </div>

    </div>
  )
}
