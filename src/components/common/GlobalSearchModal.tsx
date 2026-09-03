import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Building2, Calendar, FileText, ArrowRight, Activity, ShieldCheck, Megaphone, Truck, AlertTriangle } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { ModuleType } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecord: (moduleType: ModuleType, record: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectRecord,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allResults = storageService.searchGlobal(query);

  const categories = ['All', 'Master Assets', 'Breakdowns', 'PMs', 'Daily Rounds', 'Recalls', 'Gate Pass'];

  const filteredResults = allResults.filter((item) => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Master Assets') return item.moduleKey === 'masterAssets';
    if (activeCategory === 'Breakdowns') return item.moduleKey === 'breakdowns';
    if (activeCategory === 'PMs') return item.moduleKey === 'preventiveMaintenances';
    if (activeCategory === 'Daily Rounds') return item.moduleKey === 'dailyRounds';
    if (activeCategory === 'Recalls') return item.moduleKey === 'recalls';
    if (activeCategory === 'Gate Pass') return item.moduleKey === 'gatePasses';
    return true;
  });

  const getModuleTypeFromKey = (key: string): ModuleType => {
    switch (key) {
      case 'masterAssets': return 'master_asset';
      case 'breakdowns': return 'breakdown';
      case 'dailyRounds': return 'daily_rounds';
      case 'preventiveMaintenances': return 'preventive_maintenance';
      case 'calibrations': return 'calibration';
      case 'serviceReports': return 'service_report';
      case 'poInvoices': return 'po_invoice_install';
      case 'gatePasses': return 'gate_pass';
      case 'discardingReports': return 'discarding';
      case 'handovers': return 'handover';
      case 'userTrainings': return 'user_training';
      case 'recalls': return 'recall';
      default: return 'master_asset';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-14 px-4 sm:px-6">
      <div
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 gap-3">
          <Search className="w-4 h-4 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Asset ID (e.g. BME-ICU-001), Equipment Name, Serial #, Department..."
            className="w-full text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 border border-slate-300"
          >
            ESC
          </button>
        </div>

        {/* Filter categories pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border-b border-slate-200/80 overflow-x-auto text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-100 custom-scrollbar">
          {filteredResults.length > 0 ? (
            filteredResults.map((res, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelectRecord(getModuleTypeFromKey(res.moduleKey), res.record);
                  onClose();
                }}
                className="p-2.5 hover:bg-blue-50/60 rounded cursor-pointer transition-colors flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {res.module}
                    </span>
                    {res.assetId && (
                      <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                        {res.assetId}
                      </span>
                    )}
                    {res.status && (
                      <span className="text-[11px] font-medium text-slate-500">
                        • {res.status}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">
                    {res.title}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">
                    {res.subtitle}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1 text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                  <span>View Record</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          ) : query ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching biomedical records found for "<span className="font-semibold text-slate-600">{query}</span>"
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <Building2 className="w-8 h-8 mx-auto text-slate-300" />
              <p>Type to search across all hospital medical equipment registers</p>
              <div className="flex justify-center gap-2 text-[11px] text-slate-400">
                <span>Try: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">Servo-u</code></span>
                <span><code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">BME-ICU-001</code></span>
                <span><code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">Ventilator</code></span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span>HBDMS Central Record Locator</span>
          <span>{filteredResults.length} records found</span>
        </div>
      </div>
    </div>
  );
};
