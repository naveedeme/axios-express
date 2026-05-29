import { useState } from 'react'
import Simulator, { ChallengeSimulator } from './Simulator'
import { TOPICS } from '../data/curriculum'

const CODE_COLORS = {
  dark: {
    bg: '#0d1117',
    border: 'rgba(255,255,255,0.07)',
    header: '#161b22',
    text: '#e2e8f0',
    comment: '#8b949e',
    keyword: '#ff7b72',
    string: '#a5d6ff',
    number: '#79c0ff',
  }
}

function SyntaxLine({ line, isDark }) {
  const c = isDark ? '#e2e8f0' : '#1e293b'
  const comment = isDark ? '#8b949e' : '#6b7280'
  const keyword = isDark ? '#ff7b72' : '#d00'
  const str = isDark ? '#a5d6ff' : '#0369a1'
  const num = isDark ? '#79c0ff' : '#1d4ed8'

  if (line.trimStart().startsWith('//')) {
    return <span style={{ color: comment, fontStyle: 'italic' }}>{line}</span>
  }

  return <span style={{ color: c }}>{line}</span>
}

export function CodeBlock({ section, theme }) {
  const [copied, setCopied] = useState(false)
  const isDark = theme === 'dark'
  const isRunnable = section.runnable !== false

  const handleCopy = () => {
    navigator.clipboard.writeText(section.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <h3 style={{
          margin: 0,
          fontSize: 16,
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          color: isDark ? '#f1f5f9' : '#0f172a',
        }}>
          {section.title}
        </h3>
        {section.note && (
          <span style={{
            fontSize: 11, padding: '3px 8px', borderRadius: 4,
            background: isDark ? 'rgba(251,191,36,0.1)' : 'rgba(251,191,36,0.15)',
            color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace',
            border: '1px solid rgba(251,191,36,0.25)',
          }}>
            📖 Study only
          </span>
        )}
      </div>

      {section.note && (
        <div style={{
          padding: '10px 14px', marginBottom: 10, borderRadius: 8,
          background: isDark ? 'rgba(251,191,36,0.07)' : 'rgba(251,191,36,0.08)',
          border: `1px solid rgba(251,191,36,0.2)`,
          fontSize: 13, color: isDark ? '#fbbf24' : '#92400e',
          fontFamily: 'DM Sans, sans-serif',
        }}>
          ℹ {section.note}
        </div>
      )}

      {isRunnable ? (
        <Simulator initialCode={section.code} theme={theme} />
      ) : (
        <div style={{
          borderRadius: 12, overflow: 'hidden',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 14px',
            background: isDark ? '#161b22' : '#e2e8f0',
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }}/>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }}/>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }}/>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)' }}>
              {section.language || 'javascript'}
            </span>
            <button onClick={handleCopy} style={{
              padding: '3px 10px', borderRadius: 5, border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
              background: 'transparent', color: copied ? '#4ade80' : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
              fontSize: 11, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer',
            }}>
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <div style={{
            background: isDark ? '#0d1117' : '#f8fafc',
            padding: '16px',
            overflowX: 'auto',
            maxHeight: 480,
            overflowY: 'auto',
          }}>
            <pre style={{
              margin: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5,
              lineHeight: 1.65, color: isDark ? '#e2e8f0' : '#1e293b',
            }}>
              {section.code.split('\n').map((line, i) => (
                <div key={i} style={{ minHeight: '1.65em' }}>
                  <SyntaxLine line={line} isDark={isDark} />
                </div>
              ))}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export function ConceptBlock({ section, theme }) {
  const isDark = theme === 'dark'
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 16, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a' }}>
        {section.title}
      </h3>
      <div style={{
        padding: '18px 20px', borderRadius: 10,
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
        fontSize: 14, lineHeight: 1.75,
        color: isDark ? '#cbd5e1' : '#374151',
        fontFamily: 'DM Sans, sans-serif',
        whiteSpace: 'pre-line',
      }}>
        {section.content}
      </div>
      {section.tip && (
        <div style={{
          marginTop: 12, padding: '10px 14px', borderRadius: 8,
          background: isDark ? 'rgba(52,211,153,0.07)' : 'rgba(52,211,153,0.08)',
          border: `1px solid rgba(52,211,153,0.2)`,
          fontSize: 13, color: isDark ? '#6ee7b7' : '#065f46',
          fontFamily: 'DM Sans, sans-serif',
        }}>
          💡 <strong>Tip:</strong> {section.tip}
        </div>
      )}
    </div>
  )
}

export function IntroBlock({ section, theme }) {
  const isDark = theme === 'dark'
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 16, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a' }}>
        {section.title}
      </h3>
      <div style={{
        padding: '20px 22px', borderRadius: 10,
        background: isDark ? 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(251,191,36,0.03))' : 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(251,191,36,0.04))',
        border: `1px solid rgba(245,158,11,0.18)`,
        fontSize: 14, lineHeight: 1.75,
        color: isDark ? '#cbd5e1' : '#374151',
        fontFamily: 'DM Sans, sans-serif',
        whiteSpace: 'pre-line',
      }}>
        {section.content}
      </div>
    </div>
  )
}

export function NotForBlock({ section, theme }) {
  const isDark = theme === 'dark'
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 16, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: isDark ? '#f87171' : '#dc2626' }}>
        ⛔ {section.title}
      </h3>
      <div style={{
        borderRadius: 10,
        border: `1px solid ${isDark ? 'rgba(248,113,113,0.2)' : 'rgba(220,38,38,0.15)'}`,
        overflow: 'hidden',
      }}>
        {section.items.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '11px 16px',
            background: i % 2 === 0
              ? (isDark ? 'rgba(248,113,113,0.04)' : 'rgba(220,38,38,0.03)')
              : 'transparent',
            borderBottom: i < section.items.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` : 'none',
            fontSize: 13.5, color: isDark ? '#cbd5e1' : '#374151',
            fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6,
          }}>
            <span style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }}>✗</span>
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

export function InstallBlock({ section, theme }) {
  const [copiedIdx, setCopiedIdx] = useState(null)
  const isDark = theme === 'dark'

  const copy = (cmd, i) => {
    navigator.clipboard.writeText(cmd)
    setCopiedIdx(i)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 16, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a' }}>
        📦 {section.title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {section.steps.map((step, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', borderRadius: 8,
            background: isDark ? '#0d1117' : '#f1f5f9',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                fontSize: 11, fontWeight: 700, color: '#000',
              }}>
                {i + 1}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5,
                  color: isDark ? '#a5d6ff' : '#0369a1',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {step.cmd}
                </div>
                <div style={{ fontSize: 11.5, color: isDark ? '#64748b' : '#94a3b8', marginTop: 2, fontFamily: 'DM Sans, sans-serif' }}>
                  {step.desc}
                </div>
              </div>
            </div>
            <button onClick={() => copy(step.cmd, i)} style={{
              padding: '4px 10px', borderRadius: 5, flexShrink: 0,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              background: 'transparent',
              color: copiedIdx === i ? '#4ade80' : isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
              fontSize: 11, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer',
            }}>
              {copiedIdx === i ? '✓' : 'Copy'}
            </button>
          </div>
        ))}
      </div>
      {section.note && (
        <div style={{
          marginTop: 10, padding: '10px 14px', borderRadius: 8,
          background: isDark ? 'rgba(56,189,248,0.07)' : 'rgba(56,189,248,0.08)',
          border: `1px solid rgba(56,189,248,0.2)`,
          fontSize: 13, color: isDark ? '#7dd3fc' : '#0c4a6e',
          fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6,
        }}>
          📌 {section.note}
        </div>
      )}
    </div>
  )
}

export function TipBlock({ section, theme }) {
  const isDark = theme === 'dark'
  return (
    <div style={{
      marginBottom: 28, padding: '16px 20px', borderRadius: 10,
      background: isDark ? 'rgba(52,211,153,0.07)' : 'rgba(52,211,153,0.06)',
      border: `1px solid rgba(52,211,153,0.25)`,
      borderLeft: '4px solid #34d399',
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399', marginBottom: 6, fontFamily: 'Syne, sans-serif' }}>
        💡 {section.title}
      </div>
      <div style={{ fontSize: 13.5, lineHeight: 1.7, color: isDark ? '#cbd5e1' : '#374151', fontFamily: 'DM Sans, sans-serif' }}>
        {section.content}
      </div>
    </div>
  )
}

export function WarningBlock({ section, theme }) {
  const isDark = theme === 'dark'
  return (
    <div style={{
      marginBottom: 28, padding: '16px 20px', borderRadius: 10,
      background: isDark ? 'rgba(251,113,133,0.07)' : 'rgba(251,113,133,0.06)',
      border: `1px solid rgba(251,113,133,0.25)`,
      borderLeft: '4px solid #fb7185',
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fb7185', marginBottom: 6, fontFamily: 'Syne, sans-serif' }}>
        ⚠ {section.title}
      </div>
      <div style={{ fontSize: 13.5, lineHeight: 1.7, color: isDark ? '#cbd5e1' : '#374151', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'pre-line' }}>
        {section.content}
      </div>
    </div>
  )
}

export function ChallengeBlock({ section, theme }) {
  const [expanded, setExpanded] = useState(true)
  const isDark = theme === 'dark'

  return (
    <div style={{
      marginBottom: 28, borderRadius: 12,
      border: `2px solid rgba(245,158,11,0.3)`,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', cursor: 'pointer',
          background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.07)',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🏋️</span>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: '#f59e0b' }}>
              {section.title}
            </div>
            <div style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)', fontFamily: 'DM Sans, sans-serif' }}>
              Try before peeking at the solution
            </div>
          </div>
        </div>
        <span style={{ color: '#f59e0b', fontSize: 14 }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ padding: '16px 18px', background: isDark ? '#0d1117' : '#fefce8' }}>
          {/* Description */}
          <div style={{
            padding: '12px 14px', borderRadius: 8, marginBottom: 16,
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
            fontSize: 13.5, lineHeight: 1.75,
            color: isDark ? '#cbd5e1' : '#374151',
            fontFamily: 'DM Sans, sans-serif',
            whiteSpace: 'pre-line',
          }}>
            {section.description}
          </div>

          {/* Editor */}
          <ChallengeSimulator
            starterCode={section.starterCode}
            solutionCode={section.solution}
            theme={theme}
          />
        </div>
      )}
    </div>
  )
}

export default function SectionRenderer({ section, theme }) {
  switch (section.type) {
    case 'code':      return <CodeBlock      section={section} theme={theme} />
    case 'concept':   return <ConceptBlock   section={section} theme={theme} />
    case 'intro':     return <IntroBlock     section={section} theme={theme} />
    case 'not-for':   return <NotForBlock    section={section} theme={theme} />
    case 'install':   return <InstallBlock   section={section} theme={theme} />
    case 'tip':       return <TipBlock       section={section} theme={theme} />
    case 'warning':   return <WarningBlock   section={section} theme={theme} />
    case 'challenge': return <ChallengeBlock section={section} theme={theme} />
    default:          return null
  }
}
