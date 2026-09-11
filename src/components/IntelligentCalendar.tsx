import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Sparkles, CheckCircle2, ChevronRight, Plus, AlertCircle, RefreshCw, Laptop } from 'lucide-react';
import { Habit } from '../types';

interface IntelligentCalendarProps {
  habits: Habit[];
  selectedDate: string;
  onExecuteHabit: (habit: Habit) => void;
  darkMode: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'work' | 'meeting' | 'break';
}

export default function IntelligentCalendar({ habits, selectedDate, onExecuteHabit, darkMode }: IntelligentCalendarProps) {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [calendarConnected, setCalendarConnected] = useState<boolean>(false);
  const [syncedPlatform, setSyncedPlatform] = useState<string | null>(null);
  const [selectedPathwayFilter, setSelectedPathwayFilter] = useState<string>('all');
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);

  // Static/Simulated agenda events
  const [agenda, setAgenda] = useState<CalendarEvent[]>([
    { id: 'ev-1', title: '🚀 Sprint Kickoff & Stack Alignment', startTime: '09:00', endTime: '09:45', type: 'meeting' },
    { id: 'ev-2', title: '💻 Core Service Refactoring Block', startTime: '10:15', endTime: '11:30', type: 'work' },
    { id: 'ev-3', title: '🍱 Executive Lunch & Digestion Window', startTime: '12:00', endTime: '13:30', type: 'break' },
    { id: 'ev-4', title: '📊 Client Retrospective Review', startTime: '13:30', endTime: '14:30', type: 'meeting' },
    { id: 'ev-5', title: '🧠 Architectural Strategy Focus', startTime: '15:00', endTime: '16:15', type: 'work' }
  ]);

  // Handle Simulated OAuth flow
  const handleConnectCalendar = (platform: 'google' | 'outlook') => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setCalendarConnected(true);
      setSyncedPlatform(platform === 'google' ? 'Google Calendar' : 'Outlook Calendar');
      alert(`Successfully synchronized with your corporate ${platform === 'google' ? 'Google' : 'Outlook'} Calendar! We have scanned your schedule and mapped active routine opportunities.`);
    }, 1800);
  };

  // Find gaps in minutes between chronological events
  const calculateGaps = () => {
    const sorted = [...agenda].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const gapsList: { start: string; end: string; duration: number; afterEvent: string }[] = [];

    for (let i = 0; i < sorted.length - 1; i++) {
      const currentEnd = sorted[i].endTime;
      const nextStart = sorted[i + 1].startTime;

      const [cHours, cMins] = currentEnd.split(':').map(Number);
      const [nHours, nMins] = nextStart.split(':').map(Number);

      const currentEndTotal = cHours * 60 + cMins;
      const nextStartTotal = nHours * 60 + nMins;

      const diff = nextStartTotal - currentEndTotal;
      if (diff > 0) {
        gapsList.push({
          start: currentEnd,
          end: nextStart,
          duration: diff,
          afterEvent: sorted[i].title
        });
      }
    }
    return gapsList;
  };

  const gaps = calculateGaps();

  // Advanced Recommendation Engine with Dr. Gethro's behavioral intelligence
  const calculateRecommendations = () => {
    const uncompleted = habits.filter(h => !h.isArchived && !h.records[selectedDate]?.completed);
    const recommendations: { [gapIndex: number]: { habit: Habit; reason: string } } = {};
    const usedHabitIds = new Set<string>();

    gaps.forEach((gap, index) => {
      const duration = gap.duration;
      const [startHour] = gap.start.split(':').map(Number);
      const isMorning = startHour < 12;
      const isAfternoon = startHour >= 12 && startHour < 17;
      const isEvening = startHour >= 17;

      // Filter candidates that haven't been used for other gaps yet to maintain rich variety
      let candidates = uncompleted.filter(h => !usedHabitIds.has(h.id));
      
      let isExtraCredit = false;
      if (candidates.length === 0) {
        // If we ran out of uncompleted unique candidates, suggest already completed habits for extra credit reinforcement
        candidates = habits.filter(h => !h.isArchived && !usedHabitIds.has(h.id));
        isExtraCredit = true;
      }
      if (candidates.length === 0) {
        // Fallback: allow duplicates if total unique habits are fewer than total gaps
        candidates = uncompleted.length > 0 ? uncompleted : habits.filter(h => !h.isArchived);
      }

      // Filter candidates by chosen behavioral pathway if active
      if (selectedPathwayFilter !== 'all') {
        const filtered = candidates.filter(h => 
          h.psychologicalPrinciple.toLowerCase().replace(/\s+/g, '') === selectedPathwayFilter.toLowerCase().replace(/\s+/g, '')
        );
        if (filtered.length > 0) {
          candidates = filtered;
        }
      }

      if (candidates.length === 0) {
        return;
      }

      // Rank candidate habits based on duration fit, psychological principle, time of day, and history
      const scored = candidates.map(habit => {
        let score = 0;
        const nameLower = habit.name.toLowerCase();
        
        // 1. Duration compatibility matches
        if (duration <= 10) {
          // Short window (e.g. <= 10 minutes)
          if (nameLower.includes('breath') || nameLower.includes('breathe') || habit.category === 'mindfulness') score += 60;
          if (nameLower.includes('water') || nameLower.includes('hydrate') || nameLower.includes('hydration')) score += 50;
          if (nameLower.includes('stretch') || nameLower.includes('quick') || nameLower.includes('pose')) score += 40;
          if (habit.difficulty === 'easy') score += 30;
        } else if (duration <= 20) {
          // Medium window (e.g. 11-20 minutes)
          if (nameLower.includes('read') || nameLower.includes('book') || nameLower.includes('learn') || habit.category === 'learning') score += 60;
          if (nameLower.includes('journal') || nameLower.includes('reflect') || nameLower.includes('meditate')) score += 50;
          if (nameLower.includes('breath') || nameLower.includes('breathe') || habit.id === 'def-1') score += 40;
        } else {
          // Long window (e.g. > 20 minutes)
          if (nameLower.includes('focus') || nameLower.includes('sprint') || nameLower.includes('work') || nameLower.includes('project')) score += 60;
          if (nameLower.includes('exercise') || nameLower.includes('workout') || nameLower.includes('plank')) score += 50;
          if (nameLower.includes('read') || habit.difficulty === 'medium' || habit.difficulty === 'hard') score += 40;
        }

        // 2. Behavioral Pathway / Psychological Principle synergy
        if (habit.psychologicalPrinciple === 'Friction Reduction' && duration <= 10) {
          score += 30; // Friction reduction is perfect for short gaps
        }
        if (habit.psychologicalPrinciple === 'Identity Shift' && isEvening) {
          score += 25; // Identity shifts are amazing for evening reflections
        }
        if (habit.psychologicalPrinciple === 'Habit Stacking' && isMorning) {
          score += 25; // Stacks are highly effective in the morning
        }

        // 3. Time of day compatibility
        if (isMorning && (nameLower.includes('morning') || nameLower.includes('rise') || nameLower.includes('start') || nameLower.includes('prep'))) score += 30;
        if (isEvening && (nameLower.includes('evening') || nameLower.includes('night') || nameLower.includes('sleep') || nameLower.includes('reflect'))) score += 30;

        // 4. Emotional experience history & streak weighting
        let experienceCount = 0;
        let positiveCount = 0;
        let challengingCount = 0;
        
        Object.values(habit.records || {}).forEach((r: any) => {
          if (r.experienceFeeling) {
            experienceCount++;
            if (r.experienceFeeling === 'easy' || r.experienceFeeling === 'energizing') {
              positiveCount++;
            } else if (r.experienceFeeling === 'challenging') {
              challengingCount++;
            }
          }
        });

        if (experienceCount > 0) {
          const positivityRate = positiveCount / experienceCount;
          score += positivityRate * 35; // Boost positive experiences!
          
          // Adaptive coaching: if they often feel challenged by a habit in the morning,
          // reduce score slightly for morning or add specialized guidance in coaching notes
          const challengeRate = challengingCount / experienceCount;
          if (challengeRate > 0.4 && isMorning) {
            score -= 10; 
          }
        }

        // 5. Streaks: high-streak habits get some boost to keep the momentum alive
        score += Math.min((habit.currentStreak || 0) * 3, 25);

        return { habit, score };
      });

      // Sort candidates by score descending
      scored.sort((a, b) => b.score - a.score);
      const selected = scored[0].habit;
      usedHabitIds.add(selected.id);

      // Generate a highly specific, adaptive behavioral coaching reasoning
      let reason = '';
      const name = selected.name;
      const principle = selected.psychologicalPrinciple;
      
      const isBreathing = name.toLowerCase().includes('breath') || name.toLowerCase().includes('breathe') || selected.category === 'mindfulness';
      const isReading = name.toLowerCase().includes('read') || name.toLowerCase().includes('book') || selected.category === 'learning';
      
      if (duration <= 10) {
        if (isBreathing) {
          reason = `You have a ${duration}-minute window before your next commitment. Based on your active goal to reduce friction, this deep breathing session will reset your nervous system and prepare your focus.`;
        } else {
          reason = `A brief ${duration}-minute pocket. Using the "${principle}" pathway, committing to ${name} right now secures a quick neural victory with zero cognitive strain.`;
        }
      } else if (duration <= 20) {
        if (isReading) {
          reason = `A perfect ${duration}-minute cognitive gap. Since reading strengthens your identity as a learner, taking this time for ${name} will lock in long-term memory retrieval.`;
        } else {
          reason = `A valuable ${duration}-minute transition window. Based on your current progress, intercepting ${name} here aligns beautifully with your identity shift.`;
        }
      } else {
        reason = `You have a spacious ${duration}-minute window before your next event. Based on your goals and recent positive habits, initiating ${name} is the highest-impact action you can take to enter high-yield flow state.`;
      }

      if (isExtraCredit) {
        reason += ` (Extra-Credit somatic stretch: already logged today, but excellent for double reinforcement!)`;
      }

      recommendations[index] = { habit: selected, reason };
    });

    return recommendations;
  };

  const recommendations = calculateRecommendations();

  return (
    <div className={`p-6 rounded-[32px] border ${
      darkMode ? 'bg-[#171F2A] border-[#334255]' : 'bg-white border-stone-100'
    } shadow-premium space-y-6 transition-colors`} id="intelligent-calendar-module">
      
      {/* Header Info */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Calendar className="w-5 h-5 text-[#FF7A1A]" />
            <h3 className={`font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-800'} text-sm`}>Chrono-Gap Routine Interceptor</h3>
          </div>
          <p className={`text-xs ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'} leading-relaxed max-w-lg`}>
            This module integrates with your workspace schedule. By scanning gaps between meetings, Vicfungo inserts micro-somatic breaks to reduce cognitive fatigue and anchor your identity.
          </p>
        </div>

        {/* Sync Controls */}
        <div className="shrink-0">
          {calendarConnected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-[10px] text-emerald-400 font-mono font-bold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              CONNECTED: {syncedPlatform}
            </div>
          ) : (
            <div className="flex gap-1.5">
              <button
                onClick={() => handleConnectCalendar('google')}
                disabled={isSyncing}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-xl border transition flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                  darkMode 
                    ? 'bg-[rgba(255,122,26,0.15)] hover:bg-[rgba(255,122,26,0.25)] text-[#FFB074] border-[rgba(255,122,26,0.35)]' 
                    : 'bg-orange-50 hover:bg-orange-100/80 text-[#FF7A1A] border-orange-100'
                }`}
              >
                {isSyncing ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Sync Google Calendar'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Calendar Visual on Left, Gap Recommendations on Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Side: Visual Daily Schedule Timeline */}
        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#0F141C] border-[#334255]' : 'bg-stone-50/50 border-stone-150/40'} space-y-3`}>
          <div className={`flex justify-between items-center border-b pb-2.5 ${darkMode ? 'border-[#334255]' : 'border-stone-200/50'}`}>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'}`}>Workspace Schedule</span>
            <span className="text-[10px] font-mono font-bold text-[#64748B]">TODAY</span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {agenda.map((event, idx) => (
              <div 
                key={`agenda-${event.id}-${idx}`}
                className={`p-3 rounded-xl border text-xs transition flex justify-between items-center gap-3 ${
                  event.type === 'meeting' 
                    ? (darkMode ? 'bg-[rgba(255,122,26,0.1)] border-[rgba(255,122,26,0.25)] text-[#FFB074]' : 'bg-orange-50/40 border-orange-100/50 text-orange-800')
                    : event.type === 'break'
                      ? (darkMode ? 'bg-indigo-950/25 border-indigo-900/40 text-indigo-300' : 'bg-indigo-50/40 border-indigo-100/50 text-indigo-800')
                      : (darkMode ? 'bg-[#1E2836] border-[#334255] text-[#F8FAFC]' : 'bg-white border-stone-200 text-stone-750')
                }`}
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold truncate">{event.title}</h4>
                  <p className={`text-[10px] font-medium mt-0.5 capitalize ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'}`}>{event.type} Session</p>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-[10px] font-mono font-bold">
                  <Clock className={`w-3 h-3 ${darkMode ? 'text-[#64748B]' : 'text-stone-400'}`} />
                  <span>{event.startTime} - {event.endTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Intercept Gap Opportunities */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'}`}>Routine Intercepts</span>
            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
              darkMode ? 'bg-[rgba(255,122,26,0.15)] text-[#FFB074] border-[rgba(255,122,26,0.35)]' : 'bg-orange-50 text-[#FF7A1A] border-orange-100'
            }`}>
              {gaps.length} Opportunity Blocks
            </span>
          </div>

          {/* Pathway Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Pathways' },
              { id: 'frictionreduction', label: 'Friction Reduction' },
              { id: 'identityshift', label: 'Identity Shift' },
              { id: 'habitstacking', label: 'Habit Stacking' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPathwayFilter(p.id)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedPathwayFilter === p.id
                    ? 'bg-[#FF7A1A] text-white shadow-xs'
                    : darkMode ? 'bg-[#1E2836] text-[#94A3B8] hover:text-[#F8FAFC]' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={() => setShuffleSeed(prev => prev + 1)}
              title="Recalibrate Engine"
              className={`ml-auto p-1 transition cursor-pointer shrink-0 ${darkMode ? 'text-[#94A3B8] hover:text-[#FF7A1A]' : 'text-stone-400 hover:text-[#FF7A1A]'}`}
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
            {gaps.map((gap, i) => {
              const rec = recommendations[i];
              const suggestedHabit = rec?.habit;
              const suggestionReason = rec?.reason;
              
              return (
                <div 
                  key={`gap-${gap.start}-${gap.end}-${i}`}
                  className={`p-4 rounded-2xl border transition relative overflow-hidden ${
                    darkMode 
                      ? 'bg-[#171F2A] border-[#334255] hover:border-[#FF7A1A]/40' 
                      : 'bg-white border-stone-200 hover:border-orange-200 shadow-sm hover:shadow'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-xl pointer-events-none" />

                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] border px-2 py-0.5 rounded font-mono font-bold ${
                          darkMode ? 'bg-[rgba(255,122,26,0.15)] text-[#FFB074] border-[rgba(255,122,26,0.35)]' : 'bg-orange-500/10 text-[#FF7A1A] border-orange-500/20'
                        }`}>
                          ⏱ {gap.duration} MINUTE GAP
                        </span>
                        <span className={`text-[9px] font-mono ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'}`}>
                          Between {gap.start} and {gap.end}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-2 leading-relaxed ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'}`}>
                        After <span className={`font-semibold ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-700'}`}>{gap.afterEvent}</span>, you have a natural window.
                      </p>
                      {suggestionReason && (
                        <p className={`text-[10px] font-medium italic mt-2 leading-relaxed p-2.5 rounded-xl border ${
                          darkMode 
                            ? 'bg-[rgba(255,122,26,0.1)] text-[#FFB074] border-[rgba(255,122,26,0.25)]' 
                            : 'bg-orange-500/5 text-orange-700 border-orange-500/10'
                        }`}>
                          💡 {suggestionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Suggested Routine Card Section */}
                  {suggestedHabit ? (
                    <div className={`mt-3 p-3 rounded-xl border flex items-center justify-between gap-3 ${
                      darkMode ? 'bg-[#0F141C] border-[#334255]' : 'bg-[#FEFAF7]/70 border-orange-100/40'
                    }`}>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-mono font-bold text-[#FF7A1A] uppercase">SUGGESTED ROUTINE</span>
                        <h5 className={`text-xs font-bold mt-0.5 truncate ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-800'}`}>{suggestedHabit.name}</h5>
                        <p className={`text-[9px] mt-0.5 truncate ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'}`}>{suggestedHabit.psychologicalPrinciple} reinforcement</p>
                      </div>

                      <button
                        onClick={() => onExecuteHabit(suggestedHabit)}
                        className="px-3.5 py-1.5 bg-[#FF7A1A] hover:bg-[#e76b13] text-white text-[10px] font-bold rounded-xl transition shadow-premium-orange cursor-pointer flex items-center gap-1 whitespace-nowrap"
                      >
                        <Sparkles className="w-3 h-3 fill-current" /> Intercept Now
                      </button>
                    </div>
                  ) : (
                    <div className={`mt-3 p-3 text-center text-[10px] rounded-xl border ${
                      darkMode ? 'bg-[#0F141C] text-[#94A3B8] border-[#334255]' : 'bg-stone-50 text-stone-500 border-stone-200/50'
                    }`}>
                      🎉 No uncompleted routines left to intercept in this gap! Keep up the amazing work!
                    </div>
                  )}
                </div>
              );
            })}

            {gaps.length === 0 && (
              <div className={`py-8 text-center text-xs ${darkMode ? 'text-[#64748B]' : 'text-stone-400'}`}>
                No meeting gaps detected. Great, you have uninterrupted focus!
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
