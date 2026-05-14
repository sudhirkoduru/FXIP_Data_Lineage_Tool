import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import type { Node, Edge, NodeTypes } from 'reactflow';
import 'reactflow/dist/style.css';
import {
  services,
  kafkaTopics,
  externalSystems,
  NODE_COLORS,
} from '../data/lineage';
import type { NodeType } from '../data/lineage';

interface GraphProps {
  filter: string[];
  searchTerm: string;
  onNodeClick: (node: Node) => void;
}

// ── Custom node component ────────────────────────────────────────────────────
const ServiceNode = ({ data }: { data: { label: string; acronym: string; type: string; color: string; appName: string } }) => (
  <div
    className="service-node"
    style={{
      background: data.color,
      border: '2px solid rgba(255,255,255,0.2)',
      borderRadius: '10px',
      padding: '10px 14px',
      minWidth: 140,
      maxWidth: 180,
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      color: '#fff',
    }}
  >
    <div style={{ fontSize: '10px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {data.type}
    </div>
    <div style={{ fontSize: '13px', fontWeight: 700, marginTop: 2 }}>{data.acronym}</div>
    <div style={{ fontSize: '10px', opacity: 0.85, marginTop: 2, lineHeight: '1.3' }}>{data.label}</div>
    <div style={{ fontSize: '9px', opacity: 0.6, marginTop: 4, fontFamily: 'monospace' }}>{data.appName}</div>
  </div>
);

const KafkaNode = ({ data }: { data: { label: string; group: string; format: string; brokerType: string } }) => (
  <div
    style={{
      background: NODE_COLORS.kafka,
      border: '2px solid rgba(255,255,255,0.2)',
      borderRadius: '6px',
      padding: '8px 12px',
      minWidth: 220,
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      color: '#fff',
    }}
  >
    <div style={{ fontSize: '9px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      Kafka Topic · {data.group}
    </div>
    <div style={{ fontSize: '11px', fontWeight: 700, marginTop: 2, fontFamily: 'monospace', wordBreak: 'break-all' }}>
      {data.label}
    </div>
    <div style={{ fontSize: '9px', opacity: 0.7, marginTop: 3 }}>
      {data.format} · {data.brokerType}
    </div>
  </div>
);

const ExternalNode = ({ data }: { data: { label: string; type: string; color: string } }) => (
  <div
    style={{
      background: data.color,
      border: '2px dashed rgba(255,255,255,0.4)',
      borderRadius: '8px',
      padding: '10px 14px',
      minWidth: 140,
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      color: '#fff',
    }}
  >
    <div style={{ fontSize: '9px', opacity: 0.7, textTransform: 'uppercase' }}>{data.type}</div>
    <div style={{ fontSize: '12px', fontWeight: 700, marginTop: 2 }}>{data.label}</div>
  </div>
);

const nodeTypes: NodeTypes = {
  serviceNode: ServiceNode,
  kafkaNode: KafkaNode,
  externalNode: ExternalNode,
};

// ── Layout helpers ────────────────────────────────────────────────────────────
const COLS = 4;
const ROW_GAP = 180;
const COL_GAP = 230;

function buildNodes(filter: string[], searchTerm: string): Node[] {
  const nodes: Node[] = [];

  // Group services by type for layout
  const types: NodeType[] = ['api', 'processor', 'adapter', 'mgw', 'tool'];
  services.forEach((svc, _i) => {
    if (filter.length > 0 && !filter.includes(svc.type)) return;
    if (searchTerm && !svc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !svc.acronym.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !svc.description.toLowerCase().includes(searchTerm.toLowerCase())) return;

    const group = types.indexOf(svc.type as NodeType);
    const countInGroup = services.filter(s => s.type === svc.type).indexOf(svc);
    const col = countInGroup % COLS;
    const row = Math.floor(countInGroup / COLS);

    nodes.push({
      id: svc.id,
      type: 'serviceNode',
      position: {
        x: col * COL_GAP + group * 30,
        y: group * ROW_GAP * 2.5 + row * ROW_GAP,
      },
      data: {
        label: svc.name,
        acronym: svc.acronym,
        type: svc.type.toUpperCase(),
        color: NODE_COLORS[svc.type as NodeType],
        appName: svc.appName,
        raw: svc,
      },
    });
  });

  // Kafka topics — only if not filtered out
  if (filter.length === 0 || filter.includes('kafka')) {
    kafkaTopics.forEach((topic, i) => {
      if (searchTerm && !topic.name.toLowerCase().includes(searchTerm.toLowerCase())) return;
      const col = i % 5;
      const row = Math.floor(i / 5);
      nodes.push({
        id: topic.id,
        type: 'kafkaNode',
        position: {
          x: col * 260 - 100,
          y: 1400 + row * 110,
        },
        data: {
          label: topic.name,
          group: topic.group,
          format: topic.format,
          brokerType: topic.brokerType,
          raw: topic,
        },
      });
    });
  }

  // External systems
  if (filter.length === 0 || filter.includes('external')) {
    externalSystems.forEach((ext, i) => {
      if (searchTerm && !ext.name.toLowerCase().includes(searchTerm.toLowerCase())) return;
      nodes.push({
        id: ext.id,
        type: 'externalNode',
        position: {
          x: i * 200 - 100,
          y: 2000 + Math.floor(i / 5) * 130,
        },
        data: {
          label: ext.name,
          type: ext.type,
          color: NODE_COLORS.external,
          raw: ext,
        },
      });
    });
  }

  return nodes;
}

function buildEdges(filter: string[]): Edge[] {
  const edges: Edge[] = [];
  const addedEdges = new Set<string>();

  const addEdge = (source: string, target: string, label: string, animated: boolean, color: string) => {
    const key = `${source}->${target}`;
    if (addedEdges.has(key)) return;
    addedEdges.add(key);
    edges.push({
      id: key,
      source,
      target,
      animated,
      label,
      style: { stroke: color, strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color },
      labelStyle: { fill: '#9ca3af', fontSize: 9 },
      labelBgStyle: { fill: '#1f2937', fillOpacity: 0.8 },
    });
  };

  // Kafka producer → topic → consumer edges
  if (filter.length === 0 || filter.includes('kafka')) {
    kafkaTopics.forEach(topic => {
      topic.producers.forEach(producerId => {
        const svcExists = services.find(s => s.id === producerId);
        if (svcExists && (filter.length === 0 || filter.includes(svcExists.type))) {
          addEdge(producerId, topic.id, 'produces', true, '#ED1C2E');
        }
      });
      topic.consumers.forEach(consumerId => {
        const svcExists = services.find(s => s.id === consumerId);
        if (svcExists && (filter.length === 0 || filter.includes(svcExists.type))) {
          addEdge(topic.id, consumerId, 'consumes', false, '#7C3AED');
        }
      });
    });
  }

  // External system edges
  services.forEach(svc => {
    if (filter.length > 0 && !filter.includes(svc.type)) return;
    svc.externalSystems.forEach(extId => {
      if (filter.length === 0 || filter.includes('external')) {
        addEdge(svc.id, extId, '', false, '#10B981');
      }
    });
    svc.calls.forEach(targetId => {
      const targetSvc = services.find(s => s.id === targetId);
      if (targetSvc && (filter.length === 0 || filter.includes(targetSvc.type))) {
        addEdge(svc.id, targetId, 'calls', false, '#0078D2');
      }
    });
  });

  return edges;
}

// ─────────────────────────────────────────────────────────────────────────────
const Graph: React.FC<GraphProps> = ({ filter, searchTerm, onNodeClick }) => {
  const initialNodes = useMemo(() => buildNodes(filter, searchTerm), [filter, searchTerm]);
  const initialEdges = useMemo(() => buildEdges(filter), [filter]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    onNodeClick(node);
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
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.05}
      maxZoom={2}
      defaultEdgeOptions={{ type: 'smoothstep' }}
      style={{ background: '#071428' }}
    >
      <Background color="#0d2a4a" gap={24} />
      <Controls style={{ background: '#071a33', border: '1px solid #0d2a4a', borderRadius: 8 }} />
      <MiniMap
        style={{ background: '#071a33', border: '1px solid #0d2a4a' }}
        nodeColor={(n) => {
          if (n.type === 'kafkaNode') return NODE_COLORS.kafka;
          if (n.type === 'externalNode') return NODE_COLORS.external;
          return (n.data?.color as string) || '#64748b';
        }}
        maskColor="rgba(7, 20, 40, 0.75)"
      />
    </ReactFlow>
  );
};

export default Graph;
