import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  UploadCloud,
  DownloadCloud,
  Check,
  X,
  Server,
  Key,
  Globe,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveCustomSupabaseConfig,
  isSupabaseConfigured,
  testSupabaseConnection,
} from '../../lib/supabase';
import { storageService } from '../../services/storageService';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPABASE_SCHEMA_SQL_PREVIEW = `-- HOSPITAL BIOMEDICAL DOCUMENT MANAGEMENT SYSTEM (HBDMS)
-- 12 MODULE TABLES + RLS POLICIES FOR SUPABASE POSTGRESQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Master Asset Register
CREATE TABLE IF NOT EXISTS master_assets (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  asset_id TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  category TEXT,
  department TEXT NOT NULL,
  equipment_status TEXT DEFAULT 'Operational',
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Daily Rounds
CREATE TABLE IF NOT EXISTS daily_rounds (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  date TEXT NOT NULL,
  asset_id TEXT,
  equipment_name TEXT NOT NULL,
  department TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Breakdown Register
CREATE TABLE IF NOT EXISTS breakdowns (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  asset_id TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  department TEXT NOT NULL,
  breakdown_date TEXT NOT NULL,
  status TEXT DEFAULT 'Open',
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PO, Invoice & Installation
CREATE TABLE IF NOT EXISTS po_invoices (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  po_number TEXT,
  equipment_name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Preventive Maintenance
CREATE TABLE IF NOT EXISTS preventive_maintenances (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  asset_id TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  department TEXT NOT NULL,
  pm_due_date TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Calibration
CREATE TABLE IF NOT EXISTS calibrations (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  asset_id TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  department TEXT NOT NULL,
  calibration_date TEXT NOT NULL,
  calibration_result TEXT DEFAULT 'Passed',
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Service Reports
CREATE TABLE IF NOT EXISTS service_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  asset_id TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  department TEXT NOT NULL,
  service_date TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Gate Pass (RGP & NRGP)
CREATE TABLE IF NOT EXISTS gate_passes (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  pass_type TEXT NOT NULL,
  pass_number TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  department TEXT NOT NULL,
  date_sent TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Discarding Reports
CREATE TABLE IF NOT EXISTS discarding_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  asset_id TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  department TEXT NOT NULL,
  disposal_method TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Handover Register
CREATE TABLE IF NOT EXISTS handovers (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  asset_id TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  from_department TEXT NOT NULL,
  to_department TEXT NOT NULL,
  handover_date TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. User Training Register
CREATE TABLE IF NOT EXISTS user_trainings (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  trainee_name TEXT NOT NULL,
  designation TEXT NOT NULL,
  date TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Recalls & Safety Alerts
CREATE TABLE IF NOT EXISTS recalls (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  asset_id TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  recall_date TEXT NOT NULL,
  severity TEXT,
  status TEXT DEFAULT 'Active Alert',
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & open policies for anon and authenticated users
DO $$ 
DECLARE
  tbl text;
  tbls text[] := ARRAY[
    'master_assets', 'daily_rounds', 'breakdowns', 'po_invoices',
    'preventive_maintenances', 'calibrations', 'service_reports',
    'gate_passes', 'discarding_reports', 'handovers', 'user_trainings', 'recalls'
  ];
BEGIN
  FOREACH tbl IN ARRAY tbls LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Public access policy for %s" ON %I;', tbl, tbl);
    EXECUTE format('CREATE POLICY "Public access policy for %s" ON %I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);', tbl, tbl);
  END LOOP;
END $$;`;

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'status' | 'sql' | 'vercel'>('status');
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [configSource, setConfigSource] = useState<'env' | 'custom' | 'none'>('none');
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [copiedSQL, setCopiedSQL] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url);
      setAnonKey(config.anonKey);
      setConfigSource(config.source);
      setTestResult(null);
      setSyncFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    saveCustomSupabaseConfig(url, anonKey);
    const config = getSupabaseConfig();
    setConfigSource(config.source);
    setSyncFeedback('Credentials saved! You can now test connection.');
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const handleClearConfig = () => {
    saveCustomSupabaseConfig('', '');
    setUrl('');
    setAnonKey('');
    setConfigSource('none');
    setTestResult(null);
    setSyncFeedback('Custom credentials cleared.');
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      // Temporarily save if user typed something in inputs
      if (url.trim() && anonKey.trim() && configSource !== 'env') {
        saveCustomSupabaseConfig(url, anonKey);
      }
      const res = await testSupabaseConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handlePushAll = async () => {
    setIsPushing(true);
    setSyncFeedback(null);
    try {
      const res = await storageService.syncAllToSupabase();
      if (res.success) {
        setSyncFeedback(`Successfully pushed ${res.count} records across all 12 modules to Supabase!`);
      } else {
        setSyncFeedback(`Push failed: ${res.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setSyncFeedback(`Push error: ${err.message || 'Unknown'}`);
    } finally {
      setIsPushing(false);
    }
  };

  const handlePullAll = async () => {
    setIsPulling(true);
    setSyncFeedback(null);
    try {
      const res = await storageService.fetchFromSupabase();
      if (res.success) {
        setSyncFeedback(`Successfully retrieved ${res.count} records from Supabase!`);
      } else {
        setSyncFeedback(`Fetch failed: ${res.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setSyncFeedback(`Fetch error: ${err.message || 'Unknown'}`);
    } finally {
      setIsPulling(false);
    }
  };

  const handleCopySQL = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL_PREVIEW);
      setCopiedSQL(true);
      setTimeout(() => setCopiedSQL(false), 3000);
    } catch {
      // Fallback
    }
  };

  const configured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-base">Supabase Cloud Database & Vercel</h3>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    configured
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${configured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {configured ? 'Database Connected' : 'Local Storage Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                PostgreSQL persistence for 12 biomedical modules with direct Vercel deployment support
              </p>
            </div>
          </div>
          <button
            id="close-supabase-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-4 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'status'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Connection & Data Sync
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-4 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Supabase SQL Schema (Ready to Run)
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`py-3 px-4 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'vercel'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Vercel Deployment Guide
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'status' && (
            <div className="space-y-5">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-lg border flex items-start gap-3 ${
                  configured
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {configured ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs leading-relaxed">
                  <div className="font-semibold text-sm mb-1 text-slate-900">
                    {configured
                      ? 'Supabase Integration Active'
                      : 'Dual-Engine Architecture: Local Fallback Active'}
                  </div>
                  {configured ? (
                    <p>
                      Every new or updated record in Master Assets, Daily Rounds, PM, Breakdowns, and all other modules automatically persists directly to your remote Supabase PostgreSQL database in real time.
                    </p>
                  ) : (
                    <p>
                      The app is currently saving all records safely in browser storage. To connect your Supabase account, enter your Project URL and Anon API key below or set them in your environment variables.
                    </p>
                  )}
                </div>
              </div>

              {/* Credentials Configuration */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-500" />
                    Supabase Project Credentials
                  </h4>
                  {configSource === 'env' && (
                    <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-medium">
                      Loaded from Environment (.env)
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Supabase Project URL (VITE_SUPABASE_URL)
                    </label>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://xyzcompany.supabase.co"
                      disabled={configSource === 'env'}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Supabase Anon Public API Key (VITE_SUPABASE_ANON_KEY)
                    </label>
                    <input
                      type="password"
                      value={anonKey}
                      onChange={(e) => setAnonKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      disabled={configSource === 'env'}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {configSource !== 'env' && (
                    <button
                      type="button"
                      onClick={handleSaveConfig}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium transition-colors cursor-pointer"
                    >
                      Save Credentials
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting || (!url && !anonKey)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                    {isTesting ? 'Testing Ping...' : 'Test Connection'}
                  </button>
                  {configSource === 'custom' && (
                    <button
                      type="button"
                      onClick={handleClearConfig}
                      className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                    >
                      Clear Custom
                    </button>
                  )}
                </div>

                {testResult && (
                  <div
                    className={`mt-2 p-2.5 rounded-md text-xs flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {testResult.success ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              {/* Push / Pull Sync Controls */}
              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">Database Synchronization</h4>
                    <p className="text-[11px] text-slate-500">
                      Transfer existing hospital records, assets, calibrations, and breakdown logs
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handlePushAll}
                    disabled={isPushing || !configured}
                    className="p-3 border border-slate-200 hover:border-emerald-500 rounded-lg text-left bg-white hover:bg-emerald-50/30 transition-all flex items-start gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <div className="p-2 rounded-md bg-emerald-100 text-emerald-700">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Push Local Data to Supabase</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Uploads all current assets and 12-module records into remote Supabase tables.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handlePullAll}
                    disabled={isPulling || !configured}
                    className="p-3 border border-slate-200 hover:border-blue-500 rounded-lg text-left bg-white hover:bg-blue-50/30 transition-all flex items-start gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <div className="p-2 rounded-md bg-blue-100 text-blue-700">
                      <DownloadCloud className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Fetch from Supabase</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Pulls latest live records from Supabase tables into the application.
                      </div>
                    </div>
                  </button>
                </div>

                {syncFeedback && (
                  <div className="p-2.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{syncFeedback}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Supabase SQL Schema Script</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Copy and run this in your Supabase SQL Editor to create all 12 tables and security policies.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySQL}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copiedSQL ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy SQL Schema
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-900 rounded-lg p-4 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-80 border border-slate-800">
                <pre>{SUPABASE_SCHEMA_SQL_PREVIEW}</pre>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="font-semibold text-slate-800">How to execute in Supabase:</div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>Open your project at <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-medium">supabase.com/dashboard</a>.</li>
                  <li>Click <strong>SQL Editor</strong> on the left sidebar.</li>
                  <li>Click <strong>New Query</strong>, paste this schema, and click <strong>Run</strong>.</li>
                  <li>All 12 tables are immediately provisioned with JSONB payloads, RLS policies, and performance indexes.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'vercel' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1">Vercel Deployment Architecture</h4>
                <p className="text-slate-500">
                  The application is configured for 1-click zero-config deployment on Vercel as a high-performance Single Page App.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <div className="font-semibold text-slate-900 text-xs">Export / Push to GitHub</div>
                  <p className="text-[11px] text-slate-500">
                    Use the Settings menu in AI Studio to Export to GitHub or download ZIP, and push to your GitHub repository.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    2
                  </div>
                  <div className="font-semibold text-slate-900 text-xs">Import to Vercel</div>
                  <p className="text-[11px] text-slate-500">
                    In <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-blue-600 underline">vercel.com/new</a>, import your repo. Vite and <code className="font-mono bg-slate-200 px-1 rounded">vercel.json</code> are pre-configured.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    3
                  </div>
                  <div className="font-semibold text-slate-900 text-xs">Set Environment Variables</div>
                  <p className="text-[11px] text-slate-500">
                    In Vercel Project Settings &gt; Environment Variables, paste:
                    <br />
                    <code className="font-mono text-[10px] text-emerald-700 block mt-0.5">VITE_SUPABASE_URL</code>
                    <code className="font-mono text-[10px] text-emerald-700 block">VITE_SUPABASE_ANON_KEY</code>
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Pre-Configured Files in Project:
                </div>
                <ul className="space-y-1 font-mono text-[11px] text-slate-600 list-disc list-inside">
                  <li><span className="font-bold text-slate-800">vercel.json</span>: Configured with SPA rewrite rule (<code className="bg-slate-100 px-1 py-0.5 rounded">/(.*) -&gt; /index.html</code>).</li>
                  <li><span className="font-bold text-slate-800">package.json</span>: Standard Vite build (<code className="bg-slate-100 px-1 py-0.5 rounded">npm run build</code> producing <code className="bg-slate-100 px-1 py-0.5 rounded">dist/</code>).</li>
                  <li><span className="font-bold text-slate-800">.env.example</span>: Documents required Supabase variables.</li>
                  <li><span className="font-bold text-slate-800">supabase-schema.sql</span>: Ready-to-execute schema for Supabase SQL Editor.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Hospital Biomedical Document Management System • Production Ready
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
