import {
  AppStateData,
  DailyRoundsRecord,
  BreakdownRecord,
  POInvoiceInstallationRecord,
  MasterAssetRecord,
  PreventiveMaintenanceRecord,
  CalibrationRecord,
  ServiceRecord,
  GatePassRecord,
  DiscardingRecord,
  HandoverRecord,
  UserTrainingRecord,
  RecallRecord,
  SupportingDocument,
} from '../types';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  MODULE_TABLE_MAP,
} from '../lib/supabase';

const DEMO_STORAGE_KEY = 'hbdms_app_data_demo_v2';
const EMPTY_DATA: AppStateData = {
  dailyRounds: [],
  breakdowns: [],
  poInvoices: [],
  masterAssets: [],
  preventiveMaintenances: [],
  calibrations: [],
  serviceReports: [],
  gatePasses: [],
  discardingReports: [],
  handovers: [],
  userTrainings: [],
  recalls: [],
};

export const INITIAL_DOCUMENTS: Record<string, SupportingDocument[]> = {
  pmCert: [
    {
      id: 'doc-pm-1',
      name: 'PM_Checklist_Report_ServoU_Signed.pdf',
      fileType: 'application/pdf',
      fileSize: 420000,
      uploadedAt: '2026-08-20T10:30:00Z',
      category: 'Preventive Maintenance Report',
    },
  ],
  calibCert: [
    {
      id: 'doc-calib-1',
      name: 'NABL_Calibration_Certificate_Zoll_2026.pdf',
      fileType: 'application/pdf',
      fileSize: 850000,
      uploadedAt: '2026-07-15T14:15:00Z',
      category: 'Calibration Certificate',
    },
  ],
  invoiceDoc: [
    {
      id: 'doc-inv-1',
      name: 'Tax_Invoice_Philips_MX750_INV-9823.pdf',
      fileType: 'application/pdf',
      fileSize: 310000,
      uploadedAt: '2026-03-10T09:00:00Z',
      category: 'Purchase & Tax Invoice',
    },
  ],
  serviceReportDoc: [
    {
      id: 'doc-srv-1',
      name: 'Dräger_OEM_Service_Field_Report_6641.pdf',
      fileType: 'application/pdf',
      fileSize: 520000,
      uploadedAt: '2026-08-12T16:45:00Z',
      category: 'OEM Service Job Sheet',
    },
  ],
  recallDoc: [
    {
      id: 'doc-rec-1',
      name: 'Urgent_Medical_Device_Correction_Notice_Medtronic.pdf',
      fileType: 'application/pdf',
      fileSize: 640000,
      uploadedAt: '2026-08-28T11:20:00Z',
      category: 'Field Safety Notice',
    },
  ],
};

const SEED_DATA: AppStateData = {
  masterAssets: [
    {
      id: 'ast-1',
      assetId: 'BME-ICU-001',
      equipmentName: 'ICU Ventilator Servo-u',
      category: 'Critical Care / Life Support',
      manufacturerBrand: 'Getinge / Maquet',
      model: 'Servo-u v4.2',
      serialNumber: 'SN-MQ-904128',
      department: 'Intensive Care Unit (ICU)',
      location: 'ICU Bed 04 - 2nd Floor East Wing',
      purchaseDate: '2024-04-15',
      installationDate: '2024-04-20',
      purchaseCost: 32000,
      warrantyPeriodMonths: 24,
      warrantyExpiryDate: '2026-04-20',
      amcCmcInfo: {
        type: 'CMC',
        provider: 'Getinge Healthcare Services',
        startDate: '2026-04-21',
        endDate: '2028-04-20',
        contactPerson: 'Rahul Sen (Regional Lead)',
        contactNumber: '+91 98450 11234',
      },
      equipmentStatus: 'Operational',
      maintenanceInfo: 'Quarterly PM required (Q1/Q2/Q3/Q4). Oxygen sensor replaced in March 2026.',
      calibrationInfo: 'Flow sensor and pressure transducer calibrated every 6 months.',
      lastPmDate: '2026-07-15',
      nextPmDate: '2026-10-15',
      lastCalibrationDate: '2026-05-10',
      nextCalibrationDate: '2026-11-10',
      documents: INITIAL_DOCUMENTS.pmCert,
      createdAt: '2024-04-20T10:00:00Z',
      updatedAt: '2026-08-20T10:30:00Z',
    },
    {
      id: 'ast-2',
      assetId: 'BME-EMERG-002',
      equipmentName: 'Biphasic Defibrillator / Monitor',
      category: 'Critical Care / Life Support',
      manufacturerBrand: 'Zoll Medical',
      model: 'R Series Plus',
      serialNumber: 'SN-ZL-773819',
      department: 'Emergency & Trauma (ER)',
      location: 'Crash Cart 01 - ER Resuscitation Bay',
      purchaseDate: '2023-11-10',
      installationDate: '2023-11-15',
      purchaseCost: 14500,
      warrantyPeriodMonths: 36,
      warrantyExpiryDate: '2026-11-15',
      amcCmcInfo: {
        type: 'Warranty',
        provider: 'Zoll India Direct Support',
        startDate: '2023-11-15',
        endDate: '2026-11-15',
        contactPerson: 'Sunil Verma',
        contactNumber: '+91 98110 54321',
      },
      equipmentStatus: 'Operational',
      maintenanceInfo: 'Daily automated self-test enabled. Battery capacity check due bi-annually.',
      calibrationInfo: 'Joules energy output discharge calibration valid till Oct 2026.',
      lastPmDate: '2026-06-20',
      nextPmDate: '2026-09-20',
      lastCalibrationDate: '2025-10-04',
      nextCalibrationDate: '2026-10-04',
      documents: INITIAL_DOCUMENTS.calibCert,
      createdAt: '2023-11-15T09:00:00Z',
      updatedAt: '2026-07-15T14:15:00Z',
    },
    {
      id: 'ast-3',
      assetId: 'BME-OT-003',
      equipmentName: 'Anesthesia Workstation',
      category: 'Surgical & OT Equipment',
      manufacturerBrand: 'Dräger Medical',
      model: 'Fabius Plus XL',
      serialNumber: 'SN-DR-448201',
      department: 'Operation Theatre (OT Complex)',
      location: 'Modular OT 2 (Cardiac)',
      purchaseDate: '2022-08-01',
      installationDate: '2022-08-10',
      purchaseCost: 48000,
      warrantyPeriodMonths: 24,
      warrantyExpiryDate: '2024-08-10',
      amcCmcInfo: {
        type: 'CMC',
        provider: 'Dräger Comprehensive Care',
        startDate: '2024-08-11',
        endDate: '2027-08-10',
        contactPerson: 'David Joseph',
        contactNumber: '+91 97400 66789',
      },
      equipmentStatus: 'Under Maintenance',
      maintenanceInfo: 'Vaporizer interlocking mechanism inspection and breathing circuit leak test.',
      calibrationInfo: 'Sevoflurane and Isoflurane vaporizer concentration test annual.',
      lastPmDate: '2026-05-18',
      nextPmDate: '2026-08-18',
      lastCalibrationDate: '2026-02-14',
      nextCalibrationDate: '2027-02-14',
      documents: INITIAL_DOCUMENTS.serviceReportDoc,
      createdAt: '2022-08-10T12:00:00Z',
      updatedAt: '2026-08-25T11:00:00Z',
    },
    {
      id: 'ast-4',
      assetId: 'BME-RAD-004',
      equipmentName: 'Mobile C-Arm Fluoroscopy System',
      category: 'Imaging & Radiology',
      manufacturerBrand: 'Siemens Healthineers',
      model: 'Cios Select',
      serialNumber: 'SN-SM-109283',
      department: 'Radiology & Imaging',
      location: 'OT Complex / Orthopedic OT 4',
      purchaseDate: '2024-01-12',
      installationDate: '2024-01-25',
      purchaseCost: 68000,
      warrantyPeriodMonths: 36,
      warrantyExpiryDate: '2027-01-25',
      amcCmcInfo: {
        type: 'Warranty',
        provider: 'Siemens Customer Service',
        startDate: '2024-01-25',
        endDate: '2027-01-25',
        contactPerson: 'Pooja Nair',
        contactNumber: '+91 99200 44321',
      },
      equipmentStatus: 'Operational',
      maintenanceInfo: 'AERB compliance checks and High-Tension cable lubrication.',
      calibrationInfo: 'Radiation output, kVp and mAs accuracy calibration done bi-annually.',
      lastPmDate: '2026-06-10',
      nextPmDate: '2026-12-10',
      lastCalibrationDate: '2026-06-12',
      nextCalibrationDate: '2026-12-12',
      createdAt: '2024-01-25T14:30:00Z',
      updatedAt: '2026-06-12T16:00:00Z',
    },
    {
      id: 'ast-5',
      assetId: 'BME-DIAL-005',
      equipmentName: 'Hemodialysis Machine',
      category: 'Therapeutic & Dialysis',
      manufacturerBrand: 'Fresenius Medical Care',
      model: '4008S Classic',
      serialNumber: 'SN-FM-554109',
      department: 'Dialysis Unit',
      location: 'Dialysis Station 03 - 1st Floor',
      purchaseDate: '2023-05-10',
      installationDate: '2023-05-20',
      purchaseCost: 18500,
      warrantyPeriodMonths: 24,
      warrantyExpiryDate: '2025-05-20',
      amcCmcInfo: {
        type: 'AMC',
        provider: 'Renal Care Tech Solutions',
        startDate: '2025-05-21',
        endDate: '2027-05-20',
        contactPerson: 'Karan Sharma',
        contactNumber: '+91 98220 99887',
      },
      equipmentStatus: 'Breakdown',
      maintenanceInfo: 'Ultrafiltration pump calibration and de-calcification sanitization schedule.',
      calibrationInfo: 'Conductivity and temperature sensor calibration.',
      lastPmDate: '2026-04-10',
      nextPmDate: '2026-07-10',
      lastCalibrationDate: '2025-11-20',
      nextCalibrationDate: '2026-11-20',
      createdAt: '2023-05-20T11:00:00Z',
      updatedAt: '2026-08-30T09:15:00Z',
    },
    {
      id: 'ast-6',
      assetId: 'BME-NICU-006',
      equipmentName: 'Neonatal Radiant Warmer with Phototherapy',
      category: 'Critical Care / Life Support',
      manufacturerBrand: 'GE Healthcare',
      model: 'Lullaby Warmer Prime',
      serialNumber: 'SN-GE-662914',
      department: 'Neonatal ICU (NICU)',
      location: 'NICU Pod B - 3rd Floor',
      purchaseDate: '2024-02-14',
      installationDate: '2024-02-22',
      purchaseCost: 9200,
      warrantyPeriodMonths: 24,
      warrantyExpiryDate: '2026-02-22',
      amcCmcInfo: {
        type: 'Warranty',
        provider: 'Wipro GE Healthcare',
        startDate: '2024-02-22',
        endDate: '2026-02-22',
        contactPerson: 'Amitabh Basu',
        contactNumber: '+91 98300 77123',
      },
      equipmentStatus: 'Under Calibration',
      maintenanceInfo: 'Skin temperature probe calibration and quartz heater element inspection.',
      calibrationInfo: 'Irradiance measurement for phototherapy LEDs and temperature accuracy.',
      lastPmDate: '2026-05-02',
      nextPmDate: '2026-11-02',
      lastCalibrationDate: '2025-08-15',
      nextCalibrationDate: '2026-08-15',
      createdAt: '2024-02-22T10:00:00Z',
      updatedAt: '2026-08-29T15:00:00Z',
    },
    {
      id: 'ast-7',
      assetId: 'BME-OT-007',
      equipmentName: 'Electrosurgical Unit (Cautery)',
      category: 'Surgical & OT Equipment',
      manufacturerBrand: 'Medtronic / Valleylab',
      model: 'FT10 Energy Platform',
      serialNumber: 'SN-VL-339811',
      department: 'Operation Theatre (OT Complex)',
      location: 'General Surgery OT 1',
      purchaseDate: '2023-09-05',
      installationDate: '2023-09-12',
      purchaseCost: 26000,
      warrantyPeriodMonths: 36,
      warrantyExpiryDate: '2026-09-12',
      amcCmcInfo: {
        type: 'Warranty',
        provider: 'Medtronic India Private Limited',
        startDate: '2023-09-12',
        endDate: '2026-09-12',
        contactPerson: 'Anjali Menon',
        contactNumber: '+91 98400 22334',
      },
      equipmentStatus: 'Operational',
      maintenanceInfo: 'Monopolar / Bipolar RF output calibration and Return Electrode Monitoring (REM) check.',
      calibrationInfo: 'High frequency RF leakage and power output test at standard loads (100Ω/300Ω/500Ω).',
      lastPmDate: '2026-06-18',
      nextPmDate: '2026-09-18',
      lastCalibrationDate: '2025-12-05',
      nextCalibrationDate: '2026-12-05',
      documents: INITIAL_DOCUMENTS.recallDoc,
      createdAt: '2023-09-12T13:00:00Z',
      updatedAt: '2026-08-28T11:20:00Z',
    },
    {
      id: 'ast-8',
      assetId: 'BME-GEN-008',
      equipmentName: 'High Vacuum Mobile Suction Machine',
      category: 'General Hospital Equipment',
      manufacturerBrand: 'Anand Medical',
      model: 'Vac-Pro 500',
      serialNumber: 'SN-AM-112004',
      department: 'General Ward - 4th Floor',
      location: 'Equipment Storage Bay B',
      purchaseDate: '2016-03-10',
      installationDate: '2016-03-15',
      purchaseCost: 1800,
      warrantyPeriodMonths: 12,
      warrantyExpiryDate: '2017-03-15',
      amcCmcInfo: {
        type: 'None',
        provider: 'N/A',
        startDate: '',
        endDate: '',
      },
      equipmentStatus: 'Discarded',
      maintenanceInfo: 'Condemned due to motor seizure and excessive mechanical wear. Replaced with new unit.',
      calibrationInfo: 'Vacuum gauge zero error verification.',
      lastPmDate: '2025-01-10',
      nextPmDate: '2025-07-10',
      lastCalibrationDate: '2024-06-10',
      nextCalibrationDate: '2025-06-10',
      createdAt: '2016-03-15T09:00:00Z',
      updatedAt: '2026-08-10T11:00:00Z',
    },
  ],
  dailyRounds: [
    {
      id: 'dr-1',
      date: '2026-09-01',
      biomedicalEngineer: 'Alex Morgan, Lead BME',
      department: 'Intensive Care Unit (ICU)',
      equipmentName: 'ICU Ventilator Servo-u (BME-ICU-001)',
      assetId: 'BME-ICU-001',
      equipmentCondition: 'Satisfactory',
      observations: 'All alarms audible, O2 cell displaying 99.8% at FiO2 1.0, battery backup tested OK (4.5 hrs).',
      problemsIdentified: 'None. Humidifier temperature probe seated properly.',
      actionTaken: 'Routine parameter logging and physical wipe-down verified.',
      remarks: 'Operational in ICU Bed 04.',
      createdAt: '2026-09-01T08:30:00Z',
      updatedAt: '2026-09-01T08:30:00Z',
    },
    {
      id: 'dr-2',
      date: '2026-09-01',
      biomedicalEngineer: 'Sarah Chen, Assistant BME',
      department: 'Emergency & Trauma (ER)',
      equipmentName: 'Biphasic Defibrillator (BME-EMERG-002)',
      assetId: 'BME-EMERG-002',
      equipmentCondition: 'Satisfactory',
      observations: 'Passed 30J self-test printout. Adult/Pediatric multifunction pads in stock with validity till 2027.',
      problemsIdentified: 'ECG lead cable clip slightly loose on Lead II.',
      actionTaken: 'Tightened strain relief connector and confirmed crisp ECG trace on rhythm simulator.',
      remarks: 'Ready for emergency resuscitation.',
      createdAt: '2026-09-01T09:15:00Z',
      updatedAt: '2026-09-01T09:15:00Z',
    },
    {
      id: 'dr-3',
      date: '2026-08-31',
      biomedicalEngineer: 'Alex Morgan, Lead BME',
      department: 'Dialysis Unit',
      equipmentName: 'Hemodialysis Machine (BME-DIAL-005)',
      assetId: 'BME-DIAL-005',
      equipmentCondition: 'Critical / Breakdown',
      observations: 'Machine giving recurrent Conductivity Alarm (Cond. Error E-24) during priming phase.',
      problemsIdentified: 'Proportioning valve solenoid sticking; temperature fluctuation detected at 38.8°C.',
      actionTaken: 'Tagged out of service with Red Breakdown Tag. Escalated to Fresenius OEM field team.',
      remarks: 'Dialysis shifted to back-up Station 06.',
      createdAt: '2026-08-31T09:00:00Z',
      updatedAt: '2026-08-31T09:00:00Z',
    },
    {
      id: 'dr-4',
      date: '2026-08-31',
      biomedicalEngineer: 'Sarah Chen, Assistant BME',
      department: 'Operation Theatre (OT Complex)',
      equipmentName: 'Anesthesia Workstation (BME-OT-003)',
      assetId: 'BME-OT-003',
      equipmentCondition: 'Needs Attention',
      observations: 'Slight bellows resistance during manual ventilation mode.',
      problemsIdentified: 'Expiratory valve diaphragm seated with condensation residue.',
      actionTaken: 'Cleaned expiratory cassette and performed high-pressure leak check.',
      remarks: 'Scheduled for detailed preventive maintenance inspection.',
      createdAt: '2026-08-31T11:00:00Z',
      updatedAt: '2026-08-31T11:00:00Z',
    },
  ],
  breakdowns: [
    {
      id: 'bd-1',
      equipmentName: 'Hemodialysis Machine Fresenius 4008S',
      assetId: 'BME-DIAL-005',
      serialNumber: 'SN-FM-554109',
      department: 'Dialysis Unit',
      breakdownDate: '2026-08-30',
      breakdownTime: '08:45 AM',
      problemDescription: 'Conductivity alarm threshold violated during priming cycle. Acid concentrate suction pump not pulling requisite ratio.',
      assignedPerson: 'Sarah Chen & Fresenius OEM Service Team',
      actionTaken: 'Disassembled hydraulic block, cleaned deaeration chamber, identified leaking O-ring seal and solenoid valve 24 failure.',
      sparePartsUsed: 'Hydraulic Seal Kit (Part #673109), Solenoid Valve Block 24V DC (Part #548902)',
      downtimeHours: 28,
      status: 'Under Service',
      remarks: 'Replacement valve arriving from Bangalore regional warehouse today.',
      createdAt: '2026-08-30T09:00:00Z',
      updatedAt: '2026-08-31T17:00:00Z',
    },
    {
      id: 'bd-2',
      equipmentName: '12-Lead Diagnostic ECG Machine',
      assetId: 'BME-CARD-010',
      serialNumber: 'SN-GE-991204',
      department: 'Cardiology OPD',
      breakdownDate: '2026-08-25',
      breakdownTime: '11:15 AM',
      problemDescription: 'Thermal printer mechanism paper jam and faint baseline distortion on precordial chest leads V1-V3.',
      assignedPerson: 'Alex Morgan, Lead BME',
      actionTaken: 'Replaced 10-lead patient patient trunk cable assembly, aligned thermal printhead and adjusted print contrast potentiometer.',
      sparePartsUsed: '10-Lead AHA Patient Cable with 4mm banana plugs, Thermal roller assembly',
      downtimeHours: 4.5,
      status: 'Completed',
      remarks: 'Simulated 12-lead standard rhythm printed clearly. Re-commissioned to Cardiology OPD.',
      createdAt: '2026-08-25T11:30:00Z',
      updatedAt: '2026-08-25T16:00:00Z',
    },
    {
      id: 'bd-3',
      equipmentName: 'Syringe Infusion Pump Space',
      assetId: 'BME-ICU-012',
      serialNumber: 'SN-BB-881903',
      department: 'Intensive Care Unit (ICU)',
      breakdownDate: '2026-09-01',
      breakdownTime: '07:30 AM',
      problemDescription: 'Plunger clasp mechanism sensor giving "Syringe Barrel Size Unrecognized" error for standard 50ml BD syringes.',
      assignedPerson: 'Sarah Chen, Assistant BME',
      actionTaken: 'Under initial triage at BME Bio-electronic workshop. Optical potentiometer test in progress.',
      sparePartsUsed: 'Pending diagnostics',
      downtimeHours: 3.5,
      status: 'Open',
      remarks: 'Backup syringe pump issued to ICU Bed 08.',
      createdAt: '2026-09-01T07:45:00Z',
      updatedAt: '2026-09-01T07:45:00Z',
    },
  ],
  poInvoices: [
    {
      id: 'poi-1',
      poNumber: 'PO-2026-BME-089',
      poDate: '2026-02-15',
      vendor: 'Philips Healthcare India Pvt Ltd',
      equipmentName: 'IntelliVue MX750 Patient Monitor with Multi-Measurement Module',
      model: 'IntelliVue MX750',
      quantity: 4,
      cost: 42000,
      currency: 'USD',
      invoiceNumber: 'INV-PH-2026-9823',
      invoiceDate: '2026-03-08',
      invoiceVendor: 'Philips Healthcare India Pvt Ltd',
      invoiceAmount: 42000,
      warrantyDetails: '36 Months Comprehensive OEM Warranty including NIBP, SpO2, and IBP modules.',
      assetId: 'BME-ICU-009',
      installationDate: '2026-03-12',
      installedBy: 'Ramesh Kulkarni (Philips Certified Field Specialist)',
      demonstrationStatus: 'Completed',
      installationInformation: 'Installed at ICU Beds 01-04 with Central Monitoring Station LAN integration.',
      department: 'Intensive Care Unit (ICU)',
      documents: INITIAL_DOCUMENTS.invoiceDoc,
      createdAt: '2026-03-12T15:00:00Z',
      updatedAt: '2026-03-12T15:00:00Z',
    },
    {
      id: 'poi-2',
      poNumber: 'PO-2026-BME-104',
      poDate: '2026-07-20',
      vendor: 'Stryker Global Medical Systems',
      equipmentName: 'System 8 Precision Orthopedic Surgical Power Tools Set',
      model: 'System 8 Dual Trigger',
      quantity: 2,
      cost: 31500,
      currency: 'USD',
      invoiceNumber: 'INV-STRY-77190',
      invoiceDate: '2026-08-10',
      invoiceVendor: 'Stryker Global Medical Systems',
      invoiceAmount: 31500,
      warrantyDetails: '24 Months Warranty covering handpieces, batteries, and autoclave chargers.',
      assetId: 'BME-OT-015',
      installationDate: '2026-08-18',
      installedBy: 'Vikram Singh (Senior Application Specialist, Stryker)',
      demonstrationStatus: 'Completed',
      installationInformation: 'Autoclave compatibility verified in CSSD; sterile protocol handover completed to OT Staff.',
      department: 'Operation Theatre (OT Complex)',
      createdAt: '2026-08-18T14:00:00Z',
      updatedAt: '2026-08-18T14:00:00Z',
    },
  ],
  preventiveMaintenances: [
    {
      id: 'pm-1',
      equipmentName: 'ICU Ventilator Servo-u',
      assetId: 'BME-ICU-001',
      department: 'Intensive Care Unit (ICU)',
      pmDueDate: '2026-07-15',
      pmCompletionDate: '2026-07-15',
      biomedicalEngineer: 'Alex Morgan, Lead BME',
      checklist: [
        { name: 'Electrical Safety Analyzer (IEC 60601-1 Leakage & Earth Bond)', status: 'Pass' },
        { name: 'Internal Lithium-ion Backup Battery Charge/Discharge Test', status: 'Pass' },
        { name: 'O2 & Medical Air High-Pressure Gas Inlet Filter Inspection', status: 'Pass' },
        { name: 'Inspiratory/Expiratory Ultrasonic Flow Transducer Calibration', status: 'Pass' },
        { name: 'Acoustic Alarm Volume & Optical Flashing LED Verification', status: 'Pass' },
      ],
      observations: 'All test parameters within OEM specified tolerances. Internal dust filter replaced.',
      partsReplaced: 'HEPA Bacteria Filter (Part #64281), Expiratory Cassette Membrane',
      equipmentCondition: 'Good',
      nextPmDate: '2026-10-15',
      status: 'Completed',
      remarks: 'Equipment certified for high-acuity ICU ventilation.',
      documents: INITIAL_DOCUMENTS.pmCert,
      createdAt: '2026-07-15T11:00:00Z',
      updatedAt: '2026-07-15T11:00:00Z',
    },
    {
      id: 'pm-2',
      equipmentName: 'Biphasic Defibrillator / Monitor',
      assetId: 'BME-EMERG-002',
      department: 'Emergency & Trauma (ER)',
      pmDueDate: '2026-09-20',
      biomedicalEngineer: 'Sarah Chen, Assistant BME',
      checklist: [
        { name: 'Pacing Pulse Output and Rate Verification', status: 'Pass' },
        { name: 'Shock Discharge Energy Accuracy (5J to 200J into 50Ω load)', status: 'Pass' },
        { name: 'Chassis Earth Resistance & Enclosure Leakage Test', status: 'Pass' },
        { name: 'Strip Chart Thermal Recorder Speed & Contrast Check', status: 'Pass' },
      ],
      observations: 'Upcoming scheduled quarterly preventive maintenance cycle.',
      partsReplaced: 'None planned',
      equipmentCondition: 'Good',
      nextPmDate: '2026-12-20',
      status: 'Pending',
      remarks: 'Scheduled for ER maintenance window during low patient load.',
      createdAt: '2026-08-20T10:00:00Z',
      updatedAt: '2026-08-20T10:00:00Z',
    },
    {
      id: 'pm-3',
      equipmentName: 'Anesthesia Workstation Fabius Plus XL',
      assetId: 'BME-OT-003',
      department: 'Operation Theatre (OT Complex)',
      pmDueDate: '2026-08-18',
      biomedicalEngineer: 'Alex Morgan, Lead BME',
      checklist: [
        { name: 'Piston Ventilator Compliance & Tidal Volume Precision', status: 'Fail' },
        { name: 'Anesthetic Vaporizer Mount Interlock Safety Mechanism', status: 'Pass' },
        { name: 'High-Pressure Pipeline O2/N2O/Air Pressure Transducers', status: 'Pass' },
        { name: 'Scavenging System Flow Rate & Vacuum Relief Valve', status: 'Pass' },
      ],
      observations: 'PM is overdue by 14 days due to heavy OT cardiac case schedule. Tidal volume variance noticed at low flows.',
      partsReplaced: 'Piston Seal Ring & O-Rings Kit',
      equipmentCondition: 'Critical',
      nextPmDate: '2026-11-18',
      status: 'Overdue',
      remarks: 'OT Manager requested urgent slot on Saturday for full overhaul.',
      createdAt: '2026-08-18T09:00:00Z',
      updatedAt: '2026-09-01T08:00:00Z',
    },
  ],
  calibrations: [
    {
      id: 'cal-1',
      equipmentName: 'Biphasic Defibrillator / Monitor Zoll R Series',
      assetId: 'BME-EMERG-002',
      serialNumber: 'SN-ZL-773819',
      department: 'Emergency & Trauma (ER)',
      calibrationDate: '2025-10-04',
      calibrationAgencyPerson: 'Fluke Biomedical Certified Standards Lab (National Calibration Services)',
      calibrationResult: 'Passed',
      certificateInformation: 'Calibrated using Fluke Impulse 7000DP Defibrillator Analyzer. Energy discharge tested at 10J, 50J, 100J, 150J, 200J within ±1.5% deviation.',
      certificateNumber: 'NCS-CAL-DEF-2025-8831',
      nextCalibrationDueDate: '2026-10-04',
      remarks: 'Valid for clinical use. Calibration sticker placed on top housing.',
      documents: INITIAL_DOCUMENTS.calibCert,
      createdAt: '2025-10-04T16:00:00Z',
      updatedAt: '2026-07-15T14:15:00Z',
    },
    {
      id: 'cal-2',
      equipmentName: 'Mobile C-Arm Fluoroscopy System Siemens Cios Select',
      assetId: 'BME-RAD-004',
      serialNumber: 'SN-SM-109283',
      department: 'Radiology & Imaging',
      calibrationDate: '2026-06-12',
      calibrationAgencyPerson: 'Atomic Energy Regulatory Board (AERB) Accredited QA Agency - RadCheck Labs',
      calibrationResult: 'Passed',
      certificateInformation: 'kVp accuracy (tested at 40, 60, 80, 100, 110 kVp), Timer linearity, Collimator alignment <1.2%, Half Value Layer (HVL) 3.1mm Al equivalent.',
      certificateNumber: 'AERB-QA-RCHECK-2026-0192',
      nextCalibrationDueDate: '2026-12-12',
      remarks: 'Complies with all statutory radiation safety guidelines.',
      createdAt: '2026-06-12T14:00:00Z',
      updatedAt: '2026-06-12T14:00:00Z',
    },
    {
      id: 'cal-3',
      equipmentName: 'Neonatal Radiant Warmer with Phototherapy',
      assetId: 'BME-NICU-006',
      serialNumber: 'SN-GE-662914',
      department: 'Neonatal ICU (NICU)',
      calibrationDate: '2025-08-15',
      calibrationAgencyPerson: 'In-House BME Standards Metrology Cell',
      calibrationResult: 'Tolerable / Conditional',
      certificateInformation: 'Skin temperature thermistor sensor probe variance of +0.4°C detected against secondary precision reference probe.',
      certificateNumber: 'BME-INTERNAL-CAL-2025-048',
      nextCalibrationDueDate: '2026-08-15',
      remarks: 'Re-calibration required immediately with new OEM thermistor probe.',
      createdAt: '2025-08-15T11:00:00Z',
      updatedAt: '2026-08-29T15:00:00Z',
    },
  ],
  serviceReports: [
    {
      id: 'srv-1',
      equipmentName: 'Anesthesia Workstation Fabius Plus XL',
      assetId: 'BME-OT-003',
      department: 'Operation Theatre (OT Complex)',
      complaint: 'Vaporizer concentration dial stiff; audible minor leak from PEEP control diaphragm block.',
      serviceDate: '2026-08-25',
      serviceProvider: 'Dräger Medical OEM Service (Senior Tech: David Joseph)',
      problemIdentified: 'Worn silicone seal on PEEP control circuit; vaporizer manifold O-rings dry and degraded.',
      actionPerformed: 'Replaced PEEP valve assembly, lubricated vaporizer manifold manifold bar with medical-grade perfluoropolyether grease, completed pressure decay leak test.',
      partsReplaced: 'PEEP Valve Assembly (Part #8410182), O-Ring Service Kit (Part #M23801)',
      serviceCost: 850,
      completionDate: '2026-08-26',
      remarks: 'System passed post-service diagnostic safety self-check. 6 months service warranty granted.',
      documents: INITIAL_DOCUMENTS.serviceReportDoc,
      createdAt: '2026-08-26T17:00:00Z',
      updatedAt: '2026-08-26T17:00:00Z',
    },
    {
      id: 'srv-2',
      equipmentName: 'ICU Patient Multi-Parameter Monitor',
      assetId: 'BME-ICU-011',
      department: 'Intensive Care Unit (ICU)',
      complaint: 'Non-Invasive Blood Pressure (NIBP) cuff pump repeatedly displaying "Pump Timeout / Cuff Leak".',
      serviceDate: '2026-08-10',
      serviceProvider: 'In-House Biomedical Engineering Dept (Alex Morgan)',
      problemIdentified: 'Pneumatic air connector internal female quick-disconnect latch cracked; internal bladder micro-tear.',
      actionPerformed: 'Installed new OEM quick-connect fitting, replaced pneumatic sub-manifold hose and verified with adult test cuff simulator at 120/80 mmHg.',
      partsReplaced: 'NIBP Metal Quick Connector Bayonet (Part #M1599B)',
      serviceCost: 45,
      completionDate: '2026-08-10',
      remarks: 'In-house repair completed in 2.5 hours.',
      createdAt: '2026-08-10T16:00:00Z',
      updatedAt: '2026-08-10T16:00:00Z',
    },
  ],
  gatePasses: [
    {
      id: 'gp-1',
      passType: 'RGP',
      passNumber: 'GP-2026-RGP-042',
      equipmentName: 'Hemodialysis Machine Solenoid Module',
      assetId: 'BME-DIAL-005',
      serialNumber: 'SN-FM-554109',
      department: 'Dialysis Unit',
      recipientVendor: 'Fresenius Regional Refurbishment Center, Tech Park, Phase 2',
      reason: 'Precision ultrasonic solenoid valve calibration and pressure manifold bench re-machining.',
      dateSent: '2026-08-28',
      expectedReturnDate: '2026-09-05',
      transportDetails: 'Courier: BlueDart Express Airway Bill #984210984 / Handled by BME Executive',
      returnStatus: 'Pending Return',
      authorizedBy: 'Dr. V. Ramanathan (Medical Superintendent) & Alex Morgan (Lead BME)',
      createdAt: '2026-08-28T10:00:00Z',
      updatedAt: '2026-08-28T10:00:00Z',
    },
    {
      id: 'gp-2',
      passType: 'NRGP',
      passNumber: 'GP-2026-NRGP-019',
      equipmentName: 'High Vacuum Mobile Suction Machine (Condemned)',
      assetId: 'BME-GEN-008',
      serialNumber: 'SN-AM-112004',
      department: 'General Ward - 4th Floor',
      recipientVendor: 'GreenEarth Authorized E-Waste Recyclers (Govt Reg #PCB-EW-8891)',
      reason: 'Permanent disposal and metal recycling following technical condemnation by Hospital Condemnation Board.',
      dateSent: '2026-08-15',
      supportingInformation: 'Condemnation Certificate #CC-2026-08 approved by BME, Finance Director and Hospital Admin.',
      authorizedBy: 'K. S. Narayanan (Chief Operations Officer)',
      createdAt: '2026-08-15T11:30:00Z',
      updatedAt: '2026-08-15T11:30:00Z',
    },
  ],
  discardingReports: [
    {
      id: 'disc-1',
      equipmentName: 'High Vacuum Mobile Suction Machine',
      assetId: 'BME-GEN-008',
      serialNumber: 'SN-AM-112004',
      department: 'General Ward - 4th Floor',
      equipmentCondition: 'Non-Functional / Motor Seized / Beyond Economical Repair',
      reasonForDiscarding: 'Beyond Economical Repair (BER) - Motor coils burnt, compressor cylinder cracked, replacement parts discontinued by manufacturer.',
      bmeAssessment: 'Total active service lifespan exceeded 10 years (Procured 2016). Estimated repair quotation exceeds 120% of new equipment replacement cost.',
      disposalMethod: 'Authorized E-Waste Handler',
      disposalDate: '2026-08-10',
      vendorScrapDetails: 'GreenEarth Authorized E-Waste Recyclers, Manifest #GE-2026-0981',
      scrapAmountReceived: 45,
      remarks: 'Asset written off from Hospital Master Fixed Asset Register. Hazardous oil disposed per pollution control guidelines.',
      createdAt: '2026-08-10T11:00:00Z',
      updatedAt: '2026-08-10T11:00:00Z',
    },
  ],
  handovers: [
    {
      id: 'ho-1',
      equipmentName: 'Biphasic Defibrillator / Monitor Zoll R Series',
      assetId: 'BME-EMERG-002',
      serialNumber: 'SN-ZL-773819',
      fromDepartment: 'Biomedical Engineering Workshop',
      toDepartment: 'Emergency & Trauma (ER)',
      handoverDate: '2026-08-20',
      equipmentCondition: 'Optimal / Post-Calibration Certified',
      personHandingOver: 'Alex Morgan (Lead Biomedical Engineer)',
      personReceiving: 'Sister Mary Joseph (ER Nursing In-Charge)',
      remarks: 'Handed over with 2 set multifunction pads, ECG cable, SpO2 sensor, test load plug and signed checklist.',
      acknowledgement: 'Acknowledged & Received',
      createdAt: '2026-08-20T14:00:00Z',
      updatedAt: '2026-08-20T14:00:00Z',
    },
    {
      id: 'ho-2',
      equipmentName: 'Infusion Pump Space B. Braun',
      assetId: 'BME-ICU-014',
      serialNumber: 'SN-BB-449102',
      fromDepartment: 'General Surgery Ward 2',
      toDepartment: 'Medical ICU (MICU)',
      handoverDate: '2026-08-29',
      equipmentCondition: 'Operational / Sanitized',
      personHandingOver: 'Staff Nurse Geetha',
      personReceiving: 'Staff Nurse Ananya (MICU Shift Lead)',
      remarks: 'Temporary departmental loan for critical patient drug infusion titration.',
      acknowledgement: 'Acknowledged & Received',
      createdAt: '2026-08-29T18:30:00Z',
      updatedAt: '2026-08-29T18:30:00Z',
    },
  ],
  userTrainings: [
    {
      id: 'tr-1',
      traineeName: 'Staff Nurse Priya George',
      designation: 'Nurse',
      department: '', // Nurse department is optional as mandated in requirements!
      date: '2026-08-22',
      equipmentName: 'ICU Ventilator Servo-u (BME-ICU-001)',
      assetId: 'BME-ICU-001',
      trainerName: 'Alex Morgan, Lead BME',
      trainingDetails: 'Basic ventilator modes (PRVC, PS/CPAP), humidifier temperature alarms, circuit condensation drainage, pre-use automated test execution.',
      remarks: 'Trainee demonstrated 100% competency during hands-on alarm simulation scenario.',
      acknowledgement: 'Completed & Certified',
      createdAt: '2026-08-22T16:00:00Z',
      updatedAt: '2026-08-22T16:00:00Z',
    },
    {
      id: 'tr-2',
      traineeName: 'Dr. Arjun Mehta, MD',
      designation: 'Doctor / Consultant',
      department: 'Anaesthesiology & Critical Care',
      date: '2026-08-24',
      equipmentName: 'Anesthesia Workstation Fabius Plus XL',
      assetId: 'BME-OT-003',
      trainerName: 'Dräger OEM Senior Clinical Specialist (David Joseph)',
      trainingDetails: 'Low-flow anesthesia optimization, Agent gas consumption econometer, desflurane vaporizer lock safety, emergency O2 flush fail-safe.',
      remarks: 'Attended full 2-hour clinical module.',
      acknowledgement: 'Completed & Certified',
      createdAt: '2026-08-24T17:30:00Z',
      updatedAt: '2026-08-24T17:30:00Z',
    },
    {
      id: 'tr-3',
      traineeName: 'Kishore Kumar',
      designation: 'OT / Radiology Technician',
      department: 'Radiology & Imaging',
      date: '2026-08-26',
      equipmentName: 'Mobile C-Arm Fluoroscopy Siemens Cios Select',
      assetId: 'BME-RAD-004',
      trainerName: 'Sarah Chen, Assistant BME',
      trainingDetails: 'Lead apron safety distance protocols, laser targeting aiming light positioning, pulsed fluoroscopy dose reduction modes, sterile drape application.',
      remarks: 'Hands-on live positioning test verified in OT 4.',
      acknowledgement: 'Completed & Certified',
      createdAt: '2026-08-26T15:00:00Z',
      updatedAt: '2026-08-26T15:00:00Z',
    },
  ],
  recalls: [
    {
      id: 'rec-1',
      equipmentName: 'Electrosurgical Unit FT10 Energy Platform',
      assetId: 'BME-OT-007',
      manufacturer: 'Medtronic / Covidien',
      model: 'Valleylab FT10 (Software v4.0.1)',
      serialNumber: 'SN-VL-339811',
      recallDate: '2026-08-28',
      recallReason: 'Potential error code E420 intermittently disabling Bipolar cut output under specific duty cycles during prolonged coagulation.',
      recallReference: 'FDA-MD-RECALL-2026-7782 / FSN-MED-994',
      severity: 'Class II (Moderate Risk)',
      requiredAction: 'Software Upgrade',
      actionTaken: 'Contacted Medtronic field engineer. Firmware patch v4.0.4 scheduled for flashing on Sept 3, 2026.',
      status: 'Under Action',
      remarks: 'OT Staff alerted to use Monopolar / alternate ValleyLab ForceFX unit if high-duty vascular sealing is planned.',
      documents: INITIAL_DOCUMENTS.recallDoc,
      createdAt: '2026-08-28T11:20:00Z',
      updatedAt: '2026-08-28T11:20:00Z',
    },
    {
      id: 'rec-2',
      equipmentName: 'Volumetric Infusion Pump Battery Pack',
      assetId: 'BME-ICU-019',
      manufacturer: 'Alaris / BD CareFusion',
      model: 'Alaris GH Plus',
      serialNumber: 'SN-BD-112940',
      recallDate: '2026-07-10',
      recallReason: 'Manufacturer advisory regarding internal battery contact corrosion in units manufactured between Q1 2022 and Q4 2023.',
      recallReference: 'BD-URGENT-FSN-2026-04',
      severity: 'Class I (High Risk)',
      requiredAction: 'Replace',
      actionTaken: 'All 8 affected battery packs replaced with gold-plated spring contact upgraded modules supplied under warranty.',
      status: 'Resolved / Completed',
      remarks: 'Inspection and test completed. Manufacturer closure certificate filed in BME archives.',
      createdAt: '2026-07-10T10:00:00Z',
      updatedAt: '2026-07-25T14:00:00Z',
    },
  ],
};

class StorageService {
  private data: AppStateData;
  private listeners: Array<() => void> = [];
  private currentUser: { id: string; email: string } | null = null;
  private syncStatus: 'idle' | 'syncing' | 'synced' | 'error' = 'idle';
  private lastSyncTime: string | null = null;
  private syncError: string | null = null;

  constructor() {
    try {
      const activeSession = localStorage.getItem('hbdms_active_session_v1');
      if (activeSession) {
        this.currentUser = JSON.parse(activeSession);
      }
    } catch {
      this.currentUser = null;
    }
    this.data = this.loadData();

    // Asynchronously fetch from Supabase if credentials are configured
    if (isSupabaseConfigured()) {
      setTimeout(() => {
        this.fetchFromSupabase().catch((err) => {
          console.warn('[Supabase] Initial background sync deferred:', err);
        });
      }, 500);
    }
  }

  public getSupabaseSyncStatus() {
    return {
      isConfigured: isSupabaseConfigured(),
      status: this.syncStatus,
      lastSyncTime: this.lastSyncTime,
      errorMessage: this.syncError,
    };
  }

  /**
   * Push a newly created or updated record directly to the corresponding Supabase table
   */
  private async syncRecordToSupabase(key: keyof AppStateData, record: any) {
    if (!isSupabaseConfigured()) return;
    const client = getSupabaseClient();
    if (!client) return;

    const table = MODULE_TABLE_MAP[key];
    if (!table) return;

    try {
      const row: any = {
        id: record.id,
        user_id: this.currentUser?.id || 'default_user',
        asset_id: record.assetId || null,
        equipment_name: record.equipmentName || record.assetId || 'Medical Equipment',
        department: record.department || record.fromDepartment || record.toDepartment || null,
        data: record,
        updated_at: new Date().toISOString(),
      };
      const { error } = await client.from(table).upsert(row, { onConflict: 'id' });
      if (error) {
        console.warn(`[Supabase] Upsert warning on ${table}:`, error.message);
      } else {
        this.lastSyncTime = new Date().toISOString();
        this.syncStatus = 'synced';
        this.notify();
      }
    } catch (err: any) {
      console.warn(`[Supabase] Sync record exception on ${key}:`, err?.message || err);
    }
  }

  /**
   * Remove a deleted record from Supabase table
   */
  private async deleteRecordFromSupabase(key: keyof AppStateData, id: string) {
    if (!isSupabaseConfigured()) return;
    const client = getSupabaseClient();
    if (!client) return;

    const table = MODULE_TABLE_MAP[key];
    if (!table) return;

    try {
      const { error } = await client.from(table).delete().eq('id', id);
      if (error) {
        console.warn(`[Supabase] Delete warning on ${table}:`, error.message);
      } else {
        this.lastSyncTime = new Date().toISOString();
        this.notify();
      }
    } catch (err: any) {
      console.warn(`[Supabase] Delete record exception on ${key}:`, err?.message || err);
    }
  }

  /**
   * Fetch all records across all 12 modules from Supabase into application memory & cache
   */
  public async fetchFromSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, count: 0, error: 'Supabase credentials not configured' };
    }
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, count: 0, error: 'Could not initialize Supabase client' };
    }

    this.syncStatus = 'syncing';
    this.notify();

    try {
      let totalFetched = 0;
      const keys = Object.keys(MODULE_TABLE_MAP) as Array<keyof AppStateData>;

      for (const key of keys) {
        const table = MODULE_TABLE_MAP[key];
        const { data, error } = await client
          .from(table)
          .select('id, data, updated_at')
          .order('created_at', { ascending: false });

        if (error) {
          // If table not created yet, log and continue
          console.warn(`[Supabase] Table ${table} query note:`, error.message);
        } else if (data && data.length > 0) {
          const records = data.map((row) => row.data || row);
          (this.data[key] as any) = records;
          totalFetched += records.length;
        }
      }

      this.syncStatus = 'synced';
      this.lastSyncTime = new Date().toISOString();
      this.syncError = null;
      this.saveData(this.data);
      this.notify();
      return { success: true, count: totalFetched };
    } catch (err: any) {
      console.error('[Supabase] fetchFromSupabase error:', err);
      this.syncStatus = 'error';
      this.syncError = err.message || 'Failed to sync from Supabase';
      this.notify();
      return { success: false, count: 0, error: this.syncError };
    }
  }

  /**
   * Push all current local state across all 12 modules into the Supabase database
   */
  public async syncAllToSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, count: 0, error: 'Supabase credentials not configured' };
    }
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, count: 0, error: 'Could not initialize Supabase client' };
    }

    this.syncStatus = 'syncing';
    this.notify();

    try {
      let totalPushed = 0;
      const keys = Object.keys(MODULE_TABLE_MAP) as Array<keyof AppStateData>;

      for (const key of keys) {
        const table = MODULE_TABLE_MAP[key];
        const records = this.data[key] as any[];
        if (records && records.length > 0) {
          const rows = records.map((record) => ({
            id: record.id,
            user_id: this.currentUser?.id || 'default_user',
            asset_id: record.assetId || null,
            equipment_name: record.equipmentName || record.assetId || 'Medical Equipment',
            department: record.department || record.fromDepartment || record.toDepartment || null,
            data: record,
            updated_at: new Date().toISOString(),
          }));

          const { error } = await client.from(table).upsert(rows, { onConflict: 'id' });
          if (error) {
            console.warn(`[Supabase] Batch upsert note for ${table}:`, error.message);
          } else {
            totalPushed += rows.length;
          }
        }
      }

      this.syncStatus = 'synced';
      this.lastSyncTime = new Date().toISOString();
      this.syncError = null;
      this.notify();
      return { success: true, count: totalPushed };
    } catch (err: any) {
      console.error('[Supabase] syncAllToSupabase error:', err);
      this.syncStatus = 'error';
      this.syncError = err.message || 'Failed to push records to Supabase';
      this.notify();
      return { success: false, count: 0, error: this.syncError };
    }
  }

  private isDemoUser(): boolean {
    if (!this.currentUser) return false;
    const email = (this.currentUser.email || '').toLowerCase();
    const id = this.currentUser.id || '';
    return (
      id === 'usr-demo-1' ||
      id === 'usr-demo-2' ||
      email === 'bme.alex@hospital.org' ||
      email === 'bme.sarah@hospital.org'
    );
  }

  private getStorageKey(): string {
    if (this.isDemoUser()) {
      return DEMO_STORAGE_KEY;
    }
    if (this.currentUser && this.currentUser.id) {
      return `hbdms_app_data_user_${this.currentUser.id}`;
    }
    // Default fallback if no session yet
    return DEMO_STORAGE_KEY;
  }

  public switchUser(user: { id: string; email: string } | null) {
    this.currentUser = user;
    this.data = this.loadData();
    this.notify();
  }

  private loadData(): AppStateData {
    const key = this.getStorageKey();
    const isDemo = this.isDemoUser();

    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          dailyRounds: parsed.dailyRounds || [],
          breakdowns: parsed.breakdowns || [],
          poInvoices: parsed.poInvoices || [],
          masterAssets: parsed.masterAssets || [],
          preventiveMaintenances: parsed.preventiveMaintenances || [],
          calibrations: parsed.calibrations || [],
          serviceReports: parsed.serviceReports || [],
          gatePasses: parsed.gatePasses || [],
          discardingReports: parsed.discardingReports || [],
          handovers: parsed.handovers || [],
          userTrainings: parsed.userTrainings || [],
          recalls: parsed.recalls || [],
        };
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    }

    // If demo user and no stored data yet, populate with SEED_DATA
    if (isDemo || (!this.currentUser && key === DEMO_STORAGE_KEY)) {
      this.saveData(SEED_DATA);
      return JSON.parse(JSON.stringify(SEED_DATA));
    }

    // For new registered users: COMPLETELY FRESH & BLANK DATA
    const freshBlank = JSON.parse(JSON.stringify(EMPTY_DATA));
    this.saveData(freshBlank);
    return freshBlank;
  }

  private saveData(data: AppStateData) {
    try {
      const key = this.getStorageKey();
      localStorage.setItem(key, JSON.stringify(data));
      this.notify();
    } catch (e) {
      console.error('Error saving data to localStorage', e);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public getState(): AppStateData {
    return this.data;
  }

  public resetToDefaults() {
    if (this.isDemoUser()) {
      this.data = JSON.parse(JSON.stringify(SEED_DATA));
    } else {
      this.data = JSON.parse(JSON.stringify(EMPTY_DATA));
    }
    this.saveData(this.data);
  }

  // --- CRUD for Master Assets ---
  public getMasterAssets(): MasterAssetRecord[] {
    return this.data.masterAssets;
  }

  public addMasterAsset(record: Omit<MasterAssetRecord, 'id' | 'createdAt' | 'updatedAt'>): MasterAssetRecord {
    const newRecord: MasterAssetRecord = {
      ...record,
      id: `ast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.masterAssets.unshift(newRecord);
    this.saveData(this.data);
    this.syncRecordToSupabase('masterAssets', newRecord);
    return newRecord;
  }

  public updateMasterAsset(id: string, updates: Partial<MasterAssetRecord>): MasterAssetRecord | null {
    const idx = this.data.masterAssets.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.data.masterAssets[idx] = {
      ...this.data.masterAssets[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData(this.data);
    this.syncRecordToSupabase('masterAssets', this.data.masterAssets[idx]);
    return this.data.masterAssets[idx];
  }

  public deleteMasterAsset(id: string): boolean {
    const initialLen = this.data.masterAssets.length;
    this.data.masterAssets = this.data.masterAssets.filter((r) => r.id !== id);
    if (this.data.masterAssets.length !== initialLen) {
      this.saveData(this.data);
      this.deleteRecordFromSupabase('masterAssets', id);
      return true;
    }
    return false;
  }

  // --- Generic Helpers for Other 11 Modules ---
  public getCollection<K extends keyof AppStateData>(key: K): AppStateData[K] {
    return this.data[key];
  }

  public addRecord<K extends keyof AppStateData, T>(
    key: K,
    record: any,
    prefix: string
  ): any {
    const newRecord = {
      ...record,
      id: `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Auto-update master asset status if relevant
    if (key === 'breakdowns') {
      const asset = this.data.masterAssets.find((a) => a.assetId === record.assetId);
      if (asset) {
        this.updateMasterAsset(asset.id, { equipmentStatus: 'Breakdown' });
      }
    } else if (key === 'discardingReports') {
      const asset = this.data.masterAssets.find((a) => a.assetId === record.assetId);
      if (asset) {
        this.updateMasterAsset(asset.id, { equipmentStatus: 'Discarded' });
      }
    } else if (key === 'preventiveMaintenances' && record.status === 'Completed' && record.nextPmDate) {
      const asset = this.data.masterAssets.find((a) => a.assetId === record.assetId);
      if (asset) {
        this.updateMasterAsset(asset.id, {
          lastPmDate: record.pmCompletionDate || record.pmDueDate,
          nextPmDate: record.nextPmDate,
          equipmentStatus: 'Operational',
        });
      }
    } else if (key === 'calibrations' && record.nextCalibrationDueDate) {
      const asset = this.data.masterAssets.find((a) => a.assetId === record.assetId);
      if (asset) {
        this.updateMasterAsset(asset.id, {
          lastCalibrationDate: record.calibrationDate,
          nextCalibrationDate: record.nextCalibrationDueDate,
          equipmentStatus: record.calibrationResult === 'Passed' ? 'Operational' : 'Under Calibration',
        });
      }
    } else if (key === 'handovers') {
      const asset = this.data.masterAssets.find((a) => a.assetId === record.assetId);
      if (asset) {
        this.updateMasterAsset(asset.id, {
          department: record.toDepartment,
        });
      }
    }

    (this.data[key] as any).unshift(newRecord);
    this.saveData(this.data);
    this.syncRecordToSupabase(key, newRecord);
    return newRecord;
  }

  public updateRecord<K extends keyof AppStateData>(
    key: K,
    id: string,
    updates: any
  ): any | null {
    const list = this.data[key] as any[];
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // If breakdown completed, restore asset status to Operational
    if (key === 'breakdowns' && updates.status === 'Completed') {
      const asset = this.data.masterAssets.find((a) => a.assetId === list[idx].assetId);
      if (asset && asset.equipmentStatus === 'Breakdown') {
        this.updateMasterAsset(asset.id, { equipmentStatus: 'Operational' });
      }
    }

    this.saveData(this.data);
    this.syncRecordToSupabase(key, list[idx]);
    return list[idx];
  }

  public deleteRecord<K extends keyof AppStateData>(key: K, id: string): boolean {
    const list = this.data[key] as any[];
    const initialLen = list.length;
    (this.data[key] as any) = list.filter((r) => r.id !== id);
    if ((this.data[key] as any).length !== initialLen) {
      this.saveData(this.data);
      this.deleteRecordFromSupabase(key, id);
      return true;
    }
    return false;
  }

  // --- Search & Global Filter ---
  public searchGlobal(query: string) {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const results: Array<{
      module: string;
      moduleKey: keyof AppStateData;
      title: string;
      subtitle: string;
      assetId?: string;
      date?: string;
      status?: string;
      record: any;
    }> = [];

    // Master Assets
    this.data.masterAssets.forEach((a) => {
      if (
        a.assetId.toLowerCase().includes(q) ||
        a.equipmentName.toLowerCase().includes(q) ||
        a.serialNumber.toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q) ||
        a.manufacturerBrand.toLowerCase().includes(q) ||
        a.model.toLowerCase().includes(q)
      ) {
        results.push({
          module: 'Master Asset Register',
          moduleKey: 'masterAssets',
          title: a.equipmentName,
          subtitle: `${a.assetId} • ${a.department} • ${a.manufacturerBrand}`,
          assetId: a.assetId,
          status: a.equipmentStatus,
          record: a,
        });
      }
    });

    // Breakdown Register
    this.data.breakdowns.forEach((b) => {
      if (
        b.equipmentName.toLowerCase().includes(q) ||
        b.assetId.toLowerCase().includes(q) ||
        b.serialNumber.toLowerCase().includes(q) ||
        b.department.toLowerCase().includes(q) ||
        b.problemDescription.toLowerCase().includes(q)
      ) {
        results.push({
          module: 'Breakdown Register',
          moduleKey: 'breakdowns',
          title: `Breakdown: ${b.equipmentName}`,
          subtitle: `${b.assetId} • ${b.department} • ${b.problemDescription.substring(0, 45)}...`,
          assetId: b.assetId,
          date: b.breakdownDate,
          status: b.status,
          record: b,
        });
      }
    });

    // Daily Rounds
    this.data.dailyRounds.forEach((dr) => {
      if (
        dr.equipmentName.toLowerCase().includes(q) ||
        (dr.assetId && dr.assetId.toLowerCase().includes(q)) ||
        dr.department.toLowerCase().includes(q) ||
        dr.observations.toLowerCase().includes(q)
      ) {
        results.push({
          module: 'Daily Rounds Report',
          moduleKey: 'dailyRounds',
          title: `Daily Round: ${dr.equipmentName}`,
          subtitle: `${dr.department} • ${dr.biomedicalEngineer}`,
          assetId: dr.assetId,
          date: dr.date,
          status: dr.equipmentCondition,
          record: dr,
        });
      }
    });

    // PMs
    this.data.preventiveMaintenances.forEach((pm) => {
      if (
        pm.equipmentName.toLowerCase().includes(q) ||
        pm.assetId.toLowerCase().includes(q) ||
        pm.department.toLowerCase().includes(q)
      ) {
        results.push({
          module: 'Preventive Maintenance',
          moduleKey: 'preventiveMaintenances',
          title: `PM: ${pm.equipmentName}`,
          subtitle: `${pm.assetId} • ${pm.department} • Due: ${pm.pmDueDate}`,
          assetId: pm.assetId,
          date: pm.pmDueDate,
          status: pm.status,
          record: pm,
        });
      }
    });

    // Calibrations
    this.data.calibrations.forEach((c) => {
      if (
        c.equipmentName.toLowerCase().includes(q) ||
        c.assetId.toLowerCase().includes(q) ||
        c.serialNumber.toLowerCase().includes(q) ||
        c.certificateNumber.toLowerCase().includes(q)
      ) {
        results.push({
          module: 'Calibration Report',
          moduleKey: 'calibrations',
          title: `Calibration: ${c.equipmentName}`,
          subtitle: `${c.assetId} • Cert: ${c.certificateNumber} • ${c.calibrationAgencyPerson}`,
          assetId: c.assetId,
          date: c.calibrationDate,
          status: c.calibrationResult,
          record: c,
        });
      }
    });

    // Service Reports
    this.data.serviceReports.forEach((s) => {
      if (
        s.equipmentName.toLowerCase().includes(q) ||
        s.assetId.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.complaint.toLowerCase().includes(q)
      ) {
        results.push({
          module: 'Service Report',
          moduleKey: 'serviceReports',
          title: `Service: ${s.equipmentName}`,
          subtitle: `${s.assetId} • ${s.serviceProvider} • ${s.complaint.substring(0, 40)}...`,
          assetId: s.assetId,
          date: s.serviceDate,
          record: s,
        });
      }
    });

    // PO & Invoices
    this.data.poInvoices.forEach((p) => {
      if (
        p.equipmentName.toLowerCase().includes(q) ||
        p.poNumber.toLowerCase().includes(q) ||
        p.invoiceNumber.toLowerCase().includes(q) ||
        p.vendor.toLowerCase().includes(q)
      ) {
        results.push({
          module: 'PO, Invoice & Installation',
          moduleKey: 'poInvoices',
          title: `PO/Invoice: ${p.equipmentName}`,
          subtitle: `PO: ${p.poNumber} • Inv: ${p.invoiceNumber} • ${p.vendor}`,
          date: p.poDate,
          record: p,
        });
      }
    });

    // Gate Passes
    this.data.gatePasses.forEach((gp) => {
      if (
        gp.passNumber.toLowerCase().includes(q) ||
        gp.equipmentName.toLowerCase().includes(q) ||
        gp.assetId.toLowerCase().includes(q) ||
        gp.recipientVendor.toLowerCase().includes(q)
      ) {
        results.push({
          module: 'Gate Pass (RGP/NRGP)',
          moduleKey: 'gatePasses',
          title: `Gate Pass: ${gp.passNumber} (${gp.passType})`,
          subtitle: `${gp.equipmentName} • ${gp.recipientVendor} • ${gp.reason}`,
          assetId: gp.assetId,
          date: gp.dateSent,
          status: gp.returnStatus,
          record: gp,
        });
      }
    });

    // Discarding
    this.data.discardingReports.forEach((d) => {
      if (
        d.equipmentName.toLowerCase().includes(q) ||
        d.assetId.toLowerCase().includes(q) ||
        d.reasonForDiscarding.toLowerCase().includes(q)
      ) {
        results.push({
          module: 'Discarding of Equipment',
          moduleKey: 'discardingReports',
          title: `Discarding: ${d.equipmentName}`,
          subtitle: `${d.assetId} • ${d.disposalMethod} • ${d.reasonForDiscarding.substring(0, 40)}`,
          assetId: d.assetId,
          date: d.disposalDate,
          record: d,
        });
      }
    });

    // Handovers
    this.data.handovers.forEach((h) => {
      if (
        h.equipmentName.toLowerCase().includes(q) ||
        h.assetId.toLowerCase().includes(q) ||
        h.fromDepartment.toLowerCase().includes(q) ||
        h.toDepartment.toLowerCase().includes(q)
      ) {
        results.push({
          module: 'Handover Register',
          moduleKey: 'handovers',
          title: `Handover: ${h.equipmentName}`,
          subtitle: `${h.assetId} • ${h.fromDepartment} → ${h.toDepartment}`,
          assetId: h.assetId,
          date: h.handoverDate,
          status: h.acknowledgement,
          record: h,
        });
      }
    });

    // User Training
    this.data.userTrainings.forEach((t) => {
      if (
        t.traineeName.toLowerCase().includes(q) ||
        t.equipmentName.toLowerCase().includes(q) ||
        t.trainerName.toLowerCase().includes(q) ||
        (t.department && t.department.toLowerCase().includes(q))
      ) {
        results.push({
          module: 'User Training Register',
          moduleKey: 'userTrainings',
          title: `Training: ${t.traineeName} (${t.designation})`,
          subtitle: `${t.equipmentName} • Trainer: ${t.trainerName}`,
          date: t.date,
          status: t.acknowledgement,
          record: t,
        });
      }
    });

    // Recalls
    this.data.recalls.forEach((r) => {
      if (
        r.equipmentName.toLowerCase().includes(q) ||
        r.assetId.toLowerCase().includes(q) ||
        r.manufacturer.toLowerCase().includes(q) ||
        r.recallReference.toLowerCase().includes(q)
      ) {
        results.push({
          module: 'Medical Equipment Recall',
          moduleKey: 'recalls',
          title: `Recall: ${r.equipmentName}`,
          subtitle: `Ref: ${r.recallReference} • Action: ${r.requiredAction} • ${r.severity}`,
          assetId: r.assetId,
          date: r.recallDate,
          status: r.status,
          record: r,
        });
      }
    });

    return results;
  }
}

export const storageService = new StorageService();
