import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, CheckCircle, Zap } from 'lucide-react'
import { contractsApi } from '../api'
import toast from 'react-hot-toast'
import Spinner from '../components/ui/Spinner'

const ALLOWED_MIME: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'text/plain': ['.txt'],
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_MIME,
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
  })

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const contract = await contractsApi.upload(file)
      toast.success('Contract uploaded! Analyzing...')
      navigate(`/contracts/${contract.id}`)
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Upload size={16} className="text-white" />
          </div>
          Upload Contract
        </h1>
        <p className="text-slate-500 text-sm mt-1">Upload your car lease or loan contract for AI analysis</p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`card p-12 text-center cursor-pointer transition-all border-2 border-dashed ${
          isDragActive
            ? 'border-purple-500 bg-purple-900/20'
            : file
            ? 'border-emerald-600/50 bg-emerald-900/10'
            : 'border-purple-900/50 hover:border-purple-700/70 hover:bg-purple-900/10'
        }`}
      >
        <input {...getInputProps()} />

        {file ? (
          <div>
            <div className="w-16 h-16 bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-700/40">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <p className="font-bold text-white text-lg mb-1">{file.name}</p>
            <p className="text-slate-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null) }}
              className="mt-4 flex items-center gap-1 text-red-400 hover:text-red-300 text-sm mx-auto transition-colors"
            >
              <X size={14} /> Remove file
            </button>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-800/40">
              <Upload size={32} className={isDragActive ? 'text-purple-300' : 'text-purple-400'} />
            </div>
            <p className="font-bold text-white text-lg mb-2">
              {isDragActive ? 'Drop your file here!' : 'Drag & drop your contract'}
            </p>
            <p className="text-slate-500 text-sm mb-4">or click to browse files</p>
            <p className="text-slate-600 text-xs">Supports PDF, JPG, PNG, TXT • Max 20MB</p>
          </div>
        )}
      </div>

      {/* Supported formats */}
      <div className="grid grid-cols-4 gap-3 mt-4">
        {[
          { ext: 'PDF', desc: 'Digital PDF', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-800/30' },
          { ext: 'JPG', desc: 'JPEG Image', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-800/30' },
          { ext: 'PNG', desc: 'PNG Image', color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-800/30' },
          { ext: 'TXT', desc: 'Text File', color: 'text-emerald-400', bg: 'bg-emerald-900/20', border: 'border-emerald-800/30' },
        ].map((f) => (
          <div key={f.ext} className={`card p-3 text-center border ${f.border} ${f.bg}`}>
            <p className={`font-black text-base ${f.color}`}>{f.ext}</p>
            <p className="text-slate-600 text-xs mt-0.5">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* What happens next */}
      <div className="card p-5 mt-4">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <Zap size={16} className="text-purple-400" />
          What happens after upload?
        </h3>
        <div className="space-y-2">
          {[
            { step: '1', text: 'OCR extracts text from your document' },
            { step: '2', text: 'Gemini AI analyzes all contract clauses' },
            { step: '3', text: 'Fairness score and red flags are calculated' },
            { step: '4', text: 'AI chatbot is ready to answer your questions' },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3">
              <span className="w-6 h-6 bg-purple-900/40 border border-purple-800/40 rounded-lg flex items-center justify-center text-xs font-bold text-purple-400 shrink-0">
                {item.step}
              </span>
              <p className="text-sm text-slate-400">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full btn-primary justify-center py-4 mt-6 text-base"
      >
        {uploading ? (
          <span className="flex items-center gap-2 justify-center">
            <Spinner className="text-white" /> Uploading...
          </span>
        ) : (
          <span className="flex items-center gap-2 justify-center">
            <FileText size={18} /> Analyze Contract
          </span>
        )}
      </button>

    </div>
  )
}
