import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Calendar, 
  Bell, 
  RotateCcw, 
  ShieldAlert, 
  Sparkles, 
  Check, 
  Cpu, 
  Database, 
  Smartphone,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { UserProfile, UserStats, Habit } from '../types';
import { ADMIN_EMAILS, isCreatorEmail } from '../utils/googleAuth';
import { CreatorBadge } from './CreatorBadge';

interface AdminTelemetryPanelProps {
  userProfile: UserProfile;
  stats: UserStats;
  habits: Habit[];
  darkMode?: boolean;
  isCreatorAdminMode: boolean;
  onToggleCreatorAdminMode: (enabled: boolean) => void;
  onSimulateNextDay: () => void;
  onSendInstantTestPush: () => void;
  onResetSandboxData: () => void;
  onTriggerGraceShield: () => void;
  isSimulatedRisk?: boolean;
  onAddTestStreak?: (days: number) => void;
}

export const AdminTelemetryPanel: React.FC<AdminTelemetryPanelProps> = ({
  userProfile,
  stats,
  habits,
  darkMode = false,
  isCreatorAdminMode,
  onToggleCreatorAdminMode,
  onSimulateNextDay,
  onSendInstantTestPush,
  onResetSandboxData,
  onTriggerGraceShield,
  isSimulatedRisk = false,
  onAddTestStreak
}) => {
  const [swStatus, setSwStatus] = useState<string>('Checking...');
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [storageCount, setStorageCount] = useState<number>(0);
  const [testLog, setTestLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTestLog(prev => [`[${time}] ${msg}`, ...prev.slice(0, 4)]);
  };

  useEffect(() => {
    // Check Service Worker status
    if (typeof window !== 'undefined') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
          .then(() => setSwStatus('Active & Controlling (SW Ready)'))
          .catch(() => setSwStatus('Inactive / Fallback Mode'));
      } else {
        setSwStatus('Not Supported in Browser');
      }

      // Check notification permission
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      } else {
        setNotificationPermission('unsupported');
      }

      // Check localStorage keys count
      try {
        setStorageCount(localStorage.length);
      } catch {
        setStorageCount(0);
      }
    }
  }, []);

  const isWhitelisted = !!userProfile.isAuthenticated && isCreatorEmail(userProfile.email);

  if (!isWhitelisted) {
    return null;
  }

  return (
    <div 
      id="admin-telemetry-panel"
      className={`p-6 sm:p-7 rounded-[32px] border transition-all duration-200 ${
        darkMode 
          ? 'bg-stone-900/90 border-amber-500/40 shadow-premium' 
          : 'bg-gradient-to-b from-amber-50/40 to-white border-amber-300/80 shadow-premium'
      } space-y-6 relative overflow-hidden`}
    >
      {/* Background visual highlight */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header section with Creator status and toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10 border-b pb-5 border-amber-200/50 dark:border-stone-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className={`text-base font-display font-bold ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
              Admin &amp; Telemetry
            </h3>
            <CreatorBadge size="md" darkMode={darkMode} label="Founder" />
            <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
              RBAC: CREATOR
            </span>
          </div>
          <p className={`text-xs ${darkMode ? 'text-stone-400' : 'text-stone-600'} leading-relaxed max-w-xl`}>
            Exclusive developer controls, telemetry diagnostics, and behavior loop testing suite for the platform creator.
          </p>
        </div>

        {/* Creator Admin Mode Toggle */}
        <div className="flex items-center gap-3 bg-amber-500/10 dark:bg-stone-800/80 border border-amber-400/30 dark:border-stone-700 px-4 py-2.5 rounded-2xl shrink-0">
          <div className="text-left">
            <span className={`block text-[11px] font-bold ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>
              Creator Admin Mode
            </span>
            <span className="block text-[9px] text-stone-500">
              {isCreatorAdminMode ? 'Dev Tools Active' : 'Member Preview Mode'}
            </span>
          </div>
          <button
            id="btn-toggle-creator-admin-mode"
            type="button"
            onClick={() => {
              const nextState = !isCreatorAdminMode;
              onToggleCreatorAdminMode(nextState);
              addLog(`Admin mode switched to: ${nextState ? 'ENABLED' : 'DISABLED'}`);
            }}
            className="cursor-pointer transition hover:scale-105 active:scale-95"
            title="Toggle Creator Admin Tools"
          >
            {isCreatorAdminMode ? (
              <ToggleRight className="w-8 h-8 text-amber-500 fill-amber-500/20" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-stone-400" />
            )}
          </button>
        </div>
      </div>

      {/* Whitelist Verification Notice */}
      <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between flex-wrap gap-3 ${
        darkMode ? 'bg-stone-800/50 border-stone-750' : 'bg-white/80 border-amber-200/60'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="min-w-0">
            <span className="font-semibold text-[11px] text-stone-700 dark:text-stone-300">
              Creator Whitelist Match:
            </span>{' '}
            <code className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
              {userProfile.email || ADMIN_EMAILS[0]}
            </code>
            {isWhitelisted ? (
              <span className="ml-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                ✓ Whitelisted in ADMIN_EMAILS
              </span>
            ) : (
              <span className="ml-2 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                (Manual Admin Override Active)
              </span>
            )}
          </div>
        </div>
        <span className="text-[10px] font-mono text-stone-400">
          Role: <strong>{userProfile.role || 'creator'}</strong>
        </span>
      </div>

      {isCreatorAdminMode && (
        <>
          {/* Main Action Tools Grid */}
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-mono mb-3">
              DEVELOPER CONTROL MATRIX
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              
              {/* Tool 1: Simulate Next Day */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                darkMode ? 'bg-[#1E2836] border-[#334255]' : 'bg-white border-stone-200'
              } hover:border-amber-400/80 transition shadow-xs group`}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase bg-orange-500/10 text-orange-600 px-1.5 py-0.5 rounded">
                      Streak Logic
                    </span>
                  </div>
                  <h4 className={`font-bold text-xs ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                    Simulate Next Day
                  </h4>
                  <p className="text-[10px] text-stone-500 leading-normal">
                    Advances the calendar by +24h to test streak incrementation and Grace Shield trigger rules.
                  </p>
                </div>

                <button
                  id="btn-admin-simulate-next-day"
                  type="button"
                  onClick={() => {
                    onSimulateNextDay();
                    addLog('Triggered: Simulate Next Day (+24h date progression)');
                  }}
                  className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Advance +1 Day</span>
                </button>
              </div>

              {/* Tool 2: Send Instant Test Push Notification */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                darkMode ? 'bg-[#1E2836] border-[#334255]' : 'bg-white border-stone-200'
              } hover:border-amber-400/80 transition shadow-xs group`}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded">
                      Push Pipeline
                    </span>
                  </div>
                  <h4 className={`font-bold text-xs ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                    Instant Push Notification
                  </h4>
                  <p className="text-[10px] text-stone-500 leading-normal">
                    Dispatches a real native system notification with audible vibration to verify device alert delivery.
                  </p>
                </div>

                <button
                  id="btn-admin-test-push"
                  type="button"
                  onClick={() => {
                    onSendInstantTestPush();
                    addLog('Triggered: Instant native system push notification');
                  }}
                  className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Send Test Push</span>
                </button>
              </div>

              {/* Tool 3: Simulate Grace Shield Risk */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                darkMode ? 'bg-[#1E2836] border-[#334255]' : 'bg-white border-stone-200'
              } hover:border-amber-400/80 transition shadow-xs group`}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase bg-rose-500/10 text-rose-600 px-1.5 py-0.5 rounded">
                      {isSimulatedRisk ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h4 className={`font-bold text-xs ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                    Trigger Grace Shield
                  </h4>
                  <p className="text-[10px] text-stone-500 leading-normal">
                    Simulate a missed day to display the Grace Shield banner and test recovery mission dialogs.
                  </p>
                </div>

                <button
                  id="btn-admin-trigger-shield"
                  type="button"
                  onClick={() => {
                    onTriggerGraceShield();
                    addLog(`Toggled: Grace Shield simulated risk (now: ${!isSimulatedRisk})`);
                  }}
                  className={`w-full py-2 font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 ${
                    isSimulatedRisk 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{isSimulatedRisk ? 'Clear Shield Risk' : 'Simulate Missed Day'}</span>
                </button>
              </div>

              {/* Tool 4: Fast-forward Streak */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                darkMode ? 'bg-[#1E2836] border-[#334255]' : 'bg-white border-stone-200'
              } hover:border-amber-400/80 transition shadow-xs group`}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded">
                      Current: {stats.streakDays}d
                    </span>
                  </div>
                  <h4 className={`font-bold text-xs ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                    Increment Streak Milestones
                  </h4>
                  <p className="text-[10px] text-stone-500 leading-normal">
                    Quickly bump streak count to test badge rewards, multiplier unlocks, and level-ups.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-admin-add-5-streak"
                    type="button"
                    onClick={() => {
                      onAddTestStreak?.(5);
                      addLog('Added +5 days to streak milestone');
                    }}
                    className="flex-1 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    +5 Days
                  </button>
                  <button
                    id="btn-admin-add-20-streak"
                    type="button"
                    onClick={() => {
                      onAddTestStreak?.(20);
                      addLog('Added +20 days to streak milestone');
                    }}
                    className="flex-1 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold rounded-xl text-xs transition cursor-pointer border border-amber-500/30"
                  >
                    +20 Days
                  </button>
                </div>
              </div>

              {/* Tool 5: Reset Sandbox State */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                darkMode ? 'bg-[#1E2836] border-[#334255]' : 'bg-white border-stone-200'
              } hover:border-amber-400/80 transition shadow-xs group`}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase bg-purple-500/10 text-purple-600 px-1.5 py-0.5 rounded">
                      Sandbox Reset
                    </span>
                  </div>
                  <h4 className={`font-bold text-xs ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                    Reset Local Sandbox Data
                  </h4>
                  <p className="text-[10px] text-stone-500 leading-normal">
                    Re-seeds default starter psychology habits and clears mock test executions without signing out.
                  </p>
                </div>

                <button
                  id="btn-admin-reset-sandbox"
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset local sandbox data? Starter habits will be restored while preserving your creator session.')) {
                      onResetSandboxData();
                      addLog('Sandbox data re-seeded to defaults');
                    }
                  }}
                  className="w-full py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Sandbox</span>
                </button>
              </div>

              {/* Tool 6: Live Hardware & Telemetry Diagnostics */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                darkMode ? 'bg-[#1E2836] border-[#334255]' : 'bg-white border-stone-200'
              } shadow-xs`}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded">
                      Telemetry
                    </span>
                  </div>
                  <h4 className={`font-bold text-xs ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                    Live Environment Metrics
                  </h4>
                </div>

                <div className="space-y-1 text-[10px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-stone-400">PWA SW:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[130px]">{swStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Push Status:</span>
                    <span className="font-bold text-stone-700 dark:text-stone-300">{notificationPermission}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Storage Keys:</span>
                    <span className="font-bold text-stone-700 dark:text-stone-300">{storageCount} cached</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Active Habits:</span>
                    <span className="font-bold text-stone-700 dark:text-stone-300">{habits.length} items</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Real-time Dev Event Logs */}
          {testLog.length > 0 && (
            <div className={`p-3.5 rounded-2xl border font-mono text-[11px] ${
              darkMode ? 'bg-stone-950/80 border-stone-800 text-stone-300' : 'bg-stone-900 text-stone-200 border-stone-800'
            }`}>
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-stone-800 text-[10px] text-stone-400">
                <span>TELEMETRY DISPATCH CONSOLE</span>
                <button
                  type="button"
                  onClick={() => setTestLog([])}
                  className="hover:text-amber-400 cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>
              <div className="space-y-0.5">
                {testLog.map((log, i) => (
                  <div key={i} className="text-amber-300/90 leading-tight">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
