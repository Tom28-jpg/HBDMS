import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Upload,
  FileCheck,
  FileText,
  AlertCircle,
  Building2,
  Calendar,
  Save,
  CheckCircle2,
  Search,
  Clock,
  ChevronDown,
  Download,
} from 'lucide-react';
import {
  ModuleType,
  MasterAssetRecord,
  SupportingDocument,
  EquipmentCategory,
  EquipmentStatus,
  BreakdownStatus,
  PMChecklistItem,
  CalibrationResult,
  GatePassType,
  DisposalMethod,
  TraineeDesignation,
  RecallRequiredAction,
  RecallSeverity,
  RecallStatus,
} from '../../types';
import { storageService } from '../../services/storageService';
import { authService } from '../../services/authService';
import { processUploadedFiles, formatFileSize } from '../../utils/fileUtils';
import { exportToCSV } from '../../utils/exportUtils';
import { HospitalAssetSearchSelect } from './HospitalAssetSearchSelect';

interface RecordFormModalProps {
  moduleType: ModuleType;
  recordToEdit: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (savedRecord: any) => void;
}

const CATEGORIES: EquipmentCategory[] = [
  'Critical Care / Life Support',
  'Imaging & Radiology',
  'Diagnostic & Monitoring',
  'Surgical & OT Equipment',
  'Laboratory & Pathology',
  'Therapeutic & Dialysis',
  'Sterilization & CSSD',
  'General Hospital Equipment',
];

const DEPARTMENTS = [
  'Intensive Care Unit (ICU)',
  'Emergency & Trauma (ER)',
  'Operation Theatre (OT Complex)',
  'Radiology & Imaging',
  'Dialysis Unit',
  'Neonatal ICU (NICU)',
  'Cardiology OPD / Cath Lab',
  'General Ward - 4th Floor',
  'CSSD & Sterilization',
  'Pathology & Blood Bank',
  'Biomedical Engineering Workshop',
];

const DEFAULT_PM_CHECKLIST: PMChecklistItem[] = [
  { name: 'Electrical Safety & Earth Bond Resistance (IEC 60601-1)', status: 'Pass' },
  { name: 'Internal Battery Backup & Power Supply Line Voltage', status: 'Pass' },
  { name: 'Transducer / Sensor Accuracy & Zero Calibration', status: 'Pass' },
  { name: 'Visual Integrity, Cables, Strain Relief & Connectors', status: 'Pass' },
  { name: 'Audible & Visual Alarm System Self-Test', status: 'Pass' },
];

export const RecordFormModal: React.FC<RecordFormModalProps> = ({
  moduleType,
  recordToEdit,
  isOpen,
  onClose,
  onSaveSuccess,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [docs, setDocs] = useState<SupportingDocument[]>([]);
  const [docCategory, setDocCategory] = useState('Supporting Document');
  const [errorMsg, setErrorMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const masterAssets = storageService.getMasterAssets();
  const currentUser = authService.getCurrentUser();
  const isDemoUser =
    !currentUser ||
    currentUser.id === 'usr-demo-1' ||
    currentUser.id === 'usr-demo-2' ||
    currentUser.email === 'bme.alex@hospital.org' ||
    currentUser.email === 'bme.sarah@hospital.org';

  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg('');

    if (recordToEdit) {
      setFormData(JSON.parse(JSON.stringify(recordToEdit)));
      setDocs(recordToEdit.documents || []);
    } else {
      // Default Form values per module
      const today = new Date().toISOString().slice(0, 10);
      const registeredName = currentUser?.name || 'Biomedical Engineer';

      const initial: any = {
        createdAt: new Date().toISOString(),
      };

      switch (moduleType) {
        case 'master_asset':
          initial.assetId = isDemoUser ? `BME-GEN-${Math.floor(100 + Math.random() * 900)}` : '';
          initial.equipmentName = '';
          initial.category = 'Critical Care / Life Support';
          initial.manufacturerBrand = '';
          initial.model = '';
          initial.serialNumber = '';
          initial.department = 'Intensive Care Unit (ICU)';
          initial.location = isDemoUser ? 'Floor 2, Main Ward' : '';
          initial.purchaseDate = today;
          initial.installationDate = today;
          initial.purchaseCost = isDemoUser ? 15000 : 0;
          initial.warrantyPeriodMonths = isDemoUser ? 24 : 12;
          initial.warrantyExpiryDate = '';
          initial.amcCmcInfo = {
            type: 'Warranty',
            provider: isDemoUser ? 'OEM Technical Services' : '',
            startDate: today,
            endDate: '',
            contactPerson: '',
            contactNumber: '',
          };
          initial.equipmentStatus = 'Operational';
          initial.maintenanceInfo = isDemoUser ? 'Quarterly preventive maintenance per OEM checklist.' : '';
          initial.calibrationInfo = isDemoUser ? 'Annual metrological precision check.' : '';
          break;

        case 'daily_rounds':
          initial.date = today;
          initial.biomedicalEngineer = isDemoUser ? 'Alex Morgan, Lead BME' : registeredName;
          initial.department = 'Intensive Care Unit (ICU)';
          initial.equipmentName = '';
          initial.assetId = '';
          initial.equipmentCondition = 'Satisfactory';
          initial.observations = isDemoUser ? 'Normal operational parameter check completed.' : '';
          initial.problemsIdentified = isDemoUser ? 'None.' : '';
          initial.actionTaken = isDemoUser ? 'Logged in BME daily records.' : '';
          initial.remarks = '';
          break;

        case 'breakdown':
          initial.equipmentName = '';
          initial.assetId = '';
          initial.serialNumber = '';
          initial.department = 'Intensive Care Unit (ICU)';
          initial.breakdownDate = today;
          initial.breakdownTime = isDemoUser ? '09:30 AM' : '';
          initial.problemDescription = '';
          initial.assignedPerson = isDemoUser ? 'Sarah Chen, Assistant BME' : registeredName;
          initial.actionTaken = '';
          initial.sparePartsUsed = '';
          initial.downtimeHours = 0;
          initial.status = 'Open';
          initial.remarks = '';
          break;

        case 'po_invoice_install':
          initial.poNumber = isDemoUser ? `PO-2026-BME-${Math.floor(100 + Math.random() * 900)}` : '';
          initial.poDate = today;
          initial.vendor = '';
          initial.equipmentName = '';
          initial.model = '';
          initial.quantity = 1;
          initial.cost = isDemoUser ? 25000 : 0;
          initial.currency = 'USD';
          initial.invoiceNumber = isDemoUser ? `INV-${Math.floor(1000 + Math.random() * 9000)}` : '';
          initial.invoiceDate = today;
          initial.invoiceVendor = '';
          initial.invoiceAmount = isDemoUser ? 25000 : 0;
          initial.warrantyDetails = isDemoUser ? '24 Months Comprehensive OEM Warranty' : '';
          initial.installationDate = today;
          initial.installedBy = isDemoUser ? 'OEM Certified Specialist' : '';
          initial.demonstrationStatus = isDemoUser ? 'Completed' : 'Pending';
          initial.installationInformation = isDemoUser ? 'Installed and commissioned.' : '';
          initial.department = 'Intensive Care Unit (ICU)';
          break;

        case 'preventive_maintenance':
          initial.equipmentName = '';
          initial.assetId = '';
          initial.department = 'Intensive Care Unit (ICU)';
          initial.pmDueDate = today;
          initial.pmCompletionDate = today;
          initial.biomedicalEngineer = isDemoUser ? 'Alex Morgan, Lead BME' : registeredName;
          initial.checklist = JSON.parse(JSON.stringify(DEFAULT_PM_CHECKLIST));
          initial.observations = isDemoUser ? 'All safety checks within normal limits.' : '';
          initial.partsReplaced = '';
          initial.equipmentCondition = 'Good';
          const nextDate = new Date();
          nextDate.setMonth(nextDate.getMonth() + 3);
          initial.nextPmDate = nextDate.toISOString().slice(0, 10);
          initial.status = 'Completed';
          initial.remarks = '';
          break;

        case 'calibration':
          initial.equipmentName = '';
          initial.assetId = '';
          initial.serialNumber = '';
          initial.department = 'Intensive Care Unit (ICU)';
          initial.calibrationDate = today;
          initial.calibrationAgencyPerson = isDemoUser ? 'NABL Accredited Metrology Lab' : '';
          initial.calibrationResult = 'Passed';
          initial.certificateInformation = isDemoUser ? 'Tested with standard master analyzer. Deviation within ±2%.' : '';
          initial.certificateNumber = isDemoUser ? `NABL-CAL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` : '';
          const nextCal = new Date();
          nextCal.setFullYear(nextCal.getFullYear() + 1);
          initial.nextCalibrationDueDate = nextCal.toISOString().slice(0, 10);
          initial.remarks = isDemoUser ? 'Calibration certificate valid for 1 year.' : '';
          break;

        case 'service_report':
          initial.equipmentName = '';
          initial.assetId = '';
          initial.department = 'Intensive Care Unit (ICU)';
          initial.complaint = '';
          initial.serviceDate = today;
          initial.serviceProvider = isDemoUser ? 'In-House BME Dept' : registeredName;
          initial.problemIdentified = '';
          initial.actionPerformed = '';
          initial.partsReplaced = '';
          initial.serviceCost = 0;
          initial.completionDate = today;
          initial.remarks = '';
          break;

        case 'gate_pass':
          initial.passType = 'RGP';
          initial.passNumber = isDemoUser ? `GP-${new Date().getFullYear()}-RGP-${Math.floor(100 + Math.random() * 900)}` : '';
          initial.equipmentName = '';
          initial.assetId = '';
          initial.serialNumber = '';
          initial.department = 'Intensive Care Unit (ICU)';
          initial.recipientVendor = '';
          initial.reason = isDemoUser ? 'Sent for OEM calibration and precision bench service.' : '';
          initial.dateSent = today;
          const retDate = new Date();
          retDate.setDate(retDate.getDate() + 7);
          initial.expectedReturnDate = retDate.toISOString().slice(0, 10);
          initial.transportDetails = isDemoUser ? 'Handled by Hospital Logistics Executive' : '';
          initial.returnStatus = 'Pending Return';
          initial.authorizedBy = isDemoUser ? 'Medical Superintendent & Lead BME' : registeredName;
          break;

        case 'discarding':
          initial.equipmentName = '';
          initial.assetId = '';
          initial.serialNumber = '';
          initial.department = 'General Ward - 4th Floor';
          initial.equipmentCondition = 'Non-functional / Beyond Economical Repair';
          initial.reasonForDiscarding = isDemoUser ? 'Beyond Economical Repair (BER) & Obsolete Parts' : '';
          initial.bmeAssessment = isDemoUser ? 'Lifespan exceeds 10 years; maintenance cost exceeds replacement value.' : '';
          initial.disposalMethod = 'Authorized E-Waste Handler';
          initial.disposalDate = today;
          initial.vendorScrapDetails = isDemoUser ? 'GreenEarth E-Waste Authorized Handler' : '';
          initial.scrapAmountReceived = 0;
          initial.remarks = isDemoUser ? 'Condemnation board approval obtained.' : '';
          break;

        case 'handover':
          initial.equipmentName = '';
          initial.assetId = '';
          initial.serialNumber = '';
          initial.fromDepartment = 'Operation Theatre (OT Complex)';
          initial.toDepartment = 'Intensive Care Unit (ICU)';
          initial.handoverDate = today;
          initial.equipmentCondition = 'Operational and thoroughly sanitized';
          initial.personHandingOver = isDemoUser ? 'Staff Nurse In-Charge' : registeredName;
          initial.personReceiving = isDemoUser ? 'ICU Nursing Shift Lead' : '';
          initial.remarks = isDemoUser ? 'Transferred along with standard patient cables and power cord.' : '';
          initial.acknowledgement = 'Acknowledged & Received';
          break;

        case 'user_training':
          initial.traineeName = '';
          initial.designation = 'Nurse' as TraineeDesignation;
          initial.department = '';
          initial.date = today;
          initial.equipmentName = '';
          initial.assetId = '';
          initial.trainerName = isDemoUser ? 'Alex Morgan, Lead BME' : registeredName;
          initial.trainingDetails = isDemoUser ? 'Operational handling, alarm threshold settings, basic cleaning protocols.' : '';
          initial.remarks = isDemoUser ? 'Hands-on practical simulation completed.' : '';
          initial.acknowledgement = 'Completed & Certified';
          break;

        case 'recall':
          initial.equipmentName = '';
          initial.assetId = '';
          initial.manufacturer = '';
          initial.model = '';
          initial.serialNumber = '';
          initial.recallDate = today;
          initial.recallReason = '';
          initial.recallReference = isDemoUser ? `FDA-RECALL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` : '';
          initial.severity = 'Class II (Moderate Risk)' as RecallSeverity;
          initial.requiredAction = 'Repair' as RecallRequiredAction;
          initial.actionTaken = '';
          initial.status = 'Active Alert' as RecallStatus;
          initial.remarks = '';
          break;
      }

      setFormData(initial);
      setDocs([]);
    }
  }, [isOpen, moduleType, recordToEdit]);

  if (!isOpen) return null;

  // Auto-fill from Master Asset across all 12 modules
  const handleAssetSelect = (selected: MasterAssetRecord | string) => {
    const matched = typeof selected === 'string'
      ? masterAssets.find((a) => a.assetId.trim().toLowerCase() === selected.trim().toLowerCase())
      : selected;

    if (matched) {
      setFormData((prev: any) => ({
        ...prev,
        assetId: matched.assetId,
        equipmentName: matched.equipmentName,
        model: matched.model || prev.model,
        serialNumber: matched.serialNumber || prev.serialNumber,
        department: matched.department || prev.department,
        fromDepartment: prev.fromDepartment !== undefined ? matched.department : (prev.department || matched.department),
        manufacturer: matched.manufacturerBrand || prev.manufacturer,
        manufacturerBrand: matched.manufacturerBrand || prev.manufacturerBrand,
        vendor: matched.manufacturerBrand || prev.vendor,
        location: matched.location || prev.location,
        category: matched.category || prev.category,
        purchaseCost: matched.purchaseCost || prev.purchaseCost,
        purchaseDate: matched.purchaseDate || prev.purchaseDate,
        installationDate: matched.installationDate || prev.installationDate,
        warrantyExpiryDate: matched.warrantyExpiryDate || prev.warrantyExpiryDate,
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, assetId: typeof selected === 'string' ? selected : selected.assetId }));
    }
  };

  const handleClearAsset = () => {
    setFormData((prev: any) => ({
      ...prev,
      assetId: '',
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    try {
      const newDocs = await processUploadedFiles(e.target.files, docCategory);
      setDocs((prev) => [...prev, ...newDocs]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveDoc = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Specific Validations
    if (moduleType === 'master_asset') {
      if (!formData.assetId?.trim()) {
        setErrorMsg('Asset ID is required');
        return;
      }
      if (!formData.equipmentName?.trim()) {
        setErrorMsg('Equipment Name is required');
        return;
      }
      // Check duplicate Asset ID if creating new
      if (!recordToEdit) {
        const dup = masterAssets.find(
          (a) => a.assetId.trim().toLowerCase() === formData.assetId.trim().toLowerCase()
        );
        if (dup) {
          setErrorMsg(`Asset ID "${formData.assetId}" already exists in Master Register!`);
          return;
        }
      }
    }

    if (moduleType === 'user_training') {
      if (!formData.traineeName?.trim()) {
        setErrorMsg('Trainee Name is required');
        return;
      }
      // Department is MANDATORY for all EXCEPT Nurse (per Section 20 Requirement)
      if (formData.designation !== 'Nurse' && !formData.department?.trim()) {
        setErrorMsg('Department is mandatory when Trainee designation is not Nurse');
        return;
      }
      if (!formData.equipmentName?.trim()) {
        setErrorMsg('Equipment Name is required');
        return;
      }
    }

    if (moduleType === 'breakdown') {
      if (!formData.equipmentName?.trim() && !formData.assetId?.trim()) {
        setErrorMsg('Equipment Name or Asset ID is required');
        return;
      }
      if (!formData.problemDescription?.trim()) {
        setErrorMsg('Problem Description is required');
        return;
      }
    }

    const payload = {
      ...formData,
      documents: docs,
    };

    let savedResult: any;
    if (recordToEdit) {
      // Update
      switch (moduleType) {
        case 'master_asset':
          savedResult = storageService.updateMasterAsset(recordToEdit.id, payload);
          break;
        case 'daily_rounds':
          savedResult = storageService.updateRecord('dailyRounds', recordToEdit.id, payload);
          break;
        case 'breakdown':
          savedResult = storageService.updateRecord('breakdowns', recordToEdit.id, payload);
          break;
        case 'po_invoice_install':
          savedResult = storageService.updateRecord('poInvoices', recordToEdit.id, payload);
          break;
        case 'preventive_maintenance':
          savedResult = storageService.updateRecord('preventiveMaintenances', recordToEdit.id, payload);
          break;
        case 'calibration':
          savedResult = storageService.updateRecord('calibrations', recordToEdit.id, payload);
          break;
        case 'service_report':
          savedResult = storageService.updateRecord('serviceReports', recordToEdit.id, payload);
          break;
        case 'gate_pass':
          savedResult = storageService.updateRecord('gatePasses', recordToEdit.id, payload);
          break;
        case 'discarding':
          savedResult = storageService.updateRecord('discardingReports', recordToEdit.id, payload);
          break;
        case 'handover':
          savedResult = storageService.updateRecord('handovers', recordToEdit.id, payload);
          break;
        case 'user_training':
          savedResult = storageService.updateRecord('userTrainings', recordToEdit.id, payload);
          break;
        case 'recall':
          savedResult = storageService.updateRecord('recalls', recordToEdit.id, payload);
          break;
      }
    } else {
      // Create new
      switch (moduleType) {
        case 'master_asset':
          savedResult = storageService.addMasterAsset(payload);
          break;
        case 'daily_rounds':
          savedResult = storageService.addRecord('dailyRounds', payload, 'dr');
          break;
        case 'breakdown':
          savedResult = storageService.addRecord('breakdowns', payload, 'bd');
          break;
        case 'po_invoice_install':
          savedResult = storageService.addRecord('poInvoices', payload, 'poi');
          break;
        case 'preventive_maintenance':
          savedResult = storageService.addRecord('preventiveMaintenances', payload, 'pm');
          break;
        case 'calibration':
          savedResult = storageService.addRecord('calibrations', payload, 'cal');
          break;
        case 'service_report':
          savedResult = storageService.addRecord('serviceReports', payload, 'srv');
          break;
        case 'gate_pass':
          savedResult = storageService.addRecord('gatePasses', payload, 'gp');
          break;
        case 'discarding':
          savedResult = storageService.addRecord('discardingReports', payload, 'disc');
          break;
        case 'handover':
          savedResult = storageService.addRecord('handovers', payload, 'ho');
          break;
        case 'user_training':
          savedResult = storageService.addRecord('userTrainings', payload, 'tr');
          break;
        case 'recall':
          savedResult = storageService.addRecord('recalls', payload, 'rec');
          break;
      }
    }

    onSaveSuccess(savedResult || payload);
    onClose();
  };

  const getModuleTitle = () => {
    const action = recordToEdit ? 'Edit' : 'Create New';
    switch (moduleType) {
      case 'master_asset': return `${action} Master Asset Register Entry`;
      case 'daily_rounds': return `${action} Daily Rounds Inspection`;
      case 'breakdown': return `${action} Equipment Breakdown Ticket`;
      case 'po_invoice_install': return `${action} PO, Invoice & Installation Record`;
      case 'preventive_maintenance': return `${action} Preventive Maintenance Report`;
      case 'calibration': return `${action} Calibration & Metrology Report`;
      case 'service_report': return `${action} Service & Repair Report`;
      case 'gate_pass': return `${action} Gate Pass (RGP / NRGP)`;
      case 'discarding': return `${action} Equipment Discarding & Condemnation`;
      case 'handover': return `${action} Department Handover Register`;
      case 'user_training': return `${action} User Training Register Entry`;
      case 'recall': return `${action} Medical Equipment Recall Record`;
      default: return `${action} Record`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div
        className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{getModuleTitle()}</h2>
              <p className="text-xs text-slate-500">Biomedical Engineering Documentation Form</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Searchable Bar & Dropdown Selector for Hospital Asset ID across ALL 12 Documentation Forms */}
          <HospitalAssetSearchSelect
            currentAssetId={formData.assetId}
            masterAssets={masterAssets}
            onSelectAsset={handleAssetSelect}
            onClearAsset={handleClearAsset}
            moduleType={moduleType}
          />

          {/* FORM FIELDS BY MODULE */}
          {moduleType === 'master_asset' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Asset ID *</label>
                  <input
                    type="text"
                    value={formData.assetId || ''}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    placeholder="e.g. BME-ICU-001"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    value={formData.equipmentName || ''}
                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                    placeholder="e.g. ICU Ventilator Servo-u"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={formData.category || CATEGORIES[0]}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Manufacturer / Brand</label>
                  <input
                    type="text"
                    value={formData.manufacturerBrand || ''}
                    onChange={(e) => setFormData({ ...formData, manufacturerBrand: e.target.value })}
                    placeholder="e.g. Getinge / Maquet"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Model</label>
                  <input
                    type="text"
                    value={formData.model || ''}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. Servo-u v4.2"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={formData.serialNumber || ''}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="e.g. SN-MQ-904128"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={formData.department || DEPARTMENTS[0]}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Specific Location</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Bed 04 / OT 2 / Floor 3"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Equipment Status</label>
                  <select
                    value={formData.equipmentStatus || 'Operational'}
                    onChange={(e) => setFormData({ ...formData, equipmentStatus: e.target.value as EquipmentStatus })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Breakdown">Breakdown</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Under Calibration">Under Calibration</option>
                    <option value="Discarded">Discarded</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchaseDate || ''}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Installation Date</label>
                  <input
                    type="date"
                    value={formData.installationDate || ''}
                    onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Purchase Cost ($)</label>
                  <input
                    type="number"
                    value={formData.purchaseCost || ''}
                    onChange={(e) => setFormData({ ...formData, purchaseCost: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Warranty (Months)</label>
                  <input
                    type="number"
                    value={formData.warrantyPeriodMonths || ''}
                    onChange={(e) => setFormData({ ...formData, warrantyPeriodMonths: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Maintenance & Calibration information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Maintenance Information</label>
                  <textarea
                    rows={2}
                    value={formData.maintenanceInfo || ''}
                    onChange={(e) => setFormData({ ...formData, maintenanceInfo: e.target.value })}
                    placeholder="e.g. Quarterly PM required per OEM guidelines."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Calibration Information</label>
                  <textarea
                    rows={2}
                    value={formData.calibrationInfo || ''}
                    onChange={(e) => setFormData({ ...formData, calibrationInfo: e.target.value })}
                    placeholder="e.g. Semi-annual pressure and flow calibration."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {moduleType === 'daily_rounds' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rounds Date *</label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Biomedical Engineer *</label>
                  <input
                    type="text"
                    value={formData.biomedicalEngineer || ''}
                    onChange={(e) => setFormData({ ...formData, biomedicalEngineer: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department *</label>
                  <select
                    value={formData.department || DEPARTMENTS[0]}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Asset ID</label>
                  <input
                    type="text"
                    value={formData.assetId || ''}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    placeholder="e.g. BME-ICU-001"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    value={formData.equipmentName || ''}
                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                    placeholder="e.g. ICU Ventilator Servo-u"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Equipment Condition *</label>
                  <select
                    value={formData.equipmentCondition || 'Satisfactory'}
                    onChange={(e) => setFormData({ ...formData, equipmentCondition: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="Satisfactory">Satisfactory</option>
                    <option value="Needs Attention">Needs Attention</option>
                    <option value="Critical / Breakdown">Critical / Breakdown</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Observations *</label>
                <textarea
                  rows={2}
                  value={formData.observations || ''}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  placeholder="Parameters, visual check, sensor reading, alarm test observations..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Problems Identified</label>
                  <input
                    type="text"
                    value={formData.problemsIdentified || ''}
                    onChange={(e) => setFormData({ ...formData, problemsIdentified: e.target.value })}
                    placeholder="e.g. Cable loose / pressure drop"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Action Taken</label>
                  <input
                    type="text"
                    value={formData.actionTaken || ''}
                    onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
                    placeholder="e.g. Tightened cable / calibrated sensor"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Remarks</label>
                <input
                  type="text"
                  value={formData.remarks || ''}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Additional notes"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {moduleType === 'breakdown' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    value={formData.equipmentName || ''}
                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                    placeholder="e.g. Hemodialysis Machine"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Asset ID</label>
                  <input
                    type="text"
                    value={formData.assetId || ''}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    placeholder="BME-DIAL-005"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={formData.serialNumber || ''}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={formData.department || DEPARTMENTS[0]}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Breakdown Date</label>
                  <input
                    type="date"
                    value={formData.breakdownDate || ''}
                    onChange={(e) => setFormData({ ...formData, breakdownDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Breakdown Time</label>
                  <input
                    type="text"
                    value={formData.breakdownTime || ''}
                    onChange={(e) => setFormData({ ...formData, breakdownTime: e.target.value })}
                    placeholder="08:45 AM"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={formData.status || 'Open'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as BreakdownStatus })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    <option value="Open">Open</option>
                    <option value="Under Service">Under Service</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Problem Description *</label>
                <textarea
                  rows={2}
                  value={formData.problemDescription || ''}
                  onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                  placeholder="Describe failure symptoms, error codes, and alarm conditions..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assigned Person / Team</label>
                  <input
                    type="text"
                    value={formData.assignedPerson || ''}
                    onChange={(e) => setFormData({ ...formData, assignedPerson: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Downtime (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.downtimeHours || ''}
                    onChange={(e) => setFormData({ ...formData, downtimeHours: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Spare Parts Used</label>
                  <input
                    type="text"
                    value={formData.sparePartsUsed || ''}
                    onChange={(e) => setFormData({ ...formData, sparePartsUsed: e.target.value })}
                    placeholder="e.g. Hydraulic O-ring kit, solenoid valve"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Action Taken / Service Summary</label>
                <textarea
                  rows={2}
                  value={formData.actionTaken || ''}
                  onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
                  placeholder="Steps taken to diagnose and resolve breakdown..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {moduleType === 'po_invoice_install' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
                <span className="font-bold text-blue-950 block">Purchase Order (PO) Details</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">PO Number *</label>
                    <input
                      type="text"
                      value={formData.poNumber || ''}
                      onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">PO Date</label>
                    <input
                      type="date"
                      value={formData.poDate || ''}
                      onChange={(e) => setFormData({ ...formData, poDate: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Vendor / Supplier *</label>
                    <input
                      type="text"
                      value={formData.vendor || ''}
                      onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">Equipment Name *</label>
                    <input
                      type="text"
                      value={formData.equipmentName || ''}
                      onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Model</label>
                    <input
                      type="text"
                      value={formData.model || ''}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">PO Value ($)</label>
                    <input
                      type="number"
                      value={formData.cost || ''}
                      onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Invoice section */}
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
                <span className="font-bold text-emerald-950 block">Invoice Information</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Invoice Number</label>
                    <input
                      type="text"
                      value={formData.invoiceNumber || ''}
                      onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Invoice Date</label>
                    <input
                      type="date"
                      value={formData.invoiceDate || ''}
                      onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Warranty Terms</label>
                    <input
                      type="text"
                      value={formData.warrantyDetails || ''}
                      onChange={(e) => setFormData({ ...formData, warrantyDetails: e.target.value })}
                      placeholder="e.g. 36 Months Comprehensive"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Installation section */}
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-3">
                <span className="font-bold text-indigo-950 block">Installation & Demonstration Sign-off</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Installation Date</label>
                    <input
                      type="date"
                      value={formData.installationDate || ''}
                      onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Installed By (Engineer)</label>
                    <input
                      type="text"
                      value={formData.installedBy || ''}
                      onChange={(e) => setFormData({ ...formData, installedBy: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Demonstration Status</label>
                    <select
                      value={formData.demonstrationStatus || 'Completed'}
                      onChange={(e) => setFormData({ ...formData, demonstrationStatus: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                      <option value="Scheduled">Scheduled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {moduleType === 'preventive_maintenance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    value={formData.equipmentName || ''}
                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Asset ID</label>
                  <input
                    type="text"
                    value={formData.assetId || ''}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={formData.department || DEPARTMENTS[0]}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">PM Due Date *</label>
                  <input
                    type="date"
                    value={formData.pmDueDate || ''}
                    onChange={(e) => setFormData({ ...formData, pmDueDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">PM Completion Date</label>
                  <input
                    type="date"
                    value={formData.pmCompletionDate || ''}
                    onChange={(e) => setFormData({ ...formData, pmCompletionDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Next PM Date *</label>
                  <input
                    type="date"
                    value={formData.nextPmDate || ''}
                    onChange={(e) => setFormData({ ...formData, nextPmDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">PM Status</label>
                  <select
                    value={formData.status || 'Completed'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              {/* Checklist builder */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">PM Inspection Checklist:</span>
                <div className="space-y-1.5">
                  {formData.checklist?.map((item: PMChecklistItem, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-800 font-medium">{item.name}</span>
                      <div className="flex items-center gap-1.5">
                        {(['Pass', 'Fail', 'N/A'] as const).map((st) => (
                          <button
                            type="button"
                            key={st}
                            onClick={() => {
                              const updated = [...formData.checklist];
                              updated[i].status = st;
                              setFormData({ ...formData, checklist: updated });
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                              item.status === st
                                ? st === 'Pass'
                                  ? 'bg-emerald-600 text-white'
                                  : st === 'Fail'
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-700 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">PM Observations</label>
                <textarea
                  rows={2}
                  value={formData.observations || ''}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  placeholder="Safety test readings, tolerances, dust cleaning..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Parts Replaced</label>
                  <input
                    type="text"
                    value={formData.partsReplaced || ''}
                    onChange={(e) => setFormData({ ...formData, partsReplaced: e.target.value })}
                    placeholder="e.g. Bacteria filter, O-ring, battery"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Biomedical Engineer</label>
                  <input
                    type="text"
                    value={formData.biomedicalEngineer || ''}
                    onChange={(e) => setFormData({ ...formData, biomedicalEngineer: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {moduleType === 'calibration' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    value={formData.equipmentName || ''}
                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Asset ID</label>
                  <input
                    type="text"
                    value={formData.assetId || ''}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={formData.serialNumber || ''}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Calibration Date *</label>
                  <input
                    type="date"
                    value={formData.calibrationDate || ''}
                    onChange={(e) => setFormData({ ...formData, calibrationDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Next Due Date *</label>
                  <input
                    type="date"
                    value={formData.nextCalibrationDueDate || ''}
                    onChange={(e) => setFormData({ ...formData, nextCalibrationDueDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Calibration Result *</label>
                  <select
                    value={formData.calibrationResult || 'Passed'}
                    onChange={(e) => setFormData({ ...formData, calibrationResult: e.target.value as CalibrationResult })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    <option value="Passed">Passed</option>
                    <option value="Failed">Failed</option>
                    <option value="Tolerable / Conditional">Tolerable / Conditional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Certificate Number *</label>
                  <input
                    type="text"
                    value={formData.certificateNumber || ''}
                    onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                    placeholder="e.g. NABL-CAL-2026-8812"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Calibration Agency / Standards Lab</label>
                  <input
                    type="text"
                    value={formData.calibrationAgencyPerson || ''}
                    onChange={(e) => setFormData({ ...formData, calibrationAgencyPerson: e.target.value })}
                    placeholder="Fluke Standards Lab / In-house Metrology"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Certificate Information & Test Readings</label>
                <textarea
                  rows={2}
                  value={formData.certificateInformation || ''}
                  onChange={(e) => setFormData({ ...formData, certificateInformation: e.target.value })}
                  placeholder="Master analyzer used, tolerances, deviation percentages..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {moduleType === 'service_report' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    value={formData.equipmentName || ''}
                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Asset ID</label>
                  <input
                    type="text"
                    value={formData.assetId || ''}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={formData.department || DEPARTMENTS[0]}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Service Provider</label>
                  <input
                    type="text"
                    value={formData.serviceProvider || ''}
                    onChange={(e) => setFormData({ ...formData, serviceProvider: e.target.value })}
                    placeholder="OEM Service / In-House / 3rd Party"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Service Date</label>
                  <input
                    type="date"
                    value={formData.serviceDate || ''}
                    onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Service Cost ($)</label>
                  <input
                    type="number"
                    value={formData.serviceCost || ''}
                    onChange={(e) => setFormData({ ...formData, serviceCost: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Clinical Complaint</label>
                <textarea
                  rows={2}
                  value={formData.complaint || ''}
                  onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                  placeholder="Reported problem by clinical team..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Action Performed & Parts Replaced</label>
                <textarea
                  rows={2}
                  value={formData.actionPerformed || ''}
                  onChange={(e) => setFormData({ ...formData, actionPerformed: e.target.value })}
                  placeholder="Repair steps performed, PCB replacements, calibrations..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {moduleType === 'gate_pass' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gate Pass Type *</label>
                  <select
                    value={formData.passType || 'RGP'}
                    onChange={(e) => {
                      const type = e.target.value as GatePassType;
                      setFormData({
                        ...formData,
                        passType: type,
                        passNumber: `GP-${new Date().getFullYear()}-${type}-${Math.floor(100 + Math.random() * 900)}`,
                      });
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    <option value="RGP">RGP – Returnable Gate Pass</option>
                    <option value="NRGP">NRGP – Non-Returnable Gate Pass</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pass Number *</label>
                  <input
                    type="text"
                    value={formData.passNumber || ''}
                    onChange={(e) => setFormData({ ...formData, passNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date Sent Out *</label>
                  <input
                    type="date"
                    value={formData.dateSent || ''}
                    onChange={(e) => setFormData({ ...formData, dateSent: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    value={formData.equipmentName || ''}
                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Asset ID</label>
                  <input
                    type="text"
                    value={formData.assetId || ''}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Vendor / Recipient *</label>
                  <input
                    type="text"
                    value={formData.recipientVendor || ''}
                    onChange={(e) => setFormData({ ...formData, recipientVendor: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason for Gate Pass</label>
                <textarea
                  rows={2}
                  value={formData.reason || ''}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="External repair, sensor re-machining, disposal..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              {formData.passType === 'RGP' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-200">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Expected Return Date</label>
                    <input
                      type="date"
                      value={formData.expectedReturnDate || ''}
                      onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Return Status</label>
                    <select
                      value={formData.returnStatus || 'Pending Return'}
                      onChange={(e) => setFormData({ ...formData, returnStatus: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                    >
                      <option value="Pending Return">Pending Return</option>
                      <option value="Returned">Returned</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Transport Details</label>
                    <input
                      type="text"
                      value={formData.transportDetails || ''}
                      onChange={(e) => setFormData({ ...formData, transportDetails: e.target.value })}
                      placeholder="Courier AWB / Vehicle / Carrier"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {moduleType === 'discarding' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    value={formData.equipmentName || ''}
                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Asset ID</label>
                  <input
                    type="text"
                    value={formData.assetId || ''}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Disposal Method</label>
                  <select
                    value={formData.disposalMethod || 'Authorized E-Waste Handler'}
                    onChange={(e) => setFormData({ ...formData, disposalMethod: e.target.value as DisposalMethod })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="Authorized E-Waste Handler">Authorized E-Waste Handler</option>
                    <option value="Scrap Auction">Scrap Auction</option>
                    <option value="Hazardous Bio-Medical Disposal">Hazardous Bio-Medical Disposal</option>
                    <option value="Return to Manufacturer / Trade-in">Return to Manufacturer / Trade-in</option>
                    <option value="Spare Parts Cannibalization">Spare Parts Cannibalization</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason for Discarding / Condemnation *</label>
                <textarea
                  rows={2}
                  value={formData.reasonForDiscarding || ''}
                  onChange={(e) => setFormData({ ...formData, reasonForDiscarding: e.target.value })}
                  placeholder="Beyond Economical Repair, obsolete, damaged beyond repair..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Biomedical Engineer Assessment</label>
                <textarea
                  rows={2}
                  value={formData.bmeAssessment || ''}
                  onChange={(e) => setFormData({ ...formData, bmeAssessment: e.target.value })}
                  placeholder="Technical assessment justification for condemnation board..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {moduleType === 'handover' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    value={formData.equipmentName || ''}
                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Asset ID</label>
                  <input
                    type="text"
                    value={formData.assetId || ''}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Handover Date</label>
                  <input
                    type="date"
                    value={formData.handoverDate || ''}
                    onChange={(e) => setFormData({ ...formData, handoverDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">From Department *</label>
                  <select
                    value={formData.fromDepartment || DEPARTMENTS[0]}
                    onChange={(e) => setFormData({ ...formData, fromDepartment: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">To Department *</label>
                  <select
                    value={formData.toDepartment || DEPARTMENTS[1]}
                    onChange={(e) => setFormData({ ...formData, toDepartment: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Person Handing Over</label>
                  <input
                    type="text"
                    value={formData.personHandingOver || ''}
                    onChange={(e) => setFormData({ ...formData, personHandingOver: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Person Receiving</label>
                  <input
                    type="text"
                    value={formData.personReceiving || ''}
                    onChange={(e) => setFormData({ ...formData, personReceiving: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {moduleType === 'user_training' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Trainee Name *</label>
                  <input
                    type="text"
                    value={formData.traineeName || ''}
                    onChange={(e) => setFormData({ ...formData, traineeName: e.target.value })}
                    placeholder="e.g. Sister Priya George"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Designation *</label>
                  <select
                    value={formData.designation || 'Nurse'}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value as TraineeDesignation })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="Nurse">Nurse (Department Optional)</option>
                    <option value="Doctor / Consultant">Doctor / Consultant</option>
                    <option value="Medical Officer">Medical Officer</option>
                    <option value="OT / Radiology Technician">OT / Radiology Technician</option>
                    <option value="Dialysis Operator">Dialysis Operator</option>
                    <option value="Biomedical Intern / Trainee">Biomedical Intern / Trainee</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Department {formData.designation === 'Nurse' ? '(Optional)' : '*'}
                  </label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder={formData.designation === 'Nurse' ? 'Optional for Nurses' : 'Mandatory Department'}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    value={formData.equipmentName || ''}
                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Training Date</label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Trainer Name</label>
                  <input
                    type="text"
                    value={formData.trainerName || ''}
                    onChange={(e) => setFormData({ ...formData, trainerName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Training Topics & Operational Protocols Covered</label>
                <textarea
                  rows={2}
                  value={formData.trainingDetails || ''}
                  onChange={(e) => setFormData({ ...formData, trainingDetails: e.target.value })}
                  placeholder="Operational handling, alarm troubleshooting, infection control..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {moduleType === 'recall' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    value={formData.equipmentName || ''}
                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Asset ID</label>
                  <input
                    type="text"
                    value={formData.assetId || ''}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Recall Reference ID *</label>
                  <input
                    type="text"
                    value={formData.recallReference || ''}
                    onChange={(e) => setFormData({ ...formData, recallReference: e.target.value })}
                    placeholder="FDA / OEM Ref No"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Severity Classification</label>
                  <select
                    value={formData.severity || 'Class II (Moderate Risk)'}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as RecallSeverity })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="Class I (High Risk)">Class I (High Risk)</option>
                    <option value="Class II (Moderate Risk)">Class II (Moderate Risk)</option>
                    <option value="Class III (Low Risk)">Class III (Low Risk)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Required Action</label>
                  <select
                    value={formData.requiredAction || 'Repair'}
                    onChange={(e) => setFormData({ ...formData, requiredAction: e.target.value as RecallRequiredAction })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="Repair">Repair</option>
                    <option value="Replace">Replace</option>
                    <option value="Deactivate">Deactivate</option>
                    <option value="Software Upgrade">Software Upgrade</option>
                    <option value="Field Safety Notice">Field Safety Notice</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Recall Status</label>
                  <select
                    value={formData.status || 'Active Alert'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as RecallStatus })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    <option value="Active Alert">Active Alert</option>
                    <option value="Under Action">Under Action</option>
                    <option value="Resolved / Completed">Resolved / Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason for Recall *</label>
                <textarea
                  rows={2}
                  value={formData.recallReason || ''}
                  onChange={(e) => setFormData({ ...formData, recallReason: e.target.value })}
                  placeholder="Hazard description, defect details issued by manufacturer..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Action Taken by Hospital BME</label>
                <textarea
                  rows={2}
                  value={formData.actionTaken || ''}
                  onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
                  placeholder="Quarantine, firmware flashed, vendor parts installed..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* ATTACH SUPPORTING DOCUMENTS (SECTION 25) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-teal-600" />
                Attach Supporting Documentation ({docs.length})
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                >
                  <option value="Supporting Document">General Document</option>
                  <option value="Purchase & Tax Invoice">Invoice / PO</option>
                  <option value="Calibration Certificate">Calibration Certificate</option>
                  <option value="Preventive Maintenance Report">PM Job Sheet</option>
                  <option value="OEM Service Job Sheet">Service Report</option>
                  <option value="Gate Pass Document">Gate Pass Slip</option>
                  <option value="Condemnation Certificate">Condemnation Form</option>
                </select>
                <label className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg cursor-pointer flex items-center gap-1 font-semibold text-xs transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Uploading...' : 'Attach File'}</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Uploaded Docs Preview List */}
            {docs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                      <div className="truncate">
                        <div className="font-medium text-slate-800 truncate">{doc.name}</div>
                        <div className="text-[10px] text-slate-400">{doc.category} • {formatFileSize(doc.fileSize)}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() => {
                const identifier = (formData as any).assetId || (formData as any).poNumber || (formData as any).passNumber || 'Form';
                exportToCSV(`HBDMS_${moduleType}_${identifier}`, [formData]);
              }}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download current form details as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download Form (CSV)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
              >
                <Save className="w-4 h-4" />
                <span>{recordToEdit ? 'Save Changes' : 'Create Record'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
