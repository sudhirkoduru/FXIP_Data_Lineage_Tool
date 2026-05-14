import React from "react";
import type { Node } from "reactflow";
import {
  X, ExternalLink, Server, Database, ArrowUpRight, ArrowDownLeft,
  Globe, GitBranch, Layers, Zap, Package, AlertCircle,
} from "lucide-react";
import type { Service, KafkaTopic, ExternalSystem } from "../data/lineage";
import { NODE_COLORS, services, kafkaTopics } from "../data/lineage";

interface Props { node: Node | null; onClose: () => void }

// ── Reusable chips ────────────────────────────────────────────────────────────
const Tag = ({ text, color }: { text: string; color: string }) => (
  <span style={{
    background: color + "22", border: `1px solid ${color}55`,
    color, borderRadius: 5, padding: "2px 8px",
    fontSize: 11, fontWeight: 600, display: "inline-block", margin: "2px",
  }}>{text}</span>
);

// ── Section block ─────────────────────────────────────────────────────────────
const Section = ({ icon, title, children }: {
  icon: React.ReactNode; title: string; children: React.ReactNode;
}) => (
  <div style={{ marginTop: 18 }}>
    <div style={{
      display: "flex", alignItems: "center", gap: 7,
      fontSize: 10, fontWeight: 800, letterSpacing: "1.2px",
      textTransform: "uppercase", color: "#4B6E8B", marginBottom: 10,
    }}>
      {icon} {title}
    </div>
    {children}
  </div>
);

// ── Info row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value, mono }: { label: string; value?: string; mono?: boolean }) =>
  value ? (
    <div style={{ marginBottom: 7 }}>
      <div style={{ fontSize: 10, color: "#4B6E8B", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
      <div style={{ fontSize: 11, color: "#7BAFD4", marginTop: 2, fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-all" }}>{value}</div>
    </div>
  ) : null;

// ── Method badge ─────────────────────────────────────────────────────────────
const METHOD_COLORS: Record<string, string> = {
  GET: "#10B981", POST: "#0078D2", PUT: "#F59E0B",
  DELETE: "#ED1C2E", PATCH: "#8B5CF6", "GET/POST": "#0EA5E9",
  "GET/POST/PUT/DELETE": "#F59E0B",
};

const MethodBadge = ({ m }: { m: string }) => {
  const color = Object.entries(METHOD_COLORS).find(([k]) => m.includes(k))?.[1] ?? "#64748b";
  return (
    <span style={{
      background: color + "25", border: `1px solid ${color}55`,
      color, borderRadius: 4, padding: "1px 6px",
      fontSize: 10, fontWeight: 700, marginRight: 6, flexShrink: 0,
    }}>{m}</span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const Sidebar: React.FC<Props> = ({ node, onClose }) => {
  if (!node) return null;

  const raw = node.data?.raw as Service | KafkaTopic | ExternalSystem | undefined;
  if (!raw) return null;

  const isService  = "acronym" in raw;
  const isTopic    = "partitions" in raw;
  const svc        = isService ? (raw as Service) : null;
  const topic      = isTopic   ? (raw as KafkaTopic) : null;
  const ext        = !isService && !isTopic ? (raw as ExternalSystem) : null;

  const headerColor = svc  ? NODE_COLORS[svc.type as keyof typeof NODE_COLORS]
                   : topic ? NODE_COLORS.kafka
                           : NODE_COLORS.external;

  // For a Kafka topic — find which services produce/consume it
  const topicProducers = topic
    ? services.filter(s => s.kafkaProduces.includes(topic.id) || s.kafkaProduces.includes(topic.name))
    : [];
  const topicConsumers = topic
    ? services.filter(s => s.kafkaConsumes.includes(topic.id) || s.kafkaConsumes.includes(topic.name))
    : [];

  // For a service — find callers
  const calledByServices = svc
    ? services.filter(s => s.calls.includes(svc.id))
    : [];

  // All kafka topics this service touches (for flow diagram)
  const svcProducedTopics = svc
    ? kafkaTopics.filter(t => svc.kafkaProduces.includes(t.id) || svc.kafkaProduces.includes(t.name))
    : [];
  const svcConsumedTopics = svc
    ? kafkaTopics.filter(t => svc.kafkaConsumes.includes(t.id) || svc.kafkaConsumes.includes(t.name))
    : [];

  return (
    <div style={{
      position: "absolute", top: 0, right: 0,
      width: 390, height: "100%",
      background: "#071428",
      borderLeft: "1px solid #0d2a4a",
      overflowY: "auto", zIndex: 10,
      display: "flex", flexDirection: "column",
    }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: "#071a33",
        borderBottom: `3px solid ${headerColor}`,
        padding: "16px 20px",
        position: "sticky", top: 0, zIndex: 1,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: headerColor, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.2px" }}>
              {svc?.type ?? (isTopic ? "Kafka Topic" : "External System")}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#f1f5f9", marginTop: 4, lineHeight: 1.2 }}>
              {svc?.acronym ?? (topic ? topic.name.split("-").slice(-2).join("-") : ext?.name)}
            </div>
            {svc && (
              <div style={{ fontSize: 12, color: "#7BAFD4", marginTop: 3 }}>{svc.name}</div>
            )}
            {topic && (
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "#fca5a5", marginTop: 3, wordBreak: "break-all" }}>
                {topic.name}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#4B6E8B", cursor: "pointer", padding: 4, marginLeft: 8, flexShrink: 0 }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div style={{ padding: "16px 20px", flex: 1 }}>

        {/* ══ SERVICE ══════════════════════════════════════════════════════════ */}
        {svc && (
          <>
            <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.7 }}>{svc.description}</div>

            {/* Deployment info */}
            <Section icon={<Server size={12} />} title="Deployment">
              <InfoRow label="App Name"   value={svc.appName}    />
              <InfoRow label="Namespace"  value={svc.namespace}  />
              <InfoRow label="Docker Image" value={svc.dockerImage} mono />
              <a
                href={"https://github.com/" + svc.repo}
                target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#009FDA", fontSize: 12, marginTop: 6, textDecoration: "none" }}
              >
                <ExternalLink size={12} /> {svc.repo}
              </a>
            </Section>

            {/* REST Endpoints */}
            {svc.restEndpoints.length > 0 && (
              <Section icon={<Globe size={12} />} title={"REST Endpoints  (" + svc.restEndpoints.length + ")"}>
                {svc.restEndpoints.map((ep, i) => (
                  <div key={i} style={{
                    background: "#0d1f3a", borderRadius: 7, padding: "8px 10px",
                    marginBottom: 7, borderLeft: `3px solid #0078D2`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 3 }}>
                      <MethodBadge m={ep.method} />
                      <code style={{ fontSize: 12, color: "#7dd3fc" }}>{ep.path}</code>
                    </div>
                    <div style={{ fontSize: 11, color: "#4B6E8B" }}>{ep.description}</div>
                  </div>
                ))}
              </Section>
            )}

            {/* Kafka Produces */}
            {svcProducedTopics.length > 0 && (
              <Section icon={<ArrowUpRight size={12} />} title={"Kafka Publishes  (" + svcProducedTopics.length + " topics)"}>
                {svcProducedTopics.map(t => (
                  <div key={t.id} style={{
                    background: "#1a0a0a", borderRadius: 7, padding: "7px 10px",
                    marginBottom: 6, borderLeft: "3px solid #ED1C2E",
                  }}>
                    <div style={{ fontSize: 11, fontFamily: "monospace", color: "#fca5a5", fontWeight: 700 }}>{t.name}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <Tag text={t.format}     color="#ED1C2E" />
                      <Tag text={t.brokerType} color="#F59E0B" />
                      <Tag text={t.partitions + " parts"} color="#64748b" />
                    </div>
                    {t.consumers.length > 0 && (
                      <div style={{ fontSize: 10, color: "#4B6E8B", marginTop: 4 }}>
                        Consumed by: {t.consumers.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </Section>
            )}

            {/* Kafka Consumes */}
            {svcConsumedTopics.length > 0 && (
              <Section icon={<ArrowDownLeft size={12} />} title={"Kafka Consumes  (" + svcConsumedTopics.length + " topics)"}>
                {svcConsumedTopics.map(t => (
                  <div key={t.id} style={{
                    background: "#0d0a1a", borderRadius: 7, padding: "7px 10px",
                    marginBottom: 6, borderLeft: "3px solid #7C3AED",
                  }}>
                    <div style={{ fontSize: 11, fontFamily: "monospace", color: "#c4b5fd", fontWeight: 700 }}>{t.name}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <Tag text={t.format}     color="#7C3AED" />
                      <Tag text={t.brokerType} color="#F59E0B" />
                      <Tag text={t.retention}  color="#64748b" />
                    </div>
                    {t.notes && (
                      <div style={{ fontSize: 10, color: "#4B6E8B", marginTop: 4 }}>{t.notes}</div>
                    )}
                  </div>
                ))}
              </Section>
            )}

            {/* External Systems */}
            {svc.externalSystems.length > 0 && (
              <Section icon={<GitBranch size={12} />} title="External Integrations">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {svc.externalSystems.map(e => <Tag key={e} text={e} color={NODE_COLORS.external} />)}
                </div>
              </Section>
            )}

            {/* Databases */}
            {svc.databases.length > 0 && (
              <Section icon={<Database size={12} />} title="Databases">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {svc.databases.map(d => <Tag key={d} text={d} color={NODE_COLORS.database} />)}
                </div>
              </Section>
            )}

            {/* Called by */}
            {calledByServices.length > 0 && (
              <Section icon={<Layers size={12} />} title="Called By">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {calledByServices.map(s => <Tag key={s.id} text={s.acronym} color="#009FDA" />)}
                </div>
              </Section>
            )}

            {/* Calls */}
            {svc.calls.length > 0 && (
              <Section icon={<Package size={12} />} title="Calls">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {svc.calls.map(c => <Tag key={c} text={c} color="#009FDA" />)}
                </div>
              </Section>
            )}

            {/* RabbitMQ queues */}
            {svc.rabbitMQQueues.length > 0 && (
              <Section icon={<AlertCircle size={12} />} title="RabbitMQ Queues">
                {svc.rabbitMQQueues.map(q => (
                  <div key={q} style={{ fontFamily: "monospace", fontSize: 11, color: "#fbbf24", marginBottom: 3 }}>{q}</div>
                ))}
              </Section>
            )}
          </>
        )}

        {/* ══ KAFKA TOPIC ══════════════════════════════════════════════════════ */}
        {topic && (
          <>
            <div style={{ fontFamily: "monospace", fontSize: 13, color: "#fca5a5", wordBreak: "break-all", lineHeight: 1.5 }}>
              {topic.name}
            </div>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
              {[
                { label: "Group",      value: topic.group      },
                { label: "Format",     value: topic.format     },
                { label: "Partitions", value: String(topic.partitions) },
                { label: "Retention",  value: topic.retention  },
                { label: "Broker",     value: topic.brokerType },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "#0d1f3a", borderRadius: 7, padding: "8px 11px" }}>
                  <div style={{ fontSize: 10, color: "#4B6E8B", textTransform: "uppercase" }}>{label}</div>
                  <div style={{ fontSize: 12, color: "#e2e8f0", marginTop: 3, fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>

            {topic.notes && (
              <div style={{ marginTop: 12, background: "#0d1f3a", borderRadius: 7, padding: "9px 11px", fontSize: 12, color: "#7BAFD4", borderLeft: "3px solid #F59E0B" }}>
                {topic.notes}
              </div>
            )}

            {/* Producers */}
            {topicProducers.length > 0 && (
              <Section icon={<ArrowUpRight size={12} />} title={"Producers  (" + topicProducers.length + ")"}>
                {topicProducers.map(s => (
                  <div key={s.id} style={{ background: "#1a0a0a", borderRadius: 7, padding: "7px 10px", marginBottom: 6, borderLeft: "3px solid #ED1C2E" }}>
                    <div style={{ fontWeight: 700, color: "#fca5a5", fontSize: 12 }}>{s.acronym}</div>
                    <div style={{ fontSize: 11, color: "#4B6E8B" }}>{s.name}</div>
                  </div>
                ))}
              </Section>
            )}

            {/* Consumers */}
            {topicConsumers.length > 0 && (
              <Section icon={<ArrowDownLeft size={12} />} title={"Consumers  (" + topicConsumers.length + ")"}>
                {topicConsumers.map(s => (
                  <div key={s.id} style={{ background: "#0d0a1a", borderRadius: 7, padding: "7px 10px", marginBottom: 6, borderLeft: "3px solid #7C3AED" }}>
                    <div style={{ fontWeight: 700, color: "#c4b5fd", fontSize: 12 }}>{s.acronym}</div>
                    <div style={{ fontSize: 11, color: "#4B6E8B" }}>{s.name}</div>
                  </div>
                ))}
              </Section>
            )}

            {/* Raw producers from data */}
            {topic.producers.filter(p => !services.find(s => s.id === p)).length > 0 && (
              <Section icon={<Zap size={12} />} title="External Producers">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {topic.producers.filter(p => !services.find(s => s.id === p)).map(p => (
                    <Tag key={p} text={p} color="#F59E0B" />
                  ))}
                </div>
              </Section>
            )}
          </>
        )}

        {/* ══ EXTERNAL SYSTEM ══════════════════════════════════════════════════ */}
        {ext && (
          <>
            <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.7 }}>{ext.description}</div>
            <div style={{ marginTop: 14 }}>
              <Tag text={ext.type} color={NODE_COLORS.external} />
            </div>

            {/* Which services connect to this external */}
            {(() => {
              const connected = services.filter(s =>
                s.externalSystems.includes(ext.id) || s.calls.includes(ext.id) || s.calledBy.includes(ext.id)
              );
              return connected.length > 0 ? (
                <Section icon={<GitBranch size={12} />} title={"Connected Services  (" + connected.length + ")"}>
                  {connected.map(s => (
                    <div key={s.id} style={{
                      background: "#0d1f3a", borderRadius: 7, padding: "7px 10px",
                      marginBottom: 6, borderLeft: `3px solid ${NODE_COLORS[s.type as keyof typeof NODE_COLORS]}`,
                    }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Tag text={s.type.toUpperCase()} color={NODE_COLORS[s.type as keyof typeof NODE_COLORS]} />
                        <span style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 12 }}>{s.acronym}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#4B6E8B", marginTop: 3 }}>{s.name}</div>
                    </div>
                  ))}
                </Section>
              ) : null;
            })()}

            {ext.url && (
              <a
                href={ext.url} target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#009FDA", fontSize: 12, marginTop: 14, textDecoration: "none" }}
              >
                <ExternalLink size={12} /> {ext.url}
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
