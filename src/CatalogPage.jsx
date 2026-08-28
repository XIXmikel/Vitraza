import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

function iconoRed(red) {
  const props = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'currentColor' }
  if (red === 'Instagram') return (<svg {...props}><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2m0 5.6a4.2 4.2 0 100 8.4 4.2 4.2 0 000-8.4m5.4-.5a1 1 0 11-2 0 1 1 0 012 0M12 9.6a2.4 2.4 0 110 4.8 2.4 2.4 0 010-4.8" /></svg>)
  if (red === 'TikTok') return (<svg {...props}><path d="M16.6 5.8c-1-.7-1.6-1.7-1.8-2.8h-3v11.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5c.3 0 .5 0 .8.1v-3c-.3 0-.5-.1-.8-.1-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5 5.5-2.5 5.5-5.5V9.4c1.1.8 2.5 1.3 4 1.3v-3c-.8 0-1.6-.3-2.2-.8" /></svg>)
  if (red === 'Twitter') return (<svg {...props}><path d="M18.9 2h3.3l-7.2 8.3L23.5 22h-6.6l-5.2-6.8L5.7 22H2.4l7.7-8.8L1.5 2h6.8l4.7 6.2zm-1.2 18h1.8L7.4 3.8H5.5z" /></svg>)
  if (red === 'Facebook') return (<svg {...props}><path d="M22 12a10 10 0 10-11.6 9.9v-7H8v-2.9h2.4V9.8c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.4v1.7h2.6l-.4 2.9h-2.2v7A10 10 0 0022 12" /></svg>)
  return null
}

function CatalogPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [tenant, setTenant] = useState(null)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const { user, profile, signOut } = useAuth()
    const [accountMenu, setAccountMenu] = useState(false)

  // Carrito: { producto, cantidad }
  const [cart, setCart] = useState([])

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      const { data: tenantData, error } = await supabase
        .from('tenants').select('*').eq('slug', slug).single()
      if (error || !tenantData) { setNotFound(true); setLoading(false); return }
      setTenant(tenantData)
      sessionStorage.setItem('ultimoCatalogo', slug)

      const { data: catData } = await supabase
        .from('categories').select('*')
        .eq('tenant_id', tenantData.id).order('sort_order')
      setCategories(catData || [])

      const { data: prodData } = await supabase
        .from('products').select('*')
        .eq('tenant_id', tenantData.id).order('sort_order')
      setProducts(prodData || [])
      setLoading(false)
    }
    cargar()
  }, [slug])

  function agregar(prod) {
    setCart((prev) => {
      const existe = prev.find((i) => i.producto.id === prod.id)
      if (existe) {
        return prev.map((i) =>
          i.producto.id === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      }
      return [...prev, { producto: prod, cantidad: 1 }]
    })
  }

  function quitar(prodId) {
    setCart((prev) => {
      const existe = prev.find((i) => i.producto.id === prodId)
      if (existe && existe.cantidad > 1) {
        return prev.map((i) =>
          i.producto.id === prodId ? { ...i, cantidad: i.cantidad - 1 } : i
        )
      }
      return prev.filter((i) => i.producto.id !== prodId)
    })
  }

  const primary = tenant?.theme?.primary || '#2563eb'
  const secondary = tenant?.theme?.secondary || '#f3f4f6'
  const headerText = tenant?.theme?.header_text ?? ''
  const fontTitle = tenant?.theme?.font_title || 'Poppins'
  const fontBody = tenant?.theme?.font_body || 'Inter'
  const total = cart.reduce((sum, i) => sum + Number(i.producto.base_price) * i.cantidad, 0)
  const cardStyle = tenant?.theme?.card_style || 'completo'
  const headerImage = tenant?.theme?.header_image || ''
  const esDueño = profile?.role === 'admin' && profile?.tenant_id === tenant?.id
  const redes = [
    { user: tenant?.theme?.instagram, base: 'https://instagram.com/', label: 'Instagram' },
    { user: tenant?.theme?.tiktok, base: 'https://tiktok.com/@', label: 'TikTok' },
    { user: tenant?.theme?.twitter, base: 'https://twitter.com/', label: 'Twitter' },
    { user: tenant?.theme?.facebook, base: 'https://facebook.com/', label: 'Facebook' },
  ].filter((r) => r.user)

  function ordenarWhatsApp() {
    if (cart.length === 0) return
    let msg = `Hola 👋 Quiero pedir en ${tenant.name}:\n\n`
    cart.forEach((i) => {
      msg += `• ${i.cantidad}x ${i.producto.name} — $${(Number(i.producto.base_price) * i.cantidad).toFixed(2)}\n`
    })
    msg += `\nTotal: $${total.toFixed(2)}`
    const url = `https://wa.me/${tenant.whatsapp_number}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Cargando...</p></div>
  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Catálogo no encontrado</h1>
        <p className="text-gray-500">No existe un negocio con la dirección "{slug}".</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: secondary, fontFamily: fontBody }}>
      {esDueño && (
        <div className="bg-gray-900 text-white text-sm">
          <div className="max-w-5xl mx-auto px-6 py-2 flex items-center justify-between">
            <span>Estás viendo tu catálogo</span>
            <Link to="/admin" className="bg-white text-gray-900 px-4 py-1.5 rounded font-semibold hover:bg-gray-100">
              ⚙️ Administrar catálogo
            </Link>
          </div>
        </div>
      )}
            <header className="shadow-sm relative overflow-hidden"
        style={headerImage
          ? { backgroundImage: `url(${headerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { backgroundColor: primary }}>
        {headerImage && <div className="absolute inset-0 bg-black/40"></div>}
        <div className="max-w-5xl mx-auto p-6 relative">
          {/* Botón de cuenta del cliente */}
          <div className="absolute top-4 right-4 z-10">
            {user ? (
              <div className="relative">
                <button onClick={() => setAccountMenu(!accountMenu)}
                  className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center font-bold text-gray-700 hover:bg-white shadow">
                  {(profile?.full_name || user.email || '?').charAt(0).toUpperCase()}
                </button>
                {accountMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setAccountMenu(false)}></div>
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border z-20 overflow-hidden">
                      <Link to={`/cuenta?volver=/${slug}`} className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">Mi perfil</Link>
                      <button onClick={signOut} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-50 border-t">Cerrar sesión</button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to={`/login?volver=/${slug}`}
                className="bg-white/90 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white shadow">
                Iniciar sesión
              </Link>
            )}
          </div>

          {tenant?.theme?.logo_layout === 'top' ? (
            <div className="flex flex-col items-center text-center gap-2">
              {tenant?.theme?.logo_url && <img src={tenant.theme.logo_url} alt={tenant.name} className="w-16 h-16 rounded-full object-cover border-2 border-white" />}
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: fontTitle }}>{tenant.name}</h1>
              {headerText && <p className="text-white/80">{headerText}</p>}
            </div>
          ) : tenant?.theme?.logo_layout === 'logo-only' && tenant?.theme?.logo_url ? (
            <div>
              <img src={tenant.theme.logo_url} alt={tenant.name} className="h-14 object-contain" />
              {headerText && <p className="text-white/80 mt-1">{headerText}</p>}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {tenant?.theme?.logo_url && <img src={tenant.theme.logo_url} alt={tenant.name} className="w-14 h-14 rounded-full object-cover border-2 border-white" />}
              <div>
                <h1 className="text-3xl font-bold text-white" style={{ fontFamily: fontTitle }}>{tenant.name}</h1>
                {headerText && <p className="text-white/80">{headerText}</p>}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {products.length === 0 && (
          <p className="text-gray-400 text-center py-12">Este negocio aún no tiene productos.</p>
        )}

        {categories.map((cat) => {
          const prods = products.filter((p) => p.category_id === cat.id)
          if (prods.length === 0) return null
          return (
            <section key={cat.id} className="mb-10">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2" style={{ fontFamily: fontTitle }}>{cat.name}</h2>
              <div className={cardStyle === 'lista' || cardStyle === 'destacado' ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'}>
                              {prods.map((prod) => {
                  const enCarrito = cart.find((i) => i.producto.id === prod.id)
                  const irADetalle = () => navigate(`/${slug}/producto/${prod.id}`)

                  // Controles de carrito — detienen el clic para no navegar
                  const controles = prod.is_available && (
                    enCarrito ? (
                      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => quitar(prod.id)} className="w-8 h-8 bg-gray-200 rounded-full font-bold hover:bg-gray-300">−</button>
                        <span className="font-semibold">{enCarrito.cantidad}</span>
                        <button onClick={() => agregar(prod)} className="w-8 h-8 text-white rounded-full font-bold" style={{ backgroundColor: primary }}>+</button>
                      </div>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); agregar(prod) }} className="w-full text-white py-2 rounded font-semibold" style={{ backgroundColor: primary }}>Agregar</button>
                    )
                  )

                  const agotadoBadge = !prod.is_available && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap">Agotado</span>
                  )

                  const clickable = "cursor-pointer transition hover:shadow-md"

                  // SOLO FOTO
                  if (cardStyle === 'solo-foto') {
                    return (
                      <div key={prod.id} onClick={irADetalle} className={`bg-white rounded-lg shadow-sm overflow-hidden ${clickable} ${!prod.is_available ? 'opacity-60' : ''}`}>
                        {prod.image_url
                          ? <img src={prod.image_url} alt={prod.name} className="w-full h-40 object-cover" />
                          : <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-300">Sin foto</div>}
                        <div className="p-2">{controles}</div>
                      </div>
                    )
                  }

                  // FOTO + NOMBRE
                  if (cardStyle === 'foto-nombre') {
                    return (
                      <div key={prod.id} onClick={irADetalle} className={`bg-white rounded-lg shadow-sm overflow-hidden ${clickable} ${!prod.is_available ? 'opacity-60' : ''}`}>
                        {prod.image_url && <img src={prod.image_url} alt={prod.name} className="w-full h-40 object-cover" />}
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900" style={{ fontFamily: fontTitle }}>{prod.name}</h3>
                            {agotadoBadge}
                          </div>
                          {controles}
                        </div>
                      </div>
                    )
                  }

                  // FOTO + PRECIO
                  if (cardStyle === 'foto-precio') {
                    return (
                      <div key={prod.id} onClick={irADetalle} className={`bg-white rounded-lg shadow-sm overflow-hidden ${clickable} ${!prod.is_available ? 'opacity-60' : ''}`}>
                        {prod.image_url && <img src={prod.image_url} alt={prod.name} className="w-full h-40 object-cover" />}
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-gray-900" style={{ fontFamily: fontTitle }}>{prod.name}</h3>
                            {agotadoBadge}
                          </div>
                          <p className="text-lg font-bold mb-3" style={{ color: primary }}>${Number(prod.base_price).toFixed(2)}</p>
                          {controles}
                        </div>
                      </div>
                    )
                  }

                  // LISTA
                  if (cardStyle === 'lista') {
                    return (
                      <div key={prod.id} onClick={irADetalle} className={`bg-white rounded-lg shadow-sm p-3 flex gap-3 items-center ${clickable} ${!prod.is_available ? 'opacity-60' : ''}`}>
                        {prod.image_url && <img src={prod.image_url} alt={prod.name} className="w-20 h-20 rounded object-cover flex-shrink-0" />}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-gray-900" style={{ fontFamily: fontTitle }}>{prod.name}</h3>
                            {agotadoBadge}
                          </div>
                          {prod.description && <p className="text-sm text-gray-500">{prod.description}</p>}
                          <p className="font-bold mt-1 mb-2" style={{ color: primary }}>${Number(prod.base_price).toFixed(2)}</p>
                          {controles}
                        </div>
                      </div>
                    )
                  }

                  // COMPLETO y DESTACADO
                  return (
                    <div key={prod.id} onClick={irADetalle} className={`bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 ${clickable} ${!prod.is_available ? 'opacity-60' : ''}`}>
                      {prod.image_url && (
                        <img src={prod.image_url} alt={prod.name} className={`w-full object-cover ${cardStyle === 'destacado' ? 'h-72' : 'h-48'}`} />
                      )}
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900" style={{ fontFamily: fontTitle }}>{prod.name}</h3>
                          {agotadoBadge}
                        </div>
                        {prod.description && <p className="text-sm text-gray-500 mb-3">{prod.description}</p>}
                        <p className="text-lg font-bold mb-3" style={{ color: primary }}>${Number(prod.base_price).toFixed(2)}</p>
                        {controles}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
              {redes.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="text-center text-sm text-gray-500 mb-4" style={{ fontFamily: fontTitle }}>Síguenos en redes</p>
          <div className="flex justify-center gap-8 flex-wrap">
            {redes.map((r) => (
              <a key={r.label} href={`${r.base}${r.user}`} target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition" style={{ backgroundColor: primary }}>
                  {iconoRed(r.label)}
                </div>
                <span className="text-xs text-gray-600">@{r.user}</span>
              </a>
            ))}
          </div>
        </div>
      )}
      </main>

      {/* Barra de pedido fija abajo */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">{cart.reduce((s, i) => s + i.cantidad, 0)} artículo(s)</p>
              <p className="text-xl font-bold text-gray-900">Total: ${total.toFixed(2)}</p>
            </div>
            <button onClick={ordenarWhatsApp} className="text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2" style={{ backgroundColor: secondary }}>
              🟢 Ordenar por WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  )
}



export default CatalogPage