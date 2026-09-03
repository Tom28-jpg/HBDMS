import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  Shield,
  Trash2,
  Edit2,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { User, ModuleType } from '../../types';
import { authService } from '../../services/authService';

interface ProfileViewProps {
  currentUser: User;
  onNavigate: (module: ModuleType) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onNavigate,
  onLogout,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [mobileNumber, setMobileNumber] = useState(currentUser.mobileNumber);
  const [designation, setDesignation] = useState(currentUser.designation);
  const [hospitalName, setHospitalName] = useState(currentUser.hospitalName);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Full Name is required');
      return;
    }
    if (!mobileNumber.trim()) {
      setErrorMsg('Mobile Number is required');
      return;
    }
    if (!designation.trim()) {
      setErrorMsg('Designation is required');
      return;
    }
    if (!hospitalName.trim()) {
      setErrorMsg('Hospital Name is required');
      return;
    }

    const ok = authService.updateProfile({
      name: name.trim(),
      mobileNumber: mobileNumber.trim(),
      designation: designation.trim(),
      hospitalName: hospitalName.trim(),
    });

    if (ok) {
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setErrorMsg('Failed to update profile. Please try again.');
    }
  };

  const handleDeleteAccount = () => {
    const success = authService.deleteAccount(currentUser.id);
    if (success) {
      onLogout();
    }
  };

  const memberSinceFormatted = () => {
    try {
      const d = new Date(currentUser.createdAt);
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    } catch {
      return '9/2/2026';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Profile
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View and manage your account settings
          </p>
        </div>

        {/* User Role Badge */}
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white shadow-2xs">
            {currentUser.designation.toLowerCase().includes('admin')
              ? 'admin'
              : currentUser.designation || 'admin'}
          </span>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Profile information updated successfully.</span>
        </div>
      )}

      {/* Main 2-Column Grid matching UI Template Image 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Profile Information Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Profile Information
            </h2>
            <p className="text-xs text-slate-500">
              Your personal and professional details
            </p>
          </div>

          {!isEditing ? (
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Full Name
                </label>
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm">
                  <UserIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">{currentUser.name}</span>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Email
                </label>
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">{currentUser.email}</span>
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Mobile Number
                </label>
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium font-mono">
                    {currentUser.mobileNumber}
                  </span>
                </div>
              </div>

              {/* Designation */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Designation
                </label>
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm">
                  <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">{currentUser.designation}</span>
                </div>
              </div>

              {/* Hospital Name */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Hospital Name
                </label>
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">{currentUser.hospitalName}</span>
                </div>
              </div>

              {/* Edit Profile Button */}
              <div className="pt-2">
                <button
                  id="edit-profile-btn"
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-2xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {errorMsg && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Edit Full Name */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Email (Read only) */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Email (Primary Identifier)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-100 text-slate-500 rounded-lg text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Edit Mobile Number */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Edit Designation */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Designation *
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Edit Hospital Name */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Hospital Name *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-2xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setName(currentUser.name);
                    setMobileNumber(currentUser.mobileNumber);
                    setDesignation(currentUser.designation);
                    setHospitalName(currentUser.hospitalName);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Account Management Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Account Management
              </h2>
              <p className="text-xs text-slate-500">
                Manage your account settings and data
              </p>
            </div>

            {/* Account Status Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
              <h3 className="text-sm font-bold text-slate-800 mb-1">
                Account Status
              </h3>
              <p className="text-xs text-slate-600 mb-3">
                Your account is active and in good standing.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Member since: {memberSinceFormatted()}</span>
              </div>
            </div>

            {/* Danger Zone Box */}
            <div className="p-5 rounded-xl border border-red-200 bg-red-50/40">
              <h3 className="text-sm font-bold text-red-700 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Danger Zone
              </h3>
              <p className="text-xs text-red-600 mb-4 leading-relaxed">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>

              {!showDeleteConfirm ? (
                <button
                  id="delete-account-trigger-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </button>
              ) : (
                <div className="p-3 bg-white rounded-lg border border-red-300 space-y-3">
                  <p className="text-xs font-semibold text-red-800">
                    Are you sure you want to permanently delete your account? All your registered equipment and reports will be deleted.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      id="confirm-delete-account-btn"
                      onClick={handleDeleteAccount}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-colors cursor-pointer"
                    >
                      Yes, Delete Permanently
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6 text-xs text-slate-400">
            HBDMS Biomedical Document Management System • Single-Tenant Hospital Isolation
          </div>
        </div>
      </div>
    </div>
  );
};
