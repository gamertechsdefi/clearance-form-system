import { createClient } from '@supabase/supabase-js';

// Public (browser) client — safe to use in client components with the anon key
// Ensure the following env vars are set in your environment or .env.local file:
// - NEXT_PUBLIC_SUPABASE_URL
// - NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // This helps catch missing env at dev time rather than mysterious runtime errors
  // Avoid throwing in production builds to not break static eval paths
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.warn(
      'Supabase env vars are missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');

export default supabase;
