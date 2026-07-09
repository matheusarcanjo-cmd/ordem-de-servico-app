import { createClient } from '@supabase/supabase-js';

/**
 * Cliente com service role — ignora RLS.
 * Uso EXCLUSIVO em server actions, após validar papel/transição.
 * Nunca importe em componentes client.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
