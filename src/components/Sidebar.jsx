import { TOPICS } from '../data/curriculum'

export default function Sidebar({ curriculum, activeDay, onSelect, theme, progress, collapsed, onToggle }) {
  const isDark = theme === 'dark'

  return (
    <aside style={{
      width: collapsed ? 56 : 260,
      minHeight: '100vh',
      background: isDark
        ? 'linear-gradient(180deg, #0a0d14 0%, #0d1117 100%)'
        : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
      borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      overflow: 'hidden',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      {/* Logo area */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 18px',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 10,
      }}>
        {!collapsed && (
          <div>
            <div style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 18,
              letterSpacing: '0.08em',
              color: '#f59e0b',
              lineHeight: 1,
            }}>
              FS MASTERY
            </div>
            <div style={{
              fontSize: 10,
              fontFamily: 'JetBrains Mono, monospace',
              color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)',
              letterSpacing: '0.06em',
              marginTop: 2,
            }}>
              10-DAY COURSE
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          style={{
            background: 'transparent',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: 6,
            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
            cursor: 'pointer',
            padding: '4px 7px',
            fontSize: 12,
            lineHeight: 1,
            flexShrink: 0,
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Progress */}
      {!collapsed && (
        <div style={{ padding: '12px 18px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontFamily: 'DM Sans, sans-serif', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
              Progress
            </span>
            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#f59e0b' }}>
              {progress}/{curriculum.length}
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(progress / curriculum.length) * 100}%`,
              background: 'linear-gradient(90deg, #f59e0b, #d97706)',
              borderRadius: 2,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      )}

      {/* Day list */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '10px 6px' : '10px 10px' }}>
        {curriculum.map(day => {
          const topic = TOPICS[day.topic]
          const isActive = activeDay === day.day
          const isDone = day.day < activeDay

          return (
            <button
              key={day.day}
              onClick={() => onSelect(day.day)}
              title={collapsed ? `Day ${day.day}: ${day.title}` : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: collapsed ? 'center' : 'flex-start',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 10,
                padding: collapsed ? '9px 0' : '9px 10px',
                marginBottom: 2,
                borderRadius: 8,
                border: isActive
                  ? `1px solid ${topic.color}40`
                  : '1px solid transparent',
                background: isActive
                  ? (isDark ? `${topic.bg}80` : `${topic.color}12`)
                  : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              {/* Day badge */}
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive
                  ? `linear-gradient(135deg, ${topic.color}, ${topic.color}cc)`
                  : isDone
                  ? (isDark ? 'rgba(74,222,128,0.15)' : 'rgba(74,222,128,0.2)')
                  : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                fontSize: isDone ? 12 : 11,
                fontWeight: 700,
                color: isActive ? '#000' : isDone ? '#4ade80' : isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                {isDone ? '✓' : day.day}
              </div>

              {!collapsed && (
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 500,
                    fontFamily: 'Syne, sans-serif',
                    color: isActive ? topic.color : isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.3,
                  }}>
                    {day.title}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)',
                    fontFamily: 'DM Sans, sans-serif',
                    marginTop: 2,
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: topic.color,
                      marginRight: 4,
                      verticalAlign: 'middle',
                    }} />
                    {topic.label}
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Theme toggle placeholder / footer */}
      {!collapsed && (
        <div style={{
          padding: '12px 18px',
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
          fontSize: 10,
          fontFamily: 'JetBrains Mono, monospace',
          color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)',
          textAlign: 'center',
          letterSpacing: '0.05em',
        }}>
          Express · Axios · React Query
        </div>
      )}
    </aside>
  )
}
