// AuthContext.jsx — app-wide auth state (Firebase user + profile + admin flag).
import React, { createContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase.jsx'
import { getUserProfile, getIsAdmin } from '../services/authService.jsx'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true)
      setUser(fbUser)
      if (fbUser) {
        const [p, admin] = await Promise.all([
          getUserProfile(fbUser.uid).catch(() => null),
          getIsAdmin(fbUser).catch(() => false),
        ])
        setProfile(p)
        setIsAdmin(admin)
      } else {
        setProfile(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const refreshProfile = async () => {
    if (user) setProfile(await getUserProfile(user.uid).catch(() => null))
  }

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
