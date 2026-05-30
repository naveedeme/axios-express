import { useState, useCallback, useRef, forwardRef } from 'react'
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

// ─────────────────────────────────────────────────────────────────
//  Build the complete runtime injected before every user snippet.
//  Provides: require(), axios mock, express mock, process, module
// ─────────────────────────────────────────────────────────────────
function buildRuntime() {
  return `
// ── Helpers ────────────────────────────────────────────────────
const _delay = ms => new Promise(r => setTimeout(r, ms));

// ── Axios mock ─────────────────────────────────────────────────
function _axiosRequest(method, url, data, config, defaults) {
  return _delay(80 + Math.random() * 100).then(() => {
    const base = (defaults && defaults.baseURL) || '';
    const fullUrl = url.startsWith('http') ? url : base + url;
    const result = window.__mockResolve(method, fullUrl);
    if (result.status >= 400) {
      const err = new Error('Request failed with status ' + result.status);
      err.response = { status: result.status, data: result.data,
        headers: { 'content-type': 'application/json' } };
      err.config = { url: fullUrl, method };
      throw err;
    }
    return {
      data: result.data, status: result.status,
      statusText: result.status < 300 ? 'OK' : 'Created',
      headers: { 'content-type': 'application/json' },
      config: { ...(config||{}), url: fullUrl, method },
      request: { url: fullUrl },
    };
  });
}

function _makeAxiosInstance(defaults) {
  const inst = {
    _defaults: defaults || {},
    _reqInterceptors: [],
    _resInterceptors: [],
    interceptors: null, // set below
    get(url, cfg)         { return this._call('GET',    url, null, cfg); },
    post(url, data, cfg)  { return this._call('POST',   url, data, cfg); },
    put(url, data, cfg)   { return this._call('PUT',    url, data, cfg); },
    patch(url, data, cfg) { return this._call('PATCH',  url, data, cfg); },
    delete(url, cfg)      { return this._call('DELETE', url, null, cfg); },
    async _call(method, url, data, config) {
      let cfg = {
        ...(this._defaults || {}),
        url, method, data,
        headers: { ...(this._defaults && this._defaults.headers || {}),
                   ...((config && config.headers) || {}) },
        params: (config && config.params) || undefined,
      };
      for (const { fn } of this._reqInterceptors) {
        try { cfg = fn(cfg) || cfg; } catch(e) {}
      }
      let resp;
      try {
        resp = await _axiosRequest(method, url, data, cfg, this._defaults);
      } catch(err) {
        for (const { ef } of this._resInterceptors) {
          if (ef) try { await ef(err); } catch(e) {}
        }
        throw err;
      }
      for (const { fn } of this._resInterceptors) {
        try { resp = fn(resp) || resp; } catch(e) {}
      }
      return resp;
    },
  };
  inst.interceptors = {
    request:  { use(fn, ef) { inst._reqInterceptors.push({ fn, ef }); } },
    response: { use(fn, ef) { inst._resInterceptors.push({ fn, ef }); } },
  };
  return inst;
}

const axios = {
  ..._makeAxiosInstance({}),
  create(defaults) { return _makeAxiosInstance(defaults); },
  isCancel()       { return false; },
  isAxiosError(e)  { return !!(e && e.response); },
};

// ── Express mock ───────────────────────────────────────────────
function _matchPath(pattern, urlPath) {
  // strip query string
  const clean = urlPath.split('?')[0];
  const pp = pattern.split('/');
  const up = clean.split('/');
  if (pp.length !== up.length) return null;
  const params = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(':')) { params[pp[i].slice(1)] = up[i]; }
    else if (pp[i] !== up[i]) return null;
  }
  return params;
}

function _makeRes(method, path, __console) {
  let code = 200;
  const res = {
    _done: false,
    headersSent: false,
    status(c) { code = c; return res; },
    sendStatus(c) {
      code = c; res._done = true; res.headersSent = true;
      __console.log('[' + method + '] ' + path + ' → ' + c);
      return res;
    },
    json(body) {
      if (res._done) return res;
      res._done = true; res.headersSent = true;
      __console.log('[' + method + '] ' + path + ' → ' + code + '  ' + JSON.stringify(body, null, 2));
      return res;
    },
    send(text) {
      if (res._done) return res;
      res._done = true; res.headersSent = true;
      __console.log('[' + method + '] ' + path + ' → ' + code + '  "' + text + '"');
      return res;
    },
    setHeader() { return res; },
    set()       { return res; },
    redirect(url) {
      res._done = true; res.headersSent = true;
      __console.log('[' + method + '] ' + path + ' → 302 → ' + url);
    },
  };
  return res;
}

function _makeReq(method, testPath, params, body) {
  const [p, qs = ''] = testPath.split('?');
  const query = {};
  qs.split('&').filter(Boolean).forEach(pair => {
    const [k, v] = pair.split('=');
    query[decodeURIComponent(k)] = decodeURIComponent(v || '');
  });
  return {
    method, url: testPath, path: p, params, query, body,
    headers: { 'content-type': 'application/json', authorization: '' },
  };
}

async function _runHandlers(handlers, req, res, errorHandlers) {
  let i = 0;
  async function next(err) {
    if (err) {
      for (const eh of errorHandlers) {
        if (!res._done) {
          try { await eh(err, req, res, () => {}); } catch(e) {}
        }
      }
      return;
    }
    if (i >= handlers.length || res._done) return;
    const fn = handlers[i++];
    try { await fn(req, res, next); } catch(e) { await next(e); }
  }
  await next();
}

function _createExpressApp(__console) {
  const _routes      = [];  // { method, fullPath, handlers }
  const _middlewares = [];  // fns run before every route
  const _errorMW     = [];  // fns with 4 params
  let   _listening   = false;

  function _mount(prefix, sub) {
    // Mount a Router's routes under a prefix
    if (sub && Array.isArray(sub._routes)) {
      sub._routes.forEach(r => {
        _routes.push({ method: r.method, fullPath: prefix + r.path, handlers: r.handlers });
      });
      sub._middlewares && sub._middlewares.forEach(fn => _middlewares.push(fn));
      sub._errorMW && sub._errorMW.forEach(fn => _errorMW.push(fn));
    }
  }

  const app = {
    _routes, _middlewares, _errorMW,
    use(pathOrFn, ...rest) {
      if (typeof pathOrFn === 'function') {
        // app.use(fn) — could be error handler (4 params) or regular middleware
        const fns = [pathOrFn, ...rest].filter(f => typeof f === 'function');
        fns.forEach(f => {
          if (f.length === 4) _errorMW.push(f);
          else _middlewares.push(f);
        });
      } else if (typeof pathOrFn === 'string') {
        rest.forEach(item => {
          if (item && Array.isArray(item._routes)) {
            _mount(pathOrFn === '/' ? '' : pathOrFn, item);
          } else if (typeof item === 'function') {
            if (item.length === 4) _errorMW.push(item);
            else _middlewares.push(item);
          }
        });
      }
      return app;
    },
    _addRoute(method, path, handlers) {
      const regular = handlers.filter(h => typeof h === 'function' && h.length !== 4);
      const errors  = handlers.filter(h => typeof h === 'function' && h.length === 4);
      _routes.push({ method: method.toUpperCase(), fullPath: path, handlers: regular });
      errors.forEach(e => _errorMW.push(e));
      return app;
    },
    get(p, ...h)    { return app._addRoute('GET',    p, h); },
    post(p, ...h)   { return app._addRoute('POST',   p, h); },
    put(p, ...h)    { return app._addRoute('PUT',    p, h); },
    patch(p, ...h)  { return app._addRoute('PATCH',  p, h); },
    delete(p, ...h) { return app._addRoute('DELETE', p, h); },
    listen(port, cb) {
      if (typeof cb === 'function') cb();
      if (!_listening) {
        _listening = true;
        setTimeout(() => _autoTest(_routes, _middlewares, _errorMW, __console), 0);
      }
      return { close() {} };
    },
  };
  return app;
}

function _createRouter(__console) {
  const _routes      = [];
  const _middlewares = [];
  const _errorMW     = [];
  const r = {
    _routes, _middlewares, _errorMW,
    use(pathOrFn, ...rest) {
      const fns = typeof pathOrFn === 'function'
        ? [pathOrFn, ...rest]
        : rest;
      fns.filter(f => typeof f === 'function').forEach(f => {
        if (f.length === 4) _errorMW.push(f);
        else _middlewares.push(f);
      });
      return r;
    },
    _addRoute(method, path, handlers) {
      const regular = handlers.filter(h => typeof h === 'function' && h.length !== 4);
      const errors  = handlers.filter(h => typeof h === 'function' && h.length === 4);
      _routes.push({ method: method.toUpperCase(), path, handlers: regular });
      errors.forEach(e => _errorMW.push(e));
      return r;
    },
    get(p, ...h)    { return r._addRoute('GET',    p, h); },
    post(p, ...h)   { return r._addRoute('POST',   p, h); },
    put(p, ...h)    { return r._addRoute('PUT',    p, h); },
    patch(p, ...h)  { return r._addRoute('PATCH',  p, h); },
    delete(p, ...h) { return r._addRoute('DELETE', p, h); },
  };
  return r;
}

// Sample bodies for auto-test by method
function _sampleBody(method) {
  if (method === 'GET' || method === 'DELETE') return {};
  return {
    name: 'Alice', email: 'alice@test.com',
    title: 'Test Note', content: 'Hello world',
    username: 'alice', password: 'secret',
    done: false,
  };
}

async function _autoTest(routes, middlewares, errorMW, __console) {
  if (routes.length === 0) return;
  __console.log('');
  __console.log('── Auto-testing registered routes ──');

  const seen = new Set();
  for (const route of routes) {
    const { method, fullPath, handlers } = route;
    const key = method + ':' + fullPath;
    if (seen.has(key)) continue;
    seen.add(key);

    // Replace :param placeholders with sample values
    const params = {};
    const testPath = fullPath.replace(/:([^/]+)/g, (_, name) => {
      const val = name === 'id' ? '1' : (name === 'catId' ? '10' : name === 'prodId' ? '5' : 'test');
      params[name] = val;
      return val;
    });

    const body = _sampleBody(method);
    const req  = _makeReq(method, testPath, params, body);
    const res  = _makeRes(method, testPath, __console);

    // Run global middlewares then route handlers
    const chain = [...middlewares, ...handlers];
    await _runHandlers(chain, req, res, errorMW);

    // If nothing sent a response (e.g. pure middleware), note it
    if (!res._done) {
      __console.log('[' + method + '] ' + testPath + ' → (no response sent — middleware only)');
    }
  }
}

function _expressFactory(__console) {
  function express() { return _createExpressApp(__console); }
  express.json        = () => (req, res, next) => { next && next(); };
  express.urlencoded  = () => (req, res, next) => { next && next(); };
  express.static      = (dir) => (req, res, next) => { next && next(); };
  express.Router      = () => _createRouter(__console);
  return express;
}

// ── Module mock (_mockRequire shadows any bundler require) ──────
// Named _mockRequire so Vite's bundler never sees a bare
// require('express') literal in source and tries to resolve it.
function _mockRequire(mod) {
  if (mod === 'express')            return _expressFactory(__console);
  if (mod === 'dotenv')             return { config: () => {} };
  if (mod === 'cors')               return () => (req, res, next) => next && next();
  if (mod === 'morgan')             return () => (req, res, next) => next && next();
  if (mod === 'helmet')             return () => (req, res, next) => next && next();
  if (mod === 'express-rate-limit') return () => (req, res, next) => next && next();
  if (mod === 'mssql')              return {
    Int: 'Int', NVarChar: (n) => 'NVarChar(' + n + ')',
    ConnectionPool: class {
      connect()   { return Promise.resolve(); }
      request()   { return { input() { return this; }, query() { return Promise.resolve({ recordset: [] }); } }; }
    },
  };
  if (mod === 'pg') return {
    Pool: class {
      query() { return Promise.resolve({ rows: [], rowCount: 0 }); }
    },
  };
  return {};
}

// ── CommonJS shims ─────────────────────────────────────────────
const module  = { exports: {} };
const exports = module.exports;
`
}

// ─────────────────────────────────────────────────────────────────
//  Main Simulator component
// ─────────────────────────────────────────────────────────────────
export default function Simulator({ initialCode = '', theme = 'dark' }) {
  const [code, setCode] = useState(initialCode)
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
      const runtime = buildRuntime()
      // Replace require( with _mockRequire( so Vite never sees bare require()
      // in source AND so the browser's own require (if any) is never called.
      const safeCode = code.replace(/\brequire\s*\(/g, '_mockRequire(')
      const wrapped = `
        ${runtime}
        const console = __console;
        const process = {
          env: { NODE_ENV: 'development', PORT: '3000' },
          uptime: () => 12345,
        };
        try {
          ${safeCode}
        } catch(__err) {
          __console.error('Runtime error: ' + __err.message);
        }
      `
      const AsyncFn = Object.getPrototypeOf(async function(){}).constructor
      await new AsyncFn('__console', wrapped)(capturedConsole)
      await new Promise(r => setTimeout(r, 700))
      if (logs.length === 0) logs.push({ type: 'info', args: ['✓ Code ran with no console output'] })
    } catch (err) {
      logs.push({ type: 'error', args: ['Execution error: ' + err.message] })
    }

    setOutput(logs.map((l, i) => ({
      id: i, type: l.type,
      text: l.args.map(a => typeof a === 'string' ? a : JSON.stringify(a, null, 2)).join(' ')
    })))
    setRunning(false)
    setTimeout(() => outputRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }, [code])

  const isDark = theme === 'dark'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      borderRadius: 12, overflow: 'hidden',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
      background: isDark ? '#0d1117' : '#f8fafc',
    }}>
      <Toolbar
        isDark={isDark} running={running}
        onReset={() => setCode(initialCode)}
        onRun={runCode}
        label="simulator.js"
        accentColor="#f59e0b"
      />
      <Editor
        height="340px"
        defaultLanguage="javascript"
        value={code}
        onChange={v => setCode(v || '')}
        theme={isDark ? 'vs-dark' : 'light'}
        options={EDITOR_OPTIONS}
        loading={<EditorLoading isDark={isDark} />}
      />
      <OutputPanel output={output} running={running} isDark={isDark} ref={outputRef} height={180} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
//  Challenge Simulator (has solution toggle)
// ─────────────────────────────────────────────────────────────────
export function ChallengeSimulator({ starterCode, solutionCode, theme }) {
  const [code, setCode] = useState(starterCode)
  const [showSolution, setShowSolution] = useState(false)
  const [output, setOutput] = useState([])
  const [running, setRunning] = useState(false)
  const outputRef = useRef(null)
  const isDark = theme === 'dark'

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
      const runtime = buildRuntime()
      const safeCode = code.replace(/\brequire\s*\(/g, '_mockRequire(')
      const wrapped = `
        ${runtime}
        const console = __console;
        const process = { env: { NODE_ENV: 'development' }, uptime: () => 12345 };
        try { ${safeCode} } catch(__err) { __console.error('Runtime error: ' + __err.message); }
      `
      const AsyncFn = Object.getPrototypeOf(async function(){}).constructor
      await new AsyncFn('__console', wrapped)(capturedConsole)
      await new Promise(r => setTimeout(r, 700))
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

  const toggleSolution = () => {
    const next = !showSolution
    setShowSolution(next)
    setCode(next ? solutionCode : starterCode)
  }

  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      border: `1px solid ${isDark ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.3)'}`,
      background: isDark ? '#0d1117' : '#f8fafc',
    }}>
      <Toolbar
        isDark={isDark} running={running}
        onReset={() => { setCode(starterCode); setShowSolution(false) }}
        onRun={runCode}
        label="challenge.js"
        accentColor="#f59e0b"
        extra={
          <button onClick={toggleSolution} style={{
            padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
            border: `1px solid ${isDark ? 'rgba(167,139,250,0.4)' : 'rgba(109,40,217,0.3)'}`,
            background: 'transparent',
            color: isDark ? '#a78bfa' : '#7c3aed',
            fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
          }}>
            {showSolution ? 'My Code' : 'Solution'}
          </button>
        }
      />
      <Editor
        height="320px"
        defaultLanguage="javascript"
        value={code}
        onChange={v => setCode(v || '')}
        theme={isDark ? 'vs-dark' : 'light'}
        options={EDITOR_OPTIONS}
        loading={<EditorLoading isDark={isDark} />}
      />
      <OutputPanel output={output} running={running} isDark={isDark} ref={outputRef} height={160} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
//  Shared sub-components
// ─────────────────────────────────────────────────────────────────
function Toolbar({ isDark, running, onReset, onRun, label, accentColor, extra }) {
  return (
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
      <span style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        color: accentColor || (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)'),
        letterSpacing: '0.05em',
      }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {extra}
        <button onClick={onReset} style={{
          padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'}`,
          background: 'transparent',
          color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
          fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
        }}>
          Reset
        </button>
        <button onClick={onRun} disabled={running} style={{
          padding: '4px 16px', borderRadius: 6, border: 'none', cursor: running ? 'not-allowed' : 'pointer',
          background: running ? '#444' : 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: '#000', fontSize: 11, fontWeight: 700,
          fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em',
        }}>
          {running ? '▶ Running…' : '▶ Run'}
        </button>
      </div>
    </div>
  )
}

const OutputPanel = forwardRef(({ output, running, isDark, height }, ref) => (
  <div style={{
    borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
    background: isDark ? '#010409' : '#f1f5f9',
  }}>
    <div style={{
      padding: '6px 14px', fontSize: 10,
      fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
      color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)',
      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}`,
    }}>Console Output</div>
    <div ref={ref} style={{
      height: height || 180, overflowY: 'auto',
      padding: '10px 14px',
      fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.65,
    }}>
      {running && <div style={{ color: '#f59e0b' }}>⟳ Executing…</div>}
      {!running && output.length === 0 && (
        <div style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)' }}>
          Press ▶ Run to execute. Output appears here.
        </div>
      )}
      {output.map(line => (
        <div key={line.id} style={{
          color: line.type === 'error' ? '#f87171'
               : line.type === 'warn'  ? '#fbbf24'
               : line.type === 'info'  ? '#60a5fa'
               : isDark ? '#e2e8f0' : '#1e293b',
          whiteSpace: 'pre-wrap', wordBreak: 'break-all',
          borderLeft: line.type === 'error' ? '2px solid #f87171'
                    : line.type === 'warn'  ? '2px solid #fbbf24'
                    : '2px solid transparent',
          paddingLeft: 8, marginBottom: 2,
        }}>
          {line.type === 'error' && '✖ '}
          {line.type === 'warn'  && '⚠ '}
          {line.text}
        </div>
      ))}
    </div>
  </div>
))

function EditorLoading({ isDark }) {
  return (
    <div style={{
      height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: isDark ? '#0d1117' : '#f8fafc',
      color: isDark ? '#666' : '#999',
      fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
    }}>
      Loading editor…
    </div>
  )
}
