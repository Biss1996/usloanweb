import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase.jsx'
import { getUserProfile } from '../services/authService.jsx'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    let active = true
    let authChange = 0

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      const thisChange = ++authChange

      if (!active) return

      setUser(fbUser)
      setIsAdmin(false)

      if (!fbUser) {
        setProfile(null)
        setProfileLoading(false)
        setLoading(false)
        return
      }

      // Keep protected routes waiting until the admin claim is known.
      setLoading(true)
      setProfile(null)
      setProfileLoading(true)

      fbUser
        .getIdTokenResult()
        .then((tokenResult) => {
          if (
            !active ||
            thisChange !== authChange ||
            auth.currentUser?.uid !== fbUser.uid
          ) {
            return
          }

          setIsAdmin(tokenResult.claims.admin === true)
        })
        .catch((error) => {
          console.error('Failed to read admin claim:', error)

          if (active && thisChange === authChange) {
            setIsAdmin(false)
          }
        })
        .finally(() => {
          if (active && thisChange === authChange) {
            setLoading(false)
          }
        })

      getUserProfile(fbUser.uid)
        .then((nextProfile) => {
          if (
            active &&
            thisChange === authChange &&
            auth.currentUser?.uid === fbUser.uid
          ) {
            setProfile(nextProfile)
          }
        })
        .catch((error) => {
          console.error('Failed to load user profile:', error)
        })
        .finally(() => {
          if (active && thisChange === authChange) {
            setProfileLoading(false)
          }
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
    [
      user,
      profile,
      isAdmin,
      loading,
      profileLoading,
      refreshProfile,
    ]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}