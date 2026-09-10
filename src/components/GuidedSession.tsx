import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, X, Play, Pause, Volume2, VolumeX, CheckCircle, 
  Brain, Activity, Music, BookOpen, Feather, Droplets, 
  Dumbbell, Timer, Eye, EyeOff, Plus, Minus, Book, ChevronRight, Award, Check
} from 'lucide-react';
import { Habit } from '../types';
import { playTickSound, playBreathPromptSound, playBreathingCompleteSound, playCelebrationFanfareAndClaps, playSuccessSound } from '../utils/audio';
import AcronymValidationModal from './AcronymValidationModal';
import { validateTextInput } from '../utils/wordValidator';

interface GuidedSessionProps {
  habit: Habit;
  darkMode: boolean;
  onComplete: (reflection?: { notes?: string; reflectionAnswer?: string }) => void;
  onCancel: () => void;
}

type SessionStage = 'intro' | 'prep' | 'countdown' | 'active' | 'complete';
type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

export default function GuidedSession({ habit, darkMode, onComplete, onCancel }: GuidedSessionProps) {
  const [stage, setStage] = useState<SessionStage>('intro');
  const [countdown, setCountdown] = useState<number>(3);
  const [prepStep, setPrepStep] = useState<number>(0);
  const [userName, setUserName] = useState<string>('');
  const [muted, setMuted] = useState<boolean>(false);
  const [ambientSoundEnabled, setAmbientSoundEnabled] = useState<boolean>(true);

  // Load user name for personalized breathing intro
  useEffect(() => {
    try {
      const cached = localStorage.getItem('vicfungo_profile');
      if (cached) {
        const p = JSON.parse(cached);
        if (p && p.name) {
          setUserName(p.name.split(' ')[0]);
        }
      }
    } catch (e) {
      // Suppress
    }
  }, []);
  
  // Detect habit categories
  const nameLower = habit.name.toLowerCase();
  const catLower = habit.category?.toLowerCase() || '';

  const isBreathing = habit.id === 'def-1' || 
                      nameLower.includes('breath') || 
                      nameLower.includes('breathe') || 
                      nameLower.includes('zen') || 
                      catLower === 'mindfulness';

  const isJournaling = nameLower.includes('journal') || 
                       nameLower.includes('write') || 
                       nameLower.includes('reflect') || 
                       nameLower.includes('diary') ||
                       nameLower.includes('log') ||
                       catLower === 'journaling';

  const isReading = nameLower.includes('read') || 
                    nameLower.includes('book') || 
                    nameLower.includes('learn') || 
                    nameLower.includes('study') || 
                    nameLower.includes('newsletter') ||
                    catLower === 'learning';

  const isHydration = nameLower.includes('water') || 
                      nameLower.includes('hydrate') || 
                      nameLower.includes('hydration') || 
                      nameLower.includes('drink') ||
                      nameLower.includes('cell prep') ||
                      catLower === 'health';

  const isPhysical = nameLower.includes('stretch') || 
                     nameLower.includes('plank') || 
                     nameLower.includes('workout') || 
                     nameLower.includes('exercise') || 
                     nameLower.includes('walk') || 
                     nameLower.includes('run') ||
                     catLower === 'fitness';

  const isFocus = nameLower.includes('focus') || 
                  nameLower.includes('sprint') || 
                  nameLower.includes('work') || 
                  nameLower.includes('coding') || 
                  nameLower.includes('project') || 
                  catLower === 'productivity';

  // State: 1. Guided Breathing
  const [currentBreath, setCurrentBreath] = useState<number>(1);
  const totalBreaths = habit.id === 'def-1' || habit.name.toLowerCase().includes('3') ? 3 : 4;
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(4);

  // State: 2. Reading
  const [readingTimer, setReadingTimer] = useState<number>(30); // 30s quick session for prototype/compliance
  const [readingPaused, setReadingPaused] = useState<boolean>(false);
  const [pagesRead, setPagesRead] = useState<number>(5);
  const [readingTakeaway, setReadingTakeaway] = useState<string>('');
  const [readingStage, setReadingStage] = useState<'timer' | 'takeaway'>('timer');

  // State: 3. Journaling
  const [journalText, setJournalText] = useState<string>('');
  const [gratitudeEntries, setGratitudeEntries] = useState<string[]>(['', '', '']);
  const [priorityEntries, setPriorityEntries] = useState<string[]>(['', '', '']);
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);

  // State: 4. Hydration
  const [waterAmount, setWaterAmount] = useState<number>(0);
  const targetWater = 500; // default 500ml

  // State: 5. Physical Workout
  const [physicalTimer, setPhysicalTimer] = useState<number>(30);
  const [physicalPaused, setPhysicalPaused] = useState<boolean>(false);
  const [reps, setReps] = useState<number>(0);
  const [physicalMode, setPhysicalMode] = useState<'timer' | 'reps'>(
    nameLower.includes('stretch') || nameLower.includes('plank') ? 'timer' : 'reps'
  );

  // State: 6. Focus / Deep Work
  const [focusTimer, setFocusTimer] = useState<number>(30);
  const [focusPaused, setFocusPaused] = useState<boolean>(false);
  const [isDistractionFree, setIsDistractionFree] = useState<boolean>(false);
  const [focusTask, setFocusTask] = useState<string>('');

  // Acronym Validation State
  const [confirmedAcronyms, setConfirmedAcronyms] = useState<Set<string>>(new Set());
  const [suspiciousWord, setSuspiciousWord] = useState<string>('');
  const [isAcronymModalOpen, setIsAcronymModalOpen] = useState<boolean>(false);
  const [pendingSubmitCallback, setPendingSubmitCallback] = useState<(() => void) | null>(null);

  // Web Audio Synth references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneNodesRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Haptic Feedback Simulation
  const triggerHaptic = (ms: number) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch (e) {
        // Suppress
      }
    }
  };

  // Start Ambient Drone (Perfect for Breathing, Focus, and Journaling)
  const startAmbientSoundscape = () => {
    if (!ambientSoundEnabled || muted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2.5);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      const freqs = isBreathing ? [130.81, 196.00, 261.63, 329.63] : [110.00, 165.00, 220.00, 275.00];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(isBreathing ? 350 : 250, ctx.currentTime);

        osc.connect(filter);
        filter.connect(masterGain);
        
        osc.start();
        droneNodesRef.current.push(osc);
      });
    } catch (e) {
      console.warn("Ambient soundscape initialization failed:", e);
    }
  };

  const stopAmbientSoundscape = () => {
    try {
      if (gainNodeRef.current && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, ctx.currentTime);
        gainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
        
        const nodesToStop = [...droneNodesRef.current];
        const currentCtx = audioCtxRef.current;
        droneNodesRef.current = [];
        audioCtxRef.current = null;
        gainNodeRef.current = null;

        setTimeout(() => {
          nodesToStop.forEach(osc => {
            try { osc.stop(); } catch(err) {}
          });
          if (currentCtx && currentCtx.state !== 'closed') {
            currentCtx.close();
          }
        }, 1300);
      }
    } catch (e) {
      // Suppress
    }
  };

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const volume = (muted || !ambientSoundEnabled) ? 0 : 0.06;
      gainNodeRef.current.gain.linearRampToValueAtTime(volume, audioCtxRef.current.currentTime + 0.5);
    }
  }, [muted, ambientSoundEnabled]);

  useEffect(() => {
    return () => {
      try {
        droneNodesRef.current.forEach(osc => {
          try { osc.stop(); } catch(err) {}
        });
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
          audioCtxRef.current.close();
        }
      } catch (e) {
        // Suppress
      }
    };
  }, []);

  const triggerTick = () => {
    if (!muted) playTickSound();
  };

  const triggerBreathPrompt = (phase: BreathPhase) => {
    if (!muted) playBreathPromptSound(phase);
  };

  const triggerCompleteSound = () => {
    if (!muted) {
      playBreathingCompleteSound();
      playCelebrationFanfareAndClaps();
    }
  };

  // 1a. Gentle Preparation Phase for Breathing
  useEffect(() => {
    if (stage === 'prep') {
      triggerTick();
      triggerHaptic(50);
      const timer = setInterval(() => {
        setPrepStep((prev) => {
          if (prev >= 2) {
            clearInterval(timer);
            setStage('active');
            startAmbientSoundscape();
            triggerHaptic(150);
            setBreathPhase('inhale');
            setPhaseSecondsLeft(4);
            triggerBreathPrompt('inhale');
            return 2;
          }
          triggerTick();
          triggerHaptic(60);
          return prev + 1;
        });
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [stage]);

  // 1b. Standard Countdown Logic for non-breathing activities
  useEffect(() => {
    if (stage === 'countdown') {
      triggerTick();
      triggerHaptic(50);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setStage('active');
            startAmbientSoundscape();
            triggerHaptic(150);
            return 0;
          }
          triggerTick();
          triggerHaptic(50);
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [stage]);

  // 2. Main active timers loop
  useEffect(() => {
    if (stage === 'active') {
      const timer = setInterval(() => {
        // Breathing Pacing: Inhale (4s) -> Hold (2s) -> Exhale (6s) -> Rest (2s)
        if (isBreathing) {
          setPhaseSecondsLeft((prev) => {
            if (prev <= 1) {
              triggerHaptic(80);
              if (breathPhase === 'inhale') {
                setBreathPhase('hold');
                triggerBreathPrompt('hold');
                return 2;
              } else if (breathPhase === 'hold') {
                setBreathPhase('exhale');
                triggerBreathPrompt('exhale');
                return 6;
              } else if (breathPhase === 'exhale') {
                setBreathPhase('rest');
                triggerBreathPrompt('rest');
                return 2;
              } else {
                if (currentBreath >= totalBreaths) {
                  clearInterval(timer);
                  handleFinishSession();
                  return 0;
                } else {
                  setCurrentBreath(c => c + 1);
                  setBreathPhase('inhale');
                  triggerBreathPrompt('inhale');
                  return 4;
                }
              }
            }
            triggerTick();
            return prev - 1;
          });
        }

        // Reading Timer
        if (isReading && !readingPaused && readingStage === 'timer') {
          setReadingTimer((prev) => {
            if (prev <= 1) {
              triggerHaptic(150);
              setReadingStage('takeaway');
              return 0;
            }
            if (prev % 10 === 0) triggerTick();
            return prev - 1;
          });
        }

        // Physical Workout Timer
        if (isPhysical && !physicalPaused && physicalMode === 'timer') {
          setPhysicalTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              handleFinishSession();
              return 0;
            }
            if (prev % 5 === 0) triggerHaptic(80);
            triggerTick();
            return prev - 1;
          });
        }

        // Focus / Deep Work Timer
        if (isFocus && !focusPaused) {
          setFocusTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              handleFinishSession();
              return 0;
            }
            if (prev % 10 === 0) triggerTick();
            return prev - 1;
          });
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [stage, breathPhase, currentBreath, readingPaused, readingStage, physicalPaused, physicalMode, focusPaused]);

  // Journaling auto-save simulation
  useEffect(() => {
    if (isJournaling && (journalText || gratitudeEntries.some(e => e) || priorityEntries.some(e => e))) {
      setIsAutoSaving(true);
      const timer = setTimeout(() => {
        setIsAutoSaving(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [journalText, gratitudeEntries, priorityEntries]);

  // Finish session and package data
  const handleFinishSession = (customReflectionText?: string) => {
    setStage('complete');
    triggerCompleteSound();
    stopAmbientSoundscape();
    triggerHaptic(300);

    // Collect reflection notes depending on habit types
    let notesText = '';
    let answerText = '';

    if (isJournaling) {
      if (nameLower.includes('gratitude')) {
        notesText = gratitudeEntries.filter(e => e).map((e, idx) => `${idx + 1}. ${e}`).join('\n');
      } else if (nameLower.includes('executive')) {
        notesText = priorityEntries.filter(e => e).map((e, idx) => `Priority ${idx + 1}: ${e}`).join('\n');
      } else {
        notesText = journalText;
      }
      answerText = notesText;
    } else if (isReading) {
      notesText = `Read ${pagesRead} pages. Takeaway: ${readingTakeaway}`;
      answerText = readingTakeaway;
    } else if (isHydration) {
      notesText = `Consumed ${waterAmount}ml water.`;
      answerText = `Hydrated ${waterAmount}ml`;
    } else if (isPhysical) {
      notesText = physicalMode === 'reps' ? `Logged ${reps} reps.` : `Completed timed activity.`;
      answerText = notesText;
    } else if (isFocus) {
      notesText = focusTask ? `Focused on: "${focusTask}".` : `Finished focus sprint.`;
      answerText = notesText;
    } else if (customReflectionText) {
      notesText = customReflectionText;
      answerText = customReflectionText;
    }

    setTimeout(() => {
      onComplete({
        notes: notesText,
        reflectionAnswer: answerText
      });
    }, 2800);
  };

  const executeWithWordValidation = (textToValidate: string, proceedFn: () => void) => {
    const result = validateTextInput(textToValidate, confirmedAcronyms);
    if (!result.isValid && result.suspiciousWord) {
      setSuspiciousWord(result.suspiciousWord);
      setPendingSubmitCallback(() => proceedFn);
      setIsAcronymModalOpen(true);
    } else {
      proceedFn();
    }
  };

  const handleConfirmAcronym = (word: string) => {
    const updated = new Set(confirmedAcronyms);
    updated.add(word.toUpperCase());
    setConfirmedAcronyms(updated);
    setIsAcronymModalOpen(false);
    if (pendingSubmitCallback) {
      pendingSubmitCallback();
      setPendingSubmitCallback(null);
    }
  };

  const handleCancel = () => {
    stopAmbientSoundscape();
    onCancel();
  };

  const handleStart = () => {
    // For journaling and hydration, go directly to active state to prevent friction
    if (isJournaling || isHydration) {
      setStage('active');
      startAmbientSoundscape();
    } else if (isBreathing) {
      setStage('prep');
      setPrepStep(0);
    } else {
      setStage('countdown');
      setCountdown(3);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-500 ${
      isDistractionFree ? 'bg-black/98' : 'bg-stone-950/85 backdrop-blur-md'
    }`}>
      <div 
        className={`w-full max-w-lg rounded-[36px] overflow-hidden border p-8 flex flex-col items-center relative shadow-2xl transition-all duration-500 ${
          isDistractionFree 
            ? 'bg-stone-950 border-stone-900 text-stone-200 p-12 max-w-md'
            : darkMode 
              ? 'bg-stone-900 border-stone-800 text-stone-100' 
              : 'bg-[#FEFAF7] border-orange-100 text-stone-850'
        }`}
      >
        {/* Header Controls */}
        {!isDistractionFree && (
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
            <div className="flex gap-1.5 items-center">
              <button
                onClick={() => setMuted(!muted)}
                className={`p-2 rounded-full border transition cursor-pointer ${
                  darkMode 
                    ? 'border-stone-800 bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200' 
                    : 'border-orange-100 bg-white hover:bg-stone-50 text-stone-500 hover:text-stone-850'
                }`}
                title={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setAmbientSoundEnabled(!ambientSoundEnabled)}
                className={`p-2 rounded-full border transition cursor-pointer ${
                  ambientSoundEnabled && !muted
                    ? 'border-[#FF8A3D] bg-orange-500/10 text-[#FF8A3D]'
                    : darkMode 
                      ? 'border-stone-800 bg-stone-850 hover:bg-stone-800 text-stone-500' 
                      : 'border-orange-100 bg-white hover:bg-stone-50 text-stone-400'
                }`}
                title="Synthesized Soundscape"
              >
                <Music className={`w-3.5 h-3.5 ${ambientSoundEnabled && stage === 'active' ? 'animate-pulse' : ''}`} />
              </button>
            </div>

            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              darkMode ? 'bg-orange-950/15 border-orange-900/30 text-orange-400' : 'bg-orange-50 border-orange-100 text-[#FF8A3D]'
            }`}>
              {isBreathing && '🫁 Somatic Breathing'}
              {isJournaling && '✍️ Distraction-Free Journal'}
              {isReading && '📖 Cognitive Reading'}
              {isHydration && '💧 Cellular Hydration'}
              {isPhysical && '🏃 Somatic Movement'}
              {isFocus && '🎯 Focus Sprint'}
              {!isBreathing && !isJournaling && !isReading && !isHydration && !isPhysical && !isFocus && '🛠️ Somatic Coach'}
            </span>

            <button
              onClick={handleCancel}
              className={`p-2 rounded-full border transition cursor-pointer ${
                darkMode 
                  ? 'border-stone-800 bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200' 
                  : 'border-orange-100 bg-white hover:bg-stone-50 text-stone-500 hover:text-stone-850'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Distraction free exit button */}
        {isDistractionFree && (
          <button
            onClick={() => setIsDistractionFree(false)}
            className="absolute top-6 right-6 p-2 rounded-full border border-stone-800 bg-stone-900 text-stone-400 hover:text-white transition flex items-center gap-1.5 text-xs font-mono"
          >
            <Eye className="w-3.5 h-3.5" /> Show Controls
          </button>
        )}

        {/* Dynamic Content Stages */}
        <AnimatePresence mode="wait">
          {stage === 'intro' && (
            <motion.div
              key="intro-stage"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center my-8 mt-12 w-full text-center"
            >
              <div className="w-16 h-16 bg-orange-100/60 dark:bg-orange-950/20 rounded-full flex items-center justify-center text-orange-600 dark:text-[#FF8A3D] mb-5">
                {isBreathing && <Brain className="w-8 h-8 animate-pulse" />}
                {isJournaling && <Feather className="w-8 h-8 animate-pulse" />}
                {isReading && <BookOpen className="w-8 h-8 animate-pulse" />}
                {isHydration && <Droplets className="w-8 h-8 animate-pulse" />}
                {isPhysical && <Dumbbell className="w-8 h-8 animate-pulse" />}
                {isFocus && <Timer className="w-8 h-8 animate-pulse" />}
                {!isBreathing && !isJournaling && !isReading && !isHydration && !isPhysical && !isFocus && <Brain className="w-8 h-8 animate-pulse" />}
              </div>
              
              <h3 className="text-xl font-display font-black tracking-tight px-4">
                {habit.name}
              </h3>
              <p className={`text-xs mt-2 max-w-sm leading-relaxed px-4 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                {habit.description || "Align your focus, anchor your mindset, and begin with clean neural clarity."}
              </p>

              <div className={`mt-6 p-4 rounded-2xl border text-left w-full max-w-sm ${
                darkMode ? 'bg-stone-850/60 border-stone-800' : 'bg-orange-50/20 border-orange-100/50'
              }`}>
                <span className="text-[10px] font-mono font-bold text-orange-500 uppercase tracking-widest block mb-2">CALIBRATION ENGINE</span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-550">Activity Style:</span>
                    <strong className="font-semibold text-stone-750 dark:text-stone-200 uppercase tracking-wider font-mono">
                      {isBreathing && '🫁 Guided Breathing'}
                      {isJournaling && '✍️ Reflective Journal'}
                      {isReading && '📖 Active Recall Reading'}
                      {isHydration && '💧 Cellular Hydration'}
                      {isPhysical && '🏃 Somatic Movement'}
                      {isFocus && '🎯 Focus Deep Work'}
                      {!isBreathing && !isJournaling && !isReading && !isHydration && !isPhysical && !isFocus && '⚡ Somatic Alignment'}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-550">Primary Target:</span>
                    <strong className="font-semibold text-stone-750 dark:text-stone-200">
                      {isBreathing && `${totalBreaths} slow deep breaths (4s cycle)`}
                      {isJournaling && 'Distraction-Free Free Writing'}
                      {isReading && '30s Read & Focus Recall'}
                      {isHydration && 'Fill 500ml Cellular Hydration'}
                      {isPhysical && (physicalMode === 'timer' ? '30s Somatic Paced Stretch' : 'Log Physical Activity Reps')}
                      {isFocus && '30s High-yield Flow Sprint'}
                      {!isBreathing && !isJournaling && !isReading && !isHydration && !isPhysical && !isFocus && 'Active Calibration Session'}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-550">Neural Incentive:</span>
                    <strong className="text-[#FF8A3D] font-bold">+{habit.xpReward} XP / Dopamine Pop</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStart}
                className="mt-8 px-8 py-3.5 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white font-bold rounded-2xl transition shadow-premium-orange flex items-center gap-2.5 cursor-pointer text-sm"
              >
                <Play className="w-4 h-4 fill-current" /> 
                {isJournaling ? 'Open Intention Journal' : isHydration ? 'Begin Hydration Log' : 'Initiate Guided Session'}
              </button>
            </motion.div>
          )}

          {stage === 'prep' && (
            <motion.div
              key="prep-stage"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center my-12 mt-16 text-center"
            >
              <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center text-[#FF8A3D] mb-6 border border-[#FF8A3D]/20 animate-pulse shadow-inner">
                <Brain className="w-10 h-10" />
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={prepStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-3"
                >
                  <h3 className="text-3xl font-display font-black text-[#FF8A3D] tracking-tight">
                    {prepStep === 0 && 'Ready?'}
                    {prepStep === 1 && (userName ? `Are you ready, ${userName}?` : 'Are you ready?')}
                    {prepStep === 2 && "Let's begin."}
                  </h3>
                  <p className={`text-xs font-mono tracking-wider ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                    {prepStep === 0 && 'Settle in and find a comfortable seat.'}
                    {prepStep === 1 && 'Gently focus your attention on your breathing.'}
                    {prepStep === 2 && 'Inhale slowly as the wave expands...'}
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {stage === 'countdown' && (
            <motion.div
              key="countdown-stage"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center my-16 mt-20"
            >
              <p className="text-xs font-mono font-bold text-orange-500 uppercase tracking-widest mb-4">
                ALIGNING SOMATIC FOCUS
              </p>
              <motion.span 
                key={countdown}
                initial={{ opacity: 0, scale: 1.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-8xl font-display font-black text-[#FF8A3D]"
              >
                {countdown}
              </motion.span>
              <p className={`text-xs mt-6 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                {isReading && 'Get your book ready, open your mind...'}
                {isPhysical && 'Find space to move, stretch, or plant...'}
                {isFocus && 'Minimize distractions. Enter deep focus...'}
                {!isReading && !isPhysical && !isFocus && 'Settle in and find a steady seat...'}
              </p>
            </motion.div>
          )}

          {stage === 'active' && (
            <motion.div
              key="active-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center my-4 mt-8 w-full"
            >
              {/* ======================================= */}
              {/* 1. Guided Breathing UI                  */}
              {/* ======================================= */}
              {isBreathing && (
                <div className="flex flex-col items-center w-full">
                  <div className="mb-2 flex items-center gap-1.5 justify-center">
                    <Activity className="w-4 h-4 text-orange-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">
                      BREATH {currentBreath} OF {totalBreaths}
                    </span>
                  </div>

                  <div className="h-60 flex items-center justify-center relative w-full my-6">
                    <motion.div 
                      className="absolute rounded-full bg-[#FF8A3D]/5 border border-[#FF8A3D]/10 pointer-events-none"
                      animate={{
                        width: breathPhase === 'inhale' ? ['140px', '260px'] : breathPhase === 'hold' ? '260px' : breathPhase === 'exhale' ? ['260px', '140px'] : '140px',
                        height: breathPhase === 'inhale' ? ['140px', '260px'] : breathPhase === 'hold' ? '260px' : breathPhase === 'exhale' ? ['260px', '140px'] : '140px',
                      }}
                      transition={{ 
                        duration: breathPhase === 'inhale' ? 4 : breathPhase === 'hold' ? 2 : breathPhase === 'exhale' ? 6 : 2, 
                        ease: "easeInOut" 
                      }}
                    />
                    
                    <motion.div 
                      className="absolute rounded-full bg-orange-100/25 dark:bg-orange-950/15 pointer-events-none border border-orange-200/20 dark:border-orange-900/10"
                      animate={{
                        width: breathPhase === 'inhale' ? ['110px', '220px'] : breathPhase === 'hold' ? ['220px', '225px', '220px'] : breathPhase === 'exhale' ? ['220px', '110px'] : '110px',
                        height: breathPhase === 'inhale' ? ['110px', '220px'] : breathPhase === 'hold' ? ['220px', '225px', '220px'] : breathPhase === 'exhale' ? ['220px', '110px'] : '110px',
                      }}
                      transition={{ 
                        duration: breathPhase === 'inhale' ? 4 : breathPhase === 'hold' ? 2 : breathPhase === 'exhale' ? 6 : 2, 
                        ease: "easeInOut",
                        repeat: breathPhase === 'hold' ? Infinity : 0,
                        repeatType: "reverse"
                      }}
                    />

                    <motion.div 
                      className="rounded-full bg-gradient-to-br from-[#FF8A3D] to-amber-500 text-white flex flex-col items-center justify-center font-display shadow-xl z-10 pointer-events-none relative"
                      animate={{
                        width: breathPhase === 'inhale' ? ['80px', '180px'] : breathPhase === 'hold' ? '180px' : breathPhase === 'exhale' ? ['180px', '80px'] : '80px',
                        height: breathPhase === 'inhale' ? ['80px', '180px'] : breathPhase === 'hold' ? '180px' : breathPhase === 'exhale' ? ['180px', '80px'] : '80px',
                      }}
                      transition={{ 
                        duration: breathPhase === 'inhale' ? 4 : breathPhase === 'hold' ? 2 : breathPhase === 'exhale' ? 6 : 2, 
                        ease: "easeInOut" 
                      }}
                    >
                      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                        <circle cx="50%" cy="50%" r="45%" className="stroke-white/10 fill-none" strokeWidth="4" />
                        <circle 
                          cx="50%" cy="50%" r="45%" 
                          className="stroke-white/40 fill-none transition-all duration-1000" 
                          strokeWidth="4" 
                          strokeDasharray="283"
                          strokeDashoffset={
                            283 - (283 * phaseSecondsLeft) / (
                              breathPhase === 'inhale' ? 4 : 
                              breathPhase === 'hold' ? 2 : 
                              breathPhase === 'exhale' ? 6 : 2
                            )
                          }
                        />
                      </svg>
                      <span className="text-2xl font-black font-mono">{phaseSecondsLeft}s</span>
                    </motion.div>
                  </div>

                  <div className="h-16 flex flex-col justify-center text-center">
                    <motion.h4 
                      key={breathPhase}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-lg font-display font-black tracking-tight text-[#FF8A3D]"
                    >
                      {breathPhase === 'inhale' && '🌬 Breathe in...'}
                      {breathPhase === 'hold' && 'Hold & Center...'}
                      {breathPhase === 'exhale' && '🌬 Breathe out...'}
                      {breathPhase === 'rest' && 'Pause & Reset...'}
                    </motion.h4>
                    <p className={`text-xs mt-1 px-8 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                      {breathPhase === 'inhale' && 'Expand your chest and lungs deeply (4s).'}
                      {breathPhase === 'hold' && 'Pause gently, staying still and centered (2s).'}
                      {breathPhase === 'exhale' && 'Slowly release all tension & empty your lungs (6s).'}
                      {breathPhase === 'rest' && 'Relax naturally before beginning the next wave.'}
                    </p>
                  </div>

                  <div className="mt-6 flex gap-1 justify-center">
                    {Array.from({ length: totalBreaths }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-10 h-1.5 rounded-full transition ${
                          i + 1 < currentBreath ? 'bg-emerald-500' :
                          i + 1 === currentBreath ? 'bg-[#FF8A3D] animate-pulse' :
                          (darkMode ? 'bg-stone-850' : 'bg-stone-200')
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ======================================= */}
              {/* 2. Reading Habits UI                     */}
              {/* ======================================= */}
              {isReading && (
                <div className="flex flex-col items-center w-full px-2">
                  {readingStage === 'timer' ? (
                    <div className="flex flex-col items-center w-full">
                      <div className="mb-2 flex items-center gap-1.5 justify-center">
                        <BookOpen className="w-4 h-4 text-orange-500 animate-bounce" />
                        <span className="text-xs font-mono font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">
                          Active Reading Flow
                        </span>
                      </div>

                      <div className="h-44 flex items-center justify-center relative w-full my-4">
                        <div className={`w-36 h-36 rounded-2xl flex flex-col items-center justify-center border relative ${
                          darkMode ? 'bg-stone-850 border-stone-800' : 'bg-white border-orange-100'
                        }`}>
                          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1">
                            <circle cx="50%" cy="50%" r="46%" className="stroke-stone-100 dark:stroke-stone-800 fill-none" strokeWidth="3" />
                            <circle 
                              cx="50%" cy="50%" r="46%" 
                              className="stroke-[#FF8A3D] fill-none transition-all duration-1000" 
                              strokeWidth="5" 
                              strokeDasharray="283"
                              strokeDashoffset={283 - (283 * readingTimer) / 30}
                            />
                          </svg>

                          <span className="text-3xl font-black text-stone-850 dark:text-white font-mono">
                            {readingTimer}s
                          </span>
                          <span className="text-[8px] font-mono font-bold text-stone-500 dark:text-stone-400 mt-1 uppercase">
                            RECALL GATE
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-orange-500/5 dark:bg-orange-950/10 p-3.5 rounded-2xl border border-orange-500/10 max-w-sm w-full justify-between">
                        <span className="text-xs font-semibold text-stone-650 dark:text-stone-350">Pages to read:</span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setPagesRead(p => Math.max(1, p - 1))}
                            className="p-1 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:opacity-85"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-sm text-[#FF8A3D] min-w-[20px] text-center">{pagesRead}</span>
                          <button 
                            onClick={() => setPagesRead(p => p + 1)}
                            className="p-1 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:opacity-85"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center gap-3 w-full max-w-sm">
                        <button
                          onClick={() => setReadingPaused(!readingPaused)}
                          className="flex-1 py-3 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {readingPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                          {readingPaused ? 'Resume Read' : 'Pause Timer'}
                        </button>
                        <button
                          onClick={() => setReadingStage('takeaway')}
                          className="flex-1 py-3 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-premium-orange cursor-pointer animate-pulse"
                        >
                          <Book className="w-3.5 h-3.5" /> Done Reading
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center">
                      <div className="w-12 h-12 bg-orange-100/60 dark:bg-orange-950/20 rounded-full flex items-center justify-center text-orange-600 dark:text-[#FF8A3D] mb-3">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                      </div>
                      <h4 className="text-base font-display font-black tracking-tight text-center">
                        Dr. Gethro's Cognitive Recall
                      </h4>
                      <p className={`text-xs mt-1 mb-4 text-center px-6 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                        Lock in today's knowledge. What was the most important spark or insight you captured in these {pagesRead} pages?
                      </p>

                      <textarea
                        value={readingTakeaway}
                        onChange={(e) => setReadingTakeaway(e.target.value)}
                        placeholder="Type one sentence or takeaway to secure it in long-term memory..."
                        className="w-full min-h-[90px] p-4 text-xs sm:text-sm rounded-2xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 font-medium outline-none focus:border-[#FF8A3D] dark:focus:border-[#FF8A3D] transition resize-none leading-relaxed font-sans shadow-inner"
                      />
                      <div className="w-full flex justify-between items-center text-[10px] font-mono text-stone-500 dark:text-stone-400 px-1 mt-1.5">
                        <span>Cognitive Active Recall</span>
                        <span>{readingTakeaway.length} characters</span>
                      </div>

                      <button
                        onClick={() => executeWithWordValidation(readingTakeaway, () => handleFinishSession())}
                        disabled={!readingTakeaway.trim()}
                        className="mt-4 w-full py-3 bg-[#FF8A3D] hover:bg-[#e77a2f] disabled:bg-stone-300 dark:disabled:bg-stone-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-premium-orange"
                      >
                        Submit Active Reflection <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ======================================= */}
              {/* 3. Journaling Habits UI                 */}
              {/* ======================================= */}
              {isJournaling && (
                <div className="flex flex-col items-center w-full px-2">
                  <div className="mb-2.5 flex justify-between items-center w-full border-b border-stone-200/50 dark:border-stone-800/50 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Feather className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-mono font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">
                        Distraction-Free Workspace
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 flex items-center gap-1 animate-pulse">
                      {isAutoSaving ? '● Auto-saving...' : '✓ Synced'}
                    </span>
                  </div>

                  {/* Gratitude Journal View */}
                  {nameLower.includes('gratitude') ? (
                    <div className="space-y-3.5 w-full mt-2">
                      <p className={`text-xs italic mb-2 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                        "Gratitude primes the dopaminergic pathways, fostering neural safety before focus work."
                      </p>
                      {[
                        'What is one thing that brought you joy today?',
                        'Who is a person you are genuinely thankful for?',
                        'What is a micro-victory you achieved today?'
                      ].map((prompt, index) => (
                        <div key={index} className="flex flex-col text-left">
                          <label className="text-[10px] font-mono font-bold text-[#FF8A3D] uppercase tracking-wider mb-1.5">
                            {index + 1}. {prompt}
                          </label>
                          <input
                            type="text"
                            value={gratitudeEntries[index]}
                            onChange={(e) => {
                              const updated = [...gratitudeEntries];
                              updated[index] = e.target.value;
                              setGratitudeEntries(updated);
                            }}
                            placeholder="Type your reflection here..."
                            className="w-full p-3 text-xs sm:text-sm rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 font-medium outline-none focus:border-[#FF8A3D] dark:focus:border-[#FF8A3D] transition shadow-inner"
                          />
                        </div>
                      ))}
                    </div>
                  ) : nameLower.includes('executive') ? (
                    // Executive Journaling view
                    <div className="space-y-3.5 w-full mt-2">
                      <p className={`text-xs italic mb-2 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                        "Planning tomorrow today alleviates sleep anxiety and removes morning decision fatigue."
                      </p>
                      {[
                        'Primary Objective (Non-negotiable anchor task)',
                        'Secondary Support (Medium weight high yield objective)',
                        'Tertiary Quick win (Low-friction velocity task)'
                      ].map((prompt, index) => (
                        <div key={index} className="flex flex-col text-left">
                          <label className="text-[10px] font-mono font-bold text-orange-500 uppercase tracking-wider mb-1.5">
                            {prompt}
                          </label>
                          <input
                            type="text"
                            value={priorityEntries[index]}
                            onChange={(e) => {
                              const updated = [...priorityEntries];
                              updated[index] = e.target.value;
                              setPriorityEntries(updated);
                            }}
                            placeholder="Specify critical focus block..."
                            className="w-full p-3 text-xs sm:text-sm rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 font-medium outline-none focus:border-orange-500 dark:focus:border-orange-500 transition shadow-inner"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    // General Open Journal
                    <div className="w-full mt-2">
                      <p className={`text-xs italic mb-3 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                        "Open writing releases cognitive load and facilitates structural self-integration."
                      </p>
                      <textarea
                        value={journalText}
                        onChange={(e) => setJournalText(e.target.value)}
                        placeholder="Log your raw reflections, thoughts, blocks, or general alignment notes here. There is no right or wrong word..."
                        className="w-full min-h-[180px] p-4 text-xs sm:text-sm rounded-2xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 font-medium outline-none focus:border-[#FF8A3D] dark:focus:border-[#FF8A3D] transition resize-none leading-relaxed font-sans shadow-inner"
                      />
                      <div className="w-full flex justify-between items-center text-[10px] font-mono text-stone-500 dark:text-stone-400 px-1 mt-1.5">
                        <span>Journal Length</span>
                        <span>{journalText.length} characters</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      const fullJournalText = journalText || gratitudeEntries.join(' ') || priorityEntries.join(' ');
                      executeWithWordValidation(fullJournalText, () => handleFinishSession());
                    }}
                    className="mt-6 w-full py-3.5 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white font-bold text-xs rounded-2xl transition flex items-center justify-center gap-1.5 shadow-premium-orange cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" /> Save Journal & Complete Habit
                  </button>
                </div>
              )}

              {/* ======================================= */}
              {/* 4. Hydration Habits UI                  */}
              {/* ======================================= */}
              {isHydration && (
                <div className="flex flex-col items-center w-full px-2 text-center">
                  <div className="mb-2 flex items-center gap-1.5 justify-center">
                    <Droplets className="w-4 h-4 text-[#FF8A3D]" />
                    <span className="text-xs font-mono font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">
                      Water Intake Logger
                    </span>
                  </div>

                  <div className="h-56 flex items-center justify-center relative w-full my-4">
                    {/* Glass Cylinder container */}
                    <div className="w-24 h-48 border-4 border-stone-300 dark:border-stone-700 rounded-b-3xl rounded-t-lg relative overflow-hidden bg-stone-100/50 dark:bg-stone-900/50 shadow-inner flex items-end">
                      {/* Fluid water indicator */}
                      <motion.div 
                        className="w-full bg-gradient-to-t from-sky-500/80 to-sky-400/90 relative"
                        animate={{
                          height: `${Math.min(100, (waterAmount / targetWater) * 100)}%`
                        }}
                        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                      >
                        {/* Wavy top line */}
                        <div className="absolute -top-1 left-0 right-0 h-2 bg-sky-300 animate-pulse rounded-t-full opacity-60" />
                        {/* Bubble particles inside */}
                        <div className="absolute inset-0 overflow-hidden opacity-30">
                          <div className="absolute bottom-2 left-4 w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                          <div className="absolute bottom-12 right-6 w-2 h-2 bg-white rounded-full animate-ping" />
                          <div className="absolute bottom-6 left-12 w-1 h-1 bg-white rounded-full animate-bounce" />
                        </div>
                      </motion.div>
                      
                      {/* Scale markers */}
                      <div className="absolute inset-y-0 right-2 flex flex-col justify-between text-[7px] font-mono text-stone-400 py-4 select-none pointer-events-none">
                        <span>500ml</span>
                        <span>375ml</span>
                        <span>250ml</span>
                        <span>125ml</span>
                        <span>0ml</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-lg font-black text-[#FF8A3D] font-mono">
                    {waterAmount} / {targetWater} ml
                  </p>
                  <p className={`text-xs mt-1 mb-4 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                    {waterAmount >= targetWater ? '🎉 Hydration target unlocked!' : 'Add water intake to lubricate your brain cells.'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 w-full mt-1 max-w-sm">
                    {[
                      { amount: 150, label: 'Cup (+150ml)' },
                      { amount: 250, label: 'Glass (+250ml)' },
                      { amount: 500, label: 'Bottle (+500ml)' }
                    ].map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setWaterAmount(w => Math.min(1000, w + btn.amount));
                          triggerHaptic(60);
                          triggerTick();
                        }}
                        className={`py-2 px-1 border font-bold text-[10px] rounded-xl transition cursor-pointer flex flex-col items-center gap-1 ${
                          darkMode 
                            ? 'bg-stone-850 border-stone-800 hover:bg-stone-800 text-stone-300' 
                            : 'bg-white border-orange-100 hover:bg-orange-50/50 text-stone-700'
                        }`}
                      >
                        <Droplets className="w-3.5 h-3.5 text-sky-400" />
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 w-full mt-4 max-w-sm">
                    <button
                      onClick={() => {
                        setWaterAmount(0);
                        triggerHaptic(100);
                      }}
                      className={`px-3 py-2 border font-bold text-[10px] rounded-xl transition cursor-pointer ${
                        darkMode 
                          ? 'bg-stone-850 border-stone-800 hover:bg-stone-800 text-stone-400' 
                          : 'bg-white border-orange-100 hover:bg-orange-50 text-stone-500'
                      }`}
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => handleFinishSession()}
                      className="flex-1 py-3 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-premium-orange cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Save Hydration
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================= */}
              {/* 5. Physical Activity UI                 */}
              {/* ======================================= */}
              {isPhysical && (
                <div className="flex flex-col items-center w-full px-2 text-center">
                  <div className="mb-2 flex items-center gap-1.5 justify-center">
                    <Dumbbell className="w-4 h-4 text-orange-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">
                      Somatic Movement Studio
                    </span>
                  </div>

                  {physicalMode === 'timer' ? (
                    // Timed stretches/planks
                    <div className="flex flex-col items-center w-full">
                      <div className="h-44 flex items-center justify-center relative w-full my-4">
                        <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center border relative ${
                          darkMode ? 'bg-stone-850 border-stone-800' : 'bg-white border-orange-100'
                        }`}>
                          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1">
                            <circle cx="50%" cy="50%" r="46%" className="stroke-stone-100 dark:stroke-stone-800 fill-none" strokeWidth="3" />
                            <circle 
                              cx="50%" cy="50%" r="46%" 
                              className="stroke-[#FF8A3D] fill-none transition-all duration-1000" 
                              strokeWidth="5" 
                              strokeDasharray="283"
                              strokeDashoffset={283 - (283 * physicalTimer) / 30}
                            />
                          </svg>

                          <span className="text-3xl font-black text-stone-850 dark:text-white font-mono">
                            {physicalTimer}s
                          </span>
                          <span className="text-[8px] font-mono font-bold text-stone-500 dark:text-stone-400 mt-1 uppercase">
                            PACE TIMER
                          </span>
                        </div>
                      </div>

                      <p className={`text-xs mt-1 mb-4 ${darkMode ? 'text-stone-400' : 'text-stone-500'} italic max-w-sm px-6`}>
                        "Maintain steady breathing. Stretch your spine or align your plank posture smoothly."
                      </p>

                      <div className="flex gap-2 w-full max-w-sm">
                        <button
                          onClick={() => setPhysicalPaused(!physicalPaused)}
                          className="flex-1 py-3 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {physicalPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                          {physicalPaused ? 'Resume Activity' : 'Pause Timer'}
                        </button>
                        <button
                          onClick={() => handleFinishSession()}
                          className="flex-1 py-3 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-premium-orange cursor-pointer"
                        >
                          Complete Now
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Reps-based workouts (squats, pushups)
                    <div className="flex flex-col items-center w-full">
                      <div className="h-44 flex items-center justify-center relative w-full my-4">
                        <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center border ${
                          darkMode ? 'bg-stone-850 border-stone-800' : 'bg-white border-orange-100'
                        } shadow-md`}>
                          <span className="text-5xl font-black text-[#FF8A3D] font-mono leading-none">
                            {reps}
                          </span>
                          <span className="text-[8px] font-mono font-bold text-stone-500 dark:text-stone-400 mt-2 uppercase">
                            COMPLETED REPS
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-3 w-full max-w-xs mb-6">
                        <button
                          onClick={() => {
                            setReps(r => Math.max(0, r - 1));
                            triggerHaptic(50);
                          }}
                          className="w-12 h-12 rounded-2xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center hover:opacity-85 cursor-pointer"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setReps(r => r + 1);
                            triggerHaptic(80);
                            triggerTick();
                          }}
                          className="w-20 h-16 rounded-3xl bg-[#FF8A3D] text-white flex items-center justify-center hover:bg-[#e77a2f] shadow-premium-orange cursor-pointer"
                        >
                          <Plus className="w-8 h-8" />
                        </button>
                        <button
                          onClick={() => {
                            setReps(r => r + 5);
                            triggerHaptic(100);
                            triggerTick();
                          }}
                          className="w-12 h-12 rounded-2xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center hover:opacity-85 text-xs font-mono font-black cursor-pointer"
                        >
                          +5
                        </button>
                      </div>

                      <button
                        onClick={() => handleFinishSession()}
                        className="w-full max-w-sm py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-2xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Check className="w-4 h-4" /> Save Reps & Complete
                      </button>
                    </div>
                  )}

                  {/* Toggle Mode Option */}
                  <button
                    onClick={() => setPhysicalMode(m => m === 'timer' ? 'reps' : 'timer')}
                    className="mt-5 text-[10px] font-mono text-stone-400 hover:text-stone-600 transition"
                  >
                    Switch to {physicalMode === 'timer' ? 'Rep Counter' : 'Stretch Timer'} mode
                  </button>
                </div>
              )}

              {/* ======================================= */}
              {/* 6. Focus or Deep Work UI                */}
              {/* ======================================= */}
              {isFocus && (
                <div className="flex flex-col items-center w-full px-2 text-center">
                  {!isDistractionFree && (
                    <div className="mb-2 flex items-center gap-1.5 justify-center">
                      <Timer className="w-4 h-4 text-orange-500 animate-pulse" />
                      <span className="text-xs font-mono font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">
                        Deep Flow Engine
                      </span>
                    </div>
                  )}

                  {/* Distraction free input field */}
                  {!isDistractionFree && (
                    <input
                      type="text"
                      value={focusTask}
                      onChange={(e) => setFocusTask(e.target.value)}
                      placeholder="Specify your focal anchor (e.g. drafting schema)..."
                      className="w-full max-w-xs p-3 text-xs rounded-xl border bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-800 outline-none focus:border-[#FF8A3D] dark:focus:border-[#FF8A3D] transition text-center font-semibold mb-4"
                    />
                  )}

                  {isDistractionFree && focusTask && (
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-6 border-b border-stone-850 pb-2">
                      🎯 ACTIVE ANCHOR: {focusTask}
                    </p>
                  )}

                  <div className="h-44 flex items-center justify-center relative w-full my-3">
                    <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center border relative transition-all duration-500 ${
                      isDistractionFree 
                        ? 'bg-black border-stone-850 shadow-2xl scale-110'
                        : darkMode 
                          ? 'bg-stone-850 border-stone-800' 
                          : 'bg-white border-orange-100'
                    }`}>
                      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1">
                        <circle cx="50%" cy="50%" r="46%" className="stroke-stone-100 dark:stroke-stone-800 fill-none" strokeWidth="3" />
                        <circle 
                          cx="50%" cy="50%" r="46%" 
                          className="stroke-[#FF8A3D] fill-none transition-all duration-1000" 
                          strokeWidth="5" 
                          strokeDasharray="283"
                          strokeDashoffset={283 - (283 * focusTimer) / 30}
                        />
                      </svg>

                      <span className={`text-4xl font-black font-mono tracking-tight transition-colors duration-500 ${
                        isDistractionFree ? 'text-orange-500 animate-pulse' : 'text-stone-850 dark:text-white'
                      }`}>
                        {focusTimer}s
                      </span>
                      <span className="text-[8px] font-mono font-bold text-stone-500 dark:text-stone-400 mt-1 uppercase">
                        SWELL SPRINT
                      </span>
                    </div>
                  </div>

                  {!isDistractionFree && (
                    <p className={`text-xs mt-2 mb-5 ${darkMode ? 'text-stone-400' : 'text-stone-500'} italic px-6`}>
                      "The alpha flow-state activates within 30 seconds of persistent focus targeting."
                    </p>
                  )}

                  <div className="flex gap-2.5 w-full mt-2 max-w-sm justify-center">
                    <button
                      onClick={() => setFocusPaused(!focusPaused)}
                      className="flex-1 py-3 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {focusPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                      {focusPaused ? 'Resume Sprint' : 'Pause Flow'}
                    </button>
                    
                    {!isDistractionFree ? (
                      <button
                        onClick={() => {
                          setIsDistractionFree(true);
                          triggerHaptic(120);
                        }}
                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <EyeOff className="w-3.5 h-3.5" /> Alpha Mode Flow
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsDistractionFree(false);
                          triggerHaptic(80);
                        }}
                        className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Restore Normal
                      </button>
                    )}
                  </div>

                  {!isDistractionFree && (
                    <button
                      onClick={() => handleFinishSession()}
                      className="mt-4 w-full py-3.5 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white font-bold text-xs rounded-2xl transition flex items-center justify-center gap-1.5 shadow-premium-orange cursor-pointer"
                    >
                      ✅ Complete Sprint & Log
                    </button>
                  )}
                  
                  {isDistractionFree && (
                    <button
                      onClick={() => handleFinishSession()}
                      className="mt-6 text-[11px] font-mono text-orange-500/80 hover:text-orange-400 font-bold border border-orange-500/20 px-4 py-2 rounded-xl bg-orange-500/5 hover:bg-orange-500/10 cursor-pointer transition animate-pulse"
                    >
                      ✓ Complete Sprint
                    </button>
                  )}
                </div>
              )}

              {/* General fallback / other habits */}
              {!isBreathing && !isJournaling && !isReading && !isHydration && !isPhysical && !isFocus && (
                <div className="flex flex-col items-center w-full px-2 text-center">
                  <div className="mb-2 flex items-center gap-1.5 justify-center">
                    <Activity className="w-4 h-4 text-[#FF8A3D] animate-pulse" />
                    <span className="text-xs font-mono font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">
                      Habit Alignment
                    </span>
                  </div>

                  <p className={`text-sm my-6 px-4 font-semibold ${darkMode ? 'text-stone-300' : 'text-stone-800'}`}>
                    Take a moment to align your focus on {habit.name}.
                  </p>

                  <button
                    onClick={() => handleFinishSession()}
                    className="w-full max-w-sm py-3.5 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white font-bold text-xs rounded-2xl transition shadow-premium-orange cursor-pointer"
                  >
                    Confirm Completion
                  </button>
                </div>
              )}

              {/* Instant Skip options */}
              {!isDistractionFree && !isJournaling && !isHydration && (
                <button 
                  onClick={() => handleFinishSession()}
                  className={`mt-6 text-[10px] font-mono font-semibold underline cursor-pointer transition ${
                    darkMode ? 'text-stone-500 hover:text-stone-400' : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  Skip straight to completion
                </button>
              )}
            </motion.div>
          )}

          {stage === 'complete' && (
            <motion.div
              key="complete-stage"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center my-10 mt-14"
            >
              <div className="w-20 h-20 bg-emerald-500/10 dark:bg-emerald-950/30 rounded-full flex items-center justify-center text-emerald-500 mb-6 border border-emerald-500/20 shadow-md relative">
                <CheckCircle className="w-10 h-10 animate-bounce" />
                <span className="absolute -top-3 -right-3 text-2xl animate-pulse">🎺</span>
                <span className="absolute -bottom-3 -left-3 text-2xl animate-bounce">👏</span>
              </div>
              
              <h3 className="text-2xl font-display font-black tracking-tight text-emerald-500 flex items-center gap-2">
                <span>🎺 Celebration Complete! 👏</span>
              </h3>
              <p className={`text-xs mt-2 max-w-sm leading-relaxed text-center px-4 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                Celebration applause & trumpet fanfare! Excellent job completing this session.
              </p>

              <div className="mt-6 flex items-center gap-4">
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100/50 dark:border-orange-900/30 px-5 py-2.5 rounded-2xl flex flex-col items-center shadow-sm">
                  <span className="text-[9px] font-bold text-stone-550 dark:text-stone-400 uppercase">REWARD</span>
                  <span className="text-sm font-black font-mono text-[#FF8A3D]">+{habit.xpReward} XP</span>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 px-5 py-2.5 rounded-2xl flex flex-col items-center shadow-sm">
                  <span className="text-[9px] font-bold text-stone-550 dark:text-stone-400 uppercase">COACH GATE</span>
                  <span className="text-sm font-black font-mono text-emerald-500 flex items-center gap-1">
                    Synced <Award className="w-4 h-4" />
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-stone-500 dark:text-stone-500 mt-8 font-mono animate-pulse">
                Saving somatic contract data and returning...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AcronymValidationModal
          isOpen={isAcronymModalOpen}
          suspiciousWord={suspiciousWord}
          darkMode={darkMode}
          onConfirmAcronym={handleConfirmAcronym}
          onCorrect={() => setIsAcronymModalOpen(false)}
        />
      </div>
    </div>
  );
}
