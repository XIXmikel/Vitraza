import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { Navigate, Link } from 'react-router-dom'
import { supabase } from './supabaseClient'

function AccountPage() {
  const { user, profile, loading } = useAuth()
  const [loadingData, setLoadingData] = useState(true)

  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [bizName, setBizName] = useState('')
  const [slug, setSlug] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function cargar() {
      if (!profile?.tenant_id) return
      const { data: prof } = await supabase.from('profiles')
        .select('full_name, avatar_url').eq('id', user.id).single()
      if (prof) {
        setFullName(prof.full_name || '')
        setAvatarUrl(prof.avatar_url || '')
      }
      const { data: t } = await supabase.from('tenants')
        .select('name, slug, whatsapp_number').eq('id', profile.tenant_id).single()
      if (t) {
        setBizName(t.name || '')
        setSlug(t.slug || '')
        setWhatsapp(t.whatsapp_number || '')
      }
      setLoadingData(false)
    }
    cargar()
  }, [profile, user])

  async function subirAvatar(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingAvatar(true)
    const ext = file.name.split('.').pop()
    const fileName = `${profile.tenant_id}/avatar-${Date.now()}.${ext}`
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

  async function guardarTodo() {
    if (!bizName.trim()) { alert('El nombre del negocio no puede estar vacío.'); return }
    setSaving(true)

    // Perfil
    await supabase.from('profiles').update({
      full_name: fullName.trim() || null,
      avatar_url: avatarUrl || null,
    }).eq('id', user.id)

    // Negocio
    await supabase.from('tenants').update({
      name: bizName.trim(),
      whatsapp_number: whatsapp.trim() || null,
    }).eq('id', profile.tenant_id)

    // Contraseña (solo si escribió una)
    if (newPassword) {
      if (newPassword.length < 6) { alert('La contraseña debe tener al menos 6 caracteres.'); setSaving(false); return }
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) { alert('Error al cambiar contraseña: ' + error.message); setSaving(false); return }
      setNewPassword('')
    }

    setSaving(false)
    alert('Cambios guardados ✅')
  }

  function copiarLink() {
    const url = `${window.location.origin}/${slug}`
    navigator.clipboard.writeText(url)
    alert('Link copiado: ' + url)
  }

  if (loading || loadingData) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Cargando...</p></div>
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role !== 'admin') return <Navigate to="/" replace />

  const inicial = (fullName || bizName || user.email || '?').charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto p-4 flex justify-between items-center">
          <Link to="/admin" className="text-gray-600 hover:text-gray-900 text-sm font-semibold">← Volver al panel</Link>
          <h1 className="text-lg font-bold text-gray-900">Mi cuenta</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Foto + nombre al lado */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-3xl font-bold">{inicial}</span>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Nombre completo</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-1" placeholder="Tu nombre" />
              <div className="flex items-center gap-3 text-sm">
                <label className="text-blue-600 hover:underline cursor-pointer">
                  Cambiar foto
                  <input type="file" accept="image/*" onChange={subirAvatar} className="hidden" />
                </label>
                {uploadingAvatar && <span className="text-blue-600">Subiendo...</span>}
                {avatarUrl && <button onClick={quitarAvatar} className="text-red-600 hover:underline">Quitar</button>}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Tipo de cuenta</label>
            <span className={`inline-block text-sm px-3 py-1 rounded-full font-semibold ${profile?.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
              {profile?.role === 'admin' ? 'Administrador' : 'Cliente'}
            </span>
          </div>

          {/* Nombre del negocio */}
          <label className="block text-sm text-gray-600 mb-1">Nombre del negocio</label>
          <input value={bizName} onChange={(e) => setBizName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4" placeholder="Ej: Repostería Ana" />

          {/* Correo (bloqueado) */}
          <label className="block text-sm text-gray-600 mb-1">Correo</label>
          <input value={user.email} disabled
            className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded px-3 py-2 mb-1" />
          <p className="text-xs text-gray-400 mb-4">El correo no se puede cambiar por ahora.</p>

          {/* WhatsApp */}
          <label className="block text-sm text-gray-600 mb-1">Número de WhatsApp (con código de país)</label>
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-1" placeholder="Ej: 50761234567" />
          <p className="text-xs text-gray-400 mb-4">A este número llegarán los mensajes cuando te hagan pedidos. Sin espacios ni +.</p>

          {/* Link público */}
          <label className="block text-sm text-gray-600 mb-1">Tu link público</label>
          <div className="flex gap-2 mb-4">
            <input value={`${window.location.origin}/${slug}`} disabled
              className="flex-1 border border-gray-200 bg-gray-50 text-gray-500 rounded px-3 py-2 text-sm" />
            <button onClick={copiarLink} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 text-sm font-semibold">Copiar</button>
          </div>

          {/* Contraseña */}
          <label className="block text-sm text-gray-600 mb-1">Nueva contraseña</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-1" placeholder="Déjalo vacío si no quieres cambiarla" />
          <p className="text-xs text-gray-400 mb-6">Mínimo 6 caracteres. Solo se cambia si escribes algo.</p>

          {/* Un solo botón */}
          <button onClick={guardarTodo} disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccountPage