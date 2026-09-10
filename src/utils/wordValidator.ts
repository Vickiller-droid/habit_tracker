// Word Validation Utility with English dictionary heuristics & acronym detection
export interface WordValidationResult {
  isValid: boolean;
  suspiciousWord?: string;
}

// Known common abbreviations and acronyms in productivity & health
const KNOWN_ACRONYMS = new Set([
  'AI', 'API', 'URL', 'UI', 'UX', 'CSS', 'HTML', 'SQL', 'SDK', 'PWA',
  'KPI', 'SOP', 'DOA', 'FAQ', 'LMS', 'SEO', 'CRM', 'B2B', 'B2C', 'NPS',
  'OKR', 'OKRS', 'CTA', 'ROI', 'SAAS', 'MVP', 'GPT', 'REM', 'BMR', 'BMI',
  'HRV', 'VO2', 'ADHD', 'PTSD', 'CBT', 'DBT', 'AM', 'PM', 'XP', 'HQ', 'ID',
  'VIP', 'PDF', 'CSV', 'JSON', 'DOM', 'CPU', 'RAM', 'GPU', 'SDR', 'ARR', 'MRR',
  'L2E', 'SEMS', 'GIT', 'PR', 'QA', 'CI', 'CD', 'DX', 'WIP', 'TODO', 'K8S',
  'JWT', 'OAUTH', 'REST', 'GRPC', 'HTTP', 'HTTPS', 'AWS', 'GCP', 'S3', 'EC2',
  'SaaS', 'PaaS', 'IaaS', 'DB', 'PR', 'MR', 'DR', 'TV', 'PC'
]);

// Common English words list for fast offline validation
const COMMON_WORDS = new Set([
  'a', 'i', 'the', 'be', 'to', 'of', 'and', 'in', 'that', 'have', 'it', 'for',
  'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by',
  'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one',
  'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about',
  'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
  'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good',
  'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only',
  'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
  'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
  'any', 'these', 'give', 'day', 'most', 'us', 'read', 'book', 'pages', 'water',
  'drink', 'breathe', 'breath', 'zen', 'mindful', 'mindfulness', 'journal',
  'write', 'reflect', 'reflection', 'habit', 'habits', 'routine', 'stretch',
  'plank', 'focus', 'sprint', 'meditate', 'meditation', 'walk', 'run', 'sleep',
  'health', 'fitness', 'productivity', 'learning', 'stack', 'cue', 'trigger',
  'reward', 'dopamine', 'neural', 'brain', 'somatic', 'energy', 'battery',
  'morning', 'evening', 'night', 'daily', 'weekly', 'goal', 'goals', 'target',
  'light', 'coffee', 'tea', 'laptop', 'phone', 'bed', 'desk', 'chair',
  'steps', 'cardio', 'workout', 'exercise', 'pushup', 'squat', 'gratitude',
  'priority', 'task', 'tasks', 'todo', 'study', 'learn', 'code', 'coding',
  'project', 'clean', 'space', 'notes', 'entry', 'minute', 'minutes',
  'second', 'seconds', 'hour', 'hours', 'nonfiction', 'fiction',
  'chapter', 'author', 'concept', 'insight', 'lesson', 'summary', 'takeaway',
  'groceries', 'buy', 'push', 'commits', 'github', 'review', 'documentation',
  'gym', 'assignment', 'polish', 'edit', 'review', 'somatic', 'alignment'
]);

/**
 * Validates text input to catch potential typos/gibberish while supporting acronyms and custom words.
 */
export function validateTextInput(
  text: string,
  confirmedAcronyms: Set<string> = new Set()
): WordValidationResult {
  if (!text || !text.trim()) {
    return { isValid: true };
  }

  // Raw word extraction (preserve mixed tokens like 54drytvhd, dfghj./)
  const rawTokens = text.trim().split(/\s+/);

  for (const token of rawTokens) {
    // Strip leading/trailing punctuation
    const cleanWord = token.replace(/^[^\w]+|[^\w]+$/g, '');
    if (!cleanWord) continue;

    const uppercaseWord = cleanWord.toUpperCase();
    const lowercaseWord = cleanWord.toLowerCase();

    // 1. Skip if confirmed by user or in known acronyms / common words list
    if (confirmedAcronyms.has(uppercaseWord) || KNOWN_ACRONYMS.has(uppercaseWord)) {
      continue;
    }
    if (COMMON_WORDS.has(lowercaseWord)) {
      continue;
    }

    // 2. Check for single character invalid tokens (e.g., 'X', 'B', 'H', 'J' when not 'A' or 'I')
    if (cleanWord.length === 1) {
      if (!['a', 'i'].includes(lowercaseWord)) {
        return { isValid: false, suspiciousWord: cleanWord };
      }
      continue;
    }

    // 3. No vowels in 2+ letter word (e.g. "JDS", "XB", "FGH", "DRT")
    const hasVowels = /[aeiouy]/i.test(cleanWord);
    if (!hasVowels && cleanWord.length >= 2) {
      return { isValid: false, suspiciousWord: cleanWord };
    }

    // 4. 4 or more consecutive consonants (e.g. "drytvhd", "drtytwdhe", "dfghj", "tvhd")
    if (/[bcdfghjklmnpqrstvwxz]{4,}/i.test(cleanWord)) {
      return { isValid: false, suspiciousWord: cleanWord };
    }

    // 5. Same character repeated 3 or more times (e.g. "aaaa", "zzzz", "dffghjj")
    if (/(.)\1{2,}/i.test(cleanWord)) {
      return { isValid: false, suspiciousWord: cleanWord };
    }

    // 6. Keyboard mashing rows (e.g., "asdf", "qwerty", "zxcv", "dfghj")
    const mashingPatterns = [
      'asdf', 'sdfg', 'dfgh', 'fghj', 'ghjk', 'hjkl',
      'qwert', 'werty', 'erty', 'rtyu', 'tyui', 'yuio', 'uiop',
      'zxcv', 'xcvb', 'cvbn', 'vbnm', 'dfghj', 'qwertyui'
    ];
    if (mashingPatterns.some(p => lowercaseWord.includes(p))) {
      return { isValid: false, suspiciousWord: cleanWord };
    }

    // 7. Intermixed numbers and letters without standard word structure (e.g., "54drytvhd", "54drtytwdhe")
    if (/\d+[a-z]+/i.test(token) || /[a-z]+\d+/i.test(token)) {
      // Unless it's a known pattern like B2B, L2E, K8S, MP3, MP4
      const alphanumericWord = token.toUpperCase().replace(/[^\w]/g, '');
      if (!KNOWN_ACRONYMS.has(alphanumericWord) && !confirmedAcronyms.has(alphanumericWord)) {
        return { isValid: false, suspiciousWord: token };
      }
    }
  }

  return { isValid: true };
}
