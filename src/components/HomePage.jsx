import { TOPICS } from '../data/curriculum'

const TECH_CARDS = [
  {
    key: 'express',
    icon: '⚡',
    name: 'Express.js',
    days: 'Days 1–4',
    desc: 'Build REST APIs with routing, middleware, error handling, and SQL Server / PostgreSQL integration.',
    color: '#f59e0b',
  },
  {
    key: 'axios',
    icon: '🌐',
    name: 'Axios',
    days: 'Days 5–7',
    desc: 'Master the HTTP client: instances, interceptors, error handling, concurrent requests, and Vite integration.',
    color: '#38bdf8',
  },
  {
    key: 'reactquery',
    icon: '⚛️',
    name: 'React Query',
    days: 'Days 8–9',
    desc: 'Server state management with caching, mutations, optimistic updates, pagination, and infinite scroll.',
    color: '#a78bfa',
  },
  {
    key: 'integration',
    icon: '🔗',
    name: 'Full Stack',
    days: 'Day 10',
    desc: 'Integrate all three layers into a complete full-stack application with PostgreSQL and real project structure.',
    color: '#4ade80',
  },
]

export default function HomePage({ onStart, theme, progress, curriculum }) {
  const isDark = theme === 'dark'

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      height: '100vh',
      background: isDark
        ? 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,158,11,0.06) 0%, transparent 60%), #0a0d14'
        : 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,158,11,0.06) 0%, transparent 60%), #ffffff',
    }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '60px 40px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            display: 'inline-block',
            padding: '5px 14px',
            borderRadius: 20,
            border: '1px solid rgba(245,158,11,0.3)',
            background: 'rgba(245,158,11,0.08)',
            fontSize: 11,
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.1em',
            color: '#f59e0b',
            marginBottom: 20,
          }}>
            10-DAY BOOTCAMP
          </div>

          <h1 style={{
            margin: '0 0 16px',
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 'clamp(40px, 7vw, 72px)',
            letterSpacing: '0.04em',
            lineHeight: 1,
            color: isDark ? '#f1f5f9' : '#0f172a',
          }}>
            FULLSTACK
            <br />
            <span style={{ color: '#f59e0b' }}>MASTERY</span>
          </h1>

          <p style={{
            margin: '0 0 30px',
            fontSize: 16,
            fontFamily: 'DM Sans, sans-serif',
            color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
            maxWidth: 500,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.7,
          }}>
            A comprehensive, hands-on course covering <strong style={{ color: '#f59e0b' }}>Express.js</strong>,{' '}
            <strong style={{ color: '#38bdf8' }}>Axios</strong>, and{' '}
            <strong style={{ color: '#a78bfa' }}>React Query</strong> — with a live code simulator, real SQL examples, and daily challenges.
          </p>

          {/* Progress indicator */}
          {progress > 0 && (
            <div style={{
              margin: '0 auto 24px',
              maxWidth: 360,
              padding: '12px 18px',
              borderRadius: 10,
              background: isDark ? 'rgba(74,222,128,0.07)' : 'rgba(74,222,128,0.08)',
              border: '1px solid rgba(74,222,128,0.2)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#4ade80', fontFamily: 'DM Sans, sans-serif' }}>
                  🎯 Your progress
                </span>
                <span style={{ fontSize: 12, color: '#4ade80', fontFamily: 'JetBrains Mono, monospace' }}>
                  {progress}/{curriculum.length} days
                </span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: 'rgba(74,222,128,0.15)', overflow: 'hidden' }}>
                <div style={{ width: `${(progress / curriculum.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #4ade80, #22d3ee)', borderRadius: 3 }} />
              </div>
            </div>
          )}

          <button
            onClick={onStart}
            style={{
              padding: '14px 36px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#000',
              fontSize: 15,
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: '0.05em',
              boxShadow: '0 4px 24px rgba(245,158,11,0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseOver={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 28px rgba(245,158,11,0.45)' }}
            onMouseOut={e => { e.target.style.transform = ''; e.target.style.boxShadow = '0 4px 24px rgba(245,158,11,0.35)' }}
          >
            {progress > 0 ? `Continue from Day ${progress + 1}` : 'Start Day 1 →'}
          </button>
        </div>

        {/* Tech cards */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{
            margin: '0 0 20px',
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: 18,
            color: isDark ? '#f1f5f9' : '#0f172a',
            textAlign: 'center',
          }}>
            What You'll Master
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            {TECH_CARDS.map(card => (
              <div
                key={card.key}
                style={{
                  padding: '18px 16px',
                  borderRadius: 12,
                  border: `1px solid ${card.color}25`,
                  background: isDark ? `${TOPICS[card.key]?.bg || 'rgba(255,255,255,0.02)'}60` : `${card.color}06`,
                  transition: 'transform 0.15s, border-color 0.15s',
                  cursor: 'default',
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = `${card.color}50` }}
                onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = `${card.color}25` }}
              >
                <div style={{ fontSize: 22, marginBottom: 8 }}>{card.icon}</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: card.color, marginBottom: 3 }}>
                  {card.name}
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)', marginBottom: 10, letterSpacing: '0.06em' }}>
                  {card.days}
                </div>
                <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontFamily: 'DM Sans, sans-serif' }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ margin: '0 0 20px', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: isDark ? '#f1f5f9' : '#0f172a', textAlign: 'center' }}>
            Course Features
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { icon: '🖥️', title: 'Live Simulator', desc: 'Monaco editor with mock API — run code right in the browser' },
              { icon: '📊', title: 'SQL Examples', desc: 'Real SQL Server & PostgreSQL patterns with parameterized queries' },
              { icon: '🏋️', title: '10 Challenges', desc: 'One hands-on challenge per day with starter code and solutions' },
              { icon: '🌗', title: 'Dark & Light', desc: 'Full dark and light mode support, toggle anytime' },
              { icon: '📱', title: 'Installable PWA', desc: 'Install as a native-like app, works offline after first load' },
              { icon: '📈', title: 'Progress Tracking', desc: 'Mark days complete, track your journey through the course' },
            ].map((f, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, padding: '14px',
                borderRadius: 10,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: 3 }}>
                    {f.title}
                  </div>
                  <div style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onStart}
            style={{
              padding: '13px 32px',
              borderRadius: 10,
              border: `2px solid rgba(245,158,11,0.4)`,
              background: 'transparent',
              color: '#f59e0b',
              fontSize: 14,
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.04em',
              transition: 'all 0.15s',
            }}
            onMouseOver={e => { e.target.style.background = 'rgba(245,158,11,0.08)'; e.target.style.borderColor = 'rgba(245,158,11,0.7)' }}
            onMouseOut={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(245,158,11,0.4)' }}
          >
            Begin the Course →
          </button>
        </div>
      </div>
    </div>
  )
}
