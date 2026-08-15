export interface User {
  id: string;
  username?: string;
  email?: string;
  full_name: string;
  avatar_url?: string;
  created_at?: string;
}

export interface QuestionOptions {
  A?: string;
  B?: string;
  C?: string;
  D?: string;
  E?: string;
  [key: string]: string | undefined;
}

export interface UserError {
  id: string;
  user_id: string;
  question_text: string;
  options: QuestionOptions;
  wrong_option?: string; // 'A', 'B', 'C', 'D', 'E' or null
  wrong_word: string;
  correct_word: string;
  rule_category: string;
  explanation: string;
  coach_note?: string;
  difficulty_score?: number; // 1-10 (strictly background only)
  is_favorite?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TdkCacheEntry {
  word: string;
  is_valid: boolean;
  correct_form?: string;
  meanings: string[];
  rule_category?: string;
  explanation?: string;
  updated_at: string;
}

export interface TytRule {
  id: number;
  title: string;
  category: string;
  description: string;
  examples: { wrong: string; correct: string }[];
  tip?: string;
}

export interface AnalysisResult {
  question_text: string;
  options: QuestionOptions;
  wrong_option?: string;
  wrong_word: string;
  correct_word: string;
  rule_category: string;
  explanation: string;
  coach_note?: string;
  difficulty_score: number; // 1-10 background
  is_from_cache?: boolean;
}
