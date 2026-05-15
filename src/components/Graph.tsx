import { useCallback, useMemo, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Server, Building2 } from 'lucide-react';
import { SiApachekafka, SiRabbitmq, SiMongodb } from 'react-icons/si';
import { FaAws, FaWindows } from 'react-icons/fa';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from 'reactflow';
import type { Node, Edge, NodeTypes } from 'reactflow';
import 'reactflow/dist/style.css';
import { services, kafkaTopics, externalSystems, NODE_COLORS } from '../data/lineage';
import type { NodeType } from '../data/lineage';

// ─────────────────────────────────────────────────────────────────────────────
// EXPLICIT POSITIONS — mirroring FXIP Integration Context View diagram
// Layout: AWS Cloud (top) → Azure Services → Kafka Backbone → On-Prem (bottom)
// ─────────────────────────────────────────────────────────────────────────────
const CANVAS_W = 2450;

const POSITIONS: Record<string, { x: number; y: number }> = {
  // ── AWS / Cloud External (y ≈ 60) ──────────────────────────────────────────
  ConfluentCloud:              { x: 60,   y: 60  },
  IBM_ACARS:                   { x: 340,  y: 60  },
  FlightKeys:                  { x: 880,  y: 60  },
  CCI:                         { x: 1300, y: 60  },
  OpsTrak:                     { x: 1520, y: 60  },
  Fusion:                      { x: 1740, y: 60  },

  // ── Azure: Adapters — column 1 (x ≈ 60) ───────────────────────────────────
  FXD_SOAR_FlightData_Adapter:     { x: 60,  y: 290 },
  FXD_SOAR_AircraftData_Adapter:   { x: 60,  y: 460 },
  FXD_SOAR_ACARS_Cyberjet:         { x: 60,  y: 630 },
  FXD_SOAR_Fusion_Flight_Movement: { x: 60,  y: 800 },

  // ── Azure: Processors — columns 2-3 ───────────────────────────────────────
  FXD_SOAR_Audit_Log_Processor:        { x: 300, y: 290 },
  FXD_SOAR_FlightPlan_Processor:       { x: 300, y: 460 },
  FXIP_FlightPlanServiceMGW_AWS:       { x: 300, y: 630 },
  FXIP_AircraftDataServiceMGW_BCP:     { x: 300, y: 800 },

  FXD_SOAR_Flightkeys_Event_Processor: { x: 520, y: 290 },
  FXD_SOAR_Text_Message_Processor:     { x: 520, y: 460 },
  FXD_SOAR_FOS_Update_Processor:       { x: 520, y: 630 },
  FXD_SOAR_Notification_Service:       { x: 520, y: 800 },

  // ── Azure: APIs — columns 4-6 ─────────────────────────────────────────────
  FXD_SOAR_Flightkeys_Integration_Service: { x: 760,  y: 290 },
  FXD_SOAR_FlightPlan_Service:             { x: 760,  y: 460 },
  FXD_SOAR_Data_Maintenance_Service:       { x: 760,  y: 630 },
  FXD_SOAR_PilotDoc_Service:               { x: 760,  y: 800 },

  FXD_SOAR_Aircraft_Data_Service:          { x: 1020, y: 290 },
  FXD_SOAR_Nav_Data_Service:               { x: 1020, y: 460 },
  FXD_SOAR_DelayCost_Service:              { x: 1020, y: 630 },
  FXIP_Flight_Info_Service_Client:         { x: 1020, y: 800 },

  // ── Azure: Integration + MGW — column 7 ───────────────────────────────────
  FXD_SOAR_Fusion_ACARS_Service:   { x: 1280, y: 290 },
  FXIP_NavDataServiceMGW_BCP:      { x: 1280, y: 460 },
  FXIP_DataMaintServiceMGW_BCP:    { x: 1280, y: 630 },
  FXIP_FltKeysIntegServiceMGW_AWS: { x: 1280, y: 800 },

  // ── On-Prem / External Sinks (y = 1640) ────────────────────────────────────
  IBM_MQ:          { x: 60,   y: 1640 },
  RabbitMQ:        { x: 280,  y: 1640 },
  FOS:             { x: 500,  y: 1640 },
  AzureServiceBus: { x: 760,  y: 1640 },
  DocumentDB:      { x: 1020, y: 1640 },
  OpsHub:          { x: 1280, y: 1640 },
};

// Kafka topics — one column per group, topics stack vertically within it
// Columns spaced 300 px apart so 255 px-wide nodes have a visible gap
const KAFKA_GROUP_X: Record<string, number> = {
  'flightplan':       60,   // shifted +30 to clear the 44 px left title strip
  'flightplan-mq':    360,
  'flightplan-ext':   660,
  'acars':            960,
  'flight-event':     1230,
  'flight-event-mq':  1530,
  'maint-event':      1830,
  'flightkeys-event': 2130,
};
const KAFKA_Y_BASE = 1010;  // was 962 — pushed down to clear lane header (≥50 px gap)
const KAFKA_ROW_H  = 90;    // node height ~75 px + 15 px breathing room

// ─────────────────────────────────────────────────────────────────────────────
// TECH BRAND ICONS
// ─────────────────────────────────────────────────────────────────────────────
const ICON_COLORS: Record<string, string> = {
  aws:      '#FF9900',
  azure:    '#0078D4',
  kafka:    '#ffffff',
  ibm:      '#052FAD',
  rabbitmq: '#FF6600',
  mongodb:  '#47A248',
  onprem:   '#10B981',
};

// Map external system IDs to their brand icon key
const EXT_ICON: Record<string, string> = {
  ConfluentCloud:  'kafka',
  IBM_ACARS:       'ibm',
  IBM_MQ:          'ibm',
  RabbitMQ:        'rabbitmq',
  AzureServiceBus: 'azure',
  DocumentDB:      'mongodb',
};

const TechIcon = ({ name, size = 14, color }: { name?: string; size?: number; color?: string }) => {
  if (!name) return null;
  const p = { size, color };
  switch (name) {
    case 'aws':      return <FaAws {...p} />;
    case 'azure':    return <FaWindows {...p} />;  // Windows logo = Microsoft/Azure
    case 'kafka':    return <SiApachekafka {...p} />;
    case 'rabbitmq': return <SiRabbitmq {...p} />;
    case 'mongodb':  return <SiMongodb {...p} />;
    case 'ibm':      return <Building2 size={size} color={color} />;
    case 'onprem':   return <Server size={size} color={color} />;
    default:         return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SWIMLANE BACKGROUND NODES
// ─────────────────────────────────────────────────────────────────────────────
interface LaneData { label: string; sideLabel?: string; color: string; border: string; width: number; height: number; iconKey?: string }

const LaneNode = ({ data }: { data: LaneData }) => (
  <div style={{
    width: data.width, height: data.height,
    background: data.color,
    border: `1.5px solid ${data.border}44`,
    borderRadius: 12,
    pointerEvents: 'none',
    display: 'flex',
    overflow: 'hidden',
  }}>
    {/* Vertical left title strip */}
    <div style={{
      width: 44,
      height: '100%',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '14px 0',
      gap: 12,
      background: `${data.border}18`,
      borderRight: `1px solid ${data.border}33`,
    }}>
      {/* Icon pinned to top */}
      {data.iconKey && <TechIcon name={data.iconKey} size={20} color={data.border} />}
      {/* Label centred in the remaining height; \n = second column in vertical-rl */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: data.border,
          opacity: 0.8,
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          whiteSpace: 'pre-wrap',
          textAlign: 'center',
        }}>
          {data.sideLabel ?? data.label}
        </span>
      </div>
    </div>
  </div>
);

const buildLanes = (): Node[] => [
  {
    // Cloud nodes at y=60; lane top at y=0 → 60px header clearance
    id: 'lane-cloud', type: 'laneNode', selectable: false, draggable: false, zIndex: -10,
    position: { x: -30, y: 0 },
    data: { label: 'Amazon Web Services / External Cloud', sideLabel: 'AWS /\nExternal Cloud', color: '#FF990009', border: '#FF9900', width: CANVAS_W, height: 180, iconKey: 'aws' } as LaneData,
  },
  {
    // Azure nodes y=290–875; lane top y=210 → 80px header clearance; 40px gap below cloud
    id: 'lane-azure', type: 'laneNode', selectable: false, draggable: false, zIndex: -10,
    position: { x: -30, y: 220 },
    data: { label: 'Microsoft Azure', sideLabel: 'Microsoft\nAzure', color: '#0078D209', border: '#0078D2', width: CANVAS_W, height: 710, iconKey: 'azure' } as LaneData,
  },
  {
    // KAFKA_Y_BASE=1010; lane top y=955 → 55px header clearance; 35px gap below azure
    id: 'lane-kafka', type: 'laneNode', selectable: false, draggable: false, zIndex: -10,
    position: { x: -30, y: 965 },
    data: { label: 'OpsHub · Azure Event Hub  —  Kafka Backbone  (AMQP / Confluent Cloud / AWS MSK)', sideLabel: 'Apache Kafka /\nAzure Event Hub', color: '#ED1C2E09', border: '#ED1C2E', width: CANVAS_W, height: 610, iconKey: 'kafka' } as LaneData,
  },
  {
    // On-prem nodes at y=1640; lane top y=1595 → 45px header clearance; 40px gap below kafka
    id: 'lane-onprem', type: 'laneNode', selectable: false, draggable: false, zIndex: -10,
    position: { x: -30, y: 1615 },
    data: { label: 'On-Premises / External Sinks', sideLabel: 'On-Premises /\nExternal Sinks', color: '#10B98109', border: '#10B981', width: CANVAS_W, height: 200, iconKey: 'onprem' } as LaneData,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM NODE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
interface SvcData {
  acronym: string; label: string; type: string; color: string;
  appName: string; epCount: number; kafkaIn: number; kafkaOut: number; raw: unknown;
}

const ServiceNode = ({ data }: { data: SvcData }) => (
  <div style={{
    background: `linear-gradient(145deg, ${data.color}ee, ${data.color}99)`,
    border: `2px solid ${data.color}`,
    borderRadius: 10, padding: '9px 13px', minWidth: 165, maxWidth: 200,
    boxShadow: `0 0 14px ${data.color}44, 0 4px 18px rgba(0,0,0,0.45)`,
    color: '#fff', cursor: 'pointer', textAlign: 'center',
  }}>
    <Handle type="target" position={Position.Left}   style={{ background: '#ffffff55', border: 'none', width: 8, height: 8 }} />
    <Handle type="target" position={Position.Top}    style={{ background: '#ffffff55', border: 'none', width: 8, height: 8 }} />
    <Handle type="source" position={Position.Right}  style={{ background: '#ffffff55', border: 'none', width: 8, height: 8 }} />
    <Handle type="source" position={Position.Bottom} style={{ background: '#ffffff55', border: 'none', width: 8, height: 8 }} />
    <div style={{ fontSize: 9, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{data.type}</div>
    <div style={{ fontSize: 15, fontWeight: 800, margin: '3px 0 2px' }}>{data.acronym}</div>
    <div style={{ fontSize: 10, opacity: 0.88, lineHeight: 1.3 }}>{data.label}</div>
    <div style={{ fontSize: 9, opacity: 0.5, fontFamily: 'monospace', marginTop: 3 }}>{data.appName}</div>
    <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 7, flexWrap: 'wrap' }}>
      {data.epCount > 0 && (
        <span style={{ background: '#ffffff20', borderRadius: 10, padding: '2px 7px', fontSize: 9 }}>
          {data.epCount} REST
        </span>
      )}
      {data.kafkaIn > 0 && (
        <span style={{ background: '#7C3AED33', borderRadius: 10, padding: '2px 7px', fontSize: 9 }}>
          ↓{data.kafkaIn} Kafka
        </span>
      )}
      {data.kafkaOut > 0 && (
        <span style={{ background: '#ED1C2E33', borderRadius: 10, padding: '2px 7px', fontSize: 9 }}>
          ↑{data.kafkaOut} Kafka
        </span>
      )}
    </div>
  </div>
);

interface KafkaData { label: string; group: string; format: string; brokerType: string; producers: number; consumers: number; raw: unknown }

const KafkaNode = ({ data }: { data: KafkaData }) => (
  <div style={{
    background: 'linear-gradient(135deg, #991b1b, #7f1d1d)',
    border: '1.5px solid #ED1C2E',
    borderRadius: 6, padding: '5px 10px', minWidth: 215, maxWidth: 255,
    boxShadow: '0 0 10px #ED1C2E44, 0 3px 10px rgba(0,0,0,0.5)',
    color: '#fff', cursor: 'pointer', textAlign: 'center',
  }}>
    <Handle type="target" position={Position.Left}   style={{ background: '#ffffff55', border: 'none' }} />
    <Handle type="target" position={Position.Top}    style={{ background: '#ffffff55', border: 'none' }} />
    <Handle type="source" position={Position.Right}  style={{ background: '#ffffff55', border: 'none' }} />
    <Handle type="source" position={Position.Bottom} style={{ background: '#ffffff55', border: 'none' }} />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 8, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      <SiApachekafka size={9} />
      {data.group} · {data.format}
    </div>
    <div style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace', marginTop: 2, wordBreak: 'break-all', lineHeight: 1.3 }}>
      {data.label}
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 4 }}>
      <span style={{ fontSize: 9, color: '#fca5a5' }}>↑ {data.producers} prod</span>
      <span style={{ fontSize: 9, color: '#c4b5fd' }}>↓ {data.consumers} cons</span>
    </div>
  </div>
);

interface ExtData { label: string; type: string; color: string; iconKey?: string; raw: unknown }

const ExternalNode = ({ data }: { data: ExtData }) => {
  const iconColor = data.iconKey ? (ICON_COLORS[data.iconKey] ?? data.color) : data.color;
  return (
    <div style={{
      background: `${data.color}1a`,
      border: `2px dashed ${data.color}`,
      borderRadius: 8, padding: '8px 13px', minWidth: 145,
      boxShadow: `0 0 10px ${data.color}33`,
      color: 'var(--c-text-1)', cursor: 'pointer', textAlign: 'center',
    }}>
      <Handle type="target" position={Position.Left}   style={{ background: '#ffffff55', border: 'none' }} />
      <Handle type="target" position={Position.Top}    style={{ background: '#ffffff55', border: 'none' }} />
      <Handle type="source" position={Position.Right}  style={{ background: '#ffffff55', border: 'none' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#ffffff55', border: 'none' }} />
      <div style={{ fontSize: 9, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{data.type}</div>
      {data.iconKey && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '5px 0 3px' }}>
          <TechIcon name={data.iconKey} size={24} color={iconColor} />
        </div>
      )}
      <div style={{ fontSize: 12, fontWeight: 700, marginTop: data.iconKey ? 2 : 3 }}>{data.label}</div>
    </div>
  );
};

const nodeTypes: NodeTypes = {
  laneNode:     LaneNode as never,
  serviceNode:  ServiceNode as never,
  kafkaNode:    KafkaNode as never,
  externalNode: ExternalNode as never,
};

// ─────────────────────────────────────────────────────────────────────────────
// BUILD NODES
// ─────────────────────────────────────────────────────────────────────────────
function buildNodes(filter: string[], searchTerm: string): Node[] {
  const term = searchTerm.toLowerCase();
  const nodes: Node[] = [...buildLanes()];
  const matches = (...words: string[]) => !term || words.some(w => w.toLowerCase().includes(term));

  services.forEach(svc => {
    if (filter.length > 0 && !filter.includes(svc.type)) return;
    if (!matches(svc.name, svc.acronym, svc.description, svc.appName)) return;
    nodes.push({
      id: svc.id,
      type: 'serviceNode',
      position: POSITIONS[svc.id] ?? { x: 1540, y: 600 },
      data: {
        acronym:  svc.acronym,
        label:    svc.name,
        type:     svc.type.toUpperCase(),
        color:    NODE_COLORS[svc.type as NodeType],
        appName:  svc.appName,
        epCount:  svc.restEndpoints.length,
        kafkaIn:  svc.kafkaConsumes.length,
        kafkaOut: svc.kafkaProduces.length,
        raw: svc,
      },
    });
  });

  if (filter.length === 0 || filter.includes('kafka')) {
    const groupCounters: Record<string, number> = {};
    kafkaTopics.forEach(topic => {
      if (!matches(topic.name, topic.group)) return;
      const gx = KAFKA_GROUP_X[topic.group] ?? 1820;
      const gi = groupCounters[topic.group] ?? 0;
      groupCounters[topic.group] = gi + 1;
      nodes.push({
        id: topic.id,
        type: 'kafkaNode',
        position: { x: gx, y: KAFKA_Y_BASE + gi * KAFKA_ROW_H },
        data: {
          label:      topic.name,
          group:      topic.group,
          format:     topic.format,
          brokerType: topic.brokerType,
          producers:  topic.producers.length,
          consumers:  topic.consumers.length,
          raw: topic,
        },
      });
    });
  }

  if (filter.length === 0 || filter.includes('external')) {
    externalSystems.forEach(ext => {
      if (!matches(ext.name, ext.description)) return;
      nodes.push({
        id: ext.id,
        type: 'externalNode',
        position: POSITIONS[ext.id] ?? { x: 1760, y: 600 },
        data: { label: ext.name, type: ext.type, color: NODE_COLORS.external, iconKey: EXT_ICON[ext.id], raw: ext },
      });
    });
  }

  return nodes;
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD EDGES
// ─────────────────────────────────────────────────────────────────────────────
function buildEdges(filter: string[], isDark: boolean): Edge[] {
  const edges: Edge[] = [];
  const seen = new Set<string>();

  const addEdge = (
    source: string, target: string,
    color: string, animated: boolean,
    label?: string, dashed?: boolean,
  ) => {
    const key = `${source}→${target}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({
      id: key, source, target, animated,
      type: 'smoothstep',
      label: label ?? '',
      style: { stroke: color, strokeWidth: dashed ? 1.5 : 2.5, strokeDasharray: dashed ? '5 4' : undefined },
      markerEnd: { type: MarkerType.ArrowClosed, color, width: 14, height: 14 },
      labelStyle: { fill: color, fontSize: 9, fontWeight: 700 },
      labelBgStyle: { fill: isDark ? '#060e1ccc' : '#eef2f7dd', fillOpacity: 0.95 },
      labelBgPadding: [4, 6] as [number, number],
    });
  };

  const svcMap = new Map(services.map(s => [s.id, s]));
  const extIds = new Set(externalSystems.map(e => e.id));

  const svcVisible = (id: string) => {
    const svc = svcMap.get(id);
    return !!svc && (filter.length === 0 || filter.includes(svc.type));
  };
  const kafkaOk = filter.length === 0 || filter.includes('kafka');
  const extOk   = filter.length === 0 || filter.includes('external');

  kafkaTopics.forEach(topic => {
    if (!kafkaOk) return;
    topic.producers.forEach(prod => {
      if (svcMap.has(prod) && svcVisible(prod))
        addEdge(prod, topic.id, '#ED1C2E', true, 'publishes');
      else if (extIds.has(prod) && extOk)
        addEdge(prod, topic.id, '#F59E0B', true, 'publishes');
    });
    topic.consumers.forEach(cons => {
      if (svcMap.has(cons) && svcVisible(cons))
        addEdge(topic.id, cons, '#7C3AED', false, 'consumes');
    });
  });

  services.forEach(svc => {
    if (!svcVisible(svc.id)) return;
    svc.externalSystems.forEach(extId => {
      if (extIds.has(extId) && extOk)
        addEdge(svc.id, extId, '#10B981', false, undefined, true);
    });
    svc.calls.forEach(targetId => {
      if (svcMap.has(targetId) && svcVisible(targetId))
        addEdge(svc.id, targetId, '#009FDA', false, 'calls');
      else if (extIds.has(targetId) && extOk)
        addEdge(svc.id, targetId, '#10B981', false, undefined, true);
    });
  });

  return edges;
}

// ─────────────────────────────────────────────────────────────────────────────
// GRAPH COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface GraphProps {
  filter: string[];
  searchTerm: string;
  onNodeClick: (node: Node) => void;
}

const Graph: React.FC<GraphProps> = ({ filter, searchTerm, onNodeClick }) => {
  const { isDark } = useTheme();
  const computedNodes = useMemo(() => buildNodes(filter, searchTerm), [filter, searchTerm]);
  const computedEdges = useMemo(() => buildEdges(filter, isDark), [filter, isDark]);

  const [nodes, setNodes, onNodesChange] = useNodesState(computedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(computedEdges);

  useEffect(() => { setNodes(computedNodes); }, [computedNodes, setNodes]);
  useEffect(() => { setEdges(computedEdges); }, [computedEdges, setEdges]);

  const handleNodeClick = useCallback((_e: React.MouseEvent, node: Node) => {
    if (node.type !== 'laneNode') onNodeClick(node);
  }, [onNodeClick]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.07 }}
      minZoom={0.03}
      maxZoom={2}
      style={{ background: 'var(--c-bg-app)' }}
      defaultEdgeOptions={{ type: 'smoothstep' }}
      proOptions={{ hideAttribution: true }}
    >
      <Background color={isDark ? '#0d2540' : '#c8d9ea'} gap={28} size={1} />
      <Controls style={{ background: 'var(--c-bg-sidebar)', border: '1px solid var(--c-border)', borderRadius: 8 }} />

      {/* Legend overlay */}
      <div style={{
        position: 'absolute', bottom: 16, right: 16, zIndex: 5,
        background: 'var(--c-bg-sidebar)', border: '1px solid var(--c-border)', borderRadius: 10,
        padding: '12px 16px', fontSize: 11, color: 'var(--c-text-dim)', backdropFilter: 'blur(4px)',
      }}>
        <div style={{ fontWeight: 800, color: 'var(--c-text-2)', marginBottom: 9, fontSize: 12, letterSpacing: '0.5px' }}>
          Data Flow Legend
        </div>
        {[
          { color: '#ED1C2E', label: 'Kafka publish (animated)',  dashed: false, animated: true  },
          { color: '#7C3AED', label: 'Kafka consume',             dashed: false, animated: false },
          { color: '#009FDA', label: 'Service → Service (calls)', dashed: false, animated: false },
          { color: '#10B981', label: 'External integration',      dashed: true,  animated: false },
          { color: '#F59E0B', label: 'External → Kafka publish',  dashed: false, animated: true  },
        ].map(({ color, label, dashed }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <svg width="30" height="10">
              <line x1="0" y1="5" x2="24" y2="5"
                stroke={color} strokeWidth="2.5"
                strokeDasharray={dashed ? '5 3' : undefined} />
              <polygon points="24,2 30,5 24,8" fill={color} />
            </svg>
            <span style={{ color, fontWeight: 600 }}>{label}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--c-border)', marginTop: 9, paddingTop: 8, fontSize: 10, color: 'var(--c-text-muted)' }}>
          Click any node to view full details →
        </div>
      </div>

      <MiniMap
        style={{ background: 'var(--c-bg-sidebar)', border: '1px solid var(--c-border)' }}
        nodeColor={n => {
          if (n.type === 'kafkaNode')    return NODE_COLORS.kafka;
          if (n.type === 'externalNode') return NODE_COLORS.external;
          if (n.type === 'laneNode')     return 'transparent';
          return (n.data?.color as string) || '#64748b';
        }}
        maskColor={isDark ? 'rgba(6,14,28,0.75)' : 'rgba(238,242,247,0.75)'}
      />
    </ReactFlow>
  );
};

export default Graph;
