import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/connexion" replace />

  if (role === 'seller' && user.role !== 'seller' && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  if (role === 'admin' && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}
