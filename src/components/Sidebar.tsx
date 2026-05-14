import React from "react";
import type { Node } from "reactflow";
import { X, ExternalLink, Server, Cpu, Plug, ArrowRight, ArrowLeft, Database } from "lucide-react";
import type { Service, KafkaTopic, ExternalSystem } from "../data/lineage";
import { NODE_COLORS } from "../data/lineage";

interface SidebarProps {
  node: Node | null;
  onClose: () => void;
}

const Badge = ({ label, color }: { label: string; color: string }) => (
  <span
    style={{
      background: color + "22",
      border: `1px solid ${color}55`,
      color: color,
      borderRadius: 4,
      padding: "2px 7px",
      fontSize: 11,
      fontWeight: 600,
      display: "inline-block",
      margin: "2px",
    }}
  >
    {label}
  </span>
);

const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div style={{ marginTop: 16 }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        color: "#4B6E8B",
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "1px",
        marginBottom: 8,
      }}
    >
      {icon} {title}
    </div>
    {children}
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ node, onClose }) => {
  if (!node) return null;

  const raw = node.data?.raw as Service | KafkaTopic | ExternalSystem | undefined;
  if (!raw) return null;

  const isService = "acronym" in raw;
  const isTopic = "partitions" in raw;

  const svc = isService ? (raw as Service) : null;
  const topic = isTopic ? (raw as KafkaTopic) : null;
  const ext = !isService && !isTopic ? (raw as ExternalSystem) : null;

  const headerColor = isService
    ? NODE_COLORS[svc!.type]
    : isTopic
    ? NODE_COLORS.kafka
    : NODE_COLORS.external;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 360,
        height: "100%",
        background: "#071428",
        borderLeft: "1px solid #0d2a4a",
        overflowY: "auto",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#071a33",
          borderBottom: `2px solid ${headerColor}`,
          padding: "16px 20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div
              style={{
                fontSize: 10,
                color: headerColor,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {svc?.type ?? (isTopic ? "Kafka Topic" : "External System")}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", marginTop: 4 }}>
              {svc ? svc.acronym : topic ? topic.name.split("-").slice(0, 3).join("-") : ext?.name}
            </div>
            {svc && (
              <div style={{ fontSize: 12, color: "#7BAFD4", marginTop: 2 }}>{svc.name}</div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#4B6E8B", cursor: "pointer", padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 20px", flex: 1 }}>

        {/* SERVICE */}
        {svc && (
          <>
            <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>{svc.description}</div>

            <Section title="Deployment" icon={<Server size={12} />}>
              <div>
                {[
                  { label: "App Name",  value: svc.appName    },
                  { label: "Namespace", value: svc.namespace   },
                  { label: "Image",     value: svc.dockerImage },
                ].map(({ label, value }) => (
                  <div key={label} style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 10, color: "#4B6E8B", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: "#7BAFD4", wordBreak: "break-all", marginTop: 2 }}>{value}</div>
                  </div>
                ))}
              </div>
              <a
                href={"https://github.com/" + svc.repo}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  color: "#009FDA",
                  fontSize: 12,
                  marginTop: 8,
                  textDecoration: "none",
                }}
              >
                <ExternalLink size={12} /> {svc.repo}
              </a>
            </Section>

            {svc.restEndpoints.length > 0 && (
              <Section title="REST Endpoints" icon={<Plug size={12} />}>
                {svc.restEndpoints.map((ep, i) => (
                  <div key={i} style={{ background: "#071a33", borderRadius: 6, padding: "6px 10px", marginBottom: 6 }}>
                    <Badge label={ep.method} color="#0078D2" />
                    <code style={{ fontSize: 12, color: "#7BAFD4", marginLeft: 6 }}>{ep.path}</code>
                    <div style={{ fontSize: 11, color: "#4B6E8B", marginTop: 2 }}>{ep.description}</div>
                  </div>
                ))}
              </Section>
            )}

            {svc.kafkaConsumes.length > 0 && (
              <Section title="Kafka Consumes" icon={<ArrowLeft size={12} />}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {svc.kafkaConsumes.map(t => (
                    <Badge key={t} label={t} color={NODE_COLORS.kafka} />
                  ))}
                </div>
              </Section>
            )}

            {svc.kafkaProduces.length > 0 && (
              <Section title="Kafka Produces" icon={<ArrowRight size={12} />}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {svc.kafkaProduces.map(t => (
                    <Badge key={t} label={t} color="#7C3AED" />
                  ))}
                </div>
              </Section>
            )}

            {svc.externalSystems.length > 0 && (
              <Section title="External Systems" icon={<Cpu size={12} />}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {svc.externalSystems.map(e => (
                    <Badge key={e} label={e} color={NODE_COLORS.external} />
                  ))}
                </div>
              </Section>
            )}

            {svc.databases.length > 0 && (
              <Section title="Databases" icon={<Database size={12} />}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {svc.databases.map(d => (
                    <Badge key={d} label={d} color={NODE_COLORS.database} />
                  ))}
                </div>
              </Section>
            )}
          </>
        )}

        {/* KAFKA TOPIC */}
        {topic && (
          <>
            <div style={{ fontFamily: "monospace", fontSize: 13, color: "#ED1C2E", wordBreak: "break-all" }}>
              {topic.name}
            </div>
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Group",      value: topic.group      },
                { label: "Format",     value: topic.format     },
                { label: "Partitions", value: String(topic.partitions) },
                { label: "Retention",  value: topic.retention  },
                { label: "Broker",     value: topic.brokerType },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "#071a33", borderRadius: 6, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: "#4B6E8B", textTransform: "uppercase" }}>{label}</div>
                  <div style={{ fontSize: 12, color: "#e2e8f0", marginTop: 2 }}>{value}</div>
                </div>
              ))}
            </div>

            {topic.notes && (
              <div style={{ marginTop: 12, background: "#071a33", borderRadius: 6, padding: "8px 10px", fontSize: 12, color: "#7BAFD4" }}>
                {topic.notes}
              </div>
            )}

            {topic.producers.length > 0 && (
              <Section title="Producers" icon={<ArrowRight size={12} />}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {topic.producers.map(p => <Badge key={p} label={p} color="#ED1C2E" />)}
                </div>
              </Section>
            )}

            {topic.consumers.length > 0 && (
              <Section title="Consumers" icon={<ArrowLeft size={12} />}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {topic.consumers.map(c => <Badge key={c} label={c} color="#7C3AED" />)}
                </div>
              </Section>
            )}
          </>
        )}

        {/* EXTERNAL */}
        {ext && (
          <>
            <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>{ext.description}</div>
            <div style={{ marginTop: 12 }}>
              <Badge label={ext.type} color={NODE_COLORS.external} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
