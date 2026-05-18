# Data Lineage Tool — Agentic Build Instructions

## Purpose

These instructions guide an AI agent to build a **feature-rich, interactive data lineage
and service catalogue tool** for any platform or project suite hosted in GitHub enterprise
repositories. The instructions are intentionally generic — substitute the `[PLACEHOLDERS]`
for your specific domain — while the patterns, data contracts, and component architecture
are reusable as-is.

> **Non-negotiable data rule**: All service metadata, topic names, endpoint paths, schema
> definitions, and glossary terms must be sourced exclusively from the target GitHub
> repositories. Do not fabricate, infer, or assume any data. If a detail is not
> present in the repo, mark it as `unknown` and surface it for human review.

---

## 1. Project Identity (Substitute for Your Domain)

```
PLATFORM_NAME      = "[e.g. FXIP, SOAR, MyPlatform]"
PLATFORM_FULL_NAME = "[e.g. Fusion/SOAR Integration Platform]"
ORG_GITHUB         = "[e.g. AAInternal]"
REPO_SCOPE         = "[glob pattern matching target repos, e.g. FXD_SOAR_*]"
DOMAIN_CONTEXT     = "[e.g. flight operations, payments, crew management]"
BRAND_PRIMARY      = "[hex color, e.g. #0C2340]"
BRAND_ACCENT       = "[hex color, e.g. #009FDA]"
BRAND_ALERT        = "[hex color, e.g. #ED1C2E]"
DEPLOY_TARGET      = "[e.g. AKS, KPaaS, ECS]"
```

---

## 2. Repository Mining — Authentic Data Only

### 2.1 Service Discovery

For each repository matching `REPO_SCOPE`, extract the following from source code only:

| Data Point | Where to Find It |
|---|---|
| Service name & acronym | `README.md`, `aa.yaml`, `pom.xml` / `package.json` `name` field |
| Service type | Infer from class annotations (`@RestController`, `@KafkaListener`), or `aa.yaml` `appType` |
| Docker image name | `Dockerfile`, Helm `values.yaml`, deployment manifests |
| REST endpoints | `@GetMapping`, `@PostMapping`, OpenAPI/Swagger YAML/JSON specs |
| Kafka topics consumed | `@KafkaListener(topics=...)`, `application.yml` `spring.kafka.*` |
| Kafka topics produced | `KafkaTemplate.send(...)`, topic config in `application.yml` |
| External system calls | `RestTemplate`, `WebClient`, `MQConnectionFactory`, `ServiceBusClient` |
| Database connections | `DataSource`, `MongoClient`, `DocumentDB` connection strings |
| Upstream callers | Cross-reference all other repos' `calls` lists |
| App metadata | `aa.yaml` → `squadId`, `appShortName`, `namespace` |

### 2.2 Topic / Event Discovery

For each Kafka or Event Hub topic found during service mining:

| Data Point | Where to Find It |
|---|---|
| Topic name | `@KafkaListener`, `KafkaTemplate.send()`, `application.yml` |
| Message format | Avro schema files (`.avsc`), JSON schema, XSD contracts |
| Producers | All services with `KafkaTemplate.send(topicName)` |
| Consumers | All services with `@KafkaListener(topics = topicName)` |
| Broker type | `application.yml` bootstrap servers — Kafka vs Azure Event Hub |
| Retention / partitions | Terraform/Helm topic config if present; else mark `unknown` |

### 2.3 External System Discovery

Identify external dependencies by scanning for:
- Outbound HTTP clients (`RestTemplate`, `WebClient`, `FeignClient`, `axios`)
- MQ connection factories (`MQConnectionFactory`, `ConnectionFactory`)
- Cloud SDK clients (`ServiceBusClient`, `EventHubProducerClient`, `SqsClient`)
- Database drivers (`MongoClient`, `DataSource`, JDBC URLs)

For each: record `name`, `type` (api / messaging / database / app), and `description`
sourced from README or inline code comments. Never fabricate.

### 2.4 Schema & Data Object Discovery

Mine the following for data object definitions:
- XSD files (`src/main/resources/**/*.xsd`)
- Avro schemas (`src/main/resources/**/*.avsc`)
- OpenAPI specs (`*.yaml`, `*.json` matching `openapi:` or `swagger:`)
- JAXB generated classes (`target/generated-sources/jaxb/**`)
- DTO/model classes (`**/model/*.java`, `**/dto/*.java`)

Extract field names, types, and descriptions only from actual file content.

---

## 3. Data Model — Single Source of Truth

Define one central data model file (e.g. `src/data/lineage.ts`).
All UI components consume this file — never embed raw data in components.

```typescript
// ── Core types ────────────────────────────────────────────────────────────────

export type NodeType =
  | 'api'        // REST API service
  | 'processor'  // Kafka consumer/producer processor
  | 'adapter'    // Protocol or system adapter
  | 'mgw'        // Middleware gateway
  | 'kafka'      // Kafka / Event Hub topic node
  | 'external'   // External system (3rd-party or internal non-repo)
  | 'database'   // Database or data store
  | 'tool';      // Utility / tooling service

export type EdgeType =
  | 'kafka'      // Produces to / consumes from a topic
  | 'rest'       // Synchronous HTTP call
  | 'mq'         // IBM MQ or RabbitMQ
  | 'db'         // Database read/write
  | 'file';      // File-based transfer

export interface RestEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;  // from OpenAPI summary/description only
}

export interface Service {
  id: string;            // unique kebab-case identifier
  name: string;          // full display name
  acronym: string;       // short label shown on graph node
  appName: string;       // from aa.yaml appShortName
  namespace: string;     // Kubernetes namespace
  repo: string;          // GitHub repo name (no org prefix)
  description: string;   // from README first paragraph only
  type: NodeType;
  lane: string;          // swimlane assignment (see Section 4)
  dockerImage: string;   // from Dockerfile or values.yaml
  restEndpoints: RestEndpoint[];
  kafkaConsumes: string[];
  kafkaProduces: string[];
  externalSystems: string[];
  databases: string[];
  calledBy: string[];    // service IDs that call this service
  calls: string[];       // service IDs this service calls
}

export interface KafkaTopic {
  id: string;
  name: string;          // exact topic name from source
  group: string;         // logical grouping label
  brokerType: 'kafka' | 'azure-event-hub' | 'service-bus';
  format: string;        // 'avro' | 'json' | 'xml' | 'unknown'
  producers: string[];   // service IDs
  consumers: string[];   // service IDs
  partitions?: number;   // from config if available; else omit
  retention?: string;    // from config if available; else omit
  notes?: string;
}

export interface ExternalSystem {
  id: string;
  name: string;
  type: 'external-api' | 'messaging' | 'database' | 'app' | 'ibm-mq';
  description: string;
  url?: string;          // only if publicly documented
}

export interface DataObject {
  id: string;
  name: string;
  source: string;        // repo or spec file it was found in
  fields: string[];      // top-level field names from schema
  format: 'xsd' | 'avro' | 'json-schema' | 'openapi' | 'jaxb';
  usedBy: string[];      // service IDs
}

export interface DomainEvent {
  id: string;
  name: string;
  topic: string;         // KafkaTopic id
  producer: string;      // service id
  consumers: string[];   // service ids
  payloadSchema?: string; // DataObject id if schema found
}
```

### Delta Update Rule

When a repository changes:
1. Re-mine only the changed repo(s)
2. Update only the affected `Service`, `KafkaTopic`, or `ExternalSystem` entries
3. Rebuild dependent `calledBy` / `calls` cross-references across all services
4. Do not touch unrelated entries
5. Add a `// Last synced: YYYY-MM-DD from <repo>@<branch>` comment per entry

---

## 4. Swimlane Architecture

Assign each service to exactly one lane based on its deployment target and role.
Define lanes upfront — adapt the names and colours to your domain.

```typescript
export const LANES: Lane[] = [
  {
    id: 'cloud',          // e.g. AWS, GCP, or primary cloud
    label: '[Cloud / AWS]',
    color: '[brand color]',
    description: 'Cloud-native services and managed infrastructure',
  },
  {
    id: 'azure',          // or secondary cloud / enterprise platform
    label: '[Azure / Enterprise]',
    color: '[brand color]',
    description: 'Enterprise integration services and APIs',
  },
  {
    id: 'messaging',      // event backbone
    label: '[Kafka / Event Hub]',
    color: '[brand color]',
    description: 'Asynchronous event backbone — topics and brokers',
  },
  {
    id: 'onprem',         // legacy or on-premise systems
    label: '[On-Prem / Legacy]',
    color: '[brand color]',
    description: 'On-premise systems and legacy integrations',
  },
];
```

> Rule: If a service spans multiple deployment zones, assign it to the lane where it
> primarily receives traffic or where its primary function resides.

---

## 5. UI Component Architecture

Build the following components. Each has a single responsibility and consumes
only from the central data model — never from each other's internal state.

```
src/
├── data/
│   ├── lineage.ts       ← single source of truth (Section 3)
│   └── glossary.ts      ← domain term definitions (Section 6)
├── components/
│   ├── Graph.tsx         ← ReactFlow swimlane canvas
│   ├── DataCatalog.tsx   ← 3-tab catalog (Objects / Events / Components)
│   ├── Glossary.tsx      ← searchable term browser
│   ├── Sidebar.tsx       ← node detail panel (tabs: Overview / Events / Schema)
│   ├── FilterPanel.tsx   ← node type and lane visibility toggles
│   ├── SearchBar.tsx     ← real-time node search (dims non-matching)
│   └── Header.tsx        ← branding, nav tabs, theme toggle
├── context/
│   └── ThemeContext.tsx  ← light/dark mode
└── App.tsx               ← tab router (Graph | Catalog | Glossary)
```

### Graph.tsx — Key Constraints

- Canvas width: wide enough to show all lanes without overlap (start at `2400px`)
- Each lane is a labelled background region — use absolute positioned divs or
  ReactFlow `Background` with custom rendering
- Node types: one custom node component per `NodeType`
- Edge types: colour-coded by `EdgeType` — define a legend in the sidebar
- Click on any node: opens `Sidebar` with that node's detail
- Nodes auto-layout within lane by type order: API → Processor → Adapter → Tool

### DataCatalog.tsx — Three Tabs

| Tab | Data Source | Filter Controls |
|---|---|---|
| Data Objects | `dataObjects[]` from lineage.ts | Search by name / format |
| Domain Events | `domainEvents[]` from lineage.ts | Filter by topic / producer |
| Components | `services[]` from lineage.ts | Sub-tab by NodeType |

Each component entry shows: acronym badge, name, description, endpoint count,
topic count, integration count. Click → detail panel with full service metadata.

---

## 6. Glossary — Authentic Sources Only

```typescript
export interface GlossaryTerm {
  id: string;
  term: string;
  expansion?: string;   // acronym expansion if applicable
  category: string;     // domain-specific category
  definition: string;   // sourced from official spec or repo docs
  source: string;       // exact reference (spec name, doc title, repo file)
  context?: string;     // how the term is used in THIS platform specifically
  relatedTerms?: string[];
}
```

**Approved sources for definitions** (adapt to your domain):
- Official standards bodies relevant to your domain
- Internal platform documentation committed to repos
- README files and inline code comments
- OpenAPI spec `description` fields

**Never** define a term from general knowledge without a `source` citation.
If a term is commonly understood but not documented in a repo, cite the
standard or specification it comes from.

---

## 7. Tech Stack Defaults

Use these defaults unless the target project has an established stack:

| Concern | Choice | Rationale |
|---|---|---|
| Framework | React 19 | Concurrent rendering for large graph canvases |
| Build tool | Vite (latest) | Sub-second HMR, Rolldown bundler |
| Language | TypeScript strict | `strict: true`, `verbatimModuleSyntax: true` |
| Graph library | ReactFlow 11 | Custom node types, programmatic layout |
| Icons | `react-icons/si` + `react-icons/fa` | SI for tech brands, FA for cloud providers |
| Container | `node:20-alpine` build → `nginx:alpine` serve | Multi-stage, non-root nginx user |
| Orchestration | Helm + Kubernetes | HPA-ready, `values.yaml` per environment |

---

## 8. Extensibility Rules

The tool must accommodate future delta changes without structural rewrites.

### Adding a New Service

1. Mine the new repo following Section 2
2. Add one `Service` entry to `lineage.ts`
3. Update `calledBy` / `calls` on any affected existing services
4. Assign to an existing `lane` — add a new lane only if the deployment
   zone is genuinely new
5. No UI component changes required unless a new `NodeType` is introduced

### Adding a New NodeType

1. Add the string literal to the `NodeType` union in `lineage.ts`
2. Add a custom node component in `Graph.tsx`
3. Add an entry to `COMP_TYPE_META` in `DataCatalog.tsx`
4. Add a filter toggle in `FilterPanel.tsx`
5. No other files require changes

### Adding a New Topic

1. Add one `KafkaTopic` entry to `lineage.ts`
2. Update `kafkaProduces` / `kafkaConsumes` on the relevant services
3. If a `DomainEvent` rides this topic, add a `DomainEvent` entry
4. No UI changes required

### Adding a New Lane

1. Add one `Lane` entry to the `LANES` array in `lineage.ts`
2. Update `Graph.tsx` lane background regions — each lane is data-driven
   from `LANES`, so adding an entry auto-renders the new lane
3. Assign services to the new lane by updating their `lane` field

---

## 9. Agentic Execution Workflow

When an AI agent executes these instructions, follow this order:

```
Phase 1 — Discover
  ├── List all repos matching REPO_SCOPE via GitHub API or MCP server
  ├── For each repo: clone or fetch latest default branch
  ├── Extract Service, KafkaTopic, ExternalSystem per Section 2
  └── Flag any field that could not be sourced — do not fabricate

Phase 2 — Model
  ├── Build lineage.ts from extracted data
  ├── Cross-reference calledBy/calls across all services
  ├── Assign lanes per Section 4 rules
  └── Validate: every topic producer/consumer references a known service id

Phase 3 — Scaffold
  ├── Initialise project: npm create vite@latest -- --template react-ts
  ├── Install: reactflow, react-icons, lucide-react
  ├── Create component stubs per Section 5 structure
  └── Wire App.tsx tab router

Phase 4 — Implement
  ├── Implement Graph.tsx with swimlane layout and node types
  ├── Implement DataCatalog.tsx with 3-tab structure
  ├── Implement Glossary.tsx from glossary.ts
  ├── Implement Sidebar.tsx node detail panel
  └── Apply brand colours from BRAND_* variables

Phase 5 — Containerise
  ├── Write Dockerfile (multi-stage: node build → nginx serve)
  ├── Write nginx.conf (SPA routing, gzip, cache headers)
  ├── Write Helm chart (values.yaml with image, replicas, ingress)
  └── Test: podman build && podman run -p 8080:80

Phase 6 — Validate
  ├── Verify every service in lineage.ts renders a node in the graph
  ├── Verify every topic renders an edge between its producers and consumers
  ├── Verify no fabricated data exists — all entries traceable to a source file
  └── Run: npm run build — zero TypeScript errors, zero lint warnings
```

---

## 10. Quality Gates

Before marking the tool as complete, all of the following must pass:

- [ ] TypeScript strict mode: zero errors (`tsc --noEmit`)
- [ ] Production build succeeds with no errors
- [ ] Every `Service.repo` value is a real repo under `ORG_GITHUB`
- [ ] Every `KafkaTopic.name` appears in at least one repo's source code
- [ ] Every `GlossaryTerm.source` is populated — no unsourced definitions
- [ ] Every `Service.dockerImage` is traceable to a `Dockerfile` or `values.yaml`
- [ ] `calledBy` and `calls` are symmetric — if A calls B, B.calledBy includes A
- [ ] Graph renders all services without node overlap
- [ ] DataCatalog renders all three tabs with correct counts
- [ ] Container runs and serves the app on `localhost:8080`

---

## 11. Recommended Next Step — AI Agent Continuous Maintenance

Once the tool is live, deploy an AI agent to maintain it autonomously:

```
Trigger:    Pull request merged to any repo matching REPO_SCOPE
Action:
  1. Re-mine the changed repo per Section 2
  2. Diff against current lineage.ts entries for that service
  3. For safe deltas (new endpoint, new topic, description change):
       → Auto-generate a PR to FXIP_Data_Lineage_Tool updating lineage.ts
  4. For structural changes (new service, removed service, lane change):
       → Open a draft PR with the proposed change + a summary for human review
  5. For ambiguous changes (calledBy/calls graph mutations):
       → Flag for human review with a diff and impact analysis
       → Never auto-merge graph topology changes

Goal: lineage.ts stays current with the actual repos at all times —
      the tool becomes a living, self-maintaining operational wiki.
```

---

## 12. Reuse Checklist for a New Project Suite

To adapt these instructions for a different platform:

- [ ] Replace all `[PLACEHOLDER]` values in Section 1
- [ ] Update `REPO_SCOPE` to target the correct GitHub org and repo pattern
- [ ] Redefine `LANES` in Section 4 to match the new deployment topology
- [ ] Replace `NodeType` values if the service taxonomy differs
- [ ] Update `GlossaryTerm` approved sources in Section 6 for the new domain
- [ ] Update brand colour variables in Section 7
- [ ] Run Phase 1 (Discover) before writing any code — data drives the model

Everything else — the data model schema, component architecture, extensibility
rules, agentic workflow, and quality gates — applies unchanged to any project suite.
