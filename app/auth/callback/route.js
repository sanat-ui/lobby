// app/auth/callback/route.js
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )// app/auth/callback/route.js
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // If Supabase returned an error
  if (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(`${origin}/login?error=${error}`)
  }

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Exchange error:', exchangeError.message)
      return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
    }

    if (data?.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      return NextResponse.redirect(`${origin}/feed`)
    }
  }

  // No code in URL — send back to login
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      return NextResponse.redirect(`${origin}/feed`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}