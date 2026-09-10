import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, ArrowRight, Check, Award, Flame, ChevronRight, BookOpen, Activity, Heart, Shield } from 'lucide-react';
import { UserProfile, UserStats, GrowthPersona, HabitCategory, PsychologicalPrinciple } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile, stats: UserStats) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [identityAnchor, setIdentityAnchor] = useState<string>('');
  const [motivation, setMotivation] = useState<string>('');
  const [obstacle, setObstacle] = useState<string>('');
  const [coachingTone, setCoachingTone] = useState<string>('');
  const [selectedFocus, setSelectedFocus] = useState<HabitCategory[]>([]);
  
  // Custom first habit fields
  const [habitName, setHabitName] = useState<string>('');
  const [habitCategory, setHabitCategory] = useState<HabitCategory>('productivity');
  const [habitTrigger, setHabitTrigger] = useState<string>('');
  const [habitTime, setHabitTime] = useState<string>('08:00');

  const focusCategories: { value: HabitCategory; label: string; icon: string; desc: string }[] = [
    { value: 'productivity', label: 'Productivity', icon: '⚡', desc: 'Focus, work, deep tasks' },
    { value: 'mindfulness', label: 'Mindfulness', icon: '🧘', desc: 'Meditation, stress relief, peace' },
    { value: 'health', label: 'Health & Wellness', icon: '🍏', desc: 'Sleep, nutrition, hydration' },
    { value: 'fitness', label: 'Fitness', icon: '💪', desc: 'Exercise, runs, stretching' },
    { value: 'learning', label: 'Learning & Skills', icon: '📚', desc: 'Reading, languages, coding' },
    { value: 'finance', label: 'Finance', icon: '🪙', desc: 'Saving, tracking expenses' },
    { value: 'social', label: 'Social & Family', icon: '❤️', desc: 'Calling friends, family quality' }
  ];

  const handleToggleFocus = (cat: HabitCategory) => {
    if (selectedFocus.includes(cat)) {
      setSelectedFocus(selectedFocus.filter(f => f !== cat));
    } else {
      setSelectedFocus([...selectedFocus, cat]);
    }
  };

  const calculatePersona = (): GrowthPersona => {
    if (obstacle === 'hard-start') return 'The Micro-Habit Builder';
    if (obstacle === 'distracted') return 'The Identity Shifter';
    if (obstacle === 'lose-interest') return 'The Game Strategist';
    return 'The Mindful Observer';
  };

  const handleFinish = () => {
    const persona = calculatePersona();
    
    const profile: UserProfile = {
      name: name || 'Seeker',
      growthPersona: persona,
      focusAreas: selectedFocus.length > 0 ? selectedFocus : ['productivity', 'mindfulness'],
      quizAnswers: {
        motivation,
        obstacle,
        coachingTone: coachingTone || 'supportive',
        stylePreference: 'adaptive'
      },
      joinedAt: new Date().toISOString(),
      isPro: false,
      identityAnchor: identityAnchor.trim() || `someone who protects my clarity & health`
    };

    const stats: UserStats = {
      xp: 150, // Starting bonus
      level: 1,
      streakMultiplier: 1.0,
      bronzeBadges: ['Seed of Growth'],
      silverBadges: [],
      goldBadges: [],
      totalCompletedCount: 0,
      streakDays: 0,
      lastActiveDate: new Date().toISOString().split('T')[0]
    };

    // If they typed a custom habit, we'll auto-generate it in App.tsx
    onComplete(profile, stats);
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div id="onboarding-root" className="min-h-screen bg-[#FEFAF7] flex items-center justify-center p-4 selection:bg-orange-100 selection:text-orange-900">
      <div className="w-full max-w-xl bg-white rounded-[32px] shadow-premium border border-stone-100 overflow-hidden relative">
        
        {/* Background Accent Gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-gradient-to-b from-orange-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Top Progress Bar */}
        {step > 0 && step < 6 && (
          <div className="w-full bg-[#F5F1EE] h-1.5 flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`flex-1 h-full transition-all duration-300 ${
                  s <= step ? 'bg-[#FF8A3D]' : 'bg-[#F5F1EE]'
                }`}
              />
            ))}
          </div>
        )}

        <div className="p-8 sm:p-10 relative z-10">
          <AnimatePresence mode="wait">
            
            {/* Step 0: Warm Landing */}
            {step === 0 && (
              <motion.div 
                key="landing"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-center py-6"
                id="onboarding-step-0"
              >
                <div className="inline-flex p-4 bg-orange-50 rounded-2xl mb-6">
                  <Brain className="w-10 h-10 text-[#FF8A3D]" />
                </div>
                <h1 className="text-3xl font-display font-bold text-stone-900 tracking-tight mb-3">
                  Welcome to <span className="text-[#FF8A3D]">Vicfungo</span>
                </h1>
                <p className="text-stone-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                  A premium AI-powered personal growth platform rooted in behavioral psychology. Let&apos;s discover your growth archetype and craft your tailored pathway.
                </p>

                <div className="space-y-4 mb-8 text-left max-w-md mx-auto">
                  <div className="flex items-start gap-3 p-3.5 bg-[#F5F1EE] rounded-2xl border border-stone-100">
                    <div className="p-2 bg-white rounded-xl text-orange-500 shadow-sm font-semibold text-sm">01</div>
                    <div>
                      <h3 className="font-semibold text-stone-800 text-sm">Psychological Profiling</h3>
                      <p className="text-xs text-stone-500">Determine your cognitive style to match your tailored AI Coaching mode.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 bg-[#F5F1EE] rounded-2xl border border-stone-100">
                    <div className="p-2 bg-white rounded-xl text-orange-500 shadow-sm font-semibold text-sm">02</div>
                    <div>
                      <h3 className="font-semibold text-stone-800 text-sm">Tiny Habits Method</h3>
                      <p className="text-xs text-stone-500">Stack triggers to make your routines stick effortlessly with zero friction.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 bg-[#F5F1EE] rounded-2xl border border-stone-100">
                    <div className="p-2 bg-white rounded-xl text-orange-500 shadow-sm font-semibold text-sm">03</div>
                    <div>
                      <h3 className="font-semibold text-stone-800 text-sm">Adaptive AI Growth Companion</h3>
                      <p className="text-xs text-stone-500">Engage in science-backed reflection sessions with Dr. Gethro, your personal growth guide.</p>
                    </div>
                  </div>
                </div>

                <button
                  id="btn-onboarding-start"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white font-medium rounded-2xl transition shadow-premium-orange flex items-center justify-center gap-2 cursor-pointer mx-auto"
                >
                  Discover Your Archetype
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Step 1: Name & Identity Anchor Input */}
            {step === 1 && (
              <motion.div 
                key="name-step"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                id="onboarding-step-1"
              >
                <div className="mb-5">
                  <span className="text-xs font-semibold text-[#FF8A3D] uppercase tracking-wider bg-orange-50 px-2.5 py-1 rounded-full">Identity</span>
                  <h2 className="text-2xl font-display font-bold text-stone-900 mt-2.5">Tell us about yourself</h2>
                  <p className="text-stone-500 text-xs mt-1">Our AI Coach will address you and tailor your psychological feedback based on this identity.</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label htmlFor="user-name-input" className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Your Name</label>
                    <input
                      id="user-name-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Victor"
                      className="w-full px-4 py-2.5 bg-[#FEFAF7] border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#FF8A3D] focus:bg-white transition text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label htmlFor="user-identity-input" className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                      Your Identity Shift Anchor (Who are you becoming?)
                    </label>
                    <input
                      id="user-identity-input"
                      type="text"
                      value={identityAnchor}
                      onChange={(e) => setIdentityAnchor(e.target.value)}
                      placeholder="e.g. I am a disciplined software engineer"
                      className="w-full px-4 py-2.5 bg-[#FEFAF7] border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#FF8A3D] focus:bg-white transition text-sm italic"
                    />
                    
                    {/* Presets */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {[
                        'I am a disciplined software engineer',
                        'I am someone who protects my mental clarity',
                        'I am a healthy and energetic person'
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setIdentityAnchor(preset)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg border transition cursor-pointer font-medium ${
                            identityAnchor === preset
                              ? 'bg-orange-50 border-[#FF8A3D] text-[#FF8A3D]'
                              : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-600'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    
                    <p className="text-[10px] text-stone-400 mt-2 leading-relaxed">
                      💡 Behavioral psychology shows identity-focused habits are 4x more likely to stick. Focus on <em>who you want to be</em>, not just what you want to achieve.
                    </p>
                  </div>
                </div>

                <button
                  id="btn-onboarding-step-1-next"
                  disabled={!name.trim()}
                  onClick={() => setStep(2)}
                  className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm ${
                    name.trim() 
                      ? 'bg-[#FF8A3D] hover:bg-[#e77a2f] text-white shadow-premium-orange cursor-pointer' 
                      : 'bg-[#F5F1EE] text-stone-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Step 2: Focus Areas */}
            {step === 2 && (
              <motion.div 
                key="focus-step"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                id="onboarding-step-2"
              >
                <div className="mb-6">
                  <span className="text-xs font-semibold text-[#FF8A3D] uppercase tracking-wider bg-orange-50 px-2.5 py-1 rounded-full">Intention</span>
                  <h2 className="text-2xl font-display font-bold text-stone-900 mt-3">Select your focal paths</h2>
                  <p className="text-stone-500 text-sm mt-1">Which domains of your life are you prioritising right now?</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 max-h-[300px] overflow-y-auto pr-1">
                  {focusCategories.map((cat) => {
                    const isSelected = selectedFocus.includes(cat.value);
                    return (
                      <button
                        key={cat.value}
                        id={`focus-cat-${cat.value}`}
                        onClick={() => handleToggleFocus(cat.value)}
                        className={`p-4 rounded-2xl text-left border transition flex items-center gap-3 cursor-pointer ${
                          isSelected 
                            ? 'bg-orange-50/50 border-[#FF8A3D] ring-1 ring-[#FF8A3D]' 
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                          <h4 className="font-semibold text-stone-800 text-sm">{cat.label}</h4>
                          <p className="text-xs text-stone-500 mt-0.5">{cat.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep(1)} 
                    className="px-6 py-3.5 bg-[#F5F1EE] hover:bg-stone-200 text-stone-600 font-medium rounded-2xl transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    id="btn-onboarding-step-2-next"
                    disabled={selectedFocus.length === 0}
                    onClick={() => setStep(3)}
                    className={`flex-1 py-3.5 rounded-2xl font-medium transition flex items-center justify-center gap-2 ${
                      selectedFocus.length > 0 
                        ? 'bg-[#FF8A3D] hover:bg-[#e77a2f] text-white shadow-premium-orange cursor-pointer' 
                        : 'bg-[#F5F1EE] text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Obstacle Diagnosis */}
            {step === 3 && (
              <motion.div 
                key="obstacle-step"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                id="onboarding-step-3"
              >
                <div className="mb-6">
                  <span className="text-xs font-semibold text-[#FF8A3D] uppercase tracking-wider bg-orange-50 px-2.5 py-1 rounded-full">Friction</span>
                  <h2 className="text-2xl font-display font-bold text-stone-900 mt-3">What is your biggest hurdle?</h2>
                  <p className="text-stone-500 text-sm mt-1">Understanding where habits break allows us to prescribe the perfect psychological mitigation.</p>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    { id: 'hard-start', text: 'Initiation barrier (stale start, putting things off)', principle: 'Friction Reduction prescribe' },
                    { id: 'distracted', text: 'Mental drift & distraction (forgetting the trigger)', principle: 'Habit Stacking prescribe' },
                    { id: 'lose-interest', text: 'Diminishing reward (losing steam after 4-5 days)', principle: 'Gamification & Instant Rewards' },
                    { id: 'lonely', text: 'Solitary tracking (feeling isolated or unaccountable)', principle: 'Social Commitment contracts' }
                  ].map((obs) => (
                    <button
                      key={obs.id}
                      id={`obstacle-${obs.id}`}
                      onClick={() => setObstacle(obs.id)}
                      className={`w-full p-4 text-left rounded-2xl border transition flex items-start gap-3 cursor-pointer ${
                        obstacle === obs.id 
                          ? 'bg-orange-50/50 border-[#FF8A3D] ring-1 ring-[#FF8A3D]' 
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 transition ${
                        obstacle === obs.id ? 'border-[#FF8A3D] bg-[#FF8A3D] text-white' : 'border-stone-300 bg-white'
                      }`}>
                        {obstacle === obs.id && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <span className="font-medium text-stone-800 text-sm">{obs.text}</span>
                        <span className="block text-xs text-[#FF8A3D] mt-1 font-mono uppercase tracking-wider">{obs.principle}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep(2)} 
                    className="px-6 py-3.5 bg-[#F5F1EE] hover:bg-stone-200 text-stone-600 font-medium rounded-2xl transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    id="btn-onboarding-step-3-next"
                    disabled={!obstacle}
                    onClick={() => setStep(4)}
                    className={`flex-1 py-3.5 rounded-2xl font-medium transition flex items-center justify-center gap-2 ${
                      obstacle 
                        ? 'bg-[#FF8A3D] hover:bg-[#e77a2f] text-white shadow-premium-orange cursor-pointer' 
                        : 'bg-[#F5F1EE] text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    Diagnose Alignment
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Persona Calculated & Coaching Selection */}
            {step === 4 && (
              <motion.div 
                key="persona-step"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                id="onboarding-step-4"
                className="py-2"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 bg-orange-100 text-[#FF8A3D] rounded-full mb-3">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="block text-xs font-mono text-stone-500 uppercase tracking-wider">YOUR GROWTH ARCHETYPE</span>
                  <h2 className="text-2xl font-display font-bold text-[#FF8A3D] mt-1">
                    {calculatePersona()}
                  </h2>
                </div>

                <div className="p-4 bg-orange-50/40 rounded-2xl border border-orange-100 mb-6 text-sm text-stone-700 leading-relaxed">
                  {calculatePersona() === 'The Micro-Habit Builder' && (
                    <p>Choosing the <strong>Friction Reduction</strong> pathway configures your routine to be incredibly easy to start. We break your goals down into simple 2-minute habits so you never struggle with starting or get overwhelmed. Dr. Gethro will focus entirely on building consistent momentum rather than demanding heavy volume.</p>
                  )}
                  {calculatePersona() === 'The Identity Shifter' && (
                    <p>Choosing the <strong>Identity Shifter</strong> pathway rewires how you perceive yourself. Instead of aiming for raw stats, you will align your habits with the type of person you want to become. Dr. Gethro will help you anchor these new routines to reliable daily triggers so they become automatic parts of your identity.</p>
                  )}
                  {calculatePersona() === 'The Game Strategist' && (
                    <p>Choosing the <strong>Game Strategist</strong> pathway turns your growth into an immersive personal game. You will earn XP, level up, and unlock customizable reward milestones. Dr. Gethro will gamify your tracking to maximize dopamine and make staying consistent feel genuinely fun.</p>
                  )}
                  {calculatePersona() === 'The Mindful Observer' && (
                    <p>Choosing the <strong>Mindful Observer</strong> pathway connects your routines with mental wellness. You will track habits alongside your emotional energy levels and mental battery. Dr. Gethro will offer gentle mindfulness reflections to build sustainable routines that align with your overall well-being.</p>
                  )}
                </div>

                <div className="mb-6">
                  <label htmlFor="coaching-style-select" className="block text-xs font-medium text-stone-500 mb-3 uppercase tracking-wider">Select Dr. Gethro&apos;s Coaching Persona</label>
                  <div className="grid grid-cols-2 gap-2" id="coaching-style-select">
                    {[
                      { id: 'supportive', name: 'Empathetic Mentor', desc: 'Compassionate & encouraging' },
                      { id: 'scientific', name: 'Habit Scientist', desc: 'Data & psychological metrics' },
                      { id: 'challenging', name: 'Executive Catalyst', desc: 'Direct, focused, performance-driven' },
                      { id: 'zen', name: 'Mindful Guide', desc: 'Gentle, meditative reflection' }
                    ].map((tone) => (
                      <button
                        key={tone.id}
                        onClick={() => setCoachingTone(tone.id)}
                        className={`p-3 text-left rounded-xl border text-xs transition cursor-pointer ${
                          coachingTone === tone.id 
                            ? 'bg-[#FF8A3D] border-[#FF8A3D] text-white' 
                            : 'bg-white border-stone-200 hover:border-stone-300 text-stone-800'
                        }`}
                      >
                        <h4 className="font-bold">{tone.name}</h4>
                        <p className={`mt-0.5 ${coachingTone === tone.id ? 'text-orange-100' : 'text-stone-500'}`}>{tone.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep(3)} 
                    className="px-6 py-3.5 bg-[#F5F1EE] hover:bg-stone-200 text-stone-600 font-medium rounded-2xl transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    id="btn-onboarding-step-4-next"
                    onClick={() => setStep(5)}
                    className="flex-1 py-3.5 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white font-medium rounded-2xl transition shadow-premium-orange flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Commit to Pathway
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: BJ Fogg Stack First Habit */}
            {step === 5 && (
              <motion.div 
                key="first-habit-step"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                id="onboarding-step-5"
              >
                <div className="mb-6">
                  <span className="text-xs font-semibold text-[#FF8A3D] uppercase tracking-wider bg-orange-50 px-2.5 py-1 rounded-full">Behavioral Architecture</span>
                  <h2 className="text-2xl font-display font-bold text-stone-900 mt-3">Stack Your First Habit</h2>
                  <p className="text-stone-500 text-sm mt-1">
                    Instead of a vague goal, we map it as a simple routine stack:
                    <span className="block mt-1 font-mono text-xs text-[#FF8A3D]">After I... [something I already do] ➔ I will... [my new habit]</span>
                  </p>
                </div>

                <div className="space-y-4 mb-8 bg-[#F5F1EE] p-5 rounded-2xl border border-stone-100">
                  <div>
                    <label htmlFor="first-habit-name" className="block text-xs font-semibold text-stone-600 mb-1">What small habit would you like to build?</label>
                    <input
                      id="first-habit-name"
                      type="text"
                      value={habitName}
                      onChange={(e) => setHabitName(e.target.value)}
                      placeholder="e.g. Read 5 pages, stretch for 2 minutes, drink a glass of water"
                      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-[#FF8A3D] text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="first-habit-trigger" className="block text-xs font-semibold text-stone-600 mb-1">What do you already do every day that can remind you to do it?</label>
                    <input
                      id="first-habit-trigger"
                      type="text"
                      value={habitTrigger}
                      onChange={(e) => setHabitTrigger(e.target.value)}
                      placeholder="e.g. Brush my teeth, finish breakfast, sit down at my desk"
                      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-[#FF8A3D] text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="first-habit-category" className="block text-xs font-medium text-stone-500 mb-1">CATEGORY</label>
                      <select
                        id="first-habit-category"
                        value={habitCategory}
                        onChange={(e) => setHabitCategory(e.target.value as HabitCategory)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-[#FF8A3D] text-sm cursor-pointer"
                      >
                        <option value="productivity">Productivity</option>
                        <option value="mindfulness">Mindfulness</option>
                        <option value="health">Health & Wellness</option>
                        <option value="fitness">Fitness</option>
                        <option value="learning">Learning</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="first-habit-time" className="block text-xs font-medium text-stone-500 mb-1">APPROX TIME</label>
                      <input
                        id="first-habit-time"
                        type="time"
                        value={habitTime}
                        onChange={(e) => setHabitTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-[#FF8A3D] text-sm"
                      />
                    </div>
                  </div>

                  {habitName && habitTrigger && (
                    <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 text-xs text-[#FF8A3D] font-medium leading-relaxed">
                      💡 <strong>Your Behavioral Contract:</strong> &ldquo;After I <strong>{habitTrigger}</strong>, I will <strong>{habitName}</strong>.&rdquo;
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep(4)} 
                    className="px-6 py-3.5 bg-[#F5F1EE] hover:bg-stone-200 text-stone-600 font-medium rounded-2xl transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    id="btn-onboarding-finalize"
                    onClick={handleFinish}
                    className="flex-1 py-3.5 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white font-medium rounded-2xl transition shadow-premium-orange flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Finalize Setup
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
