import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Public (browser) client — safe to use in client components with the anon key
// Ensure the following env vars are set in your environment or .env.local file:
// - NEXT_PUBLIC_SUPABASE_URL
// - NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

const isBrowser = typeof window !== 'undefined';

let client: SupabaseClient | null = null;
if (isBrowser) {
  if (!supabaseUrl || !supabaseAnonKey) {
    // eslint-disable-next-line no-console
    console.warn('Supabase env vars are missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  } else {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
}

// Export a client that will be non-null in the browser when envs are present.
// On the server during prerender/import, this stays null to avoid throwing.
const supabase = client as unknown as SupabaseClient;

export { supabase };
export default supabase;
