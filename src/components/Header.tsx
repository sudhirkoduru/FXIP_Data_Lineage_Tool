import React from "react";
import { Search, Plane, X } from "lucide-react";
import { services, kafkaTopics, externalSystems } from "../data/lineage";

interface HeaderProps {
  searchValue: string;
  onSearchChange: (v: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchValue, onSearchChange }) => (
  <header
    style={{
      height: 58,
      background: "#0C2340",
      borderBottom: "3px solid #ED1C2E",
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      gap: 20,
      flexShrink: 0,
      zIndex: 100,
    }}
  >
    {/* AA Logo image */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        flexShrink: 0,
        borderRight: "1px solid rgba(255,255,255,0.12)",
        paddingRight: 20,
        height: "100%",
      }}
    >
      <img
        src="/aa-logo.png"
        alt="American Airlines"
        style={{
          height: 34,
          width: "auto",
          objectFit: "contain",
          display: "block",
        }}
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
        <Plane size={15} color="#ED1C2E" style={{ transform: "rotate(45deg)" }} />
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
        placeholder="Search services, Kafka topics, external systems�"
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          color: "#e2e8f0",
          fontSize: 13,
          flex: 1,
          caretColor: "#ED1C2E",
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
        { n: services.length,          label: "Services" },
        { n: kafkaTopics.length,       label: "Topics"   },
        { n: externalSystems.length,   label: "External" },
      ].map(({ n, label }) => (
        <div key={label} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#009FDA", lineHeight: 1 }}>
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
  </header>
);

export default Header;
