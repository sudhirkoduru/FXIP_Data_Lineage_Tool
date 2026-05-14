import React from "react";
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
}

const FilterPanel: React.FC<FilterPanelProps> = ({ active, onChange }) => {
  const toggle = (key: string) => {
    if (active.includes(key)) {
      onChange(active.filter(k => k !== key));
    } else {
      onChange([...active, key]);
    }
  };

  return (
    <div
      style={{
        width: 210,
        flexShrink: 0,
        background: "#071a33",
        borderRight: "1px solid #0d2a4a",
        display: "flex",
        flexDirection: "column",
        padding: "16px 12px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#4B6E8B",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          fontWeight: 700,
          marginBottom: 10,
          paddingLeft: 4,
        }}
      >
        Filter by Type
      </div>

      {TYPES.map(({ key, label, color }) => {
        const on = active.length === 0 || active.includes(key);
        return (
          <button
            key={key}
            onClick={() => toggle(key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              width: "100%",
              background: on ? color + "18" : "transparent",
              border: `1px solid ${on ? color + "50" : "#0d2a4a"}`,
              borderRadius: 7,
              padding: "7px 10px",
              cursor: "pointer",
              marginBottom: 5,
              color: on ? color : "#2D5070",
              fontSize: 12,
              fontWeight: on ? 700 : 400,
              transition: "all 0.15s",
              textAlign: "left",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: on ? color : "#0d2a4a",
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
            width: "100%",
            marginTop: 6,
            background: "transparent",
            border: "1px solid #1a3a5c",
            borderRadius: 7,
            color: "#ED1C2E",
            fontSize: 11,
            padding: "6px 0",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Show All
        </button>
      )}

      <div style={{ margin: "18px 0 12px", borderTop: "1px solid #0d2a4a" }} />

      <div
        style={{
          fontSize: 10,
          color: "#4B6E8B",
          textTransform: "uppercase",
          letterSpacing: "1px",
          fontWeight: 700,
          marginBottom: 8,
          paddingLeft: 4,
        }}
      >
        Edge Legend
      </div>
      {[
        { color: "#ED1C2E", label: "produces ? topic"  },
        { color: "#7C3AED", label: "consumes from topic" },
        { color: "#10B981", label: "? external system"  },
        { color: "#0078D2", label: "? calls service"    },
      ].map(({ color, label }) => (
        <div
          key={label}
          style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, paddingLeft: 4 }}
        >
          <div style={{ width: 22, height: 2, background: color, borderRadius: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "#2D5070" }}>{label}</span>
        </div>
      ))}

      <div style={{ marginTop: "auto", paddingTop: 20, textAlign: "center" }}>
        <div style={{ fontSize: 9, color: "#1a3a5c", lineHeight: 1.6 }}>
          FXIP Platform Team
          <br />� American Airlines
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
