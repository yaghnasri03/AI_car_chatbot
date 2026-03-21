import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart2, Trophy, Zap } from 'lucide-react'
import { contractsApi, priceApi } from '../api'
import { CompareResult } from '../types'
import toast from 'react-hot-toast'
import Spinner from '../components/ui/Spinner'

const SimpleMarkdown = ({ text, className = '' }: { text: string; className?: string }) => {
  const lines = text.split('\n')
  return (
    <div className={className}>
      {lines.map((line, i) => {
        const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#c4b5fd">$1</strong>')
        const italicBoldLine = boldLine.replace(/\*(.*?)\*/g, '<em>$1</em>')
        if (line.startsWith('### ') || line.startsWith('## ')) {
          return <p key={i} className="font-bold text-purple-300 text-base mt-3 mb-1" dangerouslySetInnerHTML={{ __html: line.replace(/^#{2,3} /, '') }} />
        }
        if (line.startsWith('# ')) {
          return <p key={i} className="font-bold text-purple-300 text-lg mt-3 mb-1" dangerouslySetInnerHTML={{ __html: line.replace('# ', '') }} />
        }
        if (line.match(/^[\s]*[\*\-•] /)) {
          return (
            <div key={i} className="flex items-start gap-2 my-0.5">
              <span className="text-purple-400 shrink-0 mt-1">•</span>
              <span dangerouslySetInnerHTML={{ __html: italicBoldLine.replace(/^[\s]*[\*\-•] /, '') }} />
            </div>
          )
        }
        if (line.trim() === '') return <div key={i} className="h-2" />
        return <p key={i} className="my-0.5" dangerouslySetInnerHTML={{ __html: italicBoldLine }} />
      })}
    </div>
  )
}

export default function ComparePage() {
  const [primary, setPrimary] = useState<number | null>(null)
  const [compared, setCompared] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CompareResult | null>(null)

  const { data } = useQuery({ queryKey: ['contracts'], queryFn: contractsApi.list })
  const extractedContracts = (data?.contracts ?? []).filter((c) => c.doc_status === 'extracted')

  const compare = async () => {
    if (!primary || !compared) return
    if (primary === compared) { toast.error('Select two different contracts'); return }
    setLoading(true)
    try {
      const res = await priceApi.compare(primary, compared)
      setResult(res)
    } catch {
      toast.error('Comparison failed — ensure both contracts are fully extracted')
    } finally {
      setLoading(false)
    }
  }

  const fmt = (v?: number | null) => v != null ? `$${v.toLocaleString()}` : '—'

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <BarChart2 size={16} className="text-white" />
          </div>
          Compare Deals
        </h1>
        <p className="text-slate-500 text-sm mt-1">Side-by-side AI comparison to find the better deal</p>
      </div>

      {extractedContracts.length < 2 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-800/40">
            <BarChart2 size={32} className="text-purple-400" />
          </div>
          <p className="font-bold text-white text-lg mb-2">Need at least 2 contracts</p>
          <p className="text-slate-500 text-sm">Upload and analyze two contracts to compare them</p>
        </div>
      ) : (
        <>
          {/* Select contracts */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Primary Contract</label>
              <select className="input" value={primary ?? ''} onChange={(e) => setPrimary(Number(e.target.value))}>
                <option value="">Select contract...</option>
                {extractedContracts.map((c) => (
                  <option key={c.id} value={c.id}>{c.dealer_offer_name || `Contract #${c.id}`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Compare With</label>
              <select className="input" value={compared ?? ''} onChange={(e) => setCompared(Number(e.target.value))}>
                <option value="">Select contract...</option>
                {extractedContracts.filter((c) => c.id !== primary).map((c) => (
                  <option key={c.id} value={c.id}>{c.dealer_offer_name || `Contract #${c.id}`}</option>
                ))}
              </select>
            </div>
          </div>

          <button onClick={compare} disabled={!primary || !compared || loading} className="btn-primary mb-8">
            {loading ? <><Spinner className="text-white" /> Comparing...</> : <><Zap size={16} /> Compare Now</>}
          </button>

          {result && (
            <div className="space-y-5">

              {/* Winner Banner */}
              <div className={`card p-8 text-center border-2 ${
                result.winner === 'deal1' ? 'border-purple-500 bg-purple-900/20' :
                result.winner === 'deal2' ? 'border-violet-500 bg-violet-900/20' :
                'border-yellow-600/50 bg-yellow-900/10'
              }`}>
                <Trophy size={36} className="mx-auto mb-3 text-yellow-400" />
                <h2 className="text-2xl font-black text-white">
                  {result.winner === 'tie' ? '🤝 Both deals are equal!' :
                   result.winner === 'deal1' ? '🏆 Primary Contract Wins!' :
                   '🏆 Compared Contract Wins!'}
                </h2>
                {result.savings > 0 && (
                  <div className="mt-3 inline-block bg-emerald-900/30 border border-emerald-700/40 rounded-full px-5 py-2">
                    <p className="text-emerald-400 font-bold">💰 Save {fmt(result.savings)} by choosing the winner!</p>
                  </div>
                )}
              </div>

              {/* Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`card p-5 border-2 ${result.winner === 'deal1' ? 'border-purple-500' : 'border-purple-900/30'}`}>
                  <h3 className="font-bold text-white mb-4 text-center">
                    {result.winner === 'deal1' ? '🏆 ' : ''}Primary Contract
                  </h3>
                  {[
                    ['💳 Monthly', fmt(result.primary.monthly_payment)],
                    ['📊 APR', result.primary.apr_percent ? `${result.primary.apr_percent}%` : '—'],
                    ['🗓️ Term', result.primary.term_months ? `${result.primary.term_months} months` : '—'],
                    ['⬇️ Down', fmt(result.primary.down_payment)],
                    ['🛣️ Mileage', result.primary.mileage_allowance_yr ? `${result.primary.mileage_allowance_yr.toLocaleString()}/yr` : '—'],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex justify-between py-2.5 border-b border-purple-900/20 last:border-0 text-sm">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-semibold text-slate-200">{value}</span>
                    </div>
                  ))}
                </div>

                <div className={`card p-5 border-2 ${result.winner === 'deal2' ? 'border-violet-500' : 'border-purple-900/30'}`}>
                  <h3 className="font-bold text-white mb-4 text-center">
                    {result.winner === 'deal2' ? '🏆 ' : ''}Compared Contract
                  </h3>
                  {[
                    ['💳 Monthly', fmt(result.compared.monthly_payment)],
                    ['📊 APR', result.compared.apr_percent ? `${result.compared.apr_percent}%` : '—'],
                    ['🗓️ Term', result.compared.term_months ? `${result.compared.term_months} months` : '—'],
                    ['⬇️ Down', fmt(result.compared.down_payment)],
                    ['🛣️ Mileage', result.compared.mileage_allowance_yr ? `${result.compared.mileage_allowance_yr.toLocaleString()}/yr` : '—'],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex justify-between py-2.5 border-b border-purple-900/20 last:border-0 text-sm">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-semibold text-slate-200">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Differences */}
              {result.key_differences && result.key_differences.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart2 size={18} className="text-purple-400" />
                    Key Differences
                  </h3>
                  <div className="space-y-2">
                    {result.key_differences.map((diff, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-purple-900/20 rounded-xl border border-purple-800/30">
                        <span className="bg-purple-600 text-white font-bold text-xs rounded-lg w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                        <p className="text-sm text-slate-300">{diff}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Analysis */}
              <div className="card p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Zap size={18} className="text-purple-400" />
                  Detailed AI Analysis
                </h3>
                <div className="bg-[#16213e] rounded-xl p-5 border border-purple-900/20">
                  <SimpleMarkdown text={result.analysis} className="text-sm text-slate-300" />
                </div>
              </div>

            </div>
          )}
        </>
      )}
    </div>
  )
}
