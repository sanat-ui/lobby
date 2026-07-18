// components/ui/Card.js
import styles from './Card.module.css'

export default function Card({ children, hoverable = false, flat = false, className = '', style }) {
  const classes = [
    styles.card,
    hoverable && styles.hoverable,
    flat && styles.flat,
    className,
  ].filter(Boolean).join(' ')

  return <div className={classes} style={style}>{children}</div>
}