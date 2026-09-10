import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Brain, Award, ChevronRight, RefreshCw, User, HelpCircle } from 'lucide-react';
import { CoachMessage, UserProfile, Habit } from '../types';
import EducationalLoading from './EducationalLoading';

interface AICoachProps {
  userProfile: UserProfile;
  habits: Habit[];
  onAddInsightXP: (xp: number) => void;
}

export default function AICoach({ userProfile, habits, onAddInsightXP }: AICoachProps) {
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

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const processed = text.replace(/\*\*\*/g, '**');
    const parts = processed.split('**');
    return parts.map((part, index) => {
      const cleanPart = part.replace(/\*/g, '');
      if (index % 2 === 1) {
        if (cleanPart.includes('Dr. Gethro') || cleanPart.includes('Doctor Gethro')) {
          return (
            <strong key={index} className="font-black text-stone-900 dark:text-stone-100 bg-orange-100/40 border border-orange-200/50 dark:bg-stone-800/80 dark:border-stone-700 px-1.5 py-0.5 rounded-lg inline-flex items-center gap-0.5 whitespace-nowrap">
              <span className="text-[#FF8A3D] text-[10px]">✦</span>
              {cleanPart}
            </strong>
          );
        }
        return <strong key={index} className="font-extrabold text-[#FF8A3D]">{cleanPart}</strong>;
      }
      return cleanPart;
    });
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
    <div className="flex flex-col h-[calc(100vh-140px)] bg-[#FEFAF7] rounded-[32px] overflow-hidden border border-stone-100 shadow-premium" id="ai-coach-root">
      
      {/* Coach Header */}
      <div className="bg-white px-6 py-4 border-b border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100">
            <Brain className="w-5.5 h-5.5 text-[#FF8A3D]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-stone-800 text-sm">Dr. Gethro</h3>
              <span className="text-[10px] bg-orange-50 text-[#FF8A3D] font-mono px-1.5 py-0.5 rounded font-bold">PSYCHOLOGY ADVOCATE</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" /> Adaptive Growth Tuning: {userProfile.growthPersona}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-mono hidden sm:inline">COACH TONE: {userProfile.quizAnswers.coachingTone.toUpperCase()}</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              id={`chat-msg-${msg.id}`}
              className={`flex gap-3 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                msg.sender === 'user' 
                  ? 'bg-orange-50 text-[#FF8A3D] border-orange-100' 
                  : 'bg-white text-stone-500 border-stone-200'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4 text-[#FF8A3D]" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-3">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-[#FF8A3D] text-white rounded-tr-none shadow-sm' 
                    : 'bg-white text-stone-800 rounded-tl-none border border-stone-100 shadow-sm'
                }`}>
                  <p className="whitespace-pre-line">
                    {renderFormattedText(msg.text)}
                  </p>
                  <span className={`block text-[9px] mt-1.5 text-right ${msg.sender === 'user' ? 'text-orange-100' : 'text-stone-500'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {/* Render Prescribed Insights if present */}
                {msg.insights && msg.insights.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {msg.insights.map((ins, i) => (
                      <div 
                        key={i} 
                        id={`ai-insight-prescribe-${i}`}
                        className="bg-orange-50/30 rounded-2xl p-4 border border-orange-100 shadow-sm"
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Sparkles className="w-4 h-4 text-[#FF8A3D]" />
                          <h4 className="text-xs font-bold text-[#FF8A3D] uppercase tracking-wider">BEHAVIORAL REMEDY PRESCRIBED</h4>
                        </div>
                        <h5 className="font-bold text-stone-800 text-sm">{ins.title}</h5>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">{ins.description}</p>
                        
                        <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
                          <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded font-semibold font-mono">
                            PRINCIPLE: {ins.principle.toUpperCase()}
                          </span>
                          <button
                            id={`btn-apply-insight-${i}`}
                            onClick={() => handleApplyInsight(ins.title)}
                            className="text-xs bg-white text-[#FF8A3D] border border-[#FF8A3D] hover:bg-[#FF8A3D] hover:text-white px-3 py-1 rounded-2xl font-semibold transition flex items-center gap-1 cursor-pointer"
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
      <div className="bg-white px-6 pt-3 pb-1 border-t border-stone-100 overflow-x-auto whitespace-nowrap flex gap-2">
        {starterChips.map((chip, i) => (
          <button
            key={i}
            id={`starter-chip-${i}`}
            onClick={() => handleSendMessage(chip.text)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEFAF7] hover:bg-orange-50/50 border border-stone-200 hover:border-orange-200 text-xs text-stone-600 rounded-2xl transition cursor-pointer shrink-0"
          >
            <span>{chip.icon}</span>
            <span className="font-medium text-stone-700">{chip.text}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="bg-white p-4 border-t border-stone-100">
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
            placeholder="Type your growth status or ask Dr. Vic..."
            className="flex-1 px-4 py-3 bg-[#FEFAF7] border border-stone-200 rounded-2xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#FF8A3D] focus:bg-white transition"
          />
          <button
            id="btn-coach-chat-send"
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-3.5 rounded-2xl transition flex items-center justify-center shrink-0 ${
              input.trim() && !isLoading
                ? 'bg-[#FF8A3D] hover:bg-[#e77a2f] text-white shadow-premium-orange cursor-pointer'
                : 'bg-[#F5F1EE] text-stone-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
