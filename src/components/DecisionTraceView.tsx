import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DecisionTrace } from '../types';
import {
  FileText,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  UserCheck,
  Cpu,
  Layers,
  Database,
  CheckCircle2,
} from 'lucide-react';

export const DecisionTraceView: React.FC = () => {
  const { decisionTraces, selectedCaseId, generateAndRecordTrace, addNotification } = useApp();
  const [selectedTraceId, setSelectedTraceId] = useState<string>(
    decisionTraces[0]?.trace_id || ''
  );
  const [copied, setCopied] = useState<boolean>(false);

  const activeTrace =
    decisionTraces.find((t) => t.trace_id === selectedTraceId) || decisionTraces[0];

  const handleCopyJson = () => {
    if (!activeTrace) return;
    navigator.clipboard.writeText(JSON.stringify(activeTrace, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addNotification('Decision Trace JSON copied to clipboard.');
  };

  const handleDownloadJson = () => {
    if (!activeTrace) return;
    const blob = new Blob([JSON.stringify(activeTrace, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTrace.trace_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification(`Downloaded trace file ${activeTrace.trace_id}.json`);
  };

  const handleCreateNewTrace = () => {
    const trace = generateAndRecordTrace();
    setSelectedTraceId(trace.trace_id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <h1 className="text-sm font-bold font-mono text-slate-900 uppercase tracking-wider">
              Decision Trace & Audit Repository (Template 10 Compliant)
            </h1>
            <span className="text-xs px-2 py-0.5 rounded font-mono bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              AUDIT READY
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Structured, deterministic decision traces capturing actor, context snapshot, multimodal evidence, rule outcomes, exact versions, and observable rationale.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="generate-new-trace-btn"
            onClick={handleCreateNewTrace}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer shadow-xs"
          >
            + Snapshot Current Case Trace
          </button>
        </div>
      </div>

      {/* Reconstructability Banner */}
      <div className="bg-white border-l-4 border-l-emerald-600 border border-slate-200 p-4 rounded-xl text-xs font-mono text-emerald-900 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-medium">
            STRICT TEMPLATE 10 COMPLIANCE: 0 Hidden Chain-of-Thought. Full deterministic reconstructability across model, prompt, and policy versions.
          </span>
        </div>
        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
          v4.1 Certified
        </span>
      </div>

      {/* Main Trace Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: Traces List */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
          <div className="text-xs font-mono font-bold text-slate-800 pb-2 border-b border-slate-100 flex justify-between uppercase">
            <span>Saved Traces</span>
            <span className="text-blue-600">{decisionTraces.length}</span>
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
            {decisionTraces.map((t) => {
              const isSelected = (activeTrace?.trace_id || '') === t.trace_id;
              return (
                <button
                  key={t.trace_id}
                  onClick={() => setSelectedTraceId(t.trace_id)}
                  className={`w-full text-left p-3 rounded-lg text-xs font-mono transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 font-bold">{t.case_id}</span>
                    <span className="text-[10px] text-slate-500">{t.timestamp_utc.slice(11, 19)}Z</span>
                  </div>
                  <div className="text-[11px] text-slate-800 font-medium truncate mt-1">{t.trace_id}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{t.actor.role} ({t.actor.location})</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Trace Detail View */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-xs">
          {activeTrace ? (
            <>
              {/* Top Meta Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="text-xs font-mono text-blue-600 font-bold">
                    TRACE ID: {activeTrace.trace_id}
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                    Decision ID: {activeTrace.decision_id} • Case: {activeTrace.case_id} ({activeTrace.voyage_id})
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="copy-trace-json-btn"
                    onClick={handleCopyJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                  <button
                    id="download-trace-json-btn"
                    onClick={handleDownloadJson}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-mono font-bold transition-colors shadow-xs cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Grid 1: Actor & Context Snapshot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* Actor Box */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="text-slate-800 font-bold border-b border-slate-200 pb-1.5 flex items-center gap-1.5 text-[11px] uppercase">
                    <UserCheck className="h-4 w-4 text-blue-600" /> 1. Actor Identification
                  </div>
                  <div className="text-slate-700">Role: <span className="text-blue-700 font-bold">{activeTrace.actor.role}</span></div>
                  <div className="text-slate-700">Location: <span className="text-slate-900 font-medium">{activeTrace.actor.location}</span></div>
                  <div className="text-slate-700">Operator Email: <span className="text-slate-900 font-medium">{activeTrace.actor.user_email}</span></div>
                  <div className="text-slate-700">Timestamp UTC: <span className="text-slate-900 font-medium">{activeTrace.timestamp_utc}</span></div>
                </div>

                {/* Context Snapshot Box */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="text-slate-800 font-bold border-b border-slate-200 pb-1.5 flex items-center gap-1.5 text-[11px] uppercase">
                    <Database className="h-4 w-4 text-blue-600" /> 2. Context Snapshot
                  </div>
                  <div className="text-slate-700">Context ID: <span className="text-slate-900 font-bold">{activeTrace.context_snapshot.context_id}</span></div>
                  <div className="text-slate-700">Connectivity: <span className="text-emerald-700 font-bold">{activeTrace.context_snapshot.connectivity_state}</span></div>
                  <div className="text-slate-700">Clock Skew: <span className="text-amber-700 font-semibold">{activeTrace.context_snapshot.clock_normalization.vessel_clock_offset_ms}ms</span></div>
                  <div className="text-slate-700">Health: <span className="text-slate-900 font-medium">{activeTrace.context_snapshot.source_health.length} streams monitored</span></div>
                </div>
              </div>

              {/* Grid 2: Recommendation & Observable Rationale */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs font-mono">
                <div className="text-slate-800 font-bold border-b border-slate-200 pb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] uppercase">
                    <Cpu className="h-4 w-4 text-blue-600" /> 3. Recommendation & Observable Rationale
                  </span>
                  <span className="text-blue-700 font-bold">{activeTrace.recommendation}</span>
                </div>
                <div className="text-slate-800 leading-relaxed pt-1">
                  {activeTrace.concise_rationale}
                </div>
                <div className="text-slate-600 pt-1 text-[11px]">
                  Uncertainty Flag: <span className="text-amber-800 font-semibold">{activeTrace.uncertainty_or_abstention}</span>
                </div>
              </div>

              {/* Grid 3: Exact Version Bundle */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs font-mono">
                <div className="text-slate-800 font-bold border-b border-slate-200 pb-1.5 mb-2.5 flex items-center gap-1.5 text-[11px] uppercase">
                  <Layers className="h-4 w-4 text-blue-600" /> 4. Exact Governance & Version Bundle
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                  <div><span className="text-slate-500">Model:</span> <span className="text-slate-800 font-medium">{activeTrace.versions.model}</span></div>
                  <div><span className="text-slate-500">Prompt:</span> <span className="text-slate-800 font-medium">{activeTrace.versions.prompt}</span></div>
                  <div><span className="text-slate-500">Policy:</span> <span className="text-emerald-700 font-bold">{activeTrace.versions.policy_bundle}</span></div>
                  <div><span className="text-slate-500">Retrieval:</span> <span className="text-slate-800 font-medium">{activeTrace.versions.retrieval_policy}</span></div>
                  <div><span className="text-slate-500">Ontology:</span> <span className="text-slate-800 font-medium">{activeTrace.versions.ontology}</span></div>
                  <div><span className="text-slate-500">Semantic:</span> <span className="text-slate-800 font-medium">{activeTrace.versions.semantic_model}</span></div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              No decision traces recorded yet. Generate one from the Authority Gate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
