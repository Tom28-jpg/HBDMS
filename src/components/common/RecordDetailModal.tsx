import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  FileText,
  Building2,
  Calendar,
  Clock,
  Shield,
  FileCheck,
  Download,
  AlertTriangle,
  Tag,
  CheckCircle2,
  User,
  Wrench,
  Truck,
  Trash2,
  Share2,
  CheckSquare,
  Square,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import { ModuleType, SupportingDocument } from '../../types';
import { exportToCSV, printEquipmentDossier } from '../../utils/exportUtils';
import { formatFileSize } from '../../utils/fileUtils';
import { storageService } from '../../services/storageService';

interface RecordDetailModalProps {
  moduleType: ModuleType;
  record: any;
  onClose: () => void;
  onEdit?: (moduleType: ModuleType, record: any) => void;
  onViewDoc?: (doc: SupportingDocument) => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  moduleType,
  record,
  onClose,
  onEdit,
  onViewDoc,
}) => {
  if (!record) return null;

  const state = storageService.getState();
  const assetId = record.assetId || (moduleType === 'master_asset' ? record.assetId : undefined);

  // Retrieve all related reports across all modules for this equipment
  const relatedBreakdowns = useMemo(() => {
    if (!assetId) return [];
    return state.breakdowns.filter((b) => b.assetId === assetId);
  }, [state, assetId]);

  const relatedPMs = useMemo(() => {
    if (!assetId) return [];
    return state.preventiveMaintenances.filter((pm) => pm.assetId === assetId);
  }, [state, assetId]);

  const relatedCalibrations = useMemo(() => {
    if (!assetId) return [];
    return state.calibrations.filter((c) => c.assetId === assetId);
  }, [state, assetId]);

  const relatedServiceReports = useMemo(() => {
    if (!assetId) return [];
    return state.serviceReports.filter((s) => s.assetId === assetId);
  }, [state, assetId]);

  const relatedGatePasses = useMemo(() => {
    if (!assetId) return [];
    return state.gatePasses.filter((g) => g.assetId === assetId);
  }, [state, assetId]);

  const relatedDailyRounds = useMemo(() => {
    if (!assetId) return [];
    return state.dailyRounds.filter((dr) => dr.assetId === assetId);
  }, [state, assetId]);

  const relatedHandovers = useMemo(() => {
    if (!assetId) return [];
    return state.handovers.filter((h) => h.assetId === assetId);
  }, [state, assetId]);

  const relatedRecalls = useMemo(() => {
    if (!assetId && !record.equipmentName) return [];
    return state.recalls.filter(
      (r) => (assetId && r.assetId === assetId) || (record.equipmentName && r.equipmentName === record.equipmentName)
    );
  }, [state, assetId, record.equipmentName]);

  // Selected reports state for custom selective downloading
  const [selectedReports, setSelectedReports] = useState<{ [key: string]: boolean }>({
    mainRecord: true,
    breakdowns: true,
    pms: true,
    calibrations: true,
    services: true,
    gatePasses: true,
    dailyRounds: true,
    handovers: true,
    recalls: true,
  });

  const toggleReportSelection = (key: string) => {
    setSelectedReports((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePrintFullDossier = () => {
    const selectedTypes: string[] = [];
    if (selectedReports.breakdowns) selectedTypes.push('breakdown');
    if (selectedReports.pms) selectedTypes.push('pm');
    if (selectedReports.calibrations) selectedTypes.push('calibration');
    if (selectedReports.services) selectedTypes.push('service');
    if (selectedReports.gatePasses) selectedTypes.push('gate_pass');
    if (selectedReports.dailyRounds) selectedTypes.push('daily_rounds');

    printEquipmentDossier(
      'Hospital Biomedical Department',
      moduleType === 'master_asset'
        ? record
        : {
            assetId: record.assetId || 'BME-RECORD',
            equipmentName: record.equipmentName || 'Medical Equipment',
            model: record.model || 'Standard',
            department: record.department || 'Biomedical Engineering',
            equipmentStatus: 'Operational',
          },
      {
        breakdowns: relatedBreakdowns,
        pms: relatedPMs,
        calibrations: relatedCalibrations,
        services: relatedServiceReports,
        gatePasses: relatedGatePasses,
        dailyRounds: relatedDailyRounds,
      },
      selectedTypes
    );
  };

  const handleExportSingle = () => {
    exportToCSV(`HBDMS_${moduleType}_${record.assetId || record.id}`, [record]);
  };

  // Compile selective records according to user checkboxes
  const handleExportSelectiveCSV = () => {
    const recordsToExport: any[] = [];

    if (selectedReports.mainRecord) {
      recordsToExport.push({ ...record, _reportCategory: `${moduleType.toUpperCase()} (Primary Record)` });
    }
    if (selectedReports.breakdowns) {
      relatedBreakdowns.forEach((r) => recordsToExport.push({ ...r, _reportCategory: 'Breakdown Report' }));
    }
    if (selectedReports.pms) {
      relatedPMs.forEach((r) => recordsToExport.push({ ...r, _reportCategory: 'PM Report' }));
    }
    if (selectedReports.calibrations) {
      relatedCalibrations.forEach((r) => recordsToExport.push({ ...r, _reportCategory: 'Calibration Report' }));
    }
    if (selectedReports.services) {
      relatedServiceReports.forEach((r) => recordsToExport.push({ ...r, _reportCategory: 'Service Report' }));
    }
    if (selectedReports.gatePasses) {
      relatedGatePasses.forEach((r) => recordsToExport.push({ ...r, _reportCategory: 'Gate Pass' }));
    }
    if (selectedReports.dailyRounds) {
      relatedDailyRounds.forEach((r) => recordsToExport.push({ ...r, _reportCategory: 'Daily Rounds' }));
    }
    if (selectedReports.handovers) {
      relatedHandovers.forEach((r) => recordsToExport.push({ ...r, _reportCategory: 'Handover Log' }));
    }
    if (selectedReports.recalls) {
      relatedRecalls.forEach((r) => recordsToExport.push({ ...r, _reportCategory: 'Recall Alert' }));
    }

    if (recordsToExport.length === 0) {
      alert('Please check at least one report category to download.');
      return;
    }

    const filename = `HBDMS_Dossier_${record.assetId || record.id}_${recordsToExport.length}_Records`;
    exportToCSV(filename, recordsToExport);
  };

  const renderStatusBadge = (status: string, variant?: string) => {
    if (!status) return null;
    let colorClass = 'bg-slate-100 text-slate-800 border-slate-200';
    if (['Operational', 'Completed', 'Passed', 'Completed & Certified', 'Acknowledged & Received', 'Satisfactory', 'Good'].includes(status)) {
      colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (['Breakdown', 'Failed', 'Critical', 'Critical / Breakdown', 'Class I (High Risk)', 'Active Alert'].includes(status)) {
      colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
    } else if (['Under Service', 'Under Maintenance', 'Pending', 'Needs Attention', 'Pending Return', 'Under Action', 'Tolerable / Conditional'].includes(status)) {
      colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (['Under Calibration', 'Overdue'].includes(status)) {
      colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
    } else if (['Discarded'].includes(status)) {
      colorClass = 'bg-slate-200 text-slate-700 border-slate-300';
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
        {status}
      </span>
    );
  };

  const renderModuleContent = () => {
    switch (moduleType) {
      case 'master_asset':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">Asset ID</span>
                <span className="text-base font-mono font-bold text-teal-800">{record.assetId}</span>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">Equipment Status</span>
                <div className="mt-0.5">{renderStatusBadge(record.equipmentStatus)}</div>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">Equipment Category</span>
                <span className="text-xs font-medium text-slate-800">{record.category}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Manufacturer / Brand:</span>
                <span className="font-semibold text-slate-900">{record.manufacturerBrand}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Model:</span>
                <span className="font-semibold text-slate-900">{record.model}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Serial Number:</span>
                <span className="font-mono font-semibold text-slate-900">{record.serialNumber}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Hospital Department:</span>
                <span className="font-semibold text-slate-900">{record.department}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Exact Location:</span>
                <span className="font-medium text-slate-700">{record.location}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Purchase Cost:</span>
                <span className="font-semibold text-slate-900">${Number(record.purchaseCost).toLocaleString()}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Purchase Date:</span>
                <span className="font-medium text-slate-700">{record.purchaseDate}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Installation Date:</span>
                <span className="font-medium text-slate-700">{record.installationDate}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Warranty Expiry:</span>
                <span className="font-medium text-slate-700">{record.warrantyExpiryDate || `${record.warrantyPeriodMonths} Months`}</span>
              </div>
            </div>

            {/* AMC / CMC Details */}
            {record.amcCmcInfo && (
              <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200 text-xs">
                <div className="font-bold text-teal-950 text-sm mb-2 flex items-center justify-between">
                  <span>AMC / CMC / Warranty Contract</span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-200 text-teal-900 text-xs">
                    {record.amcCmcInfo.type}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Service Provider:</span>
                    <span className="font-medium">{record.amcCmcInfo.provider || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Validity Duration:</span>
                    <span className="font-medium">{record.amcCmcInfo.startDate} to {record.amcCmcInfo.endDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Contact Person:</span>
                    <span className="font-medium">{record.amcCmcInfo.contactPerson || 'N/A'} {record.amcCmcInfo.contactNumber}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Maintenance & Calibration Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900">Maintenance Information & Schedule</div>
                <p className="text-slate-600 leading-relaxed">{record.maintenanceInfo || 'Routine PM schedule per OEM manual.'}</p>
                <div className="pt-2 text-[11px] text-slate-500 flex justify-between border-t border-slate-200">
                  <span>Last PM: {record.lastPmDate || 'N/A'}</span>
                  <span className="font-semibold text-teal-700">Next PM: {record.nextPmDate || 'Scheduled'}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900">Calibration Specifications</div>
                <p className="text-slate-600 leading-relaxed">{record.calibrationInfo || 'Standard metrology testing.'}</p>
                <div className="pt-2 text-[11px] text-slate-500 flex justify-between border-t border-slate-200">
                  <span>Last Cal: {record.lastCalibrationDate || 'N/A'}</span>
                  <span className="font-semibold text-purple-700">Next Cal Due: {record.nextCalibrationDate || 'Scheduled'}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'daily_rounds':
        return (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Inspection Date:</span>
                <span className="font-bold text-slate-900 text-sm">{record.date}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Biomedical Engineer:</span>
                <span className="font-semibold text-slate-900">{record.biomedicalEngineer}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Equipment Condition:</span>
                <div className="mt-0.5">{renderStatusBadge(record.equipmentCondition)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Equipment:</span>
                <span className="font-semibold text-slate-900">{record.equipmentName}</span>
                {record.assetId && <span className="ml-2 font-mono text-teal-700">({record.assetId})</span>}
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Department:</span>
                <span className="font-semibold text-slate-900">{record.department}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Observations & Physical Check:</span>
                <p className="text-slate-700 leading-relaxed">{record.observations}</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Problems Identified:</span>
                <p className="text-slate-700 leading-relaxed">{record.problemsIdentified || 'None recorded.'}</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Action Taken by BME:</span>
                <p className="text-slate-700 leading-relaxed">{record.actionTaken || 'N/A'}</p>
              </div>
              {record.remarks && (
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-0.5">Remarks:</span>
                  <p className="text-slate-600">{record.remarks}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'breakdown':
        return (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-rose-50/60 rounded-xl border border-rose-200">
              <div>
                <span className="text-rose-600 block text-[11px] font-bold uppercase">Breakdown Ticket Status</span>
                <div className="mt-0.5">{renderStatusBadge(record.status)}</div>
              </div>
              <div>
                <span className="text-rose-600 block text-[11px] font-bold uppercase">Reported Date & Time</span>
                <span className="font-bold text-slate-900">{record.breakdownDate} at {record.breakdownTime}</span>
              </div>
              <div>
                <span className="text-rose-600 block text-[11px] font-bold uppercase">Total Downtime</span>
                <span className="font-bold text-rose-700 text-sm">{record.downtimeHours} Hours</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Asset ID:</span>
                <span className="font-mono font-bold text-teal-800">{record.assetId}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Serial Number:</span>
                <span className="font-mono font-semibold text-slate-800">{record.serialNumber || 'N/A'}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Department:</span>
                <span className="font-semibold text-slate-800">{record.department}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Assigned Engineer:</span>
                <span className="font-semibold text-slate-800">{record.assignedPerson}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Problem Description:</span>
              <p className="text-slate-700 leading-relaxed">{record.problemDescription}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Action Taken / Service Summary:</span>
              <p className="text-slate-700 leading-relaxed">{record.actionTaken || 'Triage in progress.'}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Spare Parts Used / Replaced:</span>
                <p className="text-slate-700">{record.sparePartsUsed || 'None'}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Remarks:</span>
                <p className="text-slate-700">{record.remarks || 'None'}</p>
              </div>
            </div>
          </div>
        );

      case 'po_invoice_install':
        return (
          <div className="space-y-4 text-xs">
            {/* Purchase Order Section */}
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
              <div className="font-bold text-blue-950 text-sm flex items-center justify-between">
                <span>Purchase Order (PO) Information</span>
                <span className="font-mono text-blue-800 font-bold">{record.poNumber}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700 pt-1">
                <div>
                  <span className="text-slate-400 block text-[11px]">PO Date:</span>
                  <span className="font-medium">{record.poDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Vendor / Supplier:</span>
                  <span className="font-semibold">{record.vendor}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Quantity & Model:</span>
                  <span className="font-medium">{record.quantity} Units • {record.model}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">PO Value:</span>
                  <span className="font-bold text-blue-900">${Number(record.cost).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Invoice Section */}
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
              <div className="font-bold text-emerald-950 text-sm flex items-center justify-between">
                <span>Tax Invoice & Commercials</span>
                <span className="font-mono text-emerald-800 font-bold">{record.invoiceNumber || 'Pending'}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-700 pt-1">
                <div>
                  <span className="text-slate-400 block text-[11px]">Invoice Date:</span>
                  <span className="font-medium">{record.invoiceDate || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Invoice Amount:</span>
                  <span className="font-bold text-emerald-900">${Number(record.invoiceAmount || record.cost).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Warranty Terms:</span>
                  <span className="font-medium">{record.warrantyDetails || 'Standard OEM'}</span>
                </div>
              </div>
            </div>

            {/* Installation & Demonstration Section */}
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-2">
              <div className="font-bold text-indigo-950 text-sm flex items-center justify-between">
                <span>Installation & User Demonstration Sign-Off</span>
                <div>{renderStatusBadge(record.demonstrationStatus)}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700 pt-1">
                <div>
                  <span className="text-slate-400 block text-[11px]">Installation Date:</span>
                  <span className="font-medium">{record.installationDate || 'Scheduled'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Installed / Handled By:</span>
                  <span className="font-semibold">{record.installedBy || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Target Department:</span>
                  <span className="font-medium">{record.department}</span>
                </div>
              </div>
              {record.installationInformation && (
                <div className="pt-2 border-t border-indigo-100 text-slate-700">
                  <span className="font-semibold block text-[11px]">Installation Notes:</span>
                  <p>{record.installationInformation}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'preventive_maintenance':
        return (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
              <div>
                <span className="text-emerald-700 block text-[11px] font-bold uppercase">PM Status</span>
                <div className="mt-0.5">{renderStatusBadge(record.status)}</div>
              </div>
              <div>
                <span className="text-emerald-700 block text-[11px] font-bold uppercase">Due Date</span>
                <span className="font-bold text-slate-900">{record.pmDueDate}</span>
              </div>
              <div>
                <span className="text-emerald-700 block text-[11px] font-bold uppercase">Next PM Cycle</span>
                <span className="font-bold text-emerald-800">{record.nextPmDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Asset ID:</span>
                <span className="font-mono font-bold text-teal-800">{record.assetId}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Department:</span>
                <span className="font-semibold text-slate-800">{record.department}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Biomedical Engineer:</span>
                <span className="font-semibold text-slate-800">{record.biomedicalEngineer}</span>
              </div>
            </div>

            {/* PM Checklist Items */}
            {record.checklist && record.checklist.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-2">Preventive Maintenance Verification Checklist:</span>
                <div className="space-y-1.5">
                  {record.checklist.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200/80">
                      <span className="text-slate-800 font-medium">{item.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'Pass' ? 'bg-emerald-100 text-emerald-800' : item.status === 'Fail' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">PM Observations & Findings:</span>
              <p className="text-slate-700 leading-relaxed">{record.observations}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Parts Replaced:</span>
                <p className="text-slate-700">{record.partsReplaced || 'None'}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Equipment Condition:</span>
                <p className="text-slate-700">{record.equipmentCondition || 'Good'}</p>
              </div>
            </div>
          </div>
        );

      case 'calibration':
        return (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-violet-50/60 rounded-xl border border-violet-200">
              <div>
                <span className="text-violet-700 block text-[11px] font-bold uppercase">Calibration Result</span>
                <div className="mt-0.5">{renderStatusBadge(record.calibrationResult)}</div>
              </div>
              <div>
                <span className="text-violet-700 block text-[11px] font-bold uppercase">Calibration Date</span>
                <span className="font-bold text-slate-900">{record.calibrationDate}</span>
              </div>
              <div>
                <span className="text-violet-700 block text-[11px] font-bold uppercase">Next Due Date</span>
                <span className="font-bold text-violet-900">{record.nextCalibrationDueDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Certificate Number:</span>
                <span className="font-mono font-bold text-teal-800">{record.certificateNumber}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Asset ID & Serial:</span>
                <span className="font-mono font-semibold text-slate-800">{record.assetId} ({record.serialNumber})</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Agency / Standard Lab:</span>
                <span className="font-semibold text-slate-800">{record.calibrationAgencyPerson}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Calibration Metrology Data & Tolerances:</span>
              <p className="text-slate-700 leading-relaxed">{record.certificateInformation}</p>
            </div>

            {record.remarks && (
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Remarks:</span>
                <p className="text-slate-700">{record.remarks}</p>
              </div>
            )}
          </div>
        );

      case 'service_report':
        return (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-amber-50/60 rounded-xl border border-amber-200">
              <div>
                <span className="text-amber-800 block text-[11px] font-bold uppercase">Service Provider</span>
                <span className="font-bold text-slate-900">{record.serviceProvider}</span>
              </div>
              <div>
                <span className="text-amber-800 block text-[11px] font-bold uppercase">Service Date</span>
                <span className="font-bold text-slate-900">{record.serviceDate}</span>
              </div>
              <div>
                <span className="text-amber-800 block text-[11px] font-bold uppercase">Total Service Cost</span>
                <span className="font-bold text-emerald-800 text-sm">${Number(record.serviceCost || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Asset ID:</span>
                <span className="font-mono font-bold text-teal-800">{record.assetId}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Department:</span>
                <span className="font-semibold text-slate-800">{record.department}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Clinical Complaint / Fault Symptom:</span>
              <p className="text-slate-700 leading-relaxed">{record.complaint}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Problem Identified & Root Cause:</span>
              <p className="text-slate-700 leading-relaxed">{record.problemIdentified}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Action Performed & Testing:</span>
              <p className="text-slate-700 leading-relaxed">{record.actionPerformed}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Parts Replaced:</span>
                <p className="text-slate-700">{record.partsReplaced || 'None'}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Completion Date & Status:</span>
                <p className="text-slate-700">{record.completionDate} • Operational</p>
              </div>
            </div>
          </div>
        );

      case 'gate_pass':
        return (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-purple-50/60 rounded-xl border border-purple-200">
              <div>
                <span className="text-purple-700 block text-[11px] font-bold uppercase">Pass Type & Number</span>
                <span className="font-mono font-bold text-purple-950 text-sm">{record.passNumber} ({record.passType})</span>
              </div>
              <div>
                <span className="text-purple-700 block text-[11px] font-bold uppercase">Date Sent Out</span>
                <span className="font-bold text-slate-900">{record.dateSent}</span>
              </div>
              <div>
                <span className="text-purple-700 block text-[11px] font-bold uppercase">Status</span>
                <div className="mt-0.5">{renderStatusBadge(record.returnStatus || 'Authorized')}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Asset ID:</span>
                <span className="font-mono font-bold text-teal-800">{record.assetId}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Recipient / Vendor:</span>
                <span className="font-semibold text-slate-800">{record.recipientVendor}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Authorized By:</span>
                <span className="font-semibold text-slate-800">{record.authorizedBy}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Reason for Gate Pass Dispatch:</span>
              <p className="text-slate-700 leading-relaxed">{record.reason}</p>
            </div>

            {record.passType === 'RGP' && (
              <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-indigo-900 font-bold block text-[11px]">Expected Return Date:</span>
                  <span className="font-medium text-slate-800">{record.expectedReturnDate || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-indigo-900 font-bold block text-[11px]">Transport & Logistics Details:</span>
                  <span className="font-medium text-slate-800">{record.transportDetails || 'N/A'}</span>
                </div>
              </div>
            )}

            {record.passType === 'NRGP' && record.supportingInformation && (
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Non-Return Approval Information:</span>
                <p className="text-slate-700">{record.supportingInformation}</p>
              </div>
            )}
          </div>
        );

      case 'discarding':
        return (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-100 rounded-xl border border-slate-300">
              <div>
                <span className="text-slate-500 block text-[11px] font-bold uppercase">Asset Status</span>
                <span className="inline-flex px-2 py-0.5 bg-slate-700 text-white rounded text-xs font-bold">Discarded / Condemned</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-bold uppercase">Disposal Date</span>
                <span className="font-bold text-slate-900">{record.disposalDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-bold uppercase">Disposal Method</span>
                <span className="font-bold text-slate-800">{record.disposalMethod}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Asset ID & Serial:</span>
                <span className="font-mono font-bold text-teal-800">{record.assetId} ({record.serialNumber})</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Department:</span>
                <span className="font-semibold text-slate-800">{record.department}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Equipment Condition:</span>
                <span className="font-semibold text-rose-700">{record.equipmentCondition}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Reason for Discarding / Condemnation:</span>
              <p className="text-slate-700 leading-relaxed">{record.reasonForDiscarding}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Biomedical Engineer Assessment Report:</span>
              <p className="text-slate-700 leading-relaxed">{record.bmeAssessment}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Scrap Recycler / Vendor:</span>
                <p className="text-slate-700">{record.vendorScrapDetails || 'N/A'}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Scrap Revenue Value:</span>
                <p className="text-slate-700">${Number(record.scrapAmountReceived || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        );

      case 'handover':
        return (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-teal-50/60 rounded-xl border border-teal-200">
              <div>
                <span className="text-teal-700 block text-[11px] font-bold uppercase">Acknowledgement</span>
                <div className="mt-0.5">{renderStatusBadge(record.acknowledgement)}</div>
              </div>
              <div>
                <span className="text-teal-700 block text-[11px] font-bold uppercase">Handover Date</span>
                <span className="font-bold text-slate-900">{record.handoverDate}</span>
              </div>
              <div>
                <span className="text-teal-700 block text-[11px] font-bold uppercase">Asset ID</span>
                <span className="font-mono font-bold text-teal-900">{record.assetId}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <span className="text-slate-400 block text-[11px]">From Origin Department:</span>
                <span className="font-bold text-slate-900 text-sm">{record.fromDepartment}</span>
              </div>
              <div className="px-3 py-1 bg-teal-600 text-white rounded-full text-xs font-bold">
                → Transferred To →
              </div>
              <div className="text-center sm:text-right">
                <span className="text-slate-400 block text-[11px]">To Receiving Department:</span>
                <span className="font-bold text-teal-800 text-sm">{record.toDepartment}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Person Handing Over:</span>
                <span className="font-semibold text-slate-800">{record.personHandingOver}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Person Receiving & Acknowledging:</span>
                <span className="font-semibold text-slate-800">{record.personReceiving}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Equipment Condition at Handover:</span>
              <p className="text-slate-700 leading-relaxed">{record.equipmentCondition || 'Good operational status.'}</p>
            </div>

            {record.remarks && (
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Remarks / Accessories Included:</span>
                <p className="text-slate-700">{record.remarks}</p>
              </div>
            )}
          </div>
        );

      case 'user_training':
        return (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-cyan-50/60 rounded-xl border border-cyan-200">
              <div>
                <span className="text-cyan-800 block text-[11px] font-bold uppercase">Training Status</span>
                <div className="mt-0.5">{renderStatusBadge(record.acknowledgement)}</div>
              </div>
              <div>
                <span className="text-cyan-800 block text-[11px] font-bold uppercase">Training Date</span>
                <span className="font-bold text-slate-900">{record.date}</span>
              </div>
              <div>
                <span className="text-cyan-800 block text-[11px] font-bold uppercase">Trainee Designation</span>
                <span className="font-bold text-cyan-950">{record.designation}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Trainee Name:</span>
                <span className="font-bold text-slate-900">{record.traineeName}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Department:</span>
                <span className="font-semibold text-slate-800">{record.department || 'Ward / Clinical Staff (Nurse)'}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Trainer Name / Faculty:</span>
                <span className="font-semibold text-slate-800">{record.trainerName}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Equipment Covered:</span>
              <span className="font-semibold text-teal-800">{record.equipmentName}</span>
              {record.assetId && <span className="ml-2 font-mono text-slate-500">({record.assetId})</span>}
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Training Modules & Operational Protocols Covered:</span>
              <p className="text-slate-700 leading-relaxed">{record.trainingDetails}</p>
            </div>

            {record.remarks && (
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Competency Assessment Remarks:</span>
                <p className="text-slate-700">{record.remarks}</p>
              </div>
            )}
          </div>
        );

      case 'recall':
        return (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-orange-50/60 rounded-xl border border-orange-200">
              <div>
                <span className="text-orange-800 block text-[11px] font-bold uppercase">Recall Status</span>
                <div className="mt-0.5">{renderStatusBadge(record.status)}</div>
              </div>
              <div>
                <span className="text-orange-800 block text-[11px] font-bold uppercase">Severity Classification</span>
                <span className="font-bold text-rose-700">{record.severity}</span>
              </div>
              <div>
                <span className="text-orange-800 block text-[11px] font-bold uppercase">Recall Date</span>
                <span className="font-bold text-slate-900">{record.recallDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Recall Reference No:</span>
                <span className="font-mono font-bold text-rose-800">{record.recallReference}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Asset ID:</span>
                <span className="font-mono font-semibold text-teal-800">{record.assetId}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Manufacturer:</span>
                <span className="font-semibold text-slate-800">{record.manufacturer}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Required Action:</span>
                <span className="font-bold text-orange-700">{record.requiredAction}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Reason for Recall / Hazard Description:</span>
              <p className="text-slate-700 leading-relaxed">{record.recallReason}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Action Taken by Hospital Biomedical Dept:</span>
              <p className="text-slate-700 leading-relaxed">{record.actionTaken || 'Pending vendor coordination.'}</p>
            </div>

            {record.remarks && (
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Remarks / Safety Alert Advisory:</span>
                <p className="text-slate-700">{record.remarks}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div
        className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{record.equipmentName || record.title || 'Biomedical Record Details'}</span>
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                System Record #{record.id} • Registered in HBDMS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
              title="Print Record Sheet"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportSingle}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
              title="Export as CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {renderModuleContent()}

          {/* Selective Download & Related Reports Dossier Section */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-blue-600" />
                  Selective Equipment Dossier & Related Reports Download
                </span>
                <p className="text-[11px] text-slate-500">
                  Select which reports to include for equipment <strong className="font-mono text-blue-700">{assetId || record.id}</strong>:
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleExportSelectiveCSV}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
                  title="Download selected reports as CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintFullDossier}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
                  title="Print or Save PDF Dossier"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>PDF / Print</span>
                </button>
              </div>
            </div>

            {/* Selection Checkboxes for Equipment and all Related Reports */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-blue-100 text-xs">
              <label className="flex items-center gap-2 p-1.5 rounded bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={selectedReports.mainRecord}
                  onChange={() => toggleReportSelection('mainRecord')}
                  className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-medium text-slate-800 text-[11px] truncate">
                  Master Record (Current)
                </span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={selectedReports.breakdowns}
                  onChange={() => toggleReportSelection('breakdowns')}
                  className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-medium text-slate-800 text-[11px] truncate">
                  Breakdowns ({relatedBreakdowns.length})
                </span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={selectedReports.pms}
                  onChange={() => toggleReportSelection('pms')}
                  className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-medium text-slate-800 text-[11px] truncate">
                  PM Reports ({relatedPMs.length})
                </span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={selectedReports.calibrations}
                  onChange={() => toggleReportSelection('calibrations')}
                  className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-medium text-slate-800 text-[11px] truncate">
                  Calibration ({relatedCalibrations.length})
                </span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={selectedReports.services}
                  onChange={() => toggleReportSelection('services')}
                  className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-medium text-slate-800 text-[11px] truncate">
                  Service Reports ({relatedServiceReports.length})
                </span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={selectedReports.gatePasses}
                  onChange={() => toggleReportSelection('gatePasses')}
                  className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-medium text-slate-800 text-[11px] truncate">
                  Gate Passes ({relatedGatePasses.length})
                </span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={selectedReports.dailyRounds}
                  onChange={() => toggleReportSelection('dailyRounds')}
                  className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-medium text-slate-800 text-[11px] truncate">
                  Daily Rounds ({relatedDailyRounds.length})
                </span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={selectedReports.handovers}
                  onChange={() => toggleReportSelection('handovers')}
                  className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-medium text-slate-800 text-[11px] truncate">
                  Handovers ({relatedHandovers.length})
                </span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={selectedReports.recalls}
                  onChange={() => toggleReportSelection('recalls')}
                  className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-medium text-slate-800 text-[11px] truncate">
                  Recall Alerts ({relatedRecalls.length})
                </span>
              </label>
            </div>
          </div>

          {/* Supporting Documents Section */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-teal-600" />
                Attached Supporting Documents ({record.documents?.length || 0})
              </span>
              <span className="text-[11px] text-slate-400">PDFs, Certificates, Job Sheets</span>
            </div>

            {record.documents && record.documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {record.documents.map((doc: SupportingDocument) => (
                  <div
                    key={doc.id}
                    onClick={() => onViewDoc && onViewDoc(doc)}
                    className="p-2.5 bg-white rounded-lg border border-slate-200 hover:border-teal-400 hover:shadow-2xs cursor-pointer transition-all flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold text-slate-800 truncate">{doc.name}</div>
                        <div className="text-[10px] text-slate-400">{doc.category} • {formatFileSize(doc.fileSize)}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-teal-700 shrink-0 ml-2">View</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-400">
                No supporting documents attached to this record.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Last Updated: {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : 'N/A'}
          </span>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(moduleType, record);
                  onClose();
                }}
                className="px-3.5 py-1.5 font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
              >
                Edit Record
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
