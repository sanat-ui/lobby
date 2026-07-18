// components/layout/ThemeToggle.js
'use client'
import { useTheme } from '../../hooks/useTheme'
import Button from '../ui/Button'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <Button variant="ghost" size="sm" onClick={toggle}>
      {theme === 'light' ? 'Dark' : 'Light'}
    </Button>
  )
}