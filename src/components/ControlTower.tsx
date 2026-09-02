import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LIVE_DISRUPTIONS, VOYAGE_SCHEDULE, VESSEL_REGISTRY } from '../data/fixtureBundle';
import {
  AlertOctagon,
  ShieldAlert,
  Clock,
  Radio,
  WifiOff,
  Activity,
  ArrowRight,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Anchor,
  Compass,
} from 'lucide-react';
import { Severity } from '../types';

export const ControlTower: React.FC = () => {
  const { selectedCaseId, setSelectedCaseId, setActiveTab } = useApp();
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCases = LIVE_DISRUPTIONS.filter((c) => {
    if (severityFilter !== 'ALL' && c.severity !== severityFilter) return false;
    if (regionFilter !== 'ALL' && c.route_region !== regionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.case_id.toLowerCase().includes(q) ||
        c.vessel_name.toLowerCase().includes(q) ||
        c.disruption_type.toLowerCase().includes(q) ||
        c.destination_port.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const criticalCount = LIVE_DISRUPTIONS.filter((d) => d.severity === 'CRITICAL').length;
  const highCount = LIVE_DISRUPTIONS.filter((d) => d.severity === 'HIGH').length;
  const degradedCount = LIVE_DISRUPTIONS.filter(
    (d) => d.connectivity_state === 'DEGRADED' || d.connectivity_state === 'OFFLINE'
  ).length;

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('voyage-context');
  };

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">Active Disruptions</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <AlertOctagon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900">{LIVE_DISRUPTIONS.length}</span>
            <span className="text-xs text-slate-500">cases under active watch</span>
          </div>
          <div className="mt-3 text-[11px] font-mono text-blue-600 font-semibold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" /> 100% telemetry grounded
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">Critical / High Severity</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-rose-600">{criticalCount + highCount}</span>
            <span className="text-xs text-slate-500">({criticalCount} Critical, {highCount} High)</span>
          </div>
          <div className="mt-3 text-[11px] font-mono text-rose-700 font-semibold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" /> Requires Master / Chief Eng gate
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">Degraded / Blackout Edges</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <WifiOff className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-amber-600">{degradedCount}</span>
            <span className="text-xs text-slate-500">vessels in offline continuity</span>
          </div>
          <div className="mt-3 text-[11px] font-mono text-amber-700 font-semibold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600" /> Durable local state active
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">Policy Governance</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-600">v4.1</span>
            <span className="text-xs text-slate-500">Active Fleet Controls</span>
          </div>
          <div className="mt-3 text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> 0 Autonomous route writes allowed
          </div>
        </div>
      </div>

      {/* Source Health Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <h2 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
              Fleet Data Ingestion & Source Freshness Matrix
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Operating Day: 2026-09-15 (UTC)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>AIS Streams</span>
              <span className="text-emerald-600 font-semibold">● 15/15</span>
            </div>
            <div className="text-xs font-semibold text-slate-800 mt-1">15m Refresh</div>
            <div className="text-[10px] text-amber-700 font-medium mt-0.5">1 Ambiguity (MFD-L004)</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Vessel Telemetry</span>
              <span className="text-emerald-600 font-semibold">● 15/15</span>
            </div>
            <div className="text-xs font-semibold text-slate-800 mt-1">1s - 5s Stream</div>
            <div className="text-[10px] text-rose-700 font-medium mt-0.5">1 Critical Hold (MFD-L003)</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Port APIs / Notices</span>
              <span className="text-amber-600 font-semibold">● 14/15</span>
            </div>
            <div className="text-xs font-semibold text-slate-800 mt-1">60m Freshness</div>
            <div className="text-[10px] text-amber-700 font-medium mt-0.5">1 Stale + 1 Conflict</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Weather / Ocean</span>
              <span className="text-amber-600 font-semibold">● 14/15</span>
            </div>
            <div className="text-xs font-semibold text-slate-800 mt-1">Hourly Snapshot</div>
            <div className="text-[10px] text-rose-700 font-medium mt-0.5">1 Missing (MFD-L006)</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Satcom Uplink</span>
              <span className="text-blue-600 font-semibold">● Hybrid</span>
            </div>
            <div className="text-xs font-semibold text-slate-800 mt-1">512kbps / 64kbps</div>
            <div className="text-[10px] text-indigo-700 font-medium mt-0.5">1 Blackout (MFD-L014)</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Policy Repository</span>
              <span className="text-emerald-600 font-semibold">● v4.1 Active</span>
            </div>
            <div className="text-xs font-semibold text-slate-800 mt-1">Deterministic</div>
            <div className="text-[10px] text-slate-500 mt-0.5">v3.7 Blocked</div>
          </div>
        </div>
      </div>

      {/* Disruption Cases Table / Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-900 flex items-center gap-2">
              <span>ALL 15 DISRUPTION CASES</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-medium">
                {filteredCases.length} displayed
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any case to inspect real-time context, run hybrid retrieval, or evaluate candidate recovery plans.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                id="search-cases-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search case, vessel, port..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Severity Filter */}
            <select
              id="severity-filter-select"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Region Filter */}
            <select
              id="region-filter-select"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Regions</option>
              <option value="MED">MED (Mediterranean)</option>
              <option value="NATL">NATL (North Atlantic)</option>
              <option value="SEA">SEA (South East Asia)</option>
              <option value="GULF">GULF (Arabian Gulf)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-mono text-[11px] bg-slate-50/70">
                <th className="py-2.5 px-3 font-semibold">CASE ID</th>
                <th className="py-2.5 px-3 font-semibold">VESSEL / IMO</th>
                <th className="py-2.5 px-3 font-semibold">DISRUPTION TYPE</th>
                <th className="py-2.5 px-3 font-semibold">SEVERITY</th>
                <th className="py-2.5 px-3 font-semibold">ROUTE / DEST</th>
                <th className="py-2.5 px-3 font-semibold">CONNECTIVITY</th>
                <th className="py-2.5 px-3 font-semibold">AUTHORITY</th>
                <th className="py-2.5 px-3 text-right font-semibold">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {filteredCases.map((d) => {
                const isSelected = d.case_id === selectedCaseId;
                return (
                  <tr
                    key={d.case_id}
                    className={`transition-colors hover:bg-slate-50 ${
                      isSelected ? 'bg-blue-50/60' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleSelectCase(d.case_id)}
                        className="font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{d.case_id}</span>
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{d.vessel_name}</div>
                      <div className="text-[10px] text-slate-500">{d.imo_number} ({d.vessel_id})</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-sans font-medium">{d.disruption_type.replace(/_/g, ' ')}</div>
                      <div className="text-[10px] text-slate-500">{d.event_time_utc.slice(11, 19)} UTC</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] border font-semibold ${getSeverityBadge(d.severity)}`}>
                        {d.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800">{d.route_region} → {d.destination_port}</div>
                      <div className="text-[10px] text-slate-500">Cargo: {d.cargo_priority}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                          d.connectivity_state === 'ONLINE'
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                            : d.connectivity_state === 'DEGRADED'
                            ? 'text-amber-700 bg-amber-50 border-amber-200'
                            : 'text-rose-700 bg-rose-50 border-rose-200'
                        }`}
                      >
                        {d.connectivity_state}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 text-[11px]">
                      {d.expected_authority.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        id={`select-case-btn-${d.case_id}`}
                        onClick={() => handleSelectCase(d.case_id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white rounded-lg text-xs font-medium transition-all shadow-2xs cursor-pointer"
                      >
                        <span>Analyze</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
