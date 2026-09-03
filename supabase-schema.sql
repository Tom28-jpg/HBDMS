-- ==============================================================================
-- HOSPITAL BIOMEDICAL DOCUMENT MANAGEMENT SYSTEM (HBDMS)
-- SUPABASE POSTGRESQL DATABASE SCHEMA
-- ==============================================================================
-- Instructions:
-- 1. Log in to your Supabase project dashboard (https://supabase.com/dashboard).
-- 2. Open the SQL Editor in the left sidebar.
-- 3. Click "New Query", paste the entire contents of this file, and click "Run".
-- 4. In your Vercel project settings (or .env file), add:
--      VITE_SUPABASE_URL = https://your-project.supabase.co
--      VITE_SUPABASE_ANON_KEY = your-anon-public-api-key
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. MASTER ASSET REGISTER (Equipment Inventory)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS master_assets (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  asset_id TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  category TEXT,
  manufacturer_brand TEXT,
  model TEXT,
  serial_number TEXT,
  department TEXT NOT NULL,
  location TEXT,
  purchase_date TEXT,
  installation_date TEXT,
  purchase_cost NUMERIC DEFAULT 0,
  warranty_period_months INTEGER DEFAULT 12,
  warranty_expiry_date TEXT,
  equipment_status TEXT DEFAULT 'Operational',
  last_pm_date TEXT,
  next_pm_date TEXT,
  last_calibration_date TEXT,
  next_calibration_date TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_master_assets_asset_id ON master_assets (asset_id);

CREATE INDEX IF NOT EXISTS idx_master_assets_dept ON master_assets (department);

CREATE INDEX IF NOT EXISTS idx_master_assets_status ON master_assets (equipment_status);

-- ------------------------------------------------------------------------------
-- 2. DAILY BME ROUNDS LOG
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_rounds (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  date TEXT NOT NULL,
  asset_id TEXT,
  equipment_name TEXT NOT NULL,
  department TEXT NOT NULL,
  biomedical_engineer TEXT,
  equipment_condition TEXT,
  observations TEXT,
  problems_identified TEXT,
  action_taken TEXT,
  remarks TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_daily_rounds_asset_id ON daily_rounds (asset_id);

CREATE INDEX IF NOT EXISTS idx_daily_rounds_date ON daily_rounds (date);

CREATE INDEX IF NOT EXISTS idx_daily_rounds_dept ON daily_rounds (department);

-- ------------------------------------------------------------------------------
-- 3. BREAKDOWN REGISTER & TICKETS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS breakdowns (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  asset_id TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  serial_number TEXT,
  department TEXT NOT NULL,
  breakdown_date TEXT NOT NULL,
  breakdown_time TEXT,
  problem_description TEXT,
  assigned_person TEXT,
  action_taken TEXT,
  spare_parts_used TEXT,
  downtime_hours NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Open',
  remarks TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_breakdowns_asset_id ON breakdowns (asset_id);

CREATE INDEX IF NOT EXISTS idx_breakdowns_status ON breakdowns (status);

CREATE INDEX IF NOT EXISTS idx_breakdowns_dept ON breakdowns (department);

-- ------------------------------------------------------------------------------
-- 4. PURCHASE ORDER, INVOICE & INSTALLATION
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS po_invoices (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  po_number TEXT,
  po_date TEXT,
  vendor TEXT,
  equipment_name TEXT NOT NULL,
  model TEXT,
  quantity INTEGER DEFAULT 1,
  cost NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  invoice_number TEXT,
  invoice_date TEXT,
  invoice_vendor TEXT,
  invoice_amount NUMERIC DEFAULT 0,
  warranty_details TEXT,
  asset_id TEXT,
  installation_date TEXT,
  installed_by TEXT,
  demonstration_status TEXT DEFAULT 'Completed',
  department TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_po_invoices_po_num ON po_invoices (po_number);

CREATE INDEX IF NOT EXISTS idx_po_invoices_asset_id ON po_invoices (asset_id);

-- ------------------------------------------------------------------------------
-- 5. PREVENTIVE MAINTENANCE (PM) REPORTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS preventive_maintenances (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  asset_id TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  department TEXT NOT NULL,
  pm_due_date TEXT NOT NULL,
  pm_completion_date TEXT,
  biomedical_engineer TEXT,
  equipment_condition TEXT,
  next_pm_date TEXT,
  status TEXT DEFAULT 'Pending',
  observations TEXT,
  remarks TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pm_asset_id ON preventive_maintenances (asset_id);

CREATE INDEX IF NOT EXISTS idx_pm_status ON preventive_maintenances (status);

CREATE INDEX IF NOT EXISTS idx_pm_next_date ON preventive_maintenances (next_pm_date);

-- ------------------------------------------------------------------------------
-- 6. CALIBRATION & QUALITY ASSURANCE REPORTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS calibrations (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  asset_id TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  serial_number TEXT,
  department TEXT NOT NULL,
  calibration_date TEXT NOT NULL,
  calibration_agency_person TEXT,
  calibration_result TEXT DEFAULT 'Passed',
  certificate_number TEXT,
  next_calibration_due_date TEXT,
  remarks TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_calibrations_asset_id ON calibrations (asset_id);

CREATE INDEX IF NOT EXISTS idx_calibrations_due_date ON calibrations (next_calibration_due_date);

-- ------------------------------------------------------------------------------
-- 7. SERVICE REPORTS & OEM JOB SHEETS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  asset_id TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  department TEXT NOT NULL,
  complaint TEXT,
  service_date TEXT NOT NULL,
  service_provider TEXT,
  problem_identified TEXT,
  action_performed TEXT,
  parts_replaced TEXT,
  service_cost NUMERIC DEFAULT 0,
  completion_date TEXT,
  remarks TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_service_reports_asset_id ON service_reports (asset_id);

CREATE INDEX IF NOT EXISTS idx_service_reports_service_date ON service_reports (service_date);

-- ------------------------------------------------------------------------------
-- 8. GATE PASS (RGP & NRGP)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gate_passes (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  pass_type TEXT NOT NULL, -- 'RGP' or 'NRGP'
  pass_number TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  serial_number TEXT,
  department TEXT NOT NULL,
  recipient_vendor TEXT,
  reason TEXT,
  date_sent TEXT NOT NULL,
  expected_return_date TEXT,
  actual_return_date TEXT,
  return_status TEXT,
  authorized_by TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gate_passes_asset_id ON gate_passes (asset_id);

CREATE INDEX IF NOT EXISTS idx_gate_passes_pass_num ON gate_passes (pass_number);

-- ------------------------------------------------------------------------------
-- 9. EQUIPMENT DISCARDING & CONDEMNATION
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS discarding_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  asset_id TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  serial_number TEXT,
  department TEXT NOT NULL,
  equipment_condition TEXT,
  reason_for_discarding TEXT,
  bme_assessment TEXT,
  disposal_method TEXT,
  disposal_date TEXT,
  scrap_amount_received NUMERIC DEFAULT 0,
  remarks TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_discarding_asset_id ON discarding_reports (asset_id);

-- ------------------------------------------------------------------------------
-- 10. INTER-DEPARTMENT HANDOVER
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS handovers (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  asset_id TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  serial_number TEXT,
  from_department TEXT NOT NULL,
  to_department TEXT NOT NULL,
  handover_date TEXT NOT NULL,
  equipment_condition TEXT,
  person_handing_over TEXT,
  person_receiving TEXT,
  acknowledgement TEXT,
  remarks TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_handovers_asset_id ON handovers (asset_id);

-- ------------------------------------------------------------------------------
-- 11. USER TRAINING & COMPETENCY RECORDS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_trainings (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  trainee_name TEXT NOT NULL,
  designation TEXT NOT NULL,
  department TEXT,
  date TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  asset_id TEXT,
  trainer_name TEXT,
  training_details TEXT,
  acknowledgement TEXT,
  remarks TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_trainings_asset_id ON user_trainings (asset_id);

-- ------------------------------------------------------------------------------
-- 12. MEDICAL DEVICE VIGILANCE & HAZARD RECALL
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recalls (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  asset_id TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  recall_date TEXT NOT NULL,
  recall_reason TEXT,
  recall_reference TEXT,
  severity TEXT,
  required_action TEXT,
  action_taken TEXT,
  status TEXT DEFAULT 'Active Alert',
  remarks TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recalls_asset_id ON recalls (asset_id);

CREATE INDEX IF NOT EXISTS idx_recalls_status ON recalls (status);

-- ------------------------------------------------------------------------------
-- 13. USER PROFILES & ACCOUNTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hbdms_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  designation TEXT,
  mobile_number TEXT,
  hospital_name TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS registered_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT,
  mobile_number TEXT,
  email TEXT UNIQUE NOT NULL,
  hospital_name TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enables standard access via anon and authenticated Supabase keys
-- ==============================================================================

DO $$ 
DECLARE
  tbl text;
  tbls text[] := ARRAY[
    'master_assets', 'daily_rounds', 'breakdowns', 'po_invoices',
    'preventive_maintenances', 'calibrations', 'service_reports',
    'gate_passes', 'discarding_reports', 'handovers', 'user_trainings',
    'recalls', 'hbdms_users', 'registered_users'
  ];
BEGIN
  FOREACH tbl IN ARRAY tbls LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
    
    -- Drop existing policy if re-run
    EXECUTE format('DROP POLICY IF EXISTS "Public access policy for %s" ON %I;', tbl, tbl);
    
    -- Create open permissive policy for anon/authenticated roles
    EXECUTE format('CREATE POLICY "Public access policy for %s" ON %I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);', tbl, tbl);
  END LOOP;
END $$;

-- Enable Realtime publication for all tables (optional, enables live updates)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE master_assets, breakdowns, daily_rounds, preventive_maintenances, calibrations, service_reports;
  EXCEPTION WHEN OTHERS THEN
    -- Publication might already have tables or not exist
    NULL;
  END;
END $$;