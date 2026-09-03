import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  ChevronDown,
  Clock,
  CheckCircle2,
  X,
  Building2,
  Cpu,
  Hash,
  Sparkles,
  MapPin,
  Check,
} from 'lucide-react';
import { MasterAssetRecord, ModuleType } from '../../types';

interface HospitalAssetSearchSelectProps {
  currentAssetId?: string;
  masterAssets: MasterAssetRecord[];
  onSelectAsset: (asset: MasterAssetRecord) => void;
  onClearAsset: () => void;
  moduleType: ModuleType;
}

export const HospitalAssetSearchSelect: React.FC<HospitalAssetSearchSelectProps> = ({
  currentAssetId,
  masterAssets,
  onSelectAsset,
  onClearAsset,
  moduleType,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const containerRef = useRef<HTMLDivElement>(null);

  // Recent searches from local storage
  const [recentAssetIds, setRecentAssetIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('hbdms_recent_selected_assets');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Currently linked asset record
  const selectedAsset = useMemo(() => {
    if (!currentAssetId) return null;
    return masterAssets.find(
      (a) => a.assetId.trim().toLowerCase() === currentAssetId.trim().toLowerCase()
    );
  }, [currentAssetId, masterAssets]);

  // Unique departments for quick filter chips
  const departments = useMemo(() => {
    const set = new Set<string>();
    masterAssets.forEach((a) => {
      if (a.department) set.add(a.department);
    });
    return Array.from(set).slice(0, 8); // Top 8 for clean chips
  }, [masterAssets]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filtered assets by Search Bar (ID, Name, Serial, Department, Model, Brand) + Department chip
  const filteredAssets = useMemo(() => {
    return masterAssets.filter((asset) => {
      // Department chip filter
      if (selectedDeptFilter !== 'All' && asset.department !== selectedDeptFilter) {
        return false;
      }

      // Search Query filter
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const idMatch = asset.assetId?.toLowerCase().includes(q);
      const nameMatch = asset.equipmentName?.toLowerCase().includes(q);
      const serialMatch = asset.serialNumber?.toLowerCase().includes(q);
      const deptMatch = asset.department?.toLowerCase().includes(q);
      const modelMatch = asset.model?.toLowerCase().includes(q);
      const brandMatch = asset.manufacturerBrand?.toLowerCase().includes(q);
      const locMatch = asset.location?.toLowerCase().includes(q);

      return idMatch || nameMatch || serialMatch || deptMatch || modelMatch || brandMatch || locMatch;
    });
  }, [masterAssets, searchQuery, selectedDeptFilter]);

  // Retrieve full recent asset objects
  const recentAssets = useMemo(() => {
    return recentAssetIds
      .map((id) => masterAssets.find((a) => a.assetId === id))
      .filter((a): a is MasterAssetRecord => Boolean(a));
  }, [recentAssetIds, masterAssets]);

  const handleSelect = (asset: MasterAssetRecord) => {
    onSelectAsset(asset);
    setIsOpen(false);
    setSearchQuery('');

    // Update recent
    const updated = [asset.assetId, ...recentAssetIds.filter((id) => id !== asset.assetId)].slice(0, 6);
    setRecentAssetIds(updated);
    try {
      localStorage.setItem('hbdms_recent_selected_assets', JSON.stringify(updated));
    } catch {}
  };

  const getModuleTitle = () => {
    switch (moduleType) {
      case 'master_asset':
        return 'Reference / Clone Hospital Asset Specs';
      case 'daily_rounds':
        return 'Choose Inspected Equipment (Daily Rounds)';
      case 'breakdown':
        return 'Select Malfunctioning Equipment (Breakdown Ticket)';
      case 'preventive_maintenance':
        return 'Select Target Equipment (PM Checklist & Report)';
      case 'calibration':
        return 'Select Equipment for Calibration & Metrology';
      case 'service_report':
        return 'Select Equipment for Service & Repair Log';
      case 'gate_pass':
        return 'Select Equipment for Movement (Gate Pass RGP/NRGP)';
      case 'discarding':
        return 'Select Equipment for Discarding / Condemnation';
      case 'handover':
        return 'Select Equipment for Dept / Staff Handover';
      case 'po_invoice_install':
        return 'Link Installed Equipment to Master Asset ID';
      case 'user_training':
        return 'Select Medical Device for Clinical Staff Training';
      case 'recall':
        return 'Link Affected Hospital Asset to Recall Alert';
      default:
        return 'Choose Hospital Asset ID';
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Bar & Dropdown Header Container */}
      <div className="p-3.5 bg-gradient-to-r from-teal-50/80 to-blue-50/60 rounded-xl border border-teal-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-teal-950 text-xs flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-teal-700" />
                {getModuleTitle()}
              </span>
              <span className="px-1.5 py-0.2 bg-teal-100/70 text-teal-800 text-[10px] font-semibold rounded">
                {masterAssets.length} Assets in Registry
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Search by <strong className="text-slate-700 font-semibold">Asset ID, Name, Serial #, Department, or Model</strong> to auto-fill specs.
            </p>
          </div>

          {/* If already selected, show Quick Clear / Change */}
          {selectedAsset && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-100/60 hover:bg-teal-200/70 rounded-md transition-colors cursor-pointer"
              >
                Change Equipment
              </button>
              <button
                type="button"
                onClick={onClearAsset}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                title="Unlink Equipment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Searchable Bar with Integrated Dropdown Toggle */}
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-teal-600 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              placeholder={
                selectedAsset
                  ? `Linked: ${selectedAsset.assetId} - ${selectedAsset.equipmentName}. Type to search another...`
                  : '🔍 Type Asset ID (e.g. BME-ICU-001), Device Name, Serial #, Dept, or Model...'
              }
              className="w-full pl-9 pr-24 py-2 bg-white border border-teal-300 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-2xs transition-all"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 px-2 py-1 bg-teal-100/80 hover:bg-teal-200 text-teal-900 text-[11px] font-bold rounded cursor-pointer transition-colors"
                title="Toggle Dropdown List"
              >
                <span>Browse</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Selected Asset Details Preview Card */}
        {selectedAsset && !isOpen && (
          <div className="mt-2.5 p-2.5 bg-white/90 rounded-lg border border-teal-200/90 flex flex-wrap items-center justify-between gap-2 animate-in fade-in duration-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-md bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Check className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200 text-xs">
                    {selectedAsset.assetId}
                  </span>
                  <span className="font-semibold text-slate-900 text-xs truncate">
                    {selectedAsset.equipmentName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    ({selectedAsset.model || 'Standard'})
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    {selectedAsset.department}
                  </span>
                  {selectedAsset.serialNumber && (
                    <span className="flex items-center gap-1 font-mono">
                      <Hash className="w-3 h-3 text-slate-400" />
                      SN: {selectedAsset.serialNumber}
                    </span>
                  )}
                  {selectedAsset.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {selectedAsset.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-700">
                Auto-Filled
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Dropdown Results Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-[420px] flex flex-col">
          {/* Header Bar: Filter Chips & Results Count */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-teal-600" />
                {searchQuery.trim() ? (
                  <span>Matches for &ldquo;{searchQuery}&rdquo; ({filteredAssets.length})</span>
                ) : (
                  <span>All Hospital Assets ({masterAssets.length})</span>
                )}
              </span>
              <span className="text-slate-400 text-[10px]">
                Click any row to auto-populate form
              </span>
            </div>

            {/* Quick Department Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-0.5">
              <button
                type="button"
                onClick={() => setSelectedDeptFilter('All')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedDeptFilter === 'All'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Departments
              </button>
              {departments.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDeptFilter(dept)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedDeptFilter === dept
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto flex-1 custom-scrollbar divide-y divide-slate-100 text-xs">
            {/* Recent Searches Section if search bar is empty and recent items exist */}
            {!searchQuery.trim() && recentAssets.length > 0 && selectedDeptFilter === 'All' && (
              <div className="bg-amber-50/40 border-b border-amber-100/80">
                <div className="px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Recently Selected Equipment</span>
                </div>
                {recentAssets.map((asset) => (
                  <div
                    key={`recent-${asset.id}`}
                    onClick={() => handleSelect(asset)}
                    className="px-3.5 py-2 hover:bg-amber-100/50 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200 text-[11px]">
                          {asset.assetId}
                        </span>
                        <span className="font-semibold text-slate-900 text-xs truncate">
                          {asset.equipmentName}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {asset.department} • {asset.model || asset.manufacturerBrand}
                        {asset.serialNumber && ` • SN: ${asset.serialNumber}`}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-teal-600 hover:text-teal-800 shrink-0">
                      Select
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Filtered Master Asset List */}
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => {
                const isCurrent = currentAssetId?.trim().toLowerCase() === asset.assetId.trim().toLowerCase();
                return (
                  <div
                    key={asset.id}
                    onClick={() => handleSelect(asset)}
                    className={`px-3.5 py-2.5 hover:bg-teal-50/70 cursor-pointer flex items-center justify-between transition-colors ${
                      isCurrent ? 'bg-teal-50 border-l-4 border-l-teal-600' : ''
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/80 text-[11px]">
                          {asset.assetId}
                        </span>
                        <span className="font-semibold text-slate-900 text-xs">
                          {asset.equipmentName}
                        </span>
                        {asset.category && (
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                            {asset.category}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <strong className="text-slate-700 font-medium">{asset.department}</strong>
                        </span>
                        {asset.serialNumber && (
                          <span className="flex items-center gap-1 font-mono text-slate-600">
                            <Hash className="w-3 h-3 text-slate-400 shrink-0" />
                            SN: {asset.serialNumber}
                          </span>
                        )}
                        {(asset.model || asset.manufacturerBrand) && (
                          <span className="text-slate-500">
                            {[asset.manufacturerBrand, asset.model].filter(Boolean).join(' - ')}
                          </span>
                        )}
                        {asset.location && (
                          <span className="text-slate-400 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {asset.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-600 text-white">
                          <CheckCircle2 className="w-3 h-3" />
                          Selected
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-600 hover:text-white rounded border border-teal-200 transition-colors"
                        >
                          Select
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400">
                <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">
                  No hospital equipment found matching &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Try searching with a different keyword (e.g. ICU, Ventilator, Serial number, or Asset ID).
                </p>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{filteredAssets.length}</strong> of {masterAssets.length} registered equipment
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-0.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
