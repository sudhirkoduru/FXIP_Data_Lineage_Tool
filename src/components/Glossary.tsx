import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, BookOpen, Globe, ChevronRight, Copy, Check, Star } from "lucide-react";
import {
  glossaryTerms, aviationCodes,
  CATEGORY_META,
} from "../data/glossary";
import type { GlossaryCategory, AviationCode, CodeType } from "../data/glossary";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'glossary', label: '📖 Glossary', icon: BookOpen },
  { id: 'codes',    label: '🌐 ICAO / IATA Codes', icon: Globe },
] as const;
type MainTab = typeof TABS[number]['id'];

const CODE_SUB: { id: CodeType; label: string; color: string }[] = [
  { id: 'icao-airline', label: 'ICAO Airline', color: '#0078D2' },
  { id: 'iata-airline', label: 'IATA Airline', color: '#10B981' },
  { id: 'icao-airport', label: 'ICAO Airport', color: '#7C3AED' },
  { id: 'iata-airport', label: 'IATA Airport', color: '#F59E0B' },
];

const useCopy = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (val: string) => {
    navigator.clipboard.writeText(val).catch(() => {});
    setCopied(val);
    setTimeout(() => setCopied(null), 1600);
  };
  return { copied, copy };
};

// ─────────────────────────────────────────────────────────────────────────────
// Glossary Term Card
// ─────────────────────────────────────────────────────────────────────────────
const TermCard = ({
  term, isOpen, onToggle, highlighted,
}: {
  term: typeof glossaryTerms[0];
  isOpen: boolean;
  onToggle: () => void;
  highlighted: string;
}) => {
  const meta = CATEGORY_META[term.category];

  const highlight = (text: string) => {
    if (!highlighted) return text;
    const idx = text.toLowerCase().indexOf(highlighted.toLowerCase());
    if (idx < 0) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: '#F59E0B44', color: '#fbbf24', borderRadius: 2, padding: '0 1px' }}>
          {text.slice(idx, idx + highlighted.length)}
        </mark>
        {text.slice(idx + highlighted.length)}
      </>
    );
  };

  return (
    <div
      style={{
        background: isOpen ? 'var(--c-bg-elevated)' : 'var(--c-bg-card)',
        border: `1px solid ${isOpen ? meta.color + '55' : 'var(--c-border)'}`,
        borderLeft: `3px solid ${meta.color}`,
        borderRadius: 10,
        marginBottom: 8,
        overflow: 'hidden',
        transition: 'all 0.2s',
        boxShadow: isOpen ? `0 0 16px ${meta.color}22` : 'none',
      }}
    >
      {/* Header row — always visible */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '12px 16px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12,
        }}
      >
        <ChevronRight
          size={14}
          color={meta.color}
          style={{ flexShrink: 0, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--c-text-1)', letterSpacing: '0.3px' }}>
              {highlight(term.term)}
            </span>
            <span style={{
              fontSize: 10, background: meta.color + '22', color: meta.color,
              border: `1px solid ${meta.color}44`, borderRadius: 20,
              padding: '2px 8px', fontWeight: 700, flexShrink: 0,
            }}>
              {meta.icon} {meta.label}
            </span>
          </div>
          {term.expansion && (
            <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 2 }}>
              {highlight(term.expansion)}
            </div>
          )}
        </div>
      </button>

      {/* Expanded body */}
      {isOpen && (
        <div style={{ padding: '0 16px 14px 42px', borderTop: `1px solid ${meta.color}22` }}>
          <div style={{ fontSize: 12, color: 'var(--c-text-3)', lineHeight: 1.8, marginTop: 12 }}>
            {term.definition}
          </div>

          {term.context && (
            <div style={{
              marginTop: 12, padding: '10px 12px', background: 'var(--c-bg-app)',
              borderRadius: 8, borderLeft: `3px solid ${meta.color}`,
            }}>
              <div style={{ fontSize: 10, color: meta.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 5 }}>
                FXIP Context
              </div>
              <div style={{ fontSize: 11, color: 'var(--c-text-link)', lineHeight: 1.7 }}>{term.context}</div>
            </div>
          )}

          {term.source && (
            <div style={{ marginTop: 10, fontSize: 10, color: 'var(--c-text-muted)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <span style={{ color: 'var(--c-text-muted)', fontWeight: 700, flexShrink: 0 }}>Source:</span>
              <span style={{ fontStyle: 'italic' }}>{term.source}</span>
            </div>
          )}

          {term.relatedTerms && term.relatedTerms.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: 'var(--c-text-muted)', fontWeight: 700 }}>See also:</span>
              {term.relatedTerms.map(r => {
                const rel = glossaryTerms.find(t => t.id === r);
                return rel ? (
                  <span key={r} style={{
                    fontSize: 10, background: 'var(--c-bg-elevated)', color: '#009FDA',
                    border: '1px solid #009FDA33', borderRadius: 20,
                    padding: '2px 8px', cursor: 'default',
                  }}>{rel.term}</span>
                ) : null;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Aviation Code Row
// ─────────────────────────────────────────────────────────────────────────────
const CodeRow = ({ c, color, onCopy, copied }: {
  c: AviationCode; color: string; onCopy: (v: string) => void; copied: string | null;
}) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '90px 1fr auto',
    alignItems: 'start',
    padding: '10px 14px',
    borderBottom: '1px solid var(--c-border)',
    gap: 12,
    transition: 'background 0.15s',
  }}
    onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-bg-elevated)')}
    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
  >
    {/* Code + copy */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <code style={{ fontSize: 14, fontWeight: 900, color, letterSpacing: '1px' }}>{c.code}</code>
      {c.hub && (
        <Star size={10} fill="#F59E0B" color="#F59E0B" aria-label="AA Hub" />
      )}
      <button
        onClick={() => onCopy(c.code)}
        title="Copy code"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: copied === c.code ? '#10B981' : 'var(--c-text-dim)',
          padding: 2, display: 'flex', alignItems: 'center',
        }}
      >
        {copied === c.code ? <Check size={11} /> : <Copy size={11} />}
      </button>
    </div>

    {/* Name + metadata */}
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-2)' }}>{c.name}</div>
      {c.city && (
        <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 1 }}>{c.city} · {c.country}</div>
      )}
      {!c.city && c.country && (
        <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 1 }}>{c.country}</div>
      )}
      {c.notes && (
        <div style={{ fontSize: 10, color: 'var(--c-text-dim)', marginTop: 3, fontStyle: 'italic' }}>{c.notes}</div>
      )}
    </div>

    {/* Hub badge */}
    {c.hub && (
      <span style={{
        fontSize: 9, background: '#F59E0B22', color: '#F59E0B',
        border: '1px solid #F59E0B44', borderRadius: 20, padding: '2px 6px',
        fontWeight: 800, flexShrink: 0,
      }}>HUB</span>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Glossary Component
// ─────────────────────────────────────────────────────────────────────────────
const Glossary: React.FC = () => {
  const [mainTab, setMainTab] = useState<MainTab>('glossary');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<GlossaryCategory | 'all'>('all');
  const [codeType, setCodeType] = useState<CodeType>('icao-airport');
  const [openTerm, setOpenTerm] = useState<string | null>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const letterRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { copied, copy } = useCopy();

  const term = search.toLowerCase().trim();

  // Filtered glossary terms
  const filteredTerms = useMemo(() => {
    return glossaryTerms.filter(t =>
      (catFilter === 'all' || t.category === catFilter) &&
      (!term || t.term.toLowerCase().includes(term) ||
        (t.expansion ?? '').toLowerCase().includes(term) ||
        t.definition.toLowerCase().includes(term) ||
        (t.context ?? '').toLowerCase().includes(term))
    ).sort((a, b) => a.term.localeCompare(b.term));
  }, [catFilter, term]);

  // Group by first letter
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filteredTerms>();
    for (const t of filteredTerms) {
      const letter = t.term[0].toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(t);
    }
    return map;
  }, [filteredTerms]);

  const letters = useMemo(() => Array.from(grouped.keys()).sort(), [grouped]);

  // Auto-open single result
  useEffect(() => {
    if (filteredTerms.length === 1) setOpenTerm(filteredTerms[0].id);
    else if (!filteredTerms.find(t => t.id === openTerm)) setOpenTerm(null);
  }, [filteredTerms]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filtered codes
  const filteredCodes = useMemo(() => {
    return aviationCodes
      .filter(c => c.type === codeType &&
        (!term || c.code.toLowerCase().includes(term) ||
          c.name.toLowerCase().includes(term) ||
          (c.city ?? '').toLowerCase().includes(term) ||
          (c.country ?? '').toLowerCase().includes(term) ||
          (c.notes ?? '').toLowerCase().includes(term))
      )
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [codeType, term]);

  const codeColor = CODE_SUB.find(c => c.id === codeType)?.color ?? '#0078D2';
  const hubCount = filteredCodes.filter(c => c.hub).length;

  const scrollToLetter = (l: string) => {
    setActiveLetter(l);
    letterRefs.current[l]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => setActiveLetter(null), 1000);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--c-bg-app)', color: 'var(--c-text-2)', fontFamily: 'system-ui, sans-serif',
    }}>
      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--c-bg-sidebar) 0%, var(--c-bg-card) 60%, var(--c-bg-app) 100%)',
        borderBottom: '1px solid var(--c-border)',
        padding: '20px 28px 16px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #0078D2, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>📖</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--c-text-1)', lineHeight: 1.2 }}>
              Glossary & Aviation Codes
            </div>
            <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 2 }}>
              {glossaryTerms.length} terms · {aviationCodes.filter(c => c.type.includes('airline')).length} airline codes · {aviationCodes.filter(c => c.type.includes('airport')).length} airport codes
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-muted)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={mainTab === 'glossary' ? 'Search terms, acronyms, definitions…' : 'Search code, airport name, city…'}
            style={{
              width: '100%', padding: '10px 14px 10px 36px', fontSize: 13,
              background: 'var(--c-bg-elevated)', border: '1.5px solid var(--c-border)', borderRadius: 10,
              color: 'var(--c-text-2)', outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.target.style.borderColor = '#0078D2')}
            onBlur={e => (e.target.style.borderColor = 'var(--c-border)')}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--c-text-muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1,
              }}
            >×</button>
          )}
        </div>

        {/* Main tabs */}
        <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setMainTab(t.id)} style={{
              flex: 1, padding: '8px 0', fontSize: 12, fontWeight: mainTab === t.id ? 800 : 500,
              color: mainTab === t.id ? 'var(--c-text-1)' : 'var(--c-text-muted)',
              background: mainTab === t.id ? '#0078D222' : 'transparent',
              border: `1px solid ${mainTab === t.id ? '#0078D266' : 'var(--c-border)'}`,
              borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── Glossary Tab ─────────────────────────────────────────────────── */}
      {mainTab === 'glossary' && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Left: category filters + A-Z jump */}
          <div style={{
            width: 170, flexShrink: 0, borderRight: '1px solid var(--c-border)',
            background: 'var(--c-bg-panel)', display: 'flex', flexDirection: 'column',
            padding: '12px 10px', overflowY: 'auto',
          }}>
            <div style={{ fontSize: 9, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 800, marginBottom: 8, paddingLeft: 2 }}>
              Category
            </div>
            {/* All button */}
            <button onClick={() => setCatFilter('all')} style={{
              display: 'flex', alignItems: 'center', gap: 7, width: '100%',
              background: catFilter === 'all' ? '#0078D222' : 'none',
              border: `1px solid ${catFilter === 'all' ? '#0078D266' : 'transparent'}`,
              borderRadius: 7, padding: '6px 8px', cursor: 'pointer',
              color: catFilter === 'all' ? 'var(--c-text-2)' : 'var(--c-text-muted)',
              fontSize: 11, fontWeight: catFilter === 'all' ? 700 : 400,
              marginBottom: 3, textAlign: 'left',
            }}>
              <span style={{ fontSize: 13 }}>📚</span> All ({glossaryTerms.length})
            </button>
            {(Object.entries(CATEGORY_META) as [GlossaryCategory, typeof CATEGORY_META[GlossaryCategory]][]).map(([cat, meta]) => {
              const count = glossaryTerms.filter(t => t.category === cat).length;
              const active = catFilter === cat;
              return (
                <button key={cat} onClick={() => setCatFilter(active ? 'all' : cat)} style={{
                  display: 'flex', alignItems: 'center', gap: 7, width: '100%',
                  background: active ? meta.color + '22' : 'none',
                  border: `1px solid ${active ? meta.color + '55' : 'transparent'}`,
                  borderRadius: 7, padding: '6px 8px', cursor: 'pointer',
                  color: active ? meta.color : 'var(--c-text-muted)',
                  fontSize: 11, fontWeight: active ? 700 : 400,
                  marginBottom: 3, textAlign: 'left', transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: 13 }}>{meta.icon}</span>
                  <span style={{ flex: 1 }}>{meta.label}</span>
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{count}</span>
                </button>
              );
            })}

            {/* A-Z jump */}
            {letters.length > 2 && (
              <>
                <div style={{ margin: '14px 0 8px', borderTop: '1px solid var(--c-border)' }} />
                <div style={{ fontSize: 9, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 800, marginBottom: 8, paddingLeft: 2 }}>
                  Jump to
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {letters.map(l => (
                    <button key={l} onClick={() => scrollToLetter(l)} style={{
                      width: 26, height: 26, borderRadius: 5,
                      background: activeLetter === l ? '#0078D2' : 'var(--c-bg-elevated)',
                      border: `1px solid ${activeLetter === l ? '#0078D2' : 'var(--c-border)'}`,
                      color: activeLetter === l ? '#fff' : 'var(--c-text-muted)',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    }}>{l}</button>
                  ))}
                </div>
              </>
            )}

            {/* Stats */}
            <div style={{ marginTop: 'auto', paddingTop: 14, fontSize: 10, color: 'var(--c-text-dim)', textAlign: 'center', lineHeight: 1.7 }}>
              {filteredTerms.length} term{filteredTerms.length !== 1 ? 's' : ''} shown
            </div>
          </div>

          {/* Right: term list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            {filteredTerms.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--c-text-muted)', paddingTop: 60 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>No terms match "{search}"</div>
                <button onClick={() => { setSearch(''); setCatFilter('all'); }} style={{
                  marginTop: 12, background: 'none', border: '1px solid var(--c-border)',
                  borderRadius: 8, color: 'var(--c-text-muted)', fontSize: 12, padding: '6px 16px', cursor: 'pointer',
                }}>Clear filters</button>
              </div>
            ) : (
              letters.map(letter => (
                <div key={letter} ref={el => { letterRefs.current[letter] = el; }} style={{ marginBottom: 6 }}>
                  {/* Letter divider */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
                    position: 'sticky', top: 0, background: 'var(--c-bg-app)', zIndex: 1, paddingTop: 4, paddingBottom: 4,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, background: 'var(--c-bg-elevated)',
                      border: '1px solid var(--c-border)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 16, fontWeight: 900, color: 'var(--c-text-muted)', flexShrink: 0,
                    }}>{letter}</div>
                    <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
                    <span style={{ fontSize: 10, color: 'var(--c-text-dim)' }}>
                      {grouped.get(letter)?.length} term{grouped.get(letter)!.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {grouped.get(letter)!.map(t => (
                    <TermCard
                      key={t.id}
                      term={t}
                      isOpen={openTerm === t.id}
                      onToggle={() => setOpenTerm(openTerm === t.id ? null : t.id)}
                      highlighted={search}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Aviation Codes Tab ───────────────────────────────────────────── */}
      {mainTab === 'codes' && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'column' }}>

          {/* Code type selector */}
          <div style={{
            display: 'flex', gap: 8, padding: '12px 20px',
            background: 'var(--c-bg-panel)', borderBottom: '1px solid var(--c-border)', flexShrink: 0, flexWrap: 'wrap',
          }}>
            {CODE_SUB.map(cs => (
              <button key={cs.id} onClick={() => setCodeType(cs.id)} style={{
                padding: '7px 16px', fontSize: 12, fontWeight: codeType === cs.id ? 800 : 500,
                background: codeType === cs.id ? cs.color + '22' : 'transparent',
                border: `1.5px solid ${codeType === cs.id ? cs.color : 'var(--c-border)'}`,
                borderRadius: 20, cursor: 'pointer', color: codeType === cs.id ? cs.color : 'var(--c-text-muted)',
                transition: 'all 0.15s',
              }}>
                {cs.label}
                <span style={{
                  marginLeft: 6, fontSize: 10,
                  background: codeType === cs.id ? cs.color + '33' : 'var(--c-bg-elevated)',
                  borderRadius: 10, padding: '1px 6px',
                }}>
                  {aviationCodes.filter(c => c.type === cs.id).length}
                </span>
              </button>
            ))}
          </div>

          {/* Stats + hub legend */}
          <div style={{
            padding: '8px 20px', background: 'var(--c-bg-panel)', borderBottom: '1px solid var(--c-border)',
            display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>
              {filteredCodes.length} of {aviationCodes.filter(c => c.type === codeType).length} codes
              {term && ` matching "${search}"`}
            </span>
            {codeType.includes('airport') && hubCount > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#F59E0B' }}>
                <Star size={10} fill="#F59E0B" color="#F59E0B" />
                {hubCount} AA hub{hubCount !== 1 ? 's' : ''}
              </span>
            )}
            <span style={{ fontSize: 10, color: 'var(--c-text-dim)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Copy size={10} /> Click code to copy
            </span>
          </div>

          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '90px 1fr auto',
            padding: '8px 14px', gap: 12,
            background: 'var(--c-bg-elevated)', borderBottom: '1px solid var(--c-border)', flexShrink: 0,
          }}>
            {['CODE', 'NAME / DETAILS', ''].map(h => (
              <div key={h} style={{ fontSize: 10, color: 'var(--c-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</div>
            ))}
          </div>

          {/* Code rows */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredCodes.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--c-text-muted)', paddingTop: 60 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>No codes match "{search}"</div>
                <button onClick={() => setSearch('')} style={{
                  marginTop: 12, background: 'none', border: '1px solid var(--c-border)',
                  borderRadius: 8, color: 'var(--c-text-muted)', fontSize: 12, padding: '6px 16px', cursor: 'pointer',
                }}>Clear search</button>
              </div>
            ) : (
              filteredCodes.map(c => (
                <CodeRow key={c.code + c.type} c={c} color={codeColor} onCopy={copy} copied={copied} />
              ))
            )}
          </div>

          {/* Code type explainer */}
          <div style={{
            padding: '10px 20px', background: 'var(--c-bg-panel)', borderTop: '1px solid var(--c-border)', flexShrink: 0,
          }}>
            {codeType === 'icao-airline' && (
              <div style={{ fontSize: 11, color: 'var(--c-text-muted)', lineHeight: 1.6 }}>
                <span style={{ color: '#0078D2', fontWeight: 700 }}>ICAO 3-letter airline designators</span> — used in ATC flight plans (ICAO FPLN Item 7), ACARS AirlineCode.ICAO field, and OpsHub flight event topics. Defined in ICAO Doc 8585.
              </div>
            )}
            {codeType === 'iata-airline' && (
              <div style={{ fontSize: 11, color: 'var(--c-text-muted)', lineHeight: 1.6 }}>
                <span style={{ color: '#10B981', fontWeight: 700 }}>IATA 2-letter airline codes</span> — used in reservations, ticketing, DCS, OFP XML (AirlineCode.IATA), FOS entries, and FXIP topic suffixes (soar-aa-*, soar-mq-*). Defined in IATA Resolution 762.
              </div>
            )}
            {codeType === 'icao-airport' && (
              <div style={{ fontSize: 11, color: 'var(--c-text-muted)', lineHeight: 1.6 }}>
                <span style={{ color: '#7C3AED', fontWeight: 700 }}>ICAO 4-letter airport location indicators</span> — used in ATC flight plans, ACARS FlightKey (SchedDepICAO, OriginalArrivalICAO), and DPRParams (AlternateStation, OrigArrStation). US airports prefixed with K. Defined in ICAO Doc 7910.
              </div>
            )}
            {codeType === 'iata-airport' && (
              <div style={{ fontSize: 11, color: 'var(--c-text-muted)', lineHeight: 1.6 }}>
                <span style={{ color: '#F59E0B', fontWeight: 700 }}>IATA 3-letter airport codes</span> — used in OpsHub FlightEvent (departureAirport, arrivalAirport), FOS, reservations, and baggage systems. Defined in IATA Standard Schedules Information Manual (SSIM). <Star size={10} fill="#F59E0B" color="#F59E0B" style={{ display: 'inline', verticalAlign: 'middle' }} /> marks AA hubs.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Glossary;
