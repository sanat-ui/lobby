// app/page.js
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import ThemeToggle from '../components/layout/ThemeToggle'

export default function Home() {
  return (
    <main style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)' }}>GamerConnect</h1>
        <ThemeToggle />
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <Button variant="primary">Find Players</Button>
          <Button variant="secondary">My Profile</Button>
          <Button variant="ghost">Settings</Button>
        </div>

        <Input label="Username" placeholder="your_gamer_tag" />
      </Card>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <Badge variant="accent">Valorant</Badge>
        <Badge variant="success">Online</Badge>
        <Badge variant="warning">In Game</Badge>
        <Badge variant="error">Busy</Badge>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Avatar name="Sanat Dev" size="sm" />
        <Avatar name="Sanat Dev" size="md" />
        <Avatar name="Sanat Dev" size="lg" />
      </div>
    </main>
  )
}