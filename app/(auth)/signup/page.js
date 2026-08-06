// app/(auth)/signup/page.js
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signUpWithEmail, signInWithGoogle } from '../../../lib/supabase'
import styles from './signup.module.css'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSignup(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('PASSWORDS DO NOT MATCH.')
      return
    }
    if (password.length < 8) {
      setError('PASSWORD MUST BE 8+ CHARACTERS.')
      return
    }
    setLoading(true)
    const { error } = await signUpWithEmail(email, password)
    if (error) {
      setError(error.message.toUpperCase())
      setLoading(false)
      return
    }
    setSent(true)
  }

  async function handleGoogleLogin() {
    const { error } = await signInWithGoogle()
    if (error) setError('GOOGLE LOGIN FAILED. TRY AGAIN.')
  }

  return (
    <main className={styles.page}>
      <div className={styles.box}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>LOBBY</Link>
          <p className={styles.tagline}>▶ PLAYER NETWORK ONLINE</p>
        </div>

        <div className={styles.window}>
          <div className={styles.windowBar}>
            <span className={styles.windowTitle}>
              {sent ? 'MAIL_SENT.EXE' : 'SIGNUP.EXE'}
            </span>
            <div className={styles.windowDots}>
              <div className={styles.windowDot} />
              <div className={styles.windowDot} />
              <div className={styles.windowDot} />
            </div>
          </div>

          {sent ? (
            <div className={styles.successBox}>
              <span className={styles.successIcon}>📬</span>
              <h1 className={styles.successTitle}>CHECK YOUR EMAIL</h1>
              <p className={styles.successText}>
                We sent a confirmation link to <strong>{email}</strong>.
                Click it to activate your account and set up your profile.
              </p>
            </div>
          ) : (
            <div className={styles.windowBody}>
              <button className={styles.googleBtn} onClick={handleGoogleLogin}>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.548 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
                </svg>
                CONTINUE WITH GOOGLE
              </button>

              <div className={styles.divider}>
                <span className={styles.dividerText}>OR</span>
              </div>

              {error && <div className={styles.errorMsg}>⚠ {error}</div>}

              <form className={styles.form} onSubmit={handleSignup}>
                <div className={styles.field}>
                  <label className={styles.label}>EMAIL</label>
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>PASSWORD</label>
                  <input
                    className={styles.input}
                    type="password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>CONFIRM PASSWORD</label>
                  <input
                    className={styles.input}
                    type="password"
                    placeholder="Same again"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                  />
                </div>
                <button
                  className={styles.submitBtn}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'LOADING...' : '▶ CREATE ACCOUNT'}
                </button>
              </form>
            </div>
          )}
        </div>

        <p className={styles.footer}>
          ALREADY HAVE AN ACCOUNT? <Link href="/login">SIGN IN</Link>
        </p>
      </div>
    </main>
  )
}