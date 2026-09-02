import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Send,
  FileSpreadsheet,
  Clock,
  DollarSign,
  Fuel,
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  case_id: string;
  timestamp_utc: string;
  actor_role: string;
  action_type: 'ACCEPTED' | 'MODIFIED' | 'OVERRIDDEN' | 'IGNORED';
  notes: string;
  review_status: 'LOGGED_FOR_ENGINEERING_REVIEW' | 'IN_GOVERNANCE_TRIAGE';
}

export const OutcomeFeedbackView: React.FC = () => {
  const { currentDisruption, userProfile, addNotification } = useApp();
  const [feedbackType, setFeedbackType] = useState<'ACCEPTED' | 'MODIFIED' | 'OVERRIDDEN' | 'IGNORED'>('ACCEPTED');
  const [notes, setNotes] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const [feedbackLog, setFeedbackLog] = useState<FeedbackItem[]>([
    {
      id: 'FB-202609-001',
      case_id: 'MFD-L001',
      timestamp_utc: '2026-09-15T09:30:00Z',
      actor_role: 'FLEET_CONTROLLER',
      action_type: 'ACCEPTED',
      notes: 'Executed 12kt virtual arrival. Saved 4.2 MT VLSFO compared to anchorage wait.',
      review_status: 'LOGGED_FOR_ENGINEERING_REVIEW',
    },
    {
      id: 'FB-202609-002',
      case_id: 'MFD-L003',
      timestamp_utc: '2026-09-15T10:15:00Z',
      actor_role: 'CHIEF_ENGINEER',
      action_type: 'MODIFIED',
      notes: 'Held engine at 65% load during thermal cool-down before clearing bearing release.',
      review_status: 'IN_GOVERNANCE_TRIAGE',
    },
  ]);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    const newItem: FeedbackItem = {
      id: `FB-202609-${Math.floor(Math.random() * 900 + 100)}`,
      case_id: currentDisruption.case_id,
      timestamp_utc: new Date().toISOString(),
      actor_role: userProfile.currentRole,
      action_type: feedbackType,
      notes: notes.trim(),
      review_status: 'LOGGED_FOR_ENGINEERING_REVIEW',
    };

    setFeedbackLog([newItem, ...feedbackLog]);
    setNotes('');
    setSubmitted(true);
    addNotification(`Feedback [${newItem.id}] logged for formal engineering review queue.`);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <h1 className="text-sm font-bold font-mono text-slate-900 uppercase tracking-wider">
              Voyage Outcome Tracking & Governed Learning Feedback
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Validates predicted metrics against actual voyage execution and routes operator feedback through controlled governance cycles.
          </p>
        </div>

        <div className="text-xs font-mono text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-lg border border-emerald-200 font-semibold flex items-center gap-1.5 shadow-xs">
          <ShieldCheck className="h-4 w-4 text-emerald-600" /> Governed Learning Active
        </div>
      </div>

      {/* Governed Learning Standard Box */}
      <div className="bg-white border-l-4 border-l-blue-600 border border-slate-200 p-4 rounded-xl text-xs font-mono text-slate-700 space-y-1.5 shadow-xs">
        <div className="text-blue-900 font-bold flex items-center gap-1.5 text-[11px] uppercase">
          <ShieldCheck className="h-4 w-4 text-blue-600" /> Policy v4.1 Rule: No Autonomous Re-Learning
        </div>
        <p className="text-slate-600 leading-relaxed">
          Operator feedback and voyage outcomes are recorded in an immutable audit repository. To preserve statutory compliance, feedback CANNOT dynamically re-tune policy rules, weights, or safety thresholds in production without formal peer review and software release validation.
        </p>
      </div>

      {/* Predicted vs Actual Metrics Comparison */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-xs font-mono font-bold text-slate-900 uppercase mb-3.5 flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-blue-600" />
          Voyage Predicted vs Observed Outcome Metrics ({currentDisruption.case_id})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs font-mono">
          {/* Delay Variance */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1.5 font-medium"><Clock className="h-4 w-4 text-blue-600" /> Arrival Delay</span>
              <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Δ -0.5 hrs</span>
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <div>
                <div className="text-[10px] text-slate-500 font-medium">PREDICTED</div>
                <div className="text-sm font-bold text-slate-800">+4.0 Hours</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 font-medium">ACTUAL</div>
                <div className="text-sm font-bold text-blue-700">+3.5 Hours</div>
              </div>
            </div>
          </div>

          {/* Fuel Consumption */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1.5 font-medium"><Fuel className="h-4 w-4 text-blue-600" /> Fuel Burn (VLSFO)</span>
              <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Δ -1.2 MT</span>
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <div>
                <div className="text-[10px] text-slate-500 font-medium">PREDICTED</div>
                <div className="text-sm font-bold text-slate-800">28.5 MT</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 font-medium">ACTUAL</div>
                <div className="text-sm font-bold text-blue-700">27.3 MT</div>
              </div>
            </div>
          </div>

          {/* Commercial Cost Index */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1.5 font-medium"><DollarSign className="h-4 w-4 text-blue-600" /> Cost Index</span>
              <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Within Bounds</span>
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <div>
                <div className="text-[10px] text-slate-500 font-medium">PREDICTED</div>
                <div className="text-sm font-bold text-slate-800">35 / 100</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 font-medium">ACTUAL</div>
                <div className="text-sm font-bold text-blue-700">32 / 100</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operator Feedback Logger Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
        <h2 className="text-xs font-mono font-bold text-slate-900 uppercase flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <MessageSquare className="h-4 w-4 text-blue-600" />
          Submit Operator Action & Learning Observation
        </h2>

        <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs font-mono">
          <div>
            <label className="text-slate-700 block mb-1.5 font-medium">Action Taken by Operator:</label>
            <div className="flex flex-wrap gap-2">
              {(['ACCEPTED', 'MODIFIED', 'OVERRIDDEN', 'IGNORED'] as const).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setFeedbackType(type)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    feedbackType === type
                      ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-700 block mb-1 font-medium">Operational Rationale & Lessons Learned:</label>
            <textarea
              id="feedback-notes-input"
              rows={3}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe actual bridge decisions, weather discrepancies, or pilot interactions..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              Logged as: <strong className="text-slate-800">{userProfile.name}</strong> ({userProfile.currentRole})
            </span>
            <button
              id="submit-feedback-btn"
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Submit to Governance Queue</span>
            </button>
          </div>

          {submitted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Feedback successfully submitted to formal engineering review queue.</span>
            </div>
          )}
        </form>
      </div>

      {/* Historical Governance Review Queue */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-xs font-mono font-bold text-slate-900 mb-3.5 flex items-center justify-between border-b border-slate-100 pb-2.5 uppercase">
          <span>Governance Triage & Review Queue</span>
          <span className="text-[11px] text-slate-500 font-normal">{feedbackLog.length} Records</span>
        </h2>

        <div className="space-y-2.5 text-xs font-mono">
          {feedbackLog.map((item) => (
            <div key={item.id} className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-700">{item.id}</span>
                  <span className="text-slate-600 font-medium">({item.case_id})</span>
                  <span className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-medium">
                    {item.action_type}
                  </span>
                </div>
                <span className="text-amber-800 text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                  {item.review_status}
                </span>
              </div>
              <p className="text-slate-800 pt-1 text-[11px] leading-relaxed">{item.notes}</p>
              <div className="text-[10px] text-slate-500 pt-1.5 border-t border-slate-200 flex justify-between">
                <span>By: <strong className="text-slate-700">{item.actor_role}</strong></span>
                <span>{item.timestamp_utc.slice(0, 16).replace('T', ' ')}Z</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
