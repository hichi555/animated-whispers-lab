import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_KEY environment variable');
}

/**
 * Server-side Supabase client with service role key
 * Use this for authenticated database operations and admin tasks
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Verify user has paid plan or free credits remaining
 */
export async function checkUserPlan(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('plan, credits_remaining')
    .eq('id', userId)
    .single();

  if (error) throw error;

  return {
    isPaidUser: data?.plan === 'lifetime',
    creditsRemaining: data?.credits_remaining ?? 0,
  };
}

/**
 * Deduct generation credits from user
 */
export async function deductCredits(userId: string, amount: number) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ credits_remaining: supabaseAdmin.raw(`credits_remaining - ${amount}`) })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Create a generation job record
 */
export async function createGenerationJob(
  userId: string,
  jobType: string,
  prompt: string,
  storyPageId?: string
) {
  const { data, error } = await supabaseAdmin
    .from('generation_jobs')
    .insert({
      user_id: userId,
      story_page_id: storyPageId,
      job_type: jobType,
      prompt,
      status: 'processing',
    })
    .select('id')
    .single();

  if (error) throw error;
  return data?.id;
}

/**
 * Update generation job status
 */
export async function updateGenerationJob(
  jobId: string,
  status: string,
  result?: string,
  error?: string
) {
  const { error: updateError } = await supabaseAdmin
    .from('generation_jobs')
    .update({
      status,
      result,
      error,
      completed_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (updateError) throw updateError;
}
