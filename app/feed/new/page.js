// app/feed/new/page.js
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getProfile, createLFGPost } from '../../../lib/supabase'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import styles from './new.module.css'

const GAMES = [
  'Valorant', 'BGMI', 'CS2', 'Fortnite', 'Apex Legends',
  'COD Mobile', 'Free Fire', 'GTA V', 'Minecraft', 'FIFA',
  'Rocket League', 'League of Legends', 'DOTA 2', 'Other'
]

const ROLES = {
  'Valorant':  ['Duelist', 'Controller', 'Initiator', 'Sentinel', 'Any'],
  'CS2':       ['Entry Fragger', 'AWPer', 'Support', 'Lurker', 'IGL', 'Any'],
  'BGMI':      ['Assaulter', 'Sniper', 'Support', 'Scout', 'Any'],
  'Apex Legends': ['Fragger', 'Support', 'Recon', 'Any'],
  'default':   ['Any Role']
}

const RANKS = {
  'Valorant':  ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant', 'Any'],
  'CS2':       ['Silver', 'Gold Nova', 'MG', 'DMG', 'LE', 'LEM', 'Supreme', 'Global', 'Any'],
  'BGMI':      ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown', 'Ace', 'Conqueror', 'Any'],
  'default':   ['Beginner', 'Intermediate', 'Advanced', 'Any']
}

const SLOTS = [1, 2, 3, 4]
const DURATIONS = [1, 2, 3, 4, 5]

// Generate time options in IST — next 48 hours in 30 min slots
function getTimeOptions() {
  const options = []
  const now = new Date()
  // Round up to next 30 min slot
  now.setMinutes(now.getMinutes() > 30 ? 60 : 30, 0, 0)

  for (let i = 0; i < 96; i++) {
    const time = new Date(now.getTime() + i * 30 * 60 * 1000)
    const label = time.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    options.push({ label, value: time.toISOString() })
  }
  return options
}

export default function NewLFGPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [game, setGame] = useState('')
  const [role, setRole] = useState('')
  const [rank, setRank] = useState('')
  const [sessionTime, setSessionTime] = useState('')
  const [durationHours, setDurationHours] = useState(2)
  const [slotsOpen, setSlotsOpen] = useState(1)
  const [note, setNote] = useState('')

  const timeOptions = getTimeOptions()
  const roles = game ? (ROLES[game] || ROLES['default']) : []
  const ranks = game ? (RANKS[game] || RANKS['default']) : []
  const NOTE_LIMIT = 120

  useEffect(() => {
    async function check() {
      const { user } = await getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await getProfile(user.id)
      if (!data) { router.push('/onboarding'); return }
      setProfile(data)
      // Pre-select first game from their profile if available
      if (data.games?.length > 0) {
        setGame(data.games[0])
      }
    }
    check()
  }, [])

  // Reset role and rank when game changes
  useEffect(() => {
    setRole('')
    setRank('')
  }, [game])

  function validate() {
    if (!game) return 'Pick a game.'
    if (!rank) return 'Select a rank so people know who to expect.'
    if (!sessionTime) return 'Set a session time.'
    if (note.length > NOTE_LIMIT) return `Note must be under ${NOTE_LIMIT} characters.`
    return null
  }

  async function handleSubmit() {
    setError('')
    const err = validate()
    if (err) { setError(err); return }

    setLoading(true)

    const { error } = await createLFGPost({
      user_id: profile.id,
      game,
      role: role || 'Any',
      rank,
      session_time: sessionTime,
      duration_hours: durationHours,
      slots_open: slotsOpen,
      note: note.trim() || null,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/feed')
  }

  if (!profile) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
      Loading...
    </div>
  )

  return (
    <main className={styles.page}>
      <div className={styles.box}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.back()}>←</button>
          <h1 className={styles.title}>Post an LFG</h1>
        </div>

        <div className={styles.card}>
          <div className={styles.form}>

            {/* Game */}
            <div className={styles.field}>
              <label className={styles.label}>Game</label>
              <select
                className={styles.select}
                value={game}
                onChange={e => setGame(e.target.value)}
              >
                <option value="">Select a game</option>
                {GAMES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Role + Rank */}
            {game && (
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Your role</label>
                  <select
                    className={styles.select}
                    value={role}
                    onChange={e => setRole(e.target.value)}
                  >
                    <option value="">Select role</option>
                    {roles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Your rank</label>
                  <select
                    className={styles.select}
                    value={rank}
                    onChange={e => setRank(e.target.value)}
                  >
                    <option value="">Select rank</option>
                    {ranks.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Session time */}
            <div className={styles.field}>
              <label className={styles.label}>Session starts at (IST)</label>
              <select
                className={styles.select}
                value={sessionTime}
                onChange={e => setSessionTime(e.target.value)}
              >
                <option value="">Pick a time</option>
                {timeOptions.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Duration + Slots */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Duration (hours)</label>
                <select
                  className={styles.select}
                  value={durationHours}
                  onChange={e => setDurationHours(Number(e.target.value))}
                >
                  {DURATIONS.map(d => (
                    <option key={d} value={d}>{d}h</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Slots open</label>
                <select
                  className={styles.select}
                  value={slotsOpen}
                  onChange={e => setSlotsOpen(Number(e.target.value))}
                >
                  {SLOTS.map(s => (
                    <option key={s} value={s}>{s} {s === 1 ? 'player' : 'players'}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Note */}
            <div className={styles.field}>
              <label className={styles.label}>Note (optional)</label>
              <textarea
                className={styles.textarea}
                placeholder="e.g. Looking for chill ranked duo, no rage please 🙏"
                value={note}
                onChange={e => setNote(e.target.value)}
                maxLength={NOTE_LIMIT + 10}
              />
              <span className={[
                styles.charCount,
                note.length > NOTE_LIMIT - 20 ? styles.warn : '',
                note.length > NOTE_LIMIT ? styles.over : ''
              ].filter(Boolean).join(' ')}>
                {note.length}/{NOTE_LIMIT}
              </span>
            </div>

            {error && <div className={styles.errorMsg}>{error}</div>}

          </div>

          <div className={styles.footer}>
            <Button variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button fullWidth disabled={loading} onClick={handleSubmit}>
              {loading ? 'Posting...' : 'Post LFG 🎮'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}