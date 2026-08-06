'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getProfile } from '../../../lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    async function handleCallback() {
      // Supabase client automatically detects the code in the URL
      // and exchanges it for a session
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        router.push('/login?error=auth_failed')
        return
      }

      const { data: profile } = await getProfile(session.user.id)

      if (!profile) {
        router.push('/onboarding')
      } else {
        router.push('/feed')
      }
    }

    // Small delay to let Supabase process the URL params
    setTimeout(handleCallback, 800)
  }, [])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#F5F5F5',
      fontFamily: 'monospace',
      color: '#888',
      letterSpacing: '4px',
      fontSize: '14px'
    }}>
      SIGNING IN...
    </div>
  )
}