import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { NODE_COLORS } from "../data/lineage";

const TYPES = [
  { key: "api",       label: "APIs / Services",  color: NODE_COLORS.api       },
  { key: "processor", label: "Processors",        color: NODE_COLORS.processor },
  { key: "adapter",   label: "Adapters",          color: NODE_COLORS.adapter   },
  { key: "mgw",       label: "MGW / BCP",         color: NODE_COLORS.mgw       },
  { key: "tool",      label: "Tools",             color: NODE_COLORS.tool      },
  { key: "kafka",     label: "Kafka Topics",      color: NODE_COLORS.kafka     },
  { key: "external",  label: "External Systems",  color: NODE_COLORS.external  },
];

interface FilterPanelProps {
  active: string[];
  onChange: (filters: string[]) => void;
  currentView: "graph" | "catalog" | "glossary";
  onViewChange: (v: "graph" | "catalog" | "glossary") => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ active, onChange, currentView, onViewChange }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleFilter = (key: string) => {
    if (active.includes(key)) {
      onChange(active.filter(k => k !== key));
    } else {
      onChange([...active, key]);
    }
  };

  return (
    <div
      style={{
        width: collapsed ? 36 : 210,
        flexShrink: 0,
        background: "var(--c-bg-sidebar)",
        borderRight: "1px solid var(--c-border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "width 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
      }}
    >
      {/* ── Collapse / expand strip ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-end",
          padding: collapsed ? "14px 0" : "10px 8px 6px",
          borderBottom: "1px solid var(--c-border)",
          flexShrink: 0,
        }}
      >
        {collapsed && (
          <div
            style={{
              writingMode: "vertical-rl",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "var(--c-text-muted)",
              marginBottom: 10,
            }}
          >
            MENU
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? "Expand panel" : "Collapse panel"}
          style={{
            background: "transparent",
            border: "1px solid var(--c-border)",
            borderRadius: 6,
            cursor: "pointer",
            color: "var(--c-text-muted)",
            padding: "4px 5px",
            display: "flex",
            alignItems: "center",
            transition: "background 0.15s, color 0.15s",
            marginTop: collapsed ? 6 : 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "var(--c-bg-elevated)";
            e.currentTarget.style.color = "var(--c-text-2)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--c-text-muted)";
          }}
        >
          <ChevronLeft
            size={14}
            style={{
              transform: collapsed ? "rotate(180deg)" : "none",
              transition: "transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </button>
      </div>

      {/* ── Scrollable content (hidden when collapsed) ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "14px 10px",
          opacity: collapsed ? 0 : 1,
          transition: "opacity 0.15s ease",
          pointerEvents: collapsed ? "none" : "auto",
          minWidth: 190,
        }}
      >
        {/* ── View switcher ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 10, color: "var(--c-text-muted)", textTransform: "uppercase",
            letterSpacing: "1.5px", fontWeight: 700, marginBottom: 8, paddingLeft: 4,
          }}>
            View
          </div>
          {([
            { id: "graph",   icon: "⬡", label: "Graph View"  },
            { id: "catalog", icon: "📦", label: "Data Catalog" },
            { id: "glossary",icon: "📖", label: "Glossary"     },
          ] as const).map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              style={{
                display: "flex", alignItems: "center", gap: 9, width: "100%",
                background: currentView === id ? "#1097c81a" : "transparent",
                border: `1px solid ${currentView === id ? "#1097c866" : "var(--c-border)"}`,
                borderRadius: 7, padding: "8px 10px", cursor: "pointer",
                color: currentView === id ? "#1097c8" : "var(--c-text-2)",
                fontSize: 12, fontWeight: currentView === id ? 700 : 500,
                marginBottom: 5, textAlign: "left", transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 14 }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        <div style={{ borderTop: "1px solid var(--c-border)", marginBottom: 14 }} />

        {/* ── Filter by Type ── */}
        <div style={{
          fontSize: 10, color: "var(--c-text-muted)", textTransform: "uppercase",
          letterSpacing: "1.5px", fontWeight: 700, marginBottom: 10, paddingLeft: 4,
          opacity: currentView === "catalog" ? 0.4 : 1,
        }}>
          Filter by Type
        </div>

        {TYPES.map(({ key, label, color }) => {
          const on = active.length === 0 || active.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggleFilter(key)}
              style={{
                display: "flex", alignItems: "center", gap: 9, width: "100%",
                background: on ? color + "18" : "transparent",
                border: `1px solid ${on ? color + "55" : "var(--c-border)"}`,
                borderRadius: 7, padding: "7px 10px", cursor: "pointer",
                marginBottom: 5,
                color: on ? color : "var(--c-text-2)",
                fontSize: 12, fontWeight: on ? 700 : 500,
                transition: "all 0.15s", textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 10, height: 10, borderRadius: 3,
                  background: on ? color : "var(--c-border)",
                  flexShrink: 0,
                  boxShadow: on ? `0 0 6px ${color}88` : "none",
                  transition: "all 0.15s",
                }}
              />
              {label}
            </button>
          );
        })}

        {active.length > 0 && (
          <button
            onClick={() => onChange([])}
            style={{
              width: "100%", marginTop: 6,
              background: "transparent",
              border: "1px solid var(--c-border)",
              borderRadius: 7,
              color: "#c8102e",
              fontSize: 11, padding: "6px 0",
              cursor: "pointer", fontWeight: 600,
            }}
          >
            Show All
          </button>
        )}

        <div style={{ margin: "16px 0 12px", borderTop: "1px solid var(--c-border)" }} />

        {/* ── Edge Legend ── */}
        <div style={{
          fontSize: 10, color: "var(--c-text-muted)", textTransform: "uppercase",
          letterSpacing: "1px", fontWeight: 700, marginBottom: 8, paddingLeft: 4,
        }}>
          Edge Legend
        </div>
        {[
          { color: "#c8102e", label: "produces → topic"    },
          { color: "#7C3AED", label: "consumes from topic" },
          { color: "#10B981", label: "→ external system"   },
          { color: "#0078D2", label: "→ calls service"     },
        ].map(({ color, label }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, paddingLeft: 4 }}
          >
            <div style={{ width: 22, height: 2, background: color, borderRadius: 1, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "var(--c-text-3)" }}>{label}</span>
          </div>
        ))}

        <div style={{ marginTop: "auto", paddingTop: 20, textAlign: "center" }}>
          <div style={{ fontSize: 9, color: "var(--c-text-muted)", lineHeight: 1.6 }}>
            FXIP Platform Team
            <br />© American Airlines
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
