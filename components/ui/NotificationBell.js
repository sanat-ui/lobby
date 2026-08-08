'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getOrCreateConversation,
  acceptJoinRequest,
  declineJoinRequest,
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
  const [actionLoading, setActionLoading] = useState(null)
  const wrapperRef = useRef(null)

  const unread = notifications.filter(n => !n.read).length

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

  async function handleAccept(e, notif) {
    e.stopPropagation()
    const postId = notif.data?.post_id
    const requesterId = notif.data?.requester_id
    if (!postId || !requesterId) return

    setActionLoading(notif.id + '_accept')
    await acceptJoinRequest(postId, requesterId)
    await markNotificationRead(notif.id)
    setNotifications(prev =>
      prev.map(n => n.id === notif.id
        ? { ...n, read: true, data: { ...n.data, resolved: true, resolution: 'accepted' } }
        : n
      )
    )
    setActionLoading(null)
  }

  async function handleDecline(e, notif) {
    e.stopPropagation()
    const postId = notif.data?.post_id
    const requesterId = notif.data?.requester_id
    if (!postId || !requesterId) return

    setActionLoading(notif.id + '_decline')
    await declineJoinRequest(postId, requesterId)
    await markNotificationRead(notif.id)
    setNotifications(prev =>
      prev.map(n => n.id === notif.id
        ? { ...n, read: true, data: { ...n.data, resolved: true, resolution: 'declined' } }
        : n
      )
    )
    setActionLoading(null)
  }

  async function handleMessage(e, notif) {
    e.stopPropagation()
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
                  className={[
                    styles.item,
                    !notif.read ? styles.unread : ''
                  ].filter(Boolean).join(' ')}
                >
                  <div className={styles.itemTitle}>{notif.title}</div>
                  <div className={styles.itemBody}>{notif.body}</div>
                  <div className={styles.itemTime}>{timeAgo(notif.created_at)}</div>

                  {notif.type === 'join_request' && !notif.data?.resolved && (
                    <div className={styles.itemActions}>
                      <button
                        className={styles.actionBtn}
                        style={{ background: '#111', color: '#fff' }}
                        onClick={e => handleAccept(e, notif)}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === notif.id + '_accept' ? '...' : '✓ ACCEPT'}
                      </button>
                      <button
                        className={styles.actionBtn}
                        style={{ background: 'transparent', color: '#111', boxShadow: '2px 2px 0px #888' }}
                        onClick={e => handleDecline(e, notif)}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === notif.id + '_decline' ? '...' : '✗ DECLINE'}
                      </button>
                      <button
                        className={styles.actionBtn}
                        style={{ background: 'transparent', color: '#555', border: '1px solid #ddd', boxShadow: 'none' }}
                        onClick={e => handleMessage(e, notif)}
                      >
                        💬
                      </button>
                    </div>
                  )}

                  {notif.type === 'join_request' && notif.data?.resolved && (
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '10px',
                      color: notif.data.resolution === 'accepted' ? '#22c55e' : '#888',
                      marginTop: '6px',
                      letterSpacing: '1px'
                    }}>
                      {notif.data.resolution === 'accepted' ? '✓ ACCEPTED' : '✗ DECLINED'}
                    </div>
                  )}

                  {notif.type === 'request_accepted' && (
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '10px',
                      color: '#22c55e',
                      marginTop: '6px',
                      letterSpacing: '1px'
                    }}>
                      ✓ YOU'RE IN
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