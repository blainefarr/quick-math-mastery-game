
-- Function to increment score_save_count
CREATE OR REPLACE FUNCTION public.increment_score_save_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.accounts
  SET score_save_count = score_save_count + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
