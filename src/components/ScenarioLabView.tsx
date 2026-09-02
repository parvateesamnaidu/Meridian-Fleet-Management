import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GOLDEN_SCENARIOS, LIVE_DISRUPTIONS } from '../data/fixtureBundle';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  FileCheck,
} from 'lucide-react';

export const ScenarioLabView: React.FC = () => {
  const {
    setSelectedCaseId,
    setActiveTab,
    acceptanceTests,
    runAcceptanceTests,
    selectedCaseId,
  } = useApp();

  const [filterAdjudication, setFilterAdjudication] = useState<string>('ALL');

  const getDisruptionForScenario = (caseId: string) => {
    return LIVE_DISRUPTIONS.find((d) => d.case_id === caseId);
  };

  const filteredScenarios = GOLDEN_SCENARIOS.filter((s) => {
    if (filterAdjudication !== 'ALL' && s.adjudication_status !== filterAdjudication) return false;
    return true;
  });

  const handleLaunchScenario = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('recovery-workbench');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-blue-600" />
            <h1 className="text-sm font-bold font-mono text-slate-900 uppercase tracking-wider">
              Scenario & Failure Injection Lab
            </h1>
            <span className="text-xs px-2 py-0.5 rounded font-mono bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              15 GOLDEN CASES • 12 HARD GATES
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Automated verification laboratory testing edge cases: clock drift, satellite blackout, CMMS holds, prompt injections, and superseded policy isolation.
          </p>
        </div>

        <button
          id="run-all-acceptance-tests-btn"
          onClick={runAcceptanceTests}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
        >
          <Play className="h-4 w-4" />
          <span>Run All 12 Acceptance Tests</span>
        </button>
      </div>

      {/* Acceptance Test Results Suite (AT-01 .. AT-12) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h2 className="text-xs font-mono font-bold text-slate-900 uppercase flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Automated Acceptance Test Harness (12 Hard Gates)
          </h2>
          <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {acceptanceTests.filter((t) => t.status === 'PASS').length} / {acceptanceTests.length} PASSED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {acceptanceTests.map((test) => {
            const isPass = test.status === 'PASS';
            const isRunning = test.status === 'RUNNING';

            return (
              <div
                key={test.test_id}
                className={`p-3.5 rounded-lg border text-xs font-mono flex flex-col justify-between transition-colors ${
                  isRunning
                    ? 'bg-blue-50 border-blue-300 animate-pulse'
                    : isPass
                    ? 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                    : 'bg-rose-50 border-rose-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-blue-700">{test.test_id}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
                        isRunning
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : isPass
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {isRunning ? 'RUNNING' : test.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900">{test.name}</h3>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">{test.description}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-[10px] text-slate-500 flex justify-between items-center">
                  <span className="truncate max-w-[180px] font-medium">{test.observed_details}</span>
                  {test.hard_gate && <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">HARD GATE</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Golden Scenarios Matrix (GS-01 .. GS-15) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xs font-mono font-bold text-slate-900 uppercase flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-blue-600" />
              15 Golden Scenarios (GS-01 to GS-15)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Select any scenario to inject its specific operational disruption, constraint matrix, and edge condition.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-600 font-medium">Status:</span>
            <select
              value={filterAdjudication}
              onChange={(e) => setFilterAdjudication(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-1.5 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED_FOR_WORKSHOP">Approved for Workshop</option>
            </select>
          </div>
        </div>

        {/* Scenarios Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 text-[11px]">
                <th className="py-2.5 px-3">SCENARIO ID</th>
                <th className="py-2.5 px-3">CASE ID</th>
                <th className="py-2.5 px-3">TITLE / DISRUPTION TYPE</th>
                <th className="py-2.5 px-3">VERSION</th>
                <th className="py-2.5 px-3">EXPECTED GOVERNANCE BEHAVIOR</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredScenarios.map((sc) => {
                const isSelected = sc.case_id === selectedCaseId;
                const disruption = getDisruptionForScenario(sc.case_id);
                return (
                  <tr
                    key={sc.scenario_id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-blue-700">{sc.scenario_id}</td>
                    <td className="py-3 px-3 text-slate-900 font-bold">{sc.case_id}</td>
                    <td className="py-3 px-3">
                      <div className="text-slate-900 font-semibold">{sc.title}</div>
                      <div className="text-[11px] text-blue-700 font-mono mt-0.5">
                        {disruption?.disruption_type} • {disruption?.severity}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-50 border border-slate-200 text-slate-700 font-medium">
                        v{sc.fixture_version}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 text-[11px] max-w-sm">
                      <p className="line-clamp-2 leading-relaxed">{sc.expected_behavior}</p>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        id={`launch-scenario-btn-${sc.scenario_id}`}
                        onClick={() => handleLaunchScenario(sc.case_id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white rounded text-xs font-semibold transition-colors cursor-pointer border border-slate-200 hover:border-blue-600"
                      >
                        <span>Inject</span>
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

