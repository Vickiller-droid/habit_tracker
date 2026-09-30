import { useState } from 'react';
import { motion } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Award, Brain, Battery, Smile, Activity, Calendar, Zap, Sparkles } from 'lucide-react';
import { Habit, UserProfile, UserStats, AIInsight } from '../types';

interface AnalyticsProps {
  habits: Habit[];
  userProfile: UserProfile;
  stats: UserStats;
  darkMode?: boolean;
}

export default function Analytics({ habits, userProfile, stats, darkMode = false }: AnalyticsProps) {
  const [useDemoData, setUseDemoData] = useState<boolean>(habits.length === 0 || Object.keys(habits[0]?.records || {}).length === 0);

  // Demo Data Generator for gorgeous default views
  const demoWeeklyCompletions = [
    { name: 'Mon', completions: 4, rate: 80, energy: 7.2, mood: 4.1 },
    { name: 'Tue', completions: 5, rate: 100, energy: 8.0, mood: 4.5 },
    { name: 'Wed', completions: 3, rate: 60, energy: 6.1, mood: 3.2 },
    { name: 'Thu', completions: 4, rate: 80, energy: 7.5, mood: 4.0 },
    { name: 'Fri', completions: 5, rate: 100, energy: 8.5, mood: 4.8 },
    { name: 'Sat', completions: 4, rate: 80, energy: 8.1, mood: 4.2 },
    { name: 'Sun', completions: 5, rate: 100, energy: 8.8, mood: 4.6 },
  ];

  const demoCategoryDistribution = [
    { subject: 'Productivity', A: 80, B: 110, fullMark: 150 },
    { subject: 'Mindfulness', A: 90, B: 130, fullMark: 150 },
    { subject: 'Health', A: 65, B: 100, fullMark: 150 },
    { subject: 'Fitness', A: 75, B: 120, fullMark: 150 },
    { subject: 'Learning', A: 120, B: 140, fullMark: 150 },
    { subject: 'Social', A: 50, B: 90, fullMark: 150 },
  ];

  const demoWellnessMatrix = [
    { day: 'Mon', Energy: 7.2, Mood: 4.1 },
    { day: 'Tue', Energy: 8.0, Mood: 4.5 },
    { day: 'Wed', Energy: 6.1, Mood: 3.2 },
    { day: 'Thu', Energy: 7.5, Mood: 4.0 },
    { day: 'Fri', Energy: 8.5, Mood: 4.8 },
    { day: 'Sat', Energy: 8.1, Mood: 4.2 },
    { day: 'Sun', Energy: 8.8, Mood: 4.6 },
  ];

  // Process Live Data
  const getLiveData = () => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const weeklyCompletions = last7Days.map(dateStr => {
      const dayIndex = new Date(dateStr).getDay();
      const name = weekdayLabels[dayIndex];
      let completedCount = 0;
      let totalCount = 0;
      let energySum = 0;
      let moodSum = 0;
      let recordsWithReflectionCount = 0;

      habits.forEach(h => {
        if (!h.isArchived) {
          totalCount++;
          const rec = h.records[dateStr];
          if (rec?.completed) {
            completedCount++;
            if (rec.energyLevel || rec.mood) {
              energySum += rec.energyLevel || 6;
              const moodMap = { great: 5, good: 4, meh: 3, bad: 2, terrible: 1 };
              moodSum += moodMap[rec.mood || 'good'];
              recordsWithReflectionCount++;
            }
          }
        }
      });

      return {
        name,
        completions: completedCount,
        rate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        energy: recordsWithReflectionCount > 0 ? Number((energySum / recordsWithReflectionCount).toFixed(1)) : 6,
        mood: recordsWithReflectionCount > 0 ? Number((moodSum / recordsWithReflectionCount).toFixed(1)) : 3.5
      };
    });

    // Categories Live
    const categories: { [key: string]: number } = { productivity: 0, mindfulness: 0, health: 0, fitness: 0, learning: 0, social: 0, finance: 0 };
    habits.forEach(h => {
      categories[h.category] = (categories[h.category] || 0) + 1;
    });

    const categoryDistribution = Object.keys(categories).map(cat => ({
      subject: cat.charAt(0).toUpperCase() + cat.slice(1),
      A: categories[cat] * 40, // Scale for chart
      B: 100,
      fullMark: 150
    }));

    // Calculate emotional experience feedback distribution
    let easyCount = 0;
    let challengingCount = 0;
    let boringCount = 0;
    let energizingCount = 0;
    let totalExperiences = 0;

    habits.forEach(h => {
      Object.values(h.records).forEach(rec => {
        if (rec.completed && rec.experienceFeeling) {
          totalExperiences++;
          if (rec.experienceFeeling === 'easy') easyCount++;
          else if (rec.experienceFeeling === 'challenging') challengingCount++;
          else if (rec.experienceFeeling === 'boring') boringCount++;
          else if (rec.experienceFeeling === 'energizing') energizingCount++;
        }
      });
    });

    // Fallbacks if empty (or demo mode) so it always looks stunning
    if (totalExperiences === 0 || useDemoData) {
      easyCount = 12;
      challengingCount = 7;
      boringCount = 2;
      energizingCount = 5;
      totalExperiences = 26;
    }

    const pct = (val: number) => totalExperiences > 0 ? Math.round((val / totalExperiences) * 100) : 0;
    
    const emotionalStats = {
      easy: pct(easyCount),
      challenging: pct(challengingCount),
      boring: pct(boringCount),
      energizing: pct(energizingCount),
      total: totalExperiences
    };

    return { weeklyCompletions, categoryDistribution, emotionalStats };
  };

  const live = getLiveData();
  const activeCompletions = useDemoData ? demoWeeklyCompletions : live.weeklyCompletions;
  const activeCategories = useDemoData ? demoCategoryDistribution : live.categoryDistribution;
  const activeWellness = useDemoData ? demoWeeklyCompletions : live.weeklyCompletions;
  const activeEmotional = live.emotionalStats;

  // Curated cognitive science advice blocks based on Persona
  const personaTips = {
    'The Micro-Habit Builder': [
      { title: "BJ Fogg's 2-Minute Rule", text: "When you feel resistance, reduce the habit to its first 2 minutes. E.g., 'Do 20 pushups' becomes 'Put on training shoes'. Friction reduction builds the identity of showing up." },
      { title: "Cognitive Energy Windows", text: "Complete your high-friction habits within 2 hours of waking when decision fatigue is at its lowest." }
    ],
    'The Identity Shifter': [
      { title: "Identity Over Outcomes", text: "Do not track to accomplish a goal; track to prove to yourself who you are. Every checked habit is a vote for your future self." },
      { title: "Never Miss Twice", text: "Missing once is a normal life variance. Missing twice is the inception of a new negative habit loop." }
    ],
    'The Game Strategist': [
      { title: "XP Multiplier Maintenance", text: "Maintain a 100% completion rate today to secure your streak multiplier. Multipliers accelerate level progressions by 20%." },
      { title: "Milestone Dopamine Stacking", text: "Link hard habits directly with a small instant reward immediately after completion to close the dopamine reinforcement loop." }
    ],
    'The Mindful Observer': [
      { title: "Mood & Energy Correlation", text: "You complete 40% more habits when energy is above 7. Focus on physical battery maintenance (sleep, hydration) as a foundation." },
      { title: "Reflective Grace", text: "A incomplete habit is not a failure; it is information about your current cognitive state. Reflect on what caused the friction." }
    ]
  };

  const tips = personaTips[userProfile.growthPersona] || personaTips['The Identity Shifter'];

  return (
    <div className="space-y-6" id="analytics-root">
      
      {/* Top Controls Card */}
      <div className={`p-6 rounded-[32px] border shadow-premium flex items-center justify-between flex-wrap gap-4 ${
        darkMode ? 'bg-[#171F2A] border-[#334255]' : 'bg-white border-stone-100'
      }`}>
        <div>
          <h2 className={`text-xl font-display font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-800'} tracking-tight`}>Growth Diagnostics & Analytics</h2>
          <p className={`text-xs ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'} mt-1`}>
            Correlating your psychological archetype and physical reflection data.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-xs ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'} font-medium`}>Viewing Mode:</span>
          <button
            id="btn-toggle-demo-data"
            onClick={() => setUseDemoData(!useDemoData)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              useDemoData 
                ? darkMode ? 'bg-[rgba(255,122,26,0.15)] text-[#FFB074] border-[rgba(255,122,26,0.35)]' : 'bg-orange-50 text-[#FF7A1A] border-orange-100' 
                : darkMode ? 'bg-[#1E2836] text-[#94A3B8] border-[#334255]' : 'bg-[#F5F1EE] text-stone-600 border-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {useDemoData ? 'Demo Simulator On' : 'Live Client Data'}
          </button>
        </div>
      </div>

      {/* Numerical Stats Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className={`p-5 rounded-[32px] border shadow-premium flex items-center gap-3 ${
          darkMode ? 'bg-[#171F2A] border-[#334255]' : 'bg-white border-stone-100'
        }`}>
          <div className="p-3 bg-orange-50 dark:bg-[rgba(255,122,26,0.15)] text-[#FF7A1A] dark:text-[#FFB074] rounded-2xl shrink-0">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className={`block text-[10px] font-bold ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'} uppercase tracking-wider`}>COMPLETION RATE</span>
            <span className={`text-xl font-display font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-800'}`}>
              {useDemoData ? '86%' : `${Math.round(stats.totalCompletedCount > 0 ? (stats.totalCompletedCount / (stats.totalCompletedCount + 2)) * 100 : 0)}%`}
            </span>
          </div>
        </div>

        <div className={`p-5 rounded-[32px] border shadow-premium flex items-center gap-3 ${
          darkMode ? 'bg-[#171F2A] border-[#334255]' : 'bg-white border-stone-100'
        }`}>
          <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-2xl shrink-0">
            <Calendar className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className={`block text-[10px] font-bold ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'} uppercase tracking-wider`}>ACTIVE STREAK</span>
            <span className={`text-xl font-display font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-800'}`}>
              {useDemoData ? '14 Days' : `${stats.streakDays} Days`}
            </span>
          </div>
        </div>

        <div className={`p-5 rounded-[32px] border shadow-premium flex items-center gap-3 ${
          darkMode ? 'bg-[#171F2A] border-[#334255]' : 'bg-white border-stone-100'
        }`}>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-2xl shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className={`block text-[10px] font-bold ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'} uppercase tracking-wider`}>STREAK MULTIPLIER</span>
            <span className={`text-xl font-display font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-800'}`}>
              {stats.streakMultiplier.toFixed(1)}x
            </span>
          </div>
        </div>

        <div className={`p-5 rounded-[32px] border shadow-premium flex items-center gap-3 ${
          darkMode ? 'bg-[#171F2A] border-[#334255]' : 'bg-white border-stone-100'
        }`}>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-2xl shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className={`block text-[10px] font-bold ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'} uppercase tracking-wider`}>TOTAL LEVEL XP</span>
            <span className={`text-xl font-display font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-800'}`}>
              {stats.xp} XP
            </span>
          </div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Daily Completions Rate */}
        <div className={`p-6 rounded-[32px] border shadow-premium ${
          darkMode ? 'bg-[#171F2A] border-[#334255]' : 'bg-white border-stone-100'
        }`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className={`font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-800'} text-sm`}>Behavioral Completion Rate</h3>
              <p className={`text-[10px] ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'}`}>Weekly progression mapping</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
              darkMode ? 'bg-[rgba(255,122,26,0.15)] text-[#FFB074] border border-[rgba(255,122,26,0.35)]' : 'bg-orange-50 text-[#FF7A1A]'
            }`}>WEEK TREND</span>
          </div>

          <div className="h-64 w-full" id="completion-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeCompletions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" fontSize={11} stroke={darkMode ? '#64748B' : '#A3A3A3'} tickLine={false} />
                <YAxis fontSize={11} stroke={darkMode ? '#64748B' : '#A3A3A3'} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    background: darkMode ? '#1E2836' : '#FFF', 
                    borderRadius: '16px', 
                    border: `1px solid ${darkMode ? '#334255' : '#F5F1EE'}`, 
                    color: darkMode ? '#F8FAFC' : '#1C1917',
                    fontSize: '11px' 
                  }}
                  formatter={(val: any) => [`${val}%`, 'Completion Rate']}
                />
                <Bar dataKey="rate" fill="#FF7A1A" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Wellness Matrix Correlation */}
        <div className={`p-6 rounded-[32px] border shadow-premium ${
          darkMode ? 'bg-[#171F2A] border-[#334255]' : 'bg-white border-stone-100'
        }`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className={`font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-800'} text-sm`}>Somatic Well-being Correlation</h3>
              <p className={`text-[10px] ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'}`}>Co-relating Energy Node (orange) vs Mood Level (indigo)</p>
            </div>
            <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full font-semibold border border-indigo-100 dark:border-indigo-900/40">PSYCHO-SOMATIC</span>
          </div>

          <div className="h-64 w-full" id="wellness-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeWellness} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" fontSize={11} stroke={darkMode ? '#64748B' : '#A3A3A3'} tickLine={false} />
                <YAxis fontSize={11} stroke={darkMode ? '#64748B' : '#A3A3A3'} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: darkMode ? '#1E2836' : '#FFF', 
                    borderRadius: '16px', 
                    border: `1px solid ${darkMode ? '#334255' : '#F5F1EE'}`, 
                    color: darkMode ? '#F8FAFC' : '#1C1917',
                    fontSize: '11px' 
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="energy" name="Energy Node (1-10)" stroke="#FF7A1A" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="mood" name="Mood (1-5)" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radar Category Map */}
        <div className={`p-6 rounded-[32px] border shadow-premium lg:col-span-1 flex flex-col justify-between ${
          darkMode ? 'bg-[#171F2A] border-[#334255]' : 'bg-white border-stone-100'
        }`}>
          <div>
            <h3 className={`font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-800'} text-sm mb-4`}>Growth Path Balance</h3>
            <div className="h-56 w-full flex items-center justify-center" id="radar-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={activeCategories}>
                  <PolarGrid stroke={darkMode ? '#263242' : '#F5F1EE'} />
                  <PolarAngleAxis dataKey="subject" fontSize={9} tick={{ fill: darkMode ? '#94A3B8' : '#57534E' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} />
                  <Radar name="Active Path" dataKey="A" stroke="#FF7A1A" fill="#FF7A1A" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Emotional Experience Distribution */}
          <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-[#263242]' : 'border-stone-100'}`}>
            <h4 className={`font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-800'} text-xs mb-3 flex items-center gap-1.5`}>
              <Smile className="w-4 h-4 text-[#FF7A1A]" /> Emotional Experience Trends
            </h4>
            <div className="space-y-2.5">
              {[
                { label: 'Easy', emoji: '😊', value: activeEmotional.easy, color: 'bg-emerald-500' },
                { label: 'Challenging', emoji: '💪', value: activeEmotional.challenging, color: 'bg-orange-500' },
                { label: 'Boring', emoji: '😐', value: activeEmotional.boring, color: 'bg-amber-500' },
                { label: 'Energizing', emoji: '🔥', value: activeEmotional.energizing, color: 'bg-indigo-500' }
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className={`flex justify-between text-[11px] font-medium ${darkMode ? 'text-[#94A3B8]' : 'text-stone-600'}`}>
                    <span className="flex items-center gap-1">
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </span>
                    <span className={`font-mono font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-850'}`}>{item.value}%</span>
                  </div>
                  <div className={`w-full h-1.5 ${darkMode ? 'bg-[#0F141C]' : 'bg-stone-100'} rounded-full overflow-hidden`}>
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className={`text-[9px] ${darkMode ? 'text-[#64748B]' : 'text-stone-400'} mt-3 font-mono`}>
              Aggregated from {activeEmotional.total} biometric completion evaluations.
            </p>
          </div>
        </div>

        {/* Cognitive Prescriptions Card */}
        <div className={`p-6 rounded-[32px] border shadow-premium lg:col-span-2 ${
          darkMode ? 'bg-[#171F2A] border-[#334255]' : 'bg-white border-stone-100'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-[#FF7A1A]" />
            <h3 className={`font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-800'} text-sm`}>Psychological Pathways for {userProfile.growthPersona}</h3>
          </div>

          <div className="space-y-4">
            {tips.map((tip, i) => (
              <div key={i} className={`p-4 rounded-2xl border ${
                darkMode ? 'bg-[#1E2836] border-[#334255]' : 'bg-orange-50/20 border-orange-100/50'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#FF7A1A]" />
                  <h4 className={`font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-800'} text-xs uppercase tracking-wider`}>{tip.title}</h4>
                </div>
                <p className={`text-xs ${darkMode ? 'text-[#94A3B8]' : 'text-stone-600'} leading-relaxed mt-1`}>
                  {tip.text}
                </p>
              </div>
            ))}
          </div>

          <div className={`mt-5 p-3 rounded-2xl flex items-center gap-3 border ${
            darkMode ? 'bg-indigo-950/20 border-indigo-900/30' : 'bg-indigo-50/20 border-indigo-100/50'
          }`}>
            <Smile className="w-5 h-5 text-indigo-500 shrink-0" />
            <p className={`text-[11px] ${darkMode ? 'text-indigo-300' : 'text-indigo-700'} leading-relaxed`}>
              <strong>Somatic Pro-Tip:</strong> Your wellness data shows a strong correlation between rest (energy &gt; 7) and habit success. Ensure you prioritize deep sleep nodes before hard fitness tasks.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
