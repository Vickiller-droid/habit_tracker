import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Flame, Zap, Trophy, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Star, ChevronRight } from 'lucide-react';
import { UserStats } from '../types';

interface GamificationProps {
  stats: UserStats;
  onClaimChallengeXP: (xpReward: number, challengeId: string) => void;
  darkMode?: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  category: string;
  completed: boolean;
  type: 'reflection' | 'streak' | 'hard' | 'sync';
}

export default function Gamification({ stats, onClaimChallengeXP, darkMode = false }: GamificationProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: 'chall-1',
      title: 'Mindful Reflector',
      description: 'Fill out 3 psychological wellness logs when checking off habits.',
      xpReward: 100,
      category: 'Behavioral',
      completed: false,
      type: 'reflection'
    },
    {
      id: 'chall-2',
      title: 'Friction Slayer',
      description: 'Complete a habit marked as HARD difficulty to prove your identity shift.',
      xpReward: 150,
      category: 'Performance',
      completed: false,
      type: 'hard'
    },
    {
      id: 'chall-3',
      title: 'Wearable Synergy',
      description: 'Connect a wearable device (Apple Watch / Fitbit) to sync somatic statistics.',
      xpReward: 120,
      category: 'Somatic',
      completed: false,
      type: 'sync'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'challenges' | 'badges'>('challenges');
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationXP, setCelebrationXP] = useState<number>(0);

  const levelProgress = (stats.xp % 500) / 5; // 500 XP per level
  const currentLevelXP = stats.xp % 500;
  const nextLevelXP = 500;

  const handleClaim = (chal: Challenge, e?: React.MouseEvent) => {
    if (chal.completed) return;
    
    // Trigger multi-splash dopamine cascade
    const x = e ? e.clientX : window.innerWidth / 2;
    const y = e ? e.clientY : window.innerHeight / 2;
    
    // First splash
    window.dispatchEvent(new CustomEvent('somatic-dopamine-splash', { detail: { x, y } }));
    
    // Secondary delayed splashes for grand accomplishment feel
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('somatic-dopamine-splash', { 
        detail: { x: x - 60 + Math.random() * 120, y: y - 40 + Math.random() * 80 } 
      }));
    }, 200);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('somatic-dopamine-splash', { 
        detail: { x: x - 60 + Math.random() * 120, y: y - 40 + Math.random() * 80 } 
      }));
    }, 400);

    onClaimChallengeXP(chal.xpReward, chal.id);
    setCelebrationXP(chal.xpReward);
    setShowCelebration(true);
    
    setChallenges(prev => 
      prev.map(c => c.id === chal.id ? { ...c, completed: true } : c)
    );

    setTimeout(() => {
      setShowCelebration(false);
    }, 4000);
  };

  const badges = [
    { name: 'Seed of Growth', rank: 'bronze', icon: '🌱', desc: 'Completed onboarding quiz and discovered your cognitive growth profile.', unlocked: true },
    { name: 'Identity Shift Seal', rank: 'bronze', icon: '🥋', desc: 'Created an identity-anchored habit stack contract.', unlocked: stats.totalCompletedCount >= 1 },
    { name: 'Streak Alchemist', rank: 'silver', icon: '🔥', desc: 'Achieved a consecutive streak of 5 perfect days.', unlocked: stats.streakDays >= 5 },
    { name: 'Somatic Pioneer', rank: 'silver', icon: '⌚', desc: 'Successfully synchronized simulated biometric wearable data.', unlocked: stats.bronzeBadges.includes('Wearable Synced') || false },
    { name: 'Dr. Gethro\'s Favorite', rank: 'gold', icon: '🦉', desc: 'Acquired 3 behavioral prescriptions during chat sessions.', unlocked: stats.xp >= 300 }
  ];

  return (
    <div className="space-y-6" id="gamification-root">
      
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            id="gamification-celebration-modal"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden border ${
                darkMode ? 'bg-[#212C3C] border-[#37465B] text-[#F8FAFC]' : 'bg-white border-stone-100 text-stone-900'
              }`}
            >
              {/* Confetti simulation elements */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FF7A1A] via-[#FF923E] to-amber-500" />
              <div className="text-6xl mb-4 animate-bounce">🏆</div>
              <h3 className={`text-2xl font-display font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-900'}`}>Challenge Completed!</h3>
              <p className={`text-xs ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'} mt-2`}>Your behavioral shift is locking in.</p>
              
              <div className={`my-6 inline-flex items-center gap-2 px-5 py-2.5 font-mono font-bold text-xl rounded-2xl border ${
                darkMode 
                  ? 'bg-[rgba(255,122,26,0.15)] text-[#FFB074] border-[rgba(255,122,26,0.35)]' 
                  : 'bg-orange-50 text-[#FF7A1A] border-orange-100'
              }`}>
                <Sparkles className="w-5 h-5 animate-pulse" />
                +{celebrationXP} XP Claimed
              </div>

              <p className={`text-xs ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'} italic`}>Dr. Gethro says: &ldquo;Excellent cognitive conditioning! Keep stacking those loops.&rdquo;</p>
              
              <button
                id="btn-close-celebration"
                onClick={() => setShowCelebration(false)}
                className="mt-6 w-full py-3 bg-[#FF7A1A] text-white font-semibold rounded-2xl hover:bg-[#e76b13] transition cursor-pointer"
              >
                Let&apos;s Go
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Dashboard Card */}
      <div className={`rounded-[32px] p-6 border shadow-premium overflow-hidden relative ${
        darkMode ? 'bg-[#171F2A] border-[#334255]' : 'bg-white border-stone-100'
      }`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />
        
        <div className="flex justify-between items-center flex-wrap gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-display font-black relative shadow-premium-orange border ${
              darkMode ? 'bg-[rgba(255,122,26,0.15)] border-[rgba(255,122,26,0.35)] text-[#FFB074]' : 'bg-orange-100/50 border-orange-200 text-[#FF7A1A]'
            }`}>
              {stats.level}
              <div className="absolute -bottom-1 -right-1 bg-[#FF7A1A] text-white text-[8px] font-mono font-extrabold px-1 py-0.5 rounded uppercase tracking-wider">LEVEL</div>
            </div>
            <div>
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full uppercase ${
                darkMode ? 'bg-[rgba(255,122,26,0.15)] text-[#FFB074] border border-[rgba(255,122,26,0.35)]' : 'bg-orange-50 text-[#FF7A1A]'
              }`}>VICTOR STATUS TREE</span>
              <h2 className={`text-xl font-display font-extrabold mt-1 tracking-tight ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-800'}`}>Level Up Pathway</h2>
            </div>
          </div>

          <div className={`flex items-center gap-2 border p-2 rounded-2xl shrink-0 ${
            darkMode ? 'bg-[#0F141C] border-[#334255]' : 'bg-[#F5F1EE] border-stone-100'
          }`}>
            <div className="px-3.5 py-1.5 bg-[#FF7A1A] text-white rounded-xl font-mono font-bold text-sm flex items-center gap-1 shadow-sm">
              <Star className="w-4 h-4 fill-current" /> {stats.xp} Total XP
            </div>
            <div className={`px-3.5 py-1.5 rounded-xl font-mono font-bold text-sm flex items-center gap-1 ${
              darkMode ? 'bg-[#1E2836] text-[#94A3B8]' : 'bg-white text-stone-600'
            }`}>
              Multiplier: {stats.streakMultiplier}x
            </div>
          </div>
        </div>

        {/* Level bar progress */}
        <div className="mt-8 relative z-10">
          <div className={`flex justify-between items-center text-xs font-mono mb-2 ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'}`}>
            <span>CURRENT XP: {currentLevelXP}</span>
            <span>NEXT LEVEL: {nextLevelXP} XP</span>
          </div>
          <div className={`w-full h-4 rounded-2xl overflow-hidden border p-0.5 ${
            darkMode ? 'bg-[#0F141C] border-[#334255]' : 'bg-[#F5F1EE] border-stone-200'
          }`}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#FF7A1A] to-amber-500 rounded-xl shadow-inner relative"
            >
              <span className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
          </div>
          <p className={`text-[10px] mt-2 font-medium ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'}`}>✨ Stacking perfect habit days boosts your multiplier to level up 50% faster!</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className={`flex border p-1 rounded-2xl ${
        darkMode ? 'bg-[#171F2A] border-[#334255]' : 'bg-white border-stone-100'
      }`}>
        <button
          id="tab-btn-challenges"
          onClick={() => setActiveTab('challenges')}
          className={`flex-1 py-3 text-sm font-semibold rounded-2xl transition cursor-pointer ${
            activeTab === 'challenges' 
              ? 'bg-[#FF7A1A] text-white shadow-sm' 
              : darkMode ? 'text-[#94A3B8] hover:bg-[#1E2836]' : 'text-stone-500 hover:bg-[#FEFAF7]'
          }`}
        >
          Psychological Arena Challenges
        </button>
        <button
          id="tab-btn-badges"
          onClick={() => setActiveTab('badges')}
          className={`flex-1 py-3 text-sm font-semibold rounded-2xl transition cursor-pointer ${
            activeTab === 'badges' 
              ? 'bg-[#FF7A1A] text-white shadow-sm' 
              : darkMode ? 'text-[#94A3B8] hover:bg-[#1E2836]' : 'text-stone-500 hover:bg-[#FEFAF7]'
          }`}
        >
          Digital Badge Cabinet
        </button>
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        {activeTab === 'challenges' ? (
          <motion.div
            key="tab-challenges"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
            id="tab-challenges-panel"
          >
            {challenges.map((chal, idx) => (
              <div
                key={`challenge-${chal.id}-${idx}`}
                id={`challenge-card-${chal.id}`}
                className={`p-5 rounded-[32px] border shadow-premium flex items-center justify-between gap-4 transition-all ${
                  chal.completed 
                    ? darkMode ? 'opacity-70 bg-[#171F2A]/60 border-[#263242]' : 'opacity-70 bg-[#FEFAF7]/50 border-stone-100'
                    : darkMode ? 'bg-[#171F2A] border-[#334255] hover:border-[#FF7A1A]/40' : 'bg-white border-stone-100 hover:border-orange-200'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                    chal.completed 
                      ? darkMode ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40' : 'bg-emerald-50 text-emerald-500 border-emerald-100'
                      : darkMode ? 'bg-[rgba(255,122,26,0.15)] text-[#FFB074] border-[rgba(255,122,26,0.35)]' : 'bg-orange-50 text-[#FF7A1A] border-orange-100'
                  }`}>
                    {chal.completed ? <CheckCircle2 className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-sm ${chal.completed ? darkMode ? 'line-through text-[#64748B]' : 'line-through text-stone-400' : darkMode ? 'text-[#F8FAFC]' : 'text-stone-800'}`}>
                        {chal.title}
                      </h3>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase ${
                        darkMode ? 'bg-[#1E2836] text-[#94A3B8] border border-[#334255]' : 'bg-[#F5F1EE] text-stone-500'
                      }`}>
                        {chal.category}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 max-w-md leading-relaxed ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'}`}>
                      {chal.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <span className={`font-mono text-xs font-bold px-2.5 py-1 rounded-2xl border ${
                    darkMode ? 'bg-[rgba(255,122,26,0.15)] text-[#FFB074] border-[rgba(255,122,26,0.35)]' : 'bg-orange-50 text-[#FF7A1A] border-orange-100'
                  }`}>
                    +{chal.xpReward} XP
                  </span>
                  
                  <button
                    id={`btn-claim-challenge-${chal.id}`}
                    disabled={chal.completed}
                    onClick={(e) => handleClaim(chal, e)}
                    className={`px-4 py-2 text-xs font-bold rounded-2xl transition cursor-pointer ${
                      chal.completed
                        ? darkMode ? 'bg-[#1E2836] text-[#64748B] cursor-not-allowed' : 'bg-[#F5F1EE] text-stone-400 cursor-not-allowed'
                        : 'bg-[#FF7A1A] hover:bg-[#e76b13] text-white shadow-sm'
                    }`}
                  >
                    {chal.completed ? 'Completed' : 'Claim Reward'}
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="tab-badges"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            id="tab-badges-panel"
          >
            {badges.map((badge, i) => (
              <div
                key={`badge-${badge.name || i}-${i}`}
                id={`badge-card-${i}`}
                className={`p-5 rounded-[32px] border transition-all duration-300 relative ${
                  badge.unlocked 
                    ? darkMode ? 'bg-[#171F2A] border-[#334255] shadow-premium' : 'bg-white border-orange-100 shadow-premium'
                    : darkMode ? 'bg-[#0F141C] border-[#263242] opacity-40 grayscale select-none' : 'bg-white border-stone-200 opacity-40 grayscale select-none'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${
                    badge.unlocked 
                      ? darkMode ? 'bg-[rgba(255,122,26,0.15)] border-[rgba(255,122,26,0.35)] shadow-sm' : 'bg-orange-50 border-orange-100 shadow-sm'
                      : darkMode ? 'bg-[#1E2836] border-[#334255]' : 'bg-[#FEFAF7] border-stone-200'
                  }`}>
                    {badge.icon}
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-800'}`}>{badge.name}</h4>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      badge.rank === 'gold' ? darkMode ? 'bg-yellow-950/40 text-yellow-300 border border-yellow-900/40' : 'bg-yellow-50 text-yellow-600' :
                      badge.rank === 'silver' ? darkMode ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-500' : 
                      darkMode ? 'bg-amber-950/40 text-amber-300 border border-amber-900/40' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {badge.rank} award
                    </span>
                  </div>
                </div>

                <p className={`text-xs mt-3 leading-relaxed ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'}`}>
                  {badge.desc}
                </p>

                {badge.unlocked ? (
                  <div className="absolute top-4 right-4 text-emerald-500" title="Unlocked">
                    <ShieldCheck className="w-5 h-5 fill-emerald-50 dark:fill-emerald-950/40" />
                  </div>
                ) : (
                  <div className="absolute top-4 right-4 text-stone-300 dark:text-[#64748B]" title="Locked">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
