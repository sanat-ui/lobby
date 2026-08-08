'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getOrCreateConversation,
  getUnreadCount,
  supabase
} from '../../lib/supabase'
import styles from './NotificationBell.module.css'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function NotificationBell({ userId }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadDMs, setUnreadDMs] = useState(0)
  const wrapperRef = useRef(null)

  // This must come AFTER both state declarations
  const unread = notifications.filter(n => !n.read).length + unreadDMs

  // Notifications realtime
  useEffect(() => {
    if (!userId) return
    loadNotifications()

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, () => loadNotifications())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId])

  // DM unread count realtime
  useEffect(() => {
    if (!userId) return
    loadDMs()

    const dmChannel = supabase
      .channel(`bell-dms-${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations'
      }, () => loadDMs())
      .subscribe()

    return () => supabase.removeChannel(dmChannel)
  }, [userId])

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function loadNotifications() {
    const { data } = await getNotifications(userId)
    if (data) setNotifications(data)
  }

  async function loadDMs() {
    const { count } = await getUnreadCount(userId)
    setUnreadDMs(count || 0)
  }

  async function handleNotificationClick(notif) {
    await markNotificationRead(notif.id)
    setNotifications(prev =>
      prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
    )
  }

  async function handleMessage(notif) {
    await markNotificationRead(notif.id)
    const requesterId = notif.data?.requester_id
    if (!requesterId) return
    const { data: convId } = await getOrCreateConversation(userId, requesterId)
    if (convId) {
      setOpen(false)
      router.push(`/messages/${convId}`)
    }
  }

  async function handleClearAll() {
    await markAllNotificationsRead(userId)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        className={styles.bell}
        onClick={() => setOpen(o => !o)}
      >
        🔔
        {unread > 0 && (
          <span className={styles.badge}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownBar}>
            <span className={styles.dropdownTitle}>NOTIFICATIONS.EXE</span>
            {unread > 0 && (
              <button className={styles.clearBtn} onClick={handleClearAll}>
                CLEAR ALL
              </button>
            )}
          </div>
          <div className={styles.list}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>NO NOTIFICATIONS YET</div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={[styles.item, !notif.read ? styles.unread : ''].filter(Boolean).join(' ')}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className={styles.itemTitle}>{notif.title}</div>
                  <div className={styles.itemBody}>{notif.body}</div>
                  <div className={styles.itemTime}>{timeAgo(notif.created_at)}</div>
                  {notif.type === 'join_request' && (
                    <div className={styles.itemActions}>
                      <button
                        className={styles.actionBtn}
                        onClick={e => { e.stopPropagation(); handleMessage(notif) }}
                      >
                        💬 MESSAGE
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}