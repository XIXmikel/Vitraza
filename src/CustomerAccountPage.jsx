import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from './supabaseClient'

function CustomerAccountPage() {
  const { user, profile, loading, signOut } = useAuth()
  const [loadingData, setLoadingData] = useState(true)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const ultimoCatalogo = sessionStorage.getItem('ultimoCatalogo')
  const volver = searchParams.get('volver') || (ultimoCatalogo ? `/${ultimoCatalogo}` : '/')

  useEffect(() => {
    async function cargar() {
      if (!user) return
      const { data } = await supabase.from('profiles').select('full_name, phone, avatar_url').eq('id', user.id).single()
      if (data) {
        setFullName(data.full_name || '')
        setPhone(data.phone || '')
        setAvatarUrl(data.avatar_url || '')
      }
      setLoadingData(false)
    }
    cargar()
  }, [user])

  async function subirAvatar(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingAvatar(true)
    const ext = file.name.split('.').pop()
    const fileName = `clientes/${user.id}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(fileName, file)
    if (error) { alert('Error al subir la foto: ' + error.message); setUploadingAvatar(false); return }
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
    const url = data.publicUrl
    setAvatarUrl(url)
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
    setUploadingAvatar(false)
  }

  async function quitarAvatar() {
    setAvatarUrl('')
    await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id)
  }

  async function guardar() {
    setSaving(true)
    await supabase.from('profiles').update({
      full_name: fullName.trim() || null,
      phone: phone.trim() || null,
      avatar_url: avatarUrl || null,
    }).eq('id', user.id)
    if (newPassword) {
      if (newPassword.length < 6) { alert('La contraseña debe tener al menos 6 caracteres.'); setSaving(false); return }
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) { alert('Error al cambiar contraseña: ' + error.message); setSaving(false); return }
      setNewPassword('')
    }
    setSaving(false)
    navigate(volver)
  }

  if (loading || loadingData) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Cargando...</p></div>
  if (!user) return <Navigate to="/login" replace />

  const inicial = (fullName || user.email || '?').charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto p-4 flex justify-between items-center">
          <button onClick={() => navigate(volver)} className="text-gray-600 hover:text-gray-900 text-sm font-semibold">← Volver al catálogo</button>
          <h1 className="text-lg font-bold text-gray-900">Mi perfil</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Foto + nombre */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-3xl font-bold">{inicial}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 text-sm mb-1">
                <label className="text-blue-600 hover:underline cursor-pointer">
                  Cambiar foto
                  <input type="file" accept="image/*" onChange={subirAvatar} className="hidden" />
                </label>
                {uploadingAvatar && <span className="text-blue-600">Subiendo...</span>}
                {avatarUrl && <button onClick={quitarAvatar} className="text-red-600 hover:underline">Quitar</button>}
              </div>
              <span className="inline-block text-sm px-3 py-1 rounded-full font-semibold bg-gray-100 text-gray-700">Cliente</span>
            </div>
          </div>

          <label className="block text-sm text-gray-600 mb-1">Nombre completo</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="off"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4" placeholder="Tu nombre" />

          <label className="block text-sm text-gray-600 mb-1">Correo</label>
          <input value={user.email} disabled
            className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded px-3 py-2 mb-4" />

          <label className="block text-sm text-gray-600 mb-1">Teléfono</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="off"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4" placeholder="Ej: 6000-0000" />

          <label className="block text-sm text-gray-600 mb-1">Nueva contraseña</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-1" placeholder="Déjalo vacío si no quieres cambiarla" />
          <p className="text-xs text-gray-400 mb-6">Mínimo 6 caracteres. Solo se cambia si escribes algo.</p>

          <div className="flex gap-2">
            <button onClick={guardar} disabled={saving || uploadingAvatar}
              className="flex-1 bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={signOut}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded font-semibold hover:bg-gray-300">
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerAccountPage