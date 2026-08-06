// app/error.js
'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

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
          }}>ERROR.EXE</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: '8px', height: '8px', border: '1px solid #fff' }} />
            ))}
          </div>
        </div>
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#111',
            letterSpacing: '2px',
            marginBottom: '12px',
            lineHeight: '1.6'
          }}>PAGE ERROR</h2>
          <p style={{
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#666',
            marginBottom: '24px',
            lineHeight: '1.6'
          }}>
            Something went wrong loading this page.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                fontFamily: 'monospace',
                fontSize: '9px',
                color: '#fff',
                background: '#111',
                border: '2px solid #111',
                boxShadow: '3px 3px 0px #888',
                padding: '10px 20px',
                cursor: 'pointer',
                letterSpacing: '1px'
              }}
            >
              ▶ TRY AGAIN
            </button>
            <button
              onClick={() => window.location.href = '/feed'}
              style={{
                fontFamily: 'monospace',
                fontSize: '9px',
                color: '#111',
                background: 'transparent',
                border: '2px solid #111',
                boxShadow: '3px 3px 0px #888',
                padding: '10px 20px',
                cursor: 'pointer',
                letterSpacing: '1px'
              }}
            >
              HOME
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}