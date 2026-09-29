import React, { useState } from 'react';
import { useLeave } from '../../context/LeaveContext';
import { LeaveRequest, LeaveType } from '../../types/leave';
import { formatDisplayDate, parseISODate } from '../../utils/dateUtils';
import { LeaveTypeBadge } from '../common/StatusBadge';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Flag,
  User,
  X,
  Info,
} from 'lucide-react';

export const LeaveCalendarView: React.FC = () => {
  const { requests, holidays, currentUser } = useLeave();

  // Selected calendar month/year. Default to October 2026 where several sample leaves and holidays are active
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 1)); // October 2026
  const [selectedDayEvents, setSelectedDayEvents] = useState<{
    dateStr: string;
    leaves: LeaveRequest[];
    holiday?: { name: string; description: string };
  } | null>(null);

  const [filterType, setFilterType] = useState<string>('All');
  const [scope, setScope] = useState<'all' | 'my'>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date(2026, 8, 29)); // Sept 29, 2026
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Compute calendar days
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sun, 1 is Mon...
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Days in previous month
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Only consider approved requests
  const approvedRequests = requests.filter((r) => {
    if (r.status !== 'Approved') return false;
    if (scope === 'my' && r.employeeId !== currentUser.id) return false;
    if (filterType !== 'All' && r.leaveType !== filterType) return false;
    return true;
  });

  // Helper to format date string YYYY-MM-DD
  const toDateStr = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Check if a request covers a specific date
  const getLeavesForDate = (dateStr: string): LeaveRequest[] => {
    return approvedRequests.filter((r) => {
      return dateStr >= r.startDate && dateStr <= r.endDate;
    });
  };

  const getHolidayForDate = (dateStr: string) => {
    return holidays.find((h) => h.date === dateStr);
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calendar cells
  const calendarCells: {
    dayNumber: number;
    isCurrentMonth: boolean;
    dateStr: string;
    isWeekend: boolean;
  }[] = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevM = month === 0 ? 11 : month - 1;
    const prevY = month === 0 ? year - 1 : year;
    const dateStr = toDateStr(prevY, prevM, d);
    const dayOfWeek = new Date(prevY, prevM, d).getDay();
    calendarCells.push({
      dayNumber: d,
      isCurrentMonth: false,
      dateStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = toDateStr(year, month, d);
    const dayOfWeek = new Date(year, month, d).getDay();
    calendarCells.push({
      dayNumber: d,
      isCurrentMonth: true,
      dateStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  // Next month leading days to complete grid to 35 or 42
  const totalSlots = Math.ceil(calendarCells.length / 7) * 7;
  const remaining = totalSlots - calendarCells.length;
  for (let d = 1; d <= remaining; d++) {
    const nextM = month === 11 ? 0 : month + 1;
    const nextY = month === 11 ? year + 1 : year;
    const dateStr = toDateStr(nextY, nextM, d);
    const dayOfWeek = new Date(nextY, nextM, d).getDay();
    calendarCells.push({
      dayNumber: d,
      isCurrentMonth: false,
      dateStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  const handleCellClick = (dateStr: string) => {
    const leaves = getLeavesForDate(dateStr);
    const holiday = getHolidayForDate(dateStr);
    if (leaves.length > 0 || holiday) {
      setSelectedDayEvents({ dateStr, leaves, holiday });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Leave Calendar</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View team availability, scheduled time off, and upcoming corporate holidays.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
            <span className="text-slate-600">Casual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600">Sick</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Earned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-slate-600">Holiday</span>
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-violet-50/30 to-white">
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
              <button
                onClick={prevMonth}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                title="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-bold text-slate-900 tracking-tight ml-1 font-mono">
              {monthName} {year}
            </h3>

            <button
              onClick={goToday}
              className="px-2.5 py-1 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-md border border-violet-200/70 transition-colors ml-2"
            >
              Today
            </button>
          </div>

          {/* Scope and Filter dropdowns */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setScope('all')}
                className={`px-2.5 py-1 font-medium rounded-md transition-all ${
                  scope === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Team
              </button>
              <button
                onClick={() => setScope('my')}
                className={`px-2.5 py-1 font-medium rounded-md transition-all ${
                  scope === 'my'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Leaves
              </button>
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="All">All Categories</option>
              <option value="Casual">Casual</option>
              <option value="Sick">Sick</option>
              <option value="Earned">Earned</option>
            </select>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70 text-center py-2.5 text-xs font-semibold text-slate-500">
          {daysOfWeek.map((day, idx) => (
            <div key={day} className={idx === 0 || idx === 6 ? 'text-slate-400' : 'text-slate-700'}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {calendarCells.map((cell, idx) => {
            const leaves = getLeavesForDate(cell.dateStr);
            const holiday = getHolidayForDate(cell.dateStr);
            const isToday = cell.dateStr === '2026-09-29';

            return (
              <div
                key={idx}
                onClick={() => handleCellClick(cell.dateStr)}
                className={`min-h-[105px] p-2 transition-all flex flex-col justify-between ${
                  !cell.isCurrentMonth
                    ? 'bg-slate-50/50 text-slate-300'
                    : cell.isWeekend
                    ? 'bg-slate-50/30'
                    : 'bg-white'
                } ${
                  leaves.length > 0 || holiday
                    ? 'cursor-pointer hover:bg-violet-50/40'
                    : 'cursor-default'
                }`}
              >
                {/* Cell Header: Day Number & Holiday indicator */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center text-xs font-mono font-semibold rounded-full w-6 h-6 ${
                      isToday
                        ? 'bg-violet-600 text-white shadow-2xs'
                        : cell.isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {holiday && (
                    <span
                      title={holiday.name}
                      className="p-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    >
                      <Flag className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Badges / Events inside cell */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {holiday && (
                    <div className="truncate px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200/70 text-[10.5px] font-medium text-indigo-700">
                      ★ {holiday.name}
                    </div>
                  )}

                  {leaves.slice(0, 2).map((leave) => {
                    const isCasual = leave.leaveType === 'Casual';
                    const isSick = leave.leaveType === 'Sick';

                    return (
                      <div
                        key={leave.id}
                        className={`truncate px-1.5 py-0.5 rounded border text-[11px] font-medium transition-all ${
                          isCasual
                            ? 'bg-violet-50 text-violet-700 border-violet-200/80'
                            : isSick
                            ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                        }`}
                        title={`${leave.employeeName} (${leave.leaveType} Leave)`}
                      >
                        {leave.employeeName.split(' ')[0]} ({leave.leaveType[0]})
                      </div>
                    );
                  })}

                  {leaves.length > 2 && (
                    <div className="text-[10px] text-slate-500 font-medium pl-1">
                      +{leaves.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail Popover / Modal */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-violet-50/50">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-violet-600" />
                <h3 className="text-sm font-bold text-slate-900 font-mono">
                  {formatDisplayDate(selectedDayEvents.dateStr)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Holiday detail */}
              {selectedDayEvents.holiday && (
                <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs">
                  <div className="flex items-center gap-2 font-bold text-indigo-900">
                    <Flag className="w-4 h-4 text-indigo-600" />
                    <span>Official Holiday: {selectedDayEvents.holiday.name}</span>
                  </div>
                  <p className="text-indigo-700 mt-1">{selectedDayEvents.holiday.description}</p>
                </div>
              )}

              {/* Leaves detail */}
              {selectedDayEvents.leaves.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-2">
                  No employees on approved leave on this date.
                </p>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Colleagues on Leave ({selectedDayEvents.leaves.length})
                  </h4>
                  {selectedDayEvents.leaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={leave.employeeAvatar}
                            alt={leave.employeeName}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900">{leave.employeeName}</span>
                            <span className="text-[11px] text-slate-500 block">
                              {leave.department}
                            </span>
                          </div>
                        </div>
                        <LeaveTypeBadge type={leave.leaveType} />
                      </div>

                      <div className="text-slate-600 flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11.5px]">
                        <span>
                          {formatDisplayDate(leave.startDate)} - {formatDisplayDate(leave.endDate)}
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {leave.days} {leave.days === 1 ? 'day' : 'days'}
                        </span>
                      </div>

                      <p className="text-slate-600 italic">"{leave.reason}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
