'use client';
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ContextEditor: () => ContextEditor,
  GraphChat: () => GraphChat,
  GraphEditor: () => GraphEditor
});
module.exports = __toCommonJS(index_exports);

// src/components/GraphEditor.tsx
var import_react2 = require("react");
var import_graphait = require("@gottwik/graphait");

// src/components/GraphChat.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var mono = { fontFamily: "var(--font-dm-mono)" };
function GraphChat({ graph, onGraphChange, endpoint = "/api/admin/graph-chat" }) {
  const [messages, setMessages] = (0, import_react.useState)([]);
  const [input, setInput] = (0, import_react.useState)("");
  const [loading, setLoading] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)(null);
  const scrollRef = (0, import_react.useRef)(null);
  const inputRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);
  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, graph, history: messages.slice(-8) })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const assistantMsg = { role: "assistant", content: data.reply };
      setMessages([...next, assistantMsg]);
      if (data.graph) onGraphChange(data.graph);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setMessages([...next, { role: "assistant", content: "(error \u2014 see below)" }]);
    } finally {
      setLoading(false);
    }
  };
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    borderLeft: "1px solid rgba(180,148,80,0.15)"
  }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: {
      padding: "10px 14px",
      borderBottom: "1px solid rgba(180,148,80,0.12)",
      flexShrink: 0
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { ...mono, fontSize: "10px", color: "rgba(180,148,80,0.7)", letterSpacing: "0.12em", textTransform: "uppercase" }, children: "AI Graph Editor" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { ...mono, fontSize: "10px", color: "#333", marginTop: "2px" }, children: "Describe changes in plain English" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "div",
      {
        ref: scrollRef,
        style: {
          flex: 1,
          overflowY: "auto",
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        },
        children: [
          messages.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }, children: [
            "Add a question about gym access",
            "Connect Budget to Commute",
            'Add a comment node saying "Almost there!"',
            "Change the Lifestyle question to multi-choice"
          ].map((hint) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              onClick: () => {
                setInput(hint);
                inputRef.current?.focus();
              },
              style: {
                ...mono,
                fontSize: "11px",
                color: "rgba(180,148,80,0.5)",
                background: "transparent",
                border: "1px solid rgba(180,148,80,0.12)",
                padding: "7px 10px",
                cursor: "pointer",
                textAlign: "left",
                lineHeight: 1.4,
                transition: "border-color 0.15s, color 0.15s"
              },
              onMouseEnter: (e) => {
                e.currentTarget.style.borderColor = "rgba(180,148,80,0.35)";
                e.currentTarget.style.color = "rgba(180,148,80,0.85)";
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.borderColor = "rgba(180,148,80,0.12)";
                e.currentTarget.style.color = "rgba(180,148,80,0.5)";
              },
              children: hint
            },
            hint
          )) }),
          messages.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: "2px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: {
              ...mono,
              fontSize: "9px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: m.role === "user" ? "rgba(180,148,80,0.5)" : "#333"
            }, children: m.role === "user" ? "you" : "claude" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: {
              ...mono,
              fontSize: "12px",
              lineHeight: 1.6,
              color: m.role === "user" ? "rgba(240,234,216,0.8)" : "rgba(240,234,216,0.5)",
              whiteSpace: "pre-wrap"
            }, children: m.content })
          ] }, i)),
          loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { ...mono, fontSize: "9px", color: "#333", letterSpacing: "0.1em", textTransform: "uppercase" }, children: "claude" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { ...mono, fontSize: "12px", color: "#333", animation: "chatPulse 1.2s ease-in-out infinite" }, children: "thinking..." })
          ] }),
          error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { ...mono, fontSize: "11px", color: "#c04040" }, children: error })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: {
      borderTop: "1px solid rgba(180,148,80,0.12)",
      padding: "10px 12px",
      flexShrink: 0,
      display: "flex",
      gap: "8px",
      alignItems: "flex-end"
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "textarea",
        {
          ref: inputRef,
          value: input,
          onChange: (e) => setInput(e.target.value),
          onKeyDown,
          placeholder: "Describe a change...",
          rows: 2,
          disabled: loading,
          style: {
            ...mono,
            flex: 1,
            fontSize: "12px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(180,148,80,0.2)",
            color: "#f0ead8",
            padding: "8px 10px",
            outline: "none",
            resize: "none",
            lineHeight: 1.5,
            opacity: loading ? 0.5 : 1
          },
          onFocus: (e) => {
            e.currentTarget.style.borderColor = "rgba(180,148,80,0.5)";
          },
          onBlur: (e) => {
            e.currentTarget.style.borderColor = "rgba(180,148,80,0.2)";
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          onClick: send,
          disabled: loading || !input.trim(),
          style: {
            ...mono,
            fontSize: "11px",
            letterSpacing: "0.08em",
            padding: "8px 12px",
            cursor: loading || !input.trim() ? "default" : "pointer",
            background: "rgba(180,148,80,0.08)",
            border: "1px solid rgba(180,148,80,0.3)",
            color: loading || !input.trim() ? "rgba(180,148,80,0.25)" : "#b49450",
            transition: "all 0.15s",
            flexShrink: 0
          },
          children: "send \u2192"
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
        @keyframes chatPulse {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.8; }
        }
      ` })
  ] });
}

// src/components/GraphEditor.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var DEFAULT_GRAPH_ENDPOINTS = {
  graph: "/api/admin/graph",
  graphChat: "/api/admin/graph-chat"
};
var NODE_W = 210;
var HEADER_H = 72;
var ANSWER_H = 30;
var PORT_R = 5;
var PORT_SNAP = 18;
var FOOT_H = 10;
var PANEL_W = 240;
function nodeHeight(node) {
  const ports = node.outputPorts ?? [];
  const rows = node.type === "question" && ports.length > 0 ? ports.length : 0;
  return HEADER_H + rows * ANSWER_H + FOOT_H;
}
function inPortY(node) {
  return node.y + HEADER_H / 2;
}
function outPortY(node, portId) {
  const ports = node.outputPorts ?? [];
  if (portId) {
    const idx = ports.findIndex((p) => p.id === portId);
    if (idx >= 0) return node.y + HEADER_H + idx * ANSWER_H + ANSWER_H / 2;
  }
  return node.y + nodeHeight(node) / 2;
}
var DEFAULT_GRAPH = {
  nodes: [
    { id: "start", x: 40, y: 180, title: "Opening", type: "question", qtype: "text", note: "What's pulling you to NYC?", options: [], outputPorts: [{ id: "yes", label: "Yes" }, { id: "no", label: "No" }, { id: "other", label: "Other" }] },
    { id: "budget", x: 300, y: 60, title: "Budget", type: "question", qtype: "text", note: "Monthly rent range?", options: ["Under $2k", "$2\u20133k", "$3\u20134k", "$4k+"], outputPorts: [{ id: "under_2k", label: "Under $2k" }, { id: "2_3k", label: "$2\u20133k" }, { id: "3_4k", label: "$3\u20134k" }, { id: "4k", label: "$4k+" }] },
    { id: "commute", x: 300, y: 280, title: "Commute", type: "question", qtype: "text", note: "How do you get around?", options: ["Subway", "Walk / bike", "Car", "WFH"], outputPorts: [{ id: "subway", label: "Subway" }, { id: "walk_bike", label: "Walk / bike" }, { id: "car", label: "Car" }, { id: "wfh", label: "WFH" }] },
    { id: "lifestyle", x: 300, y: 460, title: "Lifestyle", type: "question", qtype: "text", note: "Vibe and scene preferences?", options: [], outputPorts: [{ id: "yes", label: "Yes" }, { id: "no", label: "No" }, { id: "other", label: "Other" }] },
    { id: "dealbreak", x: 580, y: 220, title: "Deal-breaker", type: "question", qtype: "text", note: "One thing you can't live without?", options: [], outputPorts: [{ id: "yes", label: "Yes" }, { id: "no", label: "No" }, { id: "other", label: "Other" }] },
    { id: "end", x: 820, y: 270, title: "Recommend", type: "end" }
  ],
  edges: [
    { from: "start", fromPortId: "yes", to: "budget" },
    { from: "start", fromPortId: "no", to: "commute" },
    { from: "start", fromPortId: "other", to: "lifestyle" },
    { from: "budget", fromPortId: "under_2k", to: "dealbreak" },
    { from: "budget", fromPortId: "2_3k", to: "dealbreak" },
    { from: "budget", fromPortId: "3_4k", to: "dealbreak" },
    { from: "budget", fromPortId: "4k", to: "dealbreak" },
    { from: "commute", fromPortId: "subway", to: "dealbreak" },
    { from: "commute", fromPortId: "walk_bike", to: "dealbreak" },
    { from: "commute", fromPortId: "car", to: "dealbreak" },
    { from: "commute", fromPortId: "wfh", to: "dealbreak" },
    { from: "lifestyle", fromPortId: "other", to: "dealbreak" },
    { from: "dealbreak", fromPortId: "other", to: "end" }
  ]
};
var PALETTE = [
  { label: "Start", type: "start" },
  { label: "Question", type: "question", qtype: "text" },
  { label: "Comment", type: "comment" },
  { label: "End / Recommend", type: "end" }
];
function generateId() {
  return Math.random().toString(36).slice(2, 8);
}
function DragList({
  items,
  renderItem,
  onReorder
}) {
  const dragIdx = (0, import_react2.useRef)(null);
  const onDragStart = (i) => {
    dragIdx.current = i;
  };
  const onDragEnter = (i) => {
    if (dragIdx.current === null || dragIdx.current === i) return;
    const next = [...items];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(i, 0, moved);
    dragIdx.current = i;
    onReorder(next);
  };
  const onDragEnd = () => {
    dragIdx.current = null;
  };
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: "4px" }, children: items.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "div",
    {
      draggable: true,
      onDragStart: () => onDragStart(i),
      onDragEnter: () => onDragEnter(i),
      onDragEnd,
      onDragOver: (e) => e.preventDefault(),
      style: { display: "flex", gap: "4px", alignItems: "center" },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: {
          color: "rgba(180,148,80,0.35)",
          fontSize: "12px",
          cursor: "grab",
          flexShrink: 0,
          paddingRight: "2px",
          userSelect: "none"
        }, children: "\u283F" }),
        renderItem(item, i)
      ]
    },
    i
  )) });
}
function getNodeColor(type) {
  if (type === "end") return "rgba(180,148,80,0.14)";
  if (type === "start") return "rgba(80,180,120,0.10)";
  if (type === "comment") return "rgba(100,140,220,0.10)";
  return "rgba(255,255,255,0.03)";
}
function getNodeBorder(type, sel) {
  const op = sel ? "1" : "0.3";
  return `1px solid rgba(180,148,80,${op})`;
}
function GraphEditor({ endpoints: endpointOverrides }) {
  const ep = { ...DEFAULT_GRAPH_ENDPOINTS, ...endpointOverrides };
  const [graph, setGraph] = (0, import_react2.useState)(DEFAULT_GRAPH);
  const [selected, setSelected] = (0, import_react2.useState)(null);
  const [saveStatus, setSaveStatus] = (0, import_react2.useState)("idle");
  const [connecting, setConnecting] = (0, import_react2.useState)(null);
  const [paletteDrag, setPaletteDrag] = (0, import_react2.useState)(null);
  const [jsonText, setJsonText] = (0, import_react2.useState)(() => JSON.stringify(DEFAULT_GRAPH, null, 2));
  const [jsonError, setJsonError] = (0, import_react2.useState)(null);
  const isEditingJsonRef = (0, import_react2.useRef)(false);
  const [showChat, setShowChat] = (0, import_react2.useState)(false);
  const [zoom, setZoom] = (0, import_react2.useState)(1);
  const [pan, setPan] = (0, import_react2.useState)({ x: 40, y: 40 });
  const canvasRef = (0, import_react2.useRef)(null);
  const dragRef = (0, import_react2.useRef)(null);
  const latestGraphRef = (0, import_react2.useRef)(DEFAULT_GRAPH);
  const saveTimer = (0, import_react2.useRef)(null);
  const zoomRef = (0, import_react2.useRef)(1);
  const panRef = (0, import_react2.useRef)({ x: 40, y: 40 });
  (0, import_react2.useEffect)(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  (0, import_react2.useEffect)(() => {
    panRef.current = pan;
  }, [pan]);
  (0, import_react2.useEffect)(() => {
    if (!isEditingJsonRef.current) {
      setJsonText(JSON.stringify(graph, null, 2));
    }
  }, [graph]);
  const vpToCanvas = (0, import_react2.useCallback)((vx, vy) => {
    const r = canvasRef.current;
    if (!r) return { x: vx, y: vy };
    const rect = r.getBoundingClientRect();
    return {
      x: (vx - rect.left - panRef.current.x) / zoomRef.current,
      y: (vy - rect.top - panRef.current.y) / zoomRef.current
    };
  }, []);
  const adjustZoom = (0, import_react2.useCallback)((factor, cx, cy) => {
    const r = canvasRef.current;
    const rect = r?.getBoundingClientRect();
    const ox = cx ?? (rect ? rect.width / 2 : 0);
    const oy = cy ?? (rect ? rect.height / 2 : 0);
    setZoom((prev) => {
      const next = Math.min(3, Math.max(0.15, prev * factor));
      const scale = next / prev;
      setPan((p) => ({ x: ox - (ox - p.x) * scale, y: oy - (oy - p.y) * scale }));
      zoomRef.current = next;
      return next;
    });
  }, []);
  const resetView = (0, import_react2.useCallback)(() => {
    setZoom(1);
    setPan({ x: 40, y: 40 });
    zoomRef.current = 1;
    panRef.current = { x: 40, y: 40 };
  }, []);
  const onWheel = (0, import_react2.useCallback)((e) => {
    e.preventDefault();
    const r = canvasRef.current;
    const rect = r.getBoundingClientRect();
    adjustZoom(e.deltaY < 0 ? 1.1 : 1 / 1.1, e.clientX - rect.left, e.clientY - rect.top);
  }, [adjustZoom]);
  (0, import_react2.useEffect)(() => {
    fetch(ep.graph).then((r) => r.json()).then(({ graph: g }) => {
      if (g?.nodes?.length) {
        const normalized = (0, import_graphait.normalizeGraphPorts)({
          ...g,
          nodes: g.nodes.map((n) => ({
            ...n,
            ...n.type === "question" ? {
              options: n.options ?? [],
              qtype: ["reorder", "multi"].includes(n.qtype ?? "") ? n.qtype : "text"
            } : {}
          }))
        });
        setGraph(normalized);
        latestGraphRef.current = normalized;
      }
    }).catch(() => {
    });
  }, []);
  const scheduleSave = (0, import_react2.useCallback)((g) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveStatus("saving");
      await fetch(ep.graph, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph: g })
      }).catch(() => {
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2e3);
    }, 800);
  }, []);
  const updateGraph = (0, import_react2.useCallback)((g) => {
    latestGraphRef.current = g;
    setGraph(g);
    scheduleSave(g);
  }, [scheduleSave]);
  const onNodeMouseDown = (e, nodeId) => {
    if (e.target.dataset.port) return;
    e.stopPropagation();
    setSelected(nodeId);
    const node = latestGraphRef.current.nodes.find((n) => n.id === nodeId);
    dragRef.current = { nodeId, startX: e.clientX, startY: e.clientY, origX: node.x, origY: node.y };
    const onMove = (me) => {
      if (!dragRef.current) return;
      const { nodeId: id, startX, startY, origX, origY } = dragRef.current;
      const dx = (me.clientX - startX) / zoomRef.current;
      const dy = (me.clientY - startY) / zoomRef.current;
      setGraph((prev) => {
        const next = { ...prev, nodes: prev.nodes.map(
          (n) => n.id === id ? { ...n, x: Math.max(0, origX + dx), y: Math.max(0, origY + dy) } : n
        ) };
        latestGraphRef.current = next;
        return next;
      });
    };
    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      scheduleSave(latestGraphRef.current);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };
  const onPortMouseDown = (e, nodeId, portId) => {
    e.stopPropagation();
    e.preventDefault();
    const node = latestGraphRef.current.nodes.find((n) => n.id === nodeId);
    const fromX = node.x + NODE_W;
    const portIndex = portId ? (node.outputPorts ?? []).findIndex((p) => p.id === portId) : -1;
    const fromY = portIndex >= 0 ? node.y + HEADER_H + portIndex * ANSWER_H + ANSWER_H / 2 : node.y + nodeHeight(node) / 2;
    const { x: curX, y: curY } = vpToCanvas(e.clientX, e.clientY);
    setConnecting({ fromNodeId: nodeId, fromPortId: portId, fromX, fromY, curX, curY });
    const onMove = (me) => {
      const { x, y } = vpToCanvas(me.clientX, me.clientY);
      setConnecting((prev) => prev ? { ...prev, curX: x, curY: y } : null);
    };
    const onUp = (me) => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      const { x: mx, y: my } = vpToCanvas(me.clientX, me.clientY);
      const g = latestGraphRef.current;
      let targetId = null;
      for (const n of g.nodes) {
        if (n.id === nodeId) continue;
        const ix = n.x, iy = inPortY(n);
        if (Math.sqrt((ix - mx) ** 2 + (iy - my) ** 2) < PORT_SNAP) {
          targetId = n.id;
          break;
        }
      }
      if (targetId) {
        const newEdge = { from: nodeId, fromPortId: portId, to: targetId };
        const edges = g.edges.filter((e2) => !(e2.from === nodeId && e2.fromPortId === portId));
        updateGraph({ ...g, edges: [...edges, newEdge] });
      }
      setConnecting(null);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };
  const onPaletteMouseDown = (e, type, qtype) => {
    e.preventDefault();
    setPaletteDrag({ type, qtype, x: e.clientX, y: e.clientY });
    const onMove = (me) => {
      setPaletteDrag((prev) => prev ? { ...prev, x: me.clientX, y: me.clientY } : null);
    };
    const onUp = (me) => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        if (me.clientX >= rect.left && me.clientX <= rect.right && me.clientY >= rect.top && me.clientY <= rect.bottom) {
          const { x, y } = vpToCanvas(me.clientX, me.clientY);
          const id = generateId();
          const initialOptions = [];
          const initialPorts = type === "question" ? [{ id: "yes", label: "Yes" }, { id: "no", label: "No" }, { id: "other", label: "Other / unclear" }] : void 0;
          const newNode = {
            id,
            x: Math.max(0, x - NODE_W / 2),
            y: Math.max(0, y - HEADER_H / 2),
            title: type === "end" ? "Recommend" : type === "start" ? "Start" : type === "comment" ? "Comment" : "New question",
            type,
            qtype,
            options: initialOptions,
            outputPorts: initialPorts
          };
          updateGraph({ ...latestGraphRef.current, nodes: [...latestGraphRef.current.nodes, newNode] });
          setSelected(id);
        }
      }
      setPaletteDrag(null);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };
  const updateSelectedNode = (patch) => {
    if (!selected) return;
    const g = latestGraphRef.current;
    const node = g.nodes.find((n) => n.id === selected);
    if (!node) return;
    const updated = { ...node, ...patch };
    updateGraph({ ...g, nodes: g.nodes.map((n) => n.id === selected ? updated : n) });
  };
  const deleteSelected = () => {
    if (!selected) return;
    const g = latestGraphRef.current;
    updateGraph({
      nodes: g.nodes.filter((n) => n.id !== selected),
      edges: g.edges.filter((e) => e.from !== selected && e.to !== selected)
    });
    setSelected(null);
  };
  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) throw new Error("Missing nodes or edges array");
      setJsonError(null);
      isEditingJsonRef.current = false;
      updateGraph(parsed);
      setSelected(null);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };
  const deleteEdge = (edge) => {
    const g = latestGraphRef.current;
    updateGraph({ ...g, edges: g.edges.filter(
      (e) => !(e.from === edge.from && e.fromPortId === edge.fromPortId && e.to === edge.to)
    ) });
  };
  const onCanvasMouseDown = (0, import_react2.useCallback)((e) => {
    if (e.button !== 0) return;
    const startX = e.clientX, startY = e.clientY;
    const origPan = { ...panRef.current };
    let moved = false;
    const onMove = (me) => {
      const dx = me.clientX - startX, dy = me.clientY - startY;
      if (!moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) moved = true;
      panRef.current = { x: origPan.x + dx, y: origPan.y + dy };
      setPan({ ...panRef.current });
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      if (!moved) setSelected(null);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, []);
  const selectedNode = graph.nodes.find((n) => n.id === selected) ?? null;
  const maxX = Math.max(1200, ...graph.nodes.map((n) => n.x + NODE_W + 200));
  const maxY = Math.max(800, ...graph.nodes.map((n) => n.y + nodeHeight(n) + 200));
  const edgePaths = graph.edges.map((edge) => {
    const from = graph.nodes.find((n) => n.id === edge.from);
    const to = graph.nodes.find((n) => n.id === edge.to);
    if (!from || !to) return null;
    const x1 = from.x + NODE_W, y1 = outPortY(from, edge.fromPortId);
    const x2 = to.x, y2 = inPortY(to);
    const cx = (x1 + x2) / 2;
    return { edge, path: `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}` };
  }).filter(Boolean);
  const panelViewportPos = selectedNode ? (() => {
    const canvasW = canvasRef.current?.clientWidth ?? 800;
    const rightOfNodeVP = selectedNode.x * zoom + pan.x + NODE_W * zoom + 14;
    const leftOfNodeVP = selectedNode.x * zoom + pan.x - PANEL_W - 14;
    const x = rightOfNodeVP + PANEL_W < canvasW ? rightOfNodeVP : leftOfNodeVP;
    return { x: Math.max(4, x), y: Math.max(4, selectedNode.y * zoom + pan.y) };
  })() : null;
  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(180,148,80,0.25)",
    borderRadius: "2px",
    padding: "5px 8px",
    color: "#ffffff",
    fontFamily: "var(--font-dm-mono)",
    fontSize: "12px",
    outline: "none"
  };
  const labelStyle = {
    display: "block",
    marginBottom: "4px",
    fontFamily: "var(--font-dm-mono)",
    fontSize: "10px",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.1em"
  };
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", gap: "0", width: "100%", height: "100%" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex flex-col gap-3", style: { flex: 1, minWidth: 0 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
        "div",
        {
          ref: canvasRef,
          style: {
            flex: 1,
            minHeight: 0,
            position: "relative",
            overflow: "hidden",
            background: "#070707",
            border: "1px solid rgba(180,148,80,0.15)",
            backgroundImage: "radial-gradient(rgba(180,148,80,0.04) 1px, transparent 1px)",
            backgroundSize: `${28 * zoom}px ${28 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
            cursor: connecting ? "crosshair" : "grab"
          },
          onMouseDown: onCanvasMouseDown,
          onWheel,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: {
              position: "absolute",
              top: 0,
              left: 0,
              transformOrigin: "0 0",
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              width: maxX,
              height: maxY
            }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
                "svg",
                {
                  style: { position: "absolute", top: 0, left: 0, width: maxX, height: maxY, overflow: "visible", pointerEvents: "none" },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("marker", { id: "arr", markerWidth: "7", markerHeight: "7", refX: "6", refY: "3.5", orient: "auto", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M0,0 L0,7 L7,3.5 z", fill: "rgba(180,148,80,0.6)" }) }) }),
                    edgePaths.map(({ edge, path }, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: path, fill: "none", stroke: "rgba(180,148,80,0.35)", strokeWidth: "1.5", markerEnd: "url(#arr)" }),
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                        "path",
                        {
                          d: path,
                          fill: "none",
                          stroke: "transparent",
                          strokeWidth: "12",
                          style: { cursor: "pointer", pointerEvents: "all" },
                          onClick: (e) => {
                            e.stopPropagation();
                            deleteEdge(edge);
                          }
                        }
                      )
                    ] }, i)),
                    connecting && (() => {
                      const cx = (connecting.fromX + connecting.curX) / 2;
                      const p = `M${connecting.fromX},${connecting.fromY} C${cx},${connecting.fromY} ${cx},${connecting.curY} ${connecting.curX},${connecting.curY}`;
                      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: p, fill: "none", stroke: "rgba(180,148,80,0.7)", strokeWidth: "1.5", strokeDasharray: "5,4" });
                    })()
                  ]
                }
              ),
              (() => {
                const connectedPorts = new Set(
                  graph.edges.map((e) => `${e.from}:${e.fromPortId ?? ""}`)
                );
                return graph.nodes.map((node) => {
                  const h = nodeHeight(node);
                  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
                    "div",
                    {
                      onMouseDown: (e) => onNodeMouseDown(e, node.id),
                      onClick: (e) => e.stopPropagation(),
                      style: {
                        position: "absolute",
                        left: node.x,
                        top: node.y,
                        width: NODE_W,
                        height: h,
                        background: getNodeColor(node.type),
                        border: getNodeBorder(node.type, selected === node.id),
                        cursor: "grab",
                        userSelect: "none"
                      },
                      children: [
                        node.type !== "start" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { "data-port": "in", style: {
                          position: "absolute",
                          left: -PORT_R - 1,
                          top: HEADER_H / 2 - PORT_R,
                          width: PORT_R * 2,
                          height: PORT_R * 2,
                          borderRadius: "50%",
                          background: "#111",
                          border: "2px solid rgba(180,148,80,0.6)",
                          cursor: "default"
                        } }),
                        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { padding: "8px 12px 6px", height: HEADER_H, overflow: "hidden", boxSizing: "border-box" }, children: [
                          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { style: { fontSize: "10px", fontFamily: "var(--font-dm-mono)", color: "rgba(180,148,80,0.7)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "3px" }, children: [
                            node.type,
                            node.qtype && node.qtype !== "text" ? ` \xB7 ${node.qtype}` : ""
                          ] }),
                          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { style: { fontSize: "12px", fontFamily: "var(--font-dm-mono)", color: "#ffffff", lineHeight: 1.2, fontWeight: 500 }, children: node.title }),
                          node.type === "comment" && node.text && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { style: { fontSize: "10px", fontFamily: "var(--font-dm-mono)", color: "rgba(180,210,255,0.5)", marginTop: "2px", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontStyle: "italic" }, children: [
                            "\u201C",
                            node.text,
                            "\u201D"
                          ] }),
                          node.type !== "comment" && node.note && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { style: { fontSize: "10px", fontFamily: "var(--font-dm-mono)", color: "rgba(255,255,255,0.35)", marginTop: "2px", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: node.note })
                        ] }),
                        node.type === "start" && (() => {
                          const connected = connectedPorts.has(`${node.id}:`);
                          return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { "data-port": "out", onMouseDown: (e) => onPortMouseDown(e, node.id, void 0), style: {
                            position: "absolute",
                            right: -PORT_R - 1,
                            top: HEADER_H / 2 - PORT_R,
                            width: PORT_R * 2,
                            height: PORT_R * 2,
                            borderRadius: "50%",
                            background: connected ? "rgba(80,180,120,0.8)" : "rgba(220,60,60,0.85)",
                            border: `2px solid ${connected ? "rgba(80,180,120,0.5)" : "rgba(220,60,60,0.5)"}`,
                            cursor: "crosshair",
                            boxShadow: `0 0 6px ${connected ? "rgba(80,180,120,0.4)" : "rgba(220,60,60,0.4)"}`
                          } });
                        })(),
                        node.type === "comment" && (() => {
                          const connected = connectedPorts.has(`${node.id}:`);
                          return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { "data-port": "out", onMouseDown: (e) => onPortMouseDown(e, node.id, void 0), style: {
                            position: "absolute",
                            right: -PORT_R - 1,
                            top: HEADER_H / 2 - PORT_R,
                            width: PORT_R * 2,
                            height: PORT_R * 2,
                            borderRadius: "50%",
                            background: connected ? "rgba(100,140,220,0.8)" : "rgba(220,60,60,0.85)",
                            border: `2px solid ${connected ? "rgba(100,140,220,0.5)" : "rgba(220,60,60,0.5)"}`,
                            cursor: "crosshair",
                            boxShadow: `0 0 6px ${connected ? "rgba(100,140,220,0.4)" : "rgba(220,60,60,0.4)"}`
                          } });
                        })(),
                        node.type === "question" && (node.outputPorts ?? []).map((port, i) => {
                          const connected = connectedPorts.has(`${node.id}:${port.id}`);
                          return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0 10px 0 12px",
                            height: ANSWER_H,
                            borderBottom: i < (node.outputPorts ?? []).length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                            borderTop: i === 0 ? "1px solid rgba(180,148,80,0.1)" : "none"
                          }, children: [
                            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { style: { fontSize: "12px", fontFamily: "var(--font-dm-mono)", color: "rgba(255,255,255,0.7)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: port.label }),
                            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { "data-port": "out", onMouseDown: (e) => onPortMouseDown(e, node.id, port.id), style: {
                              width: PORT_R * 2,
                              height: PORT_R * 2,
                              borderRadius: "50%",
                              flexShrink: 0,
                              background: connected ? "#b49450" : "rgba(220,60,60,0.85)",
                              border: `2px solid ${connected ? "rgba(180,148,80,0.5)" : "rgba(220,60,60,0.5)"}`,
                              cursor: "crosshair",
                              marginLeft: "8px",
                              boxShadow: `0 0 6px ${connected ? "rgba(180,148,80,0.5)" : "rgba(220,60,60,0.4)"}`
                            } })
                          ] }, port.id);
                        })
                      ]
                    },
                    node.id
                  );
                });
              })()
            ] }),
            selectedNode && panelViewportPos && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
              "div",
              {
                onMouseDown: (e) => e.stopPropagation(),
                onClick: (e) => e.stopPropagation(),
                style: {
                  position: "absolute",
                  left: panelViewportPos.x,
                  top: panelViewportPos.y,
                  width: PANEL_W,
                  zIndex: 50,
                  background: "rgba(12,12,12,0.97)",
                  border: "1px solid rgba(180,148,80,0.4)",
                  padding: "14px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.6)"
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { style: { fontSize: "12px", fontFamily: "var(--font-dm-mono)", color: "#ffffff", fontWeight: 500 }, children: selectedNode.title }),
                    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                      "button",
                      {
                        onClick: deleteSelected,
                        style: {
                          background: "transparent",
                          border: "1px solid rgba(200,60,60,0.4)",
                          padding: "3px 8px",
                          fontSize: "11px",
                          color: "#c04040",
                          cursor: "pointer",
                          fontFamily: "var(--font-dm-mono)"
                        },
                        children: "delete"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: "10px" }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { style: labelStyle, children: "Label" }),
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                        "input",
                        {
                          value: selectedNode.title,
                          onChange: (e) => updateSelectedNode({ title: e.target.value }),
                          style: inputStyle
                        }
                      )
                    ] }),
                    selectedNode.type === "start" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { style: { fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }, children: "Entry point. Connect its output to the first question node. Only one start node should exist in the graph." }),
                    selectedNode.type === "comment" && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
                        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { style: labelStyle, children: "Comment text" }),
                        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                          "textarea",
                          {
                            value: selectedNode.text ?? "",
                            onChange: (e) => updateSelectedNode({ text: e.target.value }),
                            placeholder: "Text to display to the user...",
                            rows: 3,
                            style: { ...inputStyle, resize: "vertical" }
                          }
                        )
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
                        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { style: labelStyle, children: "Duration (seconds)" }),
                        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                          "input",
                          {
                            type: "number",
                            min: 1,
                            max: 30,
                            value: selectedNode.duration ?? 5,
                            onChange: (e) => updateSelectedNode({ duration: Math.max(1, Number(e.target.value)) }),
                            style: { ...inputStyle, width: "80px" }
                          }
                        )
                      ] })
                    ] }),
                    selectedNode.type === "question" && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
                        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { style: labelStyle, children: "Hint for Claude" }),
                        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                          "input",
                          {
                            value: selectedNode.note ?? "",
                            onChange: (e) => updateSelectedNode({ note: e.target.value }),
                            placeholder: "e.g. Ask about monthly rent",
                            style: { ...inputStyle, color: selectedNode.note ? "#ffffff" : "rgba(255,255,255,0.3)" }
                          }
                        )
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
                        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { style: labelStyle, children: "Question type" }),
                        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
                          "select",
                          {
                            value: selectedNode.qtype ?? "text",
                            onChange: (e) => updateSelectedNode({ qtype: e.target.value }),
                            style: { ...inputStyle, background: "#111" },
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "text", children: "text (free input)" }),
                              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "reorder", children: "reorder (drag to rank)" }),
                              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "multi", children: "multi-choice (select many)" })
                            ]
                          }
                        )
                      ] })
                    ] }),
                    selectedNode.type === "question" && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { style: labelStyle, children: "Output ports" }),
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                        DragList,
                        {
                          items: selectedNode.outputPorts ?? [],
                          onReorder: (ports) => updateSelectedNode({ outputPorts: ports }),
                          renderItem: (port, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
                            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                              "input",
                              {
                                value: port.label,
                                onChange: (e) => {
                                  const ports = [...selectedNode.outputPorts ?? []];
                                  ports[i] = { ...ports[i], label: e.target.value };
                                  updateSelectedNode({ outputPorts: ports });
                                },
                                placeholder: "e.g. Yes / has kids",
                                style: { ...inputStyle, flex: 1 }
                              }
                            ),
                            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                              "button",
                              {
                                onClick: () => updateSelectedNode({
                                  outputPorts: (selectedNode.outputPorts ?? []).filter((_, j) => j !== i)
                                }),
                                style: { background: "transparent", border: "1px solid rgba(200,60,60,0.3)", padding: "0 8px", color: "#c04040", fontSize: "14px", cursor: "pointer" },
                                children: "\xD7"
                              }
                            )
                          ] })
                        }
                      ),
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                        "button",
                        {
                          onClick: () => updateSelectedNode({
                            outputPorts: [...selectedNode.outputPorts ?? [], { id: "port_" + generateId(), label: "" }]
                          }),
                          style: {
                            background: "transparent",
                            border: "1px dashed rgba(180,148,80,0.3)",
                            padding: "5px 8px",
                            fontSize: "12px",
                            color: "rgba(180,148,80,0.7)",
                            cursor: "pointer",
                            fontFamily: "var(--font-dm-mono)",
                            textAlign: "left",
                            marginTop: "4px"
                          },
                          children: "+ add port"
                        }
                      )
                    ] }),
                    selectedNode.type === "question" && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { style: labelStyle, children: "Suggested quick answers" }),
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                        DragList,
                        {
                          items: selectedNode.options ?? [],
                          onReorder: (opts) => updateSelectedNode({ options: opts }),
                          renderItem: (opt, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
                            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                              "input",
                              {
                                value: opt,
                                onChange: (e) => {
                                  const o = [...selectedNode.options ?? []];
                                  o[i] = e.target.value;
                                  updateSelectedNode({ options: o });
                                },
                                style: { ...inputStyle, flex: 1 }
                              }
                            ),
                            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                              "button",
                              {
                                onClick: () => updateSelectedNode({ options: (selectedNode.options ?? []).filter((_, j) => j !== i) }),
                                style: { background: "transparent", border: "1px solid rgba(200,60,60,0.3)", padding: "0 8px", color: "#c04040", fontSize: "14px", cursor: "pointer" },
                                children: "\xD7"
                              }
                            )
                          ] })
                        }
                      ),
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                        "button",
                        {
                          onClick: () => updateSelectedNode({ options: [...selectedNode.options ?? [], ""] }),
                          style: {
                            background: "transparent",
                            border: "1px dashed rgba(180,148,80,0.3)",
                            padding: "5px 8px",
                            fontSize: "12px",
                            color: "rgba(180,148,80,0.7)",
                            cursor: "pointer",
                            fontFamily: "var(--font-dm-mono)",
                            textAlign: "left",
                            marginTop: "4px"
                          },
                          children: "+ add suggestion"
                        }
                      )
                    ] })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: {
              position: "absolute",
              bottom: 12,
              right: 12,
              display: "flex",
              gap: "4px",
              zIndex: 60
            }, children: [
              [
                { label: "+", fn: () => adjustZoom(1.2) },
                { label: "\u2212", fn: () => adjustZoom(1 / 1.2) },
                { label: "reset", fn: resetView }
              ].map((btn) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                "button",
                {
                  onMouseDown: (e) => e.stopPropagation(),
                  onClick: (e) => {
                    e.stopPropagation();
                    btn.fn();
                  },
                  style: {
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: "11px",
                    color: "rgba(180,148,80,0.8)",
                    background: "rgba(7,7,7,0.85)",
                    border: "1px solid rgba(180,148,80,0.25)",
                    padding: "4px 9px",
                    cursor: "pointer",
                    letterSpacing: "0.05em"
                  },
                  children: btn.label
                },
                btn.label
              )),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { style: {
                fontFamily: "var(--font-dm-mono)",
                fontSize: "11px",
                color: "rgba(180,148,80,0.4)",
                background: "rgba(7,7,7,0.85)",
                border: "1px solid rgba(180,148,80,0.15)",
                padding: "4px 9px"
              }, children: [
                Math.round(zoom * 100),
                "%"
              ] })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: "6px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { style: { fontFamily: "var(--font-dm-mono)", fontSize: "10px", color: "rgba(180,148,80,0.6)", textTransform: "uppercase", letterSpacing: "0.12em" }, children: "Graph JSON" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [
            jsonError && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "#c04040" }, children: jsonError }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "button",
              {
                onClick: handleImport,
                style: {
                  background: "rgba(180,148,80,0.08)",
                  border: "1px solid rgba(180,148,80,0.4)",
                  padding: "5px 14px",
                  fontSize: "11px",
                  color: "#b49450",
                  cursor: "pointer",
                  fontFamily: "var(--font-dm-mono)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase"
                },
                children: "import"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "textarea",
          {
            value: jsonText,
            onChange: (e) => {
              setJsonText(e.target.value);
              setJsonError(null);
            },
            onFocus: () => {
              isEditingJsonRef.current = true;
            },
            onBlur: () => {
              isEditingJsonRef.current = false;
            },
            spellCheck: false,
            style: {
              width: "100%",
              height: "140px",
              resize: "vertical",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(180,148,80,0.2)",
              color: "rgba(255,255,255,0.65)",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "11px",
              padding: "8px 10px",
              outline: "none",
              lineHeight: 1.5
            },
            onFocusCapture: (e) => {
              e.currentTarget.style.borderColor = "rgba(180,148,80,0.45)";
            },
            onBlurCapture: (e) => {
              e.currentTarget.style.borderColor = "rgba(180,148,80,0.2)";
            }
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", alignItems: "flex-start", gap: "16px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { flex: 1 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { style: { fontFamily: "var(--font-dm-mono)", fontSize: "10px", color: "rgba(180,148,80,0.6)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px" }, children: "Drag to canvas" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { display: "flex", gap: "6px", flexWrap: "wrap" }, children: PALETTE.map((item) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "div",
            {
              onMouseDown: (e) => onPaletteMouseDown(e, item.type, item.qtype),
              style: {
                border: "1px solid rgba(180,148,80,0.35)",
                background: getNodeColor(item.type),
                padding: "6px 12px",
                cursor: "grab",
                userSelect: "none"
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { style: { fontFamily: "var(--font-dm-mono)", fontSize: "12px", color: "#ffffff" }, children: item.label })
            },
            item.label
          )) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { style: { fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "6px", lineHeight: 1.5 }, children: "Drag gold port \u2192 input port to connect \xB7 click edge to delete" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", gap: "8px", flexShrink: 0 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "button",
            {
              onClick: () => setShowChat((v) => !v),
              style: {
                background: showChat ? "rgba(180,148,80,0.15)" : "transparent",
                border: `1px solid ${showChat ? "rgba(180,148,80,0.6)" : "rgba(180,148,80,0.25)"}`,
                padding: "8px 18px",
                fontSize: "12px",
                color: showChat ? "#b49450" : "rgba(180,148,80,0.5)",
                cursor: "pointer",
                fontFamily: "var(--font-dm-mono)",
                letterSpacing: "0.1em",
                textTransform: "uppercase"
              },
              children: "AI \u2726"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "button",
            {
              onClick: () => {
                if (saveTimer.current) clearTimeout(saveTimer.current);
                setSaveStatus("saving");
                fetch(ep.graph, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ graph: latestGraphRef.current })
                }).then(() => {
                  setSaveStatus("saved");
                  setTimeout(() => setSaveStatus("idle"), 2e3);
                }).catch(() => {
                });
              },
              style: {
                background: "rgba(180,148,80,0.08)",
                border: "1px solid rgba(180,148,80,0.4)",
                padding: "8px 18px",
                fontSize: "12px",
                color: "#b49450",
                cursor: "pointer",
                fontFamily: "var(--font-dm-mono)",
                letterSpacing: "0.1em",
                textTransform: "uppercase"
              },
              children: saveStatus === "saving" ? "saving..." : saveStatus === "saved" ? "saved \u2713" : "save graph"
            }
          )
        ] })
      ] }),
      paletteDrag && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: {
        position: "fixed",
        left: paletteDrag.x - NODE_W / 2,
        top: paletteDrag.y - HEADER_H / 2,
        width: NODE_W,
        pointerEvents: "none",
        zIndex: 9999,
        border: "1px solid rgba(180,148,80,0.6)",
        background: "rgba(12,12,12,0.92)",
        opacity: 0.85,
        padding: "10px 12px"
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { style: { fontFamily: "var(--font-dm-mono)", fontSize: "10px", color: "rgba(180,148,80,0.7)", letterSpacing: "0.12em", textTransform: "uppercase" }, children: [
          paletteDrag.type,
          paletteDrag.qtype ? ` \xB7 ${paletteDrag.qtype}` : ""
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { style: { fontFamily: "var(--font-dm-mono)", fontSize: "12px", color: "#ffffff", marginTop: "3px" }, children: "New node" })
      ] })
    ] }),
    showChat && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { width: "300px", flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden" }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      GraphChat,
      {
        graph,
        onGraphChange: (g) => {
          updateGraph(g);
          setSelected(null);
        },
        endpoint: ep.graphChat
      }
    ) })
  ] });
}

// src/components/ContextEditor.tsx
var import_react3 = require("react");
var import_jsx_runtime3 = require("react/jsx-runtime");
var mono2 = { fontFamily: "var(--font-dm-mono)" };
var textareaStyle = {
  ...mono2,
  width: "100%",
  background: "#0e0e0e",
  border: "1px solid rgba(180,148,80,0.2)",
  borderRadius: "2px",
  padding: "16px",
  color: "#f0ead8",
  fontSize: "12px",
  lineHeight: 1.7,
  outline: "none",
  resize: "vertical"
};
function SectionEditor({
  label,
  description,
  value,
  onChange
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { style: { ...mono2, fontSize: "10px", color: "#b49450", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "2px" }, children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { style: { ...mono2, fontSize: "10px", color: "#444", lineHeight: 1.5 }, children: description })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "textarea",
      {
        value,
        onChange: (e) => onChange(e.target.value),
        rows: 16,
        style: textareaStyle,
        onFocus: (e) => {
          e.currentTarget.style.borderColor = "rgba(180,148,80,0.5)";
        },
        onBlur: (e) => {
          e.currentTarget.style.borderColor = "rgba(180,148,80,0.2)";
        }
      }
    )
  ] });
}
function ContextEditor({
  endpoint = "/api/admin/context",
  defaultAsk = "",
  defaultRecommend = ""
}) {
  const [sections, setSections] = (0, import_react3.useState)({ ask: defaultAsk, recommend: defaultRecommend });
  const [savedAt, setSavedAt] = (0, import_react3.useState)(null);
  const [saving, setSaving] = (0, import_react3.useState)(false);
  const [saveLabel, setSaveLabel] = (0, import_react3.useState)("Save changes");
  (0, import_react3.useEffect)(() => {
    fetch(endpoint).then((r) => r.json()).then(({ sections: s, updatedAt }) => {
      if (s) setSections(s);
      setSavedAt(updatedAt);
    }).catch(() => {
    });
  }, [endpoint]);
  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections })
      });
      setSaveLabel("Saved \u2713");
      setSavedAt((/* @__PURE__ */ new Date()).toISOString());
      setTimeout(() => setSaveLabel("Save changes"), 2e3);
    } catch {
      setSaveLabel("Error \u2014 try again");
      setTimeout(() => setSaveLabel("Save changes"), 2e3);
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: "32px", width: "100%" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      SectionEditor,
      {
        label: "Conversation prompt",
        description: "Claude reads this before generating each question. Edit the persona, rules, and any neighborhood intel.",
        value: sections.ask,
        onChange: (v) => setSections((s) => ({ ...s, ask: v }))
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      SectionEditor,
      {
        label: "Recommendation prompt",
        description: "Claude reads this when generating the final neighborhood recommendation.",
        value: sections.recommend,
        onChange: (v) => setSections((s) => ({ ...s, recommend: v }))
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
      savedAt && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("p", { style: { ...mono2, fontSize: "10px", color: "#444" }, children: [
        "last saved ",
        new Date(savedAt).toLocaleString()
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "button",
        {
          onClick: handleSave,
          disabled: saving,
          style: {
            ...mono2,
            background: "#b49450",
            color: "#0e0e0e",
            border: "none",
            borderRadius: "2px",
            padding: "8px 20px",
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.6 : 1,
            marginLeft: "auto"
          },
          children: saveLabel
        }
      )
    ] })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ContextEditor,
  GraphChat,
  GraphEditor
});
//# sourceMappingURL=index.js.map