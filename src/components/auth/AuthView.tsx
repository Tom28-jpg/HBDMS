import React, { useState } from 'react';
import {
  Activity,
  Eye,
  EyeOff,
  Building2,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  ShieldCheck,
  Award,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { User } from '../../types';
import { authService } from '../../services/authService';

interface AuthViewProps {
  onLoginSuccess: (user?: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('bme.alex@hospital.org');
  const [loginPassword, setLoginPassword] = useState('Demo@2026');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regDesignation, setRegDesignation] = useState('Biomedical Engineer');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regHospital, setRegHospital] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Please enter both registered email and password.');
      return;
    }

    const res = authService.login(loginEmail, loginPassword);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setLoginError(res.error || 'Invalid credentials. Please verify and try again.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccessMsg('');

    // Validations
    if (!regName.trim()) {
      setRegError('Please enter your full name');
      return;
    }
    if (!regDesignation.trim()) {
      setRegError('Please enter your designation');
      return;
    }
    if (!regHospital.trim()) {
      setRegError('Please enter your hospital or medical institution name');
      return;
    }
    if (!regMobile.trim() || regMobile.replace(/\D/g, '').length < 10) {
      setRegError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Please enter a valid email address');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must contain at least 6 characters');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please check confirmation password');
      return;
    }

    const res = authService.register({
      name: regName,
      designation: regDesignation,
      mobileNumber: regMobile,
      email: regEmail,
      hospitalName: regHospital,
      password: regPassword,
    });

    if (res.success && res.user) {
      setRegSuccessMsg('Account registered successfully! Redirecting to HBDMS...');
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 700);
    } else {
      setRegError(res.error || 'Failed to register account');
    }
  };

  const handleDemoLogin = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    const res = authService.login(email, pass);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Subtle Elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header / Brand Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600 shadow-lg text-white mb-2.5">
          <Activity className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          HBDMS
        </h1>
        <p className="mt-0.5 text-xs text-slate-400 font-mono uppercase tracking-wider">
          Hospital Biomedical Document Management
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#1E293B] text-blue-400 border border-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          Centralized Medical Equipment Lifecycle Platform
        </div>
      </div>

      {/* Main Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg z-10 px-4">
        <div className="bg-[#1E293B] py-6 px-6 sm:px-8 shadow-2xl rounded-lg border border-slate-800">
          {/* Tabs */}
          <div className="flex border-b border-slate-700 mb-5">
            <button
              id="auth-tab-login"
              onClick={() => {
                setMode('login');
                setLoginError('');
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Engineer Login
            </button>
            <button
              id="auth-tab-register"
              onClick={() => {
                setMode('register');
                setRegError('');
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Register Account
            </button>
          </div>

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Registered Email Address
                </label>
                <div className="relative rounded shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email-input"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="engineer@hospital.org"
                    className="block w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative rounded shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password-input"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-10 py-2 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    id="login-password-toggle"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="login-submit-btn"
                  className="w-full flex justify-center items-center gap-2 py-2 px-4 rounded shadow-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Demo 1-Click Credentials Section */}
              <div className="mt-5 pt-4 border-t border-slate-700/80">
                <div className="text-xs text-slate-400 font-medium mb-2 flex items-center justify-between">
                  <span>Fast Demo Logins:</span>
                  <span className="text-[10px] text-blue-400 font-mono">1-Click Auto-Fill</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('bme.alex@hospital.org', 'Demo@2026')}
                    className="text-left p-2 rounded bg-slate-900 hover:bg-slate-900/80 border border-slate-700 hover:border-blue-500/50 transition-all text-xs cursor-pointer"
                  >
                    <div className="font-semibold text-slate-200">Alex Morgan</div>
                    <div className="text-[10px] text-blue-400 font-mono">Lead BME Officer</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('bme.sarah@hospital.org', 'Demo@2026')}
                    className="text-left p-2 rounded bg-slate-900 hover:bg-slate-900/80 border border-slate-700 hover:border-blue-500/50 transition-all text-xs cursor-pointer"
                  >
                    <div className="font-semibold text-slate-200">Sarah Chen</div>
                    <div className="text-[10px] text-blue-400 font-mono">Assistant BME</div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              {regError && (
                <div className="p-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccessMsg && (
                <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{regSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative rounded">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="reg-name-input"
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Rajesh Kumar"
                      className="block w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Designation <span className="text-red-400">*</span>
                  </label>
                  <div className="relative rounded">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="reg-designation-input"
                      type="text"
                      value={regDesignation}
                      onChange={(e) => setRegDesignation(e.target.value)}
                      placeholder="Biomedical Engineer"
                      className="block w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Mobile Number (10 digits) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative rounded">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="reg-mobile-input"
                      type="tel"
                      value={regMobile}
                      onChange={(e) => setRegMobile(e.target.value)}
                      placeholder="9845012345"
                      className="block w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative rounded">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="reg-email-input"
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="rajesh@hospital.org"
                      className="block w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Hospital / Institution Name <span className="text-red-400">*</span>
                </label>
                <div className="relative rounded">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <input
                    id="reg-hospital-input"
                    type="text"
                    value={regHospital}
                    onChange={(e) => setRegHospital(e.target.value)}
                    placeholder="e.g. City General Superspeciality Hospital"
                    className="block w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Password (min 6 chars) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative rounded">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="reg-password-input"
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-8 pr-8 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative rounded">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="reg-confirm-password-input"
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-8 pr-8 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="reg-submit-btn"
                  className="w-full flex justify-center items-center gap-2 py-2 px-4 rounded shadow-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <span>Complete Registration</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-5 text-center text-[11px] font-mono text-slate-500">
          Hospital Biomedical Document Management System (HBDMS) • v2.4
        </div>
      </div>
    </div>
  );
};
