import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { Send, Sparkles, Brain, Award, ChevronRight, RefreshCw, User, HelpCircle } from 'lucide-react';
import { CoachMessage, UserProfile, Habit } from '../types';
import EducationalLoading from './EducationalLoading';

interface AICoachProps {
  userProfile: UserProfile;
  habits: Habit[];
  onAddInsightXP: (xp: number) => void;
  darkMode?: boolean;
}

export default function AICoach({ userProfile, habits, onAddInsightXP, darkMode = false }: AICoachProps) {
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hello, **${userProfile.name}**! I am **Dr. Gethro**, your Vicfungo Behavioral Growth Coach. 
      
I have initialized my cognitive systems to support your **${userProfile.growthPersona}** archetype. Based on your focus on **${userProfile.focusAreas.join(', ')}**, we will structure micro-steps to build unbreakable routines.

How is your growth momentum feeling today? Pick a science-backed exploration below, or tell me what is on your mind!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterChips = [
    { text: "Help me design a morning Habit Stack", icon: "☕" },
    { text: "I broke my streak yesterday. Help me recover.", icon: "🩹" },
    { text: "Suggest a way to reduce friction for my routines", icon: "🧼" },
    { text: "Analyze my active habits for cognitive gaps", icon: "🔎" }
  ];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const markdownComponents = {
    h1: ({ children }: any) => (
      <h3 className={`text-base font-bold font-display mt-3 mb-1.5 ${darkMode ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>
        {children}
      </h3>
    ),
    h2: ({ children }: any) => (
      <h4 className={`text-sm font-bold font-display mt-2.5 mb-1 ${darkMode ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>
        {children}
      </h4>
    ),
    h3: ({ children }: any) => (
      <h4 className={`text-sm font-bold mt-2 mb-1 ${darkMode ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>
        {children}
      </h4>
    ),
    h4: ({ children }: any) => (
      <div className={`text-xs font-bold tracking-wide uppercase mt-2.5 mb-1 font-mono ${darkMode ? 'text-[#FB923C]' : 'text-orange-600'}`}>
        {children}
      </div>
    ),
    h5: ({ children }: any) => (
      <div className={`text-xs font-bold mt-2 mb-1 ${darkMode ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>
        {children}
      </div>
    ),
    h6: ({ children }: any) => (
      <div className={`text-xs font-semibold mt-1.5 mb-0.5 ${darkMode ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
        {children}
      </div>
    ),
    p: ({ children }: any) => (
      <p className="text-sm leading-relaxed mb-2 last:mb-0">
        {children}
      </p>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc pl-5 space-y-1 my-2 text-sm leading-relaxed">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal pl-5 space-y-1 my-2 text-sm leading-relaxed">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="text-sm leading-relaxed">
        {children}
      </li>
    ),
    strong: ({ children }: any) => {
      const textContent = Array.isArray(children) ? children.join('') : String(children || '');
      if (textContent.includes('Dr. Gethro') || textContent.includes('Doctor Gethro')) {
        return (
          <strong className="font-bold text-stone-900 dark:text-stone-100 bg-orange-100/70 border border-orange-200/80 dark:bg-stone-800/90 dark:border-stone-700 px-1.5 py-0.5 rounded-lg inline-flex items-center gap-0.5 whitespace-nowrap">
            <span className="text-[#EA580C] dark:text-[#FB923C] text-[10px]">✦</span>
            {children}
          </strong>
        );
      }
      return (
        <strong className={`font-bold ${darkMode ? 'text-[#FB923C]' : 'text-[#EA580C]'}`}>
          {children}
        </strong>
      );
    },
    code: ({ children }: any) => (
      <code className={`px-1.5 py-0.5 rounded text-xs font-mono font-medium ${
        darkMode ? 'bg-[#0F141C] text-[#FB923C] border border-[#334255]' : 'bg-orange-50 text-orange-700 border border-orange-200'
      }`}>
        {children}
      </code>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className={`border-l-2 border-[#EA580C] pl-3 italic text-xs my-2.5 ${
        darkMode ? 'text-[#94A3B8]' : 'text-slate-600'
      }`}>
        {children}
      </blockquote>
    )
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: CoachMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userProfile,
          habits
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from coach API');
      }

      const data = await response.json();
      
      const aiMsg: CoachMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.text || "I apologize, my psychological models are currently calibrating. Let's focus on Friction Reduction—how can you make your routine 10% easier today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        insights: data.insights || []
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      // Fallback message
      const aiMsg: CoachMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: "I was unable to synchronize with my primary cloud servers, but let's remember: **Never Miss Twice**. If you had a slight obstacle today, let's stack a trigger to keep the momentum going tomorrow!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyInsight = (insightTitle: string) => {
    // Reward user for reading and committing to an AI-prescribed psychological action
    onAddInsightXP(50);
    
    const userConfirmMsg: CoachMessage = {
      id: `user-confirm-${Date.now()}`,
      sender: 'user',
      text: `I have studied the prescription: "${insightTitle}" and am committing to integrating this into my behavioral contract!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userConfirmMsg]);
    setIsLoading(true);

    setTimeout(() => {
      const aiAckMsg: CoachMessage = {
        id: `ai-ack-${Date.now()}`,
        sender: 'ai',
        text: `Splendid commitment, **${userProfile.name}**! I have credited **+50 XP** to your Vicfungo status tree. Committing to behavioral frameworks creates a cognitive seal. 

Let me know when you achieve the first stack of this technique!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiAckMsg]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-140px)] rounded-[32px] overflow-hidden border shadow-premium ${
      darkMode ? 'bg-[#0F141C] border-[#334255]' : 'bg-[#FEFAF7] border-stone-100'
    }`} id="ai-coach-root">
      
      {/* Coach Header */}
      <div className={`px-6 py-4 border-b flex items-center justify-between ${
        darkMode ? 'bg-[#171F2A] border-[#334255]' : 'bg-white border-stone-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            darkMode ? 'bg-[rgba(255,122,26,0.15)] border-[rgba(255,122,26,0.35)]' : 'bg-orange-50 border-orange-100'
          }`}>
            <Brain className="w-5.5 h-5.5 text-[#FF7A1A]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className={`font-bold text-sm ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-800'}`}>Dr. Gethro</h3>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                darkMode ? 'bg-[rgba(255,122,26,0.15)] text-[#FFB074] border border-[rgba(255,122,26,0.35)]' : 'bg-orange-50 text-[#FF7A1A]'
              }`}>PSYCHOLOGY ADVOCATE</span>
            </div>
            <p className={`text-[11px] ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'} mt-0.5 flex items-center gap-1`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" /> Adaptive Growth Tuning: {userProfile.growthPersona}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'} font-mono hidden sm:inline`}>COACH TONE: {userProfile.quizAnswers.coachingTone.toUpperCase()}</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <div 
              key={`msg-${msg.id}-${idx}`} 
              id={`chat-msg-${msg.id}`}
              className={`flex gap-3 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                msg.sender === 'user' 
                  ? darkMode ? 'bg-[rgba(255,122,26,0.15)] text-[#FFB074] border-[rgba(255,122,26,0.35)]' : 'bg-orange-50 text-[#FF7A1A] border-orange-100' 
                  : darkMode ? 'bg-[#171F2A] text-[#94A3B8] border-[#334255]' : 'bg-white text-stone-500 border-stone-200'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4 text-[#FF7A1A]" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-3">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-[#FF7A1A] text-white rounded-tr-none shadow-sm' 
                    : darkMode 
                      ? 'bg-[#171F2A] text-[#F8FAFC] rounded-tl-none border border-[#334255] shadow-sm' 
                      : 'bg-white text-stone-800 rounded-tl-none border border-stone-100 shadow-sm'
                }`}>
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div>
                      <Markdown components={markdownComponents}>
                        {msg.text}
                      </Markdown>
                    </div>
                  )}
                  <span className={`block text-[9px] mt-1.5 text-right ${msg.sender === 'user' ? 'text-orange-100' : darkMode ? 'text-[#64748B]' : 'text-stone-500'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {/* Render Prescribed Insights if present */}
                {msg.insights && msg.insights.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {msg.insights.map((ins, i) => (
                      <div 
                        key={`insight-${msg.id}-${ins.title}-${i}`} 
                        id={`ai-insight-prescribe-${i}`}
                        className={`rounded-2xl p-4 border shadow-sm ${
                          darkMode ? 'bg-[#1E2836] border-[#334255]' : 'bg-orange-50/30 border-orange-100'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Sparkles className="w-4 h-4 text-[#FF7A1A]" />
                          <h4 className="text-xs font-bold text-[#FF7A1A] uppercase tracking-wider">BEHAVIORAL REMEDY PRESCRIBED</h4>
                        </div>
                        <h5 className={`font-bold text-sm ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-800'}`}>{ins.title}</h5>
                        <p className={`text-xs ${darkMode ? 'text-[#94A3B8]' : 'text-stone-600'} mt-1 leading-relaxed`}>{ins.description}</p>
                        
                        <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold font-mono ${
                            darkMode ? 'bg-purple-950/40 text-purple-300 border border-purple-900/40' : 'bg-purple-50 text-purple-600'
                          }`}>
                            PRINCIPLE: {ins.principle.toUpperCase()}
                          </span>
                          <button
                            id={`btn-apply-insight-${i}`}
                            onClick={() => handleApplyInsight(ins.title)}
                            className={`text-xs px-3 py-1 rounded-2xl font-semibold transition flex items-center gap-1 cursor-pointer ${
                              darkMode
                                ? 'bg-[#171F2A] text-[#FFB074] border border-[#FF7A1A] hover:bg-[#FF7A1A] hover:text-white'
                                : 'bg-white text-[#FF7A1A] border border-[#FF7A1A] hover:bg-[#FF7A1A] hover:text-white'
                            }`}
                          >
                            Commit & Gain +50 XP <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="my-2 max-w-sm" id="coach-loading-bubble">
            <EducationalLoading message="Dr. Gethro is analyzing behavioral patterns..." compact={true} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Chips (Only visible when no input and chat is short) */}
      <div className={`px-6 pt-3 pb-1 border-t overflow-x-auto whitespace-nowrap flex gap-2 ${
        darkMode ? 'bg-[#171F2A] border-[#334255]' : 'bg-white border-stone-100'
      }`}>
        {starterChips.map((chip, i) => (
          <button
            key={`chip-${chip.text}-${i}`}
            id={`starter-chip-${i}`}
            onClick={() => handleSendMessage(chip.text)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs rounded-2xl transition cursor-pointer shrink-0 ${
              darkMode 
                ? 'bg-[#1E2836] hover:bg-[#263242] border-[#334255] text-[#94A3B8] hover:text-[#F8FAFC]' 
                : 'bg-[#FEFAF7] hover:bg-orange-50/50 border-stone-200 hover:border-orange-200 text-stone-600'
            }`}
          >
            <span>{chip.icon}</span>
            <span className={`font-medium ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-700'}`}>{chip.text}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className={`p-4 border-t ${
        darkMode ? 'bg-[#171F2A] border-[#334255]' : 'bg-white border-stone-100'
      }`}>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            id="coach-chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your growth status or ask Dr. Gethro..."
            className={`flex-1 px-4 py-3 rounded-2xl text-sm transition focus:outline-none focus:border-[#FF7A1A] ${
              darkMode 
                ? 'bg-[#0F141C] border border-[#334255] text-[#F8FAFC] placeholder-[#64748B] focus:bg-[#171F2A]' 
                : 'bg-[#FEFAF7] border border-stone-200 text-stone-800 placeholder-stone-400 focus:bg-white'
            }`}
          />
          <button
            id="btn-coach-chat-send"
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-3.5 rounded-2xl transition flex items-center justify-center shrink-0 ${
              input.trim() && !isLoading
                ? 'bg-[#FF7A1A] hover:bg-[#e76b13] text-white shadow-premium-orange cursor-pointer'
                : darkMode ? 'bg-[#1E2836] text-[#64748B] cursor-not-allowed' : 'bg-[#F5F1EE] text-stone-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
