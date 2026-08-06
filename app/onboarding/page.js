// app/onboarding/page.js
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, createProfile, checkUsernameAvailable, getProfile } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import styles from './onboarding.module.css'

const GAMES = [
  'Valorant', 'BGMI', 'CS2', 'Fortnite', 'Apex Legends',
  'COD Mobile', 'Free Fire', 'GTA V', 'Minecraft', 'FIFA',
  'Rocket League', 'League of Legends', 'DOTA 2', 'Other'
]

const PLATFORMS = ['PC', 'Mobile', 'PS5', 'Xbox', 'Nintendo Switch']

const PLAY_STYLES = [
  { value: 'Casual', label: '😌 Casual', desc: 'Just vibing, no pressure' },
  { value: 'Competitive', label: '🔥 Competitive', desc: 'Here to rank up and win' },
  { value: 'Both', label: '⚡ Both', desc: 'Depends on the mood' },
]

const TOTAL_STEPS = 3

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [usernameStatus, setUsernameStatus] = useState('')

  // Step 2
  const [selectedGames, setSelectedGames] = useState([])
  const [selectedPlatforms, setSelectedPlatforms] = useState([])

  // Step 3
  const [playStyle, setPlayStyle] = useState('')
  const [playTimeStart, setPlayTimeStart] = useState(21)
  const [playTimeEnd, setPlayTimeEnd] = useState(24)

  useEffect(() => {
    async function check() {
      const { user } = await getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await getProfile(user.id)
      if (profile) { router.push('/feed'); return }

      if (user?.user_metadata?.full_name) {
        setDisplayName(user.user_metadata.full_name)
      }
    }
    check()
  }, [])

  // Username availability check — debounced
  useEffect(() => {
    if (username.length < 3) { setUsernameStatus(''); return }
    const timer = setTimeout(async () => {
      const available = await checkUsernameAvailable(username)
      setUsernameStatus(available ? 'available' : 'taken')
    }, 500)
    return () => clearTimeout(timer)
  }, [username])

  function toggleGame(game) {
    setSelectedGames(prev =>
      prev.includes(game) ? prev.filter(g => g !== game) : [...prev, game]
    )
  }

  function togglePlatform(platform) {
    setSelectedPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    )
  }

  function validateStep1() {
    if (!username || username.length < 3) return 'Username must be at least 3 characters.'
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only have letters, numbers, and underscores.'
    if (usernameStatus === 'taken') return 'That username is already taken.'
    if (!displayName) return 'Add a display name so people know who you are.'
    return null
  }

  function validateStep2() {
    if (selectedGames.length === 0) return 'Pick at least one game you play.'
    return null
  }

  function validateStep3() {
    if (!playStyle) return 'Tell us how you like to play.'
    return null
  }

  function nextStep() {
    setError('')
    let err = null
    if (step === 1) err = validateStep1()
    if (step === 2) err = validateStep2()
    if (err) { setError(err); return }
    setStep(s => s + 1)
  }

  async function handleSubmit() {
    setError('')
    const err = validateStep3()
    if (err) { setError(err); return }

    setLoading(true)

    const { user: currentUser } = await getUser()
    if (!currentUser) {
      router.push('/login')
      return
    }

    const { error } = await createProfile({
      id: currentUser.id,
      username: username.toLowerCase(),
      display_name: displayName,
      bio,
      games: selectedGames,
      platforms: selectedPlatforms,
      play_style: playStyle,
      play_time_start: playTimeStart,
      play_time_end: playTimeEnd,
    })

  if (error) {
    setError(error.message || JSON.stringify(error))
    setLoading(false)
    return
  }

    router.push('/feed')
  }

  return (
    <main className={styles.page}>
      <div className={styles.box}>
        <div className={styles.progress}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={[styles.progressStep, i < step ? styles.active : ''].join(' ')}
            />
          ))}
        </div>

        <div className={styles.card}>
          {/* ── Step 1 ── */}
          {step === 1 && (
            <>
              <p className={styles.stepLabel}>Step 1 of 3</p>
              <h1 className={styles.title}>What do people call you?</h1>
              <p className={styles.subtitle}>Set up your gamer identity. You can edit this later.</p>
              <div className={styles.form}>
                <div>
                  <Input
                    label="Username"
                    placeholder="your_tag"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase())}
                  />
                  {usernameStatus && (
                    <p className={[styles.usernameHint, styles[usernameStatus]].join(' ')}>
                      {usernameStatus === 'available' ? '✓ Username is available' : '✗ Username is taken'}
                    </p>
                  )}
                </div>
                <Input
                  label="Display name"
                  placeholder="The name your squad sees"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                />
                <Input
                  label="Bio (optional)"
                  placeholder="e.g. Valorant Gold | Available 9PM-12AM IST"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                />
              </div>
            </>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <>
              <p className={styles.stepLabel}>Step 2 of 3</p>
              <h1 className={styles.title}>What do you play?</h1>
              <p className={styles.subtitle}>Pick the games you're active in.</p>
              <p className={styles.tagLabel}>Games</p>
              <div className={styles.tagGrid}>
                {GAMES.map(game => (
                  <button
                    key={game}
                    className={[styles.gameTag, selectedGames.includes(game) ? styles.selected : ''].join(' ')}
                    onClick={() => toggleGame(game)}
                    type="button"
                  >
                    {game}
                  </button>
                ))}
              </div>
              <p className={styles.tagLabel} style={{ marginTop: '24px' }}>Platforms</p>
              <div className={styles.tagGrid}>
                {PLATFORMS.map(p => (
                  <button
                    key={p}
                    className={[styles.gameTag, selectedPlatforms.includes(p) ? styles.selected : ''].join(' ')}
                    onClick={() => togglePlatform(p)}
                    type="button"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <>
              <p className={styles.stepLabel}>Step 3 of 3</p>
              <h1 className={styles.title}>How do you play?</h1>
              <p className={styles.subtitle}>This helps us match you with the right people.</p>
              <div className={styles.form}>
                <div className={styles.tagGrid} style={{ flexDirection: 'column' }}>
                  {PLAY_STYLES.map(ps => (
                    <button
                      key={ps.value}
                      className={[styles.gameTag, playStyle === ps.value ? styles.selected : ''].join(' ')}
                      onClick={() => setPlayStyle(ps.value)}
                      type="button"
                      style={{ textAlign: 'left', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}
                    >
                      <div style={{ fontWeight: 500 }}>{ps.label}</div>
                      <div style={{ fontSize: 'var(--text-xs)', opacity: 0.7, marginTop: '2px' }}>{ps.desc}</div>
                    </button>
                  ))}
                </div>
                <div>
                  <p className={styles.tagLabel}>When do you usually play? (IST)</p>
                  <div className={styles.timeRow}>
                    <span className={styles.timeLabel}>From</span>
                    <select
                      value={playTimeStart}
                      onChange={e => setPlayTimeStart(Number(e.target.value))}
                      style={{
                        background: 'var(--surface-input)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        padding: '8px 12px',
                        fontSize: 'var(--text-sm)',
                        cursor: 'pointer'
                      }}
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                        </option>
                      ))}
                    </select>
                    <span className={styles.timeLabel}>To</span>
                    <select
                      value={playTimeEnd}
                      onChange={e => setPlayTimeEnd(Number(e.target.value))}
                      style={{
                        background: 'var(--surface-input)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        padding: '8px 12px',
                        fontSize: 'var(--text-sm)',
                        cursor: 'pointer'
                      }}
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className={styles.errorMsg} style={{ marginTop: '16px' }}>
              {error}
            </div>
          )}

          <div className={styles.actions}>
            {step > 1 && (
              <Button variant="secondary" onClick={() => setStep(s => s - 1)}>
                Back
              </Button>
            )}
            {step < TOTAL_STEPS ? (
              <Button fullWidth onClick={nextStep}>
                Continue
              </Button>
            ) : (
              <Button fullWidth disabled={loading} onClick={handleSubmit}>
                {loading ? 'Setting up your profile...' : 'Enter Lobby 🎮'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}