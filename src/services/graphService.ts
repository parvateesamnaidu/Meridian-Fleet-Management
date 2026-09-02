import { GraphNode, GraphEdge, DisruptionCase } from '../types';
import {
  VESSEL_REGISTRY,
  VOYAGE_SCHEDULE,
  AIS_POSITIONS,
  VESSEL_TELEMETRY,
  WEATHER_SNAPSHOTS,
  PORT_CONSTRAINTS,
  CARGO_CONSTRAINTS,
  CREW_CONSTRAINTS,
  CMMS_CONSTRAINTS,
} from '../data/fixtureBundle';

export interface CaseGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  ambiguities: any[];
}

export function buildGraphForCase(disruption: DisruptionCase): CaseGraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const ambiguities: any[] = [];

  const vessel = VESSEL_REGISTRY.find((v) => v.vessel_id === disruption.vessel_id) || {
    vessel_id: disruption.vessel_id,
    vessel_name: disruption.vessel_name,
    imo_number: disruption.imo_number,
    flag: 'LR',
    vessel_class: 'PANAMAX',
    fleet_group: 'FLEET-A',
    edge_agent_version: '4.6.2',
    clock_offset_seconds: '0',
  };

  const voyage = VOYAGE_SCHEDULE.find((voy) => voy.voyage_id === disruption.voyage_id);
  const ais = AIS_POSITIONS.find((a) => a.case_id === disruption.case_id);
  const telemetry = VESSEL_TELEMETRY.find((t) => t.case_id === disruption.case_id);
  const weather = WEATHER_SNAPSHOTS.find((w) => w.case_id === disruption.case_id);
  const portConstraints = PORT_CONSTRAINTS.filter((p) => p.case_id === disruption.case_id);
  const cargo = CARGO_CONSTRAINTS.find((c) => c.case_id === disruption.case_id);
  const crew = CREW_CONSTRAINTS.find((c) => c.case_id === disruption.case_id);
  const cmms = CMMS_CONSTRAINTS.find((m) => m.case_id === disruption.case_id);

  // 1. Vessel Node
  nodes.push({
    id: `vessel:${vessel.vessel_id}`,
    type: 'Vessel',
    label: `${vessel.vessel_name} (${vessel.vessel_id})`,
    properties: { ...vessel },
    status: 'ACTIVE',
  });

  // 2. Disruption Node
  nodes.push({
    id: `disruption:${disruption.case_id}`,
    type: 'Disruption',
    label: `${disruption.case_id}: ${disruption.disruption_type}`,
    properties: {
      severity: disruption.severity,
      event_time: disruption.event_time_utc,
      deadline: disruption.decision_deadline_utc,
      status: disruption.status,
      region: disruption.route_region,
    },
    status: disruption.status,
  });
  edges.push({
    source: `disruption:${disruption.case_id}`,
    target: `vessel:${vessel.vessel_id}`,
    relationship: 'AFFECTS',
    temporal: true,
  });

  // 3. Voyage Node
  if (voyage) {
    nodes.push({
      id: `voyage:${voyage.voyage_id}`,
      type: 'Voyage',
      label: `${voyage.voyage_id} (${voyage.origin_port} → ${voyage.destination_port})`,
      properties: { ...voyage },
      status: voyage.voyage_status,
    });
    edges.push({
      source: `vessel:${vessel.vessel_id}`,
      target: `voyage:${voyage.voyage_id}`,
      relationship: 'OPERATES_VOYAGE',
    });

    // 4. Port Node
    nodes.push({
      id: `port:${voyage.destination_port}`,
      type: 'Port',
      label: `Port: ${voyage.destination_port}`,
      properties: { code: voyage.destination_port, scheduled_eta: voyage.scheduled_eta_utc },
    });
    edges.push({
      source: `voyage:${voyage.voyage_id}`,
      target: `port:${voyage.destination_port}`,
      relationship: 'DESTINED_FOR',
    });
  }

  // 5. AIS Observation Node
  if (ais) {
    const isConflict = ais.quality === 'IDENTITY_CONFLICT' || disruption.case_id === 'MFD-L004';
    nodes.push({
      id: `obs:ais:${ais.provider_record_id}`,
      type: 'Observation',
      label: `AIS Obs: ${ais.reported_vessel_name} (${ais.reported_imo})`,
      properties: { ...ais },
      freshness: 'FRESH',
      status: isConflict ? 'IDENTITY_CONFLICT' : 'VALID',
    });
    edges.push({
      source: `vessel:${vessel.vessel_id}`,
      target: `obs:ais:${ais.provider_record_id}`,
      relationship: 'HAS_OBSERVED_POSITION',
      properties: { sog_knots: ais.sog_knots, cog_degrees: ais.cog_degrees },
    });

    if (isConflict) {
      const ambId = `amb:identity:${disruption.case_id}`;
      nodes.push({
        id: ambId,
        type: 'Ambiguity',
        label: `Ambiguity: Mismatched Identity (${ais.reported_imo} vs ${vessel.imo_number})`,
        properties: {
          conflict_type: 'identity_mismatch',
          internal_imo: vessel.imo_number,
          reported_imo: ais.reported_imo,
          confidence_score: 0.62,
          resolution: 'UNRESOLVED - Requires Fleet Data Steward',
        },
      });
      ambiguities.push({
        ambiguity_id: ambId,
        conflict_type: 'identity_mismatch',
        internal_imo: vessel.imo_number,
        reported_imo: ais.reported_imo,
        status: 'UNRESOLVED',
      });
      edges.push({
        source: `vessel:${vessel.vessel_id}`,
        target: ambId,
        relationship: 'HAS_CONFLICT',
      });
      edges.push({
        source: ambId,
        target: `obs:ais:${ais.provider_record_id}`,
        relationship: 'INVOLVES_OBSERVATION',
      });
    }
  }

  // 6. Vessel Telemetry Observation
  if (telemetry) {
    const isSkew = telemetry.quality === 'CLOCK_SKEW' || disruption.case_id === 'MFD-L013';
    const isAnomaly = telemetry.quality === 'CRITICAL_ANOMALY' || disruption.case_id === 'MFD-L003';
    nodes.push({
      id: `obs:telem:${telemetry.sequence_no}`,
      type: 'Observation',
      label: `Telemetry: Load ${telemetry.engine_load_pct}% | Bearing ${telemetry.main_engine_bearing_temp_c}°C`,
      properties: { ...telemetry },
      freshness: isSkew ? 'DEGRADING' : 'FRESH',
      status: isAnomaly ? 'CRITICAL_ANOMALY' : isSkew ? 'CLOCK_SKEW' : 'GOOD',
    });
    edges.push({
      source: `vessel:${vessel.vessel_id}`,
      target: `obs:telem:${telemetry.sequence_no}`,
      relationship: 'REPORTS_TELEMETRY',
    });
  }

  // 7. Weather Snapshot Observation
  if (weather) {
    nodes.push({
      id: `obs:weather:${weather.forecast_id}`,
      type: 'Observation',
      label: `Weather: ${weather.wind_knots} kts | Waves ${weather.wave_height_m}m (${weather.risk})`,
      properties: { ...weather },
      freshness: 'FRESH',
      status: weather.risk,
    });
    if (voyage) {
      edges.push({
        source: `voyage:${voyage.voyage_id}`,
        target: `obs:weather:${weather.forecast_id}`,
        relationship: 'INTERSECTS_WEATHER',
      });
    }
  } else if (disruption.case_id === 'MFD-L006') {
    nodes.push({
      id: 'obs:weather:unavailable',
      type: 'Observation',
      label: 'Weather Provider: UNAVAILABLE',
      properties: { status: 'MISSING', reason: 'Provider timeout' },
      freshness: 'MISSING',
      status: 'UNAVAILABLE',
    });
    if (voyage) {
      edges.push({
        source: `voyage:${voyage.voyage_id}`,
        target: 'obs:weather:unavailable',
        relationship: 'MISSING_OBSERVATION',
      });
    }
  }

  // 8. Port Constraints & Berth Conflicts
  if (portConstraints.length > 0) {
    if (portConstraints.length > 1 && disruption.case_id === 'MFD-L011') {
      // Conflicting berth evidence
      const p1 = portConstraints[0];
      const p2 = portConstraints[1];
      const n1Id = `obs:port:${p1.constraint_id}`;
      const n2Id = `obs:port:${p2.constraint_id}`;
      nodes.push({
        id: n1Id,
        type: 'Observation',
        label: `Port API: Berth ${p1.berth_state} (${p1.port_code})`,
        properties: { ...p1 },
        freshness: 'FRESH',
      });
      nodes.push({
        id: n2Id,
        type: 'Observation',
        label: `Port Notice: Berth ${p2.berth_state} (${p2.port_code})`,
        properties: { ...p2 },
        freshness: 'FRESH',
      });
      const ambId = `amb:berth:${disruption.case_id}`;
      nodes.push({
        id: ambId,
        type: 'Ambiguity',
        label: `Conflict: API ${p1.berth_state} vs Notice ${p2.berth_state}`,
        properties: {
          conflict_type: 'conflicting_berth_evidence',
          source_1: p1.source,
          state_1: p1.berth_state,
          source_2: p2.source,
          state_2: p2.berth_state,
          resolution: 'UNRESOLVED - Signed Notice Precedence Requires Verification',
        },
      });
      ambiguities.push({
        ambiguity_id: ambId,
        conflict_type: 'conflicting_berth_evidence',
        details: `${p1.source} reports ${p1.berth_state} while ${p2.source} reports ${p2.berth_state}`,
        status: 'UNRESOLVED',
      });
      edges.push({
        source: n1Id,
        target: ambId,
        relationship: 'CONFLICTS_WITH',
      });
      edges.push({
        source: n2Id,
        target: ambId,
        relationship: 'CONFLICTS_WITH',
      });
      edges.push({
        source: `port:${p1.port_code}`,
        target: ambId,
        relationship: 'HAS_PORT_AMBIGUITY',
      });
    } else {
      portConstraints.forEach((pc) => {
        const isStale = pc.source_update_time.includes('03:42') || disruption.case_id === 'MFD-L005';
        nodes.push({
          id: `obs:port:${pc.constraint_id}`,
          type: 'Constraint',
          label: `Port Constraint: ${pc.port_code} (${pc.berth_state})`,
          properties: { ...pc },
          freshness: isStale ? 'STALE' : 'FRESH',
        });
        edges.push({
          source: `port:${pc.port_code}`,
          target: `obs:port:${pc.constraint_id}`,
          relationship: 'CONSTRAINED_BY',
        });
      });
    }
  }

  // 9. CMMS Constraint
  if (cmms && cmms.condition === 'CRITICAL_HOLD') {
    nodes.push({
      id: `cmms:${cmms.work_order_id}`,
      type: 'Constraint',
      label: `CMMS Hold: ${cmms.equipment} (${cmms.condition})`,
      properties: { ...cmms },
      status: 'CRITICAL_HOLD',
    });
    edges.push({
      source: `vessel:${vessel.vessel_id}`,
      target: `cmms:${cmms.work_order_id}`,
      relationship: 'HAS_MAINTENANCE_HOLD',
    });
  }

  // 10. Cargo Constraint
  if (cargo) {
    nodes.push({
      id: `cargo:${cargo.customer_id}`,
      type: 'Constraint',
      label: `Cargo: ${cargo.customer_id} (Reefer: ${cargo.reefer_cargo} | Haz: ${cargo.hazardous_goods})`,
      properties: { ...cargo },
    });
    if (voyage) {
      edges.push({
        source: `voyage:${voyage.voyage_id}`,
        target: `cargo:${cargo.customer_id}`,
        relationship: 'CARRIES_CARGO',
      });
    }
  }

  // 11. Active Policy Node
  nodes.push({
    id: 'policy:v4.1',
    type: 'Policy',
    label: 'Fleet Policy v4.1 (ACTIVE)',
    properties: {
      version: '4.1',
      status: 'ACTIVE',
      rule_01: 'Safety/CMMS/Port override commercial priority',
      rule_02: 'No autonomous navigation commands',
      rule_05: 'CMMS hold requires Chief Engineer release',
    },
  });
  edges.push({
    source: `disruption:${disruption.case_id}`,
    target: 'policy:v4.1',
    relationship: 'GOVERNED_BY',
  });

  return { nodes, edges, ambiguities };
}
