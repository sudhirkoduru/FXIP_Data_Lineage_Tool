# FXIP Data Lineage Tool

A real-time, interactive data lineage visualization for American Airlines **FXIP (Fusion/SOAR Integration Platform)**. The tool renders the complete event and data flow across 25 microservices, 27 Kafka/Azure Event Hub topics, and 12 external systems — from OFP creation in FlightKeys through ACARS uplinks delivered to the cockpit.

Built with React + Vite + TypeScript. Branded in American Airlines navy, red, and sky blue.

---

## Features

| Feature | Description |
|---|---|
| **Interactive Swimlane Graph** | ReactFlow graph with 4 swimlanes, 5 edge types, and click-to-inspect detail panel |
| **Node Filters** | Toggle visibility of API services, processors, adapters, MGW, tools, Kafka topics, and external systems |
| **Header Search** | Real-time service name search — dims non-matching nodes |
| **Service Sidebar** | 3-tab detail panel: Overview, Domain Events, Schema Objects |
| **Data Catalog** | Searchable catalog of 16 Data Objects and 20 Domain Events derived from real XSD/Avro/Swagger contracts |
| **Glossary** | Searchable glossary of 40+ authentic aviation and platform terms + 71 ICAO/IATA airline and airport codes |

---

## Quick Start

### Prerequisites

- Node.js 20 or later
- npm 10 or later

### Run in Development

```bash
git clone https://github.com/sudhirkoduru/FXIP_Data_Lineage_Tool.git
cd FXIP_Data_Lineage_Tool
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
npm run preview          # serves built output on http://localhost:4173
```

---

## Docker

### Build and Run

```bash
docker build -t fxip-data-lineage-tool:latest .
docker run -p 8080:80 fxip-data-lineage-tool:latest
```

Open `http://localhost:8080`.

### Docker Compose

```bash
docker-compose up
```

### Image Details

The Dockerfile uses a two-stage build:

| Stage | Base image | Purpose |
|---|---|---|
| Build | `node:20-alpine` | Install deps, run `npm run build`, produce `dist/` |
| Serve | `nginx:1.27-alpine` | Serve `dist/` via nginx with SPA routing support |

nginx is configured with `try_files $uri /index.html` for client-side routing, gzip compression, and long-lived Cache-Control headers for hashed static assets.

---

## Kubernetes / Helm Deployment

A Helm chart is included under `helm/`:

```bash
helm install fxip-data-lineage helm/ \
  --set image.tag=latest \
  --set ingress.hosts[0].host=fxip-lineage.internal.aa.com
```

| Template | Purpose |
|---|---|
| `Deployment.yaml` | Kubernetes Deployment with configurable replicas |
| `Service.yaml` | ClusterIP service on port 80 |
| `Ingress.yaml` | Ingress with configurable host and TLS |
| `ConfigMap.yaml` | nginx configuration mounted into container |
| `HorizontalPodAutoscaler.yaml` | CPU-based autoscaling |

---

## Navigation Guide

The left panel contains three view buttons:

| Icon | View | Description |
|---|---|---|
| ⬡ | **Graph View** | Interactive data flow swimlane graph |
| 📦 | **Data Catalog** | Searchable catalog of data objects and events |
| 📖 | **Glossary** | Aviation and platform glossary + ICAO/IATA codes |

Below the view switcher (in Graph View) are node-type filter toggles:

- **APIs / Services** (blue) — FXD_SOAR Spring Boot API services
- **Processors** (purple) — event and flight plan processors
- **Adapters** (cyan) — OpsHub data adapter services
- **MGW / BCP** (amber) — message gateway services
- **Tools** (gray) — developer and operational tools
- **Kafka Topics** (red) — Azure Event Hub / Confluent Cloud topics
- **External Systems** (green) — IBM ACARS, FOS, FlightKeys, Fusion/TWC, etc.

---

## Graph View

The swimlane graph shows the complete FXIP data flow across four functional layers:

```
┌────────────────────────────────────────────────────────────────────┐
│  AA APIs / Services      FXD_SOAR_*_API services                  │
├────────────────────────────────────────────────────────────────────┤
│  Processors              FlightPlan, FlightData, AircraftData ...  │
├────────────────────────────────────────────────────────────────────┤
│  Adapters / Tools        OpsHub adapters, Audit, FOS updater ...   │
├────────────────────────────────────────────────────────────────────┤
│  MGW / External          IBM MQ bridges, FlightKeys, Fusion, FOS   │
└────────────────────────────────────────────────────────────────────┘
```

### Node Types

| Color | Type | Examples |
|---|---|---|
| Blue `#0078D2` | API Service | FXD_SOAR_Fusion_ACARS_Service |
| Purple `#7C3AED` | Processor | FXD_SOAR_FlightPlan_Processor |
| Cyan `#0EA5E9` | Adapter | FXD_SOAR_FlightData_Adapter |
| Amber `#F59E0B` | MGW | FXD_SOAR_ACARS_MGW |
| Gray `#6B7280` | Tool | FXD_SOAR_Audit_Log_Processor |
| Red `#ED1C2E` | Kafka Topic | flight-event-aa-departure-arrival-avro |
| Green `#10B981` | External System | IBM ACARS Gateway, FlightKeys |

### Edge Types

| Color | Meaning |
|---|---|
| Red `#ED1C2E` | Service **publishes** to Kafka topic |
| Blue `#0078D2` | Service **consumes** from Kafka topic |
| Sky blue `#009FDA` | Direct service-to-service **call** |
| Green `#10B981` | Service calls **external system** |
| Teal `#14B8A6` | Service writes to **database** |

Click any node to open the **Sidebar detail panel**.

---

## Data Catalog

Switch to **Data Catalog** view to explore the data objects and events flowing through FXIP.

### Data Objects Tab

16 data objects derived from real AA contracts:

| Source Contract | Objects |
|---|---|
| `ACARS_Interface.xsd` | ACARSMessageRequest, ACARSDownlinkMessage, FlightKey, DPRParams, AirlineCode, DateTime |
| `OpsHub_FTM_Uplink_Swagger.yaml` | FTMonDemand, FTMUplinkFOSRequest, FTMUplinkFOSResponse |
| Avro schemas (OpsHub) | FlightEvent, FuelPlan, AircraftStatus, MaintenanceEvent, CrewMember, FlightPlan |

Use the domain filter pills to narrow by: ACARS · Fuel · Flight Plan · Aircraft · Crew · Maintenance · Operations · Platform.

### Domain Events Tab

20 domain events covering: ACARS uplinks/downlinks, OFP lifecycle, aircraft status/OTS/DMI, crew assignments, OOOI flight movement, and FlightKeys notifications.

---

## Glossary

Switch to **Glossary** view for the authoritative aviation and platform reference.

### Glossary Tab

Search across term name, acronym expansion, full definition, and FXIP context. Category filters in the left sidebar:

| Category | Terms |
|---|---|
| ✈ Aviation Ops | OOOI, MEL, DMI, OTS, SELCAL, ETD/ETA, ATC, OCC, ICAO, IATA, NOTAM, IFR, FAF |
| 📡 ACARS | ACARS, FTM, HGZ, DPR, SBY, VCR, PFS |
| ⛽ Fuel | Trip Fuel, Contingency Fuel, Alternate Fuel, Final Reserve Fuel, Tankering |
| 📋 Flight Planning | OFP, FOS, JPY, JPFF, PR, PRF |
| 🏗 Platform / AA | SOAR, FXIP, Fusion, TWC, WSI, OpsHub, FlightKeys, MGW, DocumentDB |
| ⚡ Messaging | AMQP, Avro, Confluent Cloud, Azure Event Hub, RabbitMQ, IBM MQ, Azure Service Bus |
| 📐 Standards | ARINC 618, ARINC 633, ARINC 724B |

A–Z quick jump buttons in the left sidebar scroll directly to each letter group.

Each term card expands to show: full definition · authoritative source citation · **FXIP Context** box · related terms.

### Aviation Codes Tab

Four sub-tabs: **ICAO Airline** · **IATA Airline** · **ICAO Airport** · **IATA Airport**

- Search by code, name, city, or country
- AA hub airports marked with ⭐ and `HUB` badge
- Click the copy icon to copy any code to the clipboard
- Footer explains the official use of each code type in ATC, ACARS, and FXIP

| Code Type | Format | Authority | FXIP Use |
|---|---|---|---|
| ICAO Airline | 3-letter (AAL) | ICAO Doc 8585 | ACARS AirlineCode.ICAO field |
| IATA Airline | 2-letter (AA) | IATA Resolution 762 | OpsHub topic suffix (soar-aa-*, soar-mq-*), FOS |
| ICAO Airport | 4-letter (KDFW) | ICAO Doc 7910 | ACARS FlightKey, DPRParams AlternateStation |
| IATA Airport | 3-letter (DFW) | IATA SSIM | OpsHub FlightEvent departureAirport, arrivalAirport |

---

## Service Sidebar Tabs

When a service node is selected in Graph View, the sidebar shows three tabs:

**Overview**: Kubernetes namespace, replicas, REST endpoints (method + path + description), Kafka publishes/consumes (with partition/replica counts), external integrations, databases, calledBy/calls adjacency, RabbitMQ queues.

**Events**: Incoming domain events (purple border) and outgoing domain events (red border). Each card shows topic, description, trigger, format, related data object, and a collapsible sample JSON payload.

**Schema**: DataObject entries this service reads or writes, with inline field type tables.

---

## Data Sources

| File | Location | Content |
|---|---|---|
| `ACARS_Interface.xsd` | `src/main/resources/ibm/` | IBM ACARS XML schema |
| `OpsHub_FTM_Uplink_Swagger.yaml` | `src/main/resources/opshub/` | OpsHub REST API spec |
| Avro schemas | OpsHub schema registry | OpsHub event stream schemas |

Glossary definitions cite per-term: ICAO Annex 2/6/11, Doc 4444/7910/8585; ARINC 618/633/724B; FAA JO 7110.65/JO 7930.2; IBM/TWC ACARS specification; AA SOAR/FXIP internal documentation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 (react-ts template) |
| Language | TypeScript 5 (strict, verbatimModuleSyntax) |
| Graph rendering | ReactFlow 11 |
| Icons | lucide-react |
| Container | Docker (node:20-alpine + nginx:1.27-alpine) |
| Orchestration | Kubernetes + Helm 3 |

---

## Project Structure

```
FXIP_Data_Lineage_Tool/
├── src/
│   ├── data/
│   │   ├── lineage.ts          # Services, topics, externals, data objects, domain events
│   │   └── glossary.ts         # Glossary terms and ICAO/IATA aviation codes
│   ├── components/
│   │   ├── Header.tsx          # AA logo, title, search bar, stats
│   │   ├── FilterPanel.tsx     # Left rail: view switcher + node-type filters
│   │   ├── Graph.tsx           # ReactFlow swimlane graph
│   │   ├── Sidebar.tsx         # Click-to-inspect detail panel (3 tabs)
│   │   ├── DataCatalog.tsx     # Data objects + domain events catalog
│   │   └── Glossary.tsx        # Glossary terms + ICAO/IATA codes
│   ├── App.tsx                 # Root component; view routing state
│   ├── index.css               # AA brand CSS custom properties
│   └── main.tsx                # React entry point
├── helm/                       # Helm chart for Kubernetes deployment
├── Dockerfile                  # Multi-stage Docker build
├── docker-compose.yml
├── nginx.conf
├── CHANGES.md                  # Version history
└── README.md                   # This file
```

---

## Contributing

1. Branch from `master`
2. Follow the existing inline-style pattern for new components
3. Source all aviation terms from official ICAO/ARINC/FAA references — do not fabricate definitions
4. Run `npm run build` and verify zero TypeScript errors before committing
5. Update `CHANGES.md` with a summary under a new version heading

---

*FXIP Platform Engineering — American Airlines Technology*
