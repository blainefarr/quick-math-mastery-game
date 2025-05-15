
// This edge function updates the submit_score PostgreSQL function with simplified max score logic
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    // SQL to update the submit_score function with the new theoretical max logic
    const { error } = await supabase.rpc("run_admin_sql", {
      sql: `
      CREATE OR REPLACE FUNCTION public.submit_score(
        p_profile_id UUID,
        p_score INTEGER,
        p_operation TEXT,
        p_min1 INTEGER,
        p_max1 INTEGER,
        p_min2 INTEGER,
        p_max2 INTEGER,
        p_duration INTEGER,
        p_focus_number INTEGER = NULL,
        p_allow_negatives BOOLEAN = FALSE,
        p_typing_speed NUMERIC = NULL,
        p_total_speed NUMERIC = NULL,
        p_adjusted_math_speed NUMERIC = NULL
      )
      RETURNS UUID AS $$
      DECLARE
        v_user_id UUID;
        v_last_submission TIMESTAMPTZ;
        v_submission_count INTEGER;
        v_max_theoretical_score INTEGER;
        v_new_score_id UUID;
        v_account_id UUID;
        v_plan_type TEXT;
        v_score_save_count INTEGER;
        v_max_saved_scores INTEGER;
        v_can_save_score BOOLEAN;
      BEGIN
        -- Get the user ID for the profile
        SELECT account_id INTO v_account_id
        FROM profiles
        WHERE id = p_profile_id;
        
        IF v_account_id IS NULL THEN
          RAISE EXCEPTION 'Profile not found or not accessible';
        END IF;
        
        -- Get plan information
        SELECT plan_type, score_save_count
        INTO v_plan_type, v_score_save_count
        FROM accounts
        WHERE id = v_account_id;
        
        -- Check plan permissions
        SELECT can_save_score, max_saved_scores
        INTO v_can_save_score, v_max_saved_scores
        FROM plans
        WHERE plan_type = v_plan_type;
        
        IF NOT v_can_save_score THEN
          RAISE EXCEPTION 'Your plan does not allow saving scores';
        END IF;
        
        IF v_max_saved_scores IS NOT NULL AND v_score_save_count >= v_max_saved_scores THEN
          RAISE EXCEPTION 'You have reached the maximum number of saved scores for your plan';
        END IF;
        
        -- Basic validation checks
        IF p_score < 0 THEN
          RAISE EXCEPTION 'Score cannot be negative';
        END IF;
        
        IF p_duration <= 0 OR p_duration > 600 THEN -- Allow up to 10 minutes
          RAISE EXCEPTION 'Invalid duration: %', p_duration;
        END IF;
        
        -- Rate limiting - Check for suspicious submission frequency
        -- Get last submission time
        SELECT MAX(date) INTO v_last_submission
        FROM scores
        WHERE profile_id = p_profile_id;
        
        -- If submission was less than 5 seconds ago, reject it
        IF v_last_submission IS NOT NULL AND 
           EXTRACT(EPOCH FROM (NOW() - v_last_submission)) < 5 THEN
          RAISE EXCEPTION 'Please wait before submitting another score';
        END IF;
        
        -- Check submission count in the last 5 minutes to prevent spam
        SELECT COUNT(*) INTO v_submission_count
        FROM scores
        WHERE profile_id = p_profile_id
          AND date > NOW() - INTERVAL '5 minutes';
        
        IF v_submission_count > 10 THEN -- More than 10 submissions in 5 minutes
          RAISE EXCEPTION 'Too many score submissions. Please try again later.';
        END IF;
        
        -- Simplified theoretical maximum score calculation:
        -- 2 questions per second (.5 seconds per question) for all operation types
        v_max_theoretical_score := p_duration * 2;
        
        -- No buffer, direct cap at calculated value
        
        -- Check if score is within reasonable range
        IF p_score > v_max_theoretical_score THEN
          RAISE EXCEPTION 'Score exceeds theoretical maximum: % (max: %)', p_score, v_max_theoretical_score;
        END IF;
        
        -- All validations passed, insert the score
        INSERT INTO scores (
          profile_id,
          user_id,
          score,
          operation,
          min1,
          max1,
          min2,
          max2,
          duration,
          focus_number,
          allow_negatives,
          typing_speed,
          total_speed,
          adjusted_math_speed,
          date
        ) VALUES (
          p_profile_id,
          v_account_id, -- Use the resolved user ID
          p_score,
          p_operation,
          p_min1,
          p_max1,
          p_min2,
          p_max2,
          p_duration,
          p_focus_number,
          p_allow_negatives,
          p_typing_speed,
          p_total_speed,
          p_adjusted_math_speed,
          NOW()
        ) RETURNING id INTO v_new_score_id;
        
        -- Increment score save count for the account
        UPDATE accounts
        SET score_save_count = score_save_count + 1
        WHERE id = v_account_id;
        
        -- Call update_goal_progress function to update goal progress
        PERFORM update_goal_progress(
          p_profile_id,
          p_operation,
          p_min1,
          p_max1,
          p_min2,
          p_max2,
          p_focus_number,
          p_score
        );
        
        RETURN v_new_score_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Score validation logic updated" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
