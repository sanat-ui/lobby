// components/ui/Input.js
import styles from './Input.module.css'

export default function Input({
  label,
  hint,
  error,
  id,
  className = '',
  ...props   // passes through placeholder, type, value, onChange, etc.
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[styles.input, error && styles.error, className].filter(Boolean).join(' ')}
        {...props}
      />
      {hint && !error && <span className={styles.hint}>{hint}</span>}
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  )
}