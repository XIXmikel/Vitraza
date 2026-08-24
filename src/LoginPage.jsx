import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from './supabaseClient'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin() {
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('Correo o contraseña incorrectos.')
    } else {
      const params = new URLSearchParams(window.location.search)
      const ultimoCatalogo = sessionStorage.getItem('ultimoCatalogo')
      const volver = params.get('volver') || (ultimoCatalogo ? `/${ultimoCatalogo}` : '/')
      navigate(volver)
    }
  }

      return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-sm">
        {/* Logo dentro del recuadro */}
        <div className="flex justify-center mb-6">
          <img src="/vitraza-logo.png" alt="Vitraza" className="h-12 mx-auto block" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Iniciar sesión</h1>

        {error && (
          <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded">{error}</p>
        )}

        <label className="block text-sm text-gray-600 mb-1">Correo</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4" placeholder="tucorreo@ejemplo.com" />

        <label className="block text-sm text-gray-600 mb-1">Contraseña</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-6" placeholder="Tu contraseña" />

        <button onClick={handleLogin} disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Entrando...' : 'Iniciar sesión'}
        </button>

        <p className="text-sm text-gray-500 text-center mt-4">
          ¿No tienes cuenta?{' '}
          <Link to={`/registro${window.location.search}`} className="text-blue-600 hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage