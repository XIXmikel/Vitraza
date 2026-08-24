import { Link } from 'react-router-dom'
import { useAuth } from './AuthContext'

function VitrazaHeader({ variant = 'default' }) {
  const { user, profile, signOut } = useAuth()
  const isAdmin = profile?.role === 'admin'

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo a la izquierda */}
        <Link to="/" className="flex items-center">
          <img
            src="/vitraza-logo.png"
            alt="Vitraza"
            className={variant === 'large' ? 'h-10' : 'h-8'}
          />
        </Link>

        {/* Derecha: navegación / cuenta */}
        <nav className="flex items-center gap-3">
          {user && isAdmin && (
            <Link to="/admin" className="text-sm font-semibold text-gray-600 hover:text-gray-900 hidden sm:block">
              Mi panel
            </Link>
          )}
          {!user && (
            <>
              <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900">Iniciar sesión</Link>
              <Link to="/registro" className="text-sm font-semibold text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">Registrarse</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default VitrazaHeader