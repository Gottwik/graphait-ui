'use client'

import { useState, useRef, useEffect } from 'react'
import type { GraphJSON } from '@openclaw/graph-engine'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  graph: GraphJSON
  onGraphChange: (g: GraphJSON) => void
  endpoint?: string
}

const mono: React.CSSProperties = { fontFamily: 'var(--font-dm-mono)' }

export default function GraphChat({ graph, onGraphChange, endpoint = '/api/admin/graph-chat' }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const scrollRef               = useRef<HTMLDivElement>(null)
  const inputRef                = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, graph, history: messages.slice(-8) }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { reply: string; graph?: GraphJSON; error?: string }

      if (data.error) throw new Error(data.error)

      const assistantMsg: ChatMessage = { role: 'assistant', content: data.reply }
      setMessages([...next, assistantMsg])

      if (data.graph) onGraphChange(data.graph)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setMessages([...next, { role: 'assistant', content: '(error — see below)' }])
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', borderLeft: '1px solid rgba(180,148,80,0.15)',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px', borderBottom: '1px solid rgba(180,148,80,0.12)',
        flexShrink: 0,
      }}>
        <p style={{ ...mono, fontSize: '10px', color: 'rgba(180,148,80,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          AI Graph Editor
        </p>
        <p style={{ ...mono, fontSize: '10px', color: '#333', marginTop: '2px' }}>
          Describe changes in plain English
        </p>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: 'auto', padding: '12px 14px',
          display: 'flex', flexDirection: 'column', gap: '10px',
        }}
      >
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
            {[
              'Add a question about gym access',
              'Connect Budget to Commute',
              'Add a comment node saying "Almost there!"',
              'Change the Lifestyle question to multi-choice',
            ].map(hint => (
              <button
                key={hint}
                onClick={() => { setInput(hint); inputRef.current?.focus() }}
                style={{
                  ...mono, fontSize: '11px', color: 'rgba(180,148,80,0.5)',
                  background: 'transparent', border: '1px solid rgba(180,148,80,0.12)',
                  padding: '7px 10px', cursor: 'pointer', textAlign: 'left',
                  lineHeight: 1.4,
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(180,148,80,0.35)'
                  e.currentTarget.style.color = 'rgba(180,148,80,0.85)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(180,148,80,0.12)'
                  e.currentTarget.style.color = 'rgba(180,148,80,0.5)'
                }}
              >
                {hint}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <p style={{
              ...mono, fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase',
              color: m.role === 'user' ? 'rgba(180,148,80,0.5)' : '#333',
            }}>
              {m.role === 'user' ? 'you' : 'claude'}
            </p>
            <p style={{
              ...mono, fontSize: '12px', lineHeight: 1.6,
              color: m.role === 'user' ? 'rgba(240,234,216,0.8)' : 'rgba(240,234,216,0.5)',
              whiteSpace: 'pre-wrap',
            }}>
              {m.content}
            </p>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <p style={{ ...mono, fontSize: '9px', color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase' }}>claude</p>
            <p style={{ ...mono, fontSize: '12px', color: '#333', animation: 'chatPulse 1.2s ease-in-out infinite' }}>
              thinking...
            </p>
          </div>
        )}

        {error && (
          <p style={{ ...mono, fontSize: '11px', color: '#c04040' }}>{error}</p>
        )}
      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid rgba(180,148,80,0.12)',
        padding: '10px 12px', flexShrink: 0,
        display: 'flex', gap: '8px', alignItems: 'flex-end',
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Describe a change..."
          rows={2}
          disabled={loading}
          style={{
            ...mono, flex: 1, fontSize: '12px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(180,148,80,0.2)',
            color: '#f0ead8', padding: '8px 10px',
            outline: 'none', resize: 'none', lineHeight: 1.5,
            opacity: loading ? 0.5 : 1,
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(180,148,80,0.5)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(180,148,80,0.2)' }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            ...mono, fontSize: '11px', letterSpacing: '0.08em',
            padding: '8px 12px', cursor: loading || !input.trim() ? 'default' : 'pointer',
            background: 'rgba(180,148,80,0.08)',
            border: '1px solid rgba(180,148,80,0.3)',
            color: loading || !input.trim() ? 'rgba(180,148,80,0.25)' : '#b49450',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          send →
        </button>
      </div>

      <style>{`
        @keyframes chatPulse {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
