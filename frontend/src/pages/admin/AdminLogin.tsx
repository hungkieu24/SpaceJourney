import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminStore } from '../../store/journeyStore'
import { authApi } from '../../api/client'
import { EncryptButton } from '../../components/originkit/EncryptButton'

export function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const login = useAdminStore((s) => s.login)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const res = await authApi.login('admin', password)
      login(res.data.token)
      navigate('/admin/scenes')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi đăng nhập')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#030712] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm p-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 font-mono text-center tracking-wider">
          SYSTEM_AUTH
        </h2>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2 font-mono">
              ACCESS_KEY
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors font-mono"
              placeholder="Nhập mật khẩu..."
              autoFocus
            />
          </div>
          
          {error && <p className="text-red-400 text-sm">{error}</p>}
          
          <div className="flex justify-center mt-2">
            {isLoading ? (
              <span className="text-purple-400 font-mono animate-pulse">VERIFYING...</span>
            ) : (
              <EncryptButton text="INITIALIZE_UPLINK" className="w-full" />
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
