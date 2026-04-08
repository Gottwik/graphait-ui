'use client'

import { useState, useEffect } from 'react'

interface ContextSections {
  ask: string
  recommend: string
}

const mono: React.CSSProperties = { fontFamily: 'var(--font-dm-mono)' }

const textareaStyle: React.CSSProperties = {
  ...mono,
  width: '100%',
  background: '#0e0e0e',
  border: '1px solid rgba(180,148,80,0.2)',
  borderRadius: '2px',
  padding: '16px',
  color: '#f0ead8',
  fontSize: '12px',
  lineHeight: 1.7,
  outline: 'none',
  resize: 'vertical',
}

function SectionEditor({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div>
        <p style={{ ...mono, fontSize: '10px', color: '#b49450', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '2px' }}>
          {label}
        </p>
        <p style={{ ...mono, fontSize: '10px', color: '#444', lineHeight: 1.5 }}>
          {description}
        </p>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={16}
        style={textareaStyle}
        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(180,148,80,0.5)' }}
        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(180,148,80,0.2)' }}
      />
    </div>
  )
}

export default function ContextEditor({
  endpoint = '/api/admin/context',
  defaultAsk = '',
  defaultRecommend = '',
}: {
  endpoint?: string
  defaultAsk?: string
  defaultRecommend?: string
}) {
  const [sections, setSections] = useState<ContextSections>({ ask: defaultAsk, recommend: defaultRecommend })
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveLabel, setSaveLabel] = useState('Save changes')

  useEffect(() => {
    fetch(endpoint)
      .then(r => r.json())
      .then(({ sections: s, updatedAt }) => {
        if (s) setSections(s)
        setSavedAt(updatedAt)
      })
      .catch(() => {})
  }, [endpoint])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections }),
      })
      setSaveLabel('Saved ✓')
      setSavedAt(new Date().toISOString())
      setTimeout(() => setSaveLabel('Save changes'), 2000)
    } catch {
      setSaveLabel('Error — try again')
      setTimeout(() => setSaveLabel('Save changes'), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <SectionEditor
        label="Conversation prompt"
        description="Claude reads this before generating each question. Edit the persona, rules, and any neighborhood intel."
        value={sections.ask}
        onChange={v => setSections(s => ({ ...s, ask: v }))}
      />
      <SectionEditor
        label="Recommendation prompt"
        description="Claude reads this when generating the final neighborhood recommendation."
        value={sections.recommend}
        onChange={v => setSections(s => ({ ...s, recommend: v }))}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {savedAt && (
          <p style={{ ...mono, fontSize: '10px', color: '#444' }}>
            last saved {new Date(savedAt).toLocaleString()}
          </p>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            ...mono,
            background: '#b49450',
            color: '#0e0e0e',
            border: 'none',
            borderRadius: '2px',
            padding: '8px 20px',
            fontSize: '10px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
            marginLeft: 'auto',
          }}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  )
}
