// app/feed/page.js
'use client'
import NotificationBell from '../../components/ui/NotificationBell'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUser, getProfile, getLFGPosts, signOut, supabase } from '../../lib/supabase'
import LFGCard from '../../components/feed/LFGCard'
import FilterBar from '../../components/feed/FilterBar'
import styles from './feed.module.css'

const PAGE_SIZE = 10

function FeedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [currentUser, setCurrentUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const sentinelRef = useRef(null)
  const activeGame = searchParams.get('game') || 'all'
  const activeRank = searchParams.get('rank') || 'all'

  useEffect(() => {
    async function check() {
      const { user } = await getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await getProfile(user.id)
      if (!data) { router.push('/onboarding'); return }
      setCurrentUser(user)
      setProfile(data)
    }
    check()
  }, [])

  useEffect(() => {
    if (!currentUser) return
    setPosts([])
    setPage(0)
    setHasMore(true)
    fetchPosts(0, true)
  }, [activeGame, activeRank, currentUser])

  async function fetchPosts(pageNum, reset = false) {
    if (reset) setLoading(true)
    else setLoadingMore(true)

    const { data, error } = await getLFGPosts({
      game: activeGame !== 'all' ? activeGame : undefined,
      rank: activeRank !== 'all' ? activeRank : undefined,
      page: pageNum,
      limit: PAGE_SIZE
    })

    if (!error && data) {
      setPosts(prev => reset ? data : [...prev, ...data])
      setHasMore(data.length === PAGE_SIZE)
    }

    setLoading(false)
    setLoadingMore(false)
  }

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loadingMore) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1
          setPage(nextPage)
          fetchPosts(nextPage)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, page, activeGame, activeRank])

  useEffect(() => {
    const channel = supabase
      .channel('lfg_feed')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'lfg_posts' },
        payload => {
          getLFGPosts({ page: 0, limit: 1 }).then(({ data }) => {
            if (data?.[0]?.id === payload.new.id) {
              setPosts(prev => [data[0], ...prev])
            }
          })
        }
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  function getInitials(name) {
    if (!name) return '?'
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  if (!profile) return (
    <div className={styles.loader}>LOADING...</div>
  )

  return (
    <main className={styles.page}>
      <nav className={styles.navbar}>
        <span className={styles.logo}>LOBBY</span>
        <div className={styles.navRight}>
          <button className={styles.navBtn} onClick={() => router.push('/messages')}>💬 DMS</button>
          <NotificationBell userId={currentUser?.id} />
          <button className={styles.navBtn} onClick={handleSignOut}>SIGN OUT</button>
          <div className={styles.avatarBtn}>
            {getInitials(profile.display_name)}
          </div>
        </div>
      </nav>

      <div className={styles.body}>
        <div className={styles.filterRow}>
          <FilterBar />
        </div>

        {loading ? (
          <div className={styles.loader}>FINDING SESSIONS...</div>
        ) : posts.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🎮</span>
            <h2 className={styles.emptyTitle}>NO SESSIONS RIGHT NOW</h2>
            <p className={styles.emptyText}>
              Be the first to post an LFG for{' '}
              {activeGame !== 'all' ? activeGame : 'any game'}.
            </p>
          </div>
        ) : (
          <div className={styles.feedGrid}>
            {posts.map(post => (
              <LFGCard
                key={post.id}
                post={post}
                currentUserId={currentUser?.id}
              />
            ))}
            {loadingMore && (
              <div className={styles.loader}>LOADING MORE...</div>
            )}
            <div ref={sentinelRef} className={styles.sentinel} />
          </div>
        )}
      </div>

      <button
        className={styles.postBtn}
        onClick={() => router.push('/feed/new')}
      >
        + POST LFG
      </button>
    </main>
  )
}

export default function FeedPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'monospace', color: '#888', letterSpacing: '3px' }}>LOADING...</div>}>
      <FeedContent />
    </Suspense>
  )
}