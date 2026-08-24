import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import CatalogPage from './CatalogPage'
import RegisterPage from './RegisterPage'
import LoginPage from './LoginPage'
import { useAuth } from './AuthContext'
import AdminPage from './AdminPage'
import CustomizePage from './CustomizePage'
import AccountPage from './AccountPage'
import ProductPage from './ProductPage'
import VitrazaHeader from './VitrazaHeader'
import VitrazaFooter from './VitrazaFooter'
import CustomerAccountPage from './CustomerAccountPage'

function RootRedirect() {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Cargando...</p></div>
  if (user && profile?.role === 'admin') return <Navigate to="/admin" replace />
  if (user && profile?.role === 'customer') return <Navigate to="/cuenta" replace />
  return <Navigate to="/login" replace />
}
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/personalizar" element={<CustomizePage />} />
        <Route path="/admin/cuenta" element={<AccountPage />} />
        <Route path="/cuenta" element={<CustomerAccountPage />} />
        <Route path="/:slug/producto/:productId" element={<ProductPage />} />
        <Route path="/:slug" element={<CatalogPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App