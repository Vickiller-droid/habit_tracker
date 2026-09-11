import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Shield, Bell, Download, Upload, Trash2, Smartphone, Accessibility, Sparkles, CreditCard, Check, AlertTriangle } from 'lucide-react';
import { UserProfile, UserStats, Habit } from '../types';

interface SettingsProps {
  userProfile: UserProfile;
  stats: UserStats;
  habits: Habit[];
  onUpgradePro: () => void;
  onRestoreData: (backup: { profile: UserProfile; stats: UserStats; habits: Habit[] }) => void;
  onClearAllData: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onUpdateProfile?: (profile: UserProfile) => void;
  onOpenTour?: () => void;
}

export default function Settings({ userProfile, stats, habits, onUpgradePro, onRestoreData, onClearAllData, darkMode, onToggleDarkMode, onUpdateProfile, onOpenTour }: SettingsProps) {
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(true);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notificationState, setNotificationState] = useState<string>('granted');
  const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false);

  const [editingName, setEditingName] = useState<string>(userProfile.name);
  const [editingIdentity, setEditingIdentity] = useState<string>(userProfile.identityAnchor || '');

  const handleSaveProfile = () => {
    if (!editingName.trim()) return;
    if (onUpdateProfile) {
      onUpdateProfile({
        ...userProfile,
        name: editingName.trim(),
        identityAnchor: editingIdentity.trim()
      });
      alert('Identity shift calibration successfully updated!');
    }
  };

  // JSON Export for offline backup
  const handleExportBackup = () => {
    const dataStr = JSON.stringify({
      version: '1.0.0',
      profile: userProfile,
      stats,
      habits
    }, null, 2);
    
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vicfungo_data_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // JSON Import for offline restore
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.profile && json.stats && Array.isArray(json.habits)) {
          onRestoreData({
            profile: json.profile,
            stats: json.stats,
            habits: json.habits
          });
          alert('Cognitive data restored successfully!');
        } else {
          alert('Invalid backup file format. Must contain profile, stats, and habits.');
        }
      } catch (err) {
        alert('Failed to parse backup file.');
      }
    };
    reader.readAsText(file);
  };

  const triggerMockNotification = () => {
    if (!remindersEnabled) return;
    
    // Trigger Native Browser System Notification
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        setNotificationState(permission);
        if (permission === 'granted') {
          new Notification('⏰ Vicfungo Habit Alert', {
            body: 'Dr. Gethro says: "Time to complete your contract and secure your multiplier!"',
            icon: '/favicon.ico',
            tag: 'vicfungo-settings-test',
            requireInteraction: true
          });
        }
      });
    }
  };

  const handleProPurchase = () => {
    onUpgradePro();
    setPurchaseSuccess(true);
    setTimeout(() => {
      setPurchaseSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6" id="settings-root">
      
      {/* Monetization "Vicfungo Pro" upgrade block */}
      {!userProfile.isPro ? (
        <div className="bg-gradient-to-r from-[#FF8A3D] to-amber-500 rounded-[32px] p-6 sm:p-8 text-white relative overflow-hidden shadow-premium-orange" id="pro-upgrade-card">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />
          
          <div className="max-w-md relative z-10">
            <span className="text-[10px] bg-white/20 text-white px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider">PREMIUM ACCESS</span>
            <h2 className="text-2xl font-display font-extrabold mt-3 tracking-tight">Unlock Dr. Gethro Pro Pathway</h2>
            <p className="text-xs text-orange-50 mt-2 leading-relaxed">
              Accelerate your behavioral psychology journey with unlimited cognitive assessments, customized AI prescription paths, and dynamic biometrics integration.
            </p>

            <div className="space-y-3.5 my-6">
              {[
                { title: 'Advanced Habit Analytics', desc: 'Identify your peak cognitive focus hours, stack efficiency curves, and weekly micro-movement completion rates.' },
                { title: 'Unlimited AI Consultation with Dr. Gethro', desc: 'Get unbounded behavioral advice, contextual habit corrections, and personalized positive reinforcement paths.' },
                { title: 'Extended Streak History & Milestones', desc: 'Secure your long-term streak logs, unlock multiplier badges, and visualize your cumulative behavioral trajectory.' },
                { title: 'Full Somatic Wearable Ecosystem', desc: 'Connect Oura, Whoop, Apple, Garmin, Samsung, or Google platforms to auto-scale habit difficulty based on sleep & physical load.' }
              ].map((feat) => (
                <div key={feat.title} className="flex items-start gap-2.5 text-xs">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-amber-200" />
                  </div>
                  <div>
                    <strong className="text-white block font-bold">{feat.title}</strong>
                    <span className="text-orange-100 text-[11px] leading-normal block mt-0.5">{feat.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <button
                id="btn-upgrade-pro-buy"
                onClick={handleProPurchase}
                className="px-6 py-3 bg-white text-[#FF8A3D] hover:bg-neutral-50 font-bold rounded-2xl transition shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                Upgrade to Pro (Simulated)
              </button>
              <span className="text-xs text-orange-100 font-mono">One-time payment of $19.99</span>
            </div>
          </div>
        </div>
      ) : (
        <div className={`border ${
          darkMode ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-emerald-50/20 border-emerald-100/50'
        } rounded-[32px] p-6 flex items-center justify-between flex-wrap gap-4 transition-colors`} id="pro-active-banner">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className={`font-bold ${darkMode ? 'text-stone-100' : 'text-stone-800'} text-sm`}>Vicfungo Pro Status Active</h3>
              <p className="text-xs text-stone-500 mt-0.5">Your behavioral analytics pathways are fully unlocked.</p>
            </div>
          </div>
          <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full font-bold">UNLIMITED ACCESS</span>
        </div>
      )}

      {/* Settings Options Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel 1: Notifications & Accessibility */}
        <div className={`p-6 rounded-[32px] border ${
          darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'
        } shadow-premium space-y-6 transition-colors`}>
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-[#FF8A3D]" />
              <h3 className={`font-bold ${darkMode ? 'text-stone-100' : 'text-stone-800'} text-sm`}>Notifications & Reminders</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-semibold ${darkMode ? 'text-stone-200' : 'text-stone-700'} text-xs`}>Simulate Routine Reminders</h4>
                  <p className="text-[10px] text-stone-500 mt-0.5">Receive reminders at your stacked routine times.</p>
                </div>
                <button
                  id="btn-toggle-reminders"
                  onClick={() => setRemindersEnabled(!remindersEnabled)}
                  className={`w-12 h-6 rounded-full p-0.5 transition duration-300 cursor-pointer ${
                    remindersEnabled ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-stone-200 dark:bg-stone-700'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition duration-300 ${
                    remindersEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {remindersEnabled && (
                <div className="pt-2">
                  <button
                    id="btn-test-notification"
                    type="button"
                    onClick={triggerMockNotification}
                    className={`px-4 py-2 border rounded-2xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
                      darkMode 
                        ? 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-750' 
                        : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                    }`}
                  >
                    Test Local Stack Reminder
                  </button>
                </div>
              )}
            </div>
          </div>

          <hr className={`${darkMode ? 'border-stone-800' : 'border-stone-100'}`} />

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Accessibility className="w-5 h-5 text-orange-500" />
              <h3 className={`font-bold ${darkMode ? 'text-stone-100' : 'text-stone-800'} text-sm`}>Accessibility Controls</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-semibold ${darkMode ? 'text-stone-200' : 'text-stone-700'} text-xs`}>Dark Mode Theme</h4>
                  <p className="text-[10px] text-stone-500 mt-0.5">Toggle on/off dark stone thematic overlay.</p>
                </div>
                <button
                  id="btn-toggle-darkmode"
                  onClick={onToggleDarkMode}
                  className={`w-12 h-6 rounded-full p-0.5 transition duration-300 cursor-pointer ${
                    darkMode ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-stone-200 dark:bg-stone-700'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition duration-300 ${
                    darkMode ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {onOpenTour && (
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                  <div>
                    <h4 className={`font-semibold ${darkMode ? 'text-stone-200' : 'text-stone-700'} text-xs`}>Interactive Guided App Tour 🚀</h4>
                    <p className="text-[10px] text-stone-500 mt-0.5">Replay the 6-step interactive onboarding tour anytime.</p>
                  </div>
                  <button
                    id="btn-replay-interactive-tour"
                    onClick={onOpenTour}
                    className="px-3 py-1.5 bg-orange-50 dark:bg-orange-950/30 text-[#FF8A3D] border border-orange-200 dark:border-orange-800 rounded-xl text-xs font-bold hover:bg-orange-100 dark:hover:bg-orange-900/40 transition cursor-pointer"
                  >
                    Launch Tour
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-semibold ${darkMode ? 'text-stone-200' : 'text-stone-700'} text-xs`}>High Contrast Mode</h4>
                  <p className="text-[10px] text-stone-500 mt-0.5">Increases layout borders and font contrast.</p>
                </div>
                <button
                  id="btn-toggle-contrast"
                  onClick={() => setHighContrast(!highContrast)}
                  className={`w-12 h-6 rounded-full p-0.5 transition duration-300 cursor-pointer ${
                    highContrast ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-stone-200 dark:bg-stone-700'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition duration-300 ${
                    highContrast ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 mb-2">DISPLAY FONT MASS</label>
                <div className={`flex p-1 rounded-2xl border ${
                  darkMode ? 'bg-stone-800 border-stone-750' : 'bg-[#FEFAF7] border-stone-200'
                }`}>
                  <button
                    id="btn-font-normal"
                    onClick={() => setFontSize('normal')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                      fontSize === 'normal' 
                        ? (darkMode ? 'bg-stone-700 text-stone-100 shadow-sm' : 'bg-white text-stone-800 shadow-sm') 
                        : 'text-stone-500'
                    }`}
                  >
                    Standard (Sans)
                  </button>
                  <button
                    id="btn-font-large"
                    onClick={() => setFontSize('large')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                      fontSize === 'large' 
                        ? (darkMode ? 'bg-stone-700 text-stone-100 shadow-sm' : 'bg-white text-stone-800 shadow-sm') 
                        : 'text-stone-500'
                    }`}
                  >
                    High-Contrast Heavy
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Panel 3: Identity Anchor Calibration */}
        <div className={`p-6 rounded-[32px] border ${
          darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'
        } shadow-premium space-y-6 transition-colors`}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#FF8A3D]" />
              <h3 className={`font-bold ${darkMode ? 'text-stone-100' : 'text-stone-800'} text-sm`}>Identity Shift Calibration</h3>
            </div>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              Define the persona you are working toward. Habit completion will act as direct psychological evidence confirming this identity.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="settings-edit-name" className="block text-[10px] font-bold text-stone-550 dark:text-stone-400 uppercase tracking-wider mb-1.5">Your Name</label>
                <input
                  id="settings-edit-name"
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-[#FF8A3D] ${
                    darkMode 
                      ? 'bg-stone-800 border-stone-700 text-stone-150' 
                      : 'bg-[#FEFAF7] border-stone-200 text-stone-850'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="settings-edit-identity" className="block text-[10px] font-bold text-stone-550 dark:text-stone-400 uppercase tracking-wider mb-1.5">Your Target Identity Anchor</label>
                <input
                  id="settings-edit-identity"
                  type="text"
                  value={editingIdentity}
                  onChange={(e) => setEditingIdentity(e.target.value)}
                  placeholder="e.g. I am a disciplined software engineer"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs italic focus:outline-none focus:border-[#FF8A3D] ${
                    darkMode 
                      ? 'bg-stone-800 border-stone-700 text-stone-150' 
                      : 'bg-[#FEFAF7] border-stone-200 text-stone-850'
                  }`}
                />
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {[
                    'I am a disciplined software engineer',
                    'I am someone who protects my mental clarity',
                    'I am a healthy and energetic person'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEditingIdentity(preset)}
                      className={`text-[9px] px-2 py-1 rounded-lg border transition cursor-pointer font-medium ${
                        editingIdentity === preset
                          ? 'bg-orange-50 dark:bg-orange-950/20 border-[#FF8A3D] text-[#FF8A3D]'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveProfile}
                className="w-full py-2.5 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-premium-orange"
              >
                Save Identity Shift Settings
              </button>
            </div>
          </div>
        </div>

        {/* Panel 2: Offline Backup & Restore */}
        <div className={`p-6 rounded-[32px] border ${
          darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'
        } shadow-premium space-y-6 transition-colors`}>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-[#FF8A3D]" />
              <h3 className={`font-bold ${darkMode ? 'text-stone-100' : 'text-stone-800'} text-sm`}>Data Portability & Offline Backup</h3>
            </div>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              Vicfungo prioritizes your cognitive data ownership. Since we run offline-first, you can back up your logs to a JSON file or restore them instantly on other devices.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                id="btn-backup-export"
                onClick={handleExportBackup}
                className={`p-4 border rounded-2xl text-center transition cursor-pointer flex flex-col items-center gap-2 ${
                  darkMode 
                    ? 'bg-stone-800/50 hover:bg-stone-800 border-stone-700' 
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
                }`}
              >
                <Download className="w-5 h-5 text-stone-500" />
                <span className={`font-bold ${darkMode ? 'text-stone-200' : 'text-stone-800'} text-xs`}>Backup to File</span>
                <span className="text-[9px] text-stone-500">Downloads as JSON</span>
              </button>

              <button
                id="btn-backup-import-trigger"
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 border rounded-2xl text-center transition cursor-pointer flex flex-col items-center gap-2 ${
                  darkMode 
                    ? 'bg-stone-800/50 hover:bg-stone-800 border-stone-700' 
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
                }`}
              >
                <Upload className="w-5 h-5 text-stone-500" />
                <span className={`font-bold ${darkMode ? 'text-stone-200' : 'text-stone-800'} text-xs`}>Restore from Backup</span>
                <span className="text-[9px] text-stone-500">Upload JSON backup</span>
              </button>

              <input
                id="backup-file-input"
                type="file"
                ref={fileInputRef}
                onChange={handleImportBackup}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          <hr className={`${darkMode ? 'border-stone-800' : 'border-stone-100'}`} />

          <div>
            <div className="flex items-center gap-2 mb-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm">Danger Zone</h3>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Clearing data will remove all physical habit entries, streak progressions, and Dr. Gethro AI history. This is irreversible.
            </p>

            <button
              id="btn-clear-all-data"
              onClick={() => {
                onClearAllData();
              }}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Reset Platform & Onboarding
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
