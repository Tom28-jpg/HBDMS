import React from 'react';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck2,
  AlertTriangle,
  FileCheck2,
  SlidersHorizontal,
  Wrench,
  Truck,
  Trash2,
  ArrowRightLeft,
  GraduationCap,
  Megaphone,
  FileSpreadsheet,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ModuleType } from '../../types';
import { storageService } from '../../services/storageService';

interface SidebarProps {
  currentModule: ModuleType;
  onSelectModule: (module: ModuleType) => void;
  isOpen: boolean;
  onClose?: () => void;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: ModuleType;
  label: string;
  shortLabel?: string;
  icon: React.ElementType;
  badgeCount?: number;
  badgeVariant?: 'danger' | 'warning' | 'info' | 'default';
  description: string;
}

export interface ModuleDefinition {
  id: ModuleType;
  name: string;
  shortName: string;
  description: string;
}

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  { id: 'dashboard', name: 'Executive Dashboard', shortName: 'Dashboard', description: 'Equipment analytics & lifecycle status' },
  { id: 'master_asset', name: 'Master Asset Register', shortName: 'Master Asset', description: 'Central hospital equipment inventory & lifetime specs' },
  { id: 'daily_rounds', name: 'Daily Rounds Report', shortName: 'Daily Round', description: 'Ward, ICU & OT monitoring inspections & observations' },
  { id: 'breakdown', name: 'Breakdown Register', shortName: 'Breakdown Ticket', description: 'Malfunction tickets, downtime tracking & spare parts' },
  { id: 'po_invoice_install', name: 'PO, Invoice & Installation', shortName: 'Procurement', description: 'Purchase orders, tax invoices & user demonstration signoffs' },
  { id: 'preventive_maintenance', name: 'Preventive Maintenance Report', shortName: 'PM Report', description: 'Scheduled PM checklists, electrical safety & audit logs' },
  { id: 'calibration', name: 'Calibration & Metrology Report', shortName: 'Calibration', description: 'Standard accuracy verification & NABL certificates' },
  { id: 'service_report', name: 'Service & Repair Report', shortName: 'Service Report', description: 'OEM & in-house repair job sheets and diagnostics' },
  { id: 'gate_pass', name: 'Gate Pass Register (RGP & NRGP)', shortName: 'Gate Pass', description: 'Returnable and non-returnable equipment logistics passes' },
  { id: 'handover', name: 'Handover Register', shortName: 'Handover', description: 'Inter-department equipment transfers & acknowledgements' },
  { id: 'user_training', name: 'User Training Register', shortName: 'User Training', description: 'Clinical staff & nurse equipment handling certifications' },
  { id: 'recall', name: 'Medical Equipment Recall', shortName: 'Recall Alert', description: 'Field safety notices, hazards & OEM recall management' },
  { id: 'discarding', name: 'Equipment Discarding & Condemnation', shortName: 'Discarding Report', description: 'Technical assessment, condemnation board approval & disposal' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  isOpen,
  onClose,
  onCloseMobile,
}) => {
  const handleClose = () => {
    if (onClose) onClose();
    if (onCloseMobile) onCloseMobile();
  };

  const state = storageService.getState();

  const breakdownCount = state.breakdowns.filter((b) => b.status !== 'Completed').length;
  const pmOverdueCount = state.preventiveMaintenances.filter((pm) => pm.status === 'Overdue').length;
  const calibUpcomingCount = state.calibrations.filter((c) => {
    if (!c.nextCalibrationDueDate) return false;
    const diffDays = (new Date(c.nextCalibrationDueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 60;
  }).length;
  const recallActiveCount = state.recalls.filter((r) => r.status !== 'Resolved / Completed').length;
  const rgpPendingCount = state.gatePasses.filter((g) => g.passType === 'RGP' && g.returnStatus === 'Pending Return').length;

  const navGroups: { groupTitle: string; items: NavItem[] }[] = [
    {
      groupTitle: 'OVERVIEW & ASSETS',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard Overview',
          shortLabel: 'Dashboard',
          icon: LayoutDashboard,
          description: 'Equipment analytics & lifecycle status',
        },
        {
          id: 'master_asset',
          label: 'Master Asset Register',
          shortLabel: 'Master Assets',
          icon: Building2,
          badgeCount: state.masterAssets.length,
          badgeVariant: 'default',
          description: 'Central hospital equipment inventory',
        },
      ],
    },
    {
      groupTitle: 'DAILY OPERATIONS & MAINTENANCE',
      items: [
        {
          id: 'daily_rounds',
          label: 'Daily Rounds Report',
          shortLabel: 'Daily Rounds',
          icon: CalendarCheck2,
          badgeCount: state.dailyRounds.length,
          badgeVariant: 'default',
          description: 'Ward, ICU & OT monitoring logs',
        },
        {
          id: 'breakdown',
          label: 'Breakdown Register',
          shortLabel: 'Breakdowns',
          icon: AlertTriangle,
          badgeCount: breakdownCount > 0 ? breakdownCount : undefined,
          badgeVariant: 'danger',
          description: 'Malfunction tickets & spare parts',
        },
        {
          id: 'preventive_maintenance',
          label: 'Preventive Maintenance',
          shortLabel: 'PM Reports',
          icon: FileCheck2,
          badgeCount: pmOverdueCount > 0 ? pmOverdueCount : undefined,
          badgeVariant: 'warning',
          description: 'Scheduled PM checklists & audits',
        },
        {
          id: 'service_report',
          label: 'Service Reports',
          shortLabel: 'Service Reports',
          icon: Wrench,
          badgeCount: state.serviceReports.length,
          badgeVariant: 'default',
          description: 'OEM & in-house repair job sheets',
        },
      ],
    },
    {
      groupTitle: 'PROCUREMENT & QUALITY',
      items: [
        {
          id: 'po_invoice_install',
          label: 'PO, Invoice & Install',
          shortLabel: 'Procurement',
          icon: FileSpreadsheet,
          badgeCount: state.poInvoices.length,
          badgeVariant: 'default',
          description: 'Purchase orders, warranty & demo signoff',
        },
        {
          id: 'calibration',
          label: 'Calibration Reports',
          shortLabel: 'Calibration',
          icon: SlidersHorizontal,
          badgeCount: calibUpcomingCount > 0 ? calibUpcomingCount : undefined,
          badgeVariant: 'warning',
          description: 'Accuracy tests & NABL certificates',
        },
        {
          id: 'user_training',
          label: 'User Training Register',
          shortLabel: 'User Training',
          icon: GraduationCap,
          badgeCount: state.userTrainings.length,
          badgeVariant: 'default',
          description: 'Clinical staff & nurse equipment training',
        },
        {
          id: 'recall',
          label: 'Medical Equipment Recall',
          shortLabel: 'Recall Alerts',
          icon: Megaphone,
          badgeCount: recallActiveCount > 0 ? recallActiveCount : undefined,
          badgeVariant: 'danger',
          description: 'Field safety notices & OEM recalls',
        },
      ],
    },
    {
      groupTitle: 'MOVEMENT & DISPOSAL',
      items: [
        {
          id: 'gate_pass',
          label: 'Gate Pass (RGP & NRGP)',
          shortLabel: 'Gate Pass',
          icon: Truck,
          badgeCount: rgpPendingCount > 0 ? rgpPendingCount : undefined,
          badgeVariant: 'info',
          description: 'Returnable & non-returnable passes',
        },
        {
          id: 'handover',
          label: 'Handover Register',
          shortLabel: 'Handover',
          icon: ArrowRightLeft,
          badgeCount: state.handovers.length,
          badgeVariant: 'default',
          description: 'Inter-department equipment transfers',
        },
        {
          id: 'discarding',
          label: 'Equipment Discarding',
          shortLabel: 'Discarding',
          icon: Trash2,
          badgeCount: state.discardingReports.length,
          badgeVariant: 'default',
          description: 'Condemnation & e-waste scrap records',
        },
      ],
    },
  ];

  return (
    <aside
      id="app-sidebar"
      className={`relative h-[calc(100vh-64px)] bg-blue-600 text-white z-20 flex flex-col transition-[width,opacity] duration-300 ease-in-out border-r border-blue-700 shrink-0 select-none overflow-hidden ${
        isOpen
          ? 'w-64 opacity-100'
          : 'w-0 opacity-0 pointer-events-none border-r-0'
      }`}
    >
      {/* Fixed-width inner wrapper to prevent awkward content squeezing during collapse transition */}
      <div className="w-64 h-full flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-blue-700 bg-blue-700 flex items-center justify-between">
          <div
            onClick={() => onSelectModule('dashboard')}
            className="cursor-pointer group select-none"
            title="Go to Dashboard Overview"
          >
            <div className="flex items-center gap-2">
              <h1 className="text-white font-bold text-base tracking-tight uppercase group-hover:text-blue-100 transition-colors">
                HBDMS
              </h1>
              <span className="px-1.5 py-0.5 rounded bg-white/20 text-white text-[10px] font-mono font-bold">
                v2.4
              </span>
            </div>
            <p className="text-[10px] text-blue-100 font-mono mt-0.5 uppercase tracking-widest">
              Biomedical Systems
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            title="Hide side menu"
          >
            ✕
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 custom-scrollbar">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-0.5">
              <div className="px-3 text-[11px] font-bold uppercase tracking-widest text-blue-200 mb-1.5">
                {group.groupTitle}
              </div>

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentModule === item.id;

                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => {
                      onSelectModule(item.id);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors group cursor-pointer ${
                      isActive
                        ? 'bg-white text-blue-600 font-bold shadow-xs'
                        : 'text-white hover:bg-blue-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-blue-600' : 'text-blue-200 group-hover:text-white'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      {item.badgeCount !== undefined && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            item.badgeVariant === 'danger'
                              ? 'bg-red-500 text-white'
                              : item.badgeVariant === 'warning'
                              ? 'bg-amber-400 text-slate-900 font-bold'
                              : isActive
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-blue-700 text-white border border-blue-500/60'
                          }`}
                        >
                          {item.badgeCount}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer / Engineer Info in cohesive App Blue theme */}
        <div className="p-3.5 border-t border-blue-700 bg-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-white flex items-center justify-center font-bold text-blue-600 text-xs shrink-0 shadow-2xs">
              BE
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">Biomedical Engineering</p>
              <p className="text-[10px] text-blue-100 font-mono">NABH & AERB Compliant</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
