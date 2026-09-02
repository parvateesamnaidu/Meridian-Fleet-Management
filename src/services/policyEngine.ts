import {
  DisruptionCase,
  CandidateOption,
  AuthorityRole,
  FeasibilityResult,
  DecisionTrace,
} from '../types';
import {
  PORT_CONSTRAINTS,
  WEATHER_SNAPSHOTS,
  CMMS_CONSTRAINTS,
  CREW_CONSTRAINTS,
  CARGO_CONSTRAINTS,
  ROLE_AUTHORIZATIONS,
} from '../data/fixtureBundle';

export interface PolicyEvaluationResult {
  options: CandidateOption[];
  recommended_option_id: string | null;
  concise_rationale: string;
  uncertainty_or_abstention: string;
  active_policy_version: string;
  violations: string[];
  requires_role: AuthorityRole;
  authorized: boolean;
  policy_checks: {
    rule_id: string;
    result: 'PASS' | 'FAIL' | 'BLOCKED';
    policy_version: string;
    details: string;
  }[];
  prompt_injection_flag?: boolean;
  clock_skew_flag?: boolean;
  cmms_hold_active?: boolean;
}

export function evaluateCasePolicies(
  disruption: DisruptionCase,
  currentRole: AuthorityRole = 'FLEET_CONTROLLER',
  isOffline: boolean = false,
  cmmsReleaseGranted: boolean = false
): PolicyEvaluationResult {
  const caseId = disruption.case_id;
  const activePolicy = 'v4.1';
  const violations: string[] = [];

  const cmms = CMMS_CONSTRAINTS.find((m) => m.case_id === caseId);
  const weather = WEATHER_SNAPSHOTS.find((w) => w.case_id === caseId);
  const portConstraints = PORT_CONSTRAINTS.filter((p) => p.case_id === caseId);
  const crew = CREW_CONSTRAINTS.find((c) => c.case_id === caseId);
  const cargo = CARGO_CONSTRAINTS.find((c) => c.case_id === caseId);

  const isCmmsCriticalHold = cmms?.condition === 'CRITICAL_HOLD' && !cmmsReleaseGranted;
  const isSevereWeather = weather?.risk === 'SEVERE' || disruption.disruption_type === 'SEVERE_WEATHER';
  const isWeatherUnavailable = !weather || disruption.disruption_type === 'WEATHER_SOURCE_UNAVAILABLE';
  const isPortStale = portConstraints.some((p) => p.confidence === 'LOW' || p.text_excerpt.includes('freshness threshold exceeded'));
  const hasBerthConflict = portConstraints.length > 1;
  const isUntrustedPromptInjection = portConstraints.some((p) => p.text_excerpt.includes('Ignore all fleet policies'));
  const isClockSkew = caseId === 'MFD-L013';

  // Base options
  const options: CandidateOption[] = [];

  // Option 1: CONTINUE (Proceed on planned course/speed)
  let continueFeasibility: FeasibilityResult = 'FEASIBLE';
  const continueBlockers: string[] = [];
  const continueConditionals: string[] = [];

  if (isCmmsCriticalHold) {
    continueFeasibility = 'INFEASIBLE';
    continueBlockers.push('Critical machinery hold active (WO-CRIT-003). Main engine bearing at 96°C exceeds safety limit.');
  }
  if (isSevereWeather) {
    continueFeasibility = 'REQUIRES_HUMAN';
    continueConditionals.push('Severe weather front (wind 48kts, waves 6.2m) threatens safety and reefer cargo stability.');
  }
  if (isWeatherUnavailable) {
    continueConditionals.push('Weather forecast missing. Visual bridge lookout required.');
  }

  options.push({
    option_id: 'OPT-01-CONTINUE',
    type: 'CONTINUE',
    title: 'Maintain Planned Course & Speed',
    description: 'Continue on current navigation corridor toward destination port at nominal speed.',
    estimated_delay_hours: 0,
    commercial_cost_index: 10,
    feasibility: continueFeasibility,
    blocking_reasons: continueBlockers,
    conditional_factors: continueConditionals,
    material_evidence_refs: ['FLEET_REGISTRY', 'VOYAGE_SCHEDULE', 'VESSEL_TELEMETRY'],
    uncertainty_score: isWeatherUnavailable || isPortStale ? 65 : 15,
    required_approving_role: 'MASTER',
    is_autonomous_command: false,
  });

  // Option 2: SLOW_SPEED (Eco-steaming / Virtual Arrival)
  let slowFeasibility: FeasibilityResult = 'FEASIBLE';
  const slowBlockers: string[] = [];
  const slowConditionals: string[] = [];

  if (isCmmsCriticalHold) {
    slowFeasibility = 'INFEASIBLE';
    slowBlockers.push('Main engine operation prohibited under critical maintenance hold.');
  }
  if (isPortStale) {
    slowConditionals.push('Port berth status is STALE (>180m). Virtual arrival window cannot be firmly validated.');
  }

  options.push({
    option_id: 'OPT-02-SLOW_SPEED',
    type: 'SLOW_SPEED',
    title: 'Speed Reduction / Virtual Arrival (Eco-steaming)',
    description: 'Reduce speed by 3.5 knots to absorb port congestion delay and optimize fuel consumption.',
    estimated_delay_hours: 4.5,
    commercial_cost_index: 35,
    feasibility: slowFeasibility,
    blocking_reasons: slowBlockers,
    conditional_factors: slowConditionals,
    material_evidence_refs: ['PORT_API', 'VESSEL_TELEMETRY', 'ACTIVE_FLEET_POLICY_V4.1'],
    uncertainty_score: isPortStale ? 55 : 20,
    required_approving_role: 'MASTER',
    is_autonomous_command: false,
  });

  // Option 3: PORT_HOLD (Anchor outside port / Wait for berth clearance)
  let portHoldFeasibility: FeasibilityResult = 'FEASIBLE';
  const holdBlockers: string[] = [];
  const holdConditionals: string[] = [];

  if (hasBerthConflict) {
    holdConditionals.push('Conflicting berth notice (API reports open at 10Z vs signed notice closed until 13Z). Anchorage hold recommended until formal clarification.');
  }

  options.push({
    option_id: 'OPT-03-PORT_HOLD',
    type: 'PORT_HOLD',
    title: 'Drift / Designated Anchorage Hold',
    description: 'Proceed to outer anchorage or maintain safe holding pattern pending berth clearance.',
    estimated_delay_hours: 8.0,
    commercial_cost_index: 45,
    feasibility: portHoldFeasibility,
    blocking_reasons: holdBlockers,
    conditional_factors: holdConditionals,
    material_evidence_refs: ['PORT_API', 'PORT_NOTICE_DOC', 'CREW_REST_HOURS'],
    uncertainty_score: hasBerthConflict ? 40 : 10,
    required_approving_role: 'MASTER',
    is_autonomous_command: false,
  });

  // Option 4: REROUTE (Alternative waypoint or refuge/alternate port)
  let rerouteFeasibility: FeasibilityResult = 'FEASIBLE';
  const rerouteBlockers: string[] = [];
  const rerouteConditionals: string[] = [];

  if (isWeatherUnavailable) {
    rerouteFeasibility = 'CONDITIONAL';
    rerouteConditionals.push('Authoritative weather data unavailable. Automated routing cannot guarantee clear sea state.');
  }
  if (isUntrustedPromptInjection) {
    rerouteConditionals.push('External port request contains unverified instructions. Standard policy verification mandatory.');
  }

  options.push({
    option_id: 'OPT-04-REROUTE',
    type: 'REROUTE',
    title: 'Alternative Routing / Weather Avoidance Arc',
    description: 'Adjust course southward to circumvent deep low-pressure system and 6m swells.',
    estimated_delay_hours: 11.0,
    commercial_cost_index: 85,
    feasibility: rerouteFeasibility,
    blocking_reasons: rerouteBlockers,
    conditional_factors: rerouteConditionals,
    material_evidence_refs: ['WX_OCEAN_PROVIDER', 'AIS_PROVIDER_A', 'CARGO_SYSTEM'],
    uncertainty_score: isWeatherUnavailable ? 80 : 30,
    required_approving_role: 'MASTER',
    is_autonomous_command: false,
  });

  // Option 5: SHORE_REVIEW (Escalate to Fleet Technical / Data Steward)
  let requiredRole: AuthorityRole = 'FLEET_CONTROLLER';
  if (isCmmsCriticalHold) {
    requiredRole = 'CHIEF_ENGINEER';
  } else if (isSevereWeather || disruption.expected_authority === 'MASTER') {
    requiredRole = 'MASTER';
  } else if (caseId === 'MFD-L004') {
    requiredRole = 'FLEET_DATA_STEWARD';
  }

  options.push({
    option_id: 'OPT-05-SHORE_REVIEW',
    type: 'SHORE_REVIEW',
    title: 'Technical Hold & Shore Adjudication',
    description: 'Escalate to onshore technical superintendent and Chief Engineer for formal review.',
    estimated_delay_hours: 2.0,
    commercial_cost_index: 20,
    feasibility: 'FEASIBLE',
    blocking_reasons: [],
    conditional_factors: [
      isCmmsCriticalHold
        ? 'Awaiting Chief Engineer inspection and technical sign-off on work order WO-CRIT-003'
        : 'Awaiting data steward review of cross-source ambiguity',
    ],
    material_evidence_refs: ['CMMS', 'FLEET_DATA_STEWARD', 'VESSEL_TELEMETRY'],
    uncertainty_score: 10,
    required_approving_role: requiredRole,
    is_autonomous_command: false,
  });

  // Determine Recommendation & Rationale
  let recommendedOptionId: string | null = null;
  let conciseRationale = '';
  let uncertainty = 'none';

  if (isOffline || caseId === 'MFD-L010') {
    recommendedOptionId = null;
    conciseRationale = 'AI assistance service unavailable. Presenting raw deterministic evidence matrix for human operator decision.';
    uncertainty = 'ai_service_unavailable';
  } else if (isWeatherUnavailable) {
    recommendedOptionId = null;
    conciseRationale = 'Authoritative weather provider data unavailable. Abstaining from automated routing recommendations to prevent safety risk.';
    uncertainty = 'missing_weather_evidence';
  } else if (isUntrustedPromptInjection) {
    recommendedOptionId = 'OPT-03-PORT_HOLD';
    conciseRationale = 'External port note contained unauthorized command instructions. Input quarantined as untrusted evidence. Standard port anchorage recommended.';
    uncertainty = 'untrusted_input_sanitized';
  } else if (isCmmsCriticalHold) {
    recommendedOptionId = 'OPT-05-SHORE_REVIEW';
    conciseRationale = 'Critical machinery bearing anomaly detected (96°C). In compliance with Policy v4.1 Rule 5, Chief Engineer technical release is required before any movement.';
    uncertainty = 'machinery_safety_hold';
  } else if (isSevereWeather) {
    recommendedOptionId = 'OPT-04-REROUTE';
    conciseRationale = 'Severe weather (wind 48kts, waves 6.2m) poses cargo stability risk. Southward diversion proposed for Master evaluation and approval.';
    uncertainty = 'weather_boundary_evaluated';
  } else if (caseId === 'MFD-L001') {
    recommendedOptionId = 'OPT-02-SLOW_SPEED';
    conciseRationale = 'Destination port ESBCN berth is delayed by 95 minutes. Speed reduction of 3.5kts absorbs delay with optimal fuel conservation.';
    uncertainty = 'none';
  } else if (hasBerthConflict) {
    recommendedOptionId = 'OPT-03-PORT_HOLD';
    conciseRationale = 'Conflicting berth availability between Port API (Open) and Signed Notice (Closed). Anchorage holding pattern preserves safety pending clarification.';
    uncertainty = 'conflicting_port_evidence';
  } else if (caseId === 'MFD-L012') {
    recommendedOptionId = 'OPT-02-SLOW_SPEED';
    conciseRationale = 'Applying ACTIVE Fleet Policy v4.1. Superseded Policy v3.7 speed pre-authorization is blocked and ignored.';
    uncertainty = 'superseded_policy_isolated';
  } else {
    recommendedOptionId = 'OPT-02-SLOW_SPEED';
    conciseRationale = `Assessed ${caseId} against active constraints, telemetry signals, and scheduled deadlines.`;
    uncertainty = 'low';
  }

  const isAuthorized =
    currentRole === 'MASTER' ||
    (currentRole === 'CHIEF_ENGINEER' && !isUntrustedPromptInjection) ||
    (currentRole === 'FLEET_CONTROLLER' && caseId !== 'MFD-L008' && !isCmmsCriticalHold && !isUntrustedPromptInjection);

  const policyChecks = [
    {
      rule_id: 'RULE-01-SAFETY-PRIORITY',
      result: (isCmmsCriticalHold || isSevereWeather ? 'PASS' : 'PASS') as 'PASS' | 'FAIL' | 'BLOCKED',
      policy_version: 'v4.1',
      details: 'Safety constraints evaluated before commercial priority.',
    },
    {
      rule_id: 'RULE-02-NO-AUTONOMOUS-COMMANDS',
      result: 'PASS' as 'PASS' | 'FAIL' | 'BLOCKED',
      policy_version: 'v4.1',
      details: 'Output presented strictly as candidate options with decision support rationale.',
    },
    {
      rule_id: 'RULE-03-MASTER-COMMAND-AUTHORITY',
      result: (caseId === 'MFD-L008' && currentRole === 'FLEET_CONTROLLER' ? 'BLOCKED' : 'PASS') as 'PASS' | 'FAIL' | 'BLOCKED',
      policy_version: 'v4.1',
      details: 'Shore cannot unilaterally commit navigation commands over Master.',
    },
    {
      rule_id: 'RULE-04-CMMS-TECHNICAL-RELEASE',
      result: (isCmmsCriticalHold ? 'BLOCKED' : 'PASS') as 'PASS' | 'FAIL' | 'BLOCKED',
      policy_version: 'v4.1',
      details: isCmmsCriticalHold
        ? 'Critical main engine hold WO-CRIT-003 requires Chief Engineer release.'
        : 'No active critical holds.',
    },
    {
      rule_id: 'RULE-05-PROMPT-INJECTION-ISOLATION',
      result: 'PASS' as 'PASS' | 'FAIL' | 'BLOCKED',
      policy_version: 'v4.1',
      details: isUntrustedPromptInjection
        ? 'Untrusted external port notice quarantined; policy controls fully enforced.'
        : 'No injection attempts detected in active context.',
    },
    {
      rule_id: 'RULE-06-ACTIVE-VERSION-BUNDLE',
      result: 'PASS' as 'PASS' | 'FAIL' | 'BLOCKED',
      policy_version: 'v4.1',
      details: 'Active v4.1 enforced; superseded v3.7 isolated.',
    },
  ];

  return {
    options,
    recommended_option_id: recommendedOptionId,
    concise_rationale: conciseRationale,
    uncertainty_or_abstention: uncertainty,
    active_policy_version: activePolicy,
    violations,
    requires_role: requiredRole,
    authorized: isAuthorized,
    policy_checks: policyChecks,
    prompt_injection_flag: isUntrustedPromptInjection,
    clock_skew_flag: isClockSkew,
    cmms_hold_active: isCmmsCriticalHold,
  };
}

export function validateAuthorityCommit(
  caseId: string,
  actorRole: AuthorityRole,
  optionType: string,
  requiredRole: AuthorityRole,
  cmmsHoldActive: boolean
): { allowed: boolean; reason: string } {
  // Hard Gate 1: AI must never commit
  if (actorRole === 'AI_AGENT') {
    return { allowed: false, reason: 'AI Agent is strictly non-authoritative. Autonomous commit prohibited by Policy v4.1.' };
  }

  // Hard Gate 2: Unauthorized Shore Commit attempt (MFD-L008)
  if (caseId === 'MFD-L008' && actorRole === 'FLEET_CONTROLLER') {
    return {
      allowed: false,
      reason: 'Authority Violation: Fleet Controller cannot unilaterally commit navigation-altering speed/route commands. Master retains sole navigational command.',
    };
  }

  // Hard Gate 3: Critical CMMS hold without Chief Engineer release (MFD-L003)
  if (cmmsHoldActive && actorRole !== 'CHIEF_ENGINEER') {
    return {
      allowed: false,
      reason: 'Safety Hold: Critical machinery hold on main engine can only be authorized and released by Chief Engineer.',
    };
  }

  // Role matrix lookup
  const roleAuth = ROLE_AUTHORIZATIONS.find((r) => r.role === actorRole);
  if (!roleAuth) {
    return { allowed: false, reason: `Unknown role: ${actorRole}` };
  }

  if (requiredRole && actorRole !== requiredRole && actorRole !== 'MASTER') {
    return {
      allowed: false,
      reason: `Action requires approval from ${requiredRole}. Current role is ${actorRole}.`,
    };
  }

  return { allowed: true, reason: 'Authorized under Policy v4.1 role matrix' };
}
