import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Database,
  Radio,
  User,
  LogOut,
  Mail,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, setUserProfile, addNotification } = useApp();
  const [isSignedIn, setIsSignedIn] = useState(true);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    setUserProfile({
      name: 'Capt. Parvateesam Naidu',
      email: 'parvateesamnaidu@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      currentRole: 'FLEET_CONTROLLER',
      location: 'SHORE',
    });
    setIsSignedIn(true);
    addNotification('Google Sign-in successful: Authenticated as Capt. Parvateesam Naidu');
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    setUserProfile((prev) => ({
      ...prev,
      name: 'Unauthenticated Officer',
      email: 'guest@meridianblue.com',
    }));
    addNotification('Signed out from fleet session.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-xs font-mono relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Authentication & Cloud Sync
            </h2>
            <p className="text-[11px] text-slate-500">
              Firebase Auth & Secure Google Sign-In
            </p>
          </div>
        </div>

        {/* User Card */}
        {isSignedIn ? (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={userProfile.avatar}
                alt="Avatar"
                className="h-12 w-12 rounded-full ring-2 ring-blue-600 object-cover shadow-xs"
              />
              <div className="truncate">
                <div className="font-bold text-slate-900 text-sm truncate">{userProfile.name}</div>
                <div className="text-slate-600 text-xs flex items-center gap-1 mt-0.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate">{userProfile.email}</span>
                </div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 font-medium">Active Role:</span>
                <div className="font-bold text-blue-700">{userProfile.currentRole}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Location:</span>
                <div className="font-bold text-slate-800">{userProfile.location}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center space-y-3">
            <User className="h-8 w-8 text-slate-400 mx-auto" />
            <div className="text-slate-600">No authenticated Google account connected.</div>
          </div>
        )}

        {/* Cloud & Realtime Status */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-[11px]">
          <div className="text-slate-800 font-bold border-b border-slate-200 pb-1.5 flex items-center gap-1.5 uppercase text-[11px]">
            <Database className="h-3.5 w-3.5 text-blue-600" /> Firebase & Offline Persistence
          </div>
          <div className="flex justify-between text-slate-700">
            <span>Firestore Realtime DB:</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Connected & Listening
            </span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>IndexedDB Local Cache:</span>
            <span className="text-blue-700 font-bold">15/15 Vessels Cached</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>Auth Token Expiry:</span>
            <span className="text-slate-500 font-mono">2026-09-16T00:00:00Z</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-2 flex items-center justify-between gap-3">
          {isSignedIn ? (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-slate-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Sign In with Google</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors ml-auto cursor-pointer border border-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
