// components/feed/LFGCard.js
'use client'
import { useState } from 'react'
import { requestToJoin, reportPost } from '../../lib/supabase'
import styles from './LFGCard.module.css'
import { useRouter } from 'next/navigation'
import { getOrCreateConversation } from '../../lib/supabase'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function formatSessionTime(isoString) {
  const date = new Date(isoString)
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

function timeFromNow(isoString) {
  const diff = new Date(isoString) - new Date()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (diff < 0) return 'STARTED'
  if (hours === 0) return `IN ${mins}M`
  if (hours < 24) return `IN ${hours}H ${mins}M`
  return `IN ${Math.floor(hours / 24)}D`
}

export default function LFGCard({ post, currentUserId }) {
  const [joined, setJoined] = useState(post.requests?.includes(currentUserId))
  const [joining, setJoining] = useState(false)
  const [reported, setReported] = useState(false)

  const isOwn = post.user_id === currentUserId
  const slotsLeft = post.slots_open - (post.requests?.length || 0)
  const profile = post.profiles
  const router = useRouter()

  async function handleJoin() {
    if (!currentUserId || joined || isOwn) return
    setJoining(true)
    const { error } = await requestToJoin(post.id, currentUserId)
    if (!error) setJoined(true)
    setJoining(false)
  }

  async function handleReport() {
    if (!currentUserId || reported || isOwn) return
    const { error } = await reportPost(post.id, currentUserId, 'Inappropriate content')
    if (!error) setReported(true)
  }
  async function handleMessage() {
    if (!currentUserId || isOwn) return
    const { data: convId, error } = await getOrCreateConversation(currentUserId, post.user_id)
    if (!error && convId) {
      router.push(`/messages/${convId}`)
    }
  }

  return (
    <div className={styles.card}>
      {/* Window title bar */}
      <div className={styles.cardBar}>
        <span className={styles.cardBarTitle}>
          SESSION_{post.game?.toUpperCase().replace(/\s/g, '_')}.EXE
        </span>
        <div className={styles.cardBarDots}>
          <div className={styles.cardBarDot} />
          <div className={styles.cardBarDot} />
          <div className={styles.cardBarDot} />
        </div>
      </div>

      <div className={styles.cardBody}>
        {/* Top — avatar + user + game */}
        <div className={styles.top}>
          <div className={styles.avatarBox}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt={profile.display_name} />
              : getInitials(profile?.display_name || profile?.username)
            }
          </div>
          <div className={styles.userInfo}>
            <div className={styles.displayName}>
              {profile?.display_name || profile?.username}
            </div>
            <div className={styles.username}>@{profile?.username}</div>
          </div>
          <span className={styles.gameBadge}>{post.game}</span>
        </div>

        {/* Meta tags */}
        <div className={styles.meta}>
          {post.rank && (
            <span className={styles.metaTag}>🏆 {post.rank}</span>
          )}
          {post.role && post.role !== 'Any' && (
            <span className={styles.metaTag}>🎯 {post.role}</span>
          )}
          <span className={styles.metaTag}>👥 {post.slots_open} SLOT{post.slots_open > 1 ? 'S' : ''}</span>
          {profile?.play_style && (
            <span className={styles.metaTag}>
              {profile.play_style === 'Casual' ? '😌' : profile.play_style === 'Competitive' ? '🔥' : '⚡'} {profile.play_style.toUpperCase()}
            </span>
          )}
        </div>

        {/* Session time */}
        <div className={styles.sessionRow}>
          🕐 {formatSessionTime(post.session_time)} · {post.duration_hours}H · {timeFromNow(post.session_time)}
        </div>

        {/* Note */}
        {post.note && (
          <div className={styles.note}>"{post.note}"</div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          {isOwn ? (
            <div className={styles.ownBadge}>YOUR POST</div>
          ) : (
            <button
              className={[styles.joinBtn, joined ? styles.joined : ''].filter(Boolean).join(' ')}
              onClick={handleJoin}
              disabled={joining || joined || slotsLeft <= 0}
            >
              {joining ? 'JOINING...' : joined ? '✓ REQUESTED' : '▶ JOIN SESSION'}
            </button>
          )}
          {!isOwn && (
            <button className={styles.reportBtn} onClick={handleReport} title="Report">
              {reported ? '✓' : '⚑'}
            </button>
          )}
        </div>
        {!isOwn && (
  <button
    className={styles.reportBtn}
    onClick={handleMessage}
    title="Send message"
    style={{ width: 'auto', padding: '0 12px', fontSize: '12px' }}
  >
    💬
  </button>
)}

        {!isOwn && slotsLeft <= 1 && slotsLeft > 0 && (
          <div className={[styles.slotsLeft, styles.urgent].join(' ')}>
            ⚠ ONLY {slotsLeft} SLOT LEFT
          </div>
        )}
      </div>
    </div>
  )
}