import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { NavigationRail } from './components/NavigationRail';
import { ControlTower } from './components/ControlTower';
import { VoyageContextView } from './components/VoyageContextView';
import { EvidenceReconciliation } from './components/EvidenceReconciliation';
import { ContextGraphExplorer } from './components/ContextGraphExplorer';
import { HybridRetrievalView } from './components/HybridRetrievalView';
import { RecoveryWorkbench } from './components/RecoveryWorkbench';
import { AuthorityGateView } from './components/AuthorityGateView';
import { OfflineReconnectView } from './components/OfflineReconnectView';
import { DecisionTraceView } from './components/DecisionTraceView';
import { OutcomeFeedbackView } from './components/OutcomeFeedbackView';
import { ScenarioLabView } from './components/ScenarioLabView';
import { AuthModal } from './components/AuthModal';
import { ShieldCheck, Anchor, Wifi, Terminal } from 'lucide-react';

const WorkbenchContent: React.FC = () => {
  const { activeTab, currentDisruption } = useApp();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'control-tower':
        return <ControlTower />;
      case 'voyage-context':
        return <VoyageContextView />;
      case 'reconciliation':
        return <EvidenceReconciliation />;
      case 'graph-explorer':
        return <ContextGraphExplorer />;
      case 'hybrid-retrieval':
        return <HybridRetrievalView />;
      case 'recovery-workbench':
        return <RecoveryWorkbench />;
      case 'authority-gate':
        return <AuthorityGateView />;
      case 'offline-reconnect':
        return <OfflineReconnectView />;
      case 'decision-trace':
        return <DecisionTraceView />;
      case 'outcome-feedback':
        return <OutcomeFeedbackView />;
      case 'scenario-lab':
        return <ScenarioLabView />;
      default:
        return <ControlTower />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-900">
      {/* Top App Header */}
      <Header onOpenAuthModal={() => setIsAuthOpen(true)} />

      {/* 11 Screen Tab Switcher */}
      <NavigationRail />

      {/* Main Screen Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {renderActiveScreen()}
      </main>

      {/* Operational Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-3.5 text-xs font-mono text-slate-500 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Anchor className="h-4 w-4 text-blue-600" />
            <span className="text-slate-800 font-bold">MERIDIANBLUE ENTERPRISE</span>
            <span>•</span>
            <span>Active Case: <span className="text-blue-600 font-bold">{currentDisruption.case_id}</span> ({currentDisruption.vessel_name})</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Policy v4.1 Active (Zero Auto-Commit)
            </span>
            <span>•</span>
            <span className="text-slate-500">ISO/IEC 42001 & STCW Compliant</span>
          </div>
        </div>
      </footer>

      {/* Google Auth & Firebase Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <WorkbenchContent />
    </AppProvider>
  );
}

