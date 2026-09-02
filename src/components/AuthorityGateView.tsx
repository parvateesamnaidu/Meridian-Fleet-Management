import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { evaluateCasePolicies } from '../services/policyEngine';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  UserCheck,
  Wrench,
  FileText,
  Lock,
  Unlock,
  Radio,
} from 'lucide-react';

export const AuthorityGateView: React.FC = () => {
  const {
    currentDisruption,
    userProfile,
    isBlackout,
    cmmsReleaseGranted,
    setCmmsReleaseGranted,
    generateAndRecordTrace,
    addNotification,
    setActiveTab,
  } = useApp();

  const [decisionNotes, setDecisionNotes] = useState<string>('');
  const [commitSuccess, setCommitSuccess] = useState<boolean>(false);

  const policyEval = evaluateCasePolicies(
    currentDisruption,
    userProfile.currentRole,
    isBlackout,
    cmmsReleaseGranted
  );

  const isChiefEngineer = userProfile.currentRole === 'CHIEF_ENGINEER';
  const isMaster = userProfile.currentRole === 'MASTER';
  const isFleetController = userProfile.currentRole === 'FLEET_CONTROLLER';

  const handleCommitDecision = () => {
    if (!policyEval.authorized) {
      addNotification(`AUTHORIZATION DENIED: Current role [${userProfile.currentRole}] lacks authority or hard-gate is blocked.`);
      return;
    }
    const trace = generateAndRecordTrace(userProfile.currentRole);
    setCommitSuccess(true);
    addNotification(`DECISION COMMITTED: Decision ${trace.decision_id} authorized by ${userProfile.name} (${userProfile.currentRole}).`);
    setTimeout(() => {
      setActiveTab('decision-trace');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Policy Bundle Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <h1 className="text-sm font-bold font-mono text-slate-900 uppercase tracking-wider">
              AUTHORITY & DETERMINISTIC POLICY GATE (v4.1 ACTIVE)
            </h1>
            <span className="text-xs px-2 py-0.5 rounded font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              POLICY ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Enforces strict role-based sign-off gates, CMMS technical hold release protocols, and complete audit trail immutability.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-600 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200">
          User Role: <span className="text-blue-600 font-bold">{userProfile.currentRole}</span> ({userProfile.location})
        </div>
      </div>

      {/* Superseded Policy Warning (MFD-L012) */}
      <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs font-mono text-amber-800 flex items-start gap-2 shadow-xs">
        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
        <div className="leading-relaxed">
          <span className="font-bold">SUPERSEDED POLICY ISOLATION (MFD-L012): </span>
          Fleet Policy v3.7 is marked SUPERSEDED. Legacy automatic speed pre-authorizations are disabled. All speed and corridor adjustments are evaluated exclusively under v4.1 rules.
        </div>
      </div>

      {/* Policy Rule Checklist */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-xs font-mono font-bold text-slate-900 mb-3.5 flex items-center gap-2 uppercase">
          <ShieldCheck className="h-4 w-4 text-blue-600" /> Active Policy v4.1 Rule Enforcement Checklist
        </h2>

        <div className="space-y-2.5">
          {policyEval.policy_checks.map((check) => {
            const isPass = check.result === 'PASS';
            return (
              <div
                key={check.rule_id}
                className={`p-3.5 rounded-lg border text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                  isPass
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {isPass ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold text-slate-900">{check.rule_id}:</span> {check.details}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-500 font-medium">[{check.policy_version}]</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
                      isPass
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {check.result}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CMMS Special Technical Release Gate (MFD-L003) */}
      {currentDisruption.case_id === 'MFD-L003' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-blue-600" />
              <h2 className="text-xs font-mono font-bold text-slate-900 uppercase">
                CMMS Critical Technical Release Gate (WO-CRIT-003)
              </h2>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${cmmsReleaseGranted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
              {cmmsReleaseGranted ? 'TECHNICAL RELEASE GRANTED' : 'CRITICAL HOLD ACTIVE'}
            </span>
          </div>

          <p className="text-xs text-slate-600 mb-3.5 font-mono leading-relaxed">
            Main engine #2 bearing temp reached 96°C. Policy v4.1 Rule 5 mandates that ONLY the authorized CHIEF ENGINEER may grant a formal technical release before voyage speed can be increased.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="cmms-release-toggle-btn"
              disabled={!isChiefEngineer}
              onClick={() => {
                const next = !cmmsReleaseGranted;
                setCmmsReleaseGranted(next);
                addNotification(
                  next
                    ? 'CHIEF ENGINEER SIGN-OFF: Technical release granted for WO-CRIT-003.'
                    : 'TECHNICAL HOLD RE-ENGAGED: Main engine speed restricted.'
                );
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                !isChiefEngineer
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : cmmsReleaseGranted
                  ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
              }`}
            >
              {cmmsReleaseGranted ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              <span>
                {cmmsReleaseGranted
                  ? 'Revoke Technical Release (Re-engage Hold)'
                  : 'Chief Engineer: Grant Technical Release'}
              </span>
            </button>

            {!isChiefEngineer && (
              <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                ⚠️ Disabled: Switch user role to &ldquo;CHIEF_ENGINEER&rdquo; in header to release hold.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Human Decision Authorization Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-blue-600" />
            <h2 className="text-xs font-mono font-bold text-slate-900 uppercase">
              Human Operator Decision Commit & Signature
            </h2>
          </div>
          <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${policyEval.authorized ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
            {policyEval.authorized ? 'ROLE AUTHORIZATION VALID' : 'ACTION BLOCKED / INSUFFICIENT ROLE'}
          </span>
        </div>

        <div className="space-y-3 text-xs font-mono">
          <div>
            <label className="text-slate-600 block mb-1 font-medium">Recommended Option Under Active Review:</label>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-bold">
              {policyEval.recommended_option_id || 'Raw Evidence Feasibility Review'}
            </div>
          </div>

          <div>
            <label className="text-slate-600 block mb-1 font-medium">Concise Rationale & Context Summary:</label>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
              {policyEval.concise_rationale}
            </div>
          </div>

          <div>
            <label className="text-slate-600 block mb-1 font-medium">Human Operator Endorsement / Operational Log Notes:</label>
            <textarea
              id="operator-decision-notes"
              rows={2}
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              placeholder="Enter optional notes regarding operational context, bridge logs, or charter agreement..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-slate-500">
            Signer: <span className="text-slate-900 font-bold">{userProfile.name}</span> ({userProfile.email})
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              id="commit-decision-btn"
              disabled={!policyEval.authorized}
              onClick={handleCommitDecision}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold transition-all shadow-xs ${
                policyEval.authorized
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Authorize & Commit Decision</span>
            </button>
          </div>
        </div>

        {commitSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs font-mono text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Decision authorized and committed to immutable audit trace repository. Redirecting to Audit view...</span>
          </div>
        )}
      </div>
    </div>
  );
};
