import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, AlertTriangle, MessageSquare, RefreshCw, Lightbulb, FileText, Trash2, Shield } from 'lucide-react'
import { contractsApi, negotiationApi } from '../api'
import FairnessScore from '../components/ui/FairnessScore'
import Spinner from '../components/ui/Spinner'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { NegotiationMessage } from '../types'

const fmt = (val?: number | null, prefix = '$') =>
  val != null ? `${prefix}${val.toLocaleString()}` : '—'

const SLARow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center py-3 border-b border-purple-900/20 last:border-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-semibold text-slate-200">{value}</span>
  </div>
)

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

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>()
  const contractId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [threadId, setThreadId] = useState<number | undefined>()
  const [messages, setMessages] = useState<NegotiationMessage[]>([])
  const [deleting, setDeleting] = useState(false)

  const { data: contract, isLoading: cLoading, refetch } = useQuery({
    queryKey: ['contract', contractId],
    queryFn: () => contractsApi.get(contractId),
    refetchInterval: 4000,
  })

  const { data: sla } = useQuery({
    queryKey: ['sla', contractId],
    queryFn: () => contractsApi.getSLA(contractId),
    enabled: contract?.doc_status === 'extracted',
  })

  const { data: clauses } = useQuery({
    queryKey: ['clauses', contractId],
    queryFn: () => contractsApi.getClauses(contractId),
    enabled: contract?.doc_status === 'extracted',
  })

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this contract?')) return
    setDeleting(true)
    try {
      await contractsApi.delete(contractId)
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      toast.success('Contract deleted')
      navigate('/contracts')
    } catch {
      toast.error('Failed to delete contract')
    } finally {
      setDeleting(false)
    }
  }

  const handleRefresh = () => {
    refetch()
    toast.success('Refreshed!')
  }

  const sendChat = async (text: string) => {
    if (!text.trim()) return
    const userMsg: NegotiationMessage = {
      id: Date.now(),
      sender_role: 'user',
      body: text,
      sent_at: new Date().toISOString(),
    }
    setMessages((m) => [...m, userMsg])
    setChatInput('')
    setChatLoading(true)
    try {
      const result = await negotiationApi.chat(text, contractId, threadId)
      setThreadId(result.thread_id)
      const aiMsg: NegotiationMessage = {
        id: Date.now() + 1,
        sender_role: 'assistant',
        body: result.response,
        suggested_text: result.suggested_message,
        sent_at: new Date().toISOString(),
      }
      setMessages((m) => [...m, aiMsg])
    } catch {
      toast.error('Failed to get response')
    } finally {
      setChatLoading(false)
    }
  }

  if (cLoading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (!contract) return <div className="p-8 text-slate-500">Contract not found.</div>

  const isProcessing = contract.doc_status === 'processing' || contract.doc_status === 'uploaded'

  let negotiationPoints: string[] = []
  try {
    const parsed = JSON.parse(contract.notes || '{}')
    negotiationPoints = parsed.negotiation_points || []
  } catch {
    negotiationPoints = []
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/contracts" className="p-2 rounded-xl hover:bg-purple-900/30 text-slate-400 hover:text-white transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">
            {contract.dealer_offer_name || `Contract #${contract.id}`}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-slate-500 uppercase">{contract.contract_type ?? 'UNKNOWN'}</span>
            <span className={`badge-${contract.doc_status === 'extracted' ? 'green' : contract.doc_status === 'failed' ? 'red' : 'yellow'}`}>
              {contract.doc_status}
            </span>
          </div>
        </div>
        <button onClick={handleRefresh} className="btn-secondary">
          <RefreshCw size={14} /> Refresh
        </button>
        <button onClick={handleDelete} disabled={deleting} className="btn-secondary text-red-400 hover:bg-red-900/20">
          {deleting ? <Spinner className="w-4 h-4" /> : <Trash2 size={14} />} Delete
        </button>
      </div>

      {/* Processing */}
      {isProcessing && (
        <div className="card p-10 text-center mb-6">
          <Spinner className="mx-auto mb-4 text-purple-500 w-10 h-10" />
          <h3 className="font-bold text-white text-lg">Analyzing your contract...</h3>
          <p className="text-slate-500 text-sm mt-2">AI is extracting contract details. This takes ~30 seconds.</p>
        </div>
      )}

      {contract.doc_status === 'failed' && (
        <div className="card p-6 mb-6 border-red-800/50 bg-red-900/20">
          <p className="text-red-400 font-medium">❌ Extraction failed. Try re-uploading the document.</p>
        </div>
      )}

      {sla && (
        <div className="space-y-5">

          {/* Plain Summary */}
          {contract.notes && (
            <div className="card p-6 border-purple-800/40 bg-purple-900/10">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={18} className="text-purple-400" />
                <h3 className="font-bold text-purple-300">Plain Language Summary</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{contract.notes}</p>
            </div>
          )}

          {/* Score + Financial */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-purple-900/40 rounded-xl flex items-center justify-center mb-3">
                <Shield size={20} className="text-purple-400" />
              </div>
              <h3 className="font-bold text-slate-300 mb-4">Fairness Score</h3>
              <FairnessScore score={contract.fairness_score ?? 50} size="lg" />
              {contract.red_flag_level === 'high' && (
                <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-900/20 px-3 py-1.5 rounded-xl border border-red-800/30">
                  <AlertTriangle size={14} /> High Risk
                </div>
              )}
            </div>

            <div className="card p-6 lg:col-span-2">
              <h3 className="font-bold text-white mb-3">💰 Financial Terms</h3>
              <SLARow label="Contract Type" value={contract.contract_type?.toUpperCase() ?? '—'} />
              <SLARow label="Monthly Payment" value={fmt(sla.monthly_payment)} />
              <SLARow label="Down Payment" value={fmt(sla.down_payment)} />
              <SLARow label="APR" value={sla.apr_percent ? `${sla.apr_percent}%` : '—'} />
              <SLARow label="Money Factor" value={sla.money_factor ? String(sla.money_factor) : '—'} />
              <SLARow label="Term" value={sla.term_months ? `${sla.term_months} months` : '—'} />
              <SLARow label="MSRP" value={fmt(sla.msrp)} />
              <SLARow label="Cap Cost" value={fmt(sla.cap_cost)} />
              <SLARow label="Residual Value" value={fmt(sla.residual_value)} />
              <SLARow label="Total Fees" value={fmt(sla.fees_total)} />
            </div>
          </div>

          {/* Mileage */}
          <div className="card p-6">
            <h3 className="font-bold text-white mb-3">🛣️ Mileage & Penalties</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Annual Mileage', value: sla.mileage_allowance_yr ? `${sla.mileage_allowance_yr.toLocaleString()} mi` : '—' },
                { label: 'Overage Fee', value: sla.mileage_overage_fee ? `$${sla.mileage_overage_fee}/mi` : '—' },
                { label: 'Early Termination', value: fmt(sla.early_termination_fee) },
                { label: 'Disposition Fee', value: fmt(sla.disposition_fee) },
                { label: 'Purchase Option', value: fmt(sla.purchase_option_price) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#16213e] rounded-xl p-3 border border-purple-900/20">
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p className="font-semibold text-slate-200 text-sm">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Negotiation Points */}
          {negotiationPoints.length > 0 && (
            <div className="card p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Lightbulb size={18} className="text-yellow-400" />
                Negotiation Suggestions ({negotiationPoints.length})
              </h3>
              <div className="space-y-2">
                {negotiationPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-yellow-900/20 rounded-xl border border-yellow-800/30">
                    <span className="text-yellow-400 font-bold text-sm shrink-0 w-6 h-6 bg-yellow-900/40 rounded-lg flex items-center justify-center">{i + 1}</span>
                    <p className="text-sm text-yellow-200">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Red Flags */}
          {clauses && clauses.length > 0 && (
            <div className="card p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-400" />
                Red Flags ({clauses.length})
              </h3>
              <div className="space-y-2">
                {clauses.map((clause) => (
                  <div key={clause.id} className="flex items-start gap-3 p-3 bg-red-900/20 rounded-xl border border-red-800/30">
                    <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-300">{clause.clause_type?.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-sm text-red-400 mt-0.5">{clause.text_snippet}</p>
                      {clause.comment && <p className="text-xs text-red-500 mt-1 italic">{clause.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chatbot */}
          <div className="card p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-purple-400" />
              Ask About This Contract
            </h3>

            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  'What is my total payable amount?',
                  'Is this interest rate high?',
                  'What are the biggest risks?',
                  'How can I negotiate better terms?',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => sendChat(q)}
                    className="px-3 py-1.5 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-800/40 rounded-full text-sm text-purple-300 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.sender_role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.sender_role === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-sm'
                      : 'bg-[#16213e] text-slate-300 border border-purple-900/30 rounded-tl-sm'
                  }`}>
                    {msg.sender_role === 'user' ? (
                      <p>{msg.body}</p>
                    ) : (
                      <SimpleMarkdown text={msg.body} className="text-sm" />
                    )}
                    {msg.suggested_text && (
                      <div className="mt-3 p-3 bg-emerald-900/30 rounded-xl border border-emerald-800/30">
                        <p className="text-xs font-semibold text-emerald-400 mb-1">📨 Suggested dealer message:</p>
                        <SimpleMarkdown text={msg.suggested_text} className="text-xs text-emerald-300" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#16213e] border border-purple-900/30 rounded-2xl px-4 py-3">
                    <Spinner className="text-purple-400" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="Ask anything about this contract..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(chatInput) }
                }}
                disabled={chatLoading}
              />
              <button
                onClick={() => sendChat(chatInput)}
                disabled={!chatInput.trim() || chatLoading}
                className="btn-primary px-5"
              >
                Send
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
