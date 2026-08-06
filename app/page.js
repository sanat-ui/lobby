// app/page.js
'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

const TICKER_ITEMS = [
  { dot: 'green', text: 'sanat99 just posted a Valorant LFG' },
  { dot: 'amber', text: 'BGMI squad — 2 slots open · 9PM IST' },
  { dot: 'green', text: 'rahul_fps joined a CS2 session' },
  { dot: 'red',   text: 'apex_hunter is looking for ranked duo' },
  { dot: 'green', text: 'priya_gg just signed up' },
  { dot: 'amber', text: 'Fortnite trio — starting in 30 mins' },
  { dot: 'green', text: 'vikram99 verified Steam profile' },
  { dot: 'amber', text: 'Free Fire session — Platinum+ only' },
  { dot: 'green', text: 'arjun_clutch posted LFG · Valorant Diamond' },
  { dot: 'red',   text: 'COD Mobile — need 1 more · 10PM IST' },
  { dot: 'green', text: 'neha_plays just joined Lobby' },
  { dot: 'amber', text: 'CS2 LFG · Gold Nova · chill vibes only' },
]

function TickerItem({ dot, text }) {
  const dotClass = dot === 'green'
    ? styles.tickerDotGreen
    : dot === 'amber'
    ? styles.tickerDotAmber
    : styles.tickerDotRed

  return (
    <div className={styles.tickerItem}>
      <span className={[styles.tickerDot, dotClass].join(' ')} />
      {text}
    </div>
  )
}

export default function LandingPage() {
  const heroEyebrowRef  = useRef(null)
  const heroTitleRef    = useRef(null)
  const heroTitleAltRef = useRef(null)
  const heroSubRef      = useRef(null)
  const heroBtnsRef     = useRef(null)
  const desktopRef      = useRef(null)
  const windowRefs      = useRef([])
  const statsRef        = useRef(null)
  const ctaRef          = useRef(null)

  useEffect(() => {
    let lenis

    async function init() {
      const Lenis       = (await import('lenis')).default
      const gsapModule  = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      const gsap = gsapModule.gsap
      gsap.registerPlugin(ScrollTrigger)

      lenis = new Lenis({
        duration: 1.4,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      })
      gsap.ticker.add(time => lenis.raf(time * 1000))
      gsap.ticker.lagSmoothing(0)

      // ── Hero entrance ──
      // ── Hero entrance — with fallback ──
const heroElements = [
  heroEyebrowRef.current,
  heroTitleRef.current,
  heroTitleAltRef.current,
  heroSubRef.current,
  heroBtnsRef.current,
].filter(Boolean)

// Fallback — show immediately if GSAP fails
heroElements.forEach(el => { el.style.opacity = '0' })

const heroTl = gsap.timeline({ delay: 0.3 })
heroTl
  .to(heroEyebrowRef.current,  { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
  .to(heroTitleRef.current,    { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.3')
  .to(heroTitleAltRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.5')
  .to(heroSubRef.current,      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
  .to(heroBtnsRef.current,     { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2')
      // ── Desktop windows stagger in ──
      if (desktopRef.current) {
        const wins = desktopRef.current.querySelectorAll('[data-win]')
        gsap.to(wins, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.1,
          delay: 1.0
        })
      }

      // ── Feature windows ──
      windowRefs.current.forEach((el, i) => {
        if (!el) return
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          delay: i * 0.1,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        })
      })

      // ── Stats ──
      if (statsRef.current) {
        gsap.to(statsRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        })

        const statNums = statsRef.current.querySelectorAll('[data-count]')
        statNums.forEach(el => {
          const target = parseInt(el.getAttribute('data-count'))
          const suffix = el.getAttribute('data-suffix') || ''
          gsap.fromTo(el,
            { innerText: 0 },
            {
              innerText: target,
              duration: 2,
              ease: 'power1.out',
              snap: { innerText: 1 },
              scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none'
              },
              onUpdate() {
                el.innerText = Math.round(el.innerText) + suffix
              }
            }
          )
        })
      }

      // ── CTA ──
      if (ctaRef.current) {
        gsap.to(ctaRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        })
      }
    }

    init()
    return () => {
      if (lenis) lenis.destroy()
    }
  }, [])

  function addWindowRef(el) {
    if (el && !windowRefs.current.includes(el)) windowRefs.current.push(el)
  }

  // Duplicate ticker items for seamless loop
  const allTicker = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div className={styles.page}>

      {/* Navbar */}
      <nav className={styles.nav}>
        <span className={styles.navLogo}>LOBBY</span>
        <div className={styles.navLinks}>
          <Link href="/login" className={styles.navLink}>SIGN IN</Link>
          <Link href="/signup" className={styles.navCta}>JOIN FREE</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <p ref={heroEyebrowRef} className={styles.heroEyebrow}>
          ▶ PLAYER NETWORK ONLINE
        </p>
        <h1 ref={heroTitleRef} className={styles.heroTitle}>FIND YOUR</h1>
        <h1 ref={heroTitleAltRef} className={styles.heroTitleAlt}>
          SQUAD<span className={styles.cursor} />
        </h1>
        <p ref={heroSubRef} className={styles.heroSub}>
          THE SOCIAL LAYER FOR INDIAN GAMERS. FIND TEAMMATES. BUILD YOUR CREW. PLAY TOGETHER.
        </p>
        <div ref={heroBtnsRef} className={styles.heroBtns}>
          <Link href="/signup" className={styles.heroBtnPrimary}>▶ START PLAYING</Link>
          <Link href="/login" className={styles.heroBtnSecondary}>SIGN IN</Link>
        </div>

        {/* Desktop windows */}
        <div ref={desktopRef} className={styles.heroDesktop}>

          {/* Window 1 — Online players */}
          <div data-win className={styles.desktopWindow} style={{ top: 0, left: 0, zIndex: 3 }}>
            <div className={styles.desktopWindowBar}>
              <span className={styles.desktopWindowTitle}>ONLINE_NOW.EXE</span>
              <div className={styles.desktopWindowDots}>
                <div className={styles.desktopWindowDot} />
                <div className={styles.desktopWindowDot} />
                <div className={styles.desktopWindowDot} />
              </div>
            </div>
            <div className={styles.desktopWindowBody}>
              {[
                { name: 'sanat99', game: 'Valorant', status: 'online' },
                { name: 'apex_hunter', game: 'BGMI', status: 'ingame' },
                { name: 'priya_gg', game: 'CS2', status: 'online' },
                { name: 'rahul_fps', game: 'Free Fire', status: 'ingame' },
              ].map(p => (
                <div key={p.name} className={styles.desktopWindowRow}>
                  <div className={[styles.desktopWindowRowDot, styles[p.status]].join(' ')} />
                  <span style={{ flex: 1 }}>{p.name}</span>
                  <span style={{ color: '#aaa', fontSize: '13px' }}>{p.game}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Window 2 — LFG post */}
          <div data-win className={styles.desktopWindow} style={{ top: 60, left: 230, zIndex: 4 }}>
            <div className={styles.desktopWindowBar}>
              <span className={styles.desktopWindowTitle}>LFG_POST.EXE</span>
              <div className={styles.desktopWindowDots}>
                <div className={styles.desktopWindowDot} />
                <div className={styles.desktopWindowDot} />
                <div className={styles.desktopWindowDot} />
              </div>
            </div>
            <div className={styles.desktopWindowBody}>
              <div style={{ marginBottom: '10px' }}>
                <span className={styles.desktopWindowTag}>VALORANT</span>
                <span className={styles.desktopWindowTag}>DIAMOND</span>
                <span className={styles.desktopWindowTag}>DUELIST</span>
              </div>
              <div className={styles.desktopWindowRow} style={{ fontSize: '14px' }}>
                 Tonight · 9:30 PM IST
              </div>
              <div className={styles.desktopWindowRow} style={{ fontSize: '14px' }}>
                 2 slots open
              </div>
              <div className={styles.desktopWindowRow} style={{ fontSize: '13px', color: '#666' }}>
                "chill ranked, no rage "
              </div>
            </div>
          </div>

          {/* Window 3 — Stats */}
          <div data-win className={styles.desktopWindow} style={{ top: 10, right: 20, zIndex: 2 }}>
            <div className={styles.desktopWindowBar}>
              <span className={styles.desktopWindowTitle}>STATS.EXE</span>
              <div className={styles.desktopWindowDots}>
                <div className={styles.desktopWindowDot} />
                <div className={styles.desktopWindowDot} />
                <div className={styles.desktopWindowDot} />
              </div>
            </div>
            <div className={styles.desktopWindowBody} style={{ textAlign: 'center', padding: '16px 24px' }}>
              <span className={styles.desktopWindowStat}>14+</span>
              <span className={styles.desktopWindowStatLabel}>GAMES SUPPORTED</span>
              <div style={{ margin: '12px 0', borderTop: '1px solid #eee' }} />
              <span className={styles.desktopWindowStat}>0ms</span>
              <span className={styles.desktopWindowStatLabel}>REALTIME LATENCY</span>
            </div>
          </div>

          {/* Window 4 — Match found */}
          <div data-win className={styles.desktopWindow} style={{ bottom: 10, left: 40, zIndex: 3 }}>
            <div className={styles.desktopWindowBar}>
              <span className={styles.desktopWindowTitle}>MATCH_FOUND.EXE</span>
              <div className={styles.desktopWindowDots}>
                <div className={styles.desktopWindowDot} />
                <div className={styles.desktopWindowDot} />
                <div className={styles.desktopWindowDot} />
              </div>
            </div>
            <div className={styles.desktopWindowBody}>
              <div className={styles.desktopWindowRow}>
                🤖 AI matched you with <strong style={{ marginLeft: 4 }}>vikram99</strong>
              </div>
              <div className={styles.desktopWindowRow} style={{ color: '#22c55e' }}>
                ✓ Same rank · Same games · Tonight
              </div>
            </div>
          </div>

          {/* Window 5 — Profile */}
          <div data-win className={styles.desktopWindow} style={{ bottom: 0, right: 30, zIndex: 1 }}>
            <div className={styles.desktopWindowBar}>
              <span className={styles.desktopWindowTitle}>PROFILE.EXE</span>
              <div className={styles.desktopWindowDots}>
                <div className={styles.desktopWindowDot} />
                <div className={styles.desktopWindowDot} />
                <div className={styles.desktopWindowDot} />
              </div>
            </div>
            <div className={styles.desktopWindowBody}>
              <div className={styles.desktopWindowRow}>
                👤 arjun_clutch
              </div>
              <div style={{ marginTop: '6px' }}>
                <span className={styles.desktopWindowTag}>CS2</span>
                <span className={styles.desktopWindowTag}>VALORANT</span>
              </div>
              <div className={styles.desktopWindowRow} style={{ color: '#22c55e', marginTop: '6px' }}>
                ✓ Steam Verified
              </div>
            </div>
          </div>

        </div>

        <p className={styles.scrollHint}>▼ SCROLL ▼</p>
      </section>

      {/* Ticker 1 — between hero and features */}
      <div className={styles.ticker}>
        <div className={styles.tickerInner}>
          {allTicker.map((item, i) => (
            <TickerItem key={i} {...item} />
          ))}
        </div>
      </div>

      {/* Features */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>// FEATURES</div>
        <div className={styles.featuresGrid}>
          {[
            { file: 'LFG.EXE',      title: 'INTENT-BASED MATCHMAKING', text: 'Not just "I play Valorant." Tell people your rank, your role, your session time. Find teammates who actually match your vibe.' },
            { file: 'VERIFY.EXE',   title: 'STEAM VERIFIED PROFILES',  text: 'Link your Steam account. Your hours and game library speak for themselves. No fake ranks. No randos.' },
            { file: 'REGION.EXE',   title: 'BUILT FOR INDIA',         text: 'IST-aware sessions. Regional server awareness. The community your ping actually deserves. India first.' },
            { file: 'CHAT.EXE',     title: 'REALTIME MESSAGING',        text: 'DM players before sessions. No external apps needed. Everything in one place, no toxicity tolerated.' },
            { file: 'AI.EXE',       title: 'AI PLAYER MATCHING',       text: 'Our AI reads your profile and suggests players you\'d actually click with. Not just same game — same energy.' },
            { file: 'FREE.EXE',     title: 'FREE. FOREVER.',            text: 'No paywalls. No forced ads. No credit card. Just sign up and find your people. We earn trust before we earn money.' },
          ].map((f, i) => (
            <div key={i} ref={addWindowRef} className={styles.window}>
              <div className={styles.windowBar}>
                <span className={styles.windowTitle}>{f.file}</span>
                <div className={styles.windowDots}>
                  <div className={styles.windowDot} />
                  <div className={styles.windowDot} />
                  <div className={styles.windowDot} />
                </div>
              </div>
              <div className={styles.windowBody}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureText}>{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ticker 2 — between features and stats */}
      <div className={styles.ticker}>
        <div className={styles.tickerInner} style={{ animationDirection: 'reverse' }}>
          {allTicker.map((item, i) => (
            <TickerItem key={i} {...item} />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>// SYSTEM STATUS</div>
        <div ref={statsRef} className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.statNum} data-count="14" data-suffix="+">0+</span>
            <span className={styles.statLabel}>GAMES SUPPORTED</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum} data-count="0" data-suffix=" MS">0 MS</span>
            <span className={styles.statLabel}>REALTIME LATENCY</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum} data-count="100" data-suffix="% FREE">0% FREE</span>
            <span className={styles.statLabel}>ALWAYS</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className={styles.ctaSection}>
        <div ref={ctaRef} className={styles.ctaWindow}>
          <div className={styles.windowBar}>
            <span className={styles.windowTitle}>JOIN_LOBBY.EXE</span>
            <div className={styles.windowDots}>
              <div className={styles.windowDot} />
              <div className={styles.windowDot} />
              <div className={styles.windowDot} />
            </div>
          </div>
          <div className={styles.windowBody} style={{ padding: '48px 32px', textAlign: 'center' }}>
            <h2 className={styles.ctaTitle}>READY TO FIND YOUR SQUAD?</h2>
            <p className={styles.ctaText}>
              Stop playing with randos. Start playing with people who actually get it.
            </p>
            <Link href="/signup" className={styles.heroBtnPrimary}>
              ▶ CREATE YOUR PROFILE
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <span className={styles.footerLogo}>LOBBY</span>
        <span className={styles.footerText}>© 2026 · MADE FOR INDIAN GAMERS · V1.0.0</span>
      </footer>

    </div>
  )
}