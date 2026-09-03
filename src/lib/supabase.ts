import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppStateData, ModuleType } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  source: 'env' | 'custom' | 'none';
}

const SUPABASE_STORAGE_URL_KEY = 'hbdms_supabase_url';
const SUPABASE_STORAGE_KEY_KEY = 'hbdms_supabase_anon_key';

export const MODULE_TABLE_MAP: Record<keyof AppStateData, string> = {
  masterAssets: 'master_assets',
  dailyRounds: 'daily_rounds',
  breakdowns: 'breakdowns',
  poInvoices: 'po_invoices',
  preventiveMaintenances: 'preventive_maintenances',
  calibrations: 'calibrations',
  serviceReports: 'service_reports',
  gatePasses: 'gate_passes',
  discardingReports: 'discarding_reports',
  handovers: 'handovers',
  userTrainings: 'user_trainings',
  recalls: 'recalls',
};

let cachedClient: SupabaseClient | null = null;
let lastClientKey: string = '';

/**
 * Retrieve the active Supabase configuration from environment variables
 * (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) or optional runtime localStorage.
 */
export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  if (envUrl && envKey && !envUrl.includes('placeholder')) {
    return {
      url: envUrl,
      anonKey: envKey,
      source: 'env',
    };
  }

  try {
    const customUrl = (localStorage.getItem(SUPABASE_STORAGE_URL_KEY) || '').trim();
    const customKey = (localStorage.getItem(SUPABASE_STORAGE_KEY_KEY) || '').trim();
    if (customUrl && customKey) {
      return {
        url: customUrl,
        anonKey: customKey,
        source: 'custom',
      };
    }
  } catch {
    // Ignore localStorage access errors
  }

  return {
    url: '',
    anonKey: '',
    source: 'none',
  };
}

/**
 * Save runtime Supabase credentials (helpful for testing or dynamic switching in browser)
 */
export function saveCustomSupabaseConfig(url: string, anonKey: string) {
  try {
    if (url.trim() && anonKey.trim()) {
      localStorage.setItem(SUPABASE_STORAGE_URL_KEY, url.trim());
      localStorage.setItem(SUPABASE_STORAGE_KEY_KEY, anonKey.trim());
    } else {
      localStorage.removeItem(SUPABASE_STORAGE_URL_KEY);
      localStorage.removeItem(SUPABASE_STORAGE_KEY_KEY);
    }
  } catch {
    // Ignore
  }
  cachedClient = null;
  lastClientKey = '';
}

/**
 * Check whether Supabase is configured and ready to use
 */
export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.anonKey);
}

/**
 * Lazy initialization of Supabase Client. Fails gracefully if unconfigured.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  const cacheKey = `${config.url}::${config.anonKey}`;
  if (cachedClient && lastClientKey === cacheKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastClientKey = cacheKey;
    return cachedClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

/**
 * Test connectivity with the configured Supabase database
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  try {
    // Try to query any table or test basic auth/rest response
    const { data, error } = await client.from('master_assets').select('id').limit(1);
    if (error) {
      // If table doesn't exist yet, we still know the URL & Key reached Supabase!
      if (error.code === '42P01' || error.message.includes('relation "master_assets" does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase successfully! (Tables not created yet — please run the SQL Schema script).',
          details: error,
        };
      }
      return {
        success: false,
        message: `Supabase returned error: ${error.message} (${error.code || 'NO_CODE'})`,
        details: error,
      };
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase database and verified "master_assets" table.',
      details: { rowCount: data?.length ?? 0 },
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network connection to Supabase failed.',
      details: err,
    };
  }
}
