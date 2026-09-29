import React from 'react';
import { useLeave } from '../../context/LeaveContext';
import { LeaveType, LeaveRequest } from '../../types/leave';
import { formatDisplayDate, getDaysUntil } from '../../utils/dateUtils';
import { StatusBadge, LeaveTypeBadge } from '../common/StatusBadge';
import {
  Calendar,
  Clock,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Palmtree,
  Stethoscope,
  Plane,
  Flag,
  Users,
  CheckCircle2,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    getEmployeeBalances,
    holidays,
    requests,
    setIsApplyModalOpen,
    setActiveTab,
    currentRole,
  } = useLeave();

  const balances = getEmployeeBalances(currentUser.id);

  // Recent requests for current user (or all if in manager role)
  const recentRequests = requests
    .filter((r) => (currentRole === 'manager' ? true : r.employeeId === currentUser.id))
    .slice(0, 4);

  // Upcoming public holidays (filtered to upcoming from today 2026-09-29)
  const upcomingHolidays = holidays.slice(0, 4);

  // Approved leaves currently active or coming soon (for "Who's away" section)
  const upcomingTeamLeaves = requests
    .filter((r) => r.status === 'Approved' && r.endDate >= '2026-09-29')
    .slice(0, 3);

  const getLeaveIcon = (type: LeaveType) => {
    switch (type) {
      case 'Casual':
        return <Palmtree className="w-5 h-5 text-violet-600" />;
      case 'Sick':
        return <Stethoscope className="w-5 h-5 text-amber-600" />;
      case 'Earned':
        return <Plane className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getLeaveBg = (type: LeaveType) => {
    switch (type) {
      case 'Casual':
        return 'bg-violet-50 text-violet-700 border-violet-100';
      case 'Sick':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Earned':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Personalized Welcome Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-violet-200 text-xs font-semibold uppercase tracking-wider">
            <span>LeaveEase India Portal</span>
            <span>·</span>
            <span>Tuesday, 29 September 2026 (IST)</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {currentUser.name.split(' ')[0]} 👋
          </h2>
          <p className="text-xs text-violet-100 max-w-lg">
            You have time off balances available across your leave categories. Planning a vacation or need personal time off?
          </p>
        </div>

        {currentRole !== 'manager' && (
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="px-4 py-2.5 text-xs font-semibold text-violet-950 bg-white hover:bg-violet-50 active:scale-[0.98] rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-violet-700" />
              <span>Apply for Leave</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Leave Balance Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Your Leave Balances
          </h3>
          <span className="text-xs text-slate-500 font-mono">Cycle: Jan 2026 – Dec 2026</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['Casual', 'Sick', 'Earned'] as LeaveType[]).map((type) => {
            const b = balances[type];
            const pctUsed = Math.min(100, Math.round((b.used / b.total) * 100));

            return (
              <div
                key={type}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl border ${getLeaveBg(type)}`}>
                        {getLeaveIcon(type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900">{type} Leave</h4>
                        <span className="text-[11px] text-slate-400">Total: {b.total} days</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold font-mono text-slate-900">
                        {b.available}
                      </span>
                      <span className="text-xs text-slate-500 block -mt-1 font-medium">Available</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        type === 'Casual'
                          ? 'bg-violet-600'
                          : type === 'Sick'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pctUsed}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-4 mt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>Used: <strong className="font-mono text-slate-700">{b.used}d</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Pending: <strong className="font-mono text-amber-700">{b.pending}d</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Middle Section: Recent Requests & Upcoming Holidays */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Recent Leave Requests (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Leave Requests</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest time off filings and approval statuses
              </p>
            </div>
            <button
              onClick={() => setActiveTab('requests')}
              className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentRequests.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No recent leave requests recorded.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 font-mono">{req.id}</span>
                        <span className="text-slate-300">·</span>
                        <LeaveTypeBadge type={req.leaveType} />
                        <span className="text-slate-300">·</span>
                        <span className="font-semibold text-slate-800 font-mono">
                          {formatDisplayDate(req.startDate)} - {formatDisplayDate(req.endDate)}
                        </span>
                      </div>
                      <p className="text-slate-500 truncate max-w-md mt-0.5" title={req.reason}>
                        {req.reason}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-slate-700 font-medium">
                      {req.days} {req.days === 1 ? 'day' : 'days'}
                    </span>
                    <StatusBadge status={req.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Public Holidays (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Flag className="w-4 h-4 text-violet-600" />
              <span>Upcoming Holidays</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Q4 2026</span>
          </div>

          <div className="space-y-3">
            {upcomingHolidays.map((holiday) => {
              const daysLeft = getDaysUntil(holiday.date);

              return (
                <div
                  key={holiday.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-900 block leading-tight">
                      {holiday.name}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {holiday.dayOfWeek} · {formatDisplayDate(holiday.date)}
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-violet-100/70 text-violet-800 font-mono">
                      {daysLeft > 0 ? `In ${daysLeft}d` : 'Today'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setActiveTab('calendar')}
            className="w-full text-center text-xs text-violet-600 hover:text-violet-800 font-semibold pt-1 transition-colors block"
          >
            Check Complete Calendar →
          </button>
        </div>
      </div>

      {/* 4. Team Availability Spotlight */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-600" />
            <h3 className="text-sm font-bold text-slate-900">Colleagues on Approved Leave</h3>
          </div>
          <span className="text-xs text-slate-500">Upcoming planned absences</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {upcomingTeamLeaves.map((leave) => (
            <div
              key={leave.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center gap-3 text-xs"
            >
              <img
                src={leave.employeeAvatar}
                alt={leave.employeeName}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 truncate">{leave.employeeName}</div>
                <div className="text-slate-500 text-[11px] truncate">{leave.department}</div>
                <div className="text-violet-700 font-mono text-[11px] font-medium mt-0.5">
                  {formatDisplayDate(leave.startDate)} – {formatDisplayDate(leave.endDate)} ({leave.days}d)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
