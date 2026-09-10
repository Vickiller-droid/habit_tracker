import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Star, Send, ThumbsUp, Sparkles, X, CheckCircle2, 
  Lightbulb, Bug, HelpCircle, Layers, Heart, MessageCircle, Award, Flame
} from 'lucide-react';
import { FeedbackItem, UserProfile } from '../types';
import { playSuccessSound } from '../utils/audio';

interface FeedbackWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardXp: (xp: number) => void;
  profile: UserProfile | null;
  darkMode: boolean;
}

const INITIAL_COMMUNITY_IDEAS: FeedbackItem[] = [
  {
    id: 'idea-1',
    category: 'UI/UX Improvement',
    rating: 5,
    message: 'Add a customizable soundboard for somatic breathing exercises (rain, white noise, soft ocean waves).',
    authorName: 'Elena V. (Mindful Observer)',
    timestamp: '2 hours ago',
    upvotes: 24,
    tags: ['Audio', 'Somatic Lab'],
    userUpvoted: false
  },
  {
    id: 'idea-2',
    category: 'New Habit Feature',
    rating: 5,
    message: 'Weekly habit streak summary email or push notifications with Dr. Gethro insights!',
    authorName: 'Marcus K. (Game Strategist)',
    timestamp: 'Yesterday',
    upvotes: 18,
    tags: ['Notifications', 'Weekly Report'],
    userUpvoted: false
  },
  {
    id: 'idea-3',
    category: 'AI Coach Idea',
    rating: 5,
    message: 'Allow Dr. Gethro to suggest new micro-habits based on wearable sleep and heart-rate data.',
    authorName: 'Dr. Sarah L.',
    timestamp: '2 days ago',
    upvotes: 31,
    tags: ['Wearables', 'AI Coaching'],
    userUpvoted: false
  }
];

export default function FeedbackWidget({
  isOpen,
  onClose,
  onRewardXp,
  profile,
  darkMode
}: FeedbackWidgetProps) {
  const [activeTab, setActiveTab] = useState<'submit' | 'community'>('submit');
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<FeedbackItem['category']>('UI/UX Improvement');
  const [message, setMessage] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [ideas, setIdeas] = useState<FeedbackItem[]>(() => {
    try {
      const saved = localStorage.getItem('vicfungo_feedback_ideas');
      return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_IDEAS;
    } catch (e) {
      return INITIAL_COMMUNITY_IDEAS;
    }
  });
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('vicfungo_feedback_ideas', JSON.stringify(ideas));
  }, [ideas]);

  if (!isOpen) return null;

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleUpvoteIdea = (id: string) => {
    setIdeas(prev => prev.map(item => {
      if (item.id === id) {
        const isUpvoted = !!item.userUpvoted;
        return {
          ...item,
          upvotes: isUpvoted ? item.upvotes - 1 : item.upvotes + 1,
          userUpvoted: !isUpvoted
        };
      }
      return item;
    }));
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newItem: FeedbackItem = {
      id: `fb-${Date.now()}`,
      category,
      rating,
      message: message.trim(),
      authorName: profile?.name ? `${profile.name} (${profile.growthPersona || 'Seeker'})` : 'Anonymous Seeker',
      timestamp: 'Just now',
      upvotes: 1,
      tags: selectedTags,
      userUpvoted: true
    };

    setIdeas([newItem, ...ideas]);
    try {
      playSuccessSound();
    } catch (err) {
      // Suppress
    }

    onRewardXp(10);
    setSubmittedSuccess(true);
    setMessage('');
    setSelectedTags([]);

    setTimeout(() => {
      setSubmittedSuccess(false);
      setActiveTab('community');
    }, 1800);
  };

  const tagPresets = ['Navigation', 'Somatic Sound', 'Dark Mode', 'Habit Stacks', 'AI Coach', 'Mobile Layout'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end p-2 sm:p-4 bg-stone-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.25 }}
          className={`w-full max-w-lg h-[90vh] max-h-[750px] rounded-[32px] shadow-2xl border flex flex-col overflow-hidden relative ${
            darkMode ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-100 text-stone-900'
          }`}
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-50 dark:bg-orange-950/30 rounded-2xl border border-orange-100 dark:border-orange-900/40 text-[#FF8A3D]">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold font-mono text-[#FF8A3D] uppercase tracking-wider">
                  Community & Feedback
                </span>
                <h3 className="text-lg font-display font-black tracking-tight">
                  Shape Vicfungo
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50 p-1.5 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('submit')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'submit'
                  ? 'bg-white dark:bg-stone-800 text-[#FF8A3D] shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Lightbulb className="w-4 h-4" /> Submit Feedback (+10 XP)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('community')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'community'
                  ? 'bg-white dark:bg-stone-800 text-[#FF8A3D] shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <ThumbsUp className="w-4 h-4" /> Idea Wall ({ideas.length})
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'submit' ? (
              submittedSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-stone-800 dark:text-stone-100">
                      Feedback Submitted! 🎉
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Thank you for helping us improve Vicfungo. You earned <strong>+10 XP</strong>!
                    </p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  {/* Rating selection */}
                  <div>
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 block">
                      How would you rate your experience so far?
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-2 rounded-xl transition cursor-pointer ${
                            rating >= star ? 'text-amber-400' : 'text-stone-300 dark:text-stone-700'
                          }`}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                      <span className="text-xs font-mono font-bold text-amber-500 ml-2">
                        {rating}/5
                      </span>
                    </div>
                  </div>

                  {/* Category dropdown */}
                  <div>
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 block">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-medium text-stone-800 dark:text-stone-100 focus:outline-none focus:border-[#FF8A3D]"
                    >
                      <option value="UI/UX Improvement">✨ UI/UX Improvement</option>
                      <option value="New Habit Feature">⚡ New Habit Feature</option>
                      <option value="AI Coach Idea">🧠 AI Coach Idea</option>
                      <option value="Bug Report">🐛 Bug Report</option>
                      <option value="General Feedback">💬 General Feedback</option>
                    </select>
                  </div>

                  {/* Textarea */}
                  <div>
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 block">
                      Your Suggestion or Feedback
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share your thoughts, missing features, or navigation suggestions..."
                      className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-100 focus:outline-none focus:border-[#FF8A3D] resize-none"
                    />
                  </div>

                  {/* Quick Tags */}
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                      Quick Tags
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {tagPresets.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleToggleTag(tag)}
                            className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition cursor-pointer ${
                              isSelected
                                ? 'bg-orange-50 dark:bg-orange-950/40 border-[#FF8A3D] text-[#FF8A3D]'
                                : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                            }`}
                          >
                            #{tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white font-bold text-xs rounded-2xl shadow-premium-orange transition flex items-center justify-center gap-2 cursor-pointer pt-3 mt-4"
                  >
                    <Send className="w-4 h-4" /> Submit & Claim +10 XP
                  </button>
                </form>
              )
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">
                  Upvote suggestions submitted by other Vicfungo community members or view popular feedback:
                </p>

                {ideas.map((idea) => (
                  <div
                    key={idea.id}
                    className="p-4 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200/80 dark:border-stone-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold font-mono text-[#FF8A3D] bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded">
                        {idea.category}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {idea.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-stone-800 dark:text-stone-200 font-medium leading-relaxed">
                      &ldquo;{idea.message}&rdquo;
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
                      <span className="text-[10px] text-stone-500 italic">
                        By {idea.authorName}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleUpvoteIdea(idea.id)}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          idea.userUpvoted
                            ? 'bg-orange-50 dark:bg-orange-950/40 border-[#FF8A3D] text-[#FF8A3D]'
                            : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-orange-300'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${idea.userUpvoted ? 'fill-current' : ''}`} />
                        <span>{idea.upvotes}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
