'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { GraphJSON, GraphNode, GraphEdge, NodeType, QuestionType } from '@openclaw/graph-engine'
import { normalizeGraphPorts, slugify } from '@openclaw/graph-engine'
import GraphChat from './GraphChat'

export interface GraphEditorEndpoints {
  graph: string
  graphChat: string
}

const DEFAULT_GRAPH_ENDPOINTS: GraphEditorEndpoints = {
  graph:     '/api/admin/graph',
  graphChat: '/api/admin/graph-chat',
}

// ─── Layout constants ────────────────────────────────────────────────────────
const NODE_W    = 210
const HEADER_H  = 72   // must be large enough for type label + title + note line
const ANSWER_H  = 30
const PORT_R    = 5
const PORT_SNAP = 18
const FOOT_H    = 10
const PANEL_W   = 240

function nodeHeight(node: GraphNode) {
  const ports = node.outputPorts ?? []
  const rows = node.type === 'question' && ports.length > 0 ? ports.length : 0
  return HEADER_H + rows * ANSWER_H + FOOT_H
}

function inPortY(node: GraphNode)  { return node.y + HEADER_H / 2 }
function outPortY(node: GraphNode, portId?: string) {
  const ports = node.outputPorts ?? []
  if (portId) {
    const idx = ports.findIndex(p => p.id === portId)
    if (idx >= 0) return node.y + HEADER_H + idx * ANSWER_H + ANSWER_H / 2
  }
  return node.y + nodeHeight(node) / 2
}

// ─── Default graph ───────────────────────────────────────────────────────────
const DEFAULT_GRAPH: GraphJSON = {
  nodes: [
    { id: 'start',     x: 40,  y: 180, title: 'Opening',     type: 'question', qtype: 'text', note: "What's pulling you to NYC?",        options: [], outputPorts: [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }, { id: 'other', label: 'Other' }] },
    { id: 'budget',    x: 300, y: 60,  title: 'Budget',       type: 'question', qtype: 'text', note: 'Monthly rent range?',               options: ['Under $2k', '$2–3k', '$3–4k', '$4k+'], outputPorts: [{ id: 'under_2k', label: 'Under $2k' }, { id: '2_3k', label: '$2–3k' }, { id: '3_4k', label: '$3–4k' }, { id: '4k', label: '$4k+' }] },
    { id: 'commute',   x: 300, y: 280, title: 'Commute',      type: 'question', qtype: 'text', note: 'How do you get around?',             options: ['Subway', 'Walk / bike', 'Car', 'WFH'], outputPorts: [{ id: 'subway', label: 'Subway' }, { id: 'walk_bike', label: 'Walk / bike' }, { id: 'car', label: 'Car' }, { id: 'wfh', label: 'WFH' }] },
    { id: 'lifestyle', x: 300, y: 460, title: 'Lifestyle',    type: 'question', qtype: 'text', note: 'Vibe and scene preferences?',       options: [], outputPorts: [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }, { id: 'other', label: 'Other' }] },
    { id: 'dealbreak', x: 580, y: 220, title: 'Deal-breaker', type: 'question', qtype: 'text', note: "One thing you can't live without?", options: [], outputPorts: [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }, { id: 'other', label: 'Other' }] },
    { id: 'end',       x: 820, y: 270, title: 'Recommend',    type: 'end' },
  ],
  edges: [
    { from: 'start',     fromPortId: 'yes',   to: 'budget'    },
    { from: 'start',     fromPortId: 'no',    to: 'commute'   },
    { from: 'start',     fromPortId: 'other', to: 'lifestyle' },
    { from: 'budget',    fromPortId: 'under_2k', to: 'dealbreak' },
    { from: 'budget',    fromPortId: '2_3k',     to: 'dealbreak' },
    { from: 'budget',    fromPortId: '3_4k',     to: 'dealbreak' },
    { from: 'budget',    fromPortId: '4k',        to: 'dealbreak' },
    { from: 'commute',   fromPortId: 'subway',    to: 'dealbreak' },
    { from: 'commute',   fromPortId: 'walk_bike', to: 'dealbreak' },
    { from: 'commute',   fromPortId: 'car',       to: 'dealbreak' },
    { from: 'commute',   fromPortId: 'wfh',       to: 'dealbreak' },
    { from: 'lifestyle', fromPortId: 'other', to: 'dealbreak' },
    { from: 'dealbreak', fromPortId: 'other', to: 'end'       },
  ],
}

const PALETTE: { label: string; type: NodeType; qtype?: QuestionType }[] = [
  { label: 'Start',           type: 'start'                   },
  { label: 'Question',        type: 'question', qtype: 'text' },
  { label: 'Comment',         type: 'comment'                 },
  { label: 'End / Recommend', type: 'end'                     },
]

function generateId() { return Math.random().toString(36).slice(2, 8) }

// ─── Drag-to-reorder list ─────────────────────────────────────────────────────
function DragList<T>({
  items,
  renderItem,
  onReorder,
}: {
  items: T[]
  renderItem: (item: T, i: number) => React.ReactNode
  onReorder: (next: T[]) => void
}) {
  const dragIdx = useRef<number | null>(null)

  const onDragStart = (i: number) => { dragIdx.current = i }
  const onDragEnter = (i: number) => {
    if (dragIdx.current === null || dragIdx.current === i) return
    const next = [...items]
    const [moved] = next.splice(dragIdx.current, 1)
    next.splice(i, 0, moved)
    dragIdx.current = i
    onReorder(next)
  }
  const onDragEnd = () => { dragIdx.current = null }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {items.map((item, i) => (
        <div
          key={i}
          draggable
          onDragStart={() => onDragStart(i)}
          onDragEnter={() => onDragEnter(i)}
          onDragEnd={onDragEnd}
          onDragOver={e => e.preventDefault()}
          style={{ display: 'flex', gap: '4px', alignItems: 'center' }}
        >
          <span style={{
            color: 'rgba(180,148,80,0.35)', fontSize: '12px',
            cursor: 'grab', flexShrink: 0, paddingRight: '2px',
            userSelect: 'none',
          }}>⠿</span>
          {renderItem(item, i)}
        </div>
      ))}
    </div>
  )
}

function getNodeColor(type: NodeType) {
  if (type === 'end')     return 'rgba(180,148,80,0.14)'
  if (type === 'start')   return 'rgba(80,180,120,0.10)'
  if (type === 'comment') return 'rgba(100,140,220,0.10)'
  return 'rgba(255,255,255,0.03)'
}
function getNodeBorder(type: NodeType, sel: boolean) {
  const op = sel ? '1' : '0.3'
  return `1px solid rgba(180,148,80,${op})`
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function GraphEditor({ endpoints: endpointOverrides }: { endpoints?: Partial<GraphEditorEndpoints> }) {
  const ep = { ...DEFAULT_GRAPH_ENDPOINTS, ...endpointOverrides }

  const [graph, setGraph]           = useState<GraphJSON>(DEFAULT_GRAPH)
  const [selected, setSelected]     = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [connecting, setConnecting] = useState<{
    fromNodeId: string; fromPortId?: string
    fromX: number; fromY: number; curX: number; curY: number
  } | null>(null)
  const [paletteDrag, setPaletteDrag] = useState<{
    type: NodeType; qtype?: QuestionType; x: number; y: number
  } | null>(null)

  const [jsonText, setJsonText]     = useState(() => JSON.stringify(DEFAULT_GRAPH, null, 2))
  const [jsonError, setJsonError]   = useState<string | null>(null)
  const isEditingJsonRef            = useRef(false)
  const [showChat, setShowChat]     = useState(false)

  const [zoom, setZoom] = useState(1)
  const [pan,  setPan]  = useState({ x: 40, y: 40 })

  const canvasRef      = useRef<HTMLDivElement>(null)
  const dragRef        = useRef<{ nodeId: string; startX: number; startY: number; origX: number; origY: number } | null>(null)
  const latestGraphRef = useRef<GraphJSON>(DEFAULT_GRAPH)
  const saveTimer      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const zoomRef        = useRef(1)
  const panRef         = useRef({ x: 40, y: 40 })

  // Keep refs in sync with state so event handlers always see current values
  useEffect(() => { zoomRef.current = zoom }, [zoom])
  useEffect(() => { panRef.current  = pan  }, [pan])

  // Sync graph → textarea (skip while user is editing the textarea)
  useEffect(() => {
    if (!isEditingJsonRef.current) {
      setJsonText(JSON.stringify(graph, null, 2))
    }
  }, [graph])

  // World coords from viewport coords
  const vpToCanvas = useCallback((vx: number, vy: number) => {
    const r = canvasRef.current
    if (!r) return { x: vx, y: vy }
    const rect = r.getBoundingClientRect()
    return {
      x: (vx - rect.left - panRef.current.x) / zoomRef.current,
      y: (vy - rect.top  - panRef.current.y) / zoomRef.current,
    }
  }, [])

  const adjustZoom = useCallback((factor: number, cx?: number, cy?: number) => {
    const r = canvasRef.current
    const rect = r?.getBoundingClientRect()
    const ox = cx ?? (rect ? rect.width  / 2 : 0)
    const oy = cy ?? (rect ? rect.height / 2 : 0)
    setZoom(prev => {
      const next = Math.min(3, Math.max(0.15, prev * factor))
      const scale = next / prev
      setPan(p => ({ x: ox - (ox - p.x) * scale, y: oy - (oy - p.y) * scale }))
      zoomRef.current = next
      return next
    })
  }, [])

  const resetView = useCallback(() => {
    setZoom(1); setPan({ x: 40, y: 40 })
    zoomRef.current = 1; panRef.current = { x: 40, y: 40 }
  }, [])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const r = canvasRef.current!
    const rect = r.getBoundingClientRect()
    adjustZoom(e.deltaY < 0 ? 1.1 : 1 / 1.1, e.clientX - rect.left, e.clientY - rect.top)
  }, [adjustZoom])

  // ── Load ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(ep.graph)
      .then(r => r.json())
      .then(({ graph: g }) => {
        if (g?.nodes?.length) {
          const normalized = normalizeGraphPorts({
            ...g,
            nodes: g.nodes.map((n: GraphNode) => ({
              ...n,
              ...(n.type === 'question' ? {
                options: n.options ?? [],
                qtype: (['reorder', 'multi'].includes(n.qtype ?? '') ? n.qtype : 'text') as QuestionType,
              } : {}),
            })),
          })
          setGraph(normalized)
          latestGraphRef.current = normalized
        }
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Save ────────────────────────────────────────────────────────────────
  const scheduleSave = useCallback((g: GraphJSON) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaveStatus('saving')
      await fetch(ep.graph, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ graph: g }),
      }).catch(() => {})
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 800)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateGraph = useCallback((g: GraphJSON) => {
    latestGraphRef.current = g
    setGraph(g)
    scheduleSave(g)
  }, [scheduleSave])

  // ── Node drag ────────────────────────────────────────────────────────────
  const onNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if ((e.target as HTMLElement).dataset.port) return
    e.stopPropagation()
    setSelected(nodeId)
    const node = latestGraphRef.current.nodes.find(n => n.id === nodeId)!
    dragRef.current = { nodeId, startX: e.clientX, startY: e.clientY, origX: node.x, origY: node.y }

    const onMove = (me: MouseEvent) => {
      if (!dragRef.current) return
      const { nodeId: id, startX, startY, origX, origY } = dragRef.current
      const dx = (me.clientX - startX) / zoomRef.current
      const dy = (me.clientY - startY) / zoomRef.current
      setGraph(prev => {
        const next = { ...prev, nodes: prev.nodes.map(n =>
          n.id === id ? { ...n, x: Math.max(0, origX + dx), y: Math.max(0, origY + dy) } : n
        )}
        latestGraphRef.current = next
        return next
      })
    }
    const onUp = () => {
      dragRef.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      scheduleSave(latestGraphRef.current)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // ── Port drag ────────────────────────────────────────────────────────────
  const onPortMouseDown = (e: React.MouseEvent, nodeId: string, portId?: string) => {
    e.stopPropagation()
    e.preventDefault()
    const node = latestGraphRef.current.nodes.find(n => n.id === nodeId)!
    const fromX = node.x + NODE_W
    const portIndex = portId
      ? (node.outputPorts ?? []).findIndex(p => p.id === portId)
      : -1
    const fromY = portIndex >= 0
      ? node.y + HEADER_H + portIndex * ANSWER_H + ANSWER_H / 2
      : node.y + nodeHeight(node) / 2
    const { x: curX, y: curY } = vpToCanvas(e.clientX, e.clientY)
    setConnecting({ fromNodeId: nodeId, fromPortId: portId, fromX, fromY, curX, curY })

    const onMove = (me: MouseEvent) => {
      const { x, y } = vpToCanvas(me.clientX, me.clientY)
      setConnecting(prev => prev ? { ...prev, curX: x, curY: y } : null)
    }
    const onUp = (me: MouseEvent) => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      const { x: mx, y: my } = vpToCanvas(me.clientX, me.clientY)
      const g = latestGraphRef.current
      let targetId: string | null = null
      for (const n of g.nodes) {
        if (n.id === nodeId) continue
        const ix = n.x, iy = inPortY(n)
        if (Math.sqrt((ix - mx) ** 2 + (iy - my) ** 2) < PORT_SNAP) { targetId = n.id; break }
      }
      if (targetId) {
        const newEdge: GraphEdge = { from: nodeId, fromPortId: portId, to: targetId }
        // Each port can have at most one outgoing edge — remove any existing one first
        const edges = g.edges.filter(e => !(e.from === nodeId && e.fromPortId === portId))
        updateGraph({ ...g, edges: [...edges, newEdge] })
      }
      setConnecting(null)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // ── Palette drag ─────────────────────────────────────────────────────────
  const onPaletteMouseDown = (e: React.MouseEvent, type: NodeType, qtype?: QuestionType) => {
    e.preventDefault()
    setPaletteDrag({ type, qtype, x: e.clientX, y: e.clientY })

    const onMove = (me: MouseEvent) => {
      setPaletteDrag(prev => prev ? { ...prev, x: me.clientX, y: me.clientY } : null)
    }
    const onUp = (me: MouseEvent) => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      const canvas = canvasRef.current
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        if (me.clientX >= rect.left && me.clientX <= rect.right &&
            me.clientY >= rect.top  && me.clientY <= rect.bottom) {
          const { x, y } = vpToCanvas(me.clientX, me.clientY)
          const id = generateId()
          const initialOptions: string[] = []
          const initialPorts = type === 'question'
            ? [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }, { id: 'other', label: 'Other / unclear' }]
            : undefined
          const newNode: GraphNode = {
            id, x: Math.max(0, x - NODE_W / 2), y: Math.max(0, y - HEADER_H / 2),
            title: type === 'end' ? 'Recommend' : type === 'start' ? 'Start' : type === 'comment' ? 'Comment' : 'New question',
            type, qtype, options: initialOptions,
            outputPorts: initialPorts,
          }
          updateGraph({ ...latestGraphRef.current, nodes: [...latestGraphRef.current.nodes, newNode] })
          setSelected(id)
        }
      }
      setPaletteDrag(null)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // ── Node property helpers ────────────────────────────────────────────────
  const updateSelectedNode = (patch: Partial<GraphNode>) => {
    if (!selected) return
    const g = latestGraphRef.current
    const node = g.nodes.find(n => n.id === selected)
    if (!node) return
    const updated = { ...node, ...patch }
    updateGraph({ ...g, nodes: g.nodes.map(n => n.id === selected ? updated : n) })
  }

  const deleteSelected = () => {
    if (!selected) return
    const g = latestGraphRef.current
    updateGraph({
      nodes: g.nodes.filter(n => n.id !== selected),
      edges: g.edges.filter(e => e.from !== selected && e.to !== selected),
    })
    setSelected(null)
  }

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonText) as GraphJSON
      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) throw new Error('Missing nodes or edges array')
      setJsonError(null)
      isEditingJsonRef.current = false
      updateGraph(parsed)
      setSelected(null)
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : 'Invalid JSON')
    }
  }

  const deleteEdge = (edge: GraphEdge) => {
    const g = latestGraphRef.current
    updateGraph({ ...g, edges: g.edges.filter(e =>
      !(e.from === edge.from && e.fromPortId === edge.fromPortId && e.to === edge.to)
    )})
  }

  // ── Canvas pan (background drag) ─────────────────────────────────────────
  const onCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    const startX = e.clientX, startY = e.clientY
    const origPan = { ...panRef.current }
    let moved = false
    const onMove = (me: MouseEvent) => {
      const dx = me.clientX - startX, dy = me.clientY - startY
      if (!moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) moved = true
      panRef.current = { x: origPan.x + dx, y: origPan.y + dy }
      setPan({ ...panRef.current })
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      if (!moved) setSelected(null)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [])

  // ── Derived ──────────────────────────────────────────────────────────────
  const selectedNode = graph.nodes.find(n => n.id === selected) ?? null
  const maxX = Math.max(1200, ...graph.nodes.map(n => n.x + NODE_W + 200))
  const maxY = Math.max(800,  ...graph.nodes.map(n => n.y + nodeHeight(n) + 200))

  const edgePaths = graph.edges.map(edge => {
    const from = graph.nodes.find(n => n.id === edge.from)
    const to   = graph.nodes.find(n => n.id === edge.to)
    if (!from || !to) return null
    const x1 = from.x + NODE_W, y1 = outPortY(from, edge.fromPortId)
    const x2 = to.x,             y2 = inPortY(to)
    const cx = (x1 + x2) / 2
    return { edge, path: `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}` }
  }).filter(Boolean) as { edge: GraphEdge; path: string }[]

  // Floating panel — in viewport coords (outside transform)
  const panelViewportPos = selectedNode ? (() => {
    const canvasW = canvasRef.current?.clientWidth ?? 800
    const rightOfNodeVP = selectedNode.x * zoom + pan.x + NODE_W * zoom + 14
    const leftOfNodeVP  = selectedNode.x * zoom + pan.x - PANEL_W - 14
    const x = rightOfNodeVP + PANEL_W < canvasW ? rightOfNodeVP : leftOfNodeVP
    return { x: Math.max(4, x), y: Math.max(4, selectedNode.y * zoom + pan.y) }
  })() : null

  // ── Styles ───────────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(180,148,80,0.25)', borderRadius: '2px',
    padding: '5px 8px', color: '#ffffff', fontFamily: 'var(--font-dm-mono)',
    fontSize: '12px', outline: 'none',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '4px',
    fontFamily: 'var(--font-dm-mono)', fontSize: '10px',
    color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em',
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', gap: '0', width: '100%', height: '100%' }}>

    {/* ── Left column: canvas + JSON + palette ── */}
    <div className="flex flex-col gap-3" style={{ flex: 1, minWidth: 0 }}>

      {/* Canvas */}
      <div
        ref={canvasRef}
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          overflow: 'hidden',
          background: '#070707',
          border: '1px solid rgba(180,148,80,0.15)',
          backgroundImage: 'radial-gradient(rgba(180,148,80,0.04) 1px, transparent 1px)',
          backgroundSize: `${28 * zoom}px ${28 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          cursor: connecting ? 'crosshair' : 'grab',
        }}
        onMouseDown={onCanvasMouseDown}
        onWheel={onWheel}
      >
        {/* ── Transformed world content ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0,
          transformOrigin: '0 0',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: maxX, height: maxY,
        }}>
          {/* SVG edges */}
          <svg
            style={{ position: 'absolute', top: 0, left: 0, width: maxX, height: maxY, overflow: 'visible', pointerEvents: 'none' }}
          >
            <defs>
              <marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <path d="M0,0 L0,7 L7,3.5 z" fill="rgba(180,148,80,0.6)" />
              </marker>
            </defs>
            {edgePaths.map(({ edge, path }, i) => (
              <g key={i}>
                <path d={path} fill="none" stroke="rgba(180,148,80,0.35)" strokeWidth="1.5" markerEnd="url(#arr)" />
                <path d={path} fill="none" stroke="transparent" strokeWidth="12"
                  style={{ cursor: 'pointer', pointerEvents: 'all' }}
                  onClick={(e) => { e.stopPropagation(); deleteEdge(edge) }}
                />
              </g>
            ))}
            {connecting && (() => {
              const cx = (connecting.fromX + connecting.curX) / 2
              const p = `M${connecting.fromX},${connecting.fromY} C${cx},${connecting.fromY} ${cx},${connecting.curY} ${connecting.curX},${connecting.curY}`
              return <path d={p} fill="none" stroke="rgba(180,148,80,0.7)" strokeWidth="1.5" strokeDasharray="5,4" />
            })()}
          </svg>

          {/* Nodes */}
          {(() => {
            // Build set of connected ports: "nodeId:portId" (or "nodeId:" for unlabeled ports)
            const connectedPorts = new Set(
              graph.edges.map(e => `${e.from}:${e.fromPortId ?? ''}`)
            )
            return graph.nodes.map(node => {
            const h = nodeHeight(node)

            return (
              <div
                key={node.id}
                onMouseDown={(e) => onNodeMouseDown(e, node.id)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute', left: node.x, top: node.y,
                  width: NODE_W, height: h,
                  background: getNodeColor(node.type),
                  border: getNodeBorder(node.type, selected === node.id),
                  cursor: 'grab', userSelect: 'none',
                }}
              >
                {/* Input port — not shown on start nodes */}
                {node.type !== 'start' && (
                  <div data-port="in" style={{
                    position: 'absolute', left: -PORT_R - 1, top: HEADER_H / 2 - PORT_R,
                    width: PORT_R * 2, height: PORT_R * 2, borderRadius: '50%',
                    background: '#111', border: '2px solid rgba(180,148,80,0.6)', cursor: 'default',
                  }} />
                )}

                {/* Header — constrained to HEADER_H so port-row Y offsets stay in sync with SVG */}
                <div style={{ padding: '8px 12px 6px', height: HEADER_H, overflow: 'hidden', boxSizing: 'border-box' }}>
                  <p style={{ fontSize: '10px', fontFamily: 'var(--font-dm-mono)', color: 'rgba(180,148,80,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '3px' }}>
                    {node.type}{node.qtype && node.qtype !== 'text' ? ` · ${node.qtype}` : ''}
                  </p>
                  <p style={{ fontSize: '12px', fontFamily: 'var(--font-dm-mono)', color: '#ffffff', lineHeight: 1.2, fontWeight: 500 }}>
                    {node.title}
                  </p>
                  {node.type === 'comment' && node.text && (
                    <p style={{ fontSize: '10px', fontFamily: 'var(--font-dm-mono)', color: 'rgba(180,210,255,0.5)', marginTop: '2px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic' }}>
                      &ldquo;{node.text}&rdquo;
                    </p>
                  )}
                  {node.type !== 'comment' && node.note && (
                    <p style={{ fontSize: '10px', fontFamily: 'var(--font-dm-mono)', color: 'rgba(255,255,255,0.35)', marginTop: '2px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {node.note}
                    </p>
                  )}
                </div>

                {/* Start node — single unlabeled output connector */}
                {node.type === 'start' && (() => {
                  const connected = connectedPorts.has(`${node.id}:`)
                  return (
                    <div data-port="out" onMouseDown={(e) => onPortMouseDown(e, node.id, undefined)} style={{
                      position: 'absolute', right: -PORT_R - 1, top: HEADER_H / 2 - PORT_R,
                      width: PORT_R * 2, height: PORT_R * 2, borderRadius: '50%',
                      background: connected ? 'rgba(80,180,120,0.8)' : 'rgba(220,60,60,0.85)',
                      border: `2px solid ${connected ? 'rgba(80,180,120,0.5)' : 'rgba(220,60,60,0.5)'}`,
                      cursor: 'crosshair', boxShadow: `0 0 6px ${connected ? 'rgba(80,180,120,0.4)' : 'rgba(220,60,60,0.4)'}`,
                    }} />
                  )
                })()}

                {/* Comment node — single unlabeled output connector */}
                {node.type === 'comment' && (() => {
                  const connected = connectedPorts.has(`${node.id}:`)
                  return (
                    <div data-port="out" onMouseDown={(e) => onPortMouseDown(e, node.id, undefined)} style={{
                      position: 'absolute', right: -PORT_R - 1, top: HEADER_H / 2 - PORT_R,
                      width: PORT_R * 2, height: PORT_R * 2, borderRadius: '50%',
                      background: connected ? 'rgba(100,140,220,0.8)' : 'rgba(220,60,60,0.85)',
                      border: `2px solid ${connected ? 'rgba(100,140,220,0.5)' : 'rgba(220,60,60,0.5)'}`,
                      cursor: 'crosshair', boxShadow: `0 0 6px ${connected ? 'rgba(100,140,220,0.4)' : 'rgba(220,60,60,0.4)'}`,
                    }} />
                  )
                })()}

                {/* Port rows — shown for all question nodes with outputPorts */}
                {node.type === 'question' && (node.outputPorts ?? []).map((port, i) => {
                  const connected = connectedPorts.has(`${node.id}:${port.id}`)
                  return (
                  <div key={port.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 10px 0 12px', height: ANSWER_H,
                    borderBottom: i < (node.outputPorts ?? []).length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    borderTop: i === 0 ? '1px solid rgba(180,148,80,0.1)' : 'none',
                  }}>
                    <p style={{ fontSize: '12px', fontFamily: 'var(--font-dm-mono)', color: 'rgba(255,255,255,0.7)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {port.label}
                    </p>
                    <div data-port="out" onMouseDown={(e) => onPortMouseDown(e, node.id, port.id)} style={{
                      width: PORT_R * 2, height: PORT_R * 2, borderRadius: '50%', flexShrink: 0,
                      background: connected ? '#b49450' : 'rgba(220,60,60,0.85)',
                      border: `2px solid ${connected ? 'rgba(180,148,80,0.5)' : 'rgba(220,60,60,0.5)'}`,
                      cursor: 'crosshair', marginLeft: '8px',
                      boxShadow: `0 0 6px ${connected ? 'rgba(180,148,80,0.5)' : 'rgba(220,60,60,0.4)'}`,
                    }} />
                  </div>
                  )
                })}
              </div>
            )
          })
          })()}
        </div>{/* end transformed world */}

        {/* Floating properties panel — outside transform, in viewport coords */}
        {selectedNode && panelViewportPos && (
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', left: panelViewportPos.x, top: panelViewportPos.y,
              width: PANEL_W, zIndex: 50,
              background: 'rgba(12,12,12,0.97)',
              border: '1px solid rgba(180,148,80,0.4)',
              padding: '14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}
          >
            {/* Panel header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', fontFamily: 'var(--font-dm-mono)', color: '#ffffff', fontWeight: 500 }}>
                {selectedNode.title}
              </p>
              <button
                onClick={deleteSelected}
                style={{
                  background: 'transparent', border: '1px solid rgba(200,60,60,0.4)',
                  padding: '3px 8px', fontSize: '11px', color: '#c04040',
                  cursor: 'pointer', fontFamily: 'var(--font-dm-mono)',
                }}
              >
                delete
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Label */}
              <div>
                <label style={labelStyle}>Label</label>
                <input
                  value={selectedNode.title}
                  onChange={e => updateSelectedNode({ title: e.target.value })}
                  style={inputStyle}
                />
              </div>

              {selectedNode.type === 'start' && (
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                  Entry point. Connect its output to the first question node. Only one start node should exist in the graph.
                </p>
              )}

              {selectedNode.type === 'comment' && (
                <>
                  <div>
                    <label style={labelStyle}>Comment text</label>
                    <textarea
                      value={selectedNode.text ?? ''}
                      onChange={e => updateSelectedNode({ text: e.target.value })}
                      placeholder="Text to display to the user..."
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Duration (seconds)</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={selectedNode.duration ?? 5}
                      onChange={e => updateSelectedNode({ duration: Math.max(1, Number(e.target.value)) })}
                      style={{ ...inputStyle, width: '80px' }}
                    />
                  </div>
                </>
              )}

              {selectedNode.type === 'question' && (
                <>
                  {/* Hint */}
                  <div>
                    <label style={labelStyle}>Hint for Claude</label>
                    <input
                      value={selectedNode.note ?? ''}
                      onChange={e => updateSelectedNode({ note: e.target.value })}
                      placeholder="e.g. Ask about monthly rent"
                      style={{ ...inputStyle, color: selectedNode.note ? '#ffffff' : 'rgba(255,255,255,0.3)' }}
                    />
                  </div>

                  {/* Question type */}
                  <div>
                    <label style={labelStyle}>Question type</label>
                    <select
                      value={selectedNode.qtype ?? 'text'}
                      onChange={e => updateSelectedNode({ qtype: e.target.value as QuestionType })}
                      style={{ ...inputStyle, background: '#111' }}
                    >
                      <option value="text">text (free input)</option>
                      <option value="reorder">reorder (drag to rank)</option>
                      <option value="multi">multi-choice (select many)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Output ports — always independent from options */}
              {selectedNode.type === 'question' && (
                <div>
                  <label style={labelStyle}>Output ports</label>
                  <DragList
                    items={selectedNode.outputPorts ?? []}
                    onReorder={ports => updateSelectedNode({ outputPorts: ports })}
                    renderItem={(port, i) => (
                      <>
                        <input
                          value={port.label}
                          onChange={e => {
                            const ports = [...(selectedNode.outputPorts ?? [])]
                            ports[i] = { ...ports[i], label: e.target.value }
                            updateSelectedNode({ outputPorts: ports })
                          }}
                          placeholder="e.g. Yes / has kids"
                          style={{ ...inputStyle, flex: 1 }}
                        />
                        <button
                          onClick={() => updateSelectedNode({
                            outputPorts: (selectedNode.outputPorts ?? []).filter((_, j) => j !== i),
                          })}
                          style={{ background: 'transparent', border: '1px solid rgba(200,60,60,0.3)', padding: '0 8px', color: '#c04040', fontSize: '14px', cursor: 'pointer' }}
                        >×</button>
                      </>
                    )}
                  />
                  <button
                    onClick={() => updateSelectedNode({
                      outputPorts: [...(selectedNode.outputPorts ?? []), { id: 'port_' + generateId(), label: '' }],
                    })}
                    style={{
                      background: 'transparent', border: '1px dashed rgba(180,148,80,0.3)',
                      padding: '5px 8px', fontSize: '12px', color: 'rgba(180,148,80,0.7)',
                      cursor: 'pointer', fontFamily: 'var(--font-dm-mono)', textAlign: 'left',
                      marginTop: '4px',
                    }}
                  >+ add port</button>
                </div>
              )}

              {/* Suggested quick answers — shown to user as clickable shortcuts */}
              {selectedNode.type === 'question' && (
                <div>
                  <label style={labelStyle}>Suggested quick answers</label>
                  <DragList
                    items={selectedNode.options ?? []}
                    onReorder={opts => updateSelectedNode({ options: opts })}
                    renderItem={(opt, i) => (
                      <>
                        <input
                          value={opt}
                          onChange={e => {
                            const o = [...(selectedNode.options ?? [])]
                            o[i] = e.target.value
                            updateSelectedNode({ options: o })
                          }}
                          style={{ ...inputStyle, flex: 1 }}
                        />
                        <button
                          onClick={() => updateSelectedNode({ options: (selectedNode.options ?? []).filter((_, j) => j !== i) })}
                          style={{ background: 'transparent', border: '1px solid rgba(200,60,60,0.3)', padding: '0 8px', color: '#c04040', fontSize: '14px', cursor: 'pointer' }}
                        >×</button>
                      </>
                    )}
                  />
                  <button
                    onClick={() => updateSelectedNode({ options: [...(selectedNode.options ?? []), ''] })}
                    style={{
                      background: 'transparent', border: '1px dashed rgba(180,148,80,0.3)',
                      padding: '5px 8px', fontSize: '12px', color: 'rgba(180,148,80,0.7)',
                      cursor: 'pointer', fontFamily: 'var(--font-dm-mono)', textAlign: 'left',
                      marginTop: '4px',
                    }}
                  >+ add suggestion</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Zoom controls */}
        <div style={{
          position: 'absolute', bottom: 12, right: 12,
          display: 'flex', gap: '4px', zIndex: 60,
        }}>
          {[
            { label: '+', fn: () => adjustZoom(1.2) },
            { label: '−', fn: () => adjustZoom(1 / 1.2) },
            { label: 'reset', fn: resetView },
          ].map(btn => (
            <button
              key={btn.label}
              onMouseDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); btn.fn() }}
              style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
                color: 'rgba(180,148,80,0.8)', background: 'rgba(7,7,7,0.85)',
                border: '1px solid rgba(180,148,80,0.25)',
                padding: '4px 9px', cursor: 'pointer', letterSpacing: '0.05em',
              }}
            >{btn.label}</button>
          ))}
          <span style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
            color: 'rgba(180,148,80,0.4)',
            background: 'rgba(7,7,7,0.85)',
            border: '1px solid rgba(180,148,80,0.15)',
            padding: '4px 9px',
          }}>{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* JSON editor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'rgba(180,148,80,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Graph JSON
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {jsonError && (
              <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#c04040' }}>
                {jsonError}
              </span>
            )}
            <button
              onClick={handleImport}
              style={{
                background: 'rgba(180,148,80,0.08)', border: '1px solid rgba(180,148,80,0.4)',
                padding: '5px 14px', fontSize: '11px', color: '#b49450',
                cursor: 'pointer', fontFamily: 'var(--font-dm-mono)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}
            >
              import
            </button>
          </div>
        </div>
        <textarea
          value={jsonText}
          onChange={e => { setJsonText(e.target.value); setJsonError(null) }}
          onFocus={() => { isEditingJsonRef.current = true }}
          onBlur={() => { isEditingJsonRef.current = false }}
          spellCheck={false}
          style={{
            width: '100%', height: '140px', resize: 'vertical',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(180,148,80,0.2)',
            color: 'rgba(255,255,255,0.65)',
            fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
            padding: '8px 10px', outline: 'none', lineHeight: 1.5,
          }}
          onFocusCapture={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'rgba(180,148,80,0.45)' }}
          onBlurCapture={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'rgba(180,148,80,0.2)' }}
        />
      </div>

      {/* Bottom bar: palette + save */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'rgba(180,148,80,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
            Drag to canvas
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {PALETTE.map(item => (
              <div
                key={item.label}
                onMouseDown={(e) => onPaletteMouseDown(e, item.type, item.qtype)}
                style={{
                  border: '1px solid rgba(180,148,80,0.35)',
                  background: getNodeColor(item.type),
                  padding: '6px 12px', cursor: 'grab', userSelect: 'none',
                }}
              >
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#ffffff' }}>{item.label}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '6px', lineHeight: 1.5 }}>
            Drag gold port → input port to connect · click edge to delete
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={() => setShowChat(v => !v)}
            style={{
              background: showChat ? 'rgba(180,148,80,0.15)' : 'transparent',
              border: `1px solid ${showChat ? 'rgba(180,148,80,0.6)' : 'rgba(180,148,80,0.25)'}`,
              padding: '8px 18px', fontSize: '12px',
              color: showChat ? '#b49450' : 'rgba(180,148,80,0.5)',
              cursor: 'pointer', fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.1em', textTransform: 'uppercase',
            }}
          >
            AI ✦
          </button>
          <button
            onClick={() => {
              if (saveTimer.current) clearTimeout(saveTimer.current)
              setSaveStatus('saving')
              fetch(ep.graph, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ graph: latestGraphRef.current }),
              }).then(() => { setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 2000) }).catch(() => {})
            }}
            style={{
              background: 'rgba(180,148,80,0.08)', border: '1px solid rgba(180,148,80,0.4)',
              padding: '8px 18px', fontSize: '12px', color: '#b49450',
              cursor: 'pointer', fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.1em', textTransform: 'uppercase',
            }}
          >
            {saveStatus === 'saving' ? 'saving...' : saveStatus === 'saved' ? 'saved ✓' : 'save graph'}
          </button>
        </div>
      </div>

      {/* Palette ghost */}
      {paletteDrag && (
        <div style={{
          position: 'fixed', left: paletteDrag.x - NODE_W / 2, top: paletteDrag.y - HEADER_H / 2,
          width: NODE_W, pointerEvents: 'none', zIndex: 9999,
          border: '1px solid rgba(180,148,80,0.6)', background: 'rgba(12,12,12,0.92)',
          opacity: 0.85, padding: '10px 12px',
        }}>
          <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'rgba(180,148,80,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {paletteDrag.type}{paletteDrag.qtype ? ` · ${paletteDrag.qtype}` : ''}
          </p>
          <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#ffffff', marginTop: '3px' }}>New node</p>
        </div>
      )}
    </div>{/* end left column */}

    {/* ── Right column: AI chat panel ── */}
    {showChat && (
      <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <GraphChat
          graph={graph}
          onGraphChange={g => { updateGraph(g); setSelected(null) }}
          endpoint={ep.graphChat}
        />
      </div>
    )}

    </div>
  )
}
