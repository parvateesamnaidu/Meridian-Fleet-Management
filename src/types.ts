export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DisruptionType =
  | 'PORT_CONGESTION'
  | 'SEVERE_WEATHER'
  | 'MACHINERY_ANOMALY'
  | 'IDENTITY_MISMATCH'
  | 'PORT_CONSTRAINT_STALE'
  | 'WEATHER_SOURCE_UNAVAILABLE'
  | 'DUPLICATE_EVENT_REPLAY'
  | 'UNAUTHORIZED_COMMIT_ATTEMPT'
  | 'UNTRUSTED_PORT_MESSAGE'
  | 'AI_ASSISTANCE_OUTAGE'
  | 'CONFLICTING_BERTH_EVIDENCE'
  | 'SUPERSEDED_POLICY_TRAP'
  | 'CLOCK_DRIFT'
  | 'SATELLITE_BLACKOUT'
  | 'RECONNECT_RECONCILIATION';

export type ConnectivityState = 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'RECONNECTING';
export type FreshnessState = 'FRESH' | 'DEGRADING' | 'STALE' | 'MISSING' | 'UNKNOWN' | 'N/A';
export type SourceHealthState = 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' | 'RECOVERING';

export type AuthorityRole =
  | 'MASTER'
  | 'CHIEF_ENGINEER'
  | 'FLEET_CONTROLLER'
  | 'SAFETY_OFFICER'
  | 'COMMERCIAL_PLANNER'
  | 'FLEET_DATA_STEWARD'
  | 'AI_AGENT';

export type RecoveryOptionType =
  | 'CONTINUE'
  | 'SLOW_SPEED'
  | 'PORT_HOLD'
  | 'REROUTE'
  | 'SHORE_REVIEW'
  | 'TECHNICAL_STANDBY';

export type FeasibilityResult = 'FEASIBLE' | 'INFEASIBLE' | 'CONDITIONAL' | 'REQUIRES_HUMAN';

export interface DisruptionCase {
  case_id: string;
  vessel_id: string;
  imo_number: string;
  vessel_name: string;
  voyage_id: string;
  route_region: string;
  disruption_type: DisruptionType;
  severity: Severity;
  event_time_utc: string;
  decision_deadline_utc: string;
  destination_port: string;
  cargo_priority: 'NORMAL' | 'HIGH';
  connectivity_state: ConnectivityState;
  expected_authority: string;
  status: 'ACTIVE' | 'RESOLVED' | 'UNDER_REVIEW';
}

export interface VesselRegistryEntry {
  vessel_id: string;
  imo_number: string;
  vessel_name: string;
  flag: string;
  vessel_class: string;
  fleet_group: string;
  edge_agent_version: string;
  clock_offset_seconds: string;
}

export interface VoyageScheduleEntry {
  voyage_id: string;
  vessel_id: string;
  origin_port: string;
  destination_port: string;
  scheduled_eta_utc: string;
  commercial_priority: 'NORMAL' | 'HIGH';
  charter_customer: string;
  voyage_status: 'UNDERWAY' | 'BERTHED' | 'DELAYED';
}

export interface AisPosition {
  case_id: string;
  source: string;
  provider_record_id: string;
  reported_imo: string;
  reported_vessel_name: string;
  lat: number;
  lon: number;
  sog_knots: number;
  cog_degrees: number;
  source_event_time: string;
  source_update_time: string;
  quality: string;
}

export interface VesselTelemetry {
  case_id: string;
  vessel_id: string;
  source: string;
  engine_load_pct: number;
  fuel_rate_tph: number;
  main_engine_bearing_temp_c: number;
  fuel_remaining_tonnes: number;
  source_event_time: string;
  source_update_time: string;
  sequence_no: number;
  quality: string;
}

export interface WeatherSnapshot {
  case_id: string;
  source: string;
  forecast_id: string;
  valid_from: string;
  valid_to: string;
  wind_knots: number;
  wave_height_m: number;
  current_knots: number;
  risk: 'NORMAL' | 'ELEVATED' | 'SEVERE';
  source_update_time: string;
}

export interface PortConstraint {
  case_id: string;
  source: string;
  port_code: string;
  constraint_id: string;
  berth_state: string;
  pilot_window: string;
  confidence: string;
  source_update_time: string;
  text_excerpt: string;
  status: string;
}

export interface CargoConstraint {
  case_id: string;
  voyage_id: string;
  customer_id: string;
  hazardous_goods: string;
  reefer_cargo: string;
  delivery_window_utc: string;
  priority: string;
  source_update_time: string;
}

export interface CrewConstraint {
  case_id: string;
  vessel_id: string;
  watch_team: string;
  master_available: string;
  chief_engineer_available: string;
  rest_hours_constraint: 'NONE' | 'ACTIVE';
  source_update_time: string;
}

export interface CmmsConstraint {
  case_id: string;
  vessel_id: string;
  equipment: string;
  condition: string;
  work_order_id: string;
  authorized_release_role: string;
  source_update_time: string;
}

export interface ConnectivityEvent {
  case_id: string;
  vessel_id: string;
  state: ConnectivityState;
  outage_minutes: number;
  bandwidth_kbps: number;
  last_healthy_time: string;
  source: string;
}

export interface SourceHealthEvent {
  case_id: string;
  source: string;
  state: SourceHealthState;
  freshness_state: FreshnessState;
  detail: string;
  observed_at: string;
}

export interface LiveEventStreamItem {
  case_id: string;
  event_id: string;
  event_type: string;
  sequence_no: number;
  event_time: string;
  ingestion_time: string;
  dedupe_key: string;
  source: string;
}

export interface DocumentItem {
  filename: string;
  content: string;
}

export interface IdentifierCrosswalkItem {
  canonical_type: string;
  canonical_id: string;
  source: string;
  source_id: string;
  match_features: string;
  match_status: 'CONFIRMED' | 'AMBIGUOUS' | 'UNRESOLVED';
  confidence: string;
  notes: string;
}

export interface ConflictingTerm {
  term: string;
  source_or_team: string;
  meaning: string;
  must_not_be_confused_with: string;
}

export interface RoleAuthorization {
  role: AuthorityRole;
  view_operational_context: string;
  request_ai_assistance: string;
  approve_recovery_plan: string;
  authorize_navigation_change: string;
  release_critical_maintenance_hold: string;
  override_fleet_policy: string;
  commit_operational_action: string;
}

export interface GoldenScenario {
  scenario_id: string;
  case_id: string;
  title: string;
  fixture_version: string;
  adjudication_status: string;
  expected_behavior: string;
  must_test: boolean;
  category?: string;
  test_focus?: string;
  expected_outcome?: string;
}

export interface DecisionTrace {
  trace_id: string;
  decision_id: string;
  task: string;
  case_id: string;
  voyage_id?: string;
  vessel_id?: string;
  timestamp_utc: string;
  actor: {
    role: AuthorityRole;
    location: 'VESSEL' | 'SHORE';
    user_email?: string;
  };
  context_snapshot: {
    context_id: string;
    as_of_time: string;
    connectivity_state: ConnectivityState;
    conflicts: any[];
    source_health: any[];
    clock_normalization: {
      vessel_clock_offset_ms: number;
      shore_ntp_reachable: boolean;
      normalized_causal_order_available: boolean;
    };
  };
  retrievals: {
    mode: string;
    filters: string[];
    count: number;
    items_summary?: string;
  }[];
  source_evidence: {
    source_id: string;
    record_id: string;
    event_time: string;
    freshness: FreshnessState;
    authority_level: string;
    excerpt?: string;
  }[];
  policy_checks: {
    rule_id: string;
    result: 'PASS' | 'FAIL' | 'BLOCKED';
    policy_version: string;
    details?: string;
  }[];
  versions: {
    model: string;
    prompt: string;
    retrieval_policy: string;
    semantic_model: string;
    ontology: string;
    policy_bundle: string;
  };
  recommendation: string | null;
  concise_rationale: string;
  uncertainty_or_abstention: string;
  human_or_technical_decision: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED' | 'ESCALATED';
    role: AuthorityRole;
    action_description: string;
    authorized: boolean;
    reason?: string;
    timestamp_utc: string;
  };
  operator_interaction?: {
    interaction_type: 'ACCEPT' | 'MODIFY' | 'REJECT' | 'IGNORED';
    note: string;
  };
  governed_learning_proposal?: {
    status: 'NO_AUTO_UPDATE' | 'SUBMITTED_FOR_REVIEW';
    note: string;
  };
}

export interface CandidateOption {
  option_id: string;
  type: RecoveryOptionType;
  title: string;
  description: string;
  estimated_delay_hours: number;
  commercial_cost_index: number;
  feasibility: FeasibilityResult;
  blocking_reasons: string[];
  conditional_factors: string[];
  material_evidence_refs: string[];
  uncertainty_score: number; // 0 to 100
  required_approving_role: AuthorityRole;
  is_autonomous_command: false; // Must ALWAYS be false
}

export interface GraphNode {
  id: string;
  type: 'Vessel' | 'Voyage' | 'Disruption' | 'Port' | 'Observation' | 'Constraint' | 'Policy' | 'Ambiguity' | 'Authority';
  label: string;
  properties: Record<string, any>;
  freshness?: FreshnessState;
  status?: string;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  temporal?: boolean;
  properties?: Record<string, any>;
}

export interface AcceptanceTestResult {
  test_id: string;
  name: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'RUNNING' | 'UNTESTED';
  observed_details: string;
  hard_gate: boolean;
}

export interface UserProfile {
  email: string;
  name: string;
  avatar: string;
  currentRole: AuthorityRole;
  location: 'SHORE' | 'VESSEL';
}
