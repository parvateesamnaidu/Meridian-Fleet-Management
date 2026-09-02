import React from 'react';
import { useApp } from '../context/AppContext';
import {
  IDENTIFIER_CROSSWALK,
  CONFLICTING_TERMS,
  AIS_POSITIONS,
  VESSEL_REGISTRY,
  PORT_CONSTRAINTS,
} from '../data/fixtureBundle';
import {
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  Database,
  Radio,
} from 'lucide-react';

export const EvidenceReconciliation: React.FC = () => {
  const { currentDisruption, userProfile } = useApp();
  const caseId = currentDisruption.case_id;

  const ais = AIS_POSITIONS.find((a) => a.case_id === caseId);
  const vessel = VESSEL_REGISTRY.find((v) => v.vessel_id === currentDisruption.vessel_id);
  const portConstraints = PORT_CONSTRAINTS.filter((p) => p.case_id === caseId);

  const isIdentityMismatch = caseId === 'MFD-L004' || ais?.quality === 'IDENTITY_CONFLICT';
  const hasBerthConflict = portConstraints.length > 1;

  return (
    <div className="space-y-6">
      {/* Header Description */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <GitCompare className="h-4 w-4 text-blue-600" />
          <h1 className="text-sm font-bold font-mono text-slate-900 uppercase tracking-wider">
            Evidence Reconciliation & Ambiguity Disambiguation
          </h1>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Reconciles disparate external observations with internal authoritative canonical master records.
          Preserves contradictory and ambiguous observations with source provenance rather than silently overwriting them.
        </p>
      </div>

      {/* Dynamic Conflict Surfaces for Selected Case */}
      {isIdentityMismatch && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h2 className="text-sm font-bold font-mono text-amber-900">
              CROSS-SOURCE IDENTITY AMBIGUITY DETECTED (MFD-L004)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Left: Authoritative Fleet Master */}
            <div className="bg-white border border-emerald-200 p-3.5 rounded-lg shadow-xs">
              <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5 mb-2">
                <ShieldCheck className="h-4 w-4" /> AUTHORITATIVE FLEET REGISTRY
              </div>
              <div className="space-y-1 text-slate-700">
                <div>Canonical Vessel ID: <span className="text-slate-900 font-bold">{vessel?.vessel_id}</span></div>
                <div>Master Vessel Name: <span className="text-slate-900 font-bold">{vessel?.vessel_name}</span></div>
                <div>Registered IMO: <span className="text-slate-900 font-bold">{vessel?.imo_number}</span></div>
                <div>Fleet Flag & Class: <span className="text-slate-800">{vessel?.flag} ({vessel?.vessel_class})</span></div>
              </div>
              <div className="mt-2 text-[10px] text-slate-500 border-t border-slate-100 pt-1.5">
                Authority: Canonical Fleet Identity (Confidence: 1.00)
              </div>
            </div>

            {/* Right: External AIS Observation */}
            <div className="bg-white border border-amber-300 p-3.5 rounded-lg shadow-xs">
              <div className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5 mb-2">
                <Radio className="h-4 w-4 text-amber-600" /> EXTERNAL AIS OBSERVATION
              </div>
              <div className="space-y-1 text-slate-700">
                <div>Provider Record: <span className="text-slate-900 font-bold">{ais?.provider_record_id}</span></div>
                <div>Reported Name: <span className="text-amber-800 font-bold">{ais?.reported_vessel_name}</span></div>
                <div>Reported IMO: <span className="text-amber-800 font-bold">{ais?.reported_imo}</span></div>
                <div>Fuzzy Match Score: <span className="text-amber-700 font-bold">0.62 (AMBIGUOUS)</span></div>
              </div>
              <div className="mt-2 text-[10px] text-amber-700 border-t border-slate-100 pt-1.5">
                Policy Rule: Retained as separate observation. Silent merge blocked. Requires Fleet Data Steward.
              </div>
            </div>
          </div>
        </div>
      )}

      {hasBerthConflict && (
        <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            <h2 className="text-sm font-bold font-mono text-rose-900">
              CONTRADICTORY PORT EVIDENCE COLLISION (MFD-L011)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {portConstraints.map((pc, idx) => (
              <div key={idx} className="bg-white border border-slate-200 p-3.5 rounded-lg shadow-xs">
                <div className="text-[11px] font-bold text-blue-700 flex items-center gap-1.5 mb-2">
                  <FileCheck className="h-4 w-4" /> {pc.source} ({pc.constraint_id})
                </div>
                <div className="space-y-1 text-slate-700">
                  <div>Port Code: <span className="text-slate-900 font-bold">{pc.port_code}</span></div>
                  <div>Reported Berth State: <span className={pc.berth_state === 'CLOSED' ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>{pc.berth_state}</span></div>
                  <div>Pilot Window: <span className="text-slate-800">{pc.pilot_window}</span></div>
                  <div>Excerpt: <span className="text-slate-600 italic leading-relaxed">{pc.text_excerpt}</span></div>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 border-t border-slate-100 pt-1.5 flex justify-between">
                  <span>Timestamp: {pc.source_update_time.slice(11, 19)}Z</span>
                  <span className="text-blue-700 font-bold">{pc.source === 'PORT_NOTICE_DOC' ? 'Higher Authority Precedence' : 'Feed Status'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crosswalk Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-xs font-mono font-bold text-slate-900 mb-3 flex items-center gap-2 uppercase">
          <Database className="h-4 w-4 text-blue-600" /> Identifier Crosswalk & Provenance Map
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 text-[11px]">
                <th className="py-2.5 px-3">CANONICAL ID</th>
                <th className="py-2.5 px-3">SOURCE SYSTEM</th>
                <th className="py-2.5 px-3">EXTERNAL SOURCE ID</th>
                <th className="py-2.5 px-3">MATCH FEATURES</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3">CONFIDENCE</th>
                <th className="py-2.5 px-3">NOTES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {IDENTIFIER_CROSSWALK.map((cw, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-blue-600">{cw.canonical_id}</td>
                  <td className="py-2.5 px-3 text-slate-700">{cw.source}</td>
                  <td className="py-2.5 px-3 text-slate-900 font-medium">{cw.source_id}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">{cw.match_features}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        cw.match_status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {cw.match_status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{cw.confidence}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">{cw.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Semantic Definitions & Conflicting Terms Glossary */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-xs font-mono font-bold text-slate-900 mb-3 flex items-center gap-2 uppercase">
          <HelpCircle className="h-4 w-4 text-blue-600" /> Semantic Disambiguation Glossary (Anti-Confusion)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CONFLICTING_TERMS.map((term, i) => (
            <div key={i} className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs font-mono">
              <div className="flex justify-between items-center text-blue-700 font-bold mb-1">
                <span>&ldquo;{term.term}&rdquo;</span>
                <span className="text-[10px] text-slate-500 font-medium">{term.source_or_team}</span>
              </div>
              <div className="text-slate-700 mt-1 leading-relaxed">
                <span className="text-slate-500 font-medium">Meaning:</span> {term.meaning}
              </div>
              <div className="text-rose-800 mt-2 border-t border-slate-200/80 pt-1.5 text-[11px] leading-relaxed">
                <span className="text-slate-500 font-medium">Must not confuse with:</span> {term.must_not_be_confused_with}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
