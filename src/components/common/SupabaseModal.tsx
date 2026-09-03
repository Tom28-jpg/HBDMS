import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  UploadCloud,
  DownloadCloud,
  X,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  isSupabaseConfigured,
} from '../../lib/supabase';
import { storageService } from '../../services/storageService';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSyncFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

  const configured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-base">Supabase Cloud Database</h3>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${configured
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${configured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {configured ? 'Database Connected' : 'Local Storage Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                PostgreSQL persistence for 12 biomedical modules
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="space-y-5">
            {/* Status Banner */}
            <div
              className={`p-4 rounded-lg border flex items-start gap-3 ${configured
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
                    The app is currently saving all records safely in browser storage. Setup your connection using environment variables for cloud sync.
                  </p>
                )}
              </div>
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
