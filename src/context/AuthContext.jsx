import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase.jsx'
import { getUserProfile, getIsAdmin } from '../services/authService.jsx'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // "loading" only represents Firebase Authentication.
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    let active = true

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (!active) return

      setUser(fbUser)

      if (!fbUser) {
        setProfile(null)
        setIsAdmin(false)
        setProfileLoading(false)
        setLoading(false)
        return
      }

      // Authentication is complete. Do not block the app while Firestore loads.
      setLoading(false)
      setProfileLoading(true)

      Promise.all([
        getUserProfile(fbUser.uid).catch((error) => {
          console.error('Failed to load user profile:', error)
          return null
        }),
        getIsAdmin(fbUser).catch((error) => {
          console.error('Failed to read admin claim:', error)
          return false
        }),
      ]).then(([nextProfile, admin]) => {
        // Ignore stale results after logout or account switching.
        if (!active || auth.currentUser?.uid !== fbUser.uid) return

        setProfile(nextProfile)
        setIsAdmin(admin)
        setProfileLoading(false)
      })
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    const currentUser = auth.currentUser
    if (!currentUser) return null

    setProfileLoading(true)

    try {
      const nextProfile = await getUserProfile(currentUser.uid)

      if (auth.currentUser?.uid === currentUser.uid) {
        setProfile(nextProfile)
      }

      return nextProfile
    } catch (error) {
      console.error('Failed to refresh profile:', error)
      return null
    } finally {
      if (auth.currentUser?.uid === currentUser.uid) {
        setProfileLoading(false)
      }
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      profile,
      isAdmin,
      loading,
      profileLoading,
      refreshProfile,
    }),
    [user, profile, isAdmin, loading, profileLoading, refreshProfile]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}