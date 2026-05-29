import { useState, useCallback, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import DayView from './components/DayView'
import HomePage from './components/HomePage'
import { curriculum } from './data/curriculum'

const STORAGE_KEY = 'fsmastery_v1'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { completedDays: [], theme: 'dark' }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}

export default function App() {
  const [state, setState] = useState(loadState)
  const [activeDay, setActiveDay] = useState(null) // null = home
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const { completedDays, theme } = state
  const isDark = theme === 'dark'

  useEffect(() => {
    saveState(state)
  }, [state])

  // Apply theme to document body
  useEffect(() => {
    document.body.style.background = isDark ? '#0a0d14' : '#ffffff'
    document.body.style.colorScheme = isDark ? 'dark' : 'light'
  }, [isDark])

  const toggleTheme = useCallback(() => {
    setState(s => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))
  }, [])

  const markComplete = useCallback((day) => {
    setState(s => ({
      ...s,
      completedDays: s.completedDays.includes(day)
        ? s.completedDays
        : [...s.completedDays, day],
    }))
  }, [])

  const goToDay = useCallback((day) => {
    setActiveDay(day)
  }, [])

  const goNext = useCallback(() => {
    if (activeDay && activeDay < curriculum.length) {
      markComplete(activeDay)
      setActiveDay(d => d + 1)
    }
  }, [activeDay, markComplete])

  const goPrev = useCallback(() => {
    if (activeDay && activeDay > 1) setActiveDay(d => d - 1)
  }, [activeDay])

  const currentDayData = activeDay ? curriculum.find(d => d.day === activeDay) : null
  const progress = completedDays.length

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: isDark ? '#0a0d14' : '#ffffff',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      {/* Sidebar */}
      <Sidebar
        curriculum={curriculum}
        activeDay={activeDay}
        onSelect={(day) => setActiveDay(day)}
        theme={theme}
        progress={progress}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
      />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        {/* Top bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 20px',
          background: isDark ? 'rgba(10,13,20,0.85)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
          position: 'sticky',
          top: 0,
          zIndex: 20,
          height: 44,
          boxSizing: 'border-box',
        }}>
          <button
            onClick={() => setActiveDay(null)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
              fontSize: 12,
              fontFamily: 'DM Sans, sans-serif',
              display: 'flex', alignItems: 'center', gap: 5,
              padding: 0,
            }}
          >
            ⌂ Home
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* PWA install hint */}
            <span style={{
              fontSize: 10,
              fontFamily: 'JetBrains Mono, monospace',
              color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)',
              letterSpacing: '0.05em',
              display: window.innerWidth < 600 ? 'none' : 'inline',
            }}>
              {progress}/{curriculum.length} complete
            </span>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={{
                padding: '5px 12px',
                borderRadius: 7,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'DM Sans, sans-serif',
                display: 'flex', alignItems: 'center', gap: 5,
                transition: 'all 0.15s',
              }}
            >
              {isDark ? '☀ Light' : '☽ Dark'}
            </button>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {activeDay && currentDayData ? (
            <DayView
              day={currentDayData}
              theme={theme}
              onComplete={() => markComplete(activeDay)}
              isCompleted={completedDays.includes(activeDay)}
              onNext={goNext}
              onPrev={goPrev}
              totalDays={curriculum.length}
            />
          ) : (
            <HomePage
              theme={theme}
              onStart={() => {
                const nextDay = completedDays.length > 0
                  ? Math.min(completedDays.length + 1, curriculum.length)
                  : 1
                setActiveDay(nextDay)
              }}
              progress={progress}
              curriculum={curriculum}
            />
          )}
        </div>
      </div>
    </div>
  )
}
