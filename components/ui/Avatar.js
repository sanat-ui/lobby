// components/ui/Avatar.js
import Image from 'next/image'
import styles from './Avatar.module.css'

// takes first letter of each word in the name, max 2 chars
function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Avatar({ src, name, size = 'md' }) {
  return (
    <div className={[styles.avatar, styles[size]].join(' ')}>
      {src ? (
        <Image src={src} alt={name || 'avatar'} width={64} height={64} />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  )
}