// components/feed/FilterBar.js
'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './FilterBar.module.css'

const GAMES = [
  'All Games', 'Valorant', 'BGMI', 'CS2', 'Fortnite',
  'Apex Legends', 'COD Mobile', 'Free Fire', 'Other'
]

const RANKS = {
  'Valorant': ['Any Rank', 'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'],
  'CS2': ['Any Rank', 'Silver', 'Gold Nova', 'MG', 'DMG', 'LE', 'LEM', 'Supreme', 'Global'],
  'BGMI': ['Any Rank', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown', 'Ace', 'Conqueror'],
  'default': ['Any Rank']
}

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeGame = searchParams.get('game') || 'all'
  const activeRank = searchParams.get('rank') || 'all'

  const rankOptions = activeGame !== 'all'
    ? (RANKS[activeGame] || RANKS['default'])
    : ['Any Rank']

  function updateFilter(key, value) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || value === 'All Games' || value === 'Any Rank') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    // Reset rank when game changes
    if (key === 'game') params.delete('rank')
    router.push(`/feed?${params.toString()}`, { scroll: false })
  }

  function clearAll() {
    router.push('/feed', { scroll: false })
  }

  const hasFilters = activeGame !== 'all' || activeRank !== 'all'

  return (
    <div className={styles.bar}>
      {/* Game filter */}
      <select
        className={[styles.filter, activeGame !== 'all' ? styles.active : ''].join(' ')}
        value={activeGame === 'all' ? 'All Games' : activeGame}
        onChange={e => updateFilter('game', e.target.value)}
      >
        {GAMES.map(g => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      {/* Rank filter — only show when a game is selected */}
      {activeGame !== 'all' && (
        <select
          className={[styles.filter, activeRank !== 'all' ? styles.active : ''].join(' ')}
          value={activeRank === 'all' ? 'Any Rank' : activeRank}
          onChange={e => updateFilter('rank', e.target.value)}
        >
          {rankOptions.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      )}

      {hasFilters && (
        <button className={styles.clearBtn} onClick={clearAll}>
          Clear ✕
        </button>
      )}
    </div>
  )
}