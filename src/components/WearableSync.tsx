import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Apple, Check, RefreshCw, Smartphone, Award, Sparkles, 
  BatteryCharging, ShieldCheck, Moon, Bluetooth, AlertCircle, 
  AlertTriangle, ShieldAlert, Compass, Settings, Loader2, Info, X, Radio
} from 'lucide-react';
import { WearableDevice, UserStats } from '../types';
import { playSuccessSound } from '../utils/audio';

interface WearableSyncProps {
  stats: UserStats;
  onSyncComplete: (steps: number, sleep: number, xpReward: number) => void;
  darkMode?: boolean;
}

export default function WearableSync({ stats, onSyncComplete, darkMode = false }: WearableSyncProps) {
  // Load wearable devices state with persistence or generic starting structures
  const [devices, setDevices] = useState<WearableDevice[]>(() => {
    const cached = localStorage.getItem('vicfungo_wearables');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Ensure standard generic names when disconnected
        return parsed.map((d: WearableDevice) => {
          if (!d.connected) {
            if (d.type === 'apple') return { ...d, name: 'Apple Watch' };
            if (d.type === 'fitbit') return { ...d, name: 'Fitbit Wearable' };
            if (d.type === 'garmin') return { ...d, name: 'Garmin Wearable' };
            if (d.type === 'oura') return { ...d, name: 'Oura Ring' };
            if (d.type === 'whoop') return { ...d, name: 'Whoop Band' };
            if (d.type === 'samsung') return { ...d, name: 'Samsung Galaxy Watch' };
            if (d.type === 'other') return { ...d, name: 'Other Device / Universal Health Connect' };
          }
          return d;
        });
      } catch (e) {
        console.warn('Failed to parse cached wearables, fallback to default', e);
      }
    }
    return [
      { name: 'Apple Watch', type: 'apple', connected: false, lastSyncedAt: '--', stepsToday: 0, sleepHours: 0 },
      { name: 'Fitbit Wearable', type: 'fitbit', connected: false, lastSyncedAt: '--', stepsToday: 0, sleepHours: 0 },
      { name: 'Garmin Wearable', type: 'garmin', connected: false, lastSyncedAt: '--', stepsToday: 0, sleepHours: 0 },
      { name: 'Oura Ring', type: 'oura', connected: false, lastSyncedAt: '--', stepsToday: 0, sleepHours: 0 },
      { name: 'Whoop Band', type: 'whoop', connected: false, lastSyncedAt: '--', stepsToday: 0, sleepHours: 0 },
      { name: 'Samsung Galaxy Watch', type: 'samsung', connected: false, lastSyncedAt: '--', stepsToday: 0, sleepHours: 0 },
      { name: 'Other Device / Universal Health Connect', type: 'other', connected: false, lastSyncedAt: '--', stepsToday: 0, sleepHours: 0 }
    ];
  });

  const saveDevices = (updated: WearableDevice[]) => {
    setDevices(updated);
    localStorage.setItem('vicfungo_wearables', JSON.stringify(updated));
  };

  const [syncingDevice, setSyncingDevice] = useState<string | null>(null);
  const [syncedData, setSyncedData] = useState<{ steps: number; sleep: number; calories: number } | null>(null);
  const [somaticAdvice, setSomaticAdvice] = useState<string>('');

  // Pairing wizard modal states
  const [pairingDevice, setPairingDevice] = useState<WearableDevice | null>(null);
  const [wizardStep, setWizardStep] = useState<
    'permissions' | 'scanning' | 'device_select' | 'pairing_progress' | 'success' | 'bluetooth_off_view' | 'denied_view' | 'empty_view' | 'error_view'
  >('permissions');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [pairingProgress, setPairingProgress] = useState<number>(0);
  const [scanningProgress, setScanningProgress] = useState<number>(0);
  
  // Dynamic scanner logs to show in the UI for immersion
  const [scanLogs, setScanLogs] = useState<string[]>([]);

  // Simulation Overrides (For full interactive testing of error / disabled / denied states)
  const [simPermission, setSimPermission] = useState<'granted' | 'denied'>('granted');
  const [simBluetooth, setSimBluetooth] = useState<boolean>(true);
  const [simScanResult, setSimScanResult] = useState<'has_devices' | 'empty' | 'fail'>('has_devices');
  const [showSimulatorPanel, setShowSimulatorPanel] = useState<boolean>(true);

  // Handle opening pairing dialog
  const handleInitiatePairing = (device: WearableDevice) => {
    setPairingDevice(device);
    setSelectedModel(null);
    setPairingProgress(0);
    setScanningProgress(0);
    setScanLogs([]);
    
    // Automatically reset step based on current simulation state
    if (simPermission === 'denied') {
      setWizardStep('denied_view');
    } else {
      setWizardStep('permissions');
    }
  };

  // Run scanning animation & timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (wizardStep === 'scanning') {
      setScanningProgress(0);
      setScanLogs(['Initializing BLE controller...', 'Listening on somatic broadcast frequencies...']);
      
      interval = setInterval(() => {
        setScanningProgress(prev => {
          const next = prev + 8;
          
          // Inject realistic logs at intervals
          if (next === 24) setScanLogs(l => [...l, 'Received beacon advertisements...']);
          if (next === 48) setScanLogs(l => [...l, 'Parsing telemetry protocols...']);
          if (next === 72) setScanLogs(l => [...l, 'Filtering local peripheral noise...']);
          if (next === 88) setScanLogs(l => [...l, 'Resolving device attributes...']);

          if (next >= 100) {
            clearInterval(interval);
            // Decide destination based on simulator settings
            setTimeout(() => {
              if (!simBluetooth) {
                setWizardStep('bluetooth_off_view');
              } else if (simScanResult === 'empty') {
                setWizardStep('empty_view');
              } else if (simScanResult === 'fail') {
                setWizardStep('error_view');
              } else {
                setWizardStep('device_select');
              }
            }, 400);
            return 100;
          }
          return next;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [wizardStep, simBluetooth, simScanResult]);

  // Run pairing progress animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (wizardStep === 'pairing_progress') {
      setPairingProgress(0);
      interval = setInterval(() => {
        setPairingProgress(prev => {
          const next = prev + 5;
          if (next >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setWizardStep('success');
              playSuccessSound();
            }, 300);
            return 100;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [wizardStep]);

  // Disconnect a paired device
  const handleDisconnect = (device: WearableDevice) => {
    let genericName = 'Somatic Tracker';
    if (device.type === 'apple') genericName = 'Apple Watch';
    else if (device.type === 'fitbit') genericName = 'Fitbit Wearable';
    else if (device.type === 'garmin') genericName = 'Garmin Wearable';
    else if (device.type === 'oura') genericName = 'Oura Ring';
    else if (device.type === 'whoop') genericName = 'Whoop Band';
    else if (device.type === 'samsung') genericName = 'Samsung Galaxy Watch';
    else if (device.type === 'other') genericName = 'Other Device / Universal Health Connect';
    const updated = devices.map(d => d.type === device.type ? { 
      ...d, 
      connected: false, 
      name: genericName,
      lastSyncedAt: '--', 
      stepsToday: 0, 
      sleepHours: 0 
    } : d);
    saveDevices(updated);
    setSyncedData(null);
    setSomaticAdvice('');
  };

  // Finish pairing process successfully
  const handleCompletePairing = () => {
    if (!pairingDevice || !selectedModel) return;

    const updated = devices.map(d => d.type === pairingDevice.type ? {
      ...d,
      connected: true,
      name: selectedModel,
      lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    } : d);

    saveDevices(updated);
    setPairingDevice(null);
  };

  // Sync data from connected device
  const handleSync = (device: WearableDevice) => {
    setSyncingDevice(device.name);
    setSyncedData(null);
    setSomaticAdvice('');

    setTimeout(() => {
      // Generate randomized somatic data
      const steps = Math.floor(Math.random() * 5000) + 7000; // 7k - 12k
      const sleep = Number((Math.random() * 3 + 5.5).toFixed(1)); // 5.5 - 8.5 hours
      const calories = Math.floor(steps * 0.04) + 1500;

      setSyncedData({ steps, sleep, calories });
      setSyncingDevice(null);

      const updated = devices.map(d => d.type === device.type ? {
        ...d,
        lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stepsToday: steps,
        sleepHours: sleep
      } : d);
      saveDevices(updated);

      // Trigger Dr. Gethro's Somatic Diagnosis
      let advice = "";
      if (sleep >= 7.2) {
        advice = `Outstanding! Your sleep node is at ${sleep} hours. This triggers high levels of neural plasticity and decision capacity. Today is a high-cognitive capital day—perfect for knocking out your HARD difficulty habits with zero mental friction. Your focus remains razor sharp.`;
      } else {
        advice = `I see sleep was slightly low today at ${sleep} hours. Under sleep compression, executive control centers have 15% lower friction tolerance. I advise using Friction Reduction today—complete just 2 minutes of your hardest habits to secure the loop.`;
      }
      setSomaticAdvice(advice);

      // Reward user
      onSyncComplete(steps, sleep, 100);
    }, 2000);
  };

  // Mock devices for select lists
  const getDiscoveredDevicesList = (type: string) => {
    if (type === 'apple') {
      return [
        { model: 'Apple Watch Ultra 2', signal: 'Very Strong', mac: 'AW:98:AA:C4' },
        { model: 'Apple Watch Series 10', signal: 'Strong', mac: 'AW:43:7B:DE' },
        { model: 'Apple Watch SE', signal: 'Moderate', mac: 'AW:1F:D5:19' }
      ];
    }
    if (type === 'fitbit') {
      return [
        { model: 'Fitbit Charge 6 Pro', signal: 'Strong', mac: 'FB:77:99:C1' },
        { model: 'Fitbit Sense 2', signal: 'Strong', mac: 'FB:31:AA:FF' },
        { model: 'Fitbit Inspire 3', signal: 'Weak', mac: 'FB:12:88:B5' }
      ];
    }
    if (type === 'garmin') {
      return [
        { model: 'Garmin Venu 3S', signal: 'Very Strong', mac: 'GM:55:01:8A' },
        { model: 'Garmin Fenix 7 Pro', signal: 'Strong', mac: 'GM:09:44:E2' },
        { model: 'Garmin Forerunner 965', signal: 'Moderate', mac: 'GM:84:BC:F0' }
      ];
    }
    if (type === 'oura') {
      return [
        { model: 'Oura Ring Gen 4 Horizon', signal: 'Very Strong', mac: 'OR:98:CD:F2' },
        { model: 'Oura Ring Gen 3 Heritage', signal: 'Strong', mac: 'OR:7A:4E:91' }
      ];
    }
    if (type === 'whoop') {
      return [
        { model: 'Whoop Strap 4.0', signal: 'Very Strong', mac: 'WP:A4:7B:00' },
        { model: 'Whoop Strap 3.0', signal: 'Moderate', mac: 'WP:E3:8F:D5' }
      ];
    }
    if (type === 'samsung') {
      return [
        { model: 'Samsung Galaxy Watch Ultra', signal: 'Very Strong', mac: 'SG:92:B5:1C' },
        { model: 'Samsung Galaxy Watch 7', signal: 'Strong', mac: 'SG:34:F1:6E' }
      ];
    }
    return [
      { model: 'Google Pixel Watch 3', signal: 'Very Strong', mac: 'GP:8A:2F:B0' },
      { model: 'Generic BLE Somatic Sensor', signal: 'Strong', mac: 'GN:BB:00:AA' },
      { model: 'Universal Health Connect Gateway', signal: 'Strong', mac: 'HC:EF:EE:AA' }
    ];
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="wearable-sync-root">
      
      {/* Top Banner */}
      <div className={`p-6 rounded-[32px] border ${
        darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'
      } shadow-premium`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF8A3D]/10 rounded-full flex items-center justify-center text-[#FF8A3D]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className={`text-xl font-display font-black tracking-tight ${darkMode ? 'text-white' : 'text-stone-800'}`}>
              Somatic Integration Node
            </h2>
            <p className={`text-xs ${darkMode ? 'text-stone-400' : 'text-stone-500'} mt-0.5`}>
              Synchronize biometrics from your physical wearable to unlock automatic somatic multipliers and AI behavior custom fits.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Device Configuration List */}
        <div className={`p-6 rounded-[32px] border ${
          darkMode ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-100 text-stone-800'
        } shadow-premium lg:col-span-1 space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-orange-500 font-mono">Available Wearables</h3>
            <span className="text-[10px] font-mono bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full text-stone-500 font-semibold">
              BLE 5.3 Active
            </span>
          </div>
          
          <div className="space-y-3">
            {devices.map((device, idx) => (
              <div 
                key={`wearable-${device.type}-${idx}`} 
                id={`wearable-card-${device.type}`}
                className={`p-4 rounded-2xl border transition-all duration-300 ${
                  device.connected 
                    ? 'border-orange-200 bg-orange-50/10 dark:border-orange-950/30 dark:bg-orange-950/5' 
                    : darkMode ? 'border-stone-800 bg-stone-800/10' : 'border-stone-100 bg-stone-50/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                      device.connected 
                        ? 'bg-orange-100/50 border-orange-200 text-[#FF8A3D] dark:bg-orange-950/50 dark:border-orange-900' 
                        : darkMode ? 'bg-stone-800 border-stone-750 text-stone-400' : 'bg-[#F5F1EE] border-stone-250 text-stone-500'
                    }`}>
                      {device.type === 'apple' ? <Apple className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className={`font-black text-xs ${darkMode ? 'text-white' : 'text-stone-800'}`}>{device.name}</h4>
                      <p className={`text-[9px] font-mono font-bold tracking-wider ${
                        device.connected ? 'text-emerald-500' : 'text-stone-400'
                      }`}>
                        {device.connected ? 'PAIRED & SECURE' : 'DISCONNECTED'}
                      </p>
                    </div>
                  </div>

                  <button
                    id={`btn-connect-device-${device.type}`}
                    onClick={() => device.connected ? handleDisconnect(device) : handleInitiatePairing(device)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-tight transition duration-200 cursor-pointer ${
                      device.connected 
                        ? darkMode ? 'bg-stone-800 hover:bg-stone-700 text-stone-300' : 'bg-[#F5F1EE] hover:bg-stone-200 text-stone-600'
                        : 'bg-[#FF8A3D] hover:bg-[#e77a2f] text-white shadow-sm'
                    }`}
                  >
                    {device.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>

                {device.connected && (
                  <div className="mt-4 pt-3 border-t border-dashed border-stone-200 dark:border-stone-800 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-stone-400">LAST SYNCED: {device.lastSyncedAt}</span>
                    <button
                      id={`btn-sync-device-${device.type}`}
                      disabled={syncingDevice === device.name}
                      onClick={() => handleSync(device)}
                      className="px-3 py-1 bg-orange-50 dark:bg-orange-950/30 text-[#FF8A3D] hover:bg-orange-100 dark:hover:bg-orange-900/40 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      {syncingDevice === device.name ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                      {syncingDevice === device.name ? 'Syncing...' : 'Sync Now'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sync Output & Diagnostics */}
        <div className={`p-6 rounded-[32px] border ${
          darkMode ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-100 text-stone-800'
        } shadow-premium lg:col-span-2 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Smartphone className="w-5 h-5 text-[#FF8A3D]" />
              <h3 className="font-black text-stone-800 dark:text-white text-xs uppercase tracking-wider font-mono">
                Biometric Diagnostic Center
              </h3>
            </div>

            {syncedData ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 animate-scaleIn" id="wearable-data-grids">
                <div className={`p-4 rounded-2xl text-center border ${
                  darkMode ? 'bg-stone-800/40 border-stone-750' : 'bg-orange-50/15 border-orange-100/50'
                }`}>
                  <Activity className="w-6 h-6 text-[#FF8A3D] mx-auto mb-1.5" />
                  <span className="block text-[9px] text-stone-400 font-bold uppercase tracking-wider font-mono">STEPS REGISTERED</span>
                  <span className={`text-lg font-display font-black ${darkMode ? 'text-white' : 'text-stone-800'}`}>
                    {syncedData.steps.toLocaleString()}
                  </span>
                </div>
                <div className={`p-4 rounded-2xl text-center border ${
                  darkMode ? 'bg-stone-800/40 border-stone-750' : 'bg-purple-50/15 border-purple-100/50'
                }`}>
                  <Moon className="w-6 h-6 text-purple-500 mx-auto mb-1.5" />
                  <span className="block text-[9px] text-stone-400 font-bold uppercase tracking-wider font-mono font-mono">SLEEP HOURS</span>
                  <span className={`text-lg font-display font-black ${darkMode ? 'text-white' : 'text-stone-800'}`}>
                    {syncedData.sleep} hrs
                  </span>
                </div>
                <div className={`p-4 rounded-2xl text-center border ${
                  darkMode ? 'bg-stone-800/40 border-stone-750' : 'bg-emerald-50/15 border-emerald-100/50'
                }`}>
                  <BatteryCharging className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                  <span className="block text-[9px] text-stone-400 font-bold uppercase tracking-wider font-mono">ENERGY BURNED</span>
                  <span className={`text-lg font-display font-black ${darkMode ? 'text-white' : 'text-stone-800'}`}>
                    {syncedData.calories} kcal
                  </span>
                </div>
              </div>
            ) : (
              <div className={`py-12 text-center border-2 border-dashed rounded-[32px] mb-6 ${
                darkMode ? 'border-stone-800' : 'border-stone-200'
              }`}>
                <Smartphone className="w-8 h-8 text-stone-400 dark:text-stone-600 mx-auto mb-2 animate-pulse" />
                <p className={`text-xs font-medium px-4 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                  Connect and synchronize a paired wearable to load dynamic biometric streams.
                </p>
              </div>
            )}

            {somaticAdvice && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border ${
                  darkMode ? 'bg-stone-800/60 border-stone-750' : 'bg-orange-50/20 border-orange-100'
                }`}
                id="wearable-somatic-advice-box"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-4 h-4 text-[#FF8A3D]" />
                  <h4 className="text-[10px] font-black text-[#FF8A3D] uppercase tracking-wider font-mono">
                    DOCTOR GETHRO&apos;S SOMATIC DIAGNOSIS
                  </h4>
                </div>
                <p className={`text-xs leading-relaxed ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                  {somaticAdvice}
                </p>
              </motion.div>
            )}
          </div>

          {syncedData && (
            <div className={`mt-6 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
              darkMode ? 'border-stone-800' : 'border-stone-100'
            }`}>
              <div className="flex items-center gap-1 text-xs text-emerald-500 font-semibold">
                <ShieldCheck className="w-4 h-4" /> Biometric Sync Secure & Verifiable
              </div>
              <div className="inline-flex items-center gap-1 bg-orange-50 dark:bg-orange-950/25 text-[#FF8A3D] font-mono font-bold text-[10px] px-2.5 py-1 rounded-full border border-orange-100/50 dark:border-orange-900/30">
                🏆 +100 XP SYNC BONUS APPLIED
              </div>
            </div>
          )}
        </div>

      </div>

      {/* --- pairing wizard modal --- */}
      <AnimatePresence>
        {pairingDevice && (
          <div 
            id="pairing-wizard-backdrop"
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div
              id="pairing-wizard-container"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className={`w-full max-w-lg p-6 sm:p-8 rounded-[36px] border ${
                darkMode ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-orange-100 text-stone-800'
              } shadow-2xl relative`}
            >
              
              {/* Close Button */}
              <button 
                id="btn-close-pairing-wizard"
                onClick={() => setPairingDevice(null)}
                className={`absolute top-5 right-5 p-2 rounded-full border transition ${
                  darkMode ? 'hover:bg-stone-800 border-stone-800 text-stone-400' : 'hover:bg-stone-50 border-stone-100 text-stone-500'
                }`}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Title Header */}
              <div className="mb-6">
                <span className="text-[9px] font-mono font-bold text-orange-500 uppercase tracking-widest block mb-1">
                  SECURE SOMATIC CONTRACT MODULE
                </span>
                <h3 className={`text-xl font-display font-black tracking-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                  {pairingDevice.name} Integration
                </h3>
                <p className={`text-[11px] leading-normal ${darkMode ? 'text-stone-400' : 'text-stone-500'} mt-0.5`}>
                  Calibrating biometric telemetry flows into Doctor Gethro&apos;s adaptive behavioral system.
                </p>
              </div>

              {/* STEP INTERFACE */}
              <div className={`min-h-[220px] rounded-2xl p-5 border ${
                darkMode ? 'bg-stone-950/40 border-stone-850' : 'bg-[#FEFAF7]/40 border-orange-50/60'
              } flex flex-col justify-center`}>
                
                {/* 1. PERMISSIONS REQUEST */}
                {wizardStep === 'permissions' && (
                  <div className="space-y-4 text-center animate-fadeIn" id="step-permissions-panel">
                    <div className="w-14 h-14 bg-orange-100/60 dark:bg-orange-950/40 text-[#FF8A3D] rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <ShieldAlert className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-extrabold ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                        Bluetooth Peripheral Authorization
                      </h4>
                      <p className={`text-xs mt-1.5 leading-relaxed max-w-sm mx-auto ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        Vicfungo requires authorization to initialize local Bluetooth scans for telemetry handshakes with your nearby wearable.
                      </p>
                    </div>
                    <div className="flex gap-2.5 pt-2">
                      <button
                        id="btn-deny-permissions"
                        onClick={() => {
                          setSimPermission('denied');
                          setWizardStep('denied_view');
                        }}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                          darkMode ? 'border-stone-800 text-stone-400 hover:bg-stone-800' : 'border-stone-200 text-stone-500 hover:bg-stone-50'
                        }`}
                      >
                        Deny Scan
                      </button>
                      <button
                        id="btn-allow-permissions"
                        onClick={() => {
                          setSimPermission('granted');
                          if (!simBluetooth) {
                            setWizardStep('bluetooth_off_view');
                          } else {
                            setWizardStep('scanning');
                          }
                        }}
                        className="flex-1 py-2 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white rounded-xl text-xs font-bold transition shadow-premium-orange cursor-pointer"
                      >
                        Grant scan permission
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. SCANNING & RADAR */}
                {wizardStep === 'scanning' && (
                  <div className="space-y-4 text-center animate-fadeIn" id="step-scanning-panel">
                    <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 border-2 border-[#FF8A3D]/20 rounded-full animate-ping" />
                      <div className="absolute inset-2 border border-[#FF8A3D]/30 rounded-full" />
                      <div className="w-12 h-12 bg-[#FF8A3D]/10 text-[#FF8A3D] rounded-full flex items-center justify-center">
                        <Compass className="w-6 h-6 animate-spin duration-3000" />
                      </div>
                    </div>
                    <div>
                      <h4 className={`text-xs font-mono font-bold text-orange-500 tracking-wider`}>
                        SEARCHING FOR NEARBY {pairingDevice.name.toUpperCase()} SENSORS...
                      </h4>
                      <p className={`text-[11px] leading-relaxed max-w-xs mx-auto mt-1 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                        Probing somatic BLE beacon frequencies. Ensure your device is close and has pairing mode active.
                      </p>
                    </div>

                    {/* Technical Console Output */}
                    <div className="w-full bg-stone-950 p-3 rounded-xl border border-stone-850 text-left font-mono text-[9px] text-emerald-500 h-24 overflow-y-auto space-y-1">
                      {scanLogs.map((log, index) => (
                        <div key={`scan-log-${index}`} className="flex gap-1.5 items-center">
                          <span className="text-stone-600 font-bold select-none">&gt;</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>

                    {/* Linear progress bar */}
                    <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#FF8A3D] transition-all duration-150"
                        style={{ width: `${scanningProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 3. DEVICE SELECT */}
                {wizardStep === 'device_select' && (
                  <div className="space-y-4 animate-fadeIn" id="step-device-select-panel">
                    <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                      <Bluetooth className="w-4 h-4 text-[#FF8A3D] animate-pulse" />
                      <span className="text-[11px] font-bold font-mono uppercase tracking-wider">
                        Available compatible nodes ({getDiscoveredDevicesList(pairingDevice.type).length} found)
                      </span>
                    </div>

                    <div className="space-y-2">
                      {getDiscoveredDevicesList(pairingDevice.type).map((item, idx) => (
                        <button
                          key={`discovered-${item.model}-${idx}`}
                          id={`discovered-item-${item.model.replace(/\s+/g, '-').toLowerCase()}`}
                          onClick={() => setSelectedModel(item.model)}
                          className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                            selectedModel === item.model
                              ? 'border-[#FF8A3D] bg-orange-50/10 dark:border-orange-500 dark:bg-orange-950/10 shadow-sm shadow-orange-500/10'
                              : darkMode ? 'border-stone-800 bg-stone-800/20 hover:bg-stone-800/40 text-stone-300' : 'border-stone-150 bg-white hover:bg-stone-50 text-stone-700'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-xs flex items-center gap-2">
                              {pairingDevice.type === 'apple' && <Apple className="w-3.5 h-3.5 text-stone-400" />}
                              <span>{item.model}</span>
                            </div>
                            <span className="text-[9px] font-mono text-stone-400 mt-0.5 block uppercase">MAC NODE ID: {item.mac}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              item.signal === 'Very Strong' ? 'bg-emerald-100/50 dark:bg-emerald-950/40 text-emerald-500' : 'bg-orange-100/50 dark:bg-orange-950/40 text-orange-500'
                            }`}>
                              RSSI {item.signal}
                            </span>
                            {selectedModel === item.model && (
                              <Check className="w-4 h-4 text-[#FF8A3D] font-extrabold" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <button
                        id="btn-rescan"
                        onClick={() => setWizardStep('scanning')}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${
                          darkMode ? 'border-stone-800 text-stone-400 hover:bg-stone-800' : 'border-stone-200 text-stone-500 hover:bg-stone-50'
                        }`}
                      >
                        Scan again
                      </button>
                      <button
                        id="btn-confirm-pairing"
                        disabled={!selectedModel}
                        onClick={() => setWizardStep('pairing_progress')}
                        className={`flex-1 py-2.5 text-white rounded-xl text-xs font-bold transition shadow-premium-orange cursor-pointer ${
                          selectedModel ? 'bg-[#FF8A3D] hover:bg-[#e77a2f]' : 'bg-stone-300 dark:bg-stone-800 text-stone-400 cursor-not-allowed shadow-none'
                        }`}
                      >
                        Explicitly confirm connection
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. PAIRING PROGRESS / CRYPTOGRAPHY */}
                {wizardStep === 'pairing_progress' && (
                  <div className="space-y-4 text-center animate-fadeIn" id="step-pairing-progress-panel">
                    <div className="w-12 h-12 bg-[#FF8A3D]/10 text-[#FF8A3D] rounded-full flex items-center justify-center mx-auto">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-stone-800 dark:text-white">
                        Establishing secure somatic bond
                      </h4>
                      <p className={`text-xs mt-1 leading-relaxed ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                        Exchanging biometric security signatures & registering callback node.
                      </p>
                    </div>

                    {/* Progress tracking */}
                    <div className="space-y-1.5 max-w-xs mx-auto">
                      <div className="flex justify-between text-[9px] font-mono text-stone-400">
                        <span>HANDSHAKE HANDLER</span>
                        <span>{pairingProgress}%</span>
                      </div>
                      <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-100"
                          style={{ width: `${pairingProgress}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-500 block">
                      {pairingProgress < 30 && 'Verifying asymmetric keys...'}
                      {pairingProgress >= 30 && pairingProgress < 65 && 'Negotiating MTU telemetry size...'}
                      {pairingProgress >= 65 && pairingProgress < 90 && 'Configuring background task sync frequency...'}
                      {pairingProgress >= 90 && 'Securing diagnostic socket connection...'}
                    </span>
                  </div>
                )}

                {/* 5. SUCCESS NODE */}
                {wizardStep === 'success' && (
                  <div className="space-y-4 text-center animate-fadeIn" id="step-success-panel">
                    <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                      <Check className="w-7 h-7 stroke-[3px]" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-emerald-500">
                        Pairing Completed Successfully!
                      </h4>
                      <p className={`text-xs mt-1 leading-relaxed max-w-sm mx-auto ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        <strong>{selectedModel}</strong> is now securely authenticated with Vicfungo. Telemetry logs will influence coaching routines.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        id="btn-complete-pairing-wizard"
                        onClick={handleCompletePairing}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/20 cursor-pointer animate-pulse"
                      >
                        Complete integration & close
                      </button>
                    </div>
                  </div>
                )}

                {/* 6. BLUETOOTH OFF STATE */}
                {wizardStep === 'bluetooth_off_view' && (
                  <div className="space-y-4 text-center animate-fadeIn" id="step-bluetooth-off-panel">
                    <div className="w-14 h-14 bg-red-100/80 dark:bg-red-950/30 text-red-500 rounded-full flex items-center justify-center mx-auto">
                      <AlertTriangle className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-extrabold ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                        Bluetooth is Disabled
                      </h4>
                      <p className={`text-xs mt-1.5 leading-relaxed max-w-sm mx-auto ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        We detected your Bluetooth controller is turned off. Please enable Bluetooth in your system settings to run a biometric scan.
                      </p>
                    </div>
                    <div className="flex gap-2.5 pt-2">
                      <button
                        id="btn-bluetooth-off-close"
                        onClick={() => setPairingDevice(null)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                          darkMode ? 'border-stone-800 text-stone-400 hover:bg-stone-800' : 'border-stone-200 text-stone-500 hover:bg-stone-50'
                        }`}
                      >
                        Close
                      </button>
                      <button
                        id="btn-simulate-bluetooth-on"
                        onClick={() => {
                          setSimBluetooth(true);
                          setWizardStep('scanning');
                        }}
                        className="flex-1 py-2 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white rounded-xl text-xs font-bold transition shadow-premium-orange cursor-pointer"
                      >
                        Simulate Bluetooth ON
                      </button>
                    </div>
                  </div>
                )}

                {/* 7. PERMISSION DENIED VIEW */}
                {wizardStep === 'denied_view' && (
                  <div className="space-y-4 text-center animate-fadeIn" id="step-permission-denied-panel">
                    <div className="w-14 h-14 bg-red-100/80 dark:bg-red-950/30 text-red-500 rounded-full flex items-center justify-center mx-auto">
                      <ShieldAlert className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-extrabold ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                        Permission Denied
                      </h4>
                      <p className={`text-xs mt-1.5 leading-relaxed max-w-sm mx-auto ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        Telemetry scan authorization was declined. You can adjust browser permissions or click the simulation trigger below to authorize scan.
                      </p>
                    </div>
                    <div className="flex gap-2.5 pt-2">
                      <button
                        id="btn-permission-denied-close"
                        onClick={() => setPairingDevice(null)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                          darkMode ? 'border-stone-800 text-stone-400 hover:bg-stone-800' : 'border-stone-200 text-stone-500 hover:bg-stone-50'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        id="btn-simulate-grant-permission"
                        onClick={() => {
                          setSimPermission('granted');
                          if (!simBluetooth) {
                            setWizardStep('bluetooth_off_view');
                          } else {
                            setWizardStep('scanning');
                          }
                        }}
                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
                      >
                        Grant scan permission
                      </button>
                    </div>
                  </div>
                )}

                {/* 8. NO DEVICES DETECTED VIEW */}
                {wizardStep === 'empty_view' && (
                  <div className="space-y-4 text-center animate-fadeIn" id="step-empty-devices-panel">
                    <div className="w-14 h-14 bg-stone-100 dark:bg-stone-800/80 text-stone-400 dark:text-stone-500 rounded-full flex items-center justify-center mx-auto">
                      <Compass className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-extrabold ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                        No compatible devices found
                      </h4>
                      <p className={`text-xs mt-1.5 leading-relaxed max-w-sm mx-auto ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        No peripheral beacon advertisements detected. Make sure your physical watch has Bluetooth enabled, is within 3 meters, and isn&apos;t locked to another sync client.
                      </p>
                    </div>
                    <div className="flex gap-2.5 pt-2">
                      <button
                        id="btn-empty-close"
                        onClick={() => setPairingDevice(null)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                          darkMode ? 'border-stone-800 text-stone-400 hover:bg-stone-800' : 'border-stone-200 text-stone-500 hover:bg-stone-50'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        id="btn-empty-retry"
                        onClick={() => setWizardStep('scanning')}
                        className="flex-1 py-2 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white rounded-xl text-xs font-bold transition shadow-premium-orange cursor-pointer"
                      >
                        Try scanning again
                      </button>
                    </div>
                  </div>
                )}

                {/* 9. CRITICAL CONNECTION ERROR */}
                {wizardStep === 'error_view' && (
                  <div className="space-y-4 text-center animate-fadeIn" id="step-error-connection-panel">
                    <div className="w-14 h-14 bg-red-100/80 dark:bg-red-950/30 text-red-500 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-extrabold ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                        BLE Controller Timeout
                      </h4>
                      <p className={`text-xs mt-1.5 leading-relaxed max-w-sm mx-auto ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        The device advertisement channel experienced a core handshake disruption. Please power cycle your watch controller and try again.
                      </p>
                    </div>
                    <div className="flex gap-2.5 pt-2">
                      <button
                        id="btn-error-close"
                        onClick={() => setPairingDevice(null)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                          darkMode ? 'border-stone-800 text-stone-400 hover:bg-stone-800' : 'border-stone-200 text-stone-500 hover:bg-stone-50'
                        }`}
                      >
                        Abort Connection
                      </button>
                      <button
                        id="btn-error-retry"
                        onClick={() => setWizardStep('scanning')}
                        className="flex-1 py-2 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white rounded-xl text-xs font-bold transition shadow-premium-orange cursor-pointer"
                      >
                        Re-initiate scan
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* SIMULATION TEST PANEL */}
              <div className={`mt-5 pt-4 border-t ${
                darkMode ? 'border-stone-800 text-stone-300' : 'border-stone-100 text-stone-700'
              }`}>
                <button
                  id="btn-toggle-simulator-panel"
                  onClick={() => setShowSimulatorPanel(!showSimulatorPanel)}
                  className="w-full flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 hover:text-[#FF8A3D] transition focus:outline-none"
                >
                  <span className="flex items-center gap-1">
                    <Settings className="w-3.5 h-3.5 animate-spin duration-5000 text-orange-500" />
                    BLE Simulator Test panel
                  </span>
                  <span>{showSimulatorPanel ? 'Collapse' : 'Expand Controls'}</span>
                </button>

                {showSimulatorPanel && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-3.5 mt-3 bg-stone-950 p-4 rounded-xl border border-stone-850 text-left overflow-hidden"
                  >
                    <div className="text-[10px] text-stone-400 font-medium">
                      Configure active test state in sandbox environment.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      
                      {/* Bluetooth controller power */}
                      <div>
                        <span className="text-[9px] font-mono text-stone-500 uppercase font-bold block mb-1">
                          Bluetooth Controller Power
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            id="btn-sim-bt-on"
                            onClick={() => setSimBluetooth(true)}
                            className={`flex-1 py-1 rounded-md text-[9px] font-mono font-bold transition ${
                              simBluetooth 
                                ? 'bg-[#FF8A3D] text-white' 
                                : 'bg-stone-850 hover:bg-stone-800 text-stone-400'
                            }`}
                          >
                            ON (Active)
                          </button>
                          <button
                            id="btn-sim-bt-off"
                            onClick={() => {
                              setSimBluetooth(false);
                              if (wizardStep === 'scanning') setWizardStep('bluetooth_off_view');
                            }}
                            className={`flex-1 py-1 rounded-md text-[9px] font-mono font-bold transition ${
                              !simBluetooth 
                                ? 'bg-red-500 text-white' 
                                : 'bg-stone-850 hover:bg-stone-800 text-stone-400'
                            }`}
                          >
                            OFF (Disabled)
                          </button>
                        </div>
                      </div>

                      {/* Scanning permissions state */}
                      <div>
                        <span className="text-[9px] font-mono text-stone-500 uppercase font-bold block mb-1">
                          System Scan Permissions
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            id="btn-sim-perm-grant"
                            onClick={() => {
                              setSimPermission('granted');
                              if (wizardStep === 'denied_view') setWizardStep('permissions');
                            }}
                            className={`flex-1 py-1 rounded-md text-[9px] font-mono font-bold transition ${
                              simPermission === 'granted'
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-stone-850 hover:bg-stone-800 text-stone-400'
                            }`}
                          >
                            Authorized
                          </button>
                          <button
                            id="btn-sim-perm-deny"
                            onClick={() => {
                              setSimPermission('denied');
                              if (wizardStep === 'scanning' || wizardStep === 'device_select' || wizardStep === 'permissions') setWizardStep('denied_view');
                            }}
                            className={`flex-1 py-1 rounded-md text-[9px] font-mono font-bold transition ${
                              simPermission === 'denied'
                                ? 'bg-red-500 text-white' 
                                : 'bg-stone-850 hover:bg-stone-800 text-stone-400'
                            }`}
                          >
                            Denied
                          </button>
                        </div>
                      </div>

                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-stone-500 uppercase font-bold block mb-1">
                        Scan Discovery Payload
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          id="btn-sim-payload-devices"
                          onClick={() => setSimScanResult('has_devices')}
                          className={`flex-1 py-1 rounded-md text-[9px] font-mono font-bold transition ${
                            simScanResult === 'has_devices'
                              ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400' 
                              : 'bg-stone-850 hover:bg-stone-800 text-stone-400 border border-transparent'
                          }`}
                        >
                          Discovered Devices
                        </button>
                        <button
                          id="btn-sim-payload-empty"
                          onClick={() => setSimScanResult('empty')}
                          className={`flex-1 py-1 rounded-md text-[9px] font-mono font-bold transition ${
                            simScanResult === 'empty'
                              ? 'bg-stone-800 border border-stone-600 text-stone-300' 
                              : 'bg-stone-850 hover:bg-stone-800 text-stone-400 border border-transparent'
                          }`}
                        >
                          Empty (None Found)
                        </button>
                        <button
                          id="btn-sim-payload-fail"
                          onClick={() => setSimScanResult('fail')}
                          className={`flex-1 py-1 rounded-md text-[9px] font-mono font-bold transition ${
                            simScanResult === 'fail'
                              ? 'bg-red-500/20 border border-red-500/50 text-red-400' 
                              : 'bg-stone-850 hover:bg-stone-800 text-stone-400 border border-transparent'
                          }`}
                        >
                          Telemetry Error
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
