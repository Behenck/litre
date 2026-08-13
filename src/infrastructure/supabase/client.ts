import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

let client: SupabaseClient<Database> | null = null;

function requiredEnvironment(name: string, fallbackName?: string): string {
  const value = process.env[name] ?? (fallbackName ? process.env[fallbackName] : undefined);
  if (!value) {
    const accepted = fallbackName ? `${name} (ou ${fallbackName})` : name;
    throw new Error(`Configure ${accepted} para usar LITRO_DB_DRIVER=supabase.`);
  }
  return value;
}

/** Cliente privilegiado e exclusivo do servidor. Nunca importe este módulo em Client Components. */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (client) return client;

  const url = requiredEnvironment('SUPABASE_URL');
  const secretKey = requiredEnvironment('SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY');

  client = createClient<Database>(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  return client;
}
