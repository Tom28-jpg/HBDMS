import React, { useState, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  Wrench,
  Calendar,
  Bell,
  Truck,
  Plus,
  Search,
  Download,
  CheckSquare,
  Square,
  Activity,
  ArrowRight,
  TrendingUp,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { ModuleType } from '../../types';
import { storageService } from '../../services/storageService';
import { exportToCSV } from '../../utils/exportUtils';

interface DashboardViewProps {
  onNavigate: (module: ModuleType) => void;
  onOpenNewRecord: (moduleType: ModuleType) => void;
  onViewRecord: (module: ModuleType, record: any) => void;
  onOpenGlobalSearch?: () => void;
}

interface SearchRowItem {
  id: string;
  type: string;
  moduleType: ModuleType;
  equipmentName: string;
  equipmentId: string;
  date: string;
  status: string;
  department: string;
  serialNumber: string;
  rawRecord: any;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewRecord,
  onViewRecord,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const state = storageService.getState();

  // Metrics Calculation dynamically based on storage state
  const totalAssets = state.masterAssets.length;
  const operationalAssets = state.masterAssets.filter(
    (a) => a.equipmentStatus === 'Operational'
  ).length;
  const breakdownCount = state.breakdowns.filter(
    (b) => b.status !== 'Completed'
  ).length;
  const pendingPmCount = state.preventiveMaintenances.filter(
    (pm) => pm.status !== 'Completed'
  ).length;

  const upcomingCalibrationCount = state.calibrations.filter((c) => {
    if (!c.nextCalibrationDueDate) return false;
    const diffDays =
      (new Date(c.nextCalibrationDueDate).getTime() - new Date().getTime()) /
      (1000 * 3600 * 24);
    return diffDays <= 60;
  }).length;

  const activeRecallCount = state.recalls.filter(
    (r) => r.status !== 'Resolved / Completed'
  ).length;

  const activeMovementCount =
    state.gatePasses.filter(
      (g) => g.passType === 'RGP' && g.returnStatus === 'Pending Return'
    ).length +
    state.handovers.filter(
      (h) => h.acknowledgement === 'Pending Acknowledgement'
    ).length;

  const pendingActions = pendingPmCount + upcomingCalibrationCount;

  // Flatten all equipment & records for the Global Search
  const allSearchableItems: SearchRowItem[] = useMemo(() => {
    const items: SearchRowItem[] = [];

    // 1. Master Assets
    state.masterAssets.forEach((a) => {
      items.push({
        id: `asset-${a.id}`,
        type: 'Asset',
        moduleType: 'master_asset',
        equipmentName: a.equipmentName,
        equipmentId: a.assetId,
        date: a.installationDate || a.purchaseDate || '—',
        status: a.equipmentStatus || 'Operational',
        department: a.department || '—',
        serialNumber: a.serialNumber || '—',
        rawRecord: a,
      });
    });

    // 2. Breakdowns
    state.breakdowns.forEach((b) => {
      items.push({
        id: `bd-${b.id}`,
        type: 'Breakdown',
        moduleType: 'breakdown',
        equipmentName: b.equipmentName,
        equipmentId: b.assetId || '—',
        date: b.breakdownDate || '—',
        status: b.status || 'Open',
        department: b.department || '—',
        serialNumber: b.serialNumber || '—',
        rawRecord: b,
      });
    });

    // 3. Preventive Maintenance
    state.preventiveMaintenances.forEach((pm) => {
      items.push({
        id: `pm-${pm.id}`,
        type: 'PM Report',
        moduleType: 'preventive_maintenance',
        equipmentName: pm.equipmentName,
        equipmentId: pm.assetId || '—',
        date: pm.pmCompletionDate || pm.pmDueDate || '—',
        status: pm.status || 'Completed',
        department: pm.department || '—',
        serialNumber: '—',
        rawRecord: pm,
      });
    });

    // 4. Daily Rounds
    state.dailyRounds.forEach((dr) => {
      items.push({
        id: `dr-${dr.id}`,
        type: 'Daily Round',
        moduleType: 'daily_rounds',
        equipmentName: dr.equipmentName,
        equipmentId: dr.assetId || '—',
        date: dr.date || '—',
        status: dr.equipmentCondition || 'Satisfactory',
        department: dr.department || '—',
        serialNumber: '—',
        rawRecord: dr,
      });
    });

    // 5. Calibrations
    state.calibrations.forEach((c) => {
      items.push({
        id: `cal-${c.id}`,
        type: 'Calibration',
        moduleType: 'calibration',
        equipmentName: c.equipmentName,
        equipmentId: c.assetId || '—',
        date: c.calibrationDate || '—',
        status: c.calibrationResult || 'Passed',
        department: c.department || '—',
        serialNumber: c.serialNumber || '—',
        rawRecord: c,
      });
    });

    // 6. Gate Passes & Movement
    state.gatePasses.forEach((gp) => {
      items.push({
        id: `gp-${gp.id}`,
        type: 'Gate Pass',
        moduleType: 'gate_pass',
        equipmentName: gp.equipmentName,
        equipmentId: gp.assetId || gp.passNumber,
        date: gp.dateSent || '—',
        status: gp.returnStatus || gp.passType,
        department: gp.department || '—',
        serialNumber: gp.serialNumber || '—',
        rawRecord: gp,
      });
    });

    // 7. Service Reports
    state.serviceReports.forEach((sr) => {
      items.push({
        id: `sr-${sr.id}`,
        type: 'Service Report',
        moduleType: 'service_report',
        equipmentName: sr.equipmentName,
        equipmentId: sr.assetId || '—',
        date: sr.serviceDate || '—',
        status: 'Completed',
        department: sr.department || '—',
        serialNumber: '—',
        rawRecord: sr,
      });
    });

    // 8. Recalls
    state.recalls.forEach((r) => {
      items.push({
        id: `rec-${r.id}`,
        type: 'Recall Alert',
        moduleType: 'recall',
        equipmentName: r.equipmentName,
        equipmentId: r.assetId || r.recallReference,
        date: r.recallDate || '—',
        status: r.status || 'Active Alert',
        department: (r as any).department || 'Hospital Wide',
        serialNumber: r.serialNumber || '—',
        rawRecord: r,
      });
    });

    return items;
  }, [state]);

  // Filter items according to search query (name, ID, serial number, department)
  const filteredSearchItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return allSearchableItems;
    }
    const q = searchQuery.toLowerCase().trim();
    return allSearchableItems.filter((item) => {
      return (
        item.equipmentName.toLowerCase().includes(q) ||
        item.equipmentId.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.serialNumber.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
      );
    });
  }, [allSearchableItems, searchQuery]);

  // Checkbox toggle logic
  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (
      selectedItemIds.length === filteredSearchItems.length &&
      filteredSearchItems.length > 0
    ) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredSearchItems.map((item) => item.id));
    }
  };

  // Bulk download selected assets/records
  const handleDownloadSelected = () => {
    const selectedItems = filteredSearchItems.filter((item) =>
      selectedItemIds.includes(item.id)
    );
    const exportData =
      selectedItems.length > 0 ? selectedItems : filteredSearchItems;

    const exportRows = exportData.map((item) => ({
      Type: item.type,
      'Equipment Name': item.equipmentName,
      'Equipment ID': item.equipmentId,
      Date: item.date,
      Status: item.status,
      Department: item.department,
      'Serial Number': item.serialNumber,
    }));

    exportToCSV(`Hospital_Equipment_Export_${Date.now()}`, exportRows);
  };

  const renderStatusBadge = (status: string) => {
    let color = 'bg-slate-100 text-slate-700 border-slate-200';
    if (
      [
        'Operational',
        'Completed',
        'Passed',
        'Satisfactory',
        'Returned',
      ].includes(status)
    ) {
      color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (
      [
        'Breakdown',
        'Failed',
        'Critical',
        'Critical / Breakdown',
        'Open',
        'Active Alert',
      ].includes(status)
    ) {
      color = 'bg-red-50 text-red-700 border-red-200';
    } else if (
      [
        'Under Service',
        'Under Maintenance',
        'Pending',
        'Needs Attention',
        'Pending Return',
        'Under Calibration',
      ].includes(status)
    ) {
      color = 'bg-amber-50 text-amber-700 border-amber-200';
    }

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${color}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Dashboard Header Bar matching Image 1 & 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Hospital Equipment Management Overview
          </p>
        </div>

        {/* Right Header Action: Search Records Button */}
        <div className="flex items-center gap-3">
          <button
            id="dashboard-search-records-btn"
            onClick={() => setShowSearch((prev) => !prev)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-2xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>{showSearch ? 'Hide Search' : 'Search Records'}</span>
          </button>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Expandable Global Search Section matching Image 1 & 4 */}
      {showSearch && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Global Search
                </h2>
                <p className="text-xs text-slate-500">
                  Search across all equipment and records. Select multiple
                  records to download.
                </p>
              </div>
            </div>

            <button
              id="bulk-download-btn"
              onClick={handleDownloadSelected}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                Download ({selectedItemIds.length > 0 ? selectedItemIds.length : filteredSearchItems.length})
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by equipment name, ID, serial number, department..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Records Table with Selection Checkboxes */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3.5 w-10 text-center">
                      <button
                        onClick={handleToggleSelectAll}
                        className="text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Select All / Deselect All"
                      >
                        {selectedItemIds.length === filteredSearchItems.length &&
                        filteredSearchItems.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-3.5">Type</th>
                    <th className="py-3 px-3.5">Equipment Name</th>
                    <th className="py-3 px-3.5">Equipment ID</th>
                    <th className="py-3 px-3.5">Date</th>
                    <th className="py-3 px-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSearchItems.length > 0 ? (
                    filteredSearchItems.map((item) => {
                      const isSelected = selectedItemIds.includes(item.id);
                      return (
                        <tr
                          key={item.id}
                          onClick={() => {
                            onNavigate(item.moduleType);
                            onViewRecord(item.moduleType, item.rawRecord);
                          }}
                          className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${
                            isSelected ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <td
                            className="py-3 px-3.5 text-center"
                            onClick={(e) => handleToggleSelect(item.id, e)}
                          >
                            <button className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-3.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {item.type}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 font-semibold text-slate-900">
                            {item.equipmentName}
                            {item.department && item.department !== '—' && (
                              <span className="block text-[10px] text-slate-400 font-normal">
                                {item.department}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 font-mono text-blue-600 font-bold">
                            {item.equipmentId}
                          </td>
                          <td className="py-3 px-3.5 font-mono text-slate-600">
                            {item.date}
                          </td>
                          <td className="py-3 px-3.5">
                            {renderStatusBadge(item.status)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-slate-400 text-xs"
                      >
                        No equipment or records found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6 Metric Cards Grid matching Image 1 & 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Total Assets */}
        <div
          id="dashboard-total-assets-card"
          onClick={() => onNavigate('master_asset')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Assets</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {totalAssets}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-medium group-hover:text-blue-700">
            <span>Click to view details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 2. Equipment Under Breakdown */}
        <div
          id="dashboard-breakdowns-card"
          onClick={() => onNavigate('breakdown')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-red-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Equipment Under Breakdown
              </p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {breakdownCount}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-medium group-hover:text-blue-700">
            <span>Click to view details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 3. Pending PM */}
        <div
          id="dashboard-pending-pm-card"
          onClick={() => onNavigate('preventive_maintenance')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending PM</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {pendingPmCount}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Wrench className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-medium group-hover:text-blue-700">
            <span>Click to view details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 4. Upcoming Calibration */}
        <div
          id="dashboard-calibrations-card"
          onClick={() => onNavigate('calibration')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Upcoming Calibration
              </p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {upcomingCalibrationCount}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-medium group-hover:text-blue-700">
            <span>Click to view details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 5. Recall Alerts */}
        <div
          id="dashboard-recalls-card"
          onClick={() => onNavigate('recall')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Recall Alerts</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {activeRecallCount}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Bell className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-medium group-hover:text-blue-700">
            <span>Click to view details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 6. Equipment Movement */}
        <div
          id="dashboard-movement-card"
          onClick={() => onNavigate('gate_pass')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Equipment Movement
              </p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {activeMovementCount}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Truck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-medium group-hover:text-blue-700">
            <span>Click to view details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Bottom Section: Quick Actions (Left) & System Status (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">Quick Actions</h2>
            <p className="text-xs text-slate-500">
              Common tasks and operations
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Add Asset */}
            <button
              id="action-add-asset"
              onClick={() => onOpenNewRecord('master_asset')}
              className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>Add Asset</span>
            </button>

            {/* Report Breakdown */}
            <button
              id="action-report-breakdown"
              onClick={() => onOpenNewRecord('breakdown')}
              className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Report Breakdown</span>
            </button>

            {/* Schedule PM */}
            <button
              id="action-schedule-pm"
              onClick={() => onOpenNewRecord('preventive_maintenance')}
              className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>Schedule PM</span>
            </button>

            {/* Add Calibration */}
            <button
              id="action-add-calibration"
              onClick={() => onOpenNewRecord('calibration')}
              className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Add Calibration</span>
            </button>
          </div>
        </div>

        {/* Right Card: System Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">System Status</h2>
            <p className="text-xs text-slate-500">
              Overall equipment health
            </p>
          </div>

          <div className="space-y-4">
            {/* Operational Equipment */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-800">
                  Operational Equipment
                </span>
              </div>
              <span className="text-base font-bold text-slate-900 font-mono">
                {operationalAssets}
              </span>
            </div>

            {/* Under Maintenance */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-800">
                  Under Maintenance
                </span>
              </div>
              <span className="text-base font-bold text-slate-900 font-mono">
                {breakdownCount}
              </span>
            </div>

            {/* Pending Actions */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-800">
                  Pending Actions
                </span>
              </div>
              <span className="text-base font-bold text-slate-900 font-mono">
                {pendingActions}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
