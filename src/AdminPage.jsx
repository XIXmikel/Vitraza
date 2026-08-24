import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { Navigate, Link } from 'react-router-dom'
import { supabase } from './supabaseClient'

function ProductoFila({ prod, onEditar, onPedirBorrar }) {
  return (
    <div onClick={() => onEditar(prod)} className="p-4 flex gap-4 items-center cursor-pointer hover:bg-gray-50 transition">
      <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
        {prod.image_url ? (
          <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sin foto</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="font-semibold text-gray-900">{prod.name}</h4>
          <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${prod.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
            {prod.is_available ? 'Disponible' : 'Agotado'}
          </span>
        </div>
        {prod.description && <p className="text-sm text-gray-500 mb-1">{prod.description}</p>}
        <p className="font-bold text-gray-900">${Number(prod.base_price).toFixed(2)}</p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onPedirBorrar(prod) }} className="text-red-600 text-sm hover:underline font-medium flex-shrink-0">Borrar</button>
    </div>
  )
}

function AdminPage() {
  const { user, profile, loading, signOut } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [slug, setSlug] = useState('')
  const [confirmar, setConfirmar] = useState(null) // { tipo, id, nombre }

  const [showCatManager, setShowCatManager] = useState(false)
  const [newCatName, setNewCatName] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function cargarDatos() {
    if (!profile?.tenant_id) return
    const { data: prods } = await supabase
      .from('products').select('*')
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false })
    const { data: cats } = await supabase
      .from('categories').select('*')
      .eq('tenant_id', profile.tenant_id)
      .order('sort_order')
    const { data: prof } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single()
    if (prof?.avatar_url) setAvatarUrl(prof.avatar_url)
    setProducts(prods || [])
    setCategories(cats || [])
    const { data: t } = await supabase.from('tenants').select('slug').eq('id', profile.tenant_id).single()
    if (t?.slug) setSlug(t.slug)
    setLoadingData(false)
  }

  useEffect(() => { cargarDatos() }, [profile])

  async function agregarCategoria() {
    if (!newCatName.trim()) return
    await supabase.from('categories').insert({
      tenant_id: profile.tenant_id, name: newCatName.trim(), sort_order: categories.length + 1,
    })
    setNewCatName('')
    cargarDatos()
  }
  async function borrar(id) {
    await supabase.from('products').delete().eq('id', id)
    cargarDatos()
  }

  async function borrarCategoria(id) {
    await supabase.from('categories').delete().eq('id', id)
    cargarDatos()
  }

  function pedirConfirmacion(tipo, id, nombre) {
    setConfirmar({ tipo, id, nombre })
  }

  async function ejecutarBorrado() {
    if (!confirmar) return
    if (confirmar.tipo === 'producto') await borrar(confirmar.id)
    else if (confirmar.tipo === 'categoria') await borrarCategoria(confirmar.id)
    setConfirmar(null)
  }

  function abrirCrear() {
    setEditingId(null)
    setName(''); setDescription(''); setPrice(''); setCategoryId('')
    setIsAvailable(true); setImageUrl('')
    setShowForm(true)
  }

  function abrirEditar(prod) {
    setEditingId(prod.id)
    setName(prod.name)
    setDescription(prod.description || '')
    setPrice(prod.base_price)
    setCategoryId(prod.category_id || '')
    setIsAvailable(prod.is_available)
    setImageUrl(prod.image_url || '')
    setShowForm(true)
  }

  async function subirImagen(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `${profile.tenant_id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(fileName, file)
    if (error) { alert('Error al subir la imagen: ' + error.message); setUploading(false); return }
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
    setImageUrl(data.publicUrl)
    setUploading(false)
  }

  function quitarImagen() { setImageUrl('') }

  async function guardar() {
    if (!name.trim()) { alert('El nombre es obligatorio.'); return }
    setSaving(true)
    const payload = {
      tenant_id: profile.tenant_id,
      name: name.trim(),
      description: description.trim() || null,
      base_price: price === '' ? 0 : Number(price),
      category_id: categoryId || null,
      is_available: isAvailable,
      image_url: imageUrl || null,
    }
    if (editingId) await supabase.from('products').update(payload).eq('id', editingId)
    else await supabase.from('products').insert(payload)
    setSaving(false)
    setShowForm(false)
    cargarDatos()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Cargando...</p></div>
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Acceso restringido</h1>
          <Link to="/" className="text-blue-600 hover:underline">Volver al inicio</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="w-full px-6 py-3 flex items-center justify-between gap-4 relative">
          {/* Logo pegado a la izquierda */}
          <Link to="/" className="flex-shrink-0">
            <img src="/vitraza-logo.png" alt="Vitraza" className="h-10" />
          </Link>

          {/* Título grande y centrado */}
          <h1 className="text-2xl font-bold text-gray-900 absolute left-1/2 -translate-x-1/2 hidden md:block">
            Panel de administración
          </h1>

          {/* Derecha: menú principal + avatar juntos */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link to={slug ? `/${slug}` : '/'} className="text-sm font-semibold text-gray-600 hover:text-gray-900 hidden sm:block">
              Menú principal
            </Link>
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="w-11 h-11 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center hover:ring-2 hover:ring-blue-300">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="cuenta" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-lg">{(profile?.full_name || user.email || '?').charAt(0).toUpperCase()}</span>
                )}
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20 overflow-hidden">
                    <Link to="/admin/cuenta" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">Editar perfil</Link>
                    <Link to={slug ? `/${slug}` : '/'} className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-t">Menú principal</Link>
                    <button onClick={signOut} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-50 border-t">Cerrar sesión</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Opciones</h2>
            <div className="flex flex-col gap-2 items-start">
              <button onClick={() => setShowCatManager(true)} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 text-sm font-semibold w-48 text-left">+ Nueva categoría</button>
              <button onClick={abrirCrear} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-semibold w-48 text-left">+ Nuevo producto</button>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={slug ? `/${slug}` : '/'} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 text-sm font-semibold">👁 Ver catálogo</Link>
            <Link to="/admin/personalizar" className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 text-sm font-semibold">🎨 Personalizar catálogo</Link>
          </div>
        </div>

        {loadingData ? (
          <p className="text-gray-500">Cargando...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-400 bg-white rounded-lg p-8 text-center">Aún no tienes productos. Crea el primero.</p>
        ) : (
          <div className="space-y-8">
            {categories.map((cat) => {
              const prodsCat = products.filter((p) => p.category_id === cat.id)
              if (prodsCat.length === 0) return null
              return (
                <section key={cat.id}>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">{cat.name}</h3>
                  <div className="bg-white rounded-lg shadow-sm divide-y">
                    {prodsCat.map((prod) => <ProductoFila key={prod.id} prod={prod} onEditar={abrirEditar} onPedirBorrar={(p) => pedirConfirmacion('producto', p.id, p.name)} />)}                  </div>
                </section>
              )
            })}
            {(() => {
              const sinCat = products.filter((p) => !p.category_id)
              if (sinCat.length === 0) return null
              return (
                <section>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Sin categoría</h3>
                  <div className="bg-white rounded-lg shadow-sm divide-y">
                    {sinCat.map((prod) => <ProductoFila key={prod.id} prod={prod} onEditar={abrirEditar} onPedirBorrar={(p) => pedirConfirmacion('producto', p.id, p.name)} />)}
                  </div>
                </section>
              )
            })()}
          </div>
        )}
      </main>

      {showCatManager && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setShowCatManager(false)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Categorías</h3>
              <button onClick={() => setShowCatManager(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>

            <div className="flex gap-2 mb-4">
              <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && agregarCategoria()}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="Nombre de la categoría (ej: Bebidas)" />
              <button onClick={agregarCategoria} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-semibold">Agregar</button>
            </div>

            {categories.length === 0 ? (
              <p className="text-gray-400 text-sm">Aún no tienes categorías.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <span key={c.id} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {c.name}
                    <button onClick={() => pedirConfirmacion('categoria', c.id, c.name)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {confirmar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setConfirmar(null)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">¿Borrar {confirmar.tipo === 'producto' ? 'producto' : 'categoría'}?</h3>
            <p className="text-gray-500 text-sm mb-6">
              {confirmar.tipo === 'producto'
                ? `"${confirmar.nombre}" se eliminará permanentemente.`
                : `"${confirmar.nombre}" se eliminará. Los productos que la usan quedarán sin categoría.`}
            </p>
            <div className="flex gap-2">
              <button onClick={ejecutarBorrado} className="flex-1 bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700">Sí, borrar</button>
              <button onClick={() => setConfirmar(null)} className="flex-1 bg-gray-200 py-2 rounded hover:bg-gray-300">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'Editar producto' : 'Nuevo producto'}</h3>

            <label className="block text-sm text-gray-600 mb-1">Foto del producto</label>
            {imageUrl ? (
              <div className="mb-3"> 
                <img src={imageUrl} alt="preview" className="w-full h-40 object-cover rounded mb-2" />
                <div className="flex items-center gap-3 text-sm">
                  <label className="text-blue-600 hover:underline cursor-pointer">
                    Cambiar foto
                    <input type="file" accept="image/*" onChange={subirImagen} className="hidden" />
                  </label>
                  <button onClick={quitarImagen} className="text-red-600 hover:underline">Quitar</button>
                </div>
                {uploading && <p className="text-blue-600 text-sm mt-1">Subiendo...</p>}
              </div>
            ) : (
              <div className="mb-3">
                <label className="inline-block bg-gray-800 text-white text-sm px-4 py-2 rounded cursor-pointer hover:bg-gray-900">
                  {uploading ? 'Subiendo...' : '＋ Subir foto'}
                  <input type="file" accept="image/*" onChange={subirImagen} className="hidden" />
                </label>
              </div>
            )}

            <label className="block text-sm text-gray-600 mb-1">Nombre *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 mb-3" placeholder="Ej: Torta de chocolate" />

            <label className="block text-sm text-gray-600 mb-1">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 mb-3" rows="3" placeholder="Describe el producto." />

            <label className="block text-sm text-gray-600 mb-1">Precio ($)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 mb-3" placeholder="0.00" step="0.01" />

            <label className="block text-sm text-gray-600 mb-1">Categoría</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 mb-3">
              <option value="">Sin categoría</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <label className="flex items-center gap-2 mb-5 text-sm text-gray-700">
              <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
              Disponible (desmarcar = agotado)
            </label>

            <div className="flex gap-2">
              <button onClick={guardar} disabled={saving || uploading} className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-200 py-2 rounded hover:bg-gray-300">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPage