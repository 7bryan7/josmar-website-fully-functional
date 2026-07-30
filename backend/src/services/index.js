import { SupabaseProvider } from './supabase.js';
import { CloudflareProvider } from './cloudflare.js';

let servicesInstance = null;

export function getServices(env) {
  if (servicesInstance) return servicesInstance;

  const provider = env.PROVIDER || 'supabase';
  if (provider === 'cloudflare') {
    servicesInstance = new CloudflareProvider(env);
  } else {
    servicesInstance = new SupabaseProvider(env);
  }

  return servicesInstance;
}
