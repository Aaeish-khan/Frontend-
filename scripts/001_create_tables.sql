-- InterMate FYP Database Schema
-- Create all tables for the interview preparation platform

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  current_level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Interview Sessions
CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'technical', 'behavioral', 'hr', 'case-study'
  role TEXT NOT NULL,
  company TEXT,
  difficulty TEXT DEFAULT 'medium',
  duration_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'pending', -- 'pending', 'in-progress', 'completed'
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Interview Questions
CREATE TABLE IF NOT EXISTS public.interview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_order INTEGER NOT NULL,
  time_limit_seconds INTEGER DEFAULT 120,
  user_answer TEXT,
  answer_duration_seconds INTEGER,
  ai_feedback TEXT,
  score INTEGER, -- 0-100
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Interview Results
CREATE TABLE IF NOT EXISTS public.interview_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL, -- 0-100
  communication_score INTEGER,
  technical_score INTEGER,
  confidence_score INTEGER,
  clarity_score INTEGER,
  strengths JSONB DEFAULT '[]'::jsonb,
  improvements JSONB DEFAULT '[]'::jsonb,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Resume Analyses
CREATE TABLE IF NOT EXISTS public.resume_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT,
  job_description TEXT,
  target_role TEXT,
  ats_score INTEGER NOT NULL, -- 0-100
  keyword_match_score INTEGER,
  format_score INTEGER,
  experience_score INTEGER,
  education_score INTEGER,
  skills_score INTEGER,
  matched_keywords JSONB DEFAULT '[]'::jsonb,
  missing_keywords JSONB DEFAULT '[]'::jsonb,
  suggestions JSONB DEFAULT '[]'::jsonb,
  section_feedback JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Learning Modules
CREATE TABLE IF NOT EXISTS public.learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'communication', 'technical', 'behavioral', 'industry'
  difficulty TEXT DEFAULT 'beginner',
  estimated_minutes INTEGER DEFAULT 30,
  xp_reward INTEGER DEFAULT 50,
  content JSONB DEFAULT '{}'::jsonb,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. User Learning Progress
CREATE TABLE IF NOT EXISTS public.user_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not-started', -- 'not-started', 'in-progress', 'completed'
  progress_percent INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  quiz_score INTEGER,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- 8. Badges
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT NOT NULL,
  category TEXT NOT NULL, -- 'achievement', 'milestone', 'skill', 'streak'
  requirement_type TEXT NOT NULL, -- 'interviews_completed', 'xp_earned', 'streak_days', etc.
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 25,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. User Badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 10. Peer Review Requests
CREATE TABLE IF NOT EXISTS public.peer_review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE SET NULL,
  resume_analysis_id UUID REFERENCES public.resume_analyses(id) ON DELETE SET NULL,
  review_type TEXT NOT NULL, -- 'interview', 'resume'
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open', -- 'open', 'in-review', 'completed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Peer Reviews
CREATE TABLE IF NOT EXISTS public.peer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.peer_review_requests(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  overall_rating INTEGER NOT NULL, -- 1-5
  feedback TEXT NOT NULL,
  strengths TEXT,
  improvements TEXT,
  is_helpful BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Peer Review Comments (timestamp-based)
CREATE TABLE IF NOT EXISTS public.peer_review_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.peer_reviews(id) ON DELETE CASCADE,
  commenter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp_seconds INTEGER, -- for video/audio timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Chat Messages (for peer review chat)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.peer_review_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. User Activity Log
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'interview_completed', 'badge_earned', 'module_completed', etc.
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Reports (downloadable PDFs)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL, -- 'interview', 'resume', 'weekly', 'progress'
  title TEXT NOT NULL,
  file_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Daily Challenges
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL, -- 'interview', 'learning', 'practice'
  xp_reward INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. User Challenge Progress
CREATE TABLE IF NOT EXISTS public.user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  challenge_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id, challenge_date)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for interview_sessions
CREATE POLICY "interview_sessions_select_own" ON public.interview_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "interview_sessions_insert_own" ON public.interview_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "interview_sessions_update_own" ON public.interview_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "interview_sessions_delete_own" ON public.interview_sessions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for interview_questions
CREATE POLICY "interview_questions_select_own" ON public.interview_questions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.interview_sessions WHERE id = session_id AND user_id = auth.uid()));
CREATE POLICY "interview_questions_insert_own" ON public.interview_questions FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.interview_sessions WHERE id = session_id AND user_id = auth.uid()));
CREATE POLICY "interview_questions_update_own" ON public.interview_questions FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.interview_sessions WHERE id = session_id AND user_id = auth.uid()));

-- RLS Policies for interview_results
CREATE POLICY "interview_results_select_own" ON public.interview_results FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.interview_sessions WHERE id = session_id AND user_id = auth.uid()));
CREATE POLICY "interview_results_insert_own" ON public.interview_results FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.interview_sessions WHERE id = session_id AND user_id = auth.uid()));

-- RLS Policies for resume_analyses
CREATE POLICY "resume_analyses_select_own" ON public.resume_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "resume_analyses_insert_own" ON public.resume_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "resume_analyses_delete_own" ON public.resume_analyses FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for learning_modules (public read)
CREATE POLICY "learning_modules_select_all" ON public.learning_modules FOR SELECT USING (true);

-- RLS Policies for user_learning_progress
CREATE POLICY "user_learning_progress_select_own" ON public.user_learning_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_learning_progress_insert_own" ON public.user_learning_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_learning_progress_update_own" ON public.user_learning_progress FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for badges (public read)
CREATE POLICY "badges_select_all" ON public.badges FOR SELECT USING (true);

-- RLS Policies for user_badges
CREATE POLICY "user_badges_select_own" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_badges_insert_own" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for peer_review_requests (users can see their own and open requests)
CREATE POLICY "peer_review_requests_select" ON public.peer_review_requests FOR SELECT 
  USING (auth.uid() = requester_id OR status = 'open');
CREATE POLICY "peer_review_requests_insert_own" ON public.peer_review_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "peer_review_requests_update_own" ON public.peer_review_requests FOR UPDATE USING (auth.uid() = requester_id);

-- RLS Policies for peer_reviews
CREATE POLICY "peer_reviews_select" ON public.peer_reviews FOR SELECT 
  USING (auth.uid() = reviewer_id OR EXISTS (SELECT 1 FROM public.peer_review_requests WHERE id = request_id AND requester_id = auth.uid()));
CREATE POLICY "peer_reviews_insert_own" ON public.peer_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- RLS Policies for peer_review_comments
CREATE POLICY "peer_review_comments_select" ON public.peer_review_comments FOR SELECT USING (true);
CREATE POLICY "peer_review_comments_insert_own" ON public.peer_review_comments FOR INSERT WITH CHECK (auth.uid() = commenter_id);

-- RLS Policies for chat_messages
CREATE POLICY "chat_messages_select" ON public.chat_messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.peer_review_requests WHERE id = request_id AND (requester_id = auth.uid() OR status != 'open')));
CREATE POLICY "chat_messages_insert_own" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- RLS Policies for user_activities
CREATE POLICY "user_activities_select_own" ON public.user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_activities_insert_own" ON public.user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for reports
CREATE POLICY "reports_select_own" ON public.reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reports_insert_own" ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reports_delete_own" ON public.reports FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for daily_challenges (public read)
CREATE POLICY "daily_challenges_select_all" ON public.daily_challenges FOR SELECT USING (true);

-- RLS Policies for user_challenges
CREATE POLICY "user_challenges_select_own" ON public.user_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_challenges_insert_own" ON public.user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_challenges_update_own" ON public.user_challenges FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON public.interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_interview_questions_session_id ON public.interview_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_id ON public.resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_user_id ON public.user_learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_peer_review_requests_status ON public.peer_review_requests(status);
