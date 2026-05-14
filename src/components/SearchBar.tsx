import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => (
  <div
    style={{
      position: 'absolute',
      top: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      background: '#0f172a',
      border: '1px solid #334155',
      borderRadius: 24,
      padding: '7px 16px',
      gap: 8,
      minWidth: 300,
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    }}
  >
    <Search size={14} color="#64748b" />
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Search services, topics, systems…"
      style={{
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: '#e2e8f0',
        fontSize: 13,
        flex: 1,
      }}
    />
    {value && (
      <button
        onClick={() => onChange('')}
        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, fontSize: 14 }}
      >
        ✕
      </button>
    )}
  </div>
);

export default SearchBar;
