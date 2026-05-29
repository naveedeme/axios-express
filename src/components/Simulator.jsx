import { useState, useCallback, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { resolveMock } from '../data/mockApi'

const EDITOR_OPTIONS = {
  minimap: { enabled: false },
  fontSize: 13,
  lineHeight: 20,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontLigatures: true,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  wordWrap: 'on',
  lineNumbers: 'on',
  glyphMargin: false,
  folding: true,
  renderLineHighlight: 'line',
  padding: { top: 12, bottom: 12 },
  scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
}

// Build the mock axios runtime injected before user code
function buildAxiosRuntime() {
  return `
const _mockDelay = (ms) => new Promise(r => setTimeout(r, ms));

const _resolveMock = (method, url) => {
  const MOCK_RESPONSES = ${JSON.stringify(
    Object.fromEntries(
      Object.entries(
        (() => {
          try { return require('../data/mockApi').MOCK_RESPONSES } catch { return {} }
        })()
      )
    )
  )};
  return null; // resolved at runtime via postMessage
};

const axios = {
  _request: async function(method, url, data, config) {
    await _mockDelay(80 + Math.random() * 120);
    const result = window.__mockResolve(method, url);
    if (result.status >= 400) {
      const err = new Error('Request failed with status ' + result.status);
      err.response = { status: result.status, data: result.data, headers: { 'content-type': 'application/json' } };
      err.config = { url, method };
      throw err;
    }
    return {
      data: result.data,
      status: result.status,
      statusText: result.status === 200 ? 'OK' : 'Created',
      headers: { 'content-type': 'application/json' },
      config: { url, method },
      request: { url },
    };
  },
  get:    function(url, config) { return this._request('GET',    url, null, config); },
  post:   function(url, data, config) { return this._request('POST',   url, data, config); },
  put:    function(url, data, config) { return this._request('PUT',    url, data, config); },
  patch:  function(url, data, config) { return this._request('PATCH',  url, data, config); },
  delete: function(url, config) { return this._request('DELETE', url, null, config); },
  create: function(defaults) {
    const inst = Object.assign({}, axios);
    inst._defaults = defaults || {};
    inst._request = async function(method, url, data, config) {
      const base = (this._defaults.baseURL || '') + url;
      await _mockDelay(80 + Math.random() * 120);
      const result = window.__mockResolve(method, base);
      if (result.status >= 400) {
        const err = new Error('Request failed with status ' + result.status);
        err.response = { status: result.status, data: result.data };
        err.config = { ...(config||{}), url: base, method };
        throw err;
      }
      return {
        data: result.data,
        status: result.status,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: { ...(config||{}), url: base, method },
        request: { url: base },
      };
    };
    inst.interceptors = {
      _req: [], _res: [],
      request:  { use: (fn, ef) => { inst.interceptors._req.push({fn, ef}); } },
      response: { use: (fn, ef) => { inst.interceptors._res.push({fn, ef}); } },
    };
    const origReq = inst._request.bind(inst);
    inst._request = async function(method, url, data, config) {
      let cfg = { ...(this._defaults||{}), url, method, data, headers: { ...(this._defaults?.headers||{}), ...((config||{}).headers||{}) } };
      for (const {fn} of this.interceptors._req) { try { cfg = fn(cfg) || cfg; } catch(e) {} }
      let resp;
      try { resp = await origReq(method, url, data, cfg); }
      catch(err) {
        for (const {ef} of this.interceptors._res) { if(ef) try { await ef(err); } catch(e){} }
        throw err;
      }
      for (const {fn} of this.interceptors._res) { try { resp = fn(resp) || resp; } catch(e){} }
      return resp;
    };
    return inst;
  },
  isCancel: () => false,
  isAxiosError: (e) => !!e?.response,
};
`
}

export default function Simulator({ initialCode = '', theme = 'dark' }) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState([])
  const [running, setRunning] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [solutionCode, setSolutionCode] = useState(null)
  const outputRef = useRef(null)

  const addLine = useCallback((type, ...args) => {
    const text = args.map(a => {
      if (typeof a === 'string') return a
      try { return JSON.stringify(a) } catch { return String(a) }
    }).join(' ')
    setOutput(prev => [...prev, { type, text, id: Date.now() + Math.random() }])
  }, [])

  const runCode = useCallback(async () => {
    setOutput([])
    setRunning(true)

    const logs = []
    const capturedConsole = {
      log:   (...a) => logs.push({ type: 'log',   args: a }),
      error: (...a) => logs.push({ type: 'error', args: a }),
      warn:  (...a) => logs.push({ type: 'warn',  args: a }),
      info:  (...a) => logs.push({ type: 'info',  args: a }),
    }

    // Inject mock resolver into window
    window.__mockResolve = (method, url) => resolveMock(method, url)

    try {
      const axiosRuntime = buildAxiosRuntime()
      const wrappedCode = `
        ${axiosRuntime}
        const console = __console;
        const process = {
          env: { NODE_ENV: 'development', PORT: '3000' },
          uptime: () => 12345,
        };
        try {
          ${code}
        } catch(__err) {
          console.error('Runtime error:', __err.message);
        }
      `

      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
      const fn = new AsyncFunction('__console', wrappedCode)
      await fn(capturedConsole)

      // Small delay to let async console.logs settle
      await new Promise(r => setTimeout(r, 600))

      if (logs.length === 0) {
        logs.push({ type: 'info', args: ['✓ Code ran successfully (no console output)'] })
      }
    } catch (err) {
      logs.push({ type: 'error', args: ['Execution error: ' + err.message] })
    }

    setOutput(logs.map((l, i) => ({
      id: i,
      type: l.type,
      text: l.args.map(a => {
        if (typeof a === 'string') return a
        try { return JSON.stringify(a, null, 2) } catch { return String(a) }
      }).join(' ')
    })))

    setRunning(false)
    setTimeout(() => outputRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }, [code])

  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'light'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      borderRadius: 12,
      overflow: 'hidden',
      border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
      background: theme === 'dark' ? '#0d1117' : '#f8fafc',
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        background: theme === 'dark' ? '#161b22' : '#e2e8f0',
        borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
        </div>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          color: theme === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)',
          letterSpacing: '0.05em',
        }}>
          simulator.js
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {solutionCode && (
            <button
              onClick={() => {
                setShowSolution(s => !s)
                if (!showSolution) setCode(solutionCode)
                else setCode(initialCode)
              }}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                border: `1px solid ${theme === 'dark' ? 'rgba(167,139,250,0.4)' : 'rgba(109,40,217,0.3)'}`,
                background: 'transparent',
                color: theme === 'dark' ? '#a78bfa' : '#7c3aed',
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
                cursor: 'pointer',
              }}
            >
              {showSolution ? 'My Code' : 'Solution'}
            </button>
          )}
          <button
            onClick={() => setCode(initialCode)}
            style={{
              padding: '4px 12px',
              borderRadius: 6,
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'}`,
              background: 'transparent',
              color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
              fontSize: 11,
              fontFamily: 'JetBrains Mono, monospace',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
          <button
            onClick={runCode}
            disabled={running}
            style={{
              padding: '4px 16px',
              borderRadius: 6,
              border: 'none',
              background: running ? '#555' : 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#000',
              fontSize: 11,
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              cursor: running ? 'not-allowed' : 'pointer',
              letterSpacing: '0.05em',
              transition: 'all 0.2s',
            }}
          >
            {running ? '▶ Running…' : '▶ Run'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <Editor
        height="340px"
        defaultLanguage="javascript"
        value={code}
        onChange={v => setCode(v || '')}
        theme={monacoTheme}
        options={EDITOR_OPTIONS}
        loading={
          <div style={{
            height: 340,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: theme === 'dark' ? '#0d1117' : '#f8fafc',
            color: theme === 'dark' ? '#666' : '#999',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
          }}>
            Loading editor…
          </div>
        }
      />

      {/* Output panel */}
      <div style={{
        borderTop: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
        background: theme === 'dark' ? '#010409' : '#f1f5f9',
      }}>
        <div style={{
          padding: '6px 14px',
          fontSize: 10,
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.1em',
          color: theme === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)',
          borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}`,
          textTransform: 'uppercase',
        }}>
          Console Output
        </div>
        <div
          ref={outputRef}
          style={{
            height: 180,
            overflowY: 'auto',
            padding: '10px 14px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            lineHeight: 1.65,
          }}
        >
          {running && (
            <div style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
              Executing…
            </div>
          )}
          {!running && output.length === 0 && (
            <div style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)', fontSize: 12 }}>
              Press ▶ Run to execute your code. Output appears here.
            </div>
          )}
          {output.map(line => (
            <div key={line.id} style={{
              color: line.type === 'error' ? '#f87171'
                   : line.type === 'warn'  ? '#fbbf24'
                   : line.type === 'info'  ? '#60a5fa'
                   : theme === 'dark' ? '#e2e8f0' : '#1e293b',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              borderLeft: line.type === 'error' ? '2px solid #f87171'
                        : line.type === 'warn'  ? '2px solid #fbbf24'
                        : '2px solid transparent',
              paddingLeft: 8,
              marginBottom: 2,
            }}>
              {line.type === 'error' && <span style={{ opacity: 0.6 }}>✖ </span>}
              {line.type === 'warn'  && <span style={{ opacity: 0.6 }}>⚠ </span>}
              {line.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Export a version that accepts solution code
export function ChallengeSimulator({ starterCode, solutionCode, theme }) {
  const [code, setCode] = useState(starterCode)
  const [showSolution, setShowSolution] = useState(false)
  const [output, setOutput] = useState([])
  const [running, setRunning] = useState(false)
  const outputRef = useRef(null)

  const runCode = useCallback(async () => {
    setOutput([])
    setRunning(true)
    const logs = []
    const capturedConsole = {
      log:   (...a) => logs.push({ type: 'log',   args: a }),
      error: (...a) => logs.push({ type: 'error', args: a }),
      warn:  (...a) => logs.push({ type: 'warn',  args: a }),
      info:  (...a) => logs.push({ type: 'info',  args: a }),
    }
    window.__mockResolve = (method, url) => resolveMock(method, url)
    try {
      const axiosRuntime = buildAxiosRuntime()
      const wrappedCode = `
        ${axiosRuntime}
        const console = __console;
        const process = { env: { NODE_ENV: 'development' }, uptime: () => 12345 };
        try { ${code} } catch(__err) { console.error('Runtime error:', __err.message); }
      `
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
      await new AsyncFunction('__console', wrappedCode)(capturedConsole)
      await new Promise(r => setTimeout(r, 600))
      if (logs.length === 0) logs.push({ type: 'info', args: ['✓ Code ran successfully'] })
    } catch (err) {
      logs.push({ type: 'error', args: ['Execution error: ' + err.message] })
    }
    setOutput(logs.map((l, i) => ({
      id: i, type: l.type,
      text: l.args.map(a => typeof a === 'string' ? a : JSON.stringify(a, null, 2)).join(' ')
    })))
    setRunning(false)
  }, [code])

  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'light'
  const isDark = theme === 'dark'

  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      border: `1px solid ${isDark ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.3)'}`,
      background: isDark ? '#0d1117' : '#f8fafc',
    }}>
      {/* toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px',
        background: isDark ? '#161b22' : '#e2e8f0',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }}/>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }}/>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }}/>
        </div>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#f59e0b', letterSpacing: '0.05em' }}>
          challenge.js
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setShowSolution(s => !s); setCode(showSolution ? starterCode : solutionCode) }}
            style={{ padding: '4px 12px', borderRadius: 6, border: `1px solid ${isDark ? 'rgba(167,139,250,0.4)' : 'rgba(109,40,217,0.3)'}`, background: 'transparent', color: isDark ? '#a78bfa' : '#7c3aed', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer' }}>
            {showSolution ? 'My Code' : 'Solution'}
          </button>
          <button onClick={() => { setCode(starterCode); setShowSolution(false) }}
            style={{ padding: '4px 12px', borderRadius: 6, border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'}`, background: 'transparent', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer' }}>
            Reset
          </button>
          <button onClick={runCode} disabled={running}
            style={{ padding: '4px 16px', borderRadius: 6, border: 'none', background: running ? '#555' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', cursor: running ? 'not-allowed' : 'pointer' }}>
            {running ? '▶ Running…' : '▶ Run'}
          </button>
        </div>
      </div>
      <Editor height="320px" defaultLanguage="javascript" value={code} onChange={v => setCode(v||'')} theme={monacoTheme} options={EDITOR_OPTIONS} />
      <div style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`, background: isDark ? '#010409' : '#f1f5f9' }}>
        <div style={{ padding: '6px 14px', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}`, textTransform: 'uppercase' }}>Console Output</div>
        <div ref={outputRef} style={{ height: 160, overflowY: 'auto', padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.65 }}>
          {running && <div style={{ color: '#f59e0b' }}>⟳ Executing…</div>}
          {!running && output.length === 0 && <div style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)' }}>Press ▶ Run to execute your code.</div>}
          {output.map(line => (
            <div key={line.id} style={{ color: line.type === 'error' ? '#f87171' : line.type === 'warn' ? '#fbbf24' : line.type === 'info' ? '#60a5fa' : isDark ? '#e2e8f0' : '#1e293b', whiteSpace: 'pre-wrap', wordBreak: 'break-all', borderLeft: line.type === 'error' ? '2px solid #f87171' : line.type === 'warn' ? '2px solid #fbbf24' : '2px solid transparent', paddingLeft: 8, marginBottom: 2 }}>
              {line.type === 'error' && '✖ '}{line.type === 'warn' && '⚠ '}{line.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
