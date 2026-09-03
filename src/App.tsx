import React, { useState, useEffect } from 'react';
import { User, ModuleType, UserProfile, SupportingDocument } from './types';
import { authService } from './services/authService';
import { storageService } from './services/storageService';
import { AuthView } from './components/auth/AuthView';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { GenericModuleView } from './components/modules/GenericModuleView';
import { ProfileView } from './components/profile/ProfileView';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { RecordDetailModal } from './components/common/RecordDetailModal';
import { RecordFormModal } from './components/common/RecordFormModal';
import { DocumentViewerModal } from './components/common/DocumentViewerModal';
import { DeleteConfirmModal } from './components/common/DeleteConfirmModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authService.getCurrentUser());
  const [currentModule, setCurrentModule] = useState<ModuleType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [renderTrigger, setRenderTrigger] = useState(0);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Detail Modal
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    moduleType: ModuleType;
    record: any;
  }>({
    isOpen: false,
    moduleType: 'master_asset',
    record: null,
  });

  // Form Modal (Create / Edit)
  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    moduleType: ModuleType;
    recordToEdit: any | null;
  }>({
    isOpen: false,
    moduleType: 'master_asset',
    recordToEdit: null,
  });

  // Document Viewer Modal
  const [viewingDoc, setViewingDoc] = useState<SupportingDocument | null>(null);

  // Delete Confirm Modal
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    moduleType: ModuleType;
    record: any;
  }>({
    isOpen: false,
    moduleType: 'master_asset',
    record: null,
  });

  // Subscribe to storage and auth changes for live updates
  useEffect(() => {
    const unsubscribeStorage = storageService.subscribe(() => {
      setRenderTrigger((prev) => prev + 1);
    });
    const unsubscribeAuth = authService.subscribe((user) => {
      setCurrentUser(user);
    });
    return () => {
      unsubscribeStorage();
      unsubscribeAuth();
    };
  }, []);

  // Global search shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLoginSuccess = (user?: User | UserProfile) => {
    const active = user || authService.getCurrentUser();
    if (active) {
      setCurrentUser(active);
      setCurrentModule('dashboard');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const handleOpenNewRecord = (moduleType: ModuleType) => {
    const targetModule = moduleType === 'dashboard' ? 'daily_rounds' : moduleType;
    setFormModal({
      isOpen: true,
      moduleType: targetModule,
      recordToEdit: null,
    });
  };

  const handleViewRecord = (moduleType: ModuleType, record: any) => {
    setDetailModal({
      isOpen: true,
      moduleType,
      record,
    });
  };

  const handleEditRecord = (moduleType: ModuleType, record: any) => {
    setFormModal({
      isOpen: true,
      moduleType,
      recordToEdit: record,
    });
  };

  const handleDeletePrompt = (moduleType: ModuleType, record: any) => {
    setDeleteModal({
      isOpen: true,
      moduleType,
      record,
    });
  };

  const handleConfirmDelete = () => {
    const { moduleType, record } = deleteModal;
    if (!record) return;

    switch (moduleType) {
      case 'master_asset':
        storageService.deleteRecord('masterAssets', record.id);
        break;
      case 'daily_rounds':
        storageService.deleteRecord('dailyRounds', record.id);
        break;
      case 'breakdown':
        storageService.deleteRecord('breakdowns', record.id);
        break;
      case 'po_invoice_install':
        storageService.deleteRecord('poInvoices', record.id);
        break;
      case 'preventive_maintenance':
        storageService.deleteRecord('preventiveMaintenances', record.id);
        break;
      case 'calibration':
        storageService.deleteRecord('calibrations', record.id);
        break;
      case 'service_report':
        storageService.deleteRecord('serviceReports', record.id);
        break;
      case 'gate_pass':
        storageService.deleteRecord('gatePasses', record.id);
        break;
      case 'discarding':
        storageService.deleteRecord('discardingReports', record.id);
        break;
      case 'handover':
        storageService.deleteRecord('handovers', record.id);
        break;
      case 'user_training':
        storageService.deleteRecord('userTrainings', record.id);
        break;
      case 'recall':
        storageService.deleteRecord('recalls', record.id);
        break;
    }
  };

  // If user is not authenticated, show modern credential-based login view (Section 31)
  if (!currentUser) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Header Navigation */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenGlobalSearch={() => setIsSearchOpen(true)}
        onOpenNewRecord={() => handleOpenNewRecord(currentModule)}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        sidebarOpen={isSidebarOpen}
        currentModule={currentModule}
        onNavigate={setCurrentModule}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Module Sidebar Navigation */}
        <Sidebar
          currentModule={currentModule}
          onSelectModule={setCurrentModule}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {currentModule === 'dashboard' ? (
              <DashboardView
                key={`dashboard-${renderTrigger}`}
                onNavigate={setCurrentModule}
                onOpenNewRecord={handleOpenNewRecord}
                onViewRecord={handleViewRecord}
                onOpenGlobalSearch={() => setIsSearchOpen(true)}
              />
            ) : (currentModule as string) === 'profile' ? (
              <ProfileView
                currentUser={currentUser}
                onNavigate={setCurrentModule}
                onLogout={handleLogout}
              />
            ) : (
              <GenericModuleView
                key={`${currentModule}-${renderTrigger}`}
                moduleType={currentModule}
                onOpenNewRecord={handleOpenNewRecord}
                onViewRecord={handleViewRecord}
                onEditRecord={handleEditRecord}
                onDeleteRecord={handleDeletePrompt}
                onViewDoc={(doc) => setViewingDoc(doc)}
                onNavigate={setCurrentModule}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Instant Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectRecord={(mod, rec) => {
          setCurrentModule(mod);
          handleViewRecord(mod, rec);
        }}
      />

      {/* Full Sheet Record Detail Modal with Printing and Attachments */}
      {detailModal.isOpen && (
        <RecordDetailModal
          moduleType={detailModal.moduleType}
          record={detailModal.record}
          onClose={() => setDetailModal({ isOpen: false, moduleType: 'master_asset', record: null })}
          onEdit={(mod, rec) => handleEditRecord(mod, rec)}
          onViewDoc={(doc) => setViewingDoc(doc)}
        />
      )}

      {/* Standardized Record Form Modal (All 12 Modules & Auto-fill from Assets) */}
      {formModal.isOpen && (
        <RecordFormModal
          moduleType={formModal.moduleType}
          recordToEdit={formModal.recordToEdit}
          isOpen={formModal.isOpen}
          onClose={() => setFormModal({ isOpen: false, moduleType: 'master_asset', recordToEdit: null })}
          onSaveSuccess={() => {
            setRenderTrigger((prev) => prev + 1);
          }}
        />
      )}

      {/* Supporting Document & Certificate Viewer */}
      {viewingDoc && (
        <DocumentViewerModal
          document={viewingDoc}
          onClose={() => setViewingDoc(null)}
        />
      )}

      {/* Confirm Deletion Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="Confirm Record Deletion"
        description="Are you sure you want to delete this biomedical record? This action will remove the record and any linked document references from the local system store."
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModal({ isOpen: false, moduleType: 'master_asset', record: null })}
      />
    </div>
  );
}
