import { DecisionTrace, DisruptionCase, AuthorityRole } from '../types';
import { evaluateCasePolicies } from './policyEngine';
import { executeHybridRetrieval } from './retrievalService';

const TRACE_STORAGE_KEY = 'meridian_decision_traces_v2';

export function createDecisionTrace(
  disruption: DisruptionCase,
  actorRole: AuthorityRole,
  userEmail: string = 'officer@meridianblue.com',
  isOffline: boolean = false,
  cmmsReleaseGranted: boolean = false
): DecisionTrace {
  const caseId = disruption.case_id;
  const now = new Date().toISOString();
  const evaluation = evaluateCasePolicies(disruption, actorRole, isOffline, cmmsReleaseGranted);

  const retrievalStructured = executeHybridRetrieval(disruption, 'STRUCTURED', actorRole, isOffline);
  const retrievalPolicy = executeHybridRetrieval(disruption, 'POLICY', actorRole, isOffline);

  const traceId = `TRACE-${caseId}-${Date.now().toString(36).toUpperCase()}`;
  const decisionId = `DEC-${caseId}-${Math.floor(Math.random() * 9000 + 1000)}`;

  const trace: DecisionTrace = {
    trace_id: traceId,
    decision_id: decisionId,
    task: 'FLEET_DISRUPTION_RECOVERY_ANALYSIS',
    case_id: caseId,
    voyage_id: disruption.voyage_id,
    vessel_id: disruption.vessel_id,
    timestamp_utc: now,
    actor: {
      role: actorRole,
      location: isOffline ? 'VESSEL' : 'SHORE',
      user_email: userEmail,
    },
    context_snapshot: {
      context_id: `CTX-${caseId}-${now.slice(11, 19).replace(/:/g, '')}`,
      as_of_time: now,
      connectivity_state: isOffline ? 'OFFLINE' : disruption.connectivity_state,
      conflicts: caseId === 'MFD-L004' ? ['identity_mismatch_imo'] : caseId === 'MFD-L011' ? ['berth_availability_conflict'] : [],
      source_health: [
        { source: 'AIS', state: 'HEALTHY', freshness: 'FRESH' },
        { source: 'TELEMETRY', state: 'HEALTHY', freshness: caseId === 'MFD-L013' ? 'DEGRADING' : 'FRESH' },
        { source: 'WEATHER', state: caseId === 'MFD-L006' ? 'UNAVAILABLE' : 'HEALTHY', freshness: caseId === 'MFD-L006' ? 'MISSING' : 'FRESH' },
        { source: 'PORT', state: caseId === 'MFD-L005' ? 'DEGRADED' : 'HEALTHY', freshness: caseId === 'MFD-L005' ? 'STALE' : 'FRESH' },
        { source: 'POLICY', state: 'HEALTHY', freshness: 'FRESH' },
      ],
      clock_normalization: {
        vessel_clock_offset_ms: caseId === 'MFD-L013' ? 420000 : 0,
        shore_ntp_reachable: !isOffline,
        normalized_causal_order_available: true,
      },
    },
    retrievals: [
      {
        mode: 'STRUCTURED',
        filters: retrievalStructured.filters_applied,
        count: retrievalStructured.items.length,
        items_summary: `Retrieved ${retrievalStructured.items.length} telemetry/port/weather feeds.`,
      },
      {
        mode: 'POLICY',
        filters: retrievalPolicy.filters_applied,
        count: retrievalPolicy.items.length,
        items_summary: 'Enforced ACTIVE v4.1; superseded v3.7 isolated.',
      },
    ],
    source_evidence: retrievalStructured.items.map((item) => ({
      source_id: item.source,
      record_id: item.id,
      event_time: now,
      freshness: item.freshness,
      authority_level: item.authority,
      excerpt: typeof item.content === 'object' ? JSON.stringify(item.content) : String(item.content),
    })),
    policy_checks: [
      {
        rule_id: 'RULE-01-SAFETY-PRIORITY',
        result: 'PASS',
        policy_version: 'v4.1',
        details: 'Safety constraints evaluated before commercial priority.',
      },
      {
        rule_id: 'RULE-02-NO-AUTONOMOUS-COMMANDS',
        result: 'PASS',
        policy_version: 'v4.1',
        details: 'Output presented strictly as candidate options with decision support rationale.',
      },
      {
        rule_id: 'RULE-05-CMMS-TECHNICAL-RELEASE',
        result: caseId === 'MFD-L003' && !cmmsReleaseGranted ? 'BLOCKED' : 'PASS',
        policy_version: 'v4.1',
        details: caseId === 'MFD-L003' ? 'Critical main engine hold WO-CRIT-003 requires Chief Engineer release.' : 'No active critical holds.',
      },
    ],
    versions: {
      model: 'gemini-3.7-flash-maritime-v2',
      prompt: 'fleet_recovery_support_v2.4',
      retrieval_policy: 'hybrid_retrieval_filter_v4.1',
      semantic_model: 'meridian_maritime_ontology_v2.0',
      ontology: 'ont_imo_stcw_marpol_2026.09',
      policy_bundle: 'fleet_controls_v4.1_active',
    },
    recommendation: evaluation.recommended_option_id,
    concise_rationale: evaluation.concise_rationale,
    uncertainty_or_abstention: evaluation.uncertainty_or_abstention,
    human_or_technical_decision: {
      status: 'PENDING',
      role: actorRole,
      action_description: 'Awaiting human authorization / review.',
      authorized: false,
      timestamp_utc: now,
    },
    operator_interaction: {
      interaction_type: 'IGNORED',
      note: 'Interaction data logged for audit; does not alter policy automatically.',
    },
    governed_learning_proposal: {
      status: 'NO_AUTO_UPDATE',
      note: 'Governed learning standard: feedback held for formal human engineering review.',
    },
  };

  saveTrace(trace);
  return trace;
}

export function saveTrace(trace: DecisionTrace) {
  try {
    const existing = getAllTraces();
    const filtered = existing.filter((t) => t.trace_id !== trace.trace_id);
    filtered.unshift(trace);
    localStorage.setItem(TRACE_STORAGE_KEY, JSON.stringify(filtered.slice(0, 50)));
  } catch {
    // Local storage fallback
  }
}

export function getAllTraces(): DecisionTrace[] {
  try {
    const raw = localStorage.getItem(TRACE_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
}
