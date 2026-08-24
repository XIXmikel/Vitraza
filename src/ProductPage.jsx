import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from './supabaseClient'

function ProductPage() {
  const { slug, productId } = useParams()
  const [tenant, setTenant] = useState(null)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Campos de cotización
  const [ubicacion, setUbicacion] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [decoracion, setDecoracion] = useState('')
  const [dudas, setDudas] = useState('')

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      const { data: t } = await supabase.from('tenants').select('*').eq('slug', slug).single()
      if (!t) { setNotFound(true); setLoading(false); return }
      setTenant(t)
      const { data: p } = await supabase.from('products').select('*').eq('id', productId).eq('tenant_id', t.id).single()
      if (!p) { setNotFound(true); setLoading(false); return }
      setProduct(p)
      setLoading(false)
    }
    cargar()
  }, [slug, productId])

  function cotizar() {
    let msg = `Hola 👋 Quiero cotizar: ${product.name} — $${Number(product.base_price).toFixed(2)}.\n`
    if (ubicacion.trim()) msg += `\n📍 Ubicación de entrega: ${ubicacion.trim()}`
    if (fecha.trim()) msg += `\n📅 Fecha de entrega: ${fecha.trim()}`
    if (hora.trim()) msg += `\n🕐 Hora de entrega: ${hora.trim()}`
    if (decoracion.trim()) msg += `\n🎨 Decoración: ${decoracion.trim()}`
    if (dudas.trim()) msg += `\n❓ Dudas: ${dudas.trim()}`
    msg += `\n\n📸 (Adjunto fotos de inspiración en este chat)`
    const url = `https://wa.me/${tenant.whatsapp_number}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Cargando...</p></div>
  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Producto no encontrado</h1>
        <Link to={`/${slug}`} className="text-blue-600 hover:underline">Volver al catálogo</Link>
      </div>
    </div>
  )

  const primary = tenant?.theme?.primary || '#2563eb'
  const secondary = tenant?.theme?.secondary || '#f3f4f6'
  const fontTitle = tenant?.theme?.font_title || 'Poppins'
  const fontBody = tenant?.theme?.font_body || 'Inter'

  return (
    <div className="min-h-screen" style={{ backgroundColor: secondary, fontFamily: fontBody }}>
      <div className="p-4">
        <Link to={`/${slug}`} className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900 font-semibold bg-white px-4 py-2 rounded-lg shadow-sm">
          ← Volver al catálogo
        </Link>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden md:flex">
          {/* Foto grande */}
          <div className="md:w-1/2">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-72 md:h-full object-cover" />
            ) : (
              <div className="w-full h-72 md:h-full bg-gray-100 flex items-center justify-center text-gray-300">Sin foto</div>
            )}
          </div>

          {/* Info y cotización */}
          <div className="md:w-1/2 p-6">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: fontTitle }}>{product.name}</h1>
              {!product.is_available && (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap">Agotado</span>
              )}
            </div>

            <p className="text-3xl font-bold mb-4" style={{ color: primary }}>${Number(product.base_price).toFixed(2)}</p>

            {product.description && <p className="text-gray-600 mb-6 whitespace-pre-line">{product.description}</p>}

            {/* Campos de cotización */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">📍 Ubicación de entrega</label>
                <textarea value={ubicacion} onChange={(e) => setUbicacion(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" rows="2"
                  placeholder="Ej: Calle 50, Edificio Torre Mar, apto 7B. Casa #23, barrio El Carmen." />
                <p className="text-xs text-gray-400 mt-1">
                  Sé específico: número de casa, o nombre del edificio con número de apartamento, referencias cercanas, etc.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">📅 Fecha de entrega</label>
                  <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">🕐 Hora</label>
                  <input type="time" value={hora} onChange={(e) => setHora(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">🎨 Descripción de decoración</label>
                <textarea value={decoracion} onChange={(e) => setDecoracion(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" rows="2"
                  placeholder="Ej: Colores pastel, tema de unicornios, dedicatoria 'Feliz cumple Ana'" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">❓ ¿Alguna otra duda?</label>
                <textarea value={dudas} onChange={(e) => setDudas(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" rows="2"
                  placeholder="Aquí puedes ingresar cualquier otra duda adicional que tengas al respecto." />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
                📸 Si tienes fotos de inspiración para la decoración, podrás adjuntarlas directamente en el chat de WhatsApp al enviar tu cotización.
              </div>
            </div>

            <button onClick={cotizar}
              className="w-full mt-5 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2">
              🟢 Cotizar vía WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPage