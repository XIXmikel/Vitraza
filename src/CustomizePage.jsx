import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { Navigate, Link } from 'react-router-dom'
import { supabase } from './supabaseClient'

function Section({ id, title, openSection, setOpenSection, children }) {
  const isOpen = openSection === id
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <button
        onClick={() => setOpenSection(isOpen ? null : id)}
        className="w-full flex justify-between items-center p-4 text-left"
      >
        <h2 className="font-semibold text-gray-800">{title}</h2>
        <span className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

function CustomizePage() {
  const { user, profile, loading } = useAuth()
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
    const [fontTitle, setFontTitle] = useState('Poppins')
  const [fontBody, setFontBody] = useState('Inter')
    const [cardStyle, setCardStyle] = useState('completo')
  const [headerImage, setHeaderImage] = useState('')
  const [uploadingHeader, setUploadingHeader] = useState(false)

  const [bizName, setBizName] = useState('')
  const [headerText, setHeaderText] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#2563eb')
  const [secondaryColor, setSecondaryColor] = useState('#f3f4f6')
  const [logoUrl, setLogoUrl] = useState('')
  const [logoLayout, setLogoLayout] = useState('left')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [openSection, setOpenSection] = useState('logo')

  const PALETAS = [
    { name: 'Azul', primary: '#2563eb', secondary: '#dbeafe' },
    { name: 'Rosa', primary: '#db2777', secondary: '#fce7f3' },
    { name: 'Verde', primary: '#16a34a', secondary: '#dcfce7' },
    { name: 'Morado', primary: '#7c3aed', secondary: '#ede9fe' },
    { name: 'Naranja', primary: '#ea580c', secondary: '#ffedd5' },
    { name: 'Negro', primary: '#1f2937', secondary: '#f3f4f6' },
    { name: 'Rojo', primary: '#dc2626', secondary: '#fee2e2' },
    { name: 'Turquesa', primary: '#0d9488', secondary: '#ccfbf1' },
    { name: 'Índigo', primary: '#4f46e5', secondary: '#e0e7ff' },
    { name: 'Ámbar', primary: '#d97706', secondary: '#fef3c7' },
    { name: 'Fucsia', primary: '#c026d3', secondary: '#fae8ff' },
    { name: 'Marrón', primary: '#92400e', secondary: '#fef3c7' },
  ]
    const FUENTES = [
    'Inter', 'Poppins', 'Montserrat', 'Work Sans', 'DM Sans',
    'Playfair Display', 'Lora', 'Cormorant', 'Merriweather', 'Nunito',
    'Quicksand', 'Comfortaa', 'Pacifico', 'Dancing Script', 'Caveat',
  ]

  const ESTILOS_CARD = [
    { id: 'completo', label: 'Completo', desc: 'Foto, nombre, descripción y precio' },
    { id: 'foto-precio', label: 'Foto + precio', desc: 'Sin descripción' },
    { id: 'foto-nombre', label: 'Foto + nombre', desc: 'Minimalista' },
    { id: 'solo-foto', label: 'Solo foto', desc: 'Mosaico visual' },
    { id: 'lista', label: 'Lista', desc: 'Foto pequeña a la izquierda' },
    { id: 'destacado', label: 'Destacado', desc: 'Fotos grandes, una columna' },
  ]

  useEffect(() => {
    async function cargar() {
      if (!profile?.tenant_id) return
      const { data: t } = await supabase.from('tenants').select('name, theme').eq('id', profile.tenant_id).single()
      if (t) {
        setBizName(t.name || '')
        if (t.theme?.primary) setPrimaryColor(t.theme.primary)
        if (t.theme?.secondary) setSecondaryColor(t.theme.secondary)
        if (t.theme?.logo_url) setLogoUrl(t.theme.logo_url)
        if (t.theme?.logo_layout) setLogoLayout(t.theme.logo_layout)
        setHeaderText(t.theme?.header_text ?? '📱 Pedidos por WhatsApp')
            if (t.theme?.font_title) setFontTitle(t.theme.font_title)
        if (t.theme?.font_body) setFontBody(t.theme.font_body)
        if (t.theme?.card_style) setCardStyle(t.theme.card_style)
        if (t.theme?.header_image) setHeaderImage(t.theme.header_image)
      }
      setLoadingData(false)
    }
    cargar()
  }, [profile])

  async function subirLogo(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingLogo(true)
    const ext = file.name.split('.').pop()
    const fileName = `${profile.tenant_id}/logo-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(fileName, file)
    if (error) { alert('Error al subir el logo: ' + error.message); setUploadingLogo(false); return }
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
    setLogoUrl(data.publicUrl)
    setUploadingLogo(false)
  }

    async function subirHeader(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingHeader(true)
    const ext = file.name.split('.').pop()
    const fileName = `${profile.tenant_id}/header-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(fileName, file)
    if (error) { alert('Error al subir la foto: ' + error.message); setUploadingHeader(false); return }
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
    setHeaderImage(data.publicUrl)
    setUploadingHeader(false)
  }

  async function guardar() {
    if (!bizName.trim()) { alert('El nombre no puede estar vacío.'); return }
    setSaving(true)
    await supabase.from('tenants').update({
      name: bizName.trim(),
      theme: {
        primary: primaryColor, secondary: secondaryColor,
        logo_url: logoUrl || null, logo_layout: logoLayout,
        header_text: headerText.trim(),         font_title: fontTitle,
        font_body: fontBody, card_style: cardStyle, header_image: headerImage || null,
      },
    }).eq('id', profile.tenant_id)
    setSaving(false)
    alert('Guardado ✅')
  }

  if (loading || loadingData) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Cargando...</p></div>
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role !== 'admin') return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra superior */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
          <Link to="/admin" className="text-gray-600 hover:text-gray-900 text-sm font-semibold">← Volver al panel</Link>
          <h1 className="text-lg font-bold text-gray-900">Personalizar catálogo</h1>
          <button onClick={guardar} disabled={saving}
            className="bg-blue-600 text-white px-5 py-2 rounded font-semibold hover:bg-blue-700 text-sm disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </header>


      {/* Dos columnas */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 p-6">
        {/* PANEL IZQUIERDO: controles */}
        <div className="lg:w-96 flex-shrink-0 space-y-6">

                    <Section id="logo" title="Logo y encabezado" openSection={openSection} setOpenSection={setOpenSection}>
            {/* Logo */}
            <p className="text-sm font-semibold text-gray-700 mb-2">Logo</p>
            {logoUrl ? (
              <div className="flex items-center gap-3 mb-3">
                <img src={logoUrl} alt="logo" className="w-16 h-16 rounded object-cover border" />
                <button onClick={() => setLogoUrl('')} className="text-red-600 text-sm hover:underline">Quitar logo</button>
              </div>
            ) : (
              <label className="inline-block bg-gray-800 text-white text-sm px-4 py-2 rounded cursor-pointer hover:bg-gray-900 mb-3">
                {uploadingLogo ? 'Subiendo...' : '＋ Subir logo'}
                <input type="file" accept="image/*" onChange={subirLogo} className="hidden" />
              </label>
            )}

            <label className="block text-sm text-gray-600 mb-1 mt-2">Disposición del logo</label>
            <div className="grid grid-cols-3 gap-2">
              {[{ id: 'left', label: 'Logo + nombre' }, { id: 'logo-only', label: 'Solo logo' }, { id: 'top', label: 'Logo arriba' }].map((opt) => (
                <button key={opt.id} onClick={() => setLogoLayout(opt.id)}
                  className={`border rounded p-2 text-xs ${logoLayout === opt.id ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-300 text-gray-600'}`}>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Fondo del header */}
            <div className="mt-5 pt-5 border-t">
              <p className="text-sm font-semibold text-gray-700 mb-2">Fondo del header</p>
              {headerImage ? (
                <div className="flex items-center gap-3 mb-2">
                  <img src={headerImage} alt="header" className="w-24 h-14 rounded object-cover border" />
                  <button onClick={() => setHeaderImage('')} className="text-red-600 text-sm hover:underline">Quitar header</button>
                </div>
              ) : (
                <label className="inline-block bg-gray-800 text-white text-sm px-4 py-2 rounded cursor-pointer hover:bg-gray-900">
                  {uploadingHeader ? 'Subiendo...' : '＋ Subir foto'}
                  <input type="file" accept="image/*" onChange={subirHeader} className="hidden" />
                </label>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {headerImage ? 'El logo y el título se muestran encima de la foto.' : 'Sin foto, el header usa el color principal.'}
              </p>
            </div>
          </Section>

          {/* Datos */}
          <Section id="datos" title="Datos del negocio" openSection={openSection} setOpenSection={setOpenSection}>
            <label className="block text-sm text-gray-600 mb-1">Nombre</label>
            <input value={bizName} onChange={(e) => setBizName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3" placeholder="Ej: Repostería Ana" />
            <label className="block text-sm text-gray-600 mb-1">Texto bajo el nombre</label>
            <input value={headerText} onChange={(e) => setHeaderText(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Ej: 📱 Pedidos por WhatsApp" />
          </Section>


         {/* Tipografías */}
          <Section id="fuentes" title="Tipografias" openSection={openSection} setOpenSection={setOpenSection}>
            <label className="block text-sm text-gray-600 mb-1">Fuente de títulos</label>
            <select value={fontTitle} onChange={(e) => setFontTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3" style={{ fontFamily: fontTitle }}>
              {FUENTES.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
            </select>
            <label className="block text-sm text-gray-600 mb-1">Fuente de textos</label>
            <select value={fontBody} onChange={(e) => setFontBody(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2" style={{ fontFamily: fontBody }}>
              {FUENTES.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
            </select>
          </Section>

          {/* Estilo de producto */}
          <Section id="estilo" title="Estilos del producto" openSection={openSection} setOpenSection={setOpenSection}>
            <div className="grid grid-cols-2 gap-2">
              {ESTILOS_CARD.map((e) => (
                <button key={e.id} onClick={() => setCardStyle(e.id)}
                  className={`border rounded p-2 text-left ${cardStyle === e.id ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                  <p className={`text-sm font-semibold ${cardStyle === e.id ? 'text-blue-700' : 'text-gray-700'}`}>{e.label}</p>
                  <p className="text-xs text-gray-400">{e.desc}</p>
                </button>
              ))}
            </div>
          </Section>

          {/* Colores */}
          <Section id="colores" title="Colores" openSection={openSection} setOpenSection={setOpenSection}>
            <p className="text-xs text-gray-400 mb-3">Principal = header y botones · Secundario = fondo</p>
            <div className="flex flex-wrap gap-3 mb-4">
              {PALETAS.map((p) => (
                <button key={p.name} onClick={() => { setPrimaryColor(p.primary); setSecondaryColor(p.secondary) }}
                  className="flex flex-col items-center gap-1">
                  <span className="w-9 h-9 rounded-full border-2 border-white shadow"
                    style={{ background: `linear-gradient(135deg, ${p.primary} 60%, ${p.secondary} 40%)` }} />
                  <span className="text-xs text-gray-500">{p.name}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-6">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Principal</label>
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-14 h-9 rounded cursor-pointer border" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Secundario</label>
                <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-14 h-9 rounded cursor-pointer border" />
              </div>
            </div>
          </Section>
        </div>

        {/* PANEL DERECHO: preview */}
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-2 font-semibold">Vista previa</p>
          <div className="rounded-lg overflow-hidden shadow-lg border" style={{ backgroundColor: secondaryColor, fontFamily: fontBody }}>
            {/* Header */}
            <div className="p-6 relative overflow-hidden" style={headerImage ? { backgroundImage: `url(${headerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: primaryColor }}>
              {headerImage && <div className="absolute inset-0 bg-black/40"></div>}
              <div className="relative">
                {logoLayout === 'top' ? (
                  <div className="flex flex-col items-center text-center gap-2">
                    {logoUrl && <img src={logoUrl} alt="logo" className="w-16 h-16 rounded-full object-cover border-2 border-white" />}
                    <p className="text-white font-bold text-2xl" style={{ fontFamily: fontTitle }}>{bizName || 'Nombre del negocio'}</p>
                    {headerText && <p className="text-white/80 text-sm">{headerText}</p>}
                  </div>
                ) : logoLayout === 'logo-only' ? (
                  <div>
                    {logoUrl ? <img src={logoUrl} alt="logo" className="h-14 object-contain" /> : <p className="text-white font-bold text-2xl" style={{ fontFamily: fontTitle }}>{bizName || 'Nombre del negocio'}</p>}
                    {headerText && <p className="text-white/80 text-sm mt-1">{headerText}</p>}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {logoUrl && <img src={logoUrl} alt="logo" className="w-14 h-14 rounded-full object-cover border-2 border-white" />}
                    <div>
                      <p className="text-white font-bold text-2xl" style={{ fontFamily: fontTitle }}>{bizName || 'Nombre del negocio'}</p>
                      {headerText && <p className="text-white/80 text-sm">{headerText}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Productos de ejemplo */}
            <div className="p-6">
                            <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2" style={{ fontFamily: fontTitle }}>Tortas</h3>
                            <div className={cardStyle === 'destacado' || cardStyle === 'lista' ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
                {[{ n: 'Torta de Chocolate', p: '25.00' }, { n: 'Torta Red Velvet', p: '30.00' }].map((prod) => {
                  if (cardStyle === 'solo-foto') {
                    return (
                      <div key={prod.n} className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">Foto</div>
                      </div>
                    )
                  }
                  if (cardStyle === 'foto-nombre') {
                    return (
                      <div key={prod.n} className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">Foto</div>
                        <p className="font-semibold text-gray-900 p-3" style={{ fontFamily: fontTitle }}>{prod.n}</p>
                      </div>
                    )
                  }
                  if (cardStyle === 'foto-precio') {
                    return (
                      <div key={prod.n} className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">Foto</div>
                        <div className="p-3">
                          <p className="font-semibold text-gray-900" style={{ fontFamily: fontTitle }}>{prod.n}</p>
                          <p className="font-bold mt-1" style={{ color: primaryColor }}>${prod.p}</p>
                        </div>
                      </div>
                    )
                  }
                  if (cardStyle === 'lista') {
                    return (
                      <div key={prod.n} className="bg-white rounded-lg shadow-sm p-3 flex gap-3 items-center">
                        <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs flex-shrink-0">Foto</div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900" style={{ fontFamily: fontTitle }}>{prod.n}</p>
                          <p className="text-sm text-gray-500">Descripción del producto.</p>
                          <p className="font-bold mt-1" style={{ color: primaryColor }}>${prod.p}</p>
                        </div>
                      </div>
                    )
                  }
                  // completo y destacado
                  return (
                    <div key={prod.n} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className={`w-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm ${cardStyle === 'destacado' ? 'h-56' : 'h-32'}`}>Foto</div>
                      <div className="p-4">
                        <p className="font-semibold text-gray-900" style={{ fontFamily: fontTitle }}>{prod.n}</p>
                        <p className="text-sm text-gray-500 mb-2">Descripción del producto.</p>
                        <p className="font-bold mb-3" style={{ color: primaryColor }}>${prod.p}</p>
                        <button className="w-full text-white py-2 rounded font-semibold text-sm" style={{ backgroundColor: primaryColor }}>Agregar</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomizePage