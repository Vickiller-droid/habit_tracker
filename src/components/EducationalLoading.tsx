import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, ChevronRight, Lightbulb, Activity, RefreshCw } from 'lucide-react';

export interface EducationalFact {
  category: 'NEUROSCIENCE' | 'HABIT FORMATION' | 'BEHAVIORAL ECONOMICS' | 'SOMATIC REGULATION';
  title: string;
  fact: string;
  source: string;
}

export const BEHAVIORAL_FACTS: EducationalFact[] = [
  {
    category: 'HABIT FORMATION',
    title: 'Context & Cue Reinforcement',
    fact: 'Repeating a habit in the same context strengthens the brain\'s cue-response association, making the behavior feel more automatic over time.',
    source: 'Journal of Personality & Social Psychology'
  },
  {
    category: 'BEHAVIORAL ECONOMICS',
    title: 'Friction Reduction Dynamics',
    fact: 'Tiny habits are significantly more sustainable than ambitious ones because they drastically reduce the initial cognitive friction required to start.',
    source: 'Stanford Behavior Design Lab'
  },
  {
    category: 'NEUROSCIENCE',
    title: 'Environmental Choice Architecture',
    fact: 'Your environment shapes your daily behaviors far more than raw willpower. Small physical adjustments produce lasting automatic habits.',
    source: 'Dr. Gethro Behavioral Science Unit'
  },
  {
    category: 'HABIT FORMATION',
    title: 'Active Recall & Retention',
    fact: 'Reflecting immediately after reading or learning improves long-term neural retention by up to 300% through active memory recall.',
    source: 'Cognitive Science Quarterly'
  },
  {
    category: 'SOMATIC REGULATION',
    title: 'Vagal Nerve Activation',
    fact: 'Extended 4-second exhalations stimulate the vagus nerve, instantly lowering salivary cortisol and returning the nervous system to parasympathetic calm.',
    source: 'Somatic Neuroscience Review'
  },
  {
    category: 'NEUROSCIENCE',
    title: 'Dopamine Stacking',
    fact: 'Claiming immediate micro-rewards after completing a target habit locks in the mesolimbic dopamine pathway, accelerating habit consolidation.',
    source: 'Harvard Neurobiology Department'
  },
  {
    category: 'HABIT FORMATION',
    title: 'Identity-First Anchoring',
    fact: 'Framing habits as identity statements ("I am a reader") rather than task goals ("Read 10 pages") creates 4x higher adherence over 6 months.',
    source: 'Behavioral Psychology Journal'
  },
  {
    category: 'NEUROSCIENCE',
    title: 'Circadian Focus Windows',
    fact: 'Peak executive function occurs within 2 to 4 hours of waking. Placing high-friction cognitive habits in this window minimizes decision fatigue.',
    source: 'Chronobiology & Peak Performance Study'
  }
];

interface EducationalLoadingProps {
  message?: string;
  darkMode?: boolean;
  compact?: boolean;
}

export default function EducationalLoading({ message = 'Aligning behavioral neural engine...', darkMode = true, compact = false }: EducationalLoadingProps) {
  const [factIndex, setFactIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % BEHAVIORAL_FACTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const currentFact = BEHAVIORAL_FACTS[factIndex];

  if (compact) {
    return (
      <div className={`p-3.5 rounded-2xl border shadow-sm ${
        darkMode ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-orange-100/60 text-stone-800'
      }`}>
        <div className="flex items-center gap-2 mb-1.5">
          <Brain className="w-3.5 h-3.5 text-[#FF8A3D] animate-bounce" />
          <span className="text-[10px] font-mono font-bold text-[#FF8A3D] uppercase tracking-wider">
            {message}
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={factIndex}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-[11px] font-semibold text-stone-800 dark:text-stone-200">
              💡 {currentFact.title}: <span className="font-normal text-stone-600 dark:text-stone-400">{currentFact.fact}</span>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 rounded-3xl w-full max-w-lg border shadow-xl text-center relative overflow-hidden transition-all ${
      darkMode 
        ? 'bg-stone-900 border-stone-800 text-stone-100' 
        : 'bg-[#FEFAF7] border-orange-100 text-stone-850'
    }`}>
      {/* Background ambient glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Spinning Indicator */}
      <div className="relative mb-6 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF8A3D] to-amber-400 p-0.5 animate-spin">
          <div className={`w-full h-full rounded-full flex items-center justify-center ${darkMode ? 'bg-stone-900' : 'bg-white'}`}>
            <Brain className="w-7 h-7 text-[#FF8A3D] animate-pulse" />
          </div>
        </div>
        <div className="absolute -bottom-1 bg-[#FF8A3D] text-white text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
          <Activity className="w-2.5 h-2.5 animate-bounce" /> DR. GETHRO LABS
        </div>
      </div>

      <h4 className="text-sm font-bold tracking-tight text-stone-700 dark:text-stone-300 mb-5 flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-[#FF8A3D] animate-pulse" />
        {message}
      </h4>

      {/* Rotating Fact Card */}
      <div className={`w-full p-5 rounded-2xl border text-left relative min-h-[140px] flex flex-col justify-between ${
        darkMode ? 'bg-stone-850/80 border-stone-800' : 'bg-orange-50/40 border-orange-100/60'
      }`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={factIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col justify-between h-full"
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#FF8A3D] flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> DID YOU KNOW?
                </span>
                <span className="text-[9px] font-mono text-stone-400 dark:text-stone-500 uppercase">
                  {currentFact.category}
                </span>
              </div>
              <p className="text-xs font-semibold leading-relaxed text-stone-800 dark:text-stone-200">
                {currentFact.fact}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-stone-200/40 dark:border-stone-800/60 flex justify-between items-center text-[10px] font-mono text-stone-500 dark:text-stone-400">
              <span>Source: {currentFact.source}</span>
              <span className="text-[#FF8A3D] font-bold">{factIndex + 1}/{BEHAVIORAL_FACTS.length}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Manual Next Insight Trigger */}
      <div className="mt-4 flex justify-between items-center w-full px-1">
        <div className="flex gap-1">
          {BEHAVIORAL_FACTS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === factIndex ? 'w-5 bg-[#FF8A3D]' : 'w-1.5 bg-stone-300 dark:bg-stone-800'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setFactIndex((prev) => (prev + 1) % BEHAVIORAL_FACTS.length)}
          className="text-[11px] font-bold text-[#FF8A3D] hover:text-orange-600 flex items-center gap-1 cursor-pointer transition"
        >
          Next Insight <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
