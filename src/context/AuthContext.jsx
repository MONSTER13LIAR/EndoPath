import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  // Restore session on load
  useEffect(() => {
    const stored = localStorage.getItem('endopath_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { localStorage.clear() }
    }
  }, [])

  const handleGoogleSuccess = useCallback(async (tokenResponse) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: tokenResponse.access_token }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')

      localStorage.setItem('endopath_token', data.token)
      localStorage.setItem('endopath_user', JSON.stringify(data.user))
      setUser(data.user)
      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
    }
  }, [navigate])

  const triggerLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: (err) => console.error('Google OAuth error:', err),
    flow: 'implicit',
  })

  const logout = useCallback(() => {
    localStorage.removeItem('endopath_token')
    localStorage.removeItem('endopath_user')
    setUser(null)
    navigate('/')
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user, triggerLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
