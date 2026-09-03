import React, { useState } from 'react';
import {
  Bell,
  User as UserIcon,
  LogOut,
  RotateCcw,
  Activity,
  Menu,
  Home,
  Database,
} from 'lucide-react';
import { User, ModuleType } from '../../types';
import { authService } from '../../services/authService';
import { storageService } from '../../services/storageService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { SupabaseModal } from '../common/SupabaseModal';

interface HeaderProps {
  currentUser: User | null;
  onOpenGlobalSearch?: () => void;
  onOpenSearch?: () => void;
  onOpenNewRecord?: (moduleType: ModuleType) => void;
  onNavigate: (module: ModuleType) => void;
  onToggleSidebar: () => void;
  sidebarOpen?: boolean;
  currentModule?: ModuleType;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onNavigate,
  onToggleSidebar,
  sidebarOpen = true,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  const isConfigured = isSupabaseConfigured();

  const state = storageService.getState();
  const activeBreakdowns = state.breakdowns.filter((b) => b.status !== 'Completed').length;
  const overduePms = state.preventiveMaintenances.filter((pm) => pm.status === 'Overdue').length;
  const activeRecalls = state.recalls.filter((r) => r.status !== 'Resolved / Completed').length;
  const pendingRgps = state.gatePasses.filter((g) => g.passType === 'RGP' && g.returnStatus === 'Pending Return').length;

  const totalAlerts = activeBreakdowns + overduePms + activeRecalls + pendingRgps;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      authService.logout();
    }
    setShowUserMenu(false);
  };

  const handleResetData = () => {
    if (confirm('Reset all records to standard hospital seed data? Any new records created will be restored to default.')) {
      storageService.resetToDefaults();
      setShowUserMenu(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
      <div className="flex items-center justify-between px-3 sm:px-6 h-16">
        {/* Left Section: Brand & Sidebar toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            id="sidebar-toggle-btn"
            onClick={onToggleSidebar}
            className={`p-2 rounded-md transition-colors cursor-pointer ${
              sidebarOpen
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={sidebarOpen ? 'Hide side menu' : 'Show side menu'}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            title="Go to Overview Dashboard"
          >
            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-2xs font-bold text-xs group-hover:bg-blue-700 transition-colors">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg group-hover:text-blue-600 transition-colors">
                  HBDMS
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  Biomedical Systems
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono hidden lg:block truncate max-w-xs uppercase tracking-wider">
                {currentUser?.hospitalName || 'Hospital Biomedical Document Management'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Alerts & Profile (Clean layout: no scroll tabs, search, or create record in top navbar) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Supabase Database Connection Status & Action Button */}
          <button
            id="supabase-database-btn"
            onClick={() => setShowSupabaseModal(true)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isConfigured
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Configure Supabase Database and Vercel Deployment"
          >
            <Database className={`w-3.5 h-3.5 ${isConfigured ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">
              {isConfigured ? 'Supabase Connected' : 'Connect Supabase'}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConfigured ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
          </button>

          {/* Notifications / Alerts Dropdown */}
          <div className="relative">
            <button
              id="notifications-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md relative transition-colors"
              title="Hospital Alerts"
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowNotifications(false)}
              >
                <div className="px-4 py-1.5 flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">Biomedical Alerts</div>
                  <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded">
                    {totalAlerts} Active
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {activeBreakdowns > 0 && (
                    <div
                      onClick={() => onNavigate('breakdown')}
                      className="p-3 hover:bg-red-50/50 cursor-pointer flex gap-2.5 items-start"
                    >
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">
                          {activeBreakdowns} Equipment in Breakdown
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Critical clinical equipment requires urgent service or spare parts.
                        </p>
                      </div>
                    </div>
                  )}

                  {overduePms > 0 && (
                    <div
                      onClick={() => onNavigate('preventive_maintenance')}
                      className="p-3 hover:bg-amber-50/50 cursor-pointer flex gap-2.5 items-start"
                    >
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">
                          {overduePms} Overdue Preventive Maintenance
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Equipment PM schedule exceeded planned cycle date.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeRecalls > 0 && (
                    <div
                      onClick={() => onNavigate('recall')}
                      className="p-3 hover:bg-red-50/50 cursor-pointer flex gap-2.5 items-start"
                    >
                      <div className="w-2 h-2 rounded-full bg-red-600 mt-1 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">
                          {activeRecalls} Medical Recall Alerts
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Field safety notice / OEM corrections pending action.
                        </p>
                      </div>
                    </div>
                  )}

                  {pendingRgps > 0 && (
                    <div
                      onClick={() => onNavigate('gate_pass')}
                      className="p-3 hover:bg-blue-50/50 cursor-pointer flex gap-2.5 items-start"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">
                          {pendingRgps} Gate Passes Awaiting Return
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Equipment sent for external OEM bench calibration/repair.
                        </p>
                      </div>
                    </div>
                  )}

                  {totalAlerts === 0 && (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      All biomedical systems operational. No critical alerts.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Menu */}
          <div className="relative">
            <button
              id="user-profile-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              <div className="w-7 h-7 rounded bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                {currentUser?.name
                  ? currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : 'BE'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  {currentUser?.name || 'Biomedical Engineer'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono leading-tight">
                  {currentUser?.designation || 'BME Officer'}
                </div>
              </div>
            </button>

            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900">{currentUser?.name}</div>
                  <div className="text-[11px] text-slate-500">{currentUser?.email}</div>
                  <div className="text-[10px] text-blue-700 font-medium mt-1">
                    {currentUser?.hospitalName}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    id="user-menu-profile-btn"
                    onClick={() => {
                      onNavigate('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                    My Profile
                  </button>
                  <button
                    id="user-menu-dashboard-btn"
                    onClick={() => {
                      onNavigate('dashboard');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Home className="w-3.5 h-3.5 text-blue-600" />
                    Overview Dashboard
                  </button>
                  <button
                    id="user-menu-supabase-btn"
                    onClick={() => {
                      setShowSupabaseModal(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    Supabase DB & Vercel
                  </button>
                  <button
                    onClick={handleResetData}
                    className="w-full text-left px-4 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    Reset Data to Seed Defaults
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-600" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Supabase Database & Vercel Modal */}
      <SupabaseModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
      />
    </header>
  );
};
