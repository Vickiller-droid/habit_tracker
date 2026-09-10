import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Flame, Zap, Trophy, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Star, ChevronRight } from 'lucide-react';
import { UserStats } from '../types';

interface GamificationProps {
  stats: UserStats;
  onClaimChallengeXP: (xpReward: number, challengeId: string) => void;
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

export default function Gamification({ stats, onClaimChallengeXP }: GamificationProps) {
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
              className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            >
              {/* Confetti simulation elements */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" />
              <div className="text-6xl mb-4 animate-bounce">🏆</div>
              <h3 className="text-2xl font-display font-bold text-stone-900">Challenge Completed!</h3>
              <p className="text-xs text-stone-500 mt-2">Your behavioral shift is locking in.</p>
              
              <div className="my-6 inline-flex items-center gap-2 px-5 py-2.5 bg-orange-50 text-[#FF8A3D] font-mono font-bold text-xl rounded-2xl border border-orange-100">
                <Sparkles className="w-5 h-5 animate-pulse" />
                +{celebrationXP} XP Claimed
              </div>

              <p className="text-xs text-stone-500 italic">Dr. Gethro says: &ldquo;Excellent cognitive conditioning! Keep stacking those loops.&rdquo;</p>
              
              <button
                id="btn-close-celebration"
                onClick={() => setShowCelebration(false)}
                className="mt-6 w-full py-3 bg-[#FF8A3D] text-white font-semibold rounded-2xl hover:bg-[#e77a2f] transition cursor-pointer"
              >
                Let&apos;s Go
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Dashboard Card */}
      <div className="bg-white rounded-[32px] p-6 border border-stone-100 shadow-premium overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-50/50 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />
        
        <div className="flex justify-between items-center flex-wrap gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-100/50 border border-orange-200 rounded-2xl flex items-center justify-center text-3xl font-display font-black text-[#FF8A3D] relative shadow-premium-orange">
              {stats.level}
              <div className="absolute -bottom-1 -right-1 bg-[#FF8A3D] text-white text-[8px] font-mono font-extrabold px-1 py-0.5 rounded uppercase tracking-wider">LEVEL</div>
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full uppercase">VICTOR STATUS TREE</span>
              <h2 className="text-xl font-display font-extrabold text-stone-800 mt-1 tracking-tight">Level Up Pathway</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#F5F1EE] border border-stone-100 p-2 rounded-2xl shrink-0">
            <div className="px-3.5 py-1.5 bg-[#FF8A3D] text-white rounded-xl font-mono font-bold text-sm flex items-center gap-1 shadow-sm">
              <Star className="w-4 h-4 fill-current" /> {stats.xp} Total XP
            </div>
            <div className="px-3.5 py-1.5 bg-white text-stone-600 rounded-xl font-mono font-bold text-sm flex items-center gap-1">
              Multiplier: {stats.streakMultiplier}x
            </div>
          </div>
        </div>

        {/* Level bar progress */}
        <div className="mt-8 relative z-10">
          <div className="flex justify-between items-center text-xs font-mono text-stone-500 mb-2">
            <span>CURRENT XP: {currentLevelXP}</span>
            <span>NEXT LEVEL: {nextLevelXP} XP</span>
          </div>
          <div className="w-full bg-[#F5F1EE] h-4 rounded-2xl overflow-hidden border border-stone-200 p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#FF8A3D] to-amber-500 rounded-xl shadow-inner relative"
            >
              <span className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
          </div>
          <p className="text-[10px] text-stone-500 mt-2 font-medium">✨ Stacking perfect habit days boosts your multiplier to level up 50% faster!</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border border-stone-100 bg-white p-1 rounded-2xl">
        <button
          id="tab-btn-challenges"
          onClick={() => setActiveTab('challenges')}
          className={`flex-1 py-3 text-sm font-semibold rounded-2xl transition cursor-pointer ${
            activeTab === 'challenges' 
              ? 'bg-[#FF8A3D] text-white shadow-sm' 
              : 'text-stone-500 hover:bg-[#FEFAF7]'
          }`}
        >
          Psychological Arena Challenges
        </button>
        <button
          id="tab-btn-badges"
          onClick={() => setActiveTab('badges')}
          className={`flex-1 py-3 text-sm font-semibold rounded-2xl transition cursor-pointer ${
            activeTab === 'badges' 
              ? 'bg-[#FF8A3D] text-white shadow-sm' 
              : 'text-stone-500 hover:bg-[#FEFAF7]'
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
            {challenges.map((chal) => (
              <div
                key={chal.id}
                id={`challenge-card-${chal.id}`}
                className={`p-5 bg-white rounded-[32px] border border-stone-100 shadow-premium flex items-center justify-between gap-4 transition-all ${
                  chal.completed ? 'opacity-70 bg-[#FEFAF7]/50' : 'hover:border-orange-200'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                    chal.completed 
                      ? 'bg-emerald-50 text-emerald-500 border-emerald-100' 
                      : 'bg-orange-50 text-[#FF8A3D] border-orange-100'
                  }`}>
                    {chal.completed ? <CheckCircle2 className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-sm ${chal.completed ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                        {chal.title}
                      </h3>
                      <span className="text-[9px] bg-[#F5F1EE] text-stone-500 px-1.5 py-0.5 rounded font-mono font-semibold uppercase">
                        {chal.category}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1 max-w-md leading-relaxed">
                      {chal.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-2xl">
                    +{chal.xpReward} XP
                  </span>
                  
                  <button
                    id={`btn-claim-challenge-${chal.id}`}
                    disabled={chal.completed}
                    onClick={(e) => handleClaim(chal, e)}
                    className={`px-4 py-2 text-xs font-bold rounded-2xl transition cursor-pointer ${
                      chal.completed
                        ? 'bg-[#F5F1EE] text-stone-400 cursor-not-allowed'
                        : 'bg-[#FF8A3D] hover:bg-[#e77a2f] text-white shadow-sm'
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
                key={i}
                id={`badge-card-${i}`}
                className={`p-5 rounded-[32px] border bg-white transition-all duration-300 relative ${
                  badge.unlocked 
                    ? 'border-orange-100 shadow-premium' 
                    : 'border-stone-200 opacity-40 grayscale select-none'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                    badge.unlocked ? 'bg-orange-50 border border-orange-100 shadow-sm' : 'bg-[#FEFAF7] border border-stone-200'
                  }`}>
                    {badge.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 text-sm">{badge.name}</h4>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      badge.rank === 'gold' ? 'bg-yellow-50 text-yellow-600' :
                      badge.rank === 'silver' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {badge.rank} award
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-500 mt-3 leading-relaxed">
                  {badge.desc}
                </p>

                {badge.unlocked ? (
                  <div className="absolute top-4 right-4 text-emerald-500" title="Unlocked">
                    <ShieldCheck className="w-5 h-5 fill-emerald-50" />
                  </div>
                ) : (
                  <div className="absolute top-4 right-4 text-stone-300" title="Locked">
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
