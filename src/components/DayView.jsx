import { useRef, useEffect } from 'react'
import SectionRenderer from './SectionRenderer'
import { TOPICS } from '../data/curriculum'

export default function DayView({ day, theme, onComplete, isCompleted, onNext, onPrev, totalDays }) {
  const isDark = theme === 'dark'
  const topic = TOPICS[day.topic]
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [day.day])

  const challengeCount = day.sections.filter(s => s.type === 'challenge').length
  const codeCount      = day.sections.filter(s => s.type === 'code').length

  return (
    <div
      ref={scrollRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        height: '100vh',
        background: isDark ? '#0a0d14' : '#ffffff',
      }}
    >
      {/* Day hero header */}
      <div style={{
        padding: '32px 40px 28px',
        background: isDark
          ? `linear-gradient(135deg, ${topic.bg} 0%, rgba(10,13,20,0) 60%)`
          : `linear-gradient(135deg, ${topic.color}08 0%, transparent 60%)`,
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
          }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: topic.color, opacity: 0.8,
            }}>
              Day {day.day} / {totalDays}
            </span>
            <span style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', fontSize: 12 }}>·</span>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              letterSpacing: '0.08em',
              color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)',
            }}>
              {topic.label}
            </span>
            <span style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', fontSize: 12 }}>·</span>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)',
            }}>
              ⏱ {day.duration}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            margin: '0 0 6px',
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 'clamp(28px, 4vw, 42px)',
            letterSpacing: '0.04em',
            color: isDark ? '#f1f5f9' : '#0f172a',
            lineHeight: 1.1,
          }}>
            {day.title}
          </h1>

          {/* Tagline */}
          <p style={{
            margin: '0 0 16px',
            fontSize: 14,
            fontFamily: 'DM Sans, sans-serif',
            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
            fontStyle: 'italic',
          }}>
            {day.tagline}
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Stat icon="⚡" label={`${codeCount} code examples`} color={topic.color} isDark={isDark} />
            {challengeCount > 0 && (
              <Stat icon="🏋️" label={`${challengeCount} challenge${challengeCount > 1 ? 's' : ''}`} color="#f59e0b" isDark={isDark} />
            )}
            {isCompleted ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 20,
                background: 'rgba(74,222,128,0.12)',
                border: '1px solid rgba(74,222,128,0.25)',
                fontSize: 11, color: '#4ade80',
                fontFamily: 'DM Sans, sans-serif',
              }}>
                ✓ Completed
              </div>
            ) : (
              <button onClick={onComplete} style={{
                padding: '5px 14px', borderRadius: 20,
                border: `1px solid ${topic.color}50`,
                background: `${topic.color}15`,
                color: topic.color,
                fontSize: 11, fontFamily: 'DM Sans, sans-serif',
                cursor: 'pointer', fontWeight: 600,
              }}>
                Mark Complete ✓
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 40px 60px' }}>
        {day.sections.map((section, i) => (
          <SectionRenderer key={i} section={section} theme={theme} />
        ))}

        {/* Navigation footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 40,
          paddingTop: 24,
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
              fontSize: 13, fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
            }}
          >
            ← Day {day.day - 1}
          </button>

          <div style={{ textAlign: 'center' }}>
            {!isCompleted && (
              <button onClick={onComplete} style={{
                padding: '10px 22px', borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#000',
                fontSize: 13, fontFamily: 'Syne, sans-serif',
                fontWeight: 700, cursor: 'pointer',
                letterSpacing: '0.03em',
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
              background: day.day < totalDays
                ? `${TOPICS[day.topic].color}15`
                : 'transparent',
              color: day.day === totalDays
                ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')
                : TOPICS[day.topic].color,
              cursor: day.day === totalDays ? 'not-allowed' : 'pointer',
              fontSize: 13, fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
            }}
          >
            Day {day.day + 1} →
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, label, color, isDark }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      fontSize: 11.5, fontFamily: 'DM Sans, sans-serif',
      color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
    }}>
      <span>{icon}</span>
      {label}
    </div>
  )
}
