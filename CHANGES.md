# CHANGES — FXIP Data Lineage Tool

All notable changes to the FXIP Data Lineage Tool are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.7.0] — Glossary, CHANGES.md, README Update

### Added
- **`src/data/glossary.ts`** — authoritative data file with 40+ aviation and platform terms (authentic definitions sourced from ICAO Docs 4444/7910/8585, ARINC 618/633/724B, FAA Orders JO 7110.65/7930.2, IBM/TWC ACARS specification, and AA SOAR/FXIP documentation) and 71 ICAO/IATA airline and airport codes
- **`src/components/Glossary.tsx`** — two-tab searchable component:
  - **Glossary tab**: category filter sidebar (All / Aviation Ops / ACARS / Fuel / Flight Planning / Platform / Messaging / Standards), hero full-text search across term, expansion, definition, context; A–Z quick-jump nav; accordion cards with FXIP-context boxes and related-term chips; count badge
  - **Aviation Codes tab**: ICAO Airline / IATA Airline / ICAO Airport / IATA Airport sub-tabs; full-text search by code, name, city, country; hub-airport star (⭐) badge; copy-to-clipboard on code; authoritative code-type explainer footer
- Left panel now has three views: **Graph View** · **Data Catalog** · **Glossary** (`📖`)
- `CHANGES.md` — this file
- `README.md` — comprehensive user and developer documentation

### Changed
- **`src/components/FilterPanel.tsx`** — view type extended from `'graph' | 'catalog'` to `'graph' | 'catalog' | 'glossary'`; added Glossary button to view switcher
- **`src/App.tsx`** — `view` state and `handleViewChange` signature extended to include `'glossary'`; Glossary component imported and rendered when active

### Data Quality
- All aviation term definitions cite authoritative sources (ICAO, ARINC, FAA, IBM/TWC)
- ICAO 4-letter airport indicators match ICAO Doc 7910
- ICAO 3-letter airline designators match ICAO Doc 8585
- IATA 3-letter airport codes and 2-letter airline codes match IATA SSIM

---

## [1.6.0] — Data Catalog, Sidebar Tabs, View Switcher

*Commit: b349892*

### Added
- **`src/data/lineage.ts`** — `DataObject` (16 objects) and `DomainEvent` (20 events) interfaces and data, sourced from:
  - `ACARS_Interface.xsd` — ACARSMessageRequest, ACARSDownlinkMessage, FlightKey, DPRParams, AirlineCode, DateTime structures
  - `OpsHub_FTM_Uplink_Swagger.yaml` — FTMonDemand, FTMUplinkFOSRequest, FTMUplinkFOSResponse REST models
  - Apache Avro schemas — FlightEvent, FuelPlan, AircraftStatus, MaintenanceEvent, CrewMember, FlightPlan objects
- **`src/components/DataCatalog.tsx`** — full-screen searchable data catalog with:
  - Two tabs: **Data Objects** (16 items, grouped by domain) and **Domain Events** (20 events)
  - Left panel: search bar, domain filter pills (ACARS / Fuel / Flight Plan / Aircraft / Crew / Maintenance / Operations / Platform), stats bar, scrollable list with card layout
  - Right detail panel: field table with types/required markers, service usage list, related events, collapsible JSON sample payload
- **`src/components/FilterPanel.tsx`** — added view switcher section (Graph View / Data Catalog) above the existing node-type filters

### Changed
- **`src/components/Sidebar.tsx`** — added tab navigation to service node detail panel:
  - **Overview** tab: deployment info, REST endpoints, Kafka publishes/consumes, external integrations, databases, `calledBy`/`calls`, RabbitMQ queues (unchanged content, now in a tab)
  - **Events** tab: incoming (purple border) and outgoing (red border) domain events per service, each showing topic, description, trigger, format, related data object, and a collapsible JSON sample payload
  - **Schema** tab: DataObject entries used by this service with inline field type tables
- **`src/App.tsx`** — added `view` state (`'graph' | 'catalog'`), `handleViewChange` callback, conditional rendering of `Graph` vs. `DataCatalog`

---

## [1.5.0] — DataObject + DomainEvent Catalog from Real Contracts

### Added
- `DataDomain` type: `'acars' | 'fuel' | 'flight-plan' | 'aircraft' | 'crew' | 'maintenance' | 'operations' | 'platform'`
- `DataField` interface: `{ name, type, required, description }`
- `DataObject` interface: `{ id, name, domain, description, format, sourceSystem, schemaRef, fields, usedBy, relatedEvents, samplePayload }`
- `DomainEvent` interface: `{ id, name, topic, direction, description, trigger, format, schema, dataObject, services, samplePayload }`
- 16 DataObject entries derived from XSD, Swagger, and Avro contracts
- 20 DomainEvent entries covering ACARS uplinks/downlinks, flight plan creation/supersede, fuel plan, aircraft/crew status, maintenance events, and flight movement

---

## [1.4.0] — Docker, nginx, Helm Deployment

### Added
- **`Dockerfile`** — multi-stage build: `node:20-alpine` (build) → `nginx:1.27-alpine` (serve)
- **`nginx.conf`** — SPA-compatible configuration with `try_files $uri /index.html`, gzip compression, static asset caching headers
- **`docker-compose.yml`** — single-service compose file exposing port 8080
- **`.dockerignore`** — excludes `node_modules`, `dist`, `.git`
- **`helm/`** — Helm chart (`Chart.yaml`, `values.yaml`, `templates/`): Deployment, Service, Ingress, ConfigMap, HorizontalPodAutoscaler

---

## [1.3.0] — FilterPanel, Header Search, Edge Legend

### Added
- **`src/components/FilterPanel.tsx`** — left-rail node-type filter toggles (APIs/Services, Processors, Adapters, MGW/BCP, Tools, Kafka Topics, External Systems) with color swatches and "Select All / Clear" controls
- **`src/components/Header.tsx`** — search bar that filters services by name in real time, passing `searchTerm` prop to Graph
- Edge legend panel in Graph view (bottom-left): colored key for all 5 edge types

### Changed
- `Graph.tsx` accepts `searchTerm` prop; `useEffect` dims non-matching service nodes when a search term is active

---

## [1.2.0] — Sidebar Detail Panel

### Added
- **`src/components/Sidebar.tsx`** — slide-in right panel appearing when a node is clicked:
  - **Service nodes**: deployment info (Kubernetes namespace, replicas), REST endpoints with method/path/description, Kafka topics published/consumed (with partition/replica counts), external system integrations, databases, `calledBy` and `calls` adjacency lists, RabbitMQ queues
  - **Kafka topic nodes**: topic metadata (partitions, replication, retention), producer and consumer service lists, event description, format
  - **External system nodes**: connected FXIP services, protocol used, description

### Changed
- `Graph.tsx` passes `onNodeClick` callback; clicking any node opens Sidebar with appropriate content
- `App.tsx` manages `selectedNode` state and `handleClose` callback

---

## [1.1.0] — ReactFlow Swimlane Graph

### Added
- **`src/components/Graph.tsx`** — full ReactFlow implementation:
  - 4 swimlane background nodes (AA APIs · Processors · Adapters / Tools · MGW / External)
  - 4 custom node types: `serviceNode`, `kafkaNode`, `externalNode`, `laneNode`
  - 25 FXIP service nodes across swimlanes
  - 27 Kafka/Azure Event Hub topic nodes
  - 12 external system nodes
  - 5 directed edge types: service→kafka publish (red), kafka→service consume (blue), service→service call (sky blue), service→external (green), service→database (teal)
  - Minimap and controls
- **`src/data/lineage.ts`** — complete FXIP service catalog: `Service`, `KafkaTopic`, `ExternalSystem` interfaces; full data arrays for all 25 services, 27 topics, 12 external systems; `NODE_COLORS` palette; `RestEndpoint` interface with HTTP method, path, and description
- AA brand color CSS variables in `src/index.css`

### Changed
- `vite.config.ts` — added `server.port: 5173` and `preview.port: 4173`

---

## [1.0.0] — Initial Scaffold

### Added
- React + Vite + TypeScript project scaffolded with `npm create vite@latest fxip-data-lineage-tool -- --template react-ts`
- Dependencies: `reactflow`, `lucide-react`
- `tsconfig.json` with `verbatimModuleSyntax: true` and `strict: true`
- `src/index.css` — AA brand CSS custom properties (`--aa-navy`, `--aa-red`, `--aa-sky`, `--aa-dark-bg`, `--aa-border`, `--aa-muted`)
- `src/main.tsx`, `src/App.tsx` entry points

---

*Maintained by the FXIP Platform Engineering team.*
