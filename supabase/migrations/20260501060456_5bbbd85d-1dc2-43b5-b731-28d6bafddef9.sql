-- Trigger to bump quizlet attempt_count on new quiz_attempts inserts
CREATE OR REPLACE FUNCTION public.update_quiz_attempt_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.quizlets SET attempt_count = attempt_count + 1 WHERE id = NEW.quizlet_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_quiz_attempt_insert ON public.quiz_attempts;
CREATE TRIGGER on_quiz_attempt_insert
AFTER INSERT ON public.quiz_attempts
FOR EACH ROW EXECUTE FUNCTION public.update_quiz_attempt_count();

-- Trigger to update user_streaks when an authenticated user records an attempt
CREATE OR REPLACE FUNCTION public.update_user_streak_on_attempt()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  last_date date;
  today date := CURRENT_DATE;
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;

  SELECT last_activity_date INTO last_date FROM public.user_streaks WHERE user_id = NEW.user_id;

  IF NOT FOUND THEN
    INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (NEW.user_id, 1, 1, today);
  ELSIF last_date = today THEN
    -- already counted today
    NULL;
  ELSIF last_date = today - INTERVAL '1 day' THEN
    UPDATE public.user_streaks
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_activity_date = today
    WHERE user_id = NEW.user_id;
  ELSE
    UPDATE public.user_streaks
    SET current_streak = 1,
        last_activity_date = today
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_quiz_attempt_streak ON public.quiz_attempts;
CREATE TRIGGER on_quiz_attempt_streak
AFTER INSERT ON public.quiz_attempts
FOR EACH ROW EXECUTE FUNCTION public.update_user_streak_on_attempt();

-- Allow public to view own & others' streaks via leaderboard? No, keep private SELECT.
-- Allow anonymous attempts (user_id null) — already permitted by RLS.
