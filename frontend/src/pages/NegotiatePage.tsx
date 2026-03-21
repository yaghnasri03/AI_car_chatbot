import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Send, Copy, Zap, Bot, User } from 'lucide-react'
import { negotiationApi } from '../api'
import { NegotiationMessage } from '../types'
import toast from 'react-hot-toast'
import Spinner from '../components/ui/Spinner'

const STARTER_PROMPTS = [
  'Is this a fair monthly payment?',
  'How do I negotiate a lower money factor?',
  'What are the biggest red flags in my contract?',
  'Write me a message to ask for better terms',
  'What should I ask before signing?',
]

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

export default function NegotiatePage() {
  const [searchParams] = useSearchParams()
  const contractId = searchParams.get('contractId') ? Number(searchParams.get('contractId')) : undefined
  const [messages, setMessages] = useState<NegotiationMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [threadId, setThreadId] = useState<number | undefined>()
  const [_suggestedMsg, setSuggestedMsg] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text: string) => {
    if (!text.trim()) return
    const userMsg: NegotiationMessage = {
      id: Date.now(),
      sender_role: 'user',
      body: text,
      sent_at: new Date().toISOString(),
    }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)
    setSuggestedMsg(null)

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
      if (result.suggested_message) setSuggestedMsg(result.suggested_message)
    } catch {
      toast.error('Failed to get response')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] max-w-4xl mx-auto px-6 py-6">

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          AI Negotiation Coach
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {contractId ? `Analyzing Contract #${contractId}` : 'Ask anything about car leases and negotiation'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-purple-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-800/40">
              <Bot size={32} className="text-purple-400" />
            </div>
            <h3 className="font-bold text-white text-lg mb-2">How can I help you negotiate?</h3>
            <p className="text-slate-500 text-sm mb-6">Ask me anything about car leases, loans and negotiation strategies</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="px-4 py-2 bg-purple-900/30 border border-purple-800/40 rounded-full text-sm text-purple-300 hover:bg-purple-900/50 hover:border-purple-600/50 transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.sender_role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender_role !== 'user' && (
              <div className="w-8 h-8 rounded-xl bg-purple-900/40 border border-purple-800/40 flex items-center justify-center shrink-0 mt-1">
                <Bot size={15} className="text-purple-400" />
              </div>
            )}
            <div className={`max-w-[75%]`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.sender_role === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-sm'
                  : 'bg-[#1a1a2e] border border-purple-900/30 text-slate-300 rounded-tl-sm'
              }`}>
                {msg.sender_role === 'user' ? (
                  <p>{msg.body}</p>
                ) : (
                  <SimpleMarkdown text={msg.body} className="text-sm" />
                )}
              </div>
              {msg.suggested_text && (
                <div className="mt-2 p-3 bg-emerald-900/20 border border-emerald-800/30 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-emerald-400">📨 Ready-to-send dealer message</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(msg.suggested_text!); toast.success('Copied!') }}
                      className="text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                    >
                      <Copy size={11} /> Copy
                    </button>
                  </div>
                  <SimpleMarkdown text={msg.suggested_text} className="text-xs text-emerald-300" />
                </div>
              )}
            </div>
            {msg.sender_role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center shrink-0 mt-1">
                <User size={15} className="text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-900/40 border border-purple-800/40 flex items-center justify-center shrink-0">
              <Bot size={15} className="text-purple-400" />
            </div>
            <div className="bg-[#1a1a2e] border border-purple-900/30 rounded-2xl rounded-tl-sm px-4 py-3">
              <Spinner className="text-purple-400" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Ask about your contract or negotiation strategy..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
          disabled={loading}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          className="btn-primary px-5"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
