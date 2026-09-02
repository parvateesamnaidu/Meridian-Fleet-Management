import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { executeHybridRetrieval } from '../services/retrievalService';
import {
  Search,
  Database,
  Network,
  Binary,
  ShieldCheck,
  Brain,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { FreshnessState } from '../types';

export const HybridRetrievalView: React.FC = () => {
  const { currentDisruption, userProfile, isBlackout } = useApp();
  const [activeMode, setActiveMode] = useState<'STRUCTURED' | 'GRAPH' | 'VECTOR' | 'POLICY' | 'MEMORY'>('STRUCTURED');

  const retrievalResult = executeHybridRetrieval(
    currentDisruption,
    activeMode,
    userProfile.currentRole,
    isBlackout
  );

  const getFreshnessBadge = (freshness: FreshnessState) => {
    switch (freshness) {
      case 'FRESH':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
      case 'DEGRADING':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
      case 'STALE':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
      case 'MISSING':
        return 'bg-slate-100 text-slate-600 border-slate-200 font-medium';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
    }
  };

  const modes: { id: 'STRUCTURED' | 'GRAPH' | 'VECTOR' | 'POLICY' | 'MEMORY'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'STRUCTURED', label: '1. Structured Data', icon: Database },
    { id: 'GRAPH', label: '2. Graph Traversal', icon: Network },
    { id: 'VECTOR', label: '3. Vector Similarity', icon: Binary },
    { id: 'POLICY', label: '4. Active Policy v4.1', icon: ShieldCheck },
    { id: 'MEMORY', label: '5. Controlled Memory', icon: Brain },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Modes Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-sm font-bold font-mono text-slate-900 flex items-center gap-2 uppercase tracking-wide">
              <Search className="h-4 w-4 text-blue-600" />
              Hybrid Retrieval Evidence Engine: {currentDisruption.case_id}
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Multimodal retrieval orchestrator with mandatory pre-retrieval access/purpose filters, version isolation, and freshness scoring.
            </p>
          </div>
          <div className="text-xs font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700">
            Active As-Of: <span className="text-blue-600 font-bold">{currentDisruption.event_time_utc}</span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
          {modes.map((m) => {
            const Icon = m.icon;
            const isCurrent = activeMode === m.id;
            return (
              <button
                key={m.id}
                id={`retrieval-mode-${m.id}`}
                onClick={() => setActiveMode(m.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Query Execution & Filters Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-xs font-mono space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600" />
            <span className="text-slate-500 font-medium">SYNTACTIC QUERY:</span>
            <span className="text-slate-900 font-bold">{retrievalResult.query}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-600">
            <span>Latency: <strong className="text-slate-900">{retrievalResult.execution_time_ms}ms</strong></span>
            <span>•</span>
            <span>Relevance: <strong className="text-blue-600">{(retrievalResult.relevance_score * 100).toFixed(0)}%</strong></span>
          </div>
        </div>

        {/* Applied Pre-Filters */}
        <div>
          <span className="text-slate-500 text-[11px] block mb-2 font-bold uppercase">Pre-Retrieval Security & Governance Filters Applied:</span>
          <div className="flex flex-wrap gap-2">
            {retrievalResult.filters_applied.map((f, i) => (
              <span key={i} className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1">
                <span className="text-emerald-600 font-bold">✓</span> {f}
              </span>
            ))}
          </div>
        </div>

        {/* Boundary Notes */}
        {retrievalResult.boundary_notes.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-800 text-[11px]">
            {retrievalResult.boundary_notes.join(' • ')}
          </div>
        )}
      </div>

      {/* Retrieved Items List */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-bold text-slate-800 flex items-center justify-between uppercase">
          <span>Retrieved Evidence Artifacts ({retrievalResult.items.length})</span>
          <span className="text-[11px] text-slate-500 font-normal">Strict Source Provenance</span>
        </h2>

        {retrievalResult.items.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs font-mono text-slate-500 shadow-xs">
            No items matched active purpose filters or source unavailable under current connectivity.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {retrievalResult.items.map((item) => (
              <div
                key={item.id}
                className={`bg-white border rounded-xl p-5 shadow-xs transition-all ${
                  item.untrusted_flag
                    ? 'border-amber-300 bg-amber-50/40'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600 font-mono text-xs">{item.id}</span>
                    <span className="text-xs text-slate-500 font-mono">[{item.category}]</span>
                    {item.untrusted_flag && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold">
                        UNTRUSTED EXTERNAL CONTENT
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] border ${getFreshnessBadge(item.freshness)}`}>
                      {item.freshness}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] border border-slate-200 font-medium">
                      {item.authority}
                    </span>
                  </div>
                </div>

                {/* Content Render */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800">
                  <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                    {typeof item.content === 'object' ? JSON.stringify(item.content, null, 2) : String(item.content)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
