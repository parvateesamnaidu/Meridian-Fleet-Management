import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { evaluateCasePolicies } from '../services/policyEngine';
import { generateRecoveryAnalysis, AiRecoveryAnalysisResponse } from '../services/geminiService';
import { CandidateOption, FeasibilityResult } from '../types';
import {
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Clock,
  DollarSign,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';

export const RecoveryWorkbench: React.FC = () => {
  const { currentDisruption, userProfile, isBlackout, cmmsReleaseGranted, setActiveTab } = useApp();
  const [selectedOptionId, setSelectedOptionId] = useState<string>('OPT-02-SLOW_SPEED');
  const [aiAnalysis, setAiAnalysis] = useState<AiRecoveryAnalysisResponse | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const policyEval = evaluateCasePolicies(
    currentDisruption,
    userProfile.currentRole,
    isBlackout,
    cmmsReleaseGranted
  );

  useEffect(() => {
    let isMounted = true;
    setLoadingAi(true);
    generateRecoveryAnalysis(currentDisruption, userProfile.currentRole, isBlackout, cmmsReleaseGranted).then(
      (res) => {
        if (isMounted) {
          setAiAnalysis(res);
          setLoadingAi(false);
          if (policyEval.recommended_option_id) {
            setSelectedOptionId(policyEval.recommended_option_id);
          }
        }
      }
    );
    return () => {
      isMounted = false;
    };
  }, [currentDisruption.case_id, userProfile.currentRole, isBlackout, cmmsReleaseGranted]);

  const getFeasibilityBadge = (feas: FeasibilityResult) => {
    switch (feas) {
      case 'FEASIBLE':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold', label: 'FEASIBLE' };
      case 'INFEASIBLE':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold', label: 'INFEASIBLE (BLOCKED)' };
      case 'CONDITIONAL':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold', label: 'CONDITIONAL / STALE' };
      case 'REQUIRES_HUMAN':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold', label: 'REQUIRES HUMAN AUTH' };
    }
  };

  const activeOption = policyEval.options.find((o) => o.option_id === selectedOptionId) || policyEval.options[0];

  return (
    <div className="space-y-6">
      {/* Strict Non-Autonomous Notice Banner */}
      <div className="bg-white border-l-4 border-blue-600 border border-slate-200 p-4 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-700">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          POLICY v4.1 RULE 2: NON-AUTONOMOUS DECISION SUPPORT ONLY
        </div>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
          AI Agent may analyze constraints and compare options, but is strictly prohibited from executing autonomous navigation, course, or speed commands.
          Every candidate option requires explicit review and commit from an authorized human role.
        </p>
      </div>

      {/* AI Decision Support Analysis Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <h2 className="text-xs font-mono font-bold text-slate-900 uppercase">
              AI Decision Support Synthesis (Gemini 3.7 Flash)
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
            {aiAnalysis?.isAiGenerated ? 'LIVE SYNTHESIS' : 'DETERMINISTIC FALLBACK'}
          </span>
        </div>

        {loadingAi ? (
          <div className="py-6 text-center text-xs font-mono text-slate-500 animate-pulse">
            Assembling task context, evaluating constraints and synthesizing recovery option comparisons...
          </div>
        ) : (
          <div className="space-y-3 text-xs font-mono">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800">
              <div className="font-bold text-blue-700 mb-1">{aiAnalysis?.summary}</div>
              <p className="leading-relaxed text-slate-700">{aiAnalysis?.rationale}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
                <span className="font-bold text-slate-900">Uncertainty State:</span> {aiAnalysis?.uncertaintyNotes}
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-emerald-700">
                <span className="font-bold text-slate-900">Compliance:</span> {aiAnalysis?.policyComplianceNotice}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Candidate Recovery Options Comparator */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {policyEval.options.map((opt) => {
          const isSelected = opt.option_id === selectedOptionId;
          const feasInfo = getFeasibilityBadge(opt.feasibility);
          const isRecommended = opt.option_id === policyEval.recommended_option_id;

          return (
            <div
              key={opt.option_id}
              onClick={() => setSelectedOptionId(opt.option_id)}
              className={`cursor-pointer rounded-xl p-3.5 border transition-all flex flex-col justify-between shadow-xs ${
                isSelected
                  ? 'bg-blue-50/40 border-blue-600 ring-2 ring-blue-600/30'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-slate-500 font-medium">{opt.type}</span>
                  {isRecommended && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-mono font-bold border border-blue-200">
                      RECOMMENDED
                    </span>
                  )}
                </div>

                <h3 className="text-xs font-bold text-slate-900 font-mono line-clamp-2">{opt.title}</h3>

                <div className="mt-2.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border block text-center truncate ${feasInfo.bg}`}>
                    {feasInfo.label}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-100 text-[11px] font-mono text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Delay:</span>
                  <span className="text-slate-900 font-semibold">+{opt.estimated_delay_hours} hrs</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost Index:</span>
                  <span className="text-slate-900 font-semibold">{opt.commercial_cost_index}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Approver:</span>
                  <span className="text-blue-700 font-bold">{opt.required_approving_role}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Option Deep-Dive Inspector */}
      {activeOption && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-mono text-slate-900">{activeOption.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded font-mono border ${getFeasibilityBadge(activeOption.feasibility).bg}`}>
                  {activeOption.feasibility}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">{activeOption.description}</p>
            </div>

            <button
              id="proceed-to-gate-btn"
              onClick={() => setActiveTab('authority-gate')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-mono font-bold transition-colors shadow-xs cursor-pointer"
            >
              <span>Submit to Authority Gate</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Left: Blockers & Conditionals */}
            <div className="space-y-3">
              {activeOption.blocking_reasons.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-lg">
                  <div className="font-bold text-rose-800 flex items-center gap-1.5 mb-1.5">
                    <XCircle className="h-4 w-4 text-rose-600" /> BLOCKING CONSTRAINTS (HARD GATE):
                  </div>
                  <ul className="list-disc list-inside text-rose-900 text-[11px] space-y-1">
                    {activeOption.blocking_reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activeOption.conditional_factors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-lg">
                  <div className="font-bold text-amber-800 flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" /> CONDITIONAL CONSTRAINTS & EVIDENCE:
                  </div>
                  <ul className="list-disc list-inside text-amber-900 text-[11px] space-y-1">
                    {activeOption.conditional_factors.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activeOption.blocking_reasons.length === 0 && activeOption.conditional_factors.length === 0 && (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-lg text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>All safety, statutory port, cargo and machinery constraints pass nominal checks.</span>
                </div>
              )}
            </div>

            {/* Right: Metrics & Citation Provenance */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
              <div className="text-slate-700 font-bold border-b border-slate-200/80 pb-1 uppercase text-[11px]">
                Evaluation Metrics & Citation Refs
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Material Evidence Refs:</span>
                <span className="text-blue-700 font-bold">{activeOption.material_evidence_refs.join(', ')}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Estimated Delay:</span>
                <span className="text-slate-900 font-semibold">+{activeOption.estimated_delay_hours} Hours</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Commercial Cost Index:</span>
                <span className="text-slate-900 font-semibold">{activeOption.commercial_cost_index} / 100</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Uncertainty Metric:</span>
                <span className="text-slate-900 font-semibold">{activeOption.uncertainty_score}%</span>
              </div>
              <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200">
                <span>Mandatory Approving Role:</span>
                <span className="text-emerald-700 font-bold">{activeOption.required_approving_role}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
