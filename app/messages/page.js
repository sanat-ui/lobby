// app/messages/page.js
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser, getProfile, getConversations } from '../../lib/supabase'
import styles from './messages.module.css'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (mins < 1) return 'NOW'
  if (mins < 60) return `${mins}M`
  if (hours < 24) return `${hours}H`
  return `${days}D`
}

export default function MessagesPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(null)
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { user } = await getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await getProfile(user.id)
      if (!profile) { router.push('/onboarding'); return }
      setCurrentUser(user)

      const { data } = await getConversations(user.id)
      setConversations(data || [])
      setLoading(false)
    }
    load()
  }, [])

  function getOtherProfile(conv) {
    if (!currentUser) return null
    return conv.participant_1 === currentUser.id
      ? conv.profile_2
      : conv.profile_1
  }

  function getUnread(conv) {
    if (!currentUser) return 0
    return conv.participant_1 === currentUser.id
      ? conv.unread_1
      : conv.unread_2
  }

  return (
    <main className={styles.page}>
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <Link href="/feed" className={styles.backBtn}>← BACK</Link>
          <span className={styles.navTitle}>MESSAGES</span>
        </div>
      </nav>

      <div className={styles.body}>
        <div className={styles.window}>
          <div className={styles.windowBar}>
            <span className={styles.windowTitle}>INBOX.EXE</span>
            <div className={styles.windowDots}>
              <div className={styles.windowDot} />
              <div className={styles.windowDot} />
              <div className={styles.windowDot} />
            </div>
          </div>

          {loading ? (
            <div className={styles.loader}>LOADING...</div>
          ) : conversations.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>💬</span>
              <h2 className={styles.emptyTitle}>NO MESSAGES YET</h2>
              <p className={styles.emptyText}>
                Join a session from the feed and start a conversation.
              </p>
            </div>
          ) : (
            <div className={styles.convList}>
              {conversations.map(conv => {
                const other = getOtherProfile(conv)
                const unread = getUnread(conv)
                if (!other) return null
                return (
                  <Link
                    key={conv.id}
                    href={`/messages/${conv.id}`}
                    className={styles.convItem}
                  >
                    <div className={styles.convAvatar}>
                      {other.avatar_url
                        ? <img src={other.avatar_url} alt={other.display_name} />
                        : getInitials(other.display_name || other.username)
                      }
                    </div>
                    <div className={styles.convInfo}>
                      <div className={styles.convName}>
                        {other.display_name || other.username}
                      </div>
                      <div className={styles.convPreview}>
                        {conv.last_message || 'No messages yet'}
                      </div>
                    </div>
                    <div className={styles.convMeta}>
                      <span className={styles.convTime}>
                        {conv.last_message_at ? timeAgo(conv.last_message_at) : ''}
                      </span>
                      {unread > 0 && (
                        <span className={styles.unreadBadge}>{unread}</span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}