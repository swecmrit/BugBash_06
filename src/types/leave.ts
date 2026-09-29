export type LeaveType = 'Casual' | 'Sick' | 'Earned';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export type UserRole = 'employee' | 'manager';

export interface EmployeeBalance {
  total: number;
  used: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  managerId: string;
  managerName: string;
  avatar: string;
  joinDate: string;
  location: string;
  balances: Record<LeaveType, EmployeeBalance>;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  department: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  days: number;
  reason: string;
  appliedOn: string; // YYYY-MM-DD
  status: LeaveStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  managerNote?: string;
}

export interface PublicHoliday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  description: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}
