// ─────────────────────────────────────────────────────────────────────────────
// FXIP Data Lineage Tool — Glossary & Aviation Code Data
// All definitions sourced from official aviation references:
//   • ICAO Annex 2, 6, 11, Doc 4444 (PANS-ATM)
//   • ARINC 618, 633, 724B specifications
//   • FAA Order JO 7110.65 (Air Traffic Control)
//   • FAA Order JO 7930.2 (Notices to Airmen)
//   • IBM/TWC ACARS documentation
//   • AA SOAR/FXIP internal platform documentation
// ─────────────────────────────────────────────────────────────────────────────

export type GlossaryCategory =
  | 'aviation'
  | 'acars'
  | 'fuel'
  | 'flight-planning'
  | 'platform'
  | 'messaging'
  | 'standards';

export interface GlossaryTerm {
  id: string;
  term: string;
  expansion?: string;
  category: GlossaryCategory;
  definition: string;
  source?: string;
  context?: string;          // how it's specifically used in FXIP
  relatedTerms?: string[];
}

export const CATEGORY_META: Record<GlossaryCategory, { label: string; color: string; icon: string }> = {
  aviation:        { label: 'Aviation Ops',     color: '#0078D2', icon: '✈' },
  acars:           { label: 'ACARS',            color: '#c8102e', icon: '📡' },
  fuel:            { label: 'Fuel',             color: '#F59E0B', icon: '⛽' },
  'flight-planning': { label: 'Flight Planning', color: '#7C3AED', icon: '📋' },
  platform:        { label: 'Platform / AA',    color: '#10B981', icon: '🏗' },
  messaging:       { label: 'Messaging',        color: '#14B8A6', icon: '⚡' },
  standards:       { label: 'Standards',        color: '#6B7280', icon: '📐' },
};

export const glossaryTerms: GlossaryTerm[] = [

  // ── Aviation Operations ───────────────────────────────────────────────────
  {
    id: 'acars',
    term: 'ACARS',
    expansion: 'Aircraft Communications Addressing and Reporting System',
    category: 'acars',
    definition:
      'A digital data link system for the transmission of short messages between aircraft and ground stations via VHF radio, HF radio, or satellite communication. Defined in ARINC Specification 618 (Character-Oriented Air/Ground Communications) and ARINC 724B (Avionics). ACARS enables automated position reporting, weather uplinks, flight plan uplinks, and free-text messaging between dispatchers and cockpit crews.',
    source: 'ARINC 618, ARINC 724B',
    context:
      'FXIP uses ACARS for two-way messaging: uplinks are sent from Fusion via FXD_SOAR_Fusion_ACARS_Service → OpsHub FTM Uplink Service → IBM ACARS gateway → aircraft. Downlinks from aircraft are received by the IBM ACARS gateway → OpsHub → Azure Event Hub → FXD_SOAR_ACARS_Cyberjet → FXD_SOAR_Fusion_ACARS_Service → Fusion desktop.',
    relatedTerms: ['ftm', 'hgz', 'dpr', 'sby', 'vcr', 'pfs', 'selcal', 'twc', 'arinc618'],
  },
  {
    id: 'oooi',
    term: 'OOOI',
    expansion: 'Out, Off, On, In',
    category: 'aviation',
    definition:
      'The four primary gate and runway movement events used across the airline industry to track aircraft block times. "Out" = aircraft pushes back from gate (chocks removed, brake released); "Off" = wheels leave runway (takeoff); "On" = wheels touch runway (landing); "In" = aircraft arrives at gate and is chocked. These times are the basis for flight duty, crew rest, and performance calculations.',
    source: 'FAA Order JO 7110.65; IATA Standard Schedules Information Manual (SSIM)',
    context:
      'OOOI events are published by OpsHub to flight-event-aa-time-avro (Azure Event Hub) and consumed by FXD_SOAR_FlightData_Adapter to update FlightKeys, and by FXD_SOAR_Fusion_Flight_Movement to send to the Fusion desktop.',
    relatedTerms: ['flightkeys', 'opshub'],
  },
  {
    id: 'ofp',
    term: 'OFP',
    expansion: 'Operational Flight Plan',
    category: 'aviation',
    definition:
      'A document produced by a flight planning system that authorizes a flight and specifies all parameters needed to conduct it safely: fuel load (trip, contingency, alternate, reserve), departure/destination/alternate airports, filed route and flight level, payload, estimated total weight, weather data, and NOTAM applicability. ICAO Doc 4444 (PANS-ATM) defines minimum required content. Airlines produce OFPs electronically in ARINC 633 XML format.',
    source: 'ICAO Doc 4444 Chapter 4; ARINC 633',
    context:
      'AA OFPs are produced by FlightKeys in ARINC 633 XML format, compressed with gzip, and published to Confluent Cloud topic ext-sec-soar-aa-flightplan-gzip. FXD_SOAR_FlightPlan_Processor consumes, validates, and redistributes to 11 downstream Azure Event Hub topics.',
    relatedTerms: ['arinc633', 'flightkeys', 'fpp', 'fuel-trip', 'fuel-contingency'],
  },
  {
    id: 'atc',
    term: 'ATC',
    expansion: 'Air Traffic Control',
    category: 'aviation',
    definition:
      'Ground-based controllers who direct aircraft in controlled airspace and at airports. ATC provides separation between IFR aircraft, issues clearances, and manages traffic flow. In the US, operated by the FAA; internationally by ICAO member-state aviation authorities. ATC clearances include route, altitude, and speed instructions that may require flight plan amendments.',
    source: 'ICAO Annex 11; FAA Order JO 7110.65 (Air Traffic Control)',
    relatedTerms: ['icao', 'ofp'],
  },
  {
    id: 'occ',
    term: 'OCC',
    expansion: 'Operations Control Center',
    category: 'aviation',
    definition:
      'The nerve center of an airline\'s daily operations. Airline dispatchers, maintenance controllers, crew schedulers, and meteorologists work together in the OCC to monitor and manage all flights, respond to irregular operations (IROPs), and optimize the operation. At American Airlines, the OCC is located at DFW and operates 24/7/365.',
    source: 'ICAO Annex 6 Part I; FAA AC 120-117',
    context:
      'FXIP/SOAR services support OCC dispatchers by delivering real-time ACARS messaging, flight plan data, and aircraft status to the Fusion TWC dispatcher workstation.',
    relatedTerms: ['fusion', 'twc', 'acars'],
  },
  {
    id: 'mel',
    term: 'MEL',
    expansion: 'Minimum Equipment List',
    category: 'aviation',
    definition:
      'A document approved by the aircraft\'s governing aviation authority specifying which aircraft systems and instruments may be inoperative before a specific flight, under defined conditions and for a limited duration. The MEL is derived from the manufacturer\'s Master Minimum Equipment List (MMEL) and tailored to each airline\'s operations. If equipment not on the MEL is inoperative, the aircraft may not depart.',
    source: 'ICAO Doc 9760 (Airworthiness Manual); FAA AC 91-67',
    context:
      'MEL items are tracked as DMI (Deferred Maintenance Items) in AA maintenance systems. FXD_SOAR_AircraftData_Adapter consumes DMI events from OpsHub and posts MEL status updates to FlightKeys aircraft records.',
    relatedTerms: ['dmi', 'ots'],
  },
  {
    id: 'dmi',
    term: 'DMI',
    expansion: 'Deferred Maintenance Item',
    category: 'aviation',
    definition:
      'A maintenance discrepancy that has been officially deferred in accordance with the MEL or Configuration Deviation List (CDL). Each DMI specifies the deferred item, the MEL reference that permits deferral, any operational restrictions, and the interval by which the repair must be completed (A, B, C, or D category). DMIs are tracked from creation through closure.',
    source: 'FAA AC 91-67; ICAO Doc 9760',
    context:
      'OpsHub publishes DMI creation/update events to maint-event-aa-dmi-avro (Azure Event Hub). FXD_SOAR_AircraftData_Adapter consumes these and updates FlightKeys aircraft records with current MEL status.',
    relatedTerms: ['mel', 'ots', 'ada'],
  },
  {
    id: 'ots',
    term: 'OTS',
    expansion: 'Out of Service',
    category: 'aviation',
    definition:
      'An aircraft status designation indicating the aircraft is not available for revenue service, typically due to a maintenance condition that cannot be deferred under the MEL. An OTS aircraft requires corrective maintenance before return to service (RTS). OTS events are published to maintenance event streams to update fleet availability tracking.',
    source: 'ICAO Annex 8; FAA Order 8900.1 (Flight Standards Information Management System)',
    context:
      'OpsHub publishes OTS events to maint-event-mq-ots-avro. FXD_SOAR_AircraftData_Adapter processes these events and updates FlightKeys.',
    relatedTerms: ['mel', 'dmi'],
  },
  {
    id: 'fos',
    term: 'FOS',
    expansion: 'Flight Operations System',
    category: 'platform',
    definition:
      'American Airlines\' internal system of record for flight operations data. FOS stores and manages flight plans, aircraft tail assignments, crew schedules, journey log entries, fuel actualizations, and performance records. FOS is the authoritative source for operational flight data and interfaces with planning, maintenance, and regulatory reporting systems.',
    context:
      'FXD_SOAR_Flightkeys_Event_Processor writes JPY (Journey Log), JPFF (Fuel Filed), PR (Performance Report), and PRF (Performance Report Filed) entries into FOS via the OpsHub FTM Uplink FOS endpoint (/ftm/sendFTMUplinkFOS).',
    relatedTerms: ['jpy', 'jpff', 'pr', 'prf', 'flightkeys'],
  },
  {
    id: 'jpy',
    term: 'JPY',
    expansion: 'Journey Log',
    category: 'flight-planning',
    definition:
      'A post-flight record in FOS (Flight Operations System) capturing actual flight performance data: departure/arrival times (OOOI), fuel on board, fuel burned, alternates used, and any deviations from plan. The Journey Log is an operational requirement under FAA regulations for Part 121 carriers and feeds regulatory reporting.',
    source: 'FAA 14 CFR Part 121.693 (Load Manifest); AA FOS documentation',
    context:
      'FXD_SOAR_Flightkeys_Event_Processor receives FlightKeys events of type JPY from flight-event-fkys-avro and posts the Journey Log entry to FOS via OpsHub.',
    relatedTerms: ['fos', 'jpff', 'pr', 'prf', 'flightkeys'],
  },
  {
    id: 'jpff',
    term: 'JPFF',
    expansion: 'Journey Plan Fuel Filed',
    category: 'flight-planning',
    definition:
      'A FOS entry type that records the final fuel plan filed for a flight before departure. JPFF captures the planned fuel quantities (trip, contingency, alternate, reserve, extra) at the time of flight plan release, providing the baseline against which actual fuel consumption is compared post-flight.',
    source: 'AA FOS documentation',
    context:
      'FXD_SOAR_Flightkeys_Event_Processor processes JPFF-type events from FlightKeys and writes the fuel-filed record to FOS.',
    relatedTerms: ['fos', 'jpy', 'fuel-trip', 'fuel-contingency'],
  },
  {
    id: 'pr',
    term: 'PR',
    expansion: 'Performance Report',
    category: 'flight-planning',
    definition:
      'A FOS entry capturing aircraft performance data collected during flight, including cruise fuel flow, airspeed, altitude, outside air temperature, and actual vs. planned fuel consumption. Performance data is used by engineering to validate aircraft performance models and detect degradation.',
    source: 'AA FOS documentation; ICAO Doc 9976 (Flight Crew Operating Manual Standards)',
    relatedTerms: ['prf', 'jpy', 'fos'],
  },
  {
    id: 'prf',
    term: 'PRF',
    expansion: 'Performance Report Filed',
    category: 'flight-planning',
    definition:
      'A FOS entry type indicating the performance report has been formally submitted and accepted into the Flight Operations System. PRF status confirms the data is available for post-flight analysis and regulatory compliance.',
    source: 'AA FOS documentation',
    relatedTerms: ['pr', 'fos'],
  },
  {
    id: 'selcal',
    term: 'SELCAL',
    expansion: 'Selective Calling System',
    category: 'acars',
    definition:
      'A communications system that allows a ground station to alert a specific aircraft. Each aircraft is assigned a unique 4-character SELCAL code (e.g., "BFGJ") composed of letters from a defined set. When activated, the cockpit SELCAL decoder triggers a chime and light, alerting crew to an incoming call. Widely used on oceanic routes where continuous radio monitoring is impractical. Standardized under ICAO Annex 10.',
    source: 'ICAO Annex 10 Vol. III; ARINC 714 (SELCAL System)',
    context:
      'SELCAL codes are included in FlightPlan CrewMember records (FlightInfo/SELCAL) and can be activated in ACARS FTM uplinks via the ActivateSELCAL field in ACARSMessageRequest.',
    relatedTerms: ['acars', 'ftm'],
  },
  {
    id: 'etd-eta',
    term: 'ETD / ETA',
    expansion: 'Estimated Time of Departure / Estimated Time of Arrival',
    category: 'aviation',
    definition:
      'Real-time estimated departure and arrival times for a flight, updated continuously by the operations control system. ETD reflects the best current estimate of pushback ("Out") time; ETA reflects estimated gate arrival ("In") time. Distinct from scheduled times (STD/STA) which are published in airline schedules.',
    source: 'ICAO Doc 4444 (PANS-ATM); IATA SSIM Chapter 2',
    context:
      'ETD/ETA updates are published by OpsHub to flight-event-aa-departure-arrival-avro and consumed by FXD_SOAR_FlightData_Adapter for propagation to FlightKeys.',
    relatedTerms: ['oooi', 'flightkeys'],
  },
  {
    id: 'icao',
    term: 'ICAO',
    expansion: 'International Civil Aviation Organization',
    category: 'aviation',
    definition:
      'A specialized agency of the United Nations, established by the Convention on International Civil Aviation (Chicago Convention, 1944). ICAO sets international standards and recommended practices (SARPs) for aviation safety, security, efficiency, and environmental protection. ICAO assigns 4-letter location identifiers (airport codes) and 3-letter airline designators used in flight plans and ATC communications.',
    source: 'Chicago Convention (Doc 7300); ICAO Doc 7910 (Location Indicators); ICAO Doc 8585 (Designators for Aircraft Operating Agencies)',
    relatedTerms: ['iata'],
  },
  {
    id: 'iata',
    term: 'IATA',
    expansion: 'International Air Transport Association',
    category: 'aviation',
    definition:
      'A trade association representing approximately 320 airlines, accounting for 83% of global air traffic. IATA maintains industry standards for ticketing, baggage, cargo, dangerous goods, and ground handling. IATA assigns 2-letter airline codes and 3-letter airport codes used in reservations, ticketing, and passenger processing systems. IATA codes differ from ICAO codes and serve different purposes.',
    source: 'IATA Standard Schedules Information Manual (SSIM); IATA Resolution 762',
    relatedTerms: ['icao'],
  },
  {
    id: 'notam',
    term: 'NOTAM',
    expansion: 'Notice to Airmen (Notice to Air Missions)',
    category: 'aviation',
    definition:
      'A notice filed with an aviation authority to alert aircraft pilots of any hazard along a flight route or at a location that could affect the safety of the flight. NOTAMs cover temporary flight restrictions, runway/taxiway closures, navigation aid outages, obstacle hazards, and airspace changes. Renamed "Notice to Air Missions" by the FAA in 2021. Required to be reviewed by dispatchers and pilots during flight planning.',
    source: 'ICAO Annex 15 (Aeronautical Information Services); FAA Order JO 7930.2 (NOTAMs)',
    context:
      'NOTAMs are embedded in the ARINC 633 FlightPlan XML document as an array of NOTAM objects, distributed to downstream systems via the FXD_SOAR_FlightPlan_Processor pipeline.',
    relatedTerms: ['ofp', 'arinc633'],
  },
  {
    id: 'ifr',
    term: 'IFR',
    expansion: 'Instrument Flight Rules',
    category: 'aviation',
    definition:
      'A set of regulations governing flight conducted primarily by reference to cockpit instruments rather than outside visual references. All airline transport operations are conducted under IFR, which requires an ATC clearance, flight plan filing, and adherence to defined routes, altitudes, and separation standards. Contrasts with VFR (Visual Flight Rules) used by general aviation.',
    source: 'ICAO Annex 2 (Rules of the Air); FAA 14 CFR Part 91',
    relatedTerms: ['atc', 'ofp'],
  },
  {
    id: 'faf',
    term: 'FAF',
    expansion: 'Final Approach Fix',
    category: 'aviation',
    definition:
      'The point on an instrument approach procedure from which the final approach begins, identified by a fix (VOR, NDB, DME, GPS waypoint) or the outer marker. The FAF is the last point at which the pilot verifies alignment and initiates the final descent toward the runway. Used in diversion planning to calculate fuel required from the FAF to the alternate airport.',
    source: 'FAA Instrument Procedures Handbook (FAA-H-8083-16B); ICAO Doc 8168 (PANS-OPS)',
    context:
      'FAF fuel (FAFFuel) and FAF time (FAFTime) are parameters in the DPRParams structure within ACARSMessageRequest, used when a dispatcher sends a diversion plan to the cockpit crew.',
    relatedTerms: ['dpr', 'acars', 'fuel-alternate'],
  },

  // ── ACARS Message Types ───────────────────────────────────────────────────
  {
    id: 'ftm',
    term: 'FTM',
    expansion: 'Free Text Message',
    category: 'acars',
    definition:
      'An ACARS uplink message type carrying free-form text from a ground station (dispatcher) to the cockpit crew. FTM is the most flexible ACARS message type, allowing dispatchers to send any operational information to the flight deck. Messages are printed on the cockpit ACARS printer and may trigger a chime if SELCAL is activated.',
    source: 'IBM/TWC ACARS Uplink Message Specification; ARINC 618',
    context:
      'In FXIP, FTM uplinks are initiated by dispatchers in the Fusion TWC desktop, received by FXD_SOAR_Fusion_ACARS_Service as ACARSMessageRequest (MessageType=FTM), transformed to OpsHub FTMonDemand format, and delivered to the aircraft via the OpsHub FTM Uplink Service.',
    relatedTerms: ['acars', 'ftmontdemand', 'hgz', 'dpr', 'selcal'],
  },
  {
    id: 'hgz',
    term: 'HGZ',
    expansion: 'How Go It',
    category: 'acars',
    definition:
      'An ACARS uplink message type that requests a standard operational status report from the flight crew. Derived from the radio phraseology "How\'s it going?" The crew responds with a structured downlink containing current position, altitude, airspeed, fuel state, ETA, and any notable conditions. Used to verify communication and obtain a position check.',
    source: 'IBM/TWC ACARS Uplink Message Specification; ARINC 618',
    context: 'MessageType=HGZ in ACARSMessageRequest. FXD_SOAR_Fusion_ACARS_Service routes to OpsHub FTM Uplink.',
    relatedTerms: ['acars', 'ftm'],
  },
  {
    id: 'dpr',
    term: 'DPR',
    expansion: 'Diversion Plan Report',
    category: 'acars',
    definition:
      'An ACARS uplink message type sent to the cockpit crew when a diversion from the filed destination has been authorized by the dispatcher. Contains the alternate airport, FAF fuel, FAF time, original destination, fuel burn to alternate, and any dispatcher remarks. The DPR carries the DPRParams data structure.',
    source: 'IBM/TWC ACARS Uplink Message Specification; ARINC 618',
    context:
      'MessageType=DPR in ACARSMessageRequest. The DPR_Params field (DPRParams) contains AlternateStation, FAFFuel, FAFTime, OrigArrStation, FuelBurnToAlt, and DispatcherRemarks.',
    relatedTerms: ['acars', 'ftm', 'faf', 'DPRParams'],
  },
  {
    id: 'sby',
    term: 'SBY',
    expansion: 'Standby',
    category: 'acars',
    definition:
      'An ACARS uplink message type indicating that the dispatcher is standing by and awaiting communication from the cockpit crew. Used to establish communication awareness without initiating a full HGZ report.',
    source: 'IBM/TWC ACARS Uplink Message Specification',
    context: 'MessageType=SBY in ACARSMessageRequest.',
    relatedTerms: ['acars', 'ftm', 'hgz'],
  },
  {
    id: 'vcr',
    term: 'VCR',
    expansion: 'Voice Contact Request',
    category: 'acars',
    definition:
      'An ACARS uplink message type instructing the flight crew to make voice contact with ATC or dispatch on a specified frequency. Includes VCRParams with the frequency and agency to contact. Used when data-link messaging is insufficient for the situation and voice communication is required.',
    source: 'IBM/TWC ACARS Uplink Message Specification; ARINC 618',
    context: 'MessageType=VCR in ACARSMessageRequest with VCR_Params sub-structure.',
    relatedTerms: ['acars', 'ftm'],
  },
  {
    id: 'pfs',
    term: 'PFS',
    expansion: 'Position/Fuel/Speed',
    category: 'acars',
    definition:
      'An ACARS message type requesting the crew to automatically transmit position, fuel on board, and airspeed reports at a defined interval. PFS reports are automated — once activated, the avionics system sends reports without crew action. Used for routine tracking on routes where ATC radar coverage is limited (oceanic, polar).',
    source: 'ARINC 618; IBM/TWC ACARS Specification',
    context:
      'MessageType=PFS in ACARSMessageRequest. The PositionFuelScheduleInterval field specifies the reporting interval in seconds.',
    relatedTerms: ['acars', 'ftm', 'oooi'],
  },

  // ── Fuel Terms ────────────────────────────────────────────────────────────
  {
    id: 'fuel-trip',
    term: 'Trip Fuel',
    category: 'fuel',
    definition:
      'The quantity of fuel calculated to be consumed from the point of take-off to landing at the destination airport under the planned route, altitude, and speed profile. Trip fuel is the baseline from which all other fuel requirements are added. Computed by the flight planning system using aircraft performance models and meteorological forecast data.',
    source: 'ICAO Doc 9976; FAA AC 25-8; ICAO Annex 6 Part I',
    context:
      'FuelPlan.tripFuel in the FXIP data model. Distributed in the ARINC 633 FlightPlan XML via FlightPlan Processor.',
    relatedTerms: ['fuel-contingency', 'fuel-alternate', 'fuel-reserve', 'ofp'],
  },
  {
    id: 'fuel-contingency',
    term: 'Contingency Fuel',
    category: 'fuel',
    definition:
      'A fuel reserve carried to cover unforeseen deviations from the planned flight, such as ATC route changes, meteorological deviations, and aircraft performance variations. ICAO Doc 9976 specifies the minimum as the higher of: 5% of trip fuel, or fuel for 5 minutes holding at destination, with a minimum of 5% of trip fuel (for flight planning purposes).',
    source: 'ICAO Doc 9976 (Manual of Procedures for Establishment and Management of a State\'s Personnel Licensing System); EASA OPS Subpart F; FAA AC 25-8',
    context: 'FuelPlan.contingencyFuel. Must be ≥5% of trip fuel per ICAO standard.',
    relatedTerms: ['fuel-trip', 'fuel-alternate', 'fuel-reserve'],
  },
  {
    id: 'fuel-alternate',
    term: 'Alternate Fuel',
    category: 'fuel',
    definition:
      'Fuel required to fly from the destination airport to the designated alternate airport in the event a landing at the destination cannot be made (due to weather, airport closure, etc.). Computed from the missed approach point at destination to landing at the alternate airport including the approach and missed approach at the alternate if applicable.',
    source: 'ICAO Annex 6 Part I Chapter 4; FAA 14 CFR 121.639',
    context: 'FuelPlan.alternateFuel. Included in every IFR flight plan filed by an AA flight.',
    relatedTerms: ['fuel-trip', 'fuel-reserve', 'faf'],
  },
  {
    id: 'fuel-reserve',
    term: 'Final Reserve Fuel',
    category: 'fuel',
    definition:
      'The minimum fuel quantity required to be on board upon landing, calculated as fuel to fly for 30 minutes at holding speed at 1,500 ft above alternate aerodrome elevation (or at destination if no alternate is required). This fuel is legally inviolable — no operation may be planned to use it.',
    source: 'ICAO Annex 6 Part I Chapter 4.3; EASA OPS 1.255; FAA 14 CFR 121.639',
    context: 'FuelPlan.finalReserveFuel. Regulatory minimum — landing with less requires an emergency declaration.',
    relatedTerms: ['fuel-trip', 'fuel-alternate', 'fuel-contingency'],
  },
  {
    id: 'tankering',
    term: 'Tankering',
    category: 'fuel',
    definition:
      'The practice of carrying extra fuel beyond operational requirements from a station where fuel is cheaper to avoid or reduce fueling at a more expensive downstream station. Tankering involves a cost-benefit calculation that weighs the price differential against the extra fuel burned carrying the additional weight. Approved by the dispatcher and captain.',
    source: 'ICAO Doc 9976; AA Fuel Planning Policy',
    context: 'FuelPlan.tankering in the FXIP data model. Computed by FlightKeys fuel optimization.',
    relatedTerms: ['fuel-trip', 'fuel-reserve'],
  },

  // ── Standards ─────────────────────────────────────────────────────────────
  {
    id: 'arinc618',
    term: 'ARINC 618',
    expansion: 'Character-Oriented Air/Ground Communications',
    category: 'standards',
    definition:
      'An ARINC standard defining the protocol for character-oriented digital data communication between aircraft and ground stations (ACARS). ARINC 618 specifies message structure, addressing format (7-character downlink address), acknowledgement procedures, and ground-station routing. Provides the data link layer on top of VHF/HF/SATCOM physical transport.',
    source: 'ARINC Specification 618 (ARINC/Airlines Electronic Engineering Committee)',
    relatedTerms: ['acars', 'arinc633', 'arinc724b'],
  },
  {
    id: 'arinc633',
    term: 'ARINC 633',
    expansion: 'Electronic Flight Planning',
    category: 'standards',
    definition:
      'An ARINC standard defining an XML schema for the exchange of Operational Flight Plans (OFPs) between flight planning systems, airline operations, and aircraft. ARINC 633 documents the complete flight plan including: identification, route, fuel data, weather, NOTAM references, crew information, aircraft performance, and alternates. Enables interoperability between different flight planning vendors.',
    source: 'ARINC Specification 633 (ARINC/Airlines Electronic Engineering Committee)',
    context:
      'AA FlightKeys produces ARINC 633 XML OFPs, compressed with gzip, published to Confluent Cloud and distributed by FXD_SOAR_FlightPlan_Processor. The schema drives the FlightPlan data object in FXIP.',
    relatedTerms: ['ofp', 'flightkeys', 'arinc618'],
  },
  {
    id: 'arinc724b',
    term: 'ARINC 724B',
    expansion: 'ACARS Avionics',
    category: 'standards',
    definition:
      'An ARINC standard defining the avionics installation requirements for the Aircraft Communications Addressing and Reporting System onboard the aircraft. Specifies the management unit (ATSU/CMU), display unit, and printer interfaces. ARINC 724B complements ARINC 618 (ground-air protocol) by defining the airborne side of the ACARS system.',
    source: 'ARINC Specification 724B (ARINC/Airlines Electronic Engineering Committee)',
    relatedTerms: ['acars', 'arinc618'],
  },
  {
    id: 'amqp',
    term: 'AMQP',
    expansion: 'Advanced Message Queuing Protocol',
    category: 'messaging',
    definition:
      'An open standard application layer protocol for message-oriented middleware. AMQP defines a wire-level protocol for sending and receiving messages, enabling interoperability between different messaging implementations. Provides guaranteed delivery, transactions, and flow control. RabbitMQ is a popular open-source AMQP broker; Azure Service Bus also supports AMQP 1.0.',
    source: 'AMQP 1.0 (ISO/IEC 19464:2014)',
    context: 'Used by RabbitMQ in FXIP for point-to-point messaging paths requiring guaranteed delivery.',
    relatedTerms: ['rabbitmq', 'azure-sb'],
  },
  {
    id: 'avro',
    term: 'Apache Avro',
    category: 'messaging',
    definition:
      'A row-oriented binary data serialization framework developed within Apache\'s Hadoop project. Avro uses JSON to define schemas and stores data in a compact binary format. Schema evolution is a first-class feature — consumers can read data written by older/newer producers as long as schema compatibility rules are followed. Avro is the preferred serialization format for OpsHub event streams due to its compactness and schema registry integration.',
    source: 'Apache Avro Specification v1.11; Confluent Schema Registry documentation',
    context:
      'All OpsHub event topics (flight-event-*, maint-event-*, flight-event-fkys-avro) use Avro binary encoding. FXIP adapters (FXD_SOAR_FlightData_Adapter, FXD_SOAR_AircraftData_Adapter, FXD_SOAR_Flightkeys_Event_Processor) deserialize these using the generated Avro POJOs in com.aa.opshub.avro.*',
    relatedTerms: ['opshub', 'azure-eh'],
  },

  // ── Platform / Technology ─────────────────────────────────────────────────
  {
    id: 'soar',
    term: 'SOAR',
    expansion: 'System for Operational Aviation Responsiveness (AA internal name)',
    category: 'platform',
    definition:
      'American Airlines\' internal name for the FXIP real-time event streaming and integration platform. SOAR connects Fusion dispatch desktop, OpsHub, FlightKeys, FOS, and external systems (IBM ACARS, FOS) through a set of Spring Boot microservices deployed on Kubernetes. The platform handles flight plan distribution, ACARS messaging, aircraft data, and flight movement tracking.',
    context: 'Services prefixed FXD_SOAR_* are part of the SOAR/FXIP platform.',
    relatedTerms: ['fxip', 'fusion', 'opshub'],
  },
  {
    id: 'fxip',
    term: 'FXIP',
    expansion: 'Fusion/SOAR Integration Platform',
    category: 'platform',
    definition:
      'The architectural framework and codebase name for the integration layer between the Fusion dispatcher workstation (TWC/IBM), OpsHub event streams (Azure Event Hub/Kafka), FlightKeys flight planning, and FOS. FXIP services are Spring Boot microservices organized into APIs, Processors, Adapters, and MGW (Message Gateway) layers.',
    relatedTerms: ['soar', 'fusion', 'opshub', 'flightkeys'],
  },
  {
    id: 'fusion',
    term: 'Fusion',
    expansion: 'Fusion Dispatch Workstation (The Weather Company / IBM)',
    category: 'platform',
    definition:
      'The dispatcher workstation software provided by The Weather Company (IBM subsidiary), used by American Airlines dispatchers for flight plan review, weather analysis, and ACARS communication. Fusion integrates flight tracking maps, weather products, ACARS messaging, and flight plan data into a single desktop application. AA dispatchers use Fusion TWC to monitor and communicate with all AA/MQ flights.',
    context:
      'FXIP services receive ACARS uplink requests from Fusion, deliver downlinks back to Fusion, and push flight movement data to Fusion via TWC web service endpoints.',
    relatedTerms: ['soar', 'twc', 'acars', 'fxip'],
  },
  {
    id: 'twc',
    term: 'TWC',
    expansion: 'The Weather Company (IBM)',
    category: 'platform',
    definition:
      'A subsidiary of IBM that provides commercial weather data, forecasting services, and aviation operational software. TWC\'s aviation division (formerly WSI — Weather Services International) provides the ACARS uplink network, Fusion dispatcher workstation, and flight weather products. TWC maintains the WSI ACARS customer network through which airline uplinks/downlinks are routed.',
    relatedTerms: ['fusion', 'wsi', 'acars'],
  },
  {
    id: 'wsi',
    term: 'WSI',
    expansion: 'Weather Services International (now TWC Aviation)',
    category: 'platform',
    definition:
      'The original name for The Weather Company\'s aviation division, which provides ACARS network services and dispatcher tools. WSI assigns numeric Customer IDs (CIDs) to airline customers and manages the routing of ACARS uplink/downlink messages. The WSI CID is embedded in every ACARS message as the AirlineCode.CID field.',
    context:
      'AirlineCode.CID in the ACARS_Interface.xsd schema is the WSI/TWC numeric customer identifier for the airline (AA, MQ).',
    relatedTerms: ['twc', 'acars', 'fusion'],
  },
  {
    id: 'opshub',
    term: 'OpsHub',
    expansion: 'American Airlines Operational Data Hub',
    category: 'platform',
    definition:
      'AA\'s enterprise event streaming backbone built on Azure Event Hub (Kafka-compatible). OpsHub receives real-time operational events from source systems (flight scheduling, ACARS, maintenance, crew, load planning) and distributes them to consuming applications across the airline. OpsHub events use Apache Avro serialization with schema registry. OpsHub is the primary data source for FXIP/SOAR services.',
    context:
      'FXIP adapters (FlightData, AircraftData) consume from OpsHub Azure Event Hub topics. OpsHub endpoints are also used for FTM uplink (FTM Uplink Service) and FOS update (sendFTMUplinkFOS).',
    relatedTerms: ['azure-eh', 'avro', 'soar', 'fxip'],
  },
  {
    id: 'flightkeys',
    term: 'FlightKeys',
    expansion: 'AA Flight Planning System (Jeppesen/Boeing FlightPlan Manager)',
    category: 'platform',
    definition:
      'American Airlines\' flight planning system that computes Operational Flight Plans (OFPs), manages flight plan lifecycle (draft → released → superseded), handles fuel optimization, and maintains aircraft and crew records. FlightKeys generates ARINC 633 XML OFPs which are published to Confluent Cloud for distribution by FXIP. FlightKeys also consumes data from FXIP adapters for aircraft, crew, and schedule updates.',
    context:
      'FXD_SOAR_FlightData_Adapter and FXD_SOAR_AircraftData_Adapter POST updates to the FlightKeys REST API. FXD_SOAR_FlightPlan_Processor consumes OFPs from Confluent Cloud.',
    relatedTerms: ['ofp', 'arinc633', 'fos', 'confluent'],
  },
  {
    id: 'mgw',
    term: 'MGW',
    expansion: 'Message Gateway',
    category: 'platform',
    definition:
      'FXIP Message Gateway services that translate and bridge between different messaging protocols and transports. MGW services convert between IBM MQ / Azure Service Bus / RabbitMQ and the Azure Event Hub (Kafka) backbone. They handle protocol conversion, message format transformation, and connectivity to legacy messaging infrastructure.',
    context: 'MGW services in FXIP are deployed as FXD_SOAR_*_MGW Spring Boot applications on Kubernetes.',
    relatedTerms: ['soar', 'ibm-mq', 'rabbitmq', 'azure-sb', 'azure-eh'],
  },
  {
    id: 'confluent',
    term: 'Confluent Cloud',
    category: 'messaging',
    definition:
      'A fully managed cloud-native Apache Kafka service provided by Confluent Inc. Confluent Cloud provides enterprise Kafka with built-in schema registry, ksqlDB stream processing, and connectors. FXIP uses a dedicated Confluent Cloud cluster (lkc-myzqm2, prod) to receive flight plan XML feeds from FlightKeys — data is then bridged into Azure Event Hub topics for FXIP internal consumption.',
    context:
      'Confluent Cloud topics ext-sec-soar-aa-flightplan-gzip and ext-sec-soar-aa-flightplan-auditevents-xml feed into FXD_SOAR_FlightPlan_Processor.',
    relatedTerms: ['azure-eh', 'opshub', 'flightkeys'],
  },
  {
    id: 'azure-eh',
    term: 'Azure Event Hub',
    category: 'messaging',
    definition:
      'Microsoft Azure\'s fully managed, real-time data ingestion service that supports the Apache Kafka protocol. Azure Event Hub provides Kafka-compatible endpoints, enabling Kafka clients to produce and consume events without changing application code. FXIP uses Azure Event Hub as its primary internal event backbone for flight, aircraft, ACARS, maintenance, and flight plan events. Event Hub partitions enable parallel consumption across service instances.',
    source: 'Microsoft Azure Event Hubs documentation',
    context:
      'All soar-aa-*, soar-mq-*, acars-event-*, maint-event-*, flight-event-*, and flightplan-related topics in FXIP are Azure Event Hub topics with Kafka-compatible endpoints.',
    relatedTerms: ['confluent', 'opshub', 'avro'],
  },
  {
    id: 'rabbitmq',
    term: 'RabbitMQ',
    category: 'messaging',
    definition:
      'An open-source message broker implementing AMQP (Advanced Message Queuing Protocol). RabbitMQ supports multiple messaging patterns including work queues, publish-subscribe, routing, and topics. It provides reliable delivery, message persistence, and consumer acknowledgements. Used in FXIP for point-to-point messaging paths that require guaranteed delivery semantics and complex routing logic.',
    source: 'RabbitMQ documentation; AMQP 0-9-1 specification',
    context:
      'FXD_SOAR_FOS_Update_Processor consumes flight plan information from RabbitMQ queues before posting to FOS via OpsHub.',
    relatedTerms: ['amqp', 'ibm-mq', 'azure-sb'],
  },
  {
    id: 'ibm-mq',
    term: 'IBM MQ',
    expansion: 'IBM Message Queue (formerly MQSeries, WebSphere MQ)',
    category: 'messaging',
    definition:
      'IBM\'s enterprise message queuing middleware, providing reliable, transactional, and secure message delivery across distributed applications. IBM MQ supports multiple protocols and message patterns, with strong guarantees for exactly-once delivery and message persistence. Used in FXIP as the transport layer for the IBM ACARS gateway connectivity.',
    source: 'IBM MQ documentation; IBM ACARS Gateway specification',
    context:
      'IBM MQ bridges the IBM ACARS system with FXIP. ACARS downlinks from aircraft arrive at the IBM ACARS gateway → IBM MQ → Azure Event Hub → FXIP consumers. Uplinks flow in reverse through OpsHub FTM Uplink Service → IBM MQ → IBM ACARS gateway → ACARS network → aircraft.',
    relatedTerms: ['acars', 'azure-sb', 'rabbitmq', 'mgw'],
  },
  {
    id: 'azure-sb',
    term: 'Azure Service Bus',
    category: 'messaging',
    definition:
      'Microsoft Azure\'s fully managed enterprise message broker with message queues and publish-subscribe topics. Service Bus supports AMQP 1.0 and provides features such as dead-letter queues, message sessions, duplicate detection, and scheduled delivery. Used in FXIP for reliable integration paths with AA enterprise systems that use AMQP or HTTP endpoints.',
    source: 'Microsoft Azure Service Bus documentation',
    relatedTerms: ['amqp', 'rabbitmq', 'ibm-mq'],
  },
  {
    id: 'documentdb',
    term: 'DocumentDB / Azure Cosmos DB',
    category: 'platform',
    definition:
      'AA\'s term for Azure Cosmos DB (NoSQL), used for storing operational documents including flight plan history, audit logs, ACARS message history, and aircraft state documents. Azure Cosmos DB provides globally distributed, low-latency document storage with automatic indexing. FXIP services store processed flight plan data and audit records in DocumentDB for compliance and replay purposes.',
    source: 'Microsoft Azure Cosmos DB documentation',
    context:
      'FXD_SOAR_FlightPlan_Processor and FXD_SOAR_Audit_Log_Processor write to DocumentDB for persistent audit trail and historical flight plan storage.',
    relatedTerms: ['fxip', 'opshub'],
  },

  // ── TPS / Takeoff Performance ─────────────────────────────────────────────
  {
    id: 'tps',
    term: 'TPS',
    expansion: 'Takeoff Performance System',
    category: 'flight-planning',
    definition:
      'A system that computes pre-departure takeoff performance data: V-speeds (V1, VR, V2), thrust settings (TOGA/FLEX/derate), flap configuration, and performance limiting factor. Inputs include aircraft weight (TOW/ZFW), center of gravity, runway, obstacle environment, and atmospheric conditions. In FXIP, FlightKeys acts as the TPS engine.',
    source: 'FAA AC 25.105; ICAO Annex 6 Part I',
    context:
      'FXIP TPS data flow: Load Control → flight-event-mq-load-avro → FXD_SOAR_FlightData_Adapter → FlightKeys (V-speed calculation) → flight-event-fkys-avro (PR/PRF) → FXD_SOAR_Flightkeys_Event_Processor → FOS. V-speed card uplinked to cockpit via FXD_SOAR_Fusion_ACARS_Service.',
    relatedTerms: ['v1', 'vr', 'v2', 'zfw', 'togw', 'flex-temp', 'toga', 'pr-prf'],
  },
  {
    id: 'v1',
    term: 'V1',
    expansion: 'Takeoff Decision Speed',
    category: 'flight-planning',
    definition:
      'The maximum speed at which the crew must initiate the first action to abort the takeoff and stop within the remaining runway. Above V1 the takeoff must continue. Determined from TOW, CG, runway length, obstacles, flap setting, and pressure altitude. Defined in FAA 14 CFR Part 25.107.',
    source: 'FAA 14 CFR Part 25.107; ICAO Annex 6 Part I',
    context:
      'Part of the TPS output from FlightKeys (TakeoffPerformanceData.v1Speed). Transmitted to the cockpit via ACARS FTM uplink through FXD_SOAR_Fusion_ACARS_Service and filed in FOS as a PR entry.',
    relatedTerms: ['tps', 'vr', 'v2', 'togw', 'flex-temp'],
  },
  {
    id: 'vr',
    term: 'VR',
    expansion: 'Rotation Speed',
    category: 'flight-planning',
    definition:
      'The speed at which the pilot applies back-pressure to raise the nose for liftoff. Must be at or above V1 and must allow the aircraft to reach V2 by 35 feet above the runway surface. Calculated from TOW, flap setting, and aircraft type.',
    source: 'FAA 14 CFR Part 25.107',
    context:
      'Part of the TPS V-speed card from FlightKeys (TakeoffPerformanceData.vrSpeed). Included in the ACARS FTM uplink sent by FXD_SOAR_Fusion_ACARS_Service.',
    relatedTerms: ['tps', 'v1', 'v2'],
  },
  {
    id: 'v2',
    term: 'V2',
    expansion: 'Takeoff Safety Speed',
    category: 'flight-planning',
    definition:
      'Minimum airspeed that must be maintained after engine failure during climb-out to guarantee required obstacle clearance gradient. Must be reached by 35 feet above runway surface. Drives flap retraction and initial climb-out pitch target.',
    source: 'FAA 14 CFR Part 25.107',
    context:
      'Part of the TPS V-speed card (TakeoffPerformanceData.v2Speed). Posted to FOS in PR/PRF FlightKeys events and sent to cockpit via ACARS FTM uplink.',
    relatedTerms: ['tps', 'v1', 'vr'],
  },
  {
    id: 'zfw',
    term: 'ZFW',
    expansion: 'Zero Fuel Weight',
    category: 'flight-planning',
    definition:
      'Total weight of the aircraft including all useful load (crew, passengers, cargo, baggage) but excluding all usable fuel. Primary structural weight reference and base input for both fuel planning and TPS calculations. MZFW (Maximum Zero Fuel Weight) is the certified structural limit.',
    source: 'ICAO Annex 6; ARINC 633',
    context:
      'Published by Load Control in flight-event-mq-load-avro (LoadEvent.zeroFuelWeight). Consumed by FXD_SOAR_FlightData_Adapter and posted to FlightKeys as the primary TPS input alongside fuel on board.',
    relatedTerms: ['tps', 'togw', 'v1'],
  },
  {
    id: 'togw',
    term: 'TOGW / TOW',
    expansion: 'Takeoff Gross Weight / Takeoff Weight',
    category: 'flight-planning',
    definition:
      'Total aircraft weight at brake release: ZFW + fuel on board. The single most important TPS input — determines V-speeds, required thrust, and usable runway length. MTOW (Maximum Takeoff Weight) is the certified upper limit.',
    source: 'FAA 14 CFR Part 25; ICAO Annex 6',
    context:
      'Derived in FXIP as ZFW + FOB from the LoadEvent (estimatedTOW field). Posted to FlightKeys by FXD_SOAR_FlightData_Adapter to trigger V-speed calculation. Stored in TakeoffPerformanceData.takeoffWeight.',
    relatedTerms: ['tps', 'zfw', 'v1', 'vr', 'v2'],
  },
  {
    id: 'cg',
    term: 'CG',
    expansion: 'Center of Gravity',
    category: 'flight-planning',
    definition:
      'Point at which the aircraft\'s total weight is considered to act. Expressed as a percentage of Mean Aerodynamic Chord (%MAC). CG position affects trim, stability, V-speeds, and structural weight limits. Computed by Load Control from seating, cargo placement, and fuel state.',
    source: 'ICAO Annex 6; FAA AC 120-27',
    context:
      'Published in LoadEvent.cgPosition (flight-event-mq-load-avro). Posted to FlightKeys by FXD_SOAR_FlightData_Adapter as a TPS input. Stored in TakeoffPerformanceData.cgPercent.',
    relatedTerms: ['tps', 'zfw', 'togw'],
  },
  {
    id: 'flex-temp',
    term: 'Flex Temp / Assumed Temperature',
    category: 'flight-planning',
    definition:
      'An artificially elevated outside air temperature entered into the FMS to command reduced engine thrust below TOGA — extending engine life and saving fuel. Legal only when field-length and obstacle-clearance margins allow the reduced thrust. Also called "assumed temperature" or "derate by temperature".',
    source: 'ICAO Annex 6 Part I; FAA AC 25.1591',
    context:
      'Computed by FlightKeys TPS and included in PR/PRF events (TakeoffPerformanceData.assumedTemperature). Sent to cockpit in the V-speed ACARS FTM uplink from FXD_SOAR_Fusion_ACARS_Service.',
    relatedTerms: ['tps', 'toga', 'v1', 'vr', 'v2'],
  },
  {
    id: 'toga',
    term: 'TOGA',
    expansion: 'Takeoff / Go-Around Thrust',
    category: 'flight-planning',
    definition:
      'Maximum certified thrust rating for takeoff and go-around maneuvers. Selected when field-length performance is marginal, obstacles are limiting, or conditions require maximum thrust. Greater engine wear vs FLEX/derate settings.',
    source: 'FAA 14 CFR Part 33; EASA CS-E',
    context:
      'One of the thrustMode enum values in TakeoffPerformanceData. FlightKeys selects TOGA when FLEX derate cannot maintain required performance margins.',
    relatedTerms: ['tps', 'flex-temp'],
  },
  {
    id: 'pr-prf',
    term: 'PR / PRF',
    expansion: 'Performance Report / Performance Report Filed',
    category: 'platform',
    definition:
      'FlightKeys event types that carry TPS results to FOS. PR (Performance Report) = computed TPS values (V-speeds, thrust, flap, limiting factor) generated by FlightKeys after receiving load data. PRF (Performance Filed) = dispatcher-confirmed TPS values filed pre-departure, indicating the performance data has been reviewed and accepted.',
    source: 'AA FXIP/SOAR internal platform',
    context:
      'Published on flight-event-fkys-avro by FlightKeys/OpsHub. Consumed by FXD_SOAR_Flightkeys_Event_Processor which posts PR/PRF entries to FOS. The authoritative TPS records in FXIP — required before crew can receive departure clearance.',
    relatedTerms: ['tps', 'v1', 'vr', 'v2', 'flightkeys'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// AVIATION CODES — ICAO and IATA airline and airport identifiers
// Sources: ICAO Doc 7910 (Airport Location Indicators)
//          ICAO Doc 8585 (Airline/Operator Designators)
//          IATA Standard Schedules Information Manual (SSIM)
// ─────────────────────────────────────────────────────────────────────────────

export type CodeType = 'icao-airline' | 'iata-airline' | 'icao-airport' | 'iata-airport';

export interface AviationCode {
  code: string;
  type: CodeType;
  name: string;
  country?: string;
  city?: string;
  hub?: boolean;       // AA hub airport
  notes?: string;
}

export const aviationCodes: AviationCode[] = [

  // ── ICAO Airline Designators ──────────────────────────────────────────────
  { code: 'AAL', type: 'icao-airline', name: 'American Airlines', country: 'United States',        notes: 'Used in ATC flight plans and ACARS AirlineCode.ICAO' },
  { code: 'ENY', type: 'icao-airline', name: 'Envoy Air',         country: 'United States',        notes: 'Former American Eagle; regional feeder for AA. Used as AirlineCode.ICAO for MQ flights' },
  { code: 'UAL', type: 'icao-airline', name: 'United Airlines',    country: 'United States',        notes: 'Reference / competitor' },
  { code: 'DAL', type: 'icao-airline', name: 'Delta Air Lines',    country: 'United States',        notes: 'Reference / competitor' },
  { code: 'SWA', type: 'icao-airline', name: 'Southwest Airlines', country: 'United States',        notes: 'Reference / competitor' },
  { code: 'BAW', type: 'icao-airline', name: 'British Airways',    country: 'United Kingdom',       notes: 'AA transatlantic partner / oneworld' },
  { code: 'QFA', type: 'icao-airline', name: 'Qantas',             country: 'Australia',            notes: 'AA Pacific partner / oneworld' },
  { code: 'IBE', type: 'icao-airline', name: 'Iberia',             country: 'Spain',                notes: 'AA partner / oneworld' },
  { code: 'JAL', type: 'icao-airline', name: 'Japan Airlines',     country: 'Japan',                notes: 'AA Pacific partner / oneworld' },

  // ── IATA Airline Codes ────────────────────────────────────────────────────
  { code: 'AA', type: 'iata-airline', name: 'American Airlines', country: 'United States', notes: 'Used in ticketing, FOS, FlightPlan XML, ACARS AirlineCode.IATA' },
  { code: 'MQ', type: 'iata-airline', name: 'Envoy Air',         country: 'United States', notes: 'Regional feeder (former American Eagle). Used in soar-mq-* topic names and FOS entries' },
  { code: 'UA', type: 'iata-airline', name: 'United Airlines',   country: 'United States', notes: 'Reference' },
  { code: 'DL', type: 'iata-airline', name: 'Delta Air Lines',   country: 'United States', notes: 'Reference' },
  { code: 'WN', type: 'iata-airline', name: 'Southwest Airlines',country: 'United States', notes: 'Reference' },
  { code: 'BA', type: 'iata-airline', name: 'British Airways',   country: 'United Kingdom',notes: 'oneworld partner' },
  { code: 'QF', type: 'iata-airline', name: 'Qantas',            country: 'Australia',     notes: 'oneworld partner' },
  { code: 'IB', type: 'iata-airline', name: 'Iberia',            country: 'Spain',         notes: 'oneworld partner' },
  { code: 'JL', type: 'iata-airline', name: 'Japan Airlines',    country: 'Japan',         notes: 'oneworld partner' },

  // ── ICAO Airport Location Indicators ─────────────────────────────────────
  { code: 'KDFW', type: 'icao-airport', name: 'Dallas/Fort Worth International',           country: 'USA', city: 'Dallas/Fort Worth, TX', hub: true,  notes: 'AA global headquarters and primary hub. OCC and dispatch center located here.' },
  { code: 'KLAX', type: 'icao-airport', name: 'Los Angeles International',                 country: 'USA', city: 'Los Angeles, CA',        hub: true,  notes: 'AA Pacific hub' },
  { code: 'KORD', type: 'icao-airport', name: "O'Hare International",                      country: 'USA', city: 'Chicago, IL',             hub: true,  notes: 'AA major hub' },
  { code: 'KJFK', type: 'icao-airport', name: 'John F. Kennedy International',             country: 'USA', city: 'New York (Queens), NY',   hub: true,  notes: 'AA New York hub and transatlantic gateway' },
  { code: 'KMIA', type: 'icao-airport', name: 'Miami International',                       country: 'USA', city: 'Miami, FL',               hub: true,  notes: 'AA Latin America and Caribbean hub' },
  { code: 'KPHX', type: 'icao-airport', name: 'Phoenix Sky Harbor International',          country: 'USA', city: 'Phoenix, AZ',             hub: true,  notes: 'AA hub (former US Airways)' },
  { code: 'KPHL', type: 'icao-airport', name: 'Philadelphia International',                country: 'USA', city: 'Philadelphia, PA',        hub: true,  notes: 'AA hub and transatlantic gateway (former US Airways)' },
  { code: 'KCLT', type: 'icao-airport', name: 'Charlotte Douglas International',           country: 'USA', city: 'Charlotte, NC',           hub: true,  notes: 'AA hub (former US Airways, busiest US Airways hub)' },
  { code: 'KDCA', type: 'icao-airport', name: 'Ronald Reagan Washington National',         country: 'USA', city: 'Arlington, VA',           hub: false, notes: 'AA key station; slot-controlled airport' },
  { code: 'KBOS', type: 'icao-airport', name: 'Boston Logan International',                country: 'USA', city: 'Boston, MA',              hub: false, notes: 'Major AA station; NE gateway' },
  { code: 'KLAS', type: 'icao-airport', name: 'Harry Reid International',                  country: 'USA', city: 'Las Vegas, NV',           hub: false, notes: 'Commonly used as alternate airport in ACARS DPR diversion plans' },
  { code: 'KDEN', type: 'icao-airport', name: 'Denver International',                      country: 'USA', city: 'Denver, CO',              hub: false, notes: 'Major AA station; key interchange point' },
  { code: 'KSFO', type: 'icao-airport', name: 'San Francisco International',               country: 'USA', city: 'San Francisco, CA',       hub: false, notes: 'Major AA station' },
  { code: 'KSEA', type: 'icao-airport', name: 'Seattle-Tacoma International',              country: 'USA', city: 'Seattle, WA',             hub: false, notes: 'Major AA station; example departure in ACARS XSD documentation' },
  { code: 'KAUS', type: 'icao-airport', name: 'Austin-Bergstrom International',            country: 'USA', city: 'Austin, TX',              hub: false, notes: 'AA station; example arrival airport used in ACARS schema samples' },
  { code: 'KIAH', type: 'icao-airport', name: 'George Bush Intercontinental',              country: 'USA', city: 'Houston, TX',             hub: false, notes: 'Major AA station' },
  { code: 'KMSP', type: 'icao-airport', name: 'Minneapolis-Saint Paul International',      country: 'USA', city: 'Minneapolis, MN',         hub: false, notes: 'Major AA station' },
  { code: 'KATL', type: 'icao-airport', name: 'Hartsfield-Jackson Atlanta International',  country: 'USA', city: 'Atlanta, GA',             hub: false, notes: 'Major AA station; world\'s busiest airport' },
  { code: 'KSLC', type: 'icao-airport', name: 'Salt Lake City International',              country: 'USA', city: 'Salt Lake City, UT',      hub: false, notes: 'AA station' },
  { code: 'KEWR', type: 'icao-airport', name: 'Newark Liberty International',              country: 'USA', city: 'Newark, NJ',              hub: false, notes: 'AA New York area station' },
  { code: 'EGLL', type: 'icao-airport', name: 'London Heathrow',                           country: 'UK',  city: 'London, England',         hub: false, notes: 'AA major transatlantic destination; oneworld partners BA/IB' },
  { code: 'LEMD', type: 'icao-airport', name: 'Adolfo Suárez Madrid-Barajas',              country: 'ESP', city: 'Madrid, Spain',           hub: false, notes: 'AA transatlantic destination; Iberia hub' },
  { code: 'LFPG', type: 'icao-airport', name: 'Charles de Gaulle',                         country: 'FRA', city: 'Paris, France',           hub: false, notes: 'AA transatlantic destination' },
  { code: 'EDDF', type: 'icao-airport', name: 'Frankfurt am Main',                         country: 'DEU', city: 'Frankfurt, Germany',      hub: false, notes: 'AA transatlantic destination' },
  { code: 'RJTT', type: 'icao-airport', name: 'Tokyo Haneda',                              country: 'JPN', city: 'Tokyo, Japan',            hub: false, notes: 'AA Pacific destination; JAL hub' },
  { code: 'YSSY', type: 'icao-airport', name: 'Sydney Kingsford Smith',                    country: 'AUS', city: 'Sydney, Australia',       hub: false, notes: 'AA Pacific destination; Qantas hub' },
  { code: 'ZSPD', type: 'icao-airport', name: 'Shanghai Pudong International',             country: 'CHN', city: 'Shanghai, China',         hub: false, notes: 'AA Pacific destination' },

  // ── IATA Airport Codes ────────────────────────────────────────────────────
  { code: 'DFW', type: 'iata-airport', name: 'Dallas/Fort Worth International',            country: 'USA', city: 'Dallas/Fort Worth, TX',   hub: true,  notes: 'AA HQ; primary dispatch hub. Used in OpsHub flight events and ACARS FlightKey examples.' },
  { code: 'LAX', type: 'iata-airport', name: 'Los Angeles International',                  country: 'USA', city: 'Los Angeles, CA',          hub: true  },
  { code: 'ORD', type: 'iata-airport', name: "O'Hare International",                       country: 'USA', city: 'Chicago, IL',              hub: true  },
  { code: 'JFK', type: 'iata-airport', name: 'John F. Kennedy International',              country: 'USA', city: 'New York, NY',             hub: true  },
  { code: 'MIA', type: 'iata-airport', name: 'Miami International',                        country: 'USA', city: 'Miami, FL',                hub: true  },
  { code: 'PHX', type: 'iata-airport', name: 'Phoenix Sky Harbor International',           country: 'USA', city: 'Phoenix, AZ',              hub: true  },
  { code: 'PHL', type: 'iata-airport', name: 'Philadelphia International',                 country: 'USA', city: 'Philadelphia, PA',         hub: true  },
  { code: 'CLT', type: 'iata-airport', name: 'Charlotte Douglas International',            country: 'USA', city: 'Charlotte, NC',            hub: true  },
  { code: 'DCA', type: 'iata-airport', name: 'Ronald Reagan Washington National',          country: 'USA', city: 'Arlington, VA',            hub: false },
  { code: 'BOS', type: 'iata-airport', name: 'Boston Logan International',                 country: 'USA', city: 'Boston, MA',               hub: false },
  { code: 'LAS', type: 'iata-airport', name: 'Harry Reid International',                   country: 'USA', city: 'Las Vegas, NV',            hub: false, notes: 'Common diversion alternate' },
  { code: 'DEN', type: 'iata-airport', name: 'Denver International',                       country: 'USA', city: 'Denver, CO',               hub: false },
  { code: 'SFO', type: 'iata-airport', name: 'San Francisco International',                country: 'USA', city: 'San Francisco, CA',        hub: false },
  { code: 'SEA', type: 'iata-airport', name: 'Seattle-Tacoma International',               country: 'USA', city: 'Seattle, WA',              hub: false },
  { code: 'AUS', type: 'iata-airport', name: 'Austin-Bergstrom International',             country: 'USA', city: 'Austin, TX',               hub: false },
  { code: 'IAH', type: 'iata-airport', name: 'George Bush Intercontinental',               country: 'USA', city: 'Houston, TX',              hub: false },
  { code: 'MSP', type: 'iata-airport', name: 'Minneapolis-Saint Paul International',       country: 'USA', city: 'Minneapolis, MN',          hub: false },
  { code: 'ATL', type: 'iata-airport', name: "Hartsfield-Jackson Atlanta International",   country: 'USA', city: 'Atlanta, GA',              hub: false },
  { code: 'SLC', type: 'iata-airport', name: 'Salt Lake City International',               country: 'USA', city: 'Salt Lake City, UT',       hub: false },
  { code: 'EWR', type: 'iata-airport', name: 'Newark Liberty International',               country: 'USA', city: 'Newark, NJ',               hub: false },
  { code: 'LHR', type: 'iata-airport', name: 'London Heathrow',                            country: 'UK',  city: 'London, England',          hub: false, notes: 'Major transatlantic destination' },
  { code: 'MAD', type: 'iata-airport', name: 'Adolfo Suárez Madrid-Barajas',               country: 'ESP', city: 'Madrid, Spain',            hub: false },
  { code: 'CDG', type: 'iata-airport', name: 'Charles de Gaulle',                          country: 'FRA', city: 'Paris, France',            hub: false },
  { code: 'FRA', type: 'iata-airport', name: 'Frankfurt am Main',                          country: 'DEU', city: 'Frankfurt, Germany',       hub: false },
  { code: 'HND', type: 'iata-airport', name: 'Tokyo Haneda',                               country: 'JPN', city: 'Tokyo, Japan',             hub: false },
  { code: 'SYD', type: 'iata-airport', name: 'Sydney Kingsford Smith',                     country: 'AUS', city: 'Sydney, Australia',        hub: false },
];
