// app/messages/[id]/page.js
'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
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

  // Scroll to bottom
  function scrollToBottom(behavior = 'smooth') {
    bottomRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    async function load() {
      const { user } = await getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await getProfile(user.id)
      if (!profile) { router.push('/onboarding'); return }

      setCurrentUser(user)

      // Load messages
      const { data: msgs } = await getMessages(conversationId)
      setMessages(msgs || [])
      setLoading(false)

      // Mark as read
      await markMessagesRead(conversationId, user.id)

      // Scroll to bottom immediately on load
      setTimeout(() => scrollToBottom('instant'), 100)
    }
    load()
  }, [conversationId])

  // Get the other person's profile from messages
  useEffect(() => {
    if (!currentUser || messages.length === 0) return
    const otherMsg = messages.find(m => m.sender_id !== currentUser.id)
    if (otherMsg?.sender) setOtherProfile(otherMsg.sender)
  }, [messages, currentUser])

  // Realtime subscription
  useEffect(() => {
    if (!currentUser) return

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async payload => {
          const newMsg = payload.new

          // Don't add our own messages again — already added optimistically
          if (newMsg.sender_id === currentUser.id) return

          // Fetch with sender profile
          const { data: msgs } = await getMessages(conversationId)
          if (msgs) {
            setMessages(msgs)
            scrollToBottom()
            // Mark as read since we're in this chat
            await markMessagesRead(conversationId, currentUser.id)
          }

          // Update other profile if we don't have it yet
          if (!otherProfile) {
            const { data: profile } = await getProfile(newMsg.sender_id)
            if (profile) setOtherProfile(profile)
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [currentUser, conversationId, otherProfile])

  async function handleSend() {
    const content = input.trim()
    if (!content || !currentUser || sending) return

    setInput('')
    setSending(true)

    // Optimistic update — add message immediately
    const optimisticMsg = {
      id: `optimistic-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUser.id,
      content,
      created_at: new Date().toISOString(),
      pending: true,
      sender: null
    }
    setMessages(prev => [...prev, optimisticMsg])
    scrollToBottom()

    const { error } = await sendMessage(conversationId, currentUser.id, content)

    if (error) {
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
      setInput(content) // restore input
    } else {
      // Replace optimistic with real (will come via realtime for others
      // but we need to update ours)
      const { data: msgs } = await getMessages(conversationId)
      if (msgs) setMessages(msgs)
    }

    setSending(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Group messages by date
  function groupByDate(msgs) {
    const groups = []
    let currentDate = null

    msgs.forEach(msg => {
      const date = new Date(msg.created_at).toDateString()
      if (date !== currentDate) {
        currentDate = date
        groups.push({ type: 'date', label: formatDate(msg.created_at), key: `date-${date}` })
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
      {/* Navbar */}
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

      {/* Messages */}
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
              <div className={[styles.msgBubble, msg.pending ? styles.pending : ''].filter(Boolean).join(' ')}>
                <span className={styles.msgContent}>{msg.content}</span>
                <span className={styles.msgTime}>
                  {formatTime(msg.created_at)}
                  {msg.pending ? ' · SENDING...' : ''}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
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
            SEND ▶
          </button>
        </div>
      </div>
    </div>
  )
}