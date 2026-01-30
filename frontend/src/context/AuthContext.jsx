import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('rosterra_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    // Simple authentication - in production, use proper backend
    const users = JSON.parse(localStorage.getItem('rosterra_users') || '[]')
    const foundUser = users.find(u => u.email === email && u.password === password)
    
    if (foundUser) {
      const userData = { ...foundUser }
      delete userData.password
      setUser(userData)
      localStorage.setItem('rosterra_user', JSON.stringify(userData))
      return { success: true }
    }
    return { success: false, error: 'Invalid credentials' }
  }

  const signup = (name, email, password, role = 'staff') => {
    const users = JSON.parse(localStorage.getItem('rosterra_users') || '[]')
    
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already exists' }
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role: role === 'admin' ? 'admin' : 'staff',
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    localStorage.setItem('rosterra_users', JSON.stringify(users))

    const userData = { ...newUser }
    delete userData.password
    setUser(userData)
    localStorage.setItem('rosterra_user', JSON.stringify(userData))
    
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('rosterra_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
