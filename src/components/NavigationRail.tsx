import React from 'react';
import { useApp, AppTab } from '../context/AppContext';
import {
  LayoutDashboard,
  Compass,
  GitCompare,
  Network,
  Search,
  Cpu,
  ShieldCheck,
  WifiOff,
  FileText,
  TrendingUp,
  FlaskConical,
} from 'lucide-react';

interface NavItem {
  id: AppTab;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const NavigationRail: React.FC = () => {
  const { activeTab, setActiveTab, currentDisruption } = useApp();

  const navItems: NavItem[] = [
    { id: 'control-tower', label: '1. Fleet Control Tower', shortLabel: 'Tower', icon: LayoutDashboard, badge: '15 Cases' },
    { id: 'voyage-context', label: '2. Voyage Context View', shortLabel: 'Voyage', icon: Compass },
    { id: 'reconciliation', label: '3. Evidence Reconciliation', shortLabel: 'Reconcile', icon: GitCompare },
    { id: 'graph-explorer', label: '4. Context Graph Explorer', shortLabel: 'Graph', icon: Network },
    { id: 'hybrid-retrieval', label: '5. Hybrid Retrieval Evidence', shortLabel: 'Retrieval', icon: Search },
    { id: 'recovery-workbench', label: '6. Recovery Option Workbench', shortLabel: 'Recovery', icon: Cpu, badge: 'AI & Feas.' },
    { id: 'authority-gate', label: '7. Authority & Policy Gate', shortLabel: 'Gate', icon: ShieldCheck, badge: 'v4.1' },
    { id: 'offline-reconnect', label: '8. Offline / Reconnect View', shortLabel: 'Offline', icon: WifiOff },
    { id: 'decision-trace', label: '9. Decision Trace / Audit', shortLabel: 'Trace', icon: FileText, badge: 'T10' },
    { id: 'outcome-feedback', label: '10. Outcome & Feedback', shortLabel: 'Outcome', icon: TrendingUp },
    { id: 'scenario-lab', label: '11. Scenario & Failure Lab', shortLabel: 'Lab', icon: FlaskConical, badge: '15 Tests' },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 overflow-x-auto scrollbar-none shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center space-x-1.5 py-2 min-w-max">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-500'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="whitespace-nowrap">{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${
                    isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
