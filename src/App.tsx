import React, { useState } from 'react';
import { LeaveProvider, useLeave } from './context/LeaveContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ApplyLeaveView } from './components/apply/ApplyLeaveView';
import { LeaveRequestsView } from './components/requests/LeaveRequestsView';
import { ManagerApprovalView } from './components/manager/ManagerApprovalView';
import { LeaveCalendarView } from './components/calendar/LeaveCalendarView';
import { EmployeeProfileView } from './components/profile/EmployeeProfileView';
import { ApplyLeaveModal } from './components/apply/ApplyLeaveModal';
import { ToastContainer } from './components/common/Toast';

const AppContent: React.FC = () => {
  const { activeTab, isApplyModalOpen, setIsApplyModalOpen, currentRole } = useLeave();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'apply':
        return <ApplyLeaveView />;
      case 'requests':
        return <LeaveRequestsView />;
      case 'manager':
        return currentRole === 'manager' ? <ManagerApprovalView /> : <DashboardView />;
      case 'calendar':
        return <LeaveCalendarView />;
      case 'profile':
        return <EmployeeProfileView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-800 flex">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top Navbar */}
        <Navbar onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)} />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Apply Modal */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <LeaveProvider>
      <AppContent />
    </LeaveProvider>
  );
}
