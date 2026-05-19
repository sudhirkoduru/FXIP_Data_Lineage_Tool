import React from "react";
import { Search, Plane, X, Sun, Moon } from "lucide-react";
import { services, kafkaTopics, externalSystems } from "../data/lineage";
import { useTheme } from "../context/ThemeContext";

interface HeaderProps {
  searchValue: string;
  onSearchChange: (v: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchValue, onSearchChange }) => {
  const { isDark, toggle } = useTheme();

  return (
    <header
      style={{
        height: 60,
        background: "#004b87",
        borderBottom: "3px solid #c8102e",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 20,
        flexShrink: 0,
        zIndex: 100,
        boxSizing: "border-box",
        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
      }}
    >
      {/* AA Logo — dual-logo pill matching Flight Info Service */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 6,
          padding: "4px 10px",
          display: "flex",
          alignItems: "center",
          gap: 0,
          marginRight: 14,
          flexShrink: 0,
          boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
        }}
      >
        <img
          src={`${import.meta.env.BASE_URL}American-Airlines.png`}
          alt="American Airlines"
          style={{ height: 28, width: "auto", display: "block" }}
        />
        <div
          style={{
            width: 1,
            height: 22,
            background: "rgba(12,35,64,0.18)",
            margin: "0 8px",
            flexShrink: 0,
          }}
        />
        <img
          src={`${import.meta.env.BASE_URL}aa-logo.png`}
          alt="American Airlines Centennial"
          style={{ height: 34, width: "auto", display: "block" }}
        />
      </div>

      {/* Tool title */}
      <div style={{ flexShrink: 0 }}>
        <div
          style={{
            fontSize: 10,
            color: "#7BAFD4",
            letterSpacing: "2px",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          FXIP Platform
        </div>
        <div
          style={{
            fontSize: 17,
            color: "#FFFFFF",
            fontWeight: 800,
            lineHeight: 1.15,
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <Plane size={15} color="#c8102e" style={{ transform: "rotate(45deg)" }} />
          Data Lineage Tool
        </div>
      </div>

      {/* Search bar */}
      <div
        style={{
          flex: 1,
          maxWidth: 440,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 28,
          padding: "7px 16px",
          gap: 9,
        }}
      >
        <Search size={13} color="#7BAFD4" />
        <input
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search services, Kafka topics, external systems..."
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#e2e8f0",
            fontSize: 13,
            flex: 1,
            caretColor: "#c8102e",
          }}
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange("")}
            style={{
              background: "none",
              border: "none",
              color: "#4B6E8B",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Stats */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          gap: 16,
          alignItems: "center",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          paddingLeft: 20,
        }}
      >
        {[
          { n: services.length,        label: "Services" },
          { n: kafkaTopics.length,     label: "Topics"   },
          { n: externalSystems.length, label: "External" },
        ].map(({ n, label }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1097c8", lineHeight: 1 }}>
              {n}
            </div>
            <div
              style={{
                fontSize: 9,
                color: "#4B6E8B",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Dark / Light mode toggle */}
      <button
        onClick={toggle}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 20,
          padding: "5px 12px",
          cursor: "pointer",
          color: isDark ? "#FFD700" : "#7BAFD4",
          fontSize: 11,
          fontWeight: 600,
          transition: "all 0.2s",
          marginLeft: 8,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
      >
        {isDark ? <Sun size={14} /> : <Moon size={14} />}
        <span style={{ display: "none" }}>{isDark ? "Light" : "Dark"}</span>
      </button>
    </header>
  );
};

export default Header;
