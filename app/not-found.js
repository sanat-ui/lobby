// app/not-found.js
import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        border: '3px solid #111',
        boxShadow: '6px 6px 0px #888',
        background: '#fff',
        maxWidth: '480px',
        width: '100%'
      }}>
        <div style={{
          background: '#111',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#fff',
            letterSpacing: '1px'
          }}>404.EXE</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: '8px', height: '8px', border: '1px solid #fff' }} />
            ))}
          </div>
        </div>
        <div style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🕹️</div>
          <h2 style={{
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#111',
            letterSpacing: '3px',
            marginBottom: '8px'
          }}>404</h2>
          <p style={{
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#111',
            letterSpacing: '2px',
            marginBottom: '8px',
            lineHeight: '1.6'
          }}>PAGE NOT FOUND</p>
          <p style={{
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#888',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            This page doesn't exist or was moved.
          </p>
          <Link
            href="/feed"
            style={{
              fontFamily: 'monospace',
              fontSize: '9px',
              color: '#fff',
              background: '#111',
              border: '2px solid #111',
              boxShadow: '4px 4px 0px #888',
              padding: '12px 24px',
              cursor: 'pointer',
              letterSpacing: '1px',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            ▶ BACK TO LOBBY
          </Link>
        </div>
      </div>
    </div>
  )
}