import { useRef, useEffect, useState } from 'react'
import SectionRenderer from './SectionRenderer'
import { TOPICS } from '../data/curriculum'

export default function DayView({ day, theme, onComplete, isCompleted, onNext, onPrev, totalDays }) {
  const isDark = theme === 'dark'
  const topic = TOPICS[day.topic]
  const scrollRef = useRef(null)
  const [headerVisible, setHeaderVisible] = useState(false)
  const lastScrollY = useRef(0)

  // Reset to hidden on day change
  useEffect(() => {
    setHeaderVisible(false)
    lastScrollY.current = 0
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' })
  }, [day.day])

  // Auto-hide when scrolling down past 80px — but NEVER auto-show.
  // The user must click the peek bar to show deliberately.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const y = el.scrollTop
      if (y > 80 && lastScrollY.current <= 80) setHeaderVisible(false)
      lastScrollY.current = y
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const challengeCount = day.sections.filter(s => s.type === 'challenge').length
  const codeCount      = day.sections.filter(s => s.type === 'code').length

  const heroBg = isDark
    ? `linear-gradient(160deg, ${topic.bg}e0 0%, rgba(10,13,20,0.97) 60%)`
    : `linear-gradient(160deg, ${topic.color}0d 0%, rgba(255,255,255,0.98) 55%)`
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const EASE   = 'cubic-bezier(0.4, 0, 0.2, 1)'
  const DUR    = '0.4s'

  return (
    <div
      ref={scrollRef}
      style={{ flex: 1, overflowY: 'auto', height: '100vh', background: isDark ? '#0a0d14' : '#ffffff' }}
    >

      {/* ═══════════════════════════════════════════
          STICKY WRAPPER  —  curtain + peek bar
      ═══════════════════════════════════════════ */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10 }}>

        {/* ── FULL HEADER CURTAIN ─────────────────
            grid-template-rows: 1fr → 0fr slides it
            upward like a curtain being raised.
        ─────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateRows: headerVisible ? '1fr' : '0fr',
          transition: `grid-template-rows ${DUR} ${EASE}`,
        }}>
          {/* overflow:hidden on the inner div is required for the grid trick */}
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              padding: '24px 40px 16px',
              background: heroBg,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderBottom: `1px solid ${border}`,
            }}>
              <div style={{ maxWidth: 860, margin: '0 auto' }}>

                {/* Breadcrumb row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: topic.color, opacity: 0.9,
                  }}>
                    Day {day.day} / {totalDays}
                  </span>
                  <Sep isDark={isDark}/>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.08em', color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.42)' }}>
                    {topic.label}
                  </span>
                  <Sep isDark={isDark}/>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.42)' }}>
                    ⏱ {day.duration}
                  </span>
                </div>

                {/* Title */}
                <h1 style={{
                  margin: '0 0 4px',
                  fontFamily: 'Bebas Neue, sans-serif',
                  fontSize: 'clamp(26px, 4vw, 40px)',
                  letterSpacing: '0.04em',
                  color: isDark ? '#f1f5f9' : '#0f172a',
                  lineHeight: 1.1,
                }}>
                  {day.title}
                </h1>

                {/* Tagline */}
                <p style={{
                  margin: '0 0 13px',
                  fontSize: 13.5,
                  fontFamily: 'DM Sans, sans-serif',
                  color: isDark ? 'rgba(255,255,255,0.48)' : 'rgba(0,0,0,0.48)',
                  fontStyle: 'italic',
                }}>
                  {day.tagline}
                </p>

                {/* Stats row + hide button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <Stat icon="⚡" label={`${codeCount} code example${codeCount !== 1 ? 's' : ''}`} isDark={isDark} />
                    {challengeCount > 0 && (
                      <Stat icon="🏋️" label={`${challengeCount} challenge${challengeCount > 1 ? 's' : ''}`} isDark={isDark} />
                    )}
                    {isCompleted ? (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '3px 11px', borderRadius: 20,
                        background: 'rgba(74,222,128,0.12)',
                        border: '1px solid rgba(74,222,128,0.25)',
                        fontSize: 11, color: '#4ade80', fontFamily: 'DM Sans, sans-serif',
                      }}>
                        ✓ Completed
                      </div>
                    ) : (
                      <button onClick={onComplete} style={{
                        padding: '3px 11px', borderRadius: 20,
                        border: `1px solid ${topic.color}55`,
                        background: `${topic.color}14`,
                        color: topic.color, fontSize: 11,
                        fontFamily: 'DM Sans, sans-serif',
                        cursor: 'pointer', fontWeight: 600,
                      }}>
                        Mark Complete ✓
                      </button>
                    )}
                  </div>

                  {/* ▲ Hide / collapse button */}
                  <button
                    onClick={() => setHeaderVisible(false)}
                    title="Hide header (scroll back to top to restore)"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      flexShrink: 0,
                      padding: '5px 11px', borderRadius: 7,
                      border: `1px solid ${border}`,
                      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                      color: isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.32)',
                      cursor: 'pointer', fontSize: 11,
                      fontFamily: 'DM Sans, sans-serif',
                      transition: 'color 0.15s, border-color 0.15s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.color = topic.color; e.currentTarget.style.borderColor = topic.color + '60' }}
                    onMouseOut={e => { e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.32)'; e.currentTarget.style.borderColor = border }}
                  >
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor">
                      <path d="M4.5 1.5L8 7H1L4.5 1.5Z"/>
                    </svg>
                    Hide
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ── PEEK BAR ─────────────────────────────
            Slides in (0fr → 1fr) when curtain retracts.
            Click it to expand the curtain again.
        ─────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateRows: headerVisible ? '0fr' : '1fr',
          transition: `grid-template-rows ${DUR} ${EASE}`,
        }}>
          <div style={{ overflow: 'hidden' }}>
            <div
              onClick={() => setHeaderVisible(true)}
              style={{
                height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 40px',
                background: heroBg,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderBottom: `1px solid ${border}`,
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              {/* Left — colored accent + day + title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{ width: 3, height: 14, borderRadius: 99, background: topic.color, flexShrink: 0 }} />
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: topic.color, flexShrink: 0,
                }}>
                  DAY {day.day}
                </span>
                <span style={{
                  fontSize: 12, fontFamily: 'Syne, sans-serif', fontWeight: 700,
                  color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {day.title}
                </span>
              </div>

              {/* Right — show header prompt */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={{
                  fontSize: 10.5, fontFamily: 'DM Sans, sans-serif',
                  color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.3)',
                }}>
                  Show
                </span>
                <svg width="9" height="9" viewBox="0 0 9 9" fill={topic.color} style={{ transform: 'rotate(180deg)' }}>
                  <path d="M4.5 1.5L8 7H1L4.5 1.5Z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>
      {/* ═══════════════════════════════════════════ */}


      {/* ─── CHAPTER CONTENT ─── */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 40px 60px' }}>
        {day.sections.map((section, i) => (
          <SectionRenderer key={i} section={section} theme={theme} />
        ))}

        {/* Nav footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 40, paddingTop: 24,
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
        }}>
          <button
            onClick={onPrev}
            disabled={day.day === 1}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 8,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              background: 'transparent',
              color: day.day === 1
                ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')
                : (isDark ? '#e2e8f0' : '#1e293b'),
              cursor: day.day === 1 ? 'not-allowed' : 'pointer',
              fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
            }}
          >
            ← Day {day.day - 1}
          </button>

          <div style={{ textAlign: 'center' }}>
            {!isCompleted && (
              <button onClick={onComplete} style={{
                padding: '10px 22px', borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#000', fontSize: 13, fontFamily: 'Syne, sans-serif',
                fontWeight: 700, cursor: 'pointer', letterSpacing: '0.03em',
              }}>
                Complete Day {day.day} ✓
              </button>
            )}
          </div>

          <button
            onClick={onNext}
            disabled={day.day === totalDays}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 8,
              border: day.day < totalDays
                ? `1px solid ${TOPICS[day.topic].color}50`
                : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              background: day.day < totalDays ? `${TOPICS[day.topic].color}15` : 'transparent',
              color: day.day === totalDays
                ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')
                : TOPICS[day.topic].color,
              cursor: day.day === totalDays ? 'not-allowed' : 'pointer',
              fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
            }}
          >
            Day {day.day + 1} →
          </button>
        </div>
      </div>

    </div>
  )
}

function Sep({ isDark }) {
  return (
    <span style={{ color: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)', fontSize: 11 }}>·</span>
  )
}

function Stat({ icon, label, isDark }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      fontSize: 11.5, fontFamily: 'DM Sans, sans-serif',
      color: isDark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.42)',
    }}>
      <span>{icon}</span>
      {label}
    </div>
  )
}
