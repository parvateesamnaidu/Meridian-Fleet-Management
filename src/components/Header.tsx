import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LIVE_DISRUPTIONS } from '../data/fixtureBundle';
import { AuthorityRole, ConnectivityState } from '../types';
import {
  Ship,
  ShieldCheck,
  Radio,
  Wifi,
  WifiOff,
  Clock,
  UserCheck,
  AlertTriangle,
  ChevronDown,
  Bell,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuthModal }) => {
  const {
    selectedCaseId,
    setSelectedCaseId,
    currentDisruption,
    userProfile,
    switchRole,
    simulatedConnectivity,
    toggleBlackout,
    clockOffsetSeconds,
    notifications,
  } = useApp();

  const [showCaseMenu, setShowCaseMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roles: AuthorityRole[] = [
    'MASTER',
    'CHIEF_ENGINEER',
    'FLEET_CONTROLLER',
    'SAFETY_OFFICER',
    'COMMERCIAL_PLANNER',
    'FLEET_DATA_STEWARD',
  ];

  const getConnBadge = (state: ConnectivityState) => {
    switch (state) {
      case 'ONLINE':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Wifi, label: 'SATCOM ONLINE' };
      case 'DEGRADED':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Radio, label: 'DEGRADED (64kbps)' };
      case 'OFFLINE':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse', icon: WifiOff, label: 'BLACKOUT (EDGE)' };
      case 'RECONNECTING':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse', icon: Radio, label: 'RECONNECTING' };
    }
  };

  const connInfo = getConnBadge(simulatedConnectivity);
  const ConnIcon = connInfo.icon;

  const getSeverityBadge = (sev: string) => {
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
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 px-4 sm:px-6 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Organization */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
            <Ship className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 tracking-tight text-base">
                MERIDIAN<span className="text-blue-600">BLUE</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-medium border border-blue-200 bg-blue-50 text-blue-700">
                FLEET AI WORKBENCH
              </span>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
              <span>Policy v4.1 Active</span>
              <span>•</span>
              <span className="text-emerald-700 flex items-center gap-0.5 font-medium">
                <ShieldCheck className="h-3 w-3 inline text-emerald-600" /> Deterministic Gate
              </span>
            </p>
          </div>
        </div>

        {/* Case Selector Dropdown */}
        <div className="relative">
          <button
            id="case-selector-btn"
            onClick={() => setShowCaseMenu(!showCaseMenu)}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg text-xs transition-all text-slate-800"
          >
            <span className="text-slate-500 font-mono">Case:</span>
            <span className="font-bold text-blue-600 font-mono">{currentDisruption.case_id}</span>
            <span className="text-slate-800 font-medium truncate max-w-[140px] sm:max-w-[200px]">
              {currentDisruption.vessel_name} ({currentDisruption.disruption_type})
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono border font-semibold ${getSeverityBadge(
                currentDisruption.severity
              )}`}
            >
              {currentDisruption.severity}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          </button>

          {showCaseMenu && (
            <div className="absolute left-0 mt-1.5 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 max-h-96 overflow-y-auto">
              <div className="text-[11px] font-mono font-semibold text-slate-500 px-2 py-1 border-b border-slate-100 mb-1 flex justify-between">
                <span>15 GOLDEN DISRUPTION CASES</span>
                <span>Select Target Case</span>
              </div>
              {LIVE_DISRUPTIONS.map((d) => (
                <button
                  key={d.case_id}
                  onClick={() => {
                    setSelectedCaseId(d.case_id);
                    setShowCaseMenu(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-colors ${
                    d.case_id === selectedCaseId
                      ? 'bg-blue-50 border border-blue-200 text-blue-900'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-blue-600">{d.case_id}</span>
                      <span className="font-medium text-slate-900 truncate">{d.vessel_name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{d.disruption_type}</div>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono border whitespace-nowrap font-semibold ${getSeverityBadge(
                      d.severity
                    )}`}
                  >
                    {d.severity}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Connectivity / Blackout Toggle Button */}
          <button
            id="satcom-toggle-btn"
            onClick={toggleBlackout}
            title="Click to toggle Satellite Blackout / Offline Continuity test mode"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border font-semibold transition-all shadow-xs cursor-pointer ${connInfo.bg}`}
          >
            <ConnIcon className="h-3.5 w-3.5" />
            <span>{connInfo.label}</span>
          </button>

          {/* Clock Offset Badge if applicable */}
          {clockOffsetSeconds > 0 && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono bg-amber-50 text-amber-800 border border-amber-200 font-semibold"
              title="Vessel clock offset detected (temporal normalization active)"
            >
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              <span>+{clockOffsetSeconds}s SKEW</span>
            </div>
          )}

          {/* Role Switcher */}
          <div className="relative">
            <button
              id="role-switcher-btn"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 hover:bg-slate-200/80 rounded-lg text-xs font-mono text-slate-800 transition-colors shadow-xs"
            >
              <UserCheck className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-slate-500">Role:</span>
              <span className="font-semibold text-blue-700">{userProfile.currentRole}</span>
              <ChevronDown className="h-3 w-3 text-slate-500" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 text-slate-800">
                <div className="text-[11px] font-mono font-semibold text-slate-500 px-2 py-1 border-b border-slate-100 mb-1">
                  AUTHORITY ROLE SWITCHER
                </div>
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                      r === userProfile.currentRole
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{r}</span>
                    {r === userProfile.currentRole && <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              id="notifications-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg text-slate-700 relative transition-colors shadow-xs"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-1.5 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3">
                <div className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5 mb-2 flex items-center justify-between">
                  <span>SYSTEM AUDIT FEED</span>
                  <span className="text-[10px] text-blue-600 font-mono font-semibold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">Live</span>
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto text-xs font-mono text-slate-600">
                  {notifications.map((n, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] leading-relaxed">
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Google Sign-In */}
          <button
            id="google-auth-btn"
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 pl-2.5 pr-1.5 py-1 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-full transition-all text-xs shadow-xs"
            title="Google Sign-In & Authentication details"
          >
            <span className="hidden sm:inline text-[11px] font-medium text-slate-700 truncate max-w-[100px]">
              {userProfile.name}
            </span>
            <img
              src={userProfile.avatar}
              alt="Avatar"
              className="h-6 w-6 rounded-full ring-2 ring-blue-500 object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
