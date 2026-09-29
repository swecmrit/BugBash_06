import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Employee,
  LeaveRequest,
  LeaveType,
  PublicHoliday,
  ToastNotification,
  UserRole,
} from '../types/leave';
import {
  INITIAL_EMPLOYEES,
  INITIAL_LEAVE_REQUESTS,
  PUBLIC_HOLIDAYS_2026,
} from '../data/mockData';
import { calculateWorkingDays } from '../utils/dateUtils';

interface LeaveBalanceSummary {
  total: number;
  used: number;
  pending: number;
  available: number;
}

interface LeaveContextType {
  currentUser: Employee;
  setCurrentUser: (user: Employee) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  employees: Employee[];
  requests: LeaveRequest[];
  holidays: PublicHoliday[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isApplyModalOpen: boolean;
  setIsApplyModalOpen: (open: boolean) => void;
  toasts: ToastNotification[];
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  getEmployeeBalances: (employeeId: string) => Record<LeaveType, LeaveBalanceSummary>;
  applyLeave: (
    leaveType: LeaveType,
    startDate: string,
    endDate: string,
    reason: string
  ) => { success: boolean; message?: string };
  cancelLeave: (requestId: string) => { success: boolean; message?: string };
  approveLeave: (requestId: string, note?: string) => { success: boolean; message?: string };
  rejectLeave: (requestId: string, reason: string) => { success: boolean; message?: string };
  resetToDefaults: () => void;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

const STORAGE_KEYS = {
  EMPLOYEES: 'leaveease_employees_in_v2',
  REQUESTS: 'leaveease_requests_in_v2',
  CURRENT_USER_ID: 'leaveease_current_user_in_v2',
  CURRENT_ROLE: 'leaveease_current_role_in_v2',
};

export const LeaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from LocalStorage or fallbacks
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });

  const [requests, setRequests] = useState<LeaveRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
    } catch {
      return INITIAL_LEAVE_REQUESTS;
    }
  });

  const [currentRoleId, setCurrentRoleId] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE);
      return (saved as UserRole) || 'employee';
    } catch {
      return 'employee';
    }
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      return saved || 'EMP-1042'; // Default: Ananya Sharma
    } catch {
      return 'EMP-1042';
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    } catch (e) {
      console.error('Failed to save employees', e);
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    } catch (e) {
      console.error('Failed to save requests', e);
    }
  }, [requests]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, currentRoleId);
    } catch (e) {
      console.error('Failed to save role', e);
    }
  }, [currentRoleId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    } catch (e) {
      console.error('Failed to save user id', e);
    }
  }, [currentUserId]);

  // When in manager mode, active user profile is Rajesh Nair (EMP-1001); in employee mode, Ananya Sharma (EMP-1042)
  const activeEmployeeId = currentRoleId === 'manager' ? 'EMP-1001' : 'EMP-1042';
  const currentUser = employees.find((e) => e.id === activeEmployeeId) || employees[0];

  const setCurrentUser = (user: Employee) => {
    setCurrentUserId(user.id);
  };

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleId(role);
    if (role === 'manager') {
      setCurrentUserId('EMP-1001'); // Switch to Rajesh Nair (Manager)
    } else {
      setCurrentUserId('EMP-1042'); // Switch to Ananya Sharma (Employee)
      // If currently on manager tab, switch back to dashboard
      if (activeTab === 'manager') {
        setActiveTab('dashboard');
      }
    }
  };

  const addToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  /**
   * Computes dynamic balances for an employee, factoring in:
   * - Total quota
   * - Approved days used
   * - Pending days applied for
   * - Real remaining available balance
   */
  const getEmployeeBalances = (employeeId: string): Record<LeaveType, LeaveBalanceSummary> => {
    const employee = employees.find((e) => e.id === employeeId) || employees[0];
    const employeeRequests = requests.filter((r) => r.employeeId === employeeId);

    const types: LeaveType[] = ['Casual', 'Sick', 'Earned'];
    const summary: Partial<Record<LeaveType, LeaveBalanceSummary>> = {};

    types.forEach((type) => {
      const quota = employee.balances[type] || { total: 10, used: 0 };
      const pendingDays = employeeRequests
        .filter((r) => r.leaveType === type && r.status === 'Pending')
        .reduce((sum, r) => sum + r.days, 0);

      const available = Math.max(0, quota.total - quota.used - pendingDays);

      summary[type] = {
        total: quota.total,
        used: quota.used,
        pending: pendingDays,
        available,
      };
    });

    return summary as Record<LeaveType, LeaveBalanceSummary>;
  };

  const applyLeave = (
    leaveType: LeaveType,
    startDate: string,
    endDate: string,
    reason: string
  ): { success: boolean; message?: string } => {
    if (!startDate || !endDate) {
      return { success: false, message: 'Please select both start and end dates.' };
    }

    if (!reason.trim()) {
      return { success: false, message: 'Please provide a clear reason for your leave request.' };
    }

    if (currentRoleId === 'manager') {
      return { success: false, message: 'Managers cannot submit leave requests.' };
    }

    const workingDays = calculateWorkingDays(startDate, endDate);
    if (workingDays <= 0) {
      return {
        success: false,
        message: 'The selected period contains zero working business days (e.g., weekend only).',
      };
    }

    const balances = getEmployeeBalances(currentUser.id);
    const balance = balances[leaveType];

    if (workingDays > balance.available) {
      return {
        success: false,
        message: `Insufficient leave balance: You requested ${workingDays} days, but only have ${balance.available} ${leaveType} leave days remaining.`,
      };
    }

    const newRequest: LeaveRequest = {
      id: `REQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeeAvatar: currentUser.avatar,
      department: currentUser.department,
      leaveType,
      startDate,
      endDate,
      days: workingDays,
      reason: reason.trim(),
      appliedOn: '2026-09-29',
      status: 'Pending',
    };

    setRequests((prev) => [newRequest, ...prev]);
    addToast(
      'Leave Request Submitted',
      `Your request for ${workingDays} day(s) of ${leaveType} leave has been sent for review.`,
      'success'
    );
    setIsApplyModalOpen(false);
    return { success: true };
  };

  const cancelLeave = (requestId: string): { success: boolean; message?: string } => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Request not found.' };

    if (req.status !== 'Pending') {
      return { success: false, message: 'Only pending requests can be cancelled.' };
    }

    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Cancelled' as const } : r))
    );

    addToast(
      'Request Cancelled',
      `Leave request ${requestId} has been successfully cancelled.`,
      'info'
    );
    return { success: true };
  };

  const approveLeave = (requestId: string, note?: string): { success: boolean; message?: string } => {
    if (currentRoleId !== 'manager') {
      addToast('Access Denied', 'Only managers have authorization to approve leave requests.', 'error');
      return { success: false, message: 'Only managers can approve leaves.' };
    }

    const req = requests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Request not found.' };

    if (req.status !== 'Pending') {
      return { success: false, message: 'This request has already been processed.' };
    }

    // 1. Update request status
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Approved',
              reviewedBy: 'Rajesh Nair',
              reviewedAt: '2026-09-29',
              managerNote: note || 'Approved by Manager',
            }
          : r
      )
    );

    // 2. Update employee's used balance
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === req.employeeId) {
          const currentQuota = emp.balances[req.leaveType] || { total: 10, used: 0 };
          return {
            ...emp,
            balances: {
              ...emp.balances,
              [req.leaveType]: {
                ...currentQuota,
                used: currentQuota.used + req.days,
              },
            },
          };
        }
        return emp;
      })
    );

    addToast(
      'Request Approved',
      `Approved ${req.days} day(s) of ${req.leaveType} leave for ${req.employeeName}.`,
      'success'
    );
    return { success: true };
  };

  const rejectLeave = (requestId: string, reason: string): { success: boolean; message?: string } => {
    if (currentRoleId !== 'manager') {
      addToast('Access Denied', 'Only managers have authorization to reject leave requests.', 'error');
      return { success: false, message: 'Only managers can reject leaves.' };
    }

    const req = requests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Request not found.' };

    if (req.status !== 'Pending') {
      return { success: false, message: 'This request has already been processed.' };
    }

    if (!reason || !reason.trim()) {
      return { success: false, message: 'Rejection reason is required.' };
    }

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Rejected',
              reviewedBy: 'Rajesh Nair',
              reviewedAt: '2026-09-29',
              rejectionReason: reason.trim(),
            }
          : r
      )
    );

    addToast(
      'Request Rejected',
      `Leave request ${requestId} for ${req.employeeName} was rejected.`,
      'info'
    );
    return { success: true };
  };

  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_ROLE);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);

    setEmployees(INITIAL_EMPLOYEES);
    setRequests(INITIAL_LEAVE_REQUESTS);
    setCurrentRoleId('employee');
    setCurrentUserId('EMP-1042');
    setActiveTab('dashboard');
    addToast('Data Reset', 'All demo data and balances have been restored to initial state.', 'info');
  };

  return (
    <LeaveContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        currentRole: currentRoleId,
        setCurrentRole,
        employees,
        requests,
        holidays: PUBLIC_HOLIDAYS_2026,
        activeTab,
        setActiveTab,
        isApplyModalOpen,
        setIsApplyModalOpen,
        toasts,
        addToast,
        removeToast,
        getEmployeeBalances,
        applyLeave,
        cancelLeave,
        approveLeave,
        rejectLeave,
        resetToDefaults,
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
};

export const useLeave = () => {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
};
