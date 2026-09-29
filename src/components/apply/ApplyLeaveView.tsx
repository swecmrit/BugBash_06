import React, { useState } from 'react';
import { useLeave } from '../../context/LeaveContext';
import { LeaveType } from '../../types/leave';
import { calculateWorkingDays, formatDisplayDate } from '../../utils/dateUtils';
import { Calendar, AlertCircle, CheckCircle2, Clock, ShieldCheck, HelpCircle } from 'lucide-react';

export const ApplyLeaveView: React.FC = () => {
  const { currentUser, getEmployeeBalances, applyLeave, setActiveTab } = useLeave();
  const balances = getEmployeeBalances(currentUser.id);

  const [leaveType, setLeaveType] = useState<LeaveType>('Casual');
  const [startDate, setStartDate] = useState<string>('2026-10-14');
  const [endDate, setEndDate] = useState<string>('2026-10-16');
  const [reason, setReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentQuota = balances[leaveType] || { total: 0, used: 0, pending: 0, available: 0 };
  const workingDays = calculateWorkingDays(startDate, endDate);
  const exceedsBalance = workingDays > currentQuota.available;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!startDate || !endDate) {
      setErrorMsg('Please select both start and end dates.');
      return;
    }

    if (workingDays <= 0) {
      setErrorMsg('The selected dates contain 0 working business days.');
      return;
    }

    if (exceedsBalance) {
      setErrorMsg(
        `Insufficient balance: Requested ${workingDays} days, but only ${currentQuota.available} ${leaveType} leave days are available.`
      );
      return;
    }

    if (!reason.trim()) {
      setErrorMsg('Please provide a reason for your leave request.');
      return;
    }

    const res = applyLeave(leaveType, startDate, endDate, reason);
    if (!res.success) {
      setErrorMsg(res.message || 'Error submitting leave request.');
    } else {
      setReason('');
      // Navigate to requests view
      setActiveTab('requests');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Apply for Leave</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Submit a planned absence or medical leave for line manager sign-off.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Leave Type selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Leave Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Casual', 'Sick', 'Earned'] as LeaveType[]).map((type) => {
                  const isSelected = leaveType === type;
                  const b = balances[type];
                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={() => {
                        setLeaveType(type);
                        setErrorMsg(null);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-violet-600 bg-violet-50/60 ring-2 ring-violet-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-xs text-slate-900">{type} Leave</div>
                      <div className="text-xs text-slate-500 mt-1">
                        <span className="font-mono font-bold text-slate-800">{b.available}</span> days left
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dates */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                2. Select Date Range
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Start Date</span>
                  <input
                    type="date"
                    value={startDate}
                    min="2026-09-01"
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setErrorMsg(null);
                      if (!endDate || new Date(e.target.value) > new Date(endDate)) {
                        setEndDate(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                    required
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-1">End Date</span>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || '2026-09-01'}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setErrorMsg(null);
                    }}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Calculated summary */}
            {startDate && endDate && (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                  exceedsBalance
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-violet-50/50 border-violet-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-600" />
                  <div>
                    <span className="font-medium text-slate-800">
                      {`${formatDisplayDate(startDate)} — ${formatDisplayDate(endDate)}`}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Business days automatically calculate excluding weekends
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-slate-900">
                    {workingDays} {workingDays === 1 ? 'day' : 'days'}
                  </span>
                  <span className="block text-[11px] text-slate-500">Duration</span>
                </div>
              </div>
            )}

            {/* Reason */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  3. Reason for Leave
                </label>
                <span className="text-[11px] text-slate-400">Required</span>
              </div>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Please outline the purpose of your time away (e.g. personal family festival, wedding ceremonies in Jaipur, medical checkup, or planned vacation)..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 placeholder:text-slate-400"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={exceedsBalance || workingDays <= 0}
                className={`px-5 py-2.5 text-xs font-medium text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5 ${
                  exceedsBalance || workingDays <= 0
                    ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                    : 'bg-violet-600 hover:bg-violet-700 active:scale-[0.98]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Leave Request</span>
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Info & Balances */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-violet-600" />
              <span>Current Leave Quotas</span>
            </h3>
            <div className="space-y-3">
              {(['Casual', 'Sick', 'Earned'] as LeaveType[]).map((type) => {
                const b = balances[type];
                const pct = Math.min(100, Math.round((b.used / b.total) * 100));
                return (
                  <div key={type} className="p-3 rounded-xl bg-slate-50 border border-slate-150">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-800">{type} Leave</span>
                      <span className="font-mono text-slate-600">
                        <strong className="text-slate-900">{b.available}</strong> / {b.total} left
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          type === 'Casual'
                            ? 'bg-violet-500'
                            : type === 'Sick'
                            ? 'bg-amber-500'
                            : 'bg-indigo-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                      <span>Used: {b.used}d</span>
                      <span>Pending: {b.pending}d</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-violet-50/60 rounded-2xl border border-violet-150 p-4 text-xs text-slate-700">
            <div className="flex items-center gap-2 font-semibold text-violet-900 mb-1">
              <HelpCircle className="w-4 h-4 text-violet-600" />
              <span>Approval SLA Policy</span>
            </div>
            <p className="text-slate-600 text-[11.5px] leading-relaxed">
              Your reporting manager, <strong>{currentUser.managerName}</strong>, typically reviews
              and signs off on submissions within 24–48 business hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
