import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FileText, Trash2, Plus, AlertTriangle, Upload } from 'lucide-react'
import { contractsApi } from '../api'
import { Contract } from '../types'
import toast from 'react-hot-toast'
import Spinner from '../components/ui/Spinner'

export default function ContractsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: contractsApi.list,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => contractsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      toast.success('Contract deleted!')
    },
    onError: () => {
      toast.error('Failed to delete contract')
    },
  })

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this contract?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>

  const contracts = data?.contracts ?? []

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Contracts</h1>
          <p className="text-slate-500 text-sm mt-1">{contracts.length} contract{contracts.length !== 1 ? 's' : ''} uploaded</p>
        </div>
        <Link to="/contracts/upload" className="btn-primary">
          <Plus size={16} /> New Contract
        </Link>
      </div>

      {contracts.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-20 h-20 bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Upload size={36} className="text-purple-400" />
          </div>
          <h3 className="font-bold text-white text-lg mb-2">No contracts yet</h3>
          <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">Upload your first car lease or loan contract to get an AI powered analysis</p>
          <Link to="/contracts/upload" className="btn-primary">
            <Plus size={16} /> Upload Contract
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contracts.map((contract: Contract) => (
            <Link
              key={contract.id}
              to={`/contracts/${contract.id}`}
              className="card p-5 flex items-center gap-4 hover:border-purple-700/50 transition-all group"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                contract.doc_status === 'extracted' ? 'bg-emerald-900/40' :
                contract.doc_status === 'failed' ? 'bg-red-900/40' : 'bg-yellow-900/40'
              }`}>
                <FileText size={22} className={
                  contract.doc_status === 'extracted' ? 'text-emerald-400' :
                  contract.doc_status === 'failed' ? 'text-red-400' : 'text-yellow-400'
                } />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate text-base">
                  {contract.dealer_offer_name || `Contract #${contract.id}`}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`badge-${
                    contract.doc_status === 'extracted' ? 'green' :
                    contract.doc_status === 'failed' ? 'red' : 'yellow'
                  }`}>
                    {contract.doc_status}
                  </span>
                  {contract.contract_type && (
                    <span className="text-xs text-slate-500 uppercase font-medium bg-slate-800 px-2 py-0.5 rounded-full">
                      {contract.contract_type}
                    </span>
                  )}
                  <span className="text-xs text-slate-600">
                    {new Date(contract.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Score */}
              {contract.fairness_score != null && (
                <div className="text-center shrink-0 px-3">
                  <div className={`text-2xl font-black ${
                    contract.fairness_score >= 70 ? 'text-emerald-400' :
                    contract.fairness_score >= 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {contract.fairness_score}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">/ 100</div>
                </div>
              )}

              {/* Red flag */}
              {contract.red_flag_level === 'high' && (
                <div className="flex items-center gap-1 bg-red-900/30 border border-red-800/40 rounded-xl px-3 py-1.5 shrink-0">
                  <AlertTriangle size={14} className="text-red-400" />
                  <span className="text-xs text-red-400 font-medium">Risk</span>
                </div>
              )}

              {/* Delete */}
              <button
                onClick={(e) => handleDelete(e, contract.id)}
                disabled={deleteMutation.isPending}
                className="p-2.5 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-all shrink-0"
              >
                {deleteMutation.isPending ? <Spinner className="w-4 h-4" /> : <Trash2 size={16} />}
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
