export type ModuleType =
  | 'dashboard'
  | 'daily_rounds'
  | 'breakdown'
  | 'po_invoice_install'
  | 'master_asset'
  | 'preventive_maintenance'
  | 'calibration'
  | 'service_report'
  | 'gate_pass'
  | 'discarding'
  | 'handover'
  | 'user_training'
  | 'recall'
  | 'profile';

export interface User {
  id: string;
  name: string;
  designation: string;
  mobileNumber: string;
  email: string;
  hospitalName: string;
  passwordHash: string;
  createdAt: string;
}

export type UserProfile = Omit<User, 'passwordHash'>;

export interface SupportingDocument {
  id: string;
  name: string;
  fileType: string;
  fileSize: number; // in bytes
  uploadedAt: string;
  category: string;
  dataUrl?: string; // base64 or object URL
}

// 1. Daily Rounds Report
export interface DailyRoundsRecord {
  id: string;
  date: string;
  biomedicalEngineer: string;
  department: string;
  equipmentName: string;
  assetId?: string;
  equipmentCondition: 'Satisfactory' | 'Needs Attention' | 'Critical / Breakdown';
  observations: string;
  problemsIdentified: string;
  actionTaken: string;
  remarks: string;
  documents?: SupportingDocument[];
  createdAt: string;
  updatedAt: string;
}

// 2. Breakdown Register
export type BreakdownStatus = 'Open' | 'Under Service' | 'Completed';

export interface BreakdownRecord {
  id: string;
  equipmentName: string;
  assetId: string;
  serialNumber: string;
  department: string;
  breakdownDate: string;
  breakdownTime: string;
  problemDescription: string;
  assignedPerson: string;
  actionTaken: string;
  sparePartsUsed: string;
  downtimeHours: number;
  status: BreakdownStatus;
  remarks: string;
  documents?: SupportingDocument[];
  createdAt: string;
  updatedAt: string;
}

// 3. PO, Invoice & Installation
export interface POInvoiceInstallationRecord {
  id: string;
  // Purchase Order
  poNumber: string;
  poDate: string;
  vendor: string;
  equipmentName: string;
  model: string;
  quantity: number;
  cost: number;
  currency: string;
  
  // Invoice
  invoiceNumber: string;
  invoiceDate: string;
  invoiceVendor: string;
  invoiceAmount: number;
  warrantyDetails: string;
  
  // Installation
  assetId?: string;
  installationDate: string;
  installedBy: string;
  demonstrationStatus: 'Completed' | 'Pending' | 'Scheduled';
  installationInformation: string;
  department: string;
  
  documents?: SupportingDocument[];
  createdAt: string;
  updatedAt: string;
}

// 4. Master Asset Register
export type EquipmentStatus =
  | 'Operational'
  | 'Breakdown'
  | 'Under Maintenance'
  | 'Under Calibration'
  | 'Discarded';

export type EquipmentCategory =
  | 'Critical Care / Life Support'
  | 'Imaging & Radiology'
  | 'Diagnostic & Monitoring'
  | 'Surgical & OT Equipment'
  | 'Laboratory & Pathology'
  | 'Therapeutic & Dialysis'
  | 'Sterilization & CSSD'
  | 'General Hospital Equipment';

export interface MasterAssetRecord {
  id: string;
  assetId: string; // e.g. BME-ICU-001
  equipmentName: string;
  category: EquipmentCategory;
  manufacturerBrand: string;
  model: string;
  serialNumber: string;
  department: string;
  location: string; // Room / Bed / Floor
  purchaseDate: string;
  installationDate: string;
  purchaseCost: number;
  warrantyPeriodMonths: number;
  warrantyExpiryDate: string;
  amcCmcInfo: {
    type: 'Warranty' | 'AMC' | 'CMC' | 'None';
    provider: string;
    startDate: string;
    endDate: string;
    contactPerson?: string;
    contactNumber?: string;
  };
  equipmentStatus: EquipmentStatus;
  maintenanceInfo: string;
  calibrationInfo: string;
  lastPmDate?: string;
  nextPmDate?: string;
  lastCalibrationDate?: string;
  nextCalibrationDate?: string;
  documents?: SupportingDocument[];
  createdAt: string;
  updatedAt: string;
}

// 5. Preventive Maintenance Report
export type PMStatus = 'Pending' | 'Completed' | 'Overdue';

export interface PMChecklistItem {
  name: string;
  status: 'Pass' | 'Fail' | 'N/A';
}

export interface PreventiveMaintenanceRecord {
  id: string;
  equipmentName: string;
  assetId: string;
  department: string;
  pmDueDate: string;
  pmCompletionDate?: string;
  biomedicalEngineer: string;
  checklist: PMChecklistItem[];
  observations: string;
  partsReplaced: string;
  equipmentCondition: 'Good' | 'Fair' | 'Critical';
  nextPmDate: string;
  status: PMStatus;
  remarks: string;
  documents?: SupportingDocument[];
  createdAt: string;
  updatedAt: string;
}

// 6. Calibration Report
export type CalibrationResult = 'Passed' | 'Failed' | 'Tolerable / Conditional';

export interface CalibrationRecord {
  id: string;
  equipmentName: string;
  assetId: string;
  serialNumber: string;
  department: string;
  calibrationDate: string;
  calibrationAgencyPerson: string;
  calibrationResult: CalibrationResult;
  certificateInformation: string;
  certificateNumber: string;
  nextCalibrationDueDate: string;
  remarks: string;
  documents?: SupportingDocument[];
  createdAt: string;
  updatedAt: string;
}

// 7. Service Report
export interface ServiceRecord {
  id: string;
  equipmentName: string;
  assetId: string;
  department: string;
  complaint: string;
  serviceDate: string;
  serviceProvider: string; // In-house / OEM (GE, Philips, Siemens, etc.) / 3rd Party
  problemIdentified: string;
  actionPerformed: string;
  partsReplaced: string;
  serviceCost: number;
  completionDate: string;
  remarks: string;
  documents?: SupportingDocument[];
  createdAt: string;
  updatedAt: string;
}

// 8. Gate Pass – RGP & NRGP
export type GatePassType = 'RGP' | 'NRGP';
export type RGPStatus = 'Pending Return' | 'Returned' | 'Overdue';

export interface GatePassRecord {
  id: string;
  passType: GatePassType;
  passNumber: string; // e.g. GP-2026-001
  equipmentName: string;
  assetId: string;
  serialNumber?: string;
  department: string;
  recipientVendor: string;
  reason: string;
  dateSent: string;
  // RGP specific
  expectedReturnDate?: string;
  actualReturnDate?: string;
  transportDetails?: string;
  returnStatus?: RGPStatus;
  // NRGP specific
  supportingInformation?: string;
  authorizedBy: string;
  documents?: SupportingDocument[];
  createdAt: string;
  updatedAt: string;
}

// 9. Discarding of Equipment Report
export type DisposalMethod =
  | 'Scrap Auction'
  | 'Authorized E-Waste Handler'
  | 'Hazardous Bio-Medical Disposal'
  | 'Return to Manufacturer / Trade-in'
  | 'Spare Parts Cannibalization';

export interface DiscardingRecord {
  id: string;
  equipmentName: string;
  assetId: string;
  serialNumber: string;
  department: string;
  equipmentCondition: string;
  reasonForDiscarding: string; // Beyond Economical Repair, End of Life, Obsolete, Damaged
  bmeAssessment: string;
  disposalMethod: DisposalMethod;
  disposalDate: string;
  vendorScrapDetails: string;
  scrapAmountReceived?: number;
  remarks: string;
  documents?: SupportingDocument[];
  createdAt: string;
  updatedAt: string;
}

// 10. Handover Register
export interface HandoverRecord {
  id: string;
  equipmentName: string;
  assetId: string;
  serialNumber?: string;
  fromDepartment: string;
  toDepartment: string;
  handoverDate: string;
  equipmentCondition: string;
  personHandingOver: string;
  personReceiving: string;
  remarks: string;
  acknowledgement: 'Acknowledged & Received' | 'Pending Acknowledgement';
  documents?: SupportingDocument[];
  createdAt: string;
  updatedAt: string;
}

// 11. User Training Register
export type TraineeDesignation =
  | 'Nurse'
  | 'Doctor / Consultant'
  | 'Medical Officer'
  | 'OT / Radiology Technician'
  | 'Dialysis Operator'
  | 'Biomedical Intern / Trainee'
  | 'Other Clinical Staff';

export interface UserTrainingRecord {
  id: string;
  traineeName: string;
  designation: TraineeDesignation;
  department?: string; // Optional if Nurse, mandatory for others
  date: string;
  equipmentName: string;
  assetId?: string;
  trainerName: string;
  trainingDetails: string; // Operational Handling, Safety Protocols, Alarms & Error Codes, Cleaning
  remarks: string;
  acknowledgement: 'Completed & Certified' | 'Attended';
  documents?: SupportingDocument[];
  createdAt: string;
  updatedAt: string;
}

// 12. Medical Equipment Recall
export type RecallRequiredAction = 'Repair' | 'Replace' | 'Deactivate' | 'Software Upgrade' | 'Field Safety Notice';
export type RecallStatus = 'Active Alert' | 'Under Action' | 'Resolved / Completed';
export type RecallSeverity = 'Class I (High Risk)' | 'Class II (Moderate Risk)' | 'Class III (Low Risk)';

export interface RecallRecord {
  id: string;
  equipmentName: string;
  assetId: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  recallDate: string;
  recallReason: string;
  recallReference: string; // FDA / CDSCO / OEM Ref No
  severity: RecallSeverity;
  requiredAction: RecallRequiredAction;
  actionTaken: string;
  status: RecallStatus;
  remarks: string;
  documents?: SupportingDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface AppStateData {
  dailyRounds: DailyRoundsRecord[];
  breakdowns: BreakdownRecord[];
  poInvoices: POInvoiceInstallationRecord[];
  masterAssets: MasterAssetRecord[];
  preventiveMaintenances: PreventiveMaintenanceRecord[];
  calibrations: CalibrationRecord[];
  serviceReports: ServiceRecord[];
  gatePasses: GatePassRecord[];
  discardingReports: DiscardingRecord[];
  handovers: HandoverRecord[];
  userTrainings: UserTrainingRecord[];
  recalls: RecallRecord[];
}
