import { Link } from 'react-router-dom'

function VitrazaFooter({ minimal = false }) {
  if (minimal) {
    return (
      <footer className="py-6 text-center">
        <a href="/" className="text-xs text-gray-400 hover:text-gray-600">
          Hecho con Vitraza
        </a>
      </footer>
    )
  }

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <img src="/vitraza-logo-blanco.png" alt="Vitraza" className="h-8 mb-3" />
            <p className="text-sm text-gray-400 max-w-xs">
              Crea el catálogo de tu negocio y recibe pedidos por WhatsApp.
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <h4 className="font-semibold text-white mb-2 text-sm">Producto</h4>
              <ul className="space-y-1 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-white">Inicio</Link></li>
                <li><Link to="/registro" className="hover:text-white">Crear catálogo</Link></li>
                <li><Link to="/login" className="hover:text-white">Iniciar sesión</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-sm text-gray-500">
          © {new Date().getFullYear()} Vitraza. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}

export default VitrazaFooter