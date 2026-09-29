import React from 'react';
import { useLeave } from '../../context/LeaveContext';
import {
  LayoutDashboard,
  CalendarPlus,
  FileClock,
  CheckSquare,
  CalendarDays,
  User,
  ShieldAlert,
  ChevronRight,
  LogOut,
  HelpCircle,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, requests, currentRole, setIsApplyModalOpen, currentUser } =
    useLeave();

  const pendingApprovalsCount = requests.filter((r) => r.status === 'Pending').length;
  const myPendingCount = requests.filter(
    (r) => r.employeeId === currentUser.id && r.status === 'Pending'
  ).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    ...(currentRole === 'employee'
      ? [
          {
            id: 'apply',
            label: 'Apply for Leave',
            icon: CalendarPlus,
            badge: null,
          },
        ]
      : []),
    {
      id: 'requests',
      label: currentRole === 'manager' ? 'Leave Requests' : 'My Requests',
      icon: FileClock,
      badge: myPendingCount > 0 ? `${myPendingCount}` : null,
    },
    ...(currentRole === 'manager'
      ? [
          {
            id: 'manager',
            label: 'Approval Panel',
            icon: CheckSquare,
            badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount}` : null,
            highlight: true,
          },
        ]
      : []),
    {
      id: 'calendar',
      label: 'Leave Calendar',
      icon: CalendarDays,
      badge: null,
    },
    {
      id: 'profile',
      label: currentRole === 'manager' ? 'Manager Profile' : 'Employee Profile',
      icon: User,
      badge: null,
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Top Brand & Close on Mobile */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                LE
              </span>
              <span className="text-base font-bold tracking-tight text-slate-900">
                LeaveEase
              </span>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3 flex-1 overflow-y-auto space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Navigation
            </div>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-violet-50 text-violet-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-violet-700' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 text-[10.5px] font-mono font-bold rounded-md ${
                        item.id === 'manager'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-violet-100 text-violet-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Apply CTA Box */}
          {currentRole !== 'manager' && <div className="p-4 border-t border-slate-100">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50/50 border border-violet-100 text-xs">
              <span className="font-bold text-violet-950 block">Quick Time Off</span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Check quotas & request dates in seconds.
              </p>
              <button
                onClick={() => {
                  setIsApplyModalOpen(true);
                  onCloseMobile();
                }}
                className="w-full mt-2.5 py-2 px-3 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>+ Apply for Leave</span>
              </button>
            </div>
          </div>}
        </div>
      </aside>
    </>
  );
};
