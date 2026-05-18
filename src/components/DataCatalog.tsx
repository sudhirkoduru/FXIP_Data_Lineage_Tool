import React, { useState, useMemo } from "react";
import { Search, Database, Layers, Zap, ChevronDown, ChevronRight, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { dataObjects, domainEvents, services } from "../data/lineage";
import type { DataObject, DataDomain, Service } from "../data/lineage";

// ── Domain config ─────────────────────────────────────────────────────────────
const DOMAIN_META: Record<DataDomain, { label: string; color: string; icon: string }> = {
  flight:      { label: 'Flight',       color: '#0078D2', icon: '✈' },
  flightplan:  { label: 'Flight Plan',  color: '#7C3AED', icon: '📋' },
  aircraft:    { label: 'Aircraft',     color: '#0EA5E9', icon: '🛩' },
  acars:       { label: 'ACARS',        color: '#ED1C2E', icon: '📡' },
  fuel:        { label: 'Fuel',         color: '#F59E0B', icon: '⛽' },
  crew:        { label: 'Crew',         color: '#10B981', icon: '👤' },
  nav:         { label: 'Navigation',   color: '#14B8A6', icon: '🗺' },
  maintenance: { label: 'Maintenance',  color: '#6B7280', icon: '🔧' },
  tps:         { label: 'TPS',          color: '#059669', icon: '🛫' },
};

// ── FXIP Component type config ────────────────────────────────────────────────
const COMP_TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  api:       { label: 'APIs',       icon: '🔌', color: '#0078D2' },
  processor: { label: 'Processors', icon: '⚙️',  color: '#7C3AED' },
  adapter:   { label: 'Adapters',   icon: '🔄', color: '#0EA5E9' },
  tool:      { label: 'Tools',      icon: '🛠️',  color: '#6B7280' },
};

// ── Object Card ───────────────────────────────────────────────────────────────
const ObjectCard = ({ obj, selected, onClick }: { obj: DataObject; selected: boolean; onClick: () => void }) => {
  const meta = DOMAIN_META[obj.domain];
  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? `${meta.color}22` : 'var(--c-bg-elevated)',
        border: `1.5px solid ${selected ? meta.color : 'var(--c-border)'}`,
        borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
        transition: 'all 0.15s',
        boxShadow: selected ? `0 0 12px ${meta.color}44` : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 14 }}>{meta.icon}</span>
        <span style={{ background: meta.color + '25', color: meta.color, border: `1px solid ${meta.color}44`, borderRadius: 5, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
          {meta.label}
        </span>
        <span style={{ background: 'var(--c-pill-bg)', color: 'var(--c-text-muted)', borderRadius: 5, padding: '1px 7px', fontSize: 10 }}>
          {obj.format.split(' ')[0]}
        </span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-text-1)', marginBottom: 4 }}>{obj.name}</div>
      <div style={{ fontSize: 11, color: 'var(--c-text-muted)', lineHeight: 1.5 }}>{obj.description.slice(0, 100)}{obj.description.length > 100 ? '…' : ''}</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, color: 'var(--c-text-muted)' }}>{obj.fields.length} fields</span>
        <span style={{ color: 'var(--c-border)' }}>·</span>
        <span style={{ fontSize: 10, color: 'var(--c-text-muted)' }}>{obj.usedBy.length} service{obj.usedBy.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
};

// ── Field table ───────────────────────────────────────────────────────────────
const FieldRow = ({ name, type, required, description, example, enums }: {
  name: string; type: string; required: boolean; description: string; example?: string; enums?: string[];
}) => (
  <div style={{
    borderBottom: '1px solid var(--c-border)', padding: '8px 12px',
    background: required ? 'transparent' : 'var(--c-bg-panel)',
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <code style={{ fontSize: 12, color: 'var(--c-code-field)', fontWeight: 700, minWidth: 160, flexShrink: 0 }}>{name}</code>
      <code style={{ fontSize: 11, color: 'var(--c-code-type)', minWidth: 130, flexShrink: 0 }}>{type}</code>
      <span style={{
        fontSize: 9, padding: '2px 5px', borderRadius: 4, flexShrink: 0, marginTop: 1,
        background: required ? 'var(--c-badge-req-bg)' : 'var(--c-badge-opt-bg)',
        color: required ? 'var(--c-badge-req-text)' : 'var(--c-text-muted)', fontWeight: 700,
      }}>{required ? 'required' : 'optional'}</span>
    </div>
    <div style={{ fontSize: 11, color: 'var(--c-text-3)', marginTop: 4, paddingLeft: 2 }}>{description}</div>
    {example && (
      <div style={{ fontSize: 10, color: '#F59E0B', marginTop: 3, paddingLeft: 2 }}>
        e.g. <code style={{ color: 'var(--c-code-val)' }}>{example}</code>
      </div>
    )}
    {enums && enums.length > 0 && (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4, paddingLeft: 2 }}>
        {enums.map(v => (
          <span key={v} style={{ background: '#7C3AED22', color: 'var(--c-code-type)', border: '1px solid #7C3AED44', borderRadius: 4, padding: '1px 6px', fontSize: 9 }}>{v}</span>
        ))}
      </div>
    )}
  </div>
);

// ── Event badge ───────────────────────────────────────────────────────────────
const EventRow = ({ ev }: { ev: typeof domainEvents[0] }) => {
  const svc = services.find(s => s.id === ev.serviceId);
  return (
    <div style={{
      background: 'var(--c-bg-elevated)', borderRadius: 8, padding: '10px 12px', marginBottom: 8,
      borderLeft: `3px solid ${ev.direction === 'incoming' ? '#7C3AED' : '#ED1C2E'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
        {ev.direction === 'incoming'
          ? <ArrowDownLeft size={13} color="#7C3AED" />
          : <ArrowUpRight size={13} color="#ED1C2E" />}
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-1)' }}>{ev.name}</span>
        <span style={{
          fontSize: 10, background: ev.direction === 'incoming' ? '#7C3AED22' : '#ED1C2E22',
          color: ev.direction === 'incoming' ? 'var(--c-ev-in-text)' : 'var(--c-ev-out-text)',
          border: `1px solid ${ev.direction === 'incoming' ? '#7C3AED44' : '#ED1C2E44'}`,
          borderRadius: 5, padding: '1px 6px',
        }}>{ev.direction}</span>
      </div>
      {svc && (
        <div style={{ fontSize: 11, color: '#009FDA', marginBottom: 4 }}>
          {svc.acronym} — {svc.name}
        </div>
      )}
      {ev.topic && (
        <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--c-topic-text)', background: 'var(--c-topic-bg)', borderRadius: 4, padding: '2px 8px', display: 'inline-block', marginBottom: 5 }}>
          {ev.topic}
        </div>
      )}
      <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginBottom: 4 }}>{ev.description}</div>
      <div style={{ fontSize: 10, color: 'var(--c-text-3)' }}>
        <span style={{ color: '#F59E0B', fontWeight: 600 }}>Trigger: </span>{ev.trigger}
      </div>
      {ev.format && (
        <div style={{ fontSize: 10, color: 'var(--c-text-3)', marginTop: 3 }}>
          <span style={{ color: 'var(--c-text-muted)', fontWeight: 600 }}>Format: </span>
          <code style={{ color: 'var(--c-code-field)' }}>{ev.format}</code>
        </div>
      )}
    </div>
  );
};

// ── Sample Payload Viewer ─────────────────────────────────────────────────────
const SamplePayload = ({ payload }: { payload: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 10 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: '1px solid var(--c-border)', borderRadius: 6, color: 'var(--c-text-muted)', fontSize: 11, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
      >
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        Sample Payload
      </button>
      {open && (
        <pre style={{
          marginTop: 6, background: 'var(--c-bg-app)', border: '1px solid var(--c-border)', borderRadius: 8,
          padding: '10px 12px', fontSize: 11, color: 'var(--c-code-field)', overflowX: 'auto',
          fontFamily: 'monospace', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {payload}
        </pre>
      )}
    </div>
  );
};

// ── Detail panel ──────────────────────────────────────────────────────────────
const DetailPanel = ({ obj }: { obj: DataObject }) => {
  const meta = DOMAIN_META[obj.domain];
  const relatedEvents = domainEvents.filter(e => e.dataObjectId === obj.id);
  const relatedServices = services.filter(s => obj.usedBy.includes(s.id));

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {/* header */}
      <div style={{ background: 'var(--c-bg-sidebar)', borderBottom: `3px solid ${meta.color}`, padding: '18px 22px', position: 'sticky', top: 0, zIndex: 1 }}>
        <div style={{ fontSize: 10, color: meta.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px' }}>
          {meta.icon} {meta.label} Domain
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--c-text-1)', marginTop: 5 }}>{obj.name}</div>
        <div style={{ fontSize: 12, color: 'var(--c-text-link)', marginTop: 4 }}>{obj.description}</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
          <span style={{ background: 'var(--c-bg-elevated)', border: '1px solid var(--c-border)', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: 'var(--c-text-link)' }}>
            📄 {obj.source}
          </span>
          <span style={{ background: 'var(--c-bg-elevated)', border: '1px solid var(--c-border)', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: 'var(--c-text-link)' }}>
            ⚙ {obj.format}
          </span>
        </div>
      </div>

      <div style={{ padding: '16px 22px' }}>
        {/* field table */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: 'var(--c-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 10 }}>
            <Layers size={11} style={{ display: 'inline', marginRight: 5 }} />
            Schema Fields ({obj.fields.length})
          </div>
          <div style={{ background: 'var(--c-bg-app)', border: '1px solid var(--c-border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 10, padding: '6px 12px', background: 'var(--c-bg-elevated)', borderBottom: '1px solid var(--c-border)' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-text-muted)', minWidth: 160 }}>FIELD</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-text-muted)', minWidth: 130 }}>TYPE</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-text-muted)' }}>REQ</span>
            </div>
            {obj.fields.map(f => (
              <FieldRow key={f.name} name={f.name} type={f.type} required={f.required} description={f.description} example={f.example} enums={f.enum} />
            ))}
          </div>
        </div>

        {/* used by services */}
        {relatedServices.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: 'var(--c-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 10 }}>
              <Database size={11} style={{ display: 'inline', marginRight: 5 }} />
              Used By ({relatedServices.length} service{relatedServices.length !== 1 ? 's' : ''})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {relatedServices.map(s => (
                <span key={s.id} style={{ background: '#0078D222', color: 'var(--c-code-field)', border: '1px solid #0078D244', borderRadius: 7, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>
                  {s.acronym}
                  <span style={{ fontWeight: 400, color: 'var(--c-text-muted)', fontSize: 10 }}> {s.name}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* related events */}
        {relatedEvents.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: 'var(--c-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 10 }}>
              <Zap size={11} style={{ display: 'inline', marginRight: 5 }} />
              Events Using This Object ({relatedEvents.length})
            </div>
            {relatedEvents.map(ev => (
              <div key={ev.id}>
                <EventRow ev={ev} />
                {ev.samplePayload && <SamplePayload payload={ev.samplePayload} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Service Card ──────────────────────────────────────────────────────────────
const ServiceCard = ({ svc, selected, onClick }: { svc: Service; selected: boolean; onClick: () => void }) => {
  const meta = COMP_TYPE_META[svc.type] ?? COMP_TYPE_META.api;
  const kafkaTotal = svc.kafkaConsumes.length + svc.kafkaProduces.length;
  return (
    <div onClick={onClick} style={{
      background: selected ? `${meta.color}22` : 'var(--c-bg-elevated)',
      border: `1.5px solid ${selected ? meta.color : 'var(--c-border)'}`,
      borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
      transition: 'all 0.15s',
      boxShadow: selected ? `0 0 12px ${meta.color}44` : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 14 }}>{meta.icon}</span>
        <span style={{ background: meta.color + '25', color: meta.color, border: `1px solid ${meta.color}44`, borderRadius: 5, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
          {svc.acronym}
        </span>
        <span style={{ background: 'var(--c-pill-bg)', color: 'var(--c-text-muted)', borderRadius: 5, padding: '1px 7px', fontSize: 10, fontFamily: 'monospace' }}>
          {svc.appName}
        </span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-text-1)', marginBottom: 4 }}>{svc.name}</div>
      <div style={{ fontSize: 11, color: 'var(--c-text-muted)', lineHeight: 1.5 }}>{svc.description.slice(0, 100)}{svc.description.length > 100 ? '…' : ''}</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        {svc.restEndpoints.length > 0 && <span style={{ fontSize: 10, color: 'var(--c-text-muted)' }}>{svc.restEndpoints.length} endpoint{svc.restEndpoints.length !== 1 ? 's' : ''}</span>}
        {kafkaTotal > 0 && <><span style={{ color: 'var(--c-border)' }}>·</span><span style={{ fontSize: 10, color: 'var(--c-text-muted)' }}>{svc.kafkaConsumes.length}↓ {svc.kafkaProduces.length}↑ Kafka</span></>}
        {svc.externalSystems.length > 0 && <><span style={{ color: 'var(--c-border)' }}>·</span><span style={{ fontSize: 10, color: 'var(--c-text-muted)' }}>{svc.externalSystems.length} integration{svc.externalSystems.length !== 1 ? 's' : ''}</span></>}
      </div>
    </div>
  );
};

// ── Service Detail Panel ──────────────────────────────────────────────────────
const ServiceDetailPanel = ({ svc }: { svc: Service }) => {
  const meta = COMP_TYPE_META[svc.type] ?? COMP_TYPE_META.api;
  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ background: 'var(--c-bg-sidebar)', borderBottom: `3px solid ${meta.color}`, padding: '18px 22px', position: 'sticky', top: 0, zIndex: 1 }}>
        <div style={{ fontSize: 10, color: meta.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px' }}>
          {meta.icon} {meta.label.slice(0, -1)} · FXIP Component
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 5 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--c-text-1)' }}>{svc.acronym}</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--c-text-muted)' }}>— {svc.name}</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--c-text-link)', marginTop: 4 }}>{svc.description}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <span style={{ background: 'var(--c-bg-elevated)', border: '1px solid var(--c-border)', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: 'var(--c-text-link)' }}>🐋 {svc.appName}</span>
          <span style={{ background: 'var(--c-bg-elevated)', border: '1px solid var(--c-border)', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: 'var(--c-text-link)' }}>☁ {svc.namespace}</span>
        </div>
      </div>

      <div style={{ padding: '16px 22px' }}>
        {/* Docker image */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: 'var(--c-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 8 }}>Docker Image</div>
          <code style={{ fontSize: 11, color: 'var(--c-code-field)', background: 'var(--c-bg-elevated)', border: '1px solid var(--c-border)', borderRadius: 6, padding: '6px 10px', display: 'block', wordBreak: 'break-all' }}>
            {svc.dockerImage}
          </code>
        </div>

        {/* REST endpoints */}
        {svc.restEndpoints.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: 'var(--c-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 10 }}>
              REST Endpoints ({svc.restEndpoints.length})
            </div>
            <div style={{ background: 'var(--c-bg-app)', border: '1px solid var(--c-border)', borderRadius: 10, overflow: 'hidden' }}>
              {svc.restEndpoints.map((ep, i) => (
                <div key={i} style={{ padding: '8px 12px', borderBottom: i < svc.restEndpoints.length - 1 ? '1px solid var(--c-border)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <code style={{ fontSize: 10, color: '#F59E0B', fontWeight: 700, minWidth: 90, flexShrink: 0 }}>{ep.method}</code>
                    <code style={{ fontSize: 11, color: 'var(--c-code-field)' }}>{ep.path}</code>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--c-text-3)', marginTop: 3 }}>{ep.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kafka */}
        {(svc.kafkaConsumes.length > 0 || svc.kafkaProduces.length > 0) && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: 'var(--c-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 10 }}>Kafka Topics</div>
            {svc.kafkaConsumes.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: '#7C3AED', fontWeight: 700, marginBottom: 6 }}>↓ Consumes ({svc.kafkaConsumes.length})</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {svc.kafkaConsumes.map(t => <div key={t} style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--c-topic-text)', background: 'var(--c-topic-bg)', borderRadius: 4, padding: '2px 8px' }}>{t}</div>)}
                </div>
              </div>
            )}
            {svc.kafkaProduces.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: '#ED1C2E', fontWeight: 700, marginBottom: 6 }}>↑ Produces ({svc.kafkaProduces.length})</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {svc.kafkaProduces.map(t => <div key={t} style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--c-topic-text)', background: 'var(--c-topic-bg)', borderRadius: 4, padding: '2px 8px' }}>{t}</div>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Integrations */}
        {(svc.externalSystems.length > 0 || svc.databases.length > 0) && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: 'var(--c-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 10 }}>Integrations</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {svc.externalSystems.map(s => <span key={s} style={{ background: '#10B98122', color: '#10B981', border: '1px solid #10B98144', borderRadius: 7, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>🌐 {s}</span>)}
              {svc.databases.map(d => <span key={d} style={{ background: '#14B8A622', color: '#14B8A6', border: '1px solid #14B8A644', borderRadius: 7, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>🗄 {d}</span>)}
            </div>
          </div>
        )}

        {/* Dependency map */}
        {(svc.calledBy.length > 0 || svc.calls.length > 0) && (
          <div>
            <div style={{ fontSize: 10, color: 'var(--c-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 10 }}>Dependency Map</div>
            {svc.calledBy.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: 'var(--c-text-muted)', marginBottom: 5 }}>Called by</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {svc.calledBy.map(id => { const s = services.find(x => x.id === id); return <span key={id} style={{ background: '#7C3AED22', color: 'var(--c-code-type)', border: '1px solid #7C3AED44', borderRadius: 7, padding: '3px 8px', fontSize: 10, fontWeight: 700 }}>{s ? s.acronym : id}</span>; })}
                </div>
              </div>
            )}
            {svc.calls.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: 'var(--c-text-muted)', marginBottom: 5 }}>Calls</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {svc.calls.map(id => { const s = services.find(x => x.id === id); return <span key={id} style={{ background: '#0078D222', color: 'var(--c-code-field)', border: '1px solid #0078D244', borderRadius: 7, padding: '3px 8px', fontSize: 10, fontWeight: 700 }}>{s ? s.acronym : id}</span>; })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA CATALOG MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
type CatalogTab = 'objects' | 'events' | 'components';

const DataCatalog: React.FC = () => {
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState<DataDomain | 'all'>('all');
  const [selected, setSelected] = useState<DataObject | null>(null);
  const [tab, setTab] = useState<CatalogTab>('objects');
  const [componentSubTab, setComponentSubTab] = useState('api');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const term = search.toLowerCase();

  const filteredObjects = useMemo(() =>
    dataObjects.filter(o =>
      (domainFilter === 'all' || o.domain === domainFilter) &&
      (!term || o.name.toLowerCase().includes(term) || o.description.toLowerCase().includes(term) ||
        o.fields.some(f => f.name.toLowerCase().includes(term) || f.description.toLowerCase().includes(term)))
    ), [domainFilter, term]);

  const filteredEvents = useMemo(() =>
    domainEvents.filter(e => {
      const svc = services.find(s => s.id === e.serviceId);
      return !term || e.name.toLowerCase().includes(term) || e.description.toLowerCase().includes(term) ||
        e.trigger.toLowerCase().includes(term) || (svc?.acronym.toLowerCase().includes(term) ?? false) ||
        (e.topic?.toLowerCase().includes(term) ?? false);
    }), [term]);

  const filteredServices = useMemo(() =>
    services.filter(s =>
      s.type === componentSubTab &&
      (!term || s.name.toLowerCase().includes(term) || s.acronym.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term) || s.appName.toLowerCase().includes(term))
    ), [componentSubTab, term]);

  const domains = Array.from(new Set(dataObjects.map(o => o.domain))) as DataDomain[];

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--c-bg-app)', color: 'var(--c-text-2)', fontFamily: 'system-ui, sans-serif' }}>
      {/* ── Left panel: search + list ──────────────────────────────────────── */}
      <div style={{ width: 420, flexShrink: 0, borderRight: '1px solid var(--c-border)', display: 'flex', flexDirection: 'column' }}>

        {/* tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-sidebar)' }}>
          {([['objects', '📦 Data Objects'], ['events', '⚡ Domain Events'], ['components', '🔧 FXIP Components']] as const).map(([t, label]) => (
            <button key={t} onClick={() => { setTab(t); setSelected(null); setSelectedService(null); }} style={{
              flex: 1, padding: '12px 0', fontSize: 12, fontWeight: tab === t ? 800 : 500,
              color: tab === t ? 'var(--c-text-1)' : 'var(--c-text-muted)',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: tab === t ? '2px solid #009FDA' : '2px solid transparent',
              transition: 'all 0.15s',
            }}>{label}</button>
          ))}
        </div>

        {/* search */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-panel)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-muted)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={tab === 'objects' ? 'Search fields, types, descriptions…' : tab === 'events' ? 'Search events, topics, triggers…' : 'Search components, endpoints…'}
              style={{
                width: '100%', padding: '7px 10px 7px 30px', fontSize: 12,
                background: 'var(--c-bg-elevated)', border: '1px solid var(--c-border)', borderRadius: 8, color: 'var(--c-text-2)',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* domain filter pills — only for objects tab */}
          {tab === 'objects' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
              <button onClick={() => setDomainFilter('all')} style={{
                background: domainFilter === 'all' ? '#0078D2' : 'var(--c-bg-elevated)',
                border: `1px solid ${domainFilter === 'all' ? '#0078D2' : 'var(--c-border)'}`,
                borderRadius: 20, padding: '3px 10px', fontSize: 10, color: domainFilter === 'all' ? '#fff' : 'var(--c-text-muted)', cursor: 'pointer', fontWeight: domainFilter === 'all' ? 700 : 400,
              }}>All</button>
              {domains.map(d => {
                const m = DOMAIN_META[d];
                return (
                  <button key={d} onClick={() => setDomainFilter(domainFilter === d ? 'all' : d)} style={{
                    background: domainFilter === d ? m.color + '33' : 'var(--c-bg-elevated)',
                    border: `1px solid ${domainFilter === d ? m.color : 'var(--c-border)'}`,
                    borderRadius: 20, padding: '3px 10px', fontSize: 10,
                    color: domainFilter === d ? m.color : 'var(--c-text-muted)', cursor: 'pointer', fontWeight: domainFilter === d ? 700 : 400,
                  }}>{m.icon} {m.label}</button>
                );
              })}
            </div>
          )}
          {/* component type sub-tabs */}
          {tab === 'components' && (
            <div style={{ display: 'flex', gap: 5, marginTop: 10, flexWrap: 'wrap' }}>
              {(['api', 'processor', 'adapter', 'tool'] as const).map(t => {
                const m = COMP_TYPE_META[t];
                return (
                  <button key={t} onClick={() => { setComponentSubTab(t); setSelectedService(null); }} style={{
                    background: componentSubTab === t ? m.color + '33' : 'var(--c-bg-elevated)',
                    border: `1px solid ${componentSubTab === t ? m.color : 'var(--c-border)'}`,
                    borderRadius: 20, padding: '3px 12px', fontSize: 10,
                    color: componentSubTab === t ? m.color : 'var(--c-text-muted)', cursor: 'pointer', fontWeight: componentSubTab === t ? 700 : 400,
                  }}>{m.icon} {m.label}</button>
                );
              })}
            </div>
          )}
        </div>

        {/* stats bar */}
        <div style={{ padding: '6px 14px', background: 'var(--c-bg-panel)', borderBottom: '1px solid var(--c-border)', fontSize: 10, color: 'var(--c-text-muted)' }}>
          {tab === 'objects'
            ? `${filteredObjects.length} of ${dataObjects.length} objects · ${filteredObjects.reduce((s, o) => s + o.fields.length, 0)} fields`
            : tab === 'events'
              ? `${filteredEvents.length} of ${domainEvents.length} events`
              : `${filteredServices.length} ${COMP_TYPE_META[componentSubTab]?.label ?? 'components'}`
          }
        </div>

        {/* list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {tab === 'objects' ? (
            filteredObjects.length === 0
              ? <div style={{ textAlign: 'center', color: 'var(--c-text-muted)', padding: '40px 0', fontSize: 13 }}>No objects match search</div>
              : filteredObjects.map(o => (
                <div key={o.id} style={{ marginBottom: 8 }}>
                  <ObjectCard obj={o} selected={selected?.id === o.id} onClick={() => setSelected(selected?.id === o.id ? null : o)} />
                </div>
              ))
          ) : tab === 'events' ? (
            filteredEvents.length === 0
              ? <div style={{ textAlign: 'center', color: 'var(--c-text-muted)', padding: '40px 0', fontSize: 13 }}>No events match search</div>
              : filteredEvents.map(ev => (
                <div key={ev.id} style={{ marginBottom: 10 }}>
                  <EventRow ev={ev} />
                  {ev.samplePayload && <SamplePayload payload={ev.samplePayload} />}
                </div>
              ))
          ) : (
            filteredServices.length === 0
              ? <div style={{ textAlign: 'center', color: 'var(--c-text-muted)', padding: '40px 0', fontSize: 13 }}>No components match search</div>
              : filteredServices.map(svc => (
                <div key={svc.id} style={{ marginBottom: 8 }}>
                  <ServiceCard svc={svc} selected={selectedService?.id === svc.id} onClick={() => setSelectedService(selectedService?.id === svc.id ? null : svc)} />
                </div>
              ))
          )}
        </div>
      </div>

      {/* ── Right panel: detail ───────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {tab === 'components' ? (
          selectedService ? (
            <ServiceDetailPanel svc={selectedService} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--c-text-muted)', gap: 16 }}>
              <div style={{ fontSize: 48 }}>🔧</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text-muted)' }}>Select a Component</div>
              <div style={{ fontSize: 12, color: 'var(--c-text-muted)', textAlign: 'center', maxWidth: 320 }}>
                Browse APIs, Processors, Adapters, and Tools using the sub-tabs on the left.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
                {(['api', 'processor', 'adapter', 'tool'] as const).map(t => {
                  const m = COMP_TYPE_META[t];
                  const cnt = services.filter(s => s.type === t).length;
                  return (
                    <div key={t} style={{ background: 'var(--c-bg-elevated)', border: `1px solid ${m.color}33`, borderRadius: 10, padding: '14px 18px', textAlign: 'center' }}>
                      <div style={{ fontSize: 22 }}>{m.icon}</div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: m.color, marginTop: 4 }}>{cnt}</div>
                      <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 2 }}>{m.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ) : selected ? (
          <DetailPanel obj={selected} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--c-text-muted)', gap: 16 }}>
            <div style={{ fontSize: 48 }}>📦</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text-muted)' }}>Select a Data Object</div>
            <div style={{ fontSize: 12, color: 'var(--c-text-muted)', textAlign: 'center', maxWidth: 300 }}>
              Click any card on the left to view schema fields, related events, and service usage.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
              {[
                { label: 'Data Objects', count: dataObjects.length, color: '#0078D2', icon: '📦' },
                { label: 'Domain Events', count: domainEvents.length, color: '#7C3AED', icon: '⚡' },
                { label: 'Schema Fields', count: dataObjects.reduce((s, o) => s + o.fields.length, 0), color: '#0EA5E9', icon: '🔤' },
                { label: 'Services Covered', count: new Set(dataObjects.flatMap(o => o.usedBy)).size, color: '#10B981', icon: '⚙' },
              ].map(({ label, count, color, icon }) => (
                <div key={label} style={{ background: 'var(--c-bg-elevated)', border: `1px solid ${color}33`, borderRadius: 10, padding: '14px 18px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22 }}>{icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color, marginTop: 4 }}>{count}</div>
                  <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataCatalog;
