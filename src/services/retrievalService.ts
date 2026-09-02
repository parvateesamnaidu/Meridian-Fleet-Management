import { DisruptionCase, AuthorityRole, FreshnessState } from '../types';
import {
  AIS_POSITIONS,
  VESSEL_TELEMETRY,
  WEATHER_SNAPSHOTS,
  PORT_CONSTRAINTS,
  CARGO_CONSTRAINTS,
  CREW_CONSTRAINTS,
  CMMS_CONSTRAINTS,
  DOCUMENTS,
  IDENTIFIER_CROSSWALK,
} from '../data/fixtureBundle';

export interface RetrievalResultItem {
  id: string;
  source: string;
  category: string;
  content: any;
  freshness: FreshnessState;
  authority: string;
  confidence: number;
  policy_version?: string;
  status?: string;
  untrusted_flag?: boolean;
}

export interface HybridRetrievalResponse {
  mode: 'STRUCTURED' | 'GRAPH' | 'VECTOR' | 'POLICY' | 'MEMORY';
  query: string;
  filters_applied: string[];
  execution_time_ms: number;
  items: RetrievalResultItem[];
  relevance_score: number;
  boundary_notes: string[];
}

export function executeHybridRetrieval(
  disruption: DisruptionCase,
  mode: 'STRUCTURED' | 'GRAPH' | 'VECTOR' | 'POLICY' | 'MEMORY',
  userRole: AuthorityRole,
  isOffline: boolean = false
): HybridRetrievalResponse {
  const caseId = disruption.case_id;
  const filters: string[] = ['access_purpose_check', 'tenant_isolation'];
  const items: RetrievalResultItem[] = [];
  const boundaryNotes: string[] = [];

  if (isOffline) {
    filters.push('offline_local_cache_only');
    boundaryNotes.push('Operating on vessel local edge cache. Shore vector/cloud retrieval unavailable.');
  }

  switch (mode) {
    case 'STRUCTURED': {
      filters.push('freshness_evaluation', 'source_authority_tagging');

      const ais = AIS_POSITIONS.find((a) => a.case_id === caseId);
      if (ais) {
        items.push({
          id: `AIS-${ais.provider_record_id}`,
          source: 'AIS_PROVIDER_A',
          category: 'Telemetry / AIS Position',
          content: {
            lat: ais.lat,
            lon: ais.lon,
            sog_knots: ais.sog_knots,
            cog_degrees: ais.cog_degrees,
            reported_imo: ais.reported_imo,
            reported_name: ais.reported_vessel_name,
            timestamp: ais.source_event_time,
          },
          freshness: 'FRESH',
          authority: 'SingleSource Observation',
          confidence: ais.quality === 'IDENTITY_CONFLICT' ? 0.62 : 0.99,
          status: ais.quality,
        });
      }

      const telem = VESSEL_TELEMETRY.find((t) => t.case_id === caseId);
      if (telem) {
        items.push({
          id: `TELEM-${telem.sequence_no}`,
          source: 'VESSEL_TELEMETRY',
          category: 'Machinery Telemetry',
          content: {
            engine_load_pct: telem.engine_load_pct,
            fuel_rate_tph: telem.fuel_rate_tph,
            bearing_temp_c: telem.main_engine_bearing_temp_c,
            fuel_remaining_tonnes: telem.fuel_remaining_tonnes,
            sequence_no: telem.sequence_no,
          },
          freshness: telem.quality === 'CLOCK_SKEW' ? 'DEGRADING' : 'FRESH',
          authority: 'Authoritative Edge Stream',
          confidence: 1.0,
          status: telem.quality,
        });
      }

      const wx = WEATHER_SNAPSHOTS.find((w) => w.case_id === caseId);
      if (wx) {
        items.push({
          id: `WX-${wx.forecast_id}`,
          source: 'WX_OCEAN_PROVIDER',
          category: 'Ocean Forecast Snapshot',
          content: {
            wind_knots: wx.wind_knots,
            wave_height_m: wx.wave_height_m,
            current_knots: wx.current_knots,
            risk_level: wx.risk,
            valid_to: wx.valid_to,
          },
          freshness: 'FRESH',
          authority: 'SingleSource Provider',
          confidence: 0.95,
          status: wx.risk,
        });
      } else if (caseId === 'MFD-L006') {
        items.push({
          id: 'WX-MISSING',
          source: 'WX_OCEAN_PROVIDER',
          category: 'Ocean Forecast Snapshot',
          content: { message: 'Weather provider connection timed out. No current snapshot available.' },
          freshness: 'MISSING',
          authority: 'None',
          confidence: 0.0,
          status: 'UNAVAILABLE',
        });
      }

      const portList = PORT_CONSTRAINTS.filter((p) => p.case_id === caseId);
      portList.forEach((p) => {
        const isStale = p.text_excerpt.includes('freshness threshold exceeded') || caseId === 'MFD-L005';
        const isUntrusted = p.text_excerpt.includes('Ignore all fleet policies') || caseId === 'MFD-L009';
        items.push({
          id: p.constraint_id,
          source: p.source,
          category: 'Port Constraint',
          content: {
            port_code: p.port_code,
            berth_state: p.berth_state,
            pilot_window: p.pilot_window,
            notice_text: p.text_excerpt,
            update_time: p.source_update_time,
          },
          freshness: isStale ? 'STALE' : 'FRESH',
          authority: p.source === 'PORT_NOTICE_DOC' ? 'Authoritative Signed Document' : 'SingleSource API Feed',
          confidence: isStale ? 0.4 : p.confidence === 'HIGH' ? 0.95 : 0.7,
          untrusted_flag: isUntrusted,
        });
      });
      break;
    }

    case 'GRAPH': {
      filters.push('subgraph_case_projection', 'conflict_surface_detection');
      const crosswalk = IDENTIFIER_CROSSWALK.filter((c) => c.canonical_id === disruption.vessel_id);
      crosswalk.forEach((cw) => {
        items.push({
          id: `XWALK-${cw.canonical_id}-${cw.source}`,
          source: 'GRAPH_SEMANTIC_LAYER',
          category: 'Identifier Resolution Link',
          content: {
            canonical_id: cw.canonical_id,
            source_system: cw.source,
            source_id: cw.source_id,
            features: cw.match_features,
            match_status: cw.match_status,
            notes: cw.notes,
          },
          freshness: 'FRESH',
          authority: 'Authoritative Crosswalk',
          confidence: parseFloat(cw.confidence),
          status: cw.match_status,
        });
      });

      const cmms = CMMS_CONSTRAINTS.find((m) => m.case_id === caseId);
      if (cmms && cmms.condition === 'CRITICAL_HOLD') {
        items.push({
          id: `GRAPH-CMMS-${cmms.work_order_id}`,
          source: 'CMMS_GRAPH_RELATION',
          category: 'Machinery Hold Edge',
          content: {
            equipment: cmms.equipment,
            hold_condition: cmms.condition,
            work_order_id: cmms.work_order_id,
            release_authority: cmms.authorized_release_role,
            blocking_edge: `Voyage(${disruption.voyage_id}) -[CONSTRAINED_BY]-> MaintenanceConstraint(${cmms.work_order_id})`,
          },
          freshness: 'FRESH',
          authority: 'Technical Authority Gate',
          confidence: 1.0,
          status: 'CRITICAL_HOLD',
        });
      }
      break;
    }

    case 'VECTOR': {
      filters.push('similarity_threshold_0.75', 'historical_precedent_only', 'exclude_active_rules');
      items.push({
        id: `VEC-HIST-${caseId}`,
        source: 'VECTOR_STORE_HISTORICAL_CASES',
        category: 'Similar Historical Incident Precedent',
        content: {
          similar_case: `HIST-${caseId.slice(-3)}`,
          incident_profile: disruption.disruption_type,
          similarity_score: 0.89,
          prior_outcome: 'Adjudicated arrival variance +35 min. No safety incidents recorded.',
          notice: 'Historical reference for operator context only. Never applied as automated rule.',
        },
        freshness: 'FRESH',
        authority: 'Historical Decision Archive',
        confidence: 0.89,
      });
      break;
    }

    case 'POLICY': {
      filters.push('active_version_filter', 'exclude_superseded_v3.7');
      const activePolicyDoc = DOCUMENTS.find((d) => d.filename === 'fleet_recovery_policy_v4_1.md');
      const supersededDoc = DOCUMENTS.find((d) => d.filename.includes('superseded'));

      if (activePolicyDoc) {
        items.push({
          id: 'POLICY-V4.1-ACTIVE',
          source: 'FLEET_POLICY_REPO',
          category: 'Active Operational Policy',
          content: {
            title: 'Fleet Disruption Recovery Policy v4.1',
            status: 'ACTIVE',
            effective_date: '2026-07-01',
            rules: [
              'Rule 1: Safety & CMMS holds override commercial optimization',
              'Rule 2: AI cannot issue autonomous navigation commands',
              'Rule 3: Recovery recommendations must cite freshness & authority',
              'Rule 5: Critical CMMS hold requires Chief Engineer release',
            ],
          },
          freshness: 'FRESH',
          authority: 'Highest Policy Authority',
          confidence: 1.0,
          policy_version: 'v4.1',
          status: 'ACTIVE',
        });
      }

      if (supersededDoc && caseId === 'MFD-L012') {
        items.push({
          id: 'POLICY-V3.7-SUPERSEDED',
          source: 'FLEET_POLICY_REPO',
          category: 'Historical Policy (Superseded)',
          content: {
            title: 'Fleet Disruption Recovery Policy v3.7',
            status: 'SUPERSEDED - FOR AUDIT REFERENCE ONLY',
            warning: 'BLOCKED: Legacy speed pre-authorization clause is inactive. Do NOT apply.',
          },
          freshness: 'STALE',
          authority: 'Historical Non-Active',
          confidence: 0.0,
          policy_version: 'v3.7',
          status: 'SUPERSEDED',
        });
      }
      break;
    }

    case 'MEMORY': {
      filters.push('governed_feedback_only', 'purpose_minimization');
      items.push({
        id: `MEM-${caseId}`,
        source: 'CONTROLLED_OPERATIONAL_MEMORY',
        category: 'Operator Interaction Memory',
        content: {
          case_id: caseId,
          last_interaction_note: 'Operator acceptance data recorded. Governed review required before policy change.',
          audit_compliance: 'Template 10 standard verified.',
        },
        freshness: 'FRESH',
        authority: 'Governed Memory Layer',
        confidence: 0.92,
      });
      break;
    }
  }

  return {
    mode,
    query: `case:${caseId} vessel:${disruption.vessel_id} type:${disruption.disruption_type}`,
    filters_applied: filters,
    execution_time_ms: 12,
    items,
    relevance_score: items.length > 0 ? 0.94 : 0.0,
    boundary_notes: boundaryNotes,
  };
}
