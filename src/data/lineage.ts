// ============================================================
// FXIP Data Lineage — Source of Truth
// All data derived exclusively from AAInternal GitHub repos
// ============================================================

export type NodeType = 'api' | 'processor' | 'adapter' | 'mgw' | 'kafka' | 'external' | 'database' | 'tool';

export interface RestEndpoint {
  method: string;
  path: string;
  description: string;
}

export interface Service {
  id: string;
  name: string;
  acronym: string;
  appName: string;
  namespace: string;
  repo: string;
  description: string;
  type: NodeType;
  dockerImage: string;
  restEndpoints: RestEndpoint[];
  kafkaConsumes: string[];
  kafkaProduces: string[];
  rabbitMQQueues: string[];
  externalSystems: string[];
  databases: string[];
  calledBy: string[];
  calls: string[];
}

export interface KafkaTopic {
  id: string;
  name: string;
  group: string;
  partitions: number;
  retention: string;
  format: string;
  brokerType: string;
  producers: string[];
  consumers: string[];
  notes?: string;
}

export interface ExternalSystem {
  id: string;
  name: string;
  type: 'external-api' | 'messaging' | 'database' | 'app' | 'ibm-mq';
  description: string;
  url?: string;
}

// ─── External Systems ──────────────────────────────────────────────────────────
export const externalSystems: ExternalSystem[] = [
  {
    id: 'FlightKeys',
    name: 'FlightKeys (FKYS)',
    type: 'external-api',
    description: '3rd-party flight planning SaaS — OFP, NOTAM, Nav data, signatures, pilot records',
  },
  {
    id: 'OpsHub',
    name: 'OpsHub / Azure Event Hub',
    type: 'messaging',
    description: 'AA internal integration hub — Azure Event Hub (Kafka-compatible). Provides flight events, ACARS downlink, and FTM Uplink service.',
  },
  {
    id: 'IBM_MQ',
    name: 'IBM MQ (FH / SOAR MQ)',
    type: 'ibm-mq',
    description: 'On-premise IBM MQ broker. Used by FOS Update Processor and MQ Sink adapters.',
  },
  {
    id: 'FOS',
    name: 'FOS (Flight Operations System)',
    type: 'app',
    description: 'AA internal Flight Operations System. Receives JPY, JPFF, PR, PRF entries and flight plan updates via OpsHub endpoint.',
  },
  {
    id: 'Fusion',
    name: 'Fusion / TWC',
    type: 'app',
    description: 'TWC Fusion desktop application. Receives ACARS XML messages (FAS) and OOOI flight movement data (FFM).',
  },
  {
    id: 'IBM_ACARS',
    name: 'IBM ACARS / Cyberjet',
    type: 'external-api',
    description: 'Aircraft Communications Addressing and Reporting System. Downlink/uplink messages from aircraft via Cyberjet/OpsHub.',
  },
  {
    id: 'CCI',
    name: 'CCI (Crew Computing Infrastructure)',
    type: 'app',
    description: 'AA Crew computing system. Posts flight plans to PilotDoc Service.',
  },
  {
    id: 'OpsTrak',
    name: 'OpsTrak',
    type: 'app',
    description: 'AA operational tracking system. Retrieves pilot documents from PilotDoc Service.',
  },
  {
    id: 'RabbitMQ',
    name: 'RabbitMQ',
    type: 'messaging',
    description: 'On-prem AMQP message broker. FOS Update Processor reads flight plan info from RabbitMQ queues.',
  },
  {
    id: 'AzureServiceBus',
    name: 'Azure Service Bus',
    type: 'messaging',
    description: 'Azure Service Bus. Payload Data Adapter receives payload data from here.',
  },
  {
    id: 'DocumentDB',
    name: 'AWS DocumentDB (MongoDB)',
    type: 'database',
    description: 'AWS DocumentDB (MongoDB-compatible). Multi-region global cluster (us-east-1 / us-west-2). Stores flight plans, OFP, NOTAM, config.',
  },
  {
    id: 'ConfluentCloud',
    name: 'Confluent Cloud / AWS MSK',
    type: 'messaging',
    description: 'Confluent Cloud (prod: lkc-myzqm2) and AWS MSK for external Kafka clusters.',
  },
];

// ─── Kafka Topics ──────────────────────────────────────────────────────────────
export const kafkaTopics: KafkaTopic[] = [
  // SOAR Flight Plan group (14 topics on Azure EH / Confluent)
  {
    id: 'soar-aa-flightplan-gzip',
    name: 'soar-aa-flightplan-gzip',
    group: 'flightplan',
    partitions: 8,
    retention: '72 hours',
    format: 'gzip XML',
    brokerType: 'Azure Event Hub',
    producers: ['FXD_SOAR_FlightPlan_Processor'],
    consumers: ['FXD_SOAR_Audit_Log_Processor'],
  },
  {
    id: 'soar-aa-flightplan-auditlog-xml',
    name: 'soar-aa-flightplan-auditlog-xml',
    group: 'flightplan',
    partitions: 8,
    retention: '3 days',
    format: 'XML',
    brokerType: 'Azure Event Hub',
    producers: ['FXD_SOAR_FlightPlan_Processor'],
    consumers: ['FXD_SOAR_Audit_Log_Processor'],
  },
  {
    id: 'soar-aa-flightplan-auditevents-xml',
    name: 'soar-aa-flightplan-auditevents-xml',
    group: 'flightplan',
    partitions: 8,
    retention: '72 hours',
    format: 'XML',
    brokerType: 'Azure Event Hub',
    producers: ['FXD_SOAR_FlightPlan_Processor'],
    consumers: ['FXD_SOAR_Audit_Log_Processor'],
  },
  {
    id: 'soar-aa-flightplan-fkofp-gzip',
    name: 'soar-aa-flightplan-fkofp-gzip',
    group: 'flightplan',
    partitions: 8,
    retention: '72 hours',
    format: 'gzip (FlightKeys OFP)',
    brokerType: 'Azure Event Hub',
    producers: ['FXD_SOAR_FlightPlan_Processor'],
    consumers: ['FXD_SOAR_Audit_Log_Processor'],
  },
  {
    id: 'soar-aa-fltplan-weather-xml',
    name: 'soar-aa-fltplan-weather-xml',
    group: 'flightplan',
    partitions: 8,
    retention: '3 days',
    format: 'XML',
    brokerType: 'Azure Event Hub',
    producers: ['FXD_SOAR_FlightPlan_Processor'],
    consumers: ['FXD_SOAR_Audit_Log_Processor'],
  },
  {
    id: 'soar-aa-flighthistory',
    name: 'soar-aa-flighthistory',
    group: 'flightplan',
    partitions: 8,
    retention: '3 days',
    format: 'XML',
    brokerType: 'Azure Event Hub',
    producers: ['FXD_SOAR_FlightPlan_Processor'],
    consumers: [],
  },
  // soar-mq variants (Envoy / on-prem MQ path)
  {
    id: 'soar-mq-flightplan-gzip',
    name: 'soar-mq-flightplan-gzip',
    group: 'flightplan-mq',
    partitions: 8,
    retention: '72 hours',
    format: 'gzip XML',
    brokerType: 'Azure Event Hub',
    producers: ['FXD_SOAR_FlightPlan_Processor'],
    consumers: ['FXD_SOAR_Audit_Log_Processor'],
    notes: 'MQ-sourced flight plan path',
  },
  {
    id: 'soar-mq-flightplan-auditevents-xml',
    name: 'soar-mq-flightplan-auditevents-xml',
    group: 'flightplan-mq',
    partitions: 8,
    retention: '72 hours',
    format: 'XML',
    brokerType: 'Azure Event Hub',
    producers: ['FXD_SOAR_FlightPlan_Processor'],
    consumers: ['FXD_SOAR_Audit_Log_Processor'],
  },
  {
    id: 'soar-mq-flightplan-auditlog-xml',
    name: 'soar-mq-flightplan-auditlog-xml',
    group: 'flightplan-mq',
    partitions: 8,
    retention: '72 hours',
    format: 'XML',
    brokerType: 'Azure Event Hub',
    producers: ['FXD_SOAR_FlightPlan_Processor'],
    consumers: [],
  },
  {
    id: 'soar-mq-flightplan-fkofp-gzip',
    name: 'soar-mq-flightplan-fkofp-gzip',
    group: 'flightplan-mq',
    partitions: 8,
    retention: '72 hours',
    format: 'gzip',
    brokerType: 'Azure Event Hub',
    producers: ['FXD_SOAR_FlightPlan_Processor'],
    consumers: ['FXD_SOAR_Audit_Log_Processor'],
  },
  {
    id: 'soar-mq-fltplan-weather-xml',
    name: 'soar-mq-fltplan-weather-xml',
    group: 'flightplan-mq',
    partitions: 8,
    retention: '3 days',
    format: 'XML',
    brokerType: 'Azure Event Hub',
    producers: ['FXD_SOAR_FlightPlan_Processor'],
    consumers: ['FXD_SOAR_Audit_Log_Processor'],
  },
  // ext-sec (external secured — AWS / Confluent Cloud path)
  {
    id: 'ext-sec-soar-aa-flightplan-gzip',
    name: 'ext-sec-soar-aa-flightplan-gzip',
    group: 'flightplan-ext',
    partitions: 8,
    retention: '72 hours',
    format: 'gzip XML',
    brokerType: 'Confluent Cloud / AWS MSK',
    producers: [],
    consumers: ['FXD_SOAR_FlightPlan_Processor'],
    notes: 'Consumed by FPP from Confluent Cloud prod (lkc-myzqm2)',
  },
  {
    id: 'ext-sec-soar-aa-flightplan-auditevents-xml',
    name: 'ext-sec-soar-aa-flightplan-auditevents-xml',
    group: 'flightplan-ext',
    partitions: 8,
    retention: '72 hours',
    format: 'XML',
    brokerType: 'Confluent Cloud / AWS MSK',
    producers: [],
    consumers: ['FXD_SOAR_FlightPlan_Processor'],
  },
  {
    id: 'ext-sec-soar-mq-flightplan-gzip',
    name: 'ext-sec-soar-mq-flightplan-gzip',
    group: 'flightplan-ext',
    partitions: 8,
    retention: '72 hours',
    format: 'gzip XML',
    brokerType: 'Confluent Cloud',
    producers: [],
    consumers: ['FXIP_FlightPlanServiceMGW_AWS'],
  },
  {
    id: 'ext-sec-soar-mq-flightplan-auditevents-xml',
    name: 'ext-sec-soar-mq-flightplan-auditevents-xml',
    group: 'flightplan-ext',
    partitions: 8,
    retention: '72 hours',
    format: 'XML',
    brokerType: 'Confluent Cloud',
    producers: [],
    consumers: ['FXIP_FlightPlanServiceMGW_AWS'],
  },
  // ACARS topics
  {
    id: 'acars-event-mq-silentpush-xml',
    name: 'acars-event-mq-silentpush-xml',
    group: 'acars',
    partitions: 4,
    retention: '1 day',
    format: 'XML byte[]',
    brokerType: 'Azure Event Hub',
    producers: ['FXD_SOAR_ACARS_Cyberjet'],
    consumers: ['FXD_SOAR_ACARS_Cyberjet'],
    notes: 'Silent push ACARS path through OpsHub MessageNode',
  },
  {
    id: 'acars-event-mq-soar-xml',
    name: 'acars-event-mq-soar-xml',
    group: 'acars',
    partitions: 4,
    retention: '1 day',
    format: 'XML byte[]',
    brokerType: 'Azure Event Hub',
    producers: ['FXD_SOAR_ACARS_Cyberjet'],
    consumers: ['FXD_SOAR_Fusion_ACARS_Service'],
    notes: 'ACARS downlink XML for SOAR processing',
  },
  // Flight event topics (from OpsHub → FlightData Adapter)
  {
    id: 'flight-event-aa-schedule-avro',
    name: 'flight-event-aa-schedule-avro',
    group: 'flight-event',
    partitions: 16,
    retention: '3 days',
    format: 'Avro',
    brokerType: 'Azure Event Hub',
    producers: ['OpsHub'],
    consumers: ['FXD_SOAR_FlightData_Adapter'],
  },
  {
    id: 'flight-event-aa-time-avro',
    name: 'flight-event-aa-time-avro',
    group: 'flight-event',
    partitions: 16,
    retention: '3 days',
    format: 'Avro',
    brokerType: 'Azure Event Hub',
    producers: ['OpsHub'],
    consumers: ['FXD_SOAR_FlightData_Adapter'],
  },
  {
    id: 'flight-event-aa-departure-arrival-avro',
    name: 'flight-event-aa-departure-arrival-avro',
    group: 'flight-event',
    partitions: 16,
    retention: '3 days',
    format: 'Avro',
    brokerType: 'Azure Event Hub',
    producers: ['OpsHub'],
    consumers: ['FXD_SOAR_FlightData_Adapter'],
  },
  {
    id: 'flight-event-aa-cycle-avro',
    name: 'flight-event-aa-cycle-avro',
    group: 'flight-event',
    partitions: 16,
    retention: '3 days',
    format: 'Avro',
    brokerType: 'Azure Event Hub',
    producers: ['OpsHub'],
    consumers: ['FXD_SOAR_FlightData_Adapter'],
  },
  {
    id: 'flight-event-aa-aircraft-avro',
    name: 'flight-event-aa-aircraft-avro',
    group: 'flight-event',
    partitions: 16,
    retention: '3 days',
    format: 'Avro',
    brokerType: 'Azure Event Hub',
    producers: ['OpsHub'],
    consumers: ['FXD_SOAR_FlightData_Adapter', 'FXD_SOAR_Fusion_Flight_Movement'],
  },
  {
    id: 'flight-event-mq-load-avro',
    name: 'flight-event-mq-load-avro',
    group: 'flight-event-mq',
    partitions: 8,
    retention: '3 days',
    format: 'Avro',
    brokerType: 'Azure Event Hub',
    producers: ['OpsHub'],
    consumers: ['FXD_SOAR_FlightData_Adapter'],
  },
  // Maintenance event topics (AircraftData Adapter)
  {
    id: 'maint-event-aa-dmi-avro',
    name: 'maint-event-aa-dmi-avro',
    group: 'maint-event',
    partitions: 4,
    retention: '3 days',
    format: 'Avro',
    brokerType: 'Azure Event Hub',
    producers: ['OpsHub'],
    consumers: ['FXD_SOAR_AircraftData_Adapter'],
  },
  {
    id: 'maint-event-mq-ots-avro',
    name: 'maint-event-mq-ots-avro',
    group: 'maint-event',
    partitions: 4,
    retention: '3 days',
    format: 'Avro',
    brokerType: 'Azure Event Hub',
    producers: ['OpsHub'],
    consumers: ['FXD_SOAR_AircraftData_Adapter'],
  },
  {
    id: 'maint-event-mq-dmi-avro',
    name: 'maint-event-mq-dmi-avro',
    group: 'maint-event',
    partitions: 4,
    retention: '3 days',
    format: 'Avro',
    brokerType: 'Azure Event Hub',
    producers: ['OpsHub'],
    consumers: ['FXD_SOAR_AircraftData_Adapter'],
  },
  // Flightkeys event topics
  {
    id: 'flight-event-fkys-avro',
    name: 'flight-event-fkys-avro',
    group: 'flightkeys-event',
    partitions: 8,
    retention: '3 days',
    format: 'Avro',
    brokerType: 'Azure Event Hub',
    producers: ['OpsHub'],
    consumers: ['FXD_SOAR_Flightkeys_Event_Processor'],
  },
];

// ─── Services ─────────────────────────────────────────────────────────────────
export const services: Service[] = [
  // ── APIs / Services ──────────────────────────────────────────────────────────
  {
    id: 'FXD_SOAR_FlightPlan_Service',
    name: 'Flight Plan Service',
    acronym: 'FPS',
    appName: 'fxip-fps',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXD_SOAR_FlightPlan_Service',
    description: 'Pulls OFP, flight plan briefings, weather, and NOTAM info from FlightKeys. Exposes REST APIs consumed by EFB/crew apps.',
    type: 'api',
    dockerImage: 'docker.aa.com/prod/fxip/fxd-soar-flightplan-service',
    restEndpoints: [
      { method: 'GET/POST', path: '/flightplandata', description: 'Flight plan data retrieval' },
      { method: 'GET/POST', path: '/flightplandataaws', description: 'Flight plan data (AWS path)' },
    ],
    kafkaConsumes: [],
    kafkaProduces: [],
    rabbitMQQueues: [],
    externalSystems: ['FlightKeys'],
    databases: ['DocumentDB'],
    calledBy: ['CCI', 'OpsTrak'],
    calls: ['FlightKeys'],
  },
  {
    id: 'FXD_SOAR_Nav_Data_Service',
    name: 'Nav Data Service',
    acronym: 'NDS',
    appName: 'fxip-nds',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXD_SOAR_Nav_Data_Service',
    description: 'Proxy to FlightKeys APIs for managing navigation records and statistical fuel data.',
    type: 'api',
    dockerImage: 'docker.aa.com/prod/fxip/fxd-soar-nav-data-service',
    restEndpoints: [
      { method: 'GET/POST/PUT/DELETE', path: '/navdata', description: 'Navigation data CRUD' },
    ],
    kafkaConsumes: [],
    kafkaProduces: [],
    rabbitMQQueues: [],
    externalSystems: ['FlightKeys'],
    databases: [],
    calledBy: [],
    calls: ['FlightKeys'],
  },
  {
    id: 'FXD_SOAR_Data_Maintenance_Service',
    name: 'Data Maintenance Service',
    acronym: 'DMS',
    appName: 'fxip-dms',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXD_SOAR_Data_Maintenance_Service',
    description: 'Proxy to FlightKeys NOTAMS API for managing company messages.',
    type: 'api',
    dockerImage: 'docker.aa.com/prod/fxip/fxd-soar-data-maintenance-service',
    restEndpoints: [
      { method: 'GET/POST/PUT/DELETE', path: '/maintenance', description: 'NOTAM/company message management' },
    ],
    kafkaConsumes: [],
    kafkaProduces: [],
    rabbitMQQueues: [],
    externalSystems: ['FlightKeys'],
    databases: [],
    calledBy: [],
    calls: ['FlightKeys'],
  },
  {
    id: 'FXD_SOAR_Aircraft_Data_Service',
    name: 'Aircraft Data Service',
    acronym: 'ADS',
    appName: 'fxip-ads',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXD_SOAR_Aircraft_Data_Service',
    description: 'Proxy to FlightKeys APIs for managing aircraft records used in flight planning.',
    type: 'api',
    dockerImage: 'docker.aa.com/prod/fxip/fxd-soar-aircraft-data-service',
    restEndpoints: [
      { method: 'GET/POST/PUT/DELETE', path: '/aircraftdata', description: 'Aircraft record management' },
    ],
    kafkaConsumes: [],
    kafkaProduces: [],
    rabbitMQQueues: [],
    externalSystems: ['FlightKeys'],
    databases: [],
    calledBy: [],
    calls: ['FlightKeys'],
  },
  {
    id: 'FXD_SOAR_PilotDoc_Service',
    name: 'Pilot Doc Service',
    acronym: 'PDS',
    appName: 'fxip-pds',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXD_SOAR_PilotDoc_Service',
    description: 'Handles flight plan posting from CCI and retrieval by OpsTrak.',
    type: 'api',
    dockerImage: 'docker.aa.com/prod/fxip/fxd-soar-pilotdoc-service',
    restEndpoints: [
      { method: 'POST', path: '/pilotdoc', description: 'Post flight plan from CCI' },
      { method: 'GET', path: '/pilotdoc', description: 'Retrieve pilot documents for OpsTrak' },
    ],
    kafkaConsumes: [],
    kafkaProduces: [],
    rabbitMQQueues: [],
    externalSystems: ['CCI', 'OpsTrak'],
    databases: ['DocumentDB'],
    calledBy: ['CCI'],
    calls: ['OpsTrak'],
  },
  {
    id: 'FXD_SOAR_Flightkeys_Integration_Service',
    name: 'Flightkeys Integration Service',
    acronym: 'FIS',
    appName: 'fxip-fis',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXD_SOAR_Flightkeys_Integration_Service',
    description: 'Posts pilot signatures, pulls OFP and flight plan briefings from FlightKeys.',
    type: 'api',
    dockerImage: 'docker.aa.com/prod/fxip/fxd-soar-flightkeys-integration-service',
    restEndpoints: [
      { method: 'POST', path: '/signature', description: 'Post pilot signature to FlightKeys' },
      { method: 'GET', path: '/ofp', description: 'Pull OFP from FlightKeys' },
    ],
    kafkaConsumes: [],
    kafkaProduces: [],
    rabbitMQQueues: [],
    externalSystems: ['FlightKeys'],
    databases: [],
    calledBy: [],
    calls: ['FlightKeys'],
  },
  {
    id: 'FXD_SOAR_Fusion_ACARS_Service',
    name: 'Fusion ACARS Service',
    acronym: 'FAS',
    appName: 'fxip-fas',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXD_SOAR_Fusion_ACARS_Service',
    description: 'Sends ACARS XML messages to OpsHub FTM Uplink Service and returns responses to Fusion. Bridges Fusion desktop with OpsHub ACARS.',
    type: 'api',
    dockerImage: 'docker.aa.com/prod/fxip/fxd-soar-fusion-acars-service',
    restEndpoints: [
      { method: 'POST', path: '/acars/uplink', description: 'Send ACARS XML to OpsHub FTM Uplink' },
    ],
    kafkaConsumes: ['acars-event-mq-soar-xml'],
    kafkaProduces: [],
    rabbitMQQueues: [],
    externalSystems: ['OpsHub', 'Fusion', 'IBM_ACARS'],
    databases: [],
    calledBy: ['Fusion'],
    calls: ['OpsHub'],
  },
  {
    id: 'FXD_SOAR_Notification_Service',
    name: 'Notification Service',
    acronym: 'NS',
    appName: 'fxip-ns',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXD_SOAR_Notification_Service',
    description: 'Provides push notification capabilities to crew/operations apps.',
    type: 'api',
    dockerImage: 'docker.aa.com/prod/fxip/fxd-soar-notification-service',
    restEndpoints: [
      { method: 'POST', path: '/notify', description: 'Send notification' },
    ],
    kafkaConsumes: [],
    kafkaProduces: [],
    rabbitMQQueues: [],
    externalSystems: [],
    databases: ['DocumentDB'],
    calledBy: [],
    calls: [],
  },
  {
    id: 'FXD_SOAR_DelayCost_Service',
    name: 'Delay Cost Service',
    acronym: 'DCS',
    appName: 'fxip-dcs',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXD_SOAR_DelayCost_Service',
    description: 'Calculates and exposes flight delay cost data.',
    type: 'api',
    dockerImage: 'docker.aa.com/prod/fxip/fxd-soar-delaycost-service',
    restEndpoints: [
      { method: 'GET', path: '/delaycost', description: 'Retrieve delay cost for flight' },
    ],
    kafkaConsumes: [],
    kafkaProduces: [],
    rabbitMQQueues: [],
    externalSystems: [],
    databases: ['DocumentDB'],
    calledBy: [],
    calls: [],
  },

  // ── Processors ───────────────────────────────────────────────────────────────
  {
    id: 'FXD_SOAR_FlightPlan_Processor',
    name: 'Flight Plan Processor',
    acronym: 'FPP',
    appName: 'fxip-fpp',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXD_SOAR_FlightPlan_Processor',
    description: 'Processes ARINC 633 flight plans and publishes events to OpsHub EventHub. Reads from Confluent Cloud (prod) and dual-region Azure EH.',
    type: 'processor',
    dockerImage: 'docker.aa.com/prod/fxip/fxd-soar-flightplan-processor',
    restEndpoints: [],
    kafkaConsumes: [
      'ext-sec-soar-aa-flightplan-gzip',
      'ext-sec-soar-aa-flightplan-auditevents-xml',
    ],
    kafkaProduces: [
      'soar-aa-flightplan-gzip',
      'soar-aa-flightplan-auditlog-xml',
      'soar-aa-flightplan-auditevents-xml',
      'soar-aa-flightplan-fkofp-gzip',
      'soar-aa-fltplan-weather-xml',
      'soar-aa-flighthistory',
      'soar-mq-flightplan-gzip',
      'soar-mq-flightplan-auditevents-xml',
      'soar-mq-flightplan-auditlog-xml',
      'soar-mq-flightplan-fkofp-gzip',
      'soar-mq-fltplan-weather-xml',
    ],
    rabbitMQQueues: [],
    externalSystems: ['ConfluentCloud', 'OpsHub'],
    databases: [],
    calledBy: [],
    calls: [],
  },
  {
    id: 'FXD_SOAR_Audit_Log_Processor',
    name: 'Audit Log Processor',
    acronym: 'ALP',
    appName: 'fxip-alp',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXD_SOAR_Audit_Log_Processor',
    description: 'Compresses Flight Plan, Weather, and OFP XML messages and sends to OpsHub Kafka topic for archival.',
    type: 'processor',
    dockerImage: 'docker.aa.com/prod/fxip/fxd-soar-audit-log-processor',
    restEndpoints: [],
    kafkaConsumes: [
      'soar-aa-flightplan-gzip',
      'soar-aa-flightplan-auditlog-xml',
      'soar-aa-flightplan-auditevents-xml',
      'soar-aa-flightplan-fkofp-gzip',
      'soar-aa-fltplan-weather-xml',
      'soar-mq-flightplan-gzip',
      'soar-mq-flightplan-auditevents-xml',
      'soar-mq-flightplan-fkofp-gzip',
      'soar-mq-fltplan-weather-xml',
    ],
    kafkaProduces: [],
    rabbitMQQueues: [],
    externalSystems: ['OpsHub'],
    databases: [],
    calledBy: [],
    calls: ['OpsHub'],
  },
  {
    id: 'FXD_SOAR_Flightkeys_Event_Processor',
    name: 'Flightkeys Event Processor',
    acronym: 'FEP',
    appName: 'fxip-fep',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXD_SOAR_Flightkeys_Event_Processor',
    description: 'Reads FlightKeys events from Kafka and updates FOS with JPY, JPFF, PR, and PRF entries.',
    type: 'processor',
    dockerImage: 'docker.aa.com/prod/fxip/fxd-soar-flightkeys-event-processor',
    restEndpoints: [],
    kafkaConsumes: ['flight-event-fkys-avro'],
    kafkaProduces: [],
    rabbitMQQueues: [],
    externalSystems: ['OpsHub', 'FOS'],
    databases: [],
    calledBy: [],
    calls: ['FOS'],
  },
  {
    id: 'FXD_SOAR_FOS_Update_Processor',
    name: 'FOS Update Processor',
    acronym: 'FUP',
    appName: 'fxip-fup',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXD_SOAR_FOS_Update_Processor',
    description: 'Reads Flight Plan info from RabbitMQ and updates FOS via OpsHub endpoint.',
    type: 'processor',
    dockerImage: 'docker.aa.com/prod/fxip/fxd-soar-fos-update-processor',
    restEndpoints: [],
    kafkaConsumes: [],
    kafkaProduces: [],
    rabbitMQQueues: ['soar-fos-update-queue'],
    externalSystems: ['RabbitMQ', 'OpsHub', 'FOS'],
    databases: [],
    calledBy: [],
    calls: ['FOS', 'OpsHub'],
  },
  {
    id: 'FXD_SOAR_Text_Message_Processor',
    name: 'Text Message Processor',
    acronym: 'TMP',
    appName: 'fxip-tmp',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXD_SOAR_Text_Message_Processor',
    description: 'Processes ACARS and operational text messages between OpsHub and crew/dispatch systems.',
    type: 'processor',
    dockerImage: 'docker.aa.com/prod/fxip/fxd-soar-text-message-processor',
    restEndpoints: [],
    kafkaConsumes: ['acars-event-mq-soar-xml'],
    kafkaProduces: [],
    rabbitMQQueues: [],
    externalSystems: ['OpsHub', 'IBM_MQ'],
    databases: [],
    calledBy: [],
    calls: ['IBM_MQ'],
  },

  // ── Adapters ─────────────────────────────────────────────────────────────────
  {
    id: 'FXD_SOAR_FlightData_Adapter',
    name: 'Flight Data Adapter',
    acronym: 'FDA',
    appName: 'fxip-fda',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXD_SOAR_FlightData_Adapter',
    description: 'Consumes flight event Avro messages from OpsHub EventHub (OUT/OFF/ON/IN, ETD/ETA, schedule, cycle) and posts operational flight data to FlightKeys APIs via secure HTTPS.',
    type: 'adapter',
    dockerImage: 'docker.aa.com/prod/fxip/fxd-soar-flightdata-adapter',
    restEndpoints: [],
    kafkaConsumes: [
      'flight-event-aa-schedule-avro',
      'flight-event-aa-time-avro',
      'flight-event-aa-departure-arrival-avro',
      'flight-event-aa-cycle-avro',
      'flight-event-aa-aircraft-avro',
      'flight-event-mq-load-avro',
    ],
    kafkaProduces: [],
    rabbitMQQueues: [],
    externalSystems: ['OpsHub', 'FlightKeys'],
    databases: [],
    calledBy: [],
    calls: ['FlightKeys'],
  },
  {
    id: 'FXD_SOAR_AircraftData_Adapter',
    name: 'Aircraft Data Adapter',
    acronym: 'ADA',
    appName: 'fxip-ada',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXD_SOAR_AircraftData_Adapter',
    description: 'Posts MEL, Fuel, Crew, and ACARS position reports to FlightKeys APIs. Consumes maintenance events from Azure Event Hub and Azure Event Hub ext (MEL/DMI).',
    type: 'adapter',
    dockerImage: 'docker.aa.com/prod/fxip/fxd-soar-aircraftdata-adapter',
    restEndpoints: [],
    kafkaConsumes: [
      'maint-event-aa-dmi-avro',
      'maint-event-mq-ots-avro',
      'maint-event-mq-dmi-avro',
    ],
    kafkaProduces: [],
    rabbitMQQueues: [],
    externalSystems: ['OpsHub', 'FlightKeys'],
    databases: [],
    calledBy: [],
    calls: ['FlightKeys'],
  },
  {
    id: 'FXD_SOAR_ACARS_Cyberjet',
    name: 'ACARS Cyberjet Adapter',
    acronym: 'ACA',
    appName: 'fxip-aca',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXD_SOAR_ACARS_Cyberjet',
    description: 'Handles ACARS downlink/uplink messages between aircraft and Cyberjet via OpsHub. Reads ACARS downlink from Azure EH and forwards to Cyberjet; routes silent-push via OpsHub.',
    type: 'adapter',
    dockerImage: 'docker.aa.com/prod/fxip/fxd-soar-acars-cyberjet',
    restEndpoints: [],
    kafkaConsumes: ['acars-event-mq-silentpush-xml'],
    kafkaProduces: ['acars-event-mq-silentpush-xml', 'acars-event-mq-soar-xml'],
    rabbitMQQueues: [],
    externalSystems: ['OpsHub', 'IBM_ACARS'],
    databases: [],
    calledBy: [],
    calls: ['IBM_ACARS', 'OpsHub'],
  },
  {
    id: 'FXD_SOAR_Fusion_Flight_Movement',
    name: 'Fusion Flight Movement Adapter',
    acronym: 'FFM',
    appName: 'fxip-ffm',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXD_SOAR_Fusion_Flight_Movement',
    description: 'Sends OOOI (Out, Off, On, In) and related flight movement data to Fusion desktop app. Converts FlightKeys flight plan messages to TWC Fusion format and sends via web service.',
    type: 'adapter',
    dockerImage: 'docker.aa.com/prod/fxip/fxd-soar-fusion-flight-movement',
    restEndpoints: [],
    kafkaConsumes: ['flight-event-aa-aircraft-avro'],
    kafkaProduces: [],
    rabbitMQQueues: [],
    externalSystems: ['OpsHub', 'Fusion'],
    databases: [],
    calledBy: [],
    calls: ['Fusion'],
  },

  // ── MGW / BCP (Multi-Cloud Gateway / Business Continuity) ─────────────────
  {
    id: 'FXIP_FlightPlanServiceMGW_AWS',
    name: 'Flight Plan Service MGW (AWS)',
    acronym: 'FPS-MGW',
    appName: 'fxip-fps-mgw',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXIP_FlightPlanServiceMGW_AWS',
    description: 'Multi-cloud gateway for Flight Plan Service on AWS path. Consumes ext-sec Confluent Cloud topics and routes to AWS-based FPS.',
    type: 'mgw',
    dockerImage: 'docker.aa.com/prod/fxip/fxip-flightplanservice-mgw-aws',
    restEndpoints: [],
    kafkaConsumes: ['ext-sec-soar-mq-flightplan-gzip', 'ext-sec-soar-mq-flightplan-auditevents-xml'],
    kafkaProduces: [],
    rabbitMQQueues: [],
    externalSystems: ['ConfluentCloud'],
    databases: [],
    calledBy: [],
    calls: ['FXD_SOAR_FlightPlan_Service'],
  },
  {
    id: 'FXIP_AircraftDataServiceMGW_BCP',
    name: 'Aircraft Data Service MGW (BCP)',
    acronym: 'ADS-MGW',
    appName: 'fxip-ads-mgw',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXIP_AircraftDataServiceMGW_BCP',
    description: 'Business Continuity Plan gateway for Aircraft Data Service.',
    type: 'mgw',
    dockerImage: 'docker.aa.com/prod/fxip/fxip-aircraftdataservice-mgw-bcp',
    restEndpoints: [],
    kafkaConsumes: [],
    kafkaProduces: [],
    rabbitMQQueues: [],
    externalSystems: [],
    databases: [],
    calledBy: [],
    calls: ['FXD_SOAR_Aircraft_Data_Service'],
  },
  {
    id: 'FXIP_NavDataServiceMGW_BCP',
    name: 'Nav Data Service MGW (BCP)',
    acronym: 'NDS-MGW',
    appName: 'fxip-nds-mgw',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXIP_NavDataServiceMGW_BCP',
    description: 'Business Continuity Plan gateway for Nav Data Service.',
    type: 'mgw',
    dockerImage: 'docker.aa.com/prod/fxip/fxip-navdataservice-mgw-bcp',
    restEndpoints: [],
    kafkaConsumes: [],
    kafkaProduces: [],
    rabbitMQQueues: [],
    externalSystems: [],
    databases: [],
    calledBy: [],
    calls: ['FXD_SOAR_Nav_Data_Service'],
  },
  {
    id: 'FXIP_DataMaintServiceMGW_BCP',
    name: 'Data Maintenance Service MGW (BCP)',
    acronym: 'DMS-MGW',
    appName: 'fxip-dms-mgw',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXIP_DataMaintServiceMGW_BCP',
    description: 'Business Continuity Plan gateway for Data Maintenance Service.',
    type: 'mgw',
    dockerImage: 'docker.aa.com/prod/fxip/fxip-datamaintservice-mgw-bcp',
    restEndpoints: [],
    kafkaConsumes: [],
    kafkaProduces: [],
    rabbitMQQueues: [],
    externalSystems: [],
    databases: [],
    calledBy: [],
    calls: ['FXD_SOAR_Data_Maintenance_Service'],
  },
  {
    id: 'FXIP_FltKeysIntegServiceMGW_AWS',
    name: 'FlightKeys Integration Service MGW (AWS)',
    acronym: 'FIS-MGW',
    appName: 'fxip-fis-mgw',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXIP_FltKeysIntegServiceMGW_AWS',
    description: 'Multi-cloud gateway for FlightKeys Integration Service on AWS path.',
    type: 'mgw',
    dockerImage: 'docker.aa.com/prod/fxip/fxip-fltkeysintegservice-mgw-aws',
    restEndpoints: [],
    kafkaConsumes: [],
    kafkaProduces: [],
    rabbitMQQueues: [],
    externalSystems: [],
    databases: [],
    calledBy: [],
    calls: ['FXD_SOAR_Flightkeys_Integration_Service'],
  },
  {
    id: 'FXIP_Flight_Info_Service_Client',
    name: 'Flight Info Service Client',
    acronym: 'FIDC',
    appName: 'fxip-fidc',
    namespace: 'fxip-prod',
    repo: 'AAInternal/FXIP_Flight_Info_Service_Client',
    description: 'Client library / sidecar that provides flight info context to other FXIP services.',
    type: 'tool',
    dockerImage: 'docker.aa.com/prod/fxip/fxip-flight-info-service-client',
    restEndpoints: [],
    kafkaConsumes: [],
    kafkaProduces: [],
    rabbitMQQueues: [],
    externalSystems: [],
    databases: [],
    calledBy: [],
    calls: [],
  },
];

// ── Node colors — aligned with AA brand palette ───────────────────────────────
// AA Navy: #0C2340  AA Red: #ED1C2E  AA Sky: #009FDA
export const NODE_COLORS: Record<NodeType | 'kafka' | 'external' | 'database', string> = {
  api:       '#0078D2', // AA medium blue  — Services / APIs
  processor: '#7C3AED', // violet          — Processors (distinct)
  adapter:   '#0EA5E9', // AA sky blue     — Adapters
  mgw:       '#F59E0B', // amber           — MGW / BCP gateways
  tool:      '#6B7280', // gray            — Tools / clients
  kafka:     '#ED1C2E', // AA red          — Kafka topics (prominent)
  external:  '#10B981', // emerald         — External systems
  database:  '#14B8A6', // teal            — Databases
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA OBJECTS — derived from XSD schemas, Avro specs, and Swagger contracts
// Sources: ACARS_Interface.xsd, OpsHub_FTM_Uplink_Swagger.yaml, Avro flight.avsc
// ─────────────────────────────────────────────────────────────────────────────

export type DataDomain = 'flight' | 'flightplan' | 'aircraft' | 'acars' | 'fuel' | 'crew' | 'nav' | 'maintenance';

export interface DataField {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
  enum?: string[];
}

export interface DataObject {
  id: string;
  name: string;
  domain: DataDomain;
  description: string;
  source: string;          // schema source file
  format: string;          // Avro | XML/XSD | JSON/Swagger
  usedBy: string[];        // service IDs
  fields: DataField[];
}

export const dataObjects: DataObject[] = [
  // ── ACARS / IBM XSD objects ──────────────────────────────────────────────
  {
    id: 'FlightKey',
    name: 'FlightKey',
    domain: 'flight',
    description: 'Uniquely identifies a flight leg. Combines airline code, scheduled departure date/time, departure ICAO, flight number and leg instance.',
    source: 'ACARS_Interface.xsd',
    format: 'XML/XSD',
    usedBy: ['FXD_SOAR_Fusion_ACARS_Service', 'FXD_SOAR_ACARS_Cyberjet'],
    fields: [
      { name: 'AirlineCode',            type: 'AirlineCode',    required: true,  description: 'Nested airline identifiers (CID, IATA, ICAO)' },
      { name: 'SchedDepDateTime',       type: 'string',         required: true,  description: 'Scheduled departure (GMT yyyy-mm-ddThh:mm:ssZ)', example: '2026-05-14T14:30:00Z' },
      { name: 'SchedDepICAO',           type: 'string (ICAO4)', required: true,  description: 'Departure airport ICAO code', example: 'KDFW' },
      { name: 'FlightNumber',           type: 'string',         required: true,  description: 'Numeric part of flight identifier', example: '5998' },
      { name: 'FlightLegInstanceNumber',type: 'integer',        required: true,  description: 'Distinguishes multiple departures on same day', example: '1' },
    ],
  },
  {
    id: 'AirlineCode',
    name: 'AirlineCode',
    domain: 'flight',
    description: 'Airline identifier object containing WSI customer ID and IATA/ICAO codes.',
    source: 'ACARS_Interface.xsd',
    format: 'XML/XSD',
    usedBy: ['FXD_SOAR_Fusion_ACARS_Service', 'FXD_SOAR_ACARS_Cyberjet'],
    fields: [
      { name: 'CID',  type: 'integer',        required: true, description: 'WSI-assigned customer ID' },
      { name: 'IATA', type: 'string (2 char)',required: true, description: 'Airline IATA code', example: 'AA', enum: ['AA', 'MQ'] },
      { name: 'ICAO', type: 'string (3 char)',required: true, description: 'Airline ICAO code', example: 'AAL', enum: ['AAL', 'ENY'] },
    ],
  },
  {
    id: 'ACARSMessageRequest',
    name: 'ACARSMessageRequest',
    domain: 'acars',
    description: 'Uplink request sent from Fusion/SOAR to IBM ACARS system. Supports FTM (free text), HGZ (howgozit), SBY (standby), VCR (voice contact), DPR (diversion plan) message types.',
    source: 'ACARS_Interface.xsd',
    format: 'XML/XSD',
    usedBy: ['FXD_SOAR_Fusion_ACARS_Service'],
    fields: [
      { name: 'ACARSMessageUniqueID',         type: 'string',   required: true,  description: 'WSI-assigned unique message identifier' },
      { name: 'FlightKey',                    type: 'FlightKey',required: true,  description: 'Flight identification key' },
      { name: 'AircraftRegNum',               type: 'string',   required: true,  description: 'Aircraft tail number', example: 'N305AA' },
      { name: 'OriginalArrivalICAO',          type: 'string',   required: false, description: 'Original arrival airport ICAO', example: 'KSEA' },
      { name: 'DispDesk',                     type: 'string',   required: true,  description: 'Dispatcher desk name/ID' },
      { name: 'DispatcherName',               type: 'string',   required: false, description: 'Name of dispatcher working this flight' },
      { name: 'MessageType',                  type: 'enum',     required: true,  description: 'ACARS message type', enum: ['FTM','HGZ','SBY','VCR','DPR','PFS'] },
      { name: 'PositionFuelScheduleInterval', type: 'string',   required: false, description: 'Interval in seconds (MessageType=PFS only)' },
      { name: 'AckNeeded',                    type: 'boolean',  required: false, description: 'Acknowledgement required from aircraft crew', example: 'true' },
      { name: 'ActivateSELCAL',               type: 'boolean',  required: false, description: 'Activate SELCAL chime in cockpit (FTM only)', example: 'false' },
      { name: 'GroundStation',                type: 'string',   required: false, description: 'Nearest ACARS ground station for transmission' },
      { name: 'SideWrite',                    type: 'boolean',  required: false, description: 'Print landscape on cockpit ACARS printer (FTM only)' },
      { name: 'MessageText',                  type: 'string',   required: false, description: 'Free text content for FTM messages' },
      { name: 'VCR_Params',                   type: 'VCRParams',required: false, description: 'Voice contact parameters (VCR type only)' },
      { name: 'DPR_Params',                   type: 'DPRParams',required: false, description: 'Diversion plan parameters (DPR type only)' },
    ],
  },
  {
    id: 'ACARSMessageResponse',
    name: 'ACARSMessageResponse',
    domain: 'acars',
    description: 'Response from IBM ACARS system after processing an uplink request. Contains delivery status, host return code, and optional acknowledgement message number.',
    source: 'ACARS_Interface.xsd',
    format: 'XML/XSD',
    usedBy: ['FXD_SOAR_Fusion_ACARS_Service'],
    fields: [
      { name: 'ACARSMessageUniqueID', type: 'string',     required: false, description: 'Original request message ID echo-back' },
      { name: 'FlightKey',           type: 'FlightKey',  required: true,  description: 'Flight identification key' },
      { name: 'AircraftRegNum',      type: 'string',     required: true,  description: 'Aircraft registration (e.g., N305AA)' },
      { name: 'MessageStatus',       type: 'enum',       required: true,  description: 'Delivery result', enum: ['SENT', 'ERR'] },
      { name: 'DispDesk',            type: 'string',     required: false, description: 'Dispatcher desk identifier' },
      { name: 'DispatcherName',      type: 'string',     required: false, description: 'Dispatcher name' },
      { name: 'HostReturnCode',      type: 'ReturnCode', required: true,  description: 'IBM ACARS host return code', enum: ['SUCCESS','FAILURE','EXCEPTION','XML_EXCEPTION','INVALID_KEY','KEY_NOT_FOUND','DB_UNAVAILABLE','LOGIN_FAILED'] },
      { name: 'HostResponse',        type: 'string',     required: true,  description: 'Descriptive result from host ACARS system' },
      { name: 'AckMsgNum',           type: 'string',     required: false, description: 'Acknowledgement message number (when ack requested)' },
      { name: 'Sender',              type: 'string',     required: false, description: 'Sender ID (e.g., Fusion)' },
      { name: 'MessageID',           type: 'string',     required: false, description: 'Unique uplink message ID from customer ACARS system' },
      { name: 'MessageType',         type: 'string',     required: false, description: 'Message type from customer ACARS system' },
      { name: 'MessageTypeName',     type: 'string',     required: false, description: 'Display name for message type' },
      { name: 'MessageText',         type: 'string',     required: false, description: 'Formatted message text for Fusion UI display' },
    ],
  },
  {
    id: 'ACARSDownlinkMessage',
    name: 'ACARSDownlinkMessage',
    domain: 'acars',
    description: 'Aircraft-originated ACARS downlink message consumed from Azure Event Hub. Carries in-flight crew messages, position reports, and automated alerts.',
    source: 'ACARS_Interface.xsd',
    format: 'XML byte[] (Kafka)',
    usedBy: ['FXD_SOAR_Fusion_ACARS_Service', 'FXD_SOAR_ACARS_Cyberjet', 'FXD_SOAR_Text_Message_Processor'],
    fields: [
      { name: 'FlightKey',       type: 'FlightKey',required: true,  description: 'Flight identification key' },
      { name: 'AircraftRegNum',  type: 'string',   required: true,  description: 'Aircraft tail number', example: 'N305AA' },
      { name: 'MessageID',       type: 'string',   required: false, description: 'Unique downlink message ID (customer system)' },
      { name: 'MessageType',     type: 'string',   required: false, description: 'Message type code' },
      { name: 'MessageTypeName', type: 'string',   required: false, description: 'Display name for message type' },
      { name: 'MessagePriority', type: 'string',   required: false, description: 'Message priority level' },
      { name: 'MessageSource',   type: 'string',   required: false, description: 'Source (automatic vs crew-initiated)' },
      { name: 'AckMessageNum',   type: 'string',   required: false, description: 'Ack number — set when downlink is an ack to prior uplink' },
    ],
  },
  {
    id: 'DPRParams',
    name: 'DPRParams',
    domain: 'flight',
    description: 'Diversion plan parameters — included in ACARS uplink when MessageType=DPR. Contains alternate station, fuel burn, and dispatcher remarks.',
    source: 'ACARS_Interface.xsd',
    format: 'XML/XSD',
    usedBy: ['FXD_SOAR_Fusion_ACARS_Service'],
    fields: [
      { name: 'DispatcherInitials',type: 'string',       required: false, description: 'Initials of dispatcher working flight' },
      { name: 'DispatcherRemarks', type: 'string',       required: false, description: 'Free text added to uplink message' },
      { name: 'AlternateStation',  type: 'string (ICAO)',required: true,  description: 'Diversion destination airport', example: 'KLAS' },
      { name: 'FAFFuel',           type: 'string',       required: false, description: 'Final approach fix fuel (e.g., 53.3)' },
      { name: 'FAFTime',           type: 'string (hhmm)',required: false, description: 'FAF time GMT' },
      { name: 'OrigArrStation',    type: 'string (ICAO)',required: true,  description: 'Original flight destination', example: 'KSEA' },
      { name: 'FuelBurnToAlt',     type: 'string',       required: false, description: 'Estimated fuel burn to alternate (e.g., 12.3)' },
      { name: 'TimeEntered',       type: 'string (hhmm)',required: true,  description: 'Time diversion plan entered GMT' },
    ],
  },

  // ── OpsHub FTM Uplink Swagger objects ────────────────────────────────────
  {
    id: 'FTMonDemand',
    name: 'FTMonDemand',
    domain: 'acars',
    description: 'OpsHub FTM Uplink request body. Sends ACARS messages to the Uplink ACARS queue. Either aircraft or flight context must be provided.',
    source: 'OpsHub_FTM_Uplink_Swagger.yaml  POST /ftm/sendFTMUplinkACARS',
    format: 'JSON/Swagger → XML',
    usedBy: ['FXD_SOAR_Fusion_ACARS_Service'],
    fields: [
      { name: 'ftmtext',      type: 'string',    required: true,  description: 'CDATA free-text ACARS message content' },
      { name: 'ackNeeded',    type: 'boolean',   required: false, description: 'Whether crew acknowledgement is required' },
      { name: 'aircraft',     type: 'Aircraft',  required: false, description: 'Aircraft context (aircraftID or registrationID)' },
      { name: 'flight',       type: 'Flight',    required: false, description: 'Flight context (flightNumber, depSta, arvSta)' },
      { name: 'sourceSystem', type: 'string',    required: false, description: 'System originating the message (e.g., Fusion)' },
    ],
  },
  {
    id: 'FTMUplinkResponse',
    name: 'FTMUplinkResponse',
    domain: 'acars',
    description: 'OpsHub FTM Uplink service response confirming delivery to uplink queue.',
    source: 'OpsHub_FTM_Uplink_Swagger.yaml',
    format: 'JSON/Swagger',
    usedBy: ['FXD_SOAR_Fusion_ACARS_Service'],
    fields: [
      { name: 'status', type: 'enum',   required: true,  description: 'Delivery outcome', enum: ['SUCCESS', 'FAILURE'] },
      { name: 'reason', type: 'string', required: false, description: 'Human-readable reason (populated on FAILURE)' },
    ],
  },
  {
    id: 'FTMonDemandFOS',
    name: 'FTMonDemandFOS',
    domain: 'flight',
    description: 'OpsHub FTM Uplink request to the FOS queue. Sends carrier-tagged free text messages to the Flight Operations System.',
    source: 'OpsHub_FTM_Uplink_Swagger.yaml  POST /ftm/sendFTMUplinkFOS',
    format: 'JSON/Swagger',
    usedBy: ['FXD_SOAR_FOS_Update_Processor', 'FXD_SOAR_Flightkeys_Event_Processor'],
    fields: [
      { name: 'carrierCode', type: 'enum',   required: true, description: 'Airline code', enum: ['AA', 'MQ'] },
      { name: 'ftmtext',     type: 'string', required: true, description: 'CDATA free-text message content for FOS' },
    ],
  },

  // ── Avro / FlightKeys-derived domain objects ──────────────────────────────
  {
    id: 'FlightEvent',
    name: 'FlightEvent (Avro)',
    domain: 'flight',
    description: 'Core OpsHub flight event Avro record consumed from Azure Event Hub by FlightData Adapter. Carries schedule, OOOI times, and aircraft assignment.',
    source: 'com.aa.opshub.avro.flight.Flight  (flight.avsc)',
    format: 'Avro (binary)',
    usedBy: ['FXD_SOAR_FlightData_Adapter', 'FXD_SOAR_Fusion_Flight_Movement'],
    fields: [
      { name: 'flightNumber',       type: 'string',   required: true,  description: 'AA flight number', example: 'AA5998' },
      { name: 'aircraftId',         type: 'string',   required: true,  description: 'Aircraft tail number', example: 'N305AA' },
      { name: 'departureAirport',   type: 'string',   required: true,  description: 'Departure airport IATA code', example: 'DFW' },
      { name: 'arrivalAirport',     type: 'string',   required: true,  description: 'Arrival airport IATA code', example: 'AUS' },
      { name: 'scheduledDeparture', type: 'long (epoch ms)', required: true,  description: 'Scheduled departure timestamp' },
      { name: 'scheduledArrival',   type: 'long (epoch ms)', required: true,  description: 'Scheduled arrival timestamp' },
      { name: 'actualDeparture',    type: 'long|null (epoch ms)', required: false, description: 'Actual OUT/OFF time (null until event)' },
      { name: 'actualArrival',      type: 'long|null (epoch ms)', required: false, description: 'Actual ON/IN time (null until event)' },
      { name: 'flightStatus',       type: 'string',   required: true,  description: 'Current status', enum: ['SCHEDULED','ACTIVE','DEPARTED','ARRIVED','CANCELLED','DIVERTED'] },
      { name: 'operatingCarrier',   type: 'string',   required: true,  description: 'Operating airline IATA code', example: 'AA' },
      { name: 'marketingCarrier',   type: 'string',   required: true,  description: 'Marketing airline IATA code', example: 'AA' },
      { name: 'equipmentType',      type: 'string',   required: true,  description: 'Aircraft type', example: 'B737' },
      { name: 'crew',               type: 'string[]', required: false, description: 'Crew member employee IDs' },
      { name: 'delays',             type: 'string[]', required: false, description: 'Delay reason codes' },
      { name: 'fuelPlan',           type: 'string',   required: false, description: 'Fuel planning data reference' },
      { name: 'alternateAirports',  type: 'string[]', required: false, description: 'Alternate airport IATA codes' },
    ],
  },
  {
    id: 'MaintenanceEvent',
    name: 'MaintenanceEvent (Avro)',
    domain: 'maintenance',
    description: 'Aircraft maintenance event Avro record from OpsHub. Carries DMI (Deferred Maintenance Item) and OTS (Out of Service) data consumed by AircraftData Adapter.',
    source: 'com.aa.opshub.avro.aircraft.AircraftEvent  (aircraft-event.avsc)',
    format: 'Avro (binary)',
    usedBy: ['FXD_SOAR_AircraftData_Adapter'],
    fields: [
      { name: 'eventId',           type: 'string', required: true,  description: 'Unique maintenance event identifier' },
      { name: 'airframeId',        type: 'string', required: true,  description: 'Aircraft tail number', example: 'N305AA' },
      { name: 'eventType',         type: 'string', required: true,  description: 'Maintenance event type', enum: ['DMI','OTS','MEL','CLEARED'] },
      { name: 'maintenanceStatus', type: 'string', required: true,  description: 'Aircraft maintenance status' },
      { name: 'timestamp',         type: 'long (epoch ms)', required: true,  description: 'Event timestamp' },
      { name: 'airlineCode',       type: 'string', required: true,  description: 'Airline IATA code', example: 'AA' },
    ],
  },
  {
    id: 'FlightPlan',
    name: 'FlightPlan (ARINC 633)',
    domain: 'flightplan',
    description: 'Complete ARINC 633 flight plan XML document processed by FlightPlan Processor. Includes OFP, route, fuel, crew, weather, and FlightKeys OFP attachment.',
    source: 'FlightPlan.xsd / ext-sec-soar-aa-flightplan-gzip',
    format: 'gzip XML (Confluent Cloud → Azure EH)',
    usedBy: ['FXD_SOAR_FlightPlan_Processor', 'FXD_SOAR_FlightPlan_Service', 'FXD_SOAR_Audit_Log_Processor'],
    fields: [
      { name: 'flightPlanId',   type: 'string',   required: true,  description: 'Unique plan identifier', example: 'TADYMX' },
      { name: 'releaseNumber',  type: 'integer',  required: true,  description: 'Version/iteration number', example: '1' },
      { name: 'computedTime',   type: 'dateTime', required: true,  description: 'UTC time plan was computed', example: '2026-05-14T18:49:19Z' },
      { name: 'releaseStatus',  type: 'enum',     required: true,  description: 'Plan lifecycle state', enum: ['RELEASE','DRAFT','SUPERSEDED'] },
      { name: 'category',       type: 'string',   required: true,  description: 'Flight category', enum: ['normal','charter','training'] },
      { name: 'M633Header',     type: 'object',   required: true,  description: 'ARINC 633 header (timestamp, versionNumber)' },
      { name: 'FlightInfo',     type: 'object',   required: true,  description: 'Crew info: captain name, ATC callsign, SELCAL, CrewMembers[]' },
      { name: 'Flight',         type: 'object',   required: true,  description: 'Route: FlightIdentification, DepartureAirport, ArrivalAirport, Alternates[]' },
      { name: 'Aircraft',       type: 'object',   required: true,  description: 'Aircraft registration and model' },
      { name: 'FuelData',       type: 'object',   required: false, description: 'Fuel plan, FuelSlip, reserves, consumption rates' },
      { name: 'WeatherData',    type: 'object',   required: false, description: 'Enroute weather conditions' },
      { name: 'NOTAMs',         type: 'object[]', required: false, description: 'Notices to Airmen affecting the route' },
    ],
  },
  {
    id: 'FuelSlip',
    name: 'FuelSlip',
    domain: 'fuel',
    description: 'Fuel slip data object — documents actual fuel loaded, fuel order, and discrepancies. Generated per flight turn and stored in DocumentDB.',
    source: 'com.aa.opshub.avro.flight.FuelSlip  (flight.avsc)',
    format: 'Avro (binary)',
    usedBy: ['FXD_SOAR_AircraftData_Adapter', 'FXD_SOAR_FlightPlan_Service'],
    fields: [
      { name: 'flightNumber',    type: 'string',  required: true,  description: 'Associated flight number' },
      { name: 'tailNumber',      type: 'string',  required: true,  description: 'Aircraft tail number', example: 'N305AA' },
      { name: 'station',         type: 'string',  required: true,  description: 'Fueling station IATA code', example: 'DFW' },
      { name: 'fuelOrdered',     type: 'decimal', required: true,  description: 'Fuel quantity ordered (lbs)' },
      { name: 'fuelLoaded',      type: 'decimal', required: true,  description: 'Actual fuel loaded (lbs)' },
      { name: 'fuelOnBoard',     type: 'decimal', required: true,  description: 'Total fuel on board after fueling (lbs)' },
      { name: 'slipNumber',      type: 'string',  required: true,  description: 'Fuel slip transaction number' },
      { name: 'fuelType',        type: 'enum',    required: true,  description: 'Fuel grade', enum: ['JET-A','JET-A1','AVGAS'] },
      { name: 'timestamp',       type: 'dateTime',required: true,  description: 'Fueling completion time (UTC)' },
      { name: 'supplier',        type: 'string',  required: false, description: 'Fuel supplier company name' },
    ],
  },
  {
    id: 'FuelPlan',
    name: 'FuelPlan',
    domain: 'fuel',
    description: 'Pre-departure fuel plan computed by FlightKeys. Contains planned fuel, reserve, contingency, and alternate fuel requirements.',
    source: 'FlightPlan.xsd / FlightKeys API',
    format: 'XML / JSON',
    usedBy: ['FXD_SOAR_FlightPlan_Processor', 'FXD_SOAR_AircraftData_Adapter'],
    fields: [
      { name: 'plannedFuel',       type: 'decimal', required: true,  description: 'Total planned fuel load (lbs)' },
      { name: 'tripFuel',          type: 'decimal', required: true,  description: 'Fuel required for the planned route (lbs)' },
      { name: 'contingencyFuel',   type: 'decimal', required: true,  description: 'Contingency reserve (5% of trip fuel)' },
      { name: 'alternateFuel',     type: 'decimal', required: true,  description: 'Fuel to reach alternate airport' },
      { name: 'finalReserveFuel',  type: 'decimal', required: true,  description: 'Final reserve (30 min holding)' },
      { name: 'additionalFuel',    type: 'decimal', required: false, description: 'Captain discretionary additional fuel' },
      { name: 'tankering',         type: 'decimal', required: false, description: 'Cost-benefit fuel tankering quantity' },
      { name: 'fafFuel',           type: 'decimal', required: false, description: 'Final approach fix fuel (for diversion planning)' },
      { name: 'unit',              type: 'enum',    required: true,  description: 'Fuel unit', enum: ['LBS', 'KGS'] },
    ],
  },
  {
    id: 'CrewMember',
    name: 'CrewMember',
    domain: 'crew',
    description: 'Individual crew member assignment on a flight plan. Includes duty code, qualifications, and command/control/rest period tracking.',
    source: 'FlightPlan.xsd  (FlightInfo.CrewMember)',
    format: 'XML/XSD',
    usedBy: ['FXD_SOAR_FlightPlan_Service', 'FXD_SOAR_AircraftData_Adapter'],
    fields: [
      { name: 'dutyCode',         type: 'enum',   required: true,  description: 'Crew role code', enum: ['CaptainInCommand','FirstOfficer','ReliefPilot','FlightEngineer'] },
      { name: 'rank',             type: 'enum',   required: true,  description: 'Crew rank', enum: ['Captain','FirstOfficer','FlightAttendant'] },
      { name: 'name',             type: 'string', required: true,  description: 'Crew member full name' },
      { name: 'employeeId',       type: 'string', required: true,  description: 'AA employee ID' },
      { name: 'cockpitCrew',      type: 'boolean',required: true,  description: 'True if flight deck crew' },
      { name: 'sELCAL',           type: 'string', required: false, description: 'SELCAL code assigned to this crew' },
      { name: 'InCommandPeriods', type: 'Period[]',required: false, description: 'Periods as pilot in command (start/stop dateTime)' },
      { name: 'InControlPeriods', type: 'Period[]',required: false, description: 'Periods as pilot in control' },
      { name: 'RestPeriods',      type: 'Period[]',required: false, description: 'Rest periods during flight' },
    ],
  },
  {
    id: 'FlightKeysEvent',
    name: 'FlightKeysEvent (Avro)',
    domain: 'nav',
    description: 'FlightKeys operational event consumed by Flightkeys Event Processor. Triggers JPY (journey log), JPFF (fuel filed), PR (performance report), and PRF (performance filed) entries in FOS.',
    source: 'com.aa.opshub.avro.flight.FlightEvent  (flight-event-fkys-avro)',
    format: 'Avro (binary)',
    usedBy: ['FXD_SOAR_Flightkeys_Event_Processor'],
    fields: [
      { name: 'eventId',        type: 'string', required: true,  description: 'Unique event identifier' },
      { name: 'flightPlanId',   type: 'string', required: true,  description: 'FlightKeys unique flight identifier (FUFI)' },
      { name: 'flightNumber',   type: 'string', required: true,  description: 'Flight number' },
      { name: 'eventType',      type: 'enum',   required: true,  description: 'FOS entry type to generate', enum: ['JPY','JPFF','PR','PRF','RELEASE','AMENDMENT'] },
      { name: 'timestamp',      type: 'long (epoch ms)', required: true, description: 'Event occurrence time' },
      { name: 'airlineCode',    type: 'string', required: true,  description: 'Airline IATA code', example: 'AA' },
      { name: 'departureICAO',  type: 'string', required: true,  description: 'Departure airport ICAO', example: 'KDFW' },
      { name: 'arrivalICAO',    type: 'string', required: true,  description: 'Arrival airport ICAO', example: 'KAUS' },
      { name: 'fuelData',       type: 'object', required: false, description: 'Fuel actuals (for JPY/JPFF entry types)' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN EVENTS — incoming and outgoing events per service
// ─────────────────────────────────────────────────────────────────────────────

export type EventDirection = 'incoming' | 'outgoing';

export interface DomainEvent {
  id: string;
  name: string;
  direction: EventDirection;
  serviceId: string;
  topic?: string;        // Kafka topic ID
  dataObjectId?: string; // DataObject ID
  format: string;
  trigger: string;       // what triggers or causes this event
  description: string;
  samplePayload?: string;
}

export const domainEvents: DomainEvent[] = [
  // ── FXD_SOAR_Fusion_ACARS_Service ─────────────────────────────────────────
  {
    id: 'fas-in-acars-downlink',
    name: 'ACARS Downlink Received',
    direction: 'incoming',
    serviceId: 'FXD_SOAR_Fusion_ACARS_Service',
    topic: 'acars-event-mq-soar-xml',
    dataObjectId: 'ACARSDownlinkMessage',
    format: 'XML byte[] (Kafka)',
    trigger: 'Aircraft sends downlink via Cyberjet → OpsHub publishes to acars-event-mq-soar-xml',
    description: 'ACARS downlink XML published by ACARS Cyberjet Adapter. FAS consumes it and forwards to Fusion desktop for dispatcher display.',
    samplePayload: `<ACARSDownlinkMessage>
  <FlightKey>
    <AirlineCode><CID>1001</CID><IATA>AA</IATA><ICAO>AAL</ICAO></AirlineCode>
    <SchedDepDateTime>2026-05-14T14:30:00Z</SchedDepDateTime>
    <SchedDepICAO>KDFW</SchedDepICAO>
    <FlightNumber>5998</FlightNumber>
    <FlightLegInstanceNumber>1</FlightLegInstanceNumber>
  </FlightKey>
  <AircraftRegNum>N305AA</AircraftRegNum>
  <MessageType>FTM</MessageType>
  <MessageTypeName>Free Text Message</MessageTypeName>
  <MessagePriority>NORMAL</MessagePriority>
</ACARSDownlinkMessage>`,
  },
  {
    id: 'fas-in-fusion-uplink-rest',
    name: 'ACARS Uplink Request (Fusion → FAS)',
    direction: 'incoming',
    serviceId: 'FXD_SOAR_Fusion_ACARS_Service',
    dataObjectId: 'ACARSMessageRequest',
    format: 'XML (REST POST /acars/uplink)',
    trigger: 'Dispatcher initiates uplink in Fusion TWC desktop → REST POST to FAS',
    description: 'Fusion desktop sends ACARSMessageRequest XML to FAS REST endpoint. FAS validates, transforms to FTMonDemand, and POSTs to OpsHub FTM Uplink Service.',
    samplePayload: `POST /acars/uplink
Content-Type: application/xml

<ACARSMessageRequest>
  <ACARSMessageUniqueID>uuid-abc-123</ACARSMessageUniqueID>
  <FlightKey>...</FlightKey>
  <AircraftRegNum>N305AA</AircraftRegNum>
  <DispDesk>DFW-DISP-01</DispDesk>
  <MessageType>FTM</MessageType>
  <AckNeeded>true</AckNeeded>
  <MessageText>WEATHER ADVISORY: EXPECT TURBULENCE FL350</MessageText>
</ACARSMessageRequest>`,
  },
  {
    id: 'fas-out-ftm-uplink',
    name: 'FTM Uplink to OpsHub',
    direction: 'outgoing',
    serviceId: 'FXD_SOAR_Fusion_ACARS_Service',
    dataObjectId: 'FTMonDemand',
    format: 'XML (REST POST /ftm/sendFTMUplinkACARS)',
    trigger: 'ACARSMessageRequest received from Fusion → FAS transforms to FTMonDemand → POST to OpsHub',
    description: 'FAS transforms Fusion ACARSMessageRequest into OpsHub FTMonDemand and calls the FTM Uplink Service to deliver to aircraft ACARS queue.',
    samplePayload: `POST https://aa-oh-prod-atm-ftmuplink.trafficmanager.net/ftm/sendFTMUplinkACARS
Content-Type: application/xml

<FTMonDemand>
  <ftmtext>WEATHER ADVISORY: EXPECT TURBULENCE FL350</ftmtext>
  <ackNeeded>true</ackNeeded>
  <flight>
    <flightNumber>5998</flightNumber>
    <depSta>DFW</depSta>
    <arvSta>AUS</arvSta>
  </flight>
  <sourceSystem>Fusion</sourceSystem>
</FTMonDemand>`,
  },
  {
    id: 'fas-out-ftm-response',
    name: 'FTM Uplink Response → Fusion',
    direction: 'outgoing',
    serviceId: 'FXD_SOAR_Fusion_ACARS_Service',
    dataObjectId: 'ACARSMessageResponse',
    format: 'XML (REST Response)',
    trigger: 'OpsHub FTM Uplink responds → FAS relays ACARSMessageResponse back to Fusion',
    description: 'After OpsHub delivers the uplink, FAS constructs an ACARSMessageResponse and returns it to the Fusion desktop caller.',
    samplePayload: `HTTP 200 OK
Content-Type: application/xml

<ACARSMessageResponse>
  <AircraftRegNum>N305AA</AircraftRegNum>
  <MessageStatus>SENT</MessageStatus>
  <HostReturnCode>SUCCESS</HostReturnCode>
  <HostResponse>Message delivered to aircraft ACARS queue</HostResponse>
</ACARSMessageResponse>`,
  },

  // ── FXD_SOAR_FlightPlan_Processor ─────────────────────────────────────────
  {
    id: 'fpp-in-flightplan-confluent',
    name: 'Flight Plan XML (Confluent Cloud)',
    direction: 'incoming',
    serviceId: 'FXD_SOAR_FlightPlan_Processor',
    topic: 'ext-sec-soar-aa-flightplan-gzip',
    dataObjectId: 'FlightPlan',
    format: 'gzip XML (Confluent Cloud lkc-myzqm2)',
    trigger: 'FlightKeys generates/releases a new OFP → publishes gzip ARINC 633 XML to Confluent Cloud',
    description: 'FPP consumes ARINC 633 flight plan XML from Confluent Cloud (prod cluster lkc-myzqm2). Dual-region Azure EH path also available via soar-mq-* topics.',
  },
  {
    id: 'fpp-out-flightplan-azureeh',
    name: 'Processed Flight Plan Events (Azure EH)',
    direction: 'outgoing',
    serviceId: 'FXD_SOAR_FlightPlan_Processor',
    topic: 'soar-aa-flightplan-gzip',
    dataObjectId: 'FlightPlan',
    format: 'gzip XML (Azure Event Hub)',
    trigger: 'FPP validates and enriches incoming flight plan → publishes to 6 Azure EH topics (gzip, audit-log, audit-events, fkofp, weather, history)',
    description: 'FPP fans out processed flight plan data to 6 downstream Azure EH topics covering the main AA path. A parallel set of 5 soar-mq-* topics serve the MQ/Envoy path.',
  },

  // ── FXD_SOAR_FlightData_Adapter ───────────────────────────────────────────
  {
    id: 'fda-in-schedule-avro',
    name: 'Flight Schedule Event (OpsHub)',
    direction: 'incoming',
    serviceId: 'FXD_SOAR_FlightData_Adapter',
    topic: 'flight-event-aa-schedule-avro',
    dataObjectId: 'FlightEvent',
    format: 'Avro (Azure Event Hub)',
    trigger: 'Airline schedule system posts new/updated flight schedule to OpsHub',
    description: 'OpsHub publishes flight schedule Avro events when schedules are created or modified. FDA consumes and pushes to FlightKeys 5D.',
  },
  {
    id: 'fda-in-time-avro',
    name: 'Flight Time Event (OOOI)',
    direction: 'incoming',
    serviceId: 'FXD_SOAR_FlightData_Adapter',
    topic: 'flight-event-aa-time-avro',
    dataObjectId: 'FlightEvent',
    format: 'Avro (Azure Event Hub)',
    trigger: 'Aircraft OUT/OFF/ON/IN events from gate/ACARS systems → OpsHub publishes',
    description: 'OOOI (Out/Off/On/In) times published by OpsHub. FDA consumes and updates FlightKeys with actual departure/arrival times for journey log.',
  },
  {
    id: 'fda-in-departure-arrival-avro',
    name: 'Departure/Arrival Event (ETD/ETA)',
    direction: 'incoming',
    serviceId: 'FXD_SOAR_FlightData_Adapter',
    topic: 'flight-event-aa-departure-arrival-avro',
    dataObjectId: 'FlightEvent',
    format: 'Avro (Azure Event Hub)',
    trigger: 'Estimated departure/arrival updates from SOAR or OCC → OpsHub publishes',
    description: 'ETD/ETA updates consumed by FDA and forwarded to FlightKeys to keep estimated times current for dispatcher planning.',
  },
  {
    id: 'fda-out-flightkeys-rest',
    name: 'Flight Data POST → FlightKeys',
    direction: 'outgoing',
    serviceId: 'FXD_SOAR_FlightData_Adapter',
    dataObjectId: 'FlightEvent',
    format: 'REST (HTTPS POST to FlightKeys API)',
    trigger: 'Any consumed flight-event Avro message → FDA transforms and POSTs to FlightKeys',
    description: 'FDA transforms Avro records into FlightKeys API calls. Handles schedule, OOOI, ETD/ETA, aircraft assignment, and load data endpoints.',
  },

  // ── FXD_SOAR_AircraftData_Adapter ─────────────────────────────────────────
  {
    id: 'ada-in-dmi-avro',
    name: 'Aircraft Maintenance Event (DMI)',
    direction: 'incoming',
    serviceId: 'FXD_SOAR_AircraftData_Adapter',
    topic: 'maint-event-aa-dmi-avro',
    dataObjectId: 'MaintenanceEvent',
    format: 'Avro (Azure Event Hub)',
    trigger: 'Maintenance system creates/updates a Deferred Maintenance Item → OpsHub publishes',
    description: 'ADA consumes DMI events and posts MEL (Minimum Equipment List) and maintenance status to FlightKeys aircraft records.',
  },
  {
    id: 'ada-out-flightkeys-mel',
    name: 'MEL/Fuel/Crew POST → FlightKeys',
    direction: 'outgoing',
    serviceId: 'FXD_SOAR_AircraftData_Adapter',
    dataObjectId: 'FuelSlip',
    format: 'REST (HTTPS POST to FlightKeys API)',
    trigger: 'Maintenance or fuel event consumed → ADA calls FlightKeys aircraft API',
    description: 'ADA posts MEL status, fuel actuals (FuelSlip), crew assignments, and ACARS position reports to FlightKeys aircraft records.',
  },

  // ── FXD_SOAR_ACARS_Cyberjet ───────────────────────────────────────────────
  {
    id: 'aca-in-downlink',
    name: 'ACARS Downlink from OpsHub',
    direction: 'incoming',
    serviceId: 'FXD_SOAR_ACARS_Cyberjet',
    topic: 'acars-event-mq-silentpush-xml',
    dataObjectId: 'ACARSDownlinkMessage',
    format: 'XML byte[] (Azure Event Hub)',
    trigger: 'Aircraft sends ACARS downlink → IBM ACARS gateway → OpsHub → Azure EH topic',
    description: 'ACARS Cyberjet Adapter consumes downlink XML from Azure EH. Silent-push path routes via OpsHub MessageNode directly back to the topic.',
  },
  {
    id: 'aca-out-soar-topic',
    name: 'ACARS Downlink → SOAR Topic',
    direction: 'outgoing',
    serviceId: 'FXD_SOAR_ACARS_Cyberjet',
    topic: 'acars-event-mq-soar-xml',
    dataObjectId: 'ACARSDownlinkMessage',
    format: 'XML byte[] (Azure Event Hub)',
    trigger: 'Downlink consumed from silentpush topic → ACA republishes to soar topic',
    description: 'ACA republishes downlink XML to acars-event-mq-soar-xml for consumption by FAS (Fusion ACARS Service) and TMP (Text Message Processor).',
  },

  // ── FXD_SOAR_Flightkeys_Event_Processor ──────────────────────────────────
  {
    id: 'fep-in-fkys-event',
    name: 'FlightKeys Event (Avro)',
    direction: 'incoming',
    serviceId: 'FXD_SOAR_Flightkeys_Event_Processor',
    topic: 'flight-event-fkys-avro',
    dataObjectId: 'FlightKeysEvent',
    format: 'Avro (Azure Event Hub)',
    trigger: 'FlightKeys system generates JPY/JPFF/PR/PRF event → OpsHub publishes to Kafka',
    description: 'FEP consumes FlightKeys events and writes corresponding entries (Journey log, Fuel filed, Performance report) into FOS via OpsHub endpoint.',
  },
  {
    id: 'fep-out-fos-jpy',
    name: 'JPY/JPFF/PR/PRF → FOS',
    direction: 'outgoing',
    serviceId: 'FXD_SOAR_Flightkeys_Event_Processor',
    dataObjectId: 'FTMonDemandFOS',
    format: 'REST (OpsHub FTM FOS endpoint)',
    trigger: 'FlightKeys event consumed → FEP calls OpsHub /ftm/sendFTMUplinkFOS',
    description: 'FEP posts journey/fuel/performance log entries to FOS via the OpsHub FTM Uplink FOS endpoint.',
  },

  // ── FXD_SOAR_Fusion_Flight_Movement ──────────────────────────────────────
  {
    id: 'ffm-in-aircraft-avro',
    name: 'Aircraft Event (OOOI) from OpsHub',
    direction: 'incoming',
    serviceId: 'FXD_SOAR_Fusion_Flight_Movement',
    topic: 'flight-event-aa-aircraft-avro',
    dataObjectId: 'FlightEvent',
    format: 'Avro (Azure Event Hub)',
    trigger: 'Aircraft OUT/OFF/ON/IN events → OpsHub publishes aircraft-avro event',
    description: 'FFM consumes OOOI aircraft events from OpsHub Azure EH and converts them to TWC Fusion FFM (Flight Movement) format for Fusion desktop display.',
  },
  {
    id: 'ffm-out-fusion-ffm',
    name: 'Flight Movement Data → Fusion (FFM)',
    direction: 'outgoing',
    serviceId: 'FXD_SOAR_Fusion_Flight_Movement',
    format: 'XML (Fusion web service)',
    trigger: 'Aircraft Avro event consumed → FFM adapter transforms to TWC format → calls Fusion',
    description: 'FFM posts OOOI and flight movement data to the Fusion desktop TWC web service endpoint in TWC-compatible XML format.',
  },

  // ── FXD_SOAR_Audit_Log_Processor ─────────────────────────────────────────
  {
    id: 'alp-in-flightplan-topics',
    name: 'Flight Plan Audit Events (multiple topics)',
    direction: 'incoming',
    serviceId: 'FXD_SOAR_Audit_Log_Processor',
    dataObjectId: 'FlightPlan',
    format: 'gzip XML / XML (Azure Event Hub)',
    trigger: 'FPP publishes to soar-aa-* or soar-mq-* topics → ALP consumes all 9 topics',
    description: 'ALP subscribes to 9 flight plan topics (gzip, audit-log, audit-events, fkofp, weather — both AA and MQ paths) and archives them to OpsHub.',
  },
  {
    id: 'alp-out-opshub-archive',
    name: 'Compressed Archive → OpsHub',
    direction: 'outgoing',
    serviceId: 'FXD_SOAR_Audit_Log_Processor',
    format: 'gzip (OpsHub archival endpoint)',
    trigger: 'Flight plan messages consumed → ALP compresses and posts to OpsHub for long-term archive',
    description: 'ALP compresses Flight Plan, Weather, and OFP XML messages and sends to OpsHub Kafka archival topic for compliance storage.',
  },
];
