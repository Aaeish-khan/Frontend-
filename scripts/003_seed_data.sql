-- Seed data for InterMate platform

-- Insert default badges
INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
('First Steps', 'Complete your first mock interview', 'rocket', 'achievement', 'interviews_completed', 1, 25),
('Interview Pro', 'Complete 10 mock interviews', 'award', 'milestone', 'interviews_completed', 10, 100),
('Interview Master', 'Complete 50 mock interviews', 'trophy', 'milestone', 'interviews_completed', 50, 500),
('Resume Polisher', 'Analyze your first resume', 'file-text', 'achievement', 'resumes_analyzed', 1, 25),
('Resume Expert', 'Achieve 80%+ ATS score', 'star', 'skill', 'ats_score_above', 80, 150),
('Quick Learner', 'Complete your first learning module', 'book-open', 'achievement', 'modules_completed', 1, 25),
('Knowledge Seeker', 'Complete 5 learning modules', 'graduation-cap', 'milestone', 'modules_completed', 5, 100),
('Scholar', 'Complete all learning modules', 'medal', 'milestone', 'modules_completed', 20, 500),
('3-Day Streak', 'Practice for 3 consecutive days', 'flame', 'streak', 'streak_days', 3, 50),
('7-Day Streak', 'Practice for 7 consecutive days', 'zap', 'streak', 'streak_days', 7, 100),
('30-Day Streak', 'Practice for 30 consecutive days', 'crown', 'streak', 'streak_days', 30, 500),
('Helping Hand', 'Give your first peer review', 'heart', 'achievement', 'reviews_given', 1, 25),
('Community Leader', 'Give 10 peer reviews', 'users', 'milestone', 'reviews_given', 10, 150),
('Rising Star', 'Earn 500 XP', 'trending-up', 'milestone', 'xp_earned', 500, 50),
('Superstar', 'Earn 2000 XP', 'sparkles', 'milestone', 'xp_earned', 2000, 200),
('Legend', 'Earn 10000 XP', 'gem', 'milestone', 'xp_earned', 10000, 1000)
ON CONFLICT (name) DO NOTHING;

-- Insert learning modules
INSERT INTO public.learning_modules (title, description, category, difficulty, estimated_minutes, xp_reward, order_index, content) VALUES
('Introduction to Behavioral Interviews', 'Learn the STAR method and common behavioral questions', 'behavioral', 'beginner', 20, 50, 1, '{"lessons": ["What are behavioral interviews?", "The STAR Method", "Common questions", "Practice exercises"]}'),
('Technical Interview Fundamentals', 'Master the basics of technical interviews', 'technical', 'beginner', 30, 75, 2, '{"lessons": ["Types of technical questions", "Problem-solving approach", "Coding best practices", "Communication tips"]}'),
('Communication Skills Mastery', 'Improve your verbal and non-verbal communication', 'communication', 'beginner', 25, 60, 3, '{"lessons": ["Active listening", "Clear articulation", "Body language", "Handling nervousness"]}'),
('Advanced Behavioral Techniques', 'Deep dive into complex behavioral scenarios', 'behavioral', 'intermediate', 35, 100, 4, '{"lessons": ["Conflict resolution stories", "Leadership examples", "Failure and growth", "Cultural fit questions"]}'),
('Data Structures & Algorithms', 'Essential DSA concepts for technical interviews', 'technical', 'intermediate', 45, 125, 5, '{"lessons": ["Arrays and strings", "Trees and graphs", "Dynamic programming", "Time complexity"]}'),
('System Design Basics', 'Introduction to system design interviews', 'technical', 'intermediate', 40, 100, 6, '{"lessons": ["Scalability concepts", "Database design", "API design", "Common patterns"]}'),
('Industry-Specific Preparation', 'Tailor your preparation for specific industries', 'industry', 'intermediate', 30, 75, 7, '{"lessons": ["Tech industry", "Finance sector", "Healthcare", "Consulting"]}'),
('Negotiation & Salary Discussion', 'Learn to negotiate your offer effectively', 'communication', 'advanced', 25, 100, 8, '{"lessons": ["Research compensation", "Timing your ask", "Counter-offer strategies", "Benefits negotiation"]}'),
('Executive Presence', 'Develop leadership qualities for senior roles', 'communication', 'advanced', 35, 125, 9, '{"lessons": ["Strategic thinking", "Vision articulation", "Stakeholder management", "Executive communication"]}'),
('Mock Interview Strategies', 'Maximize your mock interview practice', 'behavioral', 'beginner', 15, 40, 10, '{"lessons": ["Setting up practice", "Self-evaluation", "Feedback incorporation", "Tracking progress"]}')
ON CONFLICT DO NOTHING;

-- Insert daily challenges
INSERT INTO public.daily_challenges (title, description, challenge_type, xp_reward) VALUES
('Complete a Mock Interview', 'Finish one mock interview session today', 'interview', 50),
('Practice Communication', 'Complete a communication learning module', 'learning', 30),
('Resume Review', 'Analyze a resume or update yours', 'practice', 40),
('Help a Peer', 'Give feedback on a peer''s recording', 'practice', 35),
('Quick Quiz', 'Complete a quiz in any learning module', 'learning', 25),
('Technical Challenge', 'Practice a technical interview question', 'interview', 45),
('Behavioral Practice', 'Answer 3 behavioral questions', 'practice', 35)
ON CONFLICT DO NOTHING;
