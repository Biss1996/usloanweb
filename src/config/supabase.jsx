import { createClient } from '@supabase/supabase-js'
import { auth } from './firebase.jsx'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    accessToken: async () => {
      if (typeof auth.authStateReady === 'function') {
        await auth.authStateReady()
      }

      return auth.currentUser?.getIdToken() ?? null
    },
  }
)