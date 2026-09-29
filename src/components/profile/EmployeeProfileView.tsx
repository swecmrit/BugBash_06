import React from 'react';
import { useLeave } from '../../context/LeaveContext';
import { LeaveType } from '../../types/leave';
import { formatDisplayDate } from '../../utils/dateUtils';
import { StatusBadge, LeaveTypeBadge } from '../common/StatusBadge';
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  UserCheck,
  Award,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const EmployeeProfileView: React.FC = () => {
  const { currentUser, employees, setCurrentUser, getEmployeeBalances, requests } = useLeave();
  const balances = getEmployeeBalances(currentUser.id);
  const myRequests = requests.filter((r) => r.employeeId === currentUser.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Cover banner with soft corporate lavender gradient */}
        <div className="h-28 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-500 relative" />

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-white shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-900">{currentUser.name}</h2>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {currentUser.id}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600 mt-0.5">
                  {currentUser.designation} · {currentUser.department}
                </p>
              </div>
            </div>

            {/* Official Employment Status */}
            <div className="sm:self-end bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <div>
                <span className="font-semibold text-slate-800 block">Permanent Full-Time</span>
                <span className="text-[11px] text-slate-500">IST (UTC+05:30) · India Operations</span>
              </div>
            </div>
          </div>

          {/* Metadata badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-violet-500 shrink-0" />
              <span className="truncate">{currentUser.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-violet-500 shrink-0" />
              <span>{currentUser.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-500 shrink-0" />
              <span>Joined {formatDisplayDate(currentUser.joinDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-violet-500 shrink-0" />
              <span>Reports to: <strong className="text-slate-800">{currentUser.managerName}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Balances Matrix */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
          Annual Leave Quotas & Allocation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['Casual', 'Sick', 'Earned'] as LeaveType[]).map((type) => {
            const b = balances[type];
            const pctUsed = Math.min(100, Math.round((b.used / b.total) * 100));

            return (
              <div
                key={type}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LeaveTypeBadge type={type} />
                  </div>
                  <span className="text-xs text-slate-400 font-mono">2026 Cycle</span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-extrabold font-mono text-slate-900">
                      {b.available}
                    </span>
                    <span className="text-xs text-slate-500 ml-1.5 font-medium">days available</span>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    Total: <span className="font-mono font-semibold text-slate-800">{b.total}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      type === 'Casual'
                        ? 'bg-violet-500'
                        : type === 'Sick'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pctUsed}%` }}
                  />
                </div>

                {/* Breakdown details */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Approved</span>
                    <span className="font-mono font-bold text-slate-800">{b.used}d</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">In Review</span>
                    <span className="font-mono font-bold text-amber-600">{b.pending}d</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Remaining</span>
                    <span className="font-mono font-bold text-emerald-600">{b.available}d</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Employee Leave History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Personal Leave History</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive log of all leaves requested by {currentUser.name}.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {myRequests.length} total applications
          </span>
        </div>

        {myRequests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No leave records found for this employee profile yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Days</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes / Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {req.id}
                    </td>
                    <td className="py-3 px-4">
                      <LeaveTypeBadge type={req.leaveType} />
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {formatDisplayDate(req.startDate)} - {formatDisplayDate(req.endDate)}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {req.days}d
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {req.rejectionReason || req.managerNote || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
