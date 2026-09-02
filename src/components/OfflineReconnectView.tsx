import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  getOfflineQueue,
  reconcileOfflineReplay,
  QueuedEvent,
} from '../services/offlineStorageService';
import {
  Wifi,
  WifiOff,
  Radio,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const OfflineReconnectView: React.FC = () => {
  const {
    simulatedConnectivity,
    setSimulatedConnectivity,
    isBlackout,
    toggleBlackout,
    clockOffsetSeconds,
    setClockOffsetSeconds,
    addNotification,
    currentDisruption,
  } = useApp();

  const [queue, setQueue] = useState<QueuedEvent[]>(getOfflineQueue());
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleRunReconcile = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const result = reconcileOfflineReplay();
      setQueue(getOfflineQueue());
      setSyncLogs(result.logs);
      setIsSyncing(false);
      addNotification(
        `IDEMPOTENT RECONCILIATION COMPLETE: ${result.reconciledCount} events reconciled, ${result.dedupedCount} duplicates rejected.`
      );
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-blue-600" />
            <h1 className="text-sm font-bold font-mono text-slate-900 uppercase tracking-wider">
              Offline Continuity & Idempotent Reconnect Engine
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Simulates vessel-side satellite blackout continuity, edge sensor queuing, temporal skew normalization, and duplicate-proof replay reconciliation.
          </p>
        </div>

        {/* 1-Click Blackout Mode Switcher */}
        <button
          id="offline-screen-toggle-blackout"
          onClick={toggleBlackout}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all shadow-xs cursor-pointer ${
            isBlackout
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
          }`}
        >
          {isBlackout ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4 text-emerald-600" />}
          <span>{isBlackout ? 'Deactivate Blackout (Restore Satcom)' : 'Simulate Satellite Blackout (MFD-L014)'}</span>
        </button>
      </div>

      {/* 3 Status Columns: Connectivity, Clock Skew, Edge Durable Storage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Connectivity State Matrix */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 text-xs font-mono shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-slate-700 font-bold uppercase text-[11px]">Communication Uplink</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                simulatedConnectivity === 'ONLINE'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : simulatedConnectivity === 'DEGRADED'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {simulatedConnectivity}
            </span>
          </div>

          <div className="space-y-1.5 text-slate-700">
            <div>Bandwidth: <span className="text-slate-900 font-bold">{isBlackout ? '0 kbps (Isolated)' : '512 kbps Fleet Link'}</span></div>
            <div>Cloud AI Status: <span className={isBlackout ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>{isBlackout ? 'Unavailable (Rule 6 Local Fallback)' : 'Active'}</span></div>
            <div>Vessel Buffer: <span className="text-blue-700 font-bold">Durable SQLite Edge Cache</span></div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex gap-1">
            {(['ONLINE', 'DEGRADED', 'OFFLINE'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSimulatedConnectivity(st)}
                className={`flex-1 py-1 rounded text-[10px] border transition-colors cursor-pointer ${
                  simulatedConnectivity === st
                    ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Clock Skew & Temporal Normalization (MFD-L013) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 text-xs font-mono shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-slate-700 font-bold flex items-center gap-1.5 uppercase text-[11px]">
              <Clock className="h-4 w-4 text-blue-600" /> Clock Normalization
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${clockOffsetSeconds > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
              {clockOffsetSeconds > 0 ? `+${clockOffsetSeconds}s OFFSET` : 'SYNCHRONIZED'}
            </span>
          </div>

          <div className="space-y-1.5 text-slate-700">
            <div>Vessel Clock: <span className="text-slate-900 font-semibold">{new Date(Date.now() + clockOffsetSeconds * 1000).toISOString().slice(11, 19)}Z</span></div>
            <div>Shore Reference: <span className="text-slate-900 font-semibold">{new Date().toISOString().slice(11, 19)}Z</span></div>
            <div>Causal Sort Mode: <span className="text-blue-700 font-bold">Logical Monotonic Seq #</span></div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => setClockOffsetSeconds(420)}
              className="flex-1 py-1 bg-slate-50 hover:bg-slate-100 text-[10px] text-amber-800 rounded border border-slate-200 font-semibold transition-colors cursor-pointer"
            >
              Set +420s Skew (MFD-L013)
            </button>
            <button
              onClick={() => setClockOffsetSeconds(0)}
              className="flex-1 py-1 bg-slate-50 hover:bg-slate-100 text-[10px] text-emerald-800 rounded border border-slate-200 font-semibold transition-colors cursor-pointer"
            >
              Reset 0s
            </button>
          </div>
        </div>

        {/* Edge Durable State */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 text-xs font-mono shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-slate-700 font-bold flex items-center gap-1.5 uppercase text-[11px]">
              <HardDrive className="h-4 w-4 text-blue-600" /> Vessel Edge Storage
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              PERSISTENT
            </span>
          </div>

          <div className="space-y-1.5 text-slate-700">
            <div>Local Rulebook: <span className="text-emerald-700 font-semibold">Policy v4.1 Cached</span></div>
            <div>Vessel Telemetry Buffer: <span className="text-slate-900 font-semibold">8,420 Records</span></div>
            <div>Queued Sync Events: <span className="text-blue-700 font-bold">{queue.filter((q) => q.status === 'QUEUED').length} Pending</span></div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 text-[10px] text-slate-500">
            Zero data loss on sudden power or satcom disconnection.
          </div>
        </div>
      </div>

      {/* Offline Event Queue & Idempotent Sync Console */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xs font-mono font-bold text-slate-900 uppercase flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              Offline Event Buffer & Replay Deduplication Queue (MFD-L015, MFD-L007)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Queued events carry monotonic sequence numbers and unique deduplication keys to guarantee zero duplicate action commits upon reconnection.
            </p>
          </div>

          <button
            id="run-idempotent-sync-btn"
            disabled={isSyncing}
            onClick={handleRunReconcile}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Reconciling Feeds...' : 'Run Idempotent Replay Sync'}</span>
          </button>
        </div>

        {/* Queued Events Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 text-[11px]">
                <th className="py-2.5 px-3">EVENT ID</th>
                <th className="py-2.5 px-3">CASE ID</th>
                <th className="py-2.5 px-3">EVENT TYPE</th>
                <th className="py-2.5 px-3">SEQ #</th>
                <th className="py-2.5 px-3">DEDUPE KEY</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queue.map((evt) => (
                <tr key={evt.event_id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-blue-600">{evt.event_id}</td>
                  <td className="py-2.5 px-3 text-slate-900 font-semibold">{evt.case_id}</td>
                  <td className="py-2.5 px-3 text-slate-700">{evt.event_type}</td>
                  <td className="py-2.5 px-3 text-slate-500">#{evt.sequence_no}</td>
                  <td className="py-2.5 px-3 text-amber-800 text-[11px] font-bold">{evt.dedupe_key}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                        evt.status === 'PROCESSED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : evt.status === 'DEDUPED'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">{evt.timestamp_utc.slice(11, 19)}Z</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sync Output Terminal */}
        {syncLogs.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 text-xs font-mono space-y-1 shadow-inner">
            <div className="text-slate-400 font-bold flex items-center justify-between mb-2">
              <span className="uppercase text-[11px]">Reconciliation Log Stream</span>
              <span className="text-emerald-400">✓ Completed</span>
            </div>
            {syncLogs.map((log, idx) => (
              <div key={idx} className="text-[11px] text-slate-200">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
