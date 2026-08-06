// app/messages/[id]/page.js
'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  getUser,
  getProfile,
  getMessages,
  sendMessage,
  markMessagesRead,
  supabase
} from '../../../lib/supabase'
import styles from './chat.module.css'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

function formatDate(isoString) {
  const date = new Date(isoString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'TODAY'
  if (date.toDateString() === yesterday.toDateString()) return 'YESTERDAY'
  return date.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short'
  }).toUpperCase()
}

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id

  const [currentUser, setCurrentUser] = useState(null)
  const [otherProfile, setOtherProfile] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const currentUserRef = useRef(null)

  function scrollToBottom(behavior = 'smooth') {
    bottomRef.current?.scrollIntoView({ behavior })
  }

  async function fetchMessages(userId) {
    const { data: msgs } = await getMessages(conversationId)
    if (msgs) {
      setMessages(msgs)
      // Set other profile from messages
      const otherMsg = msgs.find(m => m.sender_id !== userId)
      if (otherMsg?.sender) setOtherProfile(otherMsg.sender)
      await markMessagesRead(conversationId, userId)
    }
    return msgs
  }

  useEffect(() => {
    async function load() {
      const { user } = await getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await getProfile(user.id)
      if (!profile) { router.push('/onboarding'); return }

      setCurrentUser(user)
      currentUserRef.current = user

      await fetchMessages(user.id)
      setLoading(false)
      setTimeout(() => scrollToBottom('instant'), 100)
    }
    load()
  }, [conversationId])

  // Realtime — fires for ALL inserts including own
  useEffect(() => {
    if (!currentUser) return

    const channel = supabase
      .channel(`chat-${conversationId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async () => {
          // Refetch everything on any insert — no skipping
          const user = currentUserRef.current
          if (!user) return
          const { data: msgs } = await getMessages(conversationId)
          if (msgs) {
            setMessages(msgs)
            scrollToBottom()
            await markMessagesRead(conversationId, user.id)
            // Update other profile if missing
            const otherMsg = msgs.find(m => m.sender_id !== user.id)
            if (otherMsg?.sender) setOtherProfile(otherMsg.sender)
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [currentUser, conversationId])

  async function handleSend() {
    const content = input.trim()
    if (!content || !currentUser || sending) return

    setInput('')
    setSending(true)

    const { error } = await sendMessage(conversationId, currentUser.id, content)

    if (error) {
      // Restore input on failure
      setInput(content)
    }
    // No manual state update needed — realtime will fire and refetch

    setSending(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function groupByDate(msgs) {
    const groups = []
    let currentDate = null

    msgs.forEach(msg => {
      const date = new Date(msg.created_at).toDateString()
      if (date !== currentDate) {
        currentDate = date
        groups.push({
          type: 'date',
          label: formatDate(msg.created_at),
          key: `date-${date}`
        })
      }
      groups.push({ type: 'message', msg, key: msg.id })
    })

    return groups
  }

  if (loading || !currentUser) return (
    <div className={styles.loader} style={{ paddingTop: '40vh' }}>
      LOADING...
    </div>
  )

  const grouped = groupByDate(messages)

  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <Link href="/messages" className={styles.backBtn}>← BACK</Link>
        <div className={styles.navInfo}>
          <div className={styles.navAvatar}>
            {otherProfile?.avatar_url
              ? <img src={otherProfile.avatar_url} alt={otherProfile.display_name} />
              : getInitials(otherProfile?.display_name || otherProfile?.username || '?')
            }
          </div>
          <span className={styles.navName}>
            {otherProfile?.display_name || otherProfile?.username || 'LOADING...'}
          </span>
        </div>
      </nav>

      <div className={styles.messagesArea}>
        {grouped.map(item => {
          if (item.type === 'date') {
            return (
              <div key={item.key} className={styles.dateDivider}>
                <span className={styles.dateDividerText}>{item.label}</span>
              </div>
            )
          }

          const msg = item.msg
          const isOwn = msg.sender_id === currentUser.id
          const senderProfile = isOwn ? null : (msg.sender || otherProfile)

          return (
            <div
              key={item.key}
              className={[styles.msgRow, isOwn ? styles.own : ''].filter(Boolean).join(' ')}
            >
              {!isOwn && (
                <div className={styles.msgAvatar}>
                  {senderProfile?.avatar_url
                    ? <img src={senderProfile.avatar_url} alt={senderProfile.display_name} />
                    : getInitials(senderProfile?.display_name || senderProfile?.username)
                  }
                </div>
              )}
              <div className={styles.msgBubble}>
                <span className={styles.msgContent}>{msg.content}</span>
                <span className={styles.msgTime}>
                  {formatTime(msg.created_at)}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputArea}>
        <div className={styles.inputRow}>
          <textarea
            ref={inputRef}
            className={styles.input}
            placeholder="TYPE A MESSAGE..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={!input.trim() || sending}
          >
            {sending ? '...' : 'SEND ▶'}
          </button>
        </div>
      </div>
    </div>
  )
}