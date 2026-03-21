import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FileText, Upload, MessageSquare, Search, BarChart2, AlertTriangle, TrendingUp, Clock } from 'lucide-react'
import { contractsApi } from '../api'
import { useAuthStore } from '../store/authStore'
import Spinner from '../components/ui/Spinner'

export default function Dashboard() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: contractsApi.list,
  })

  const contracts = data?.contracts ?? []
  const extracted = contracts.filter((c) => c.doc_status === 'extracted')
  const redFlags = extracted.filter((c) => c.red_flag_level === 'high').length
  const avgScore = extracted.length
    ? Math.round(extracted.reduce((a, c) => a + (c.fairness_score ?? 0), 0) / extracted.length)
    : 0

  const firstName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{color: '#ffffff'}}>
          Hey, {firstName}! 👋
        </h1>
        <p style={{color: '#94a3b8'}}>Here's your contract activity overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Contracts', value: contracts.length, icon: <FileText size={20} />, color: '#a78bfa', bg: 'rgba(109,40,217,0.2)' },
          { label: 'Analyzed', value: extracted.length, icon: <TrendingUp size={20} />, color: '#34d399', bg: 'rgba(6,78,59,0.2)' },
          { label: 'Red Flags', value: redFlags, icon: <AlertTriangle size={20} />, color: '#f87171', bg: 'rgba(127,29,29,0.2)' },
          { label: 'Avg Score', value: extracted.length ? `${avgScore}/100` : '—', icon: <BarChart2 size={20} />, color: '#fbbf24', bg: 'rgba(113,63,18,0.2)' },
        ].map((stat) => (
          <div key={stat.label} style={{backgroundColor: '#1a1a2e', border: '1px solid rgba(109,40,217,0.2)', borderRadius: '1rem', padding: '1.25rem'}}>
            <div style={{width: '2.5rem', height: '2.5rem', backgroundColor: stat.bg, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, marginBottom: '0.75rem'}}>
              {stat.icon}
            </div>
            <p style={{fontSize: '1.5rem', fontWeight: '700', color: '#ffffff'}}>{stat.value}</p>
            <p style={{fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem'}}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 style={{fontSize: '1.125rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem'}}>Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { to: '/contracts/upload', icon: <Upload size={22} />, title: 'Upload Contract', desc: 'Analyze a new lease or loan PDF', color: '#a78bfa', bg: 'rgba(109,40,217,0.2)' },
            { to: '/negotiate', icon: <MessageSquare size={22} />, title: 'AI Negotiation', desc: 'Get expert negotiation advice', color: '#34d399', bg: 'rgba(6,78,59,0.2)' },
            { to: '/vin', icon: <Search size={22} />, title: 'VIN Lookup', desc: 'Check recalls and vehicle history', color: '#fbbf24', bg: 'rgba(113,63,18,0.2)' },
          ].map((action) => (
            <Link key={action.to} to={action.to} style={{backgroundColor: '#1a1a2e', border: '1px solid rgba(109,40,217,0.2)', borderRadius: '1rem', padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', textDecoration: 'none'}}>
              <div style={{width: '3rem', height: '3rem', backgroundColor: action.bg, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: action.color, flexShrink: 0}}>
                {action.icon}
              </div>
              <div>
                <p style={{fontWeight: '700', color: '#ffffff', marginBottom: '0.25rem'}}>{action.title}</p>
                <p style={{fontSize: '0.875rem', color: '#94a3b8'}}>{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
          <h2 style={{fontSize: '1.125rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <Clock size={18} color="#a78bfa" /> Recent Contracts
          </h2>
          <Link to="/contracts" style={{color: '#a78bfa', fontSize: '0.875rem', textDecoration: 'none'}}>View all →</Link>
        </div>

        {isLoading ? (
          <div style={{display: 'flex', justifyContent: 'center', padding: '2.5rem 0'}}><Spinner /></div>
        ) : contracts.length === 0 ? (
          <div style={{backgroundColor: '#1a1a2e', border: '1px solid rgba(109,40,217,0.2)', borderRadius: '1rem', padding: '2.5rem', textAlign: 'center'}}>
            <FileText size={40} color="#334155" style={{margin: '0 auto 0.75rem'}} />
            <p style={{color: '#94a3b8', fontWeight: '500', marginBottom: '0.5rem'}}>No contracts yet</p>
            <p style={{color: '#475569', fontSize: '0.875rem', marginBottom: '1.5rem'}}>Upload your first contract to get started</p>
            <Link to="/contracts/upload" style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#7c3aed', color: 'white', borderRadius: '0.75rem', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem'}}>
              <Upload size={16} /> Upload Contract
            </Link>
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            {contracts.slice(0, 5).map((contract) => (
              <Link key={contract.id} to={`/contracts/${contract.id}`} style={{backgroundColor: '#1a1a2e', border: '1px solid rgba(109,40,217,0.2)', borderRadius: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none'}}>
                <div style={{width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: contract.doc_status === 'extracted' ? 'rgba(6,78,59,0.3)' : contract.doc_status === 'failed' ? 'rgba(127,29,29,0.3)' : 'rgba(113,63,18,0.3)'}}>
                  <FileText size={18} color={contract.doc_status === 'extracted' ? '#34d399' : contract.doc_status === 'failed' ? '#f87171' : '#fbbf24'} />
                </div>
                <div style={{flex: 1, minWidth: 0}}>
                  <p style={{fontWeight: '600', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                    {contract.dealer_offer_name || `Contract #${contract.id}`}
                  </p>
                  <p style={{fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem'}}>
                    {contract.contract_type?.toUpperCase()} • {new Date(contract.created_at).toLocaleDateString()}
                  </p>
                </div>
                {contract.fairness_score != null && (
                  <div style={{textAlign: 'center', flexShrink: 0}}>
                    <p style={{fontSize: '1.25rem', fontWeight: '800', color: contract.fairness_score >= 70 ? '#34d399' : contract.fairness_score >= 50 ? '#fbbf24' : '#f87171'}}>
                      {contract.fairness_score}
                    </p>
                    <p style={{fontSize: '0.75rem', color: '#475569'}}>score</p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
