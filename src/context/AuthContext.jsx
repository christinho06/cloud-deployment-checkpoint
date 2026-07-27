import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('userInfo')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setUser(data)
      localStorage.setItem('userInfo', JSON.stringify(data))
      toast.success(`Bienvenue, ${data.name} !`)
      return data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de connexion')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password, role, storeName) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role, storeName })
      setUser(data)
      localStorage.setItem('userInfo', JSON.stringify(data))
      toast.success(`Compte cree ! Bienvenue, ${data.name} !`)
      return data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la creation du compte')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('userInfo')
    toast.success('Deconnexion reussie')
  }

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData }
    setUser(newUser)
    localStorage.setItem('userInfo', JSON.stringify(newUser))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
