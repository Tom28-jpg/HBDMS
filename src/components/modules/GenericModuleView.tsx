import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Download,
  Eye,
  Edit2,
  Trash2,
  FileCheck,
  Building2,
  Home,
  ChevronRight,
  CheckSquare,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import { ModuleType, SupportingDocument } from '../../types';
import { storageService } from '../../services/storageService';
import { exportToCSV } from '../../utils/exportUtils';
import { MODULE_DEFINITIONS } from '../layout/Sidebar';

interface GenericModuleViewProps {
  moduleType: ModuleType;
  onOpenNewRecord: (moduleType: ModuleType) => void;
  onViewRecord: (moduleType: ModuleType, record: any) => void;
  onEditRecord: (moduleType: ModuleType, record: any) => void;
  onDeleteRecord: (moduleType: ModuleType, record: any) => void;
  onViewDoc: (doc: SupportingDocument) => void;
  onNavigate?: (module: ModuleType) => void;
}

export const GenericModuleView: React.FC<GenericModuleViewProps> = ({
  moduleType,
  onOpenNewRecord,
  onViewRecord,
  onEditRecord,
  onDeleteRecord,
  onViewDoc,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Reactive state synced with storageService to immediately show newly registered assets and records
  const [dataState, setDataState] = useState(() => storageService.getState());

  useEffect(() => {
    // Initial sync
    setDataState({ ...storageService.getState() });

    // Clear selection on module change
    setSelectedIds([]);

    // Subscribe to all changes (add, edit, delete, reset)
    const unsubscribe = storageService.subscribe(() => {
      setDataState({ ...storageService.getState() });
    });

    return () => {
      unsubscribe();
    };
  }, [moduleType]);

  const moduleDef = MODULE_DEFINITIONS.find((m) => m.id === moduleType);

  // Retrieve records based on moduleType directly from reactive dataState
  const rawRecords = useMemo(() => {
    switch (moduleType) {
      case 'master_asset': return dataState.masterAssets;
      case 'daily_rounds': return dataState.dailyRounds;
      case 'breakdown': return dataState.breakdowns;
      case 'po_invoice_install': return dataState.poInvoices;
      case 'preventive_maintenance': return dataState.preventiveMaintenances;
      case 'calibration': return dataState.calibrations;
      case 'service_report': return dataState.serviceReports;
      case 'gate_pass': return dataState.gatePasses;
      case 'discarding': return dataState.discardingReports;
      case 'handover': return dataState.handovers;
      case 'user_training': return dataState.userTrainings;
      case 'recall': return dataState.recalls;
      default: return [];
    }
  }, [dataState, moduleType]);

  // Extract unique departments for filtering
  const departments = useMemo(() => {
    const set = new Set<string>();
    rawRecords.forEach((r: any) => {
      if (r.department) set.add(r.department);
      if (r.fromDepartment) set.add(r.fromDepartment);
      if (r.toDepartment) set.add(r.toDepartment);
    });
    return Array.from(set);
  }, [rawRecords]);

  // Extract unique statuses for filtering
  const statuses = useMemo(() => {
    const set = new Set<string>();
    rawRecords.forEach((r: any) => {
      if (r.status) set.add(r.status);
      if (r.equipmentStatus) set.add(r.equipmentStatus);
      if (r.equipmentCondition) set.add(r.equipmentCondition);
      if (r.calibrationResult) set.add(r.calibrationResult);
      if (r.passType) set.add(r.passType);
      if (r.severity) set.add(r.severity);
      if (r.acknowledgement) set.add(r.acknowledgement);
    });
    return Array.from(set);
  }, [rawRecords]);

  // Filter and search
  const filteredRecords = useMemo(() => {
    return rawRecords.filter((rec: any) => {
      // Department match
      if (filterDepartment !== 'All') {
        const matchesDept =
          rec.department === filterDepartment ||
          rec.fromDepartment === filterDepartment ||
          rec.toDepartment === filterDepartment;
        if (!matchesDept) return false;
      }

      // Status match
      if (filterStatus !== 'All') {
        const matchesStatus =
          rec.status === filterStatus ||
          rec.equipmentStatus === filterStatus ||
          rec.equipmentCondition === filterStatus ||
          rec.calibrationResult === filterStatus ||
          rec.passType === filterStatus ||
          rec.severity === filterStatus ||
          rec.acknowledgement === filterStatus;
        if (!matchesStatus) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const str = JSON.stringify(rec).toLowerCase();
        if (!str.includes(term)) return false;
      }

      return true;
    });
  }, [rawRecords, filterDepartment, filterStatus, searchTerm]);

  // Selective Selection Handlers
  const isAllFilteredSelected =
    filteredRecords.length > 0 &&
    filteredRecords.every((r: any) => selectedIds.includes(r.id));

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      // Remove visible records from selection
      const visibleIds = new Set(filteredRecords.map((r: any) => r.id));
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    } else {
      // Add all visible records to selection
      const combined = new Set([...selectedIds, ...filteredRecords.map((r: any) => r.id)]);
      setSelectedIds(Array.from(combined));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Selective Download Handlers
  const handleExportSelectedCSV = () => {
    const selectedRecords = rawRecords.filter((r: any) => selectedIds.includes(r.id));
    if (!selectedRecords.length) {
      alert('Please select at least one record or equipment to download.');
      return;
    }
    exportToCSV(`HBDMS_${moduleType}_Selected_${selectedRecords.length}_Records`, selectedRecords);
  };

  const handleExportAll = () => {
    exportToCSV(`HBDMS_${moduleType}_All_Records`, filteredRecords);
  };

  const handleExportSingleRecord = (rec: any) => {
    const identifier = rec.assetId || rec.recallReference || rec.poNumber || rec.id;
    exportToCSV(`HBDMS_${moduleType}_${identifier}`, [rec]);
  };

  const renderBadge = (status: string) => {
    if (!status) return null;
    let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
    if (['Operational', 'Completed', 'Passed', 'Completed & Certified', 'Acknowledged & Received', 'Satisfactory', 'Good', 'Returned'].includes(status)) {
      colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (['Breakdown', 'Failed', 'Critical', 'Critical / Breakdown', 'Class I (High Risk)', 'Active Alert', 'Overdue'].includes(status)) {
      colorClass = 'bg-red-50 text-red-700 border-red-200';
    } else if (['Under Service', 'Under Maintenance', 'Pending', 'Needs Attention', 'Pending Return', 'Under Action', 'Tolerable / Conditional', 'RGP'].includes(status)) {
      colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (['Under Calibration'].includes(status)) {
      colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
    } else if (['Discarded', 'NRGP'].includes(status)) {
      colorClass = 'bg-slate-100 text-slate-800 border-slate-300';
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${colorClass}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150 pb-8">
      {/* Top Banner (High Density) */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
        {/* Breadcrumb navigation with Home button */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            title="Redirect to Dashboard Overview"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard Overview</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-700 font-medium truncate">{moduleDef?.shortName || moduleDef?.name}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px] uppercase tracking-wider">
                Official BME Register
              </span>
              <span className="text-xs text-slate-400 font-medium font-mono">
                {rawRecords.length} records registered
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 tracking-tight">
              {moduleDef?.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {moduleDef?.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {selectedIds.length > 0 ? (
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-md p-1 px-2">
                <span className="text-xs font-bold text-blue-800 mr-1">
                  {selectedIds.length} Selected
                </span>
                <button
                  onClick={handleExportSelectedCSV}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
                  title="Download selected records to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Selected</span>
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                  title="Clear Selection"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleExportAll}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Download all records matching filters as CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Export CSV
              </button>
            )}

            <button
              onClick={() => onOpenNewRecord(moduleType)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New {moduleDef?.shortName || 'Record'}</span>
            </button>
          </div>
        </div>

        {/* Filters, Search Bar, and Quick Selective Options */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search records, Asset IDs, serials, staff..."
              className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs bg-slate-50/50"
            />
          </div>

          {/* Dropdown Filters & Quick Selection Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {departments.length > 0 && (
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}

            {statuses.length > 0 && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Floating Selective Download Bar when rows are selected */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckSquare className="w-4 h-4" />
            <span>
              {selectedIds.length} of {filteredRecords.length} records selected for download
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSelectedCSV}
              className="px-3 py-1 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold rounded shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download Selected (CSV)</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2 py-1 text-xs text-blue-100 hover:text-white transition-colors cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Main Records Table (High Density with Selective Checkboxes) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                {/* Selective Checkbox Column */}
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    onChange={handleToggleSelectAll}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    title="Select/Deselect all visible records"
                  />
                </th>
                <th className="py-2.5 px-3.5">Record / Equipment</th>
                <th className="py-2.5 px-3.5">Asset ID / Ref</th>
                <th className="py-2.5 px-3.5">Department / Location</th>
                <th className="py-2.5 px-3.5">Date / Timeline</th>
                <th className="py-2.5 px-3.5">Status / Condition</th>
                <th className="py-2.5 px-3.5">Documents</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec: any) => {
                  const isSelected = selectedIds.includes(rec.id);
                  const title =
                    rec.equipmentName ||
                    rec.traineeName ||
                    rec.poNumber ||
                    rec.passNumber ||
                    rec.certificateNumber ||
                    'Record';
                  const assetId = rec.assetId || rec.recallReference || rec.poNumber || rec.passNumber || '—';
                  const dept = rec.department || (rec.fromDepartment ? `${rec.fromDepartment} → ${rec.toDepartment}` : '—');
                  const date = rec.date || rec.breakdownDate || rec.pmDueDate || rec.calibrationDate || rec.serviceDate || rec.dateSent || rec.disposalDate || rec.handoverDate || rec.recallDate || rec.poDate || rec.purchaseDate || '—';
                  const status = rec.status || rec.equipmentStatus || rec.equipmentCondition || rec.calibrationResult || rec.returnStatus || rec.acknowledgement || rec.demonstrationStatus || rec.severity;

                  return (
                    <tr
                      key={rec.id}
                      className={`transition-colors group cursor-pointer ${
                        isSelected ? 'bg-blue-50/70 hover:bg-blue-50' : 'hover:bg-blue-50/30'
                      }`}
                      onClick={() => onViewRecord(moduleType, rec)}
                    >
                      {/* Row Selective Checkbox */}
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(rec.id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          title="Select this equipment for download"
                        />
                      </td>

                      {/* Equipment Name & Subtitle */}
                      <td className="py-2.5 px-3.5">
                        <div className="font-semibold text-slate-900 text-xs group-hover:text-blue-600">
                          {title}
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">
                          {rec.manufacturerBrand || rec.model || rec.problemDescription || rec.observations || rec.reason || rec.trainingDetails || rec.vendor || 'View detailed record'}
                        </div>
                      </td>

                      {/* Asset ID */}
                      <td className="py-2.5 px-3.5">
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 text-[11px]">
                          {assetId}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-2.5 px-3.5 text-slate-700">
                        <div className="font-medium max-w-[200px] truncate text-xs">{dept}</div>
                        {rec.location && <div className="text-[10px] text-slate-400">{rec.location}</div>}
                      </td>

                      {/* Date */}
                      <td className="py-2.5 px-3.5 text-slate-600 font-mono text-[11px]">
                        {date}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3.5">
                        {renderBadge(status)}
                      </td>

                      {/* Attached Documents */}
                      <td className="py-2.5 px-3.5" onClick={(e) => e.stopPropagation()}>
                        {rec.documents && rec.documents.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            {rec.documents.map((doc: SupportingDocument) => (
                              <button
                                key={doc.id}
                                onClick={() => onViewDoc(doc)}
                                className="p-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors cursor-pointer"
                                title={`${doc.name} (${doc.category})`}
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                              </button>
                            ))}
                            <span className="text-[10px] font-mono text-slate-400">({rec.documents.length})</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>

                      {/* Action Menu including individual Download button */}
                      <td className="py-2.5 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {/* Selective Download for this specific equipment/record */}
                          <button
                            onClick={() => handleExportSingleRecord(rec)}
                            className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                            title="Download record for this equipment (CSV)"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onViewRecord(moduleType, rec)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="View Full Sheet"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditRecord(moduleType, rec)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteRecord(moduleType, rec)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 text-xs">
                    <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No records found matching current search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Showing <strong className="text-slate-800">{filteredRecords.length}</strong> of{' '}
            <strong className="text-slate-800">{rawRecords.length}</strong> registered records
            {selectedIds.length > 0 && (
              <span className="ml-2 font-semibold text-blue-700">
                ({selectedIds.length} selected)
              </span>
            )}
          </span>
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
            NABH & AERB Standards Verified
          </span>
        </div>
      </div>
    </div>
  );
};
