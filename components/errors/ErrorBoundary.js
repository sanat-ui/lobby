// components/errors/ErrorBoundary.js
'use client'
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
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
            </div>
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>💀</div>
              <h2 style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#111',
                letterSpacing: '2px',
                marginBottom: '12px',
                lineHeight: '1.6'
              }}>SOMETHING CRASHED</h2>
              <p style={{
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#666',
                marginBottom: '24px',
                lineHeight: '1.6'
              }}>
                {this.state.error?.message || 'An unexpected error occurred.'}
              </p>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.href = '/feed'
                }}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  color: '#fff',
                  background: '#111',
                  border: '2px solid #111',
                  boxShadow: '4px 4px 0px #888',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  letterSpacing: '1px'
                }}
              >
                ▶ BACK TO LOBBY
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}