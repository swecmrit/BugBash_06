import React, { useState, useEffect } from 'react';
import { useLeave } from '../../context/LeaveContext';
import { LeaveType } from '../../types/leave';
import { calculateWorkingDays, formatDisplayDate } from '../../utils/dateUtils';
import { X, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, getEmployeeBalances, applyLeave } = useLeave();
  const balances = getEmployeeBalances(currentUser.id);

  const [leaveType, setLeaveType] = useState<LeaveType>('Casual');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Set default start date to tomorrow or next business day
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      // Default to 2026-10-05 if not set
      if (!startDate) {
        setStartDate('2026-10-05');
        setEndDate('2026-10-06');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
      setErrorMsg('Selected date range contains 0 working days (e.g. only weekends).');
      return;
    }

    if (exceedsBalance) {
      setErrorMsg(
        `Insufficient balance: You have requested ${workingDays} days, but only ${currentQuota.available} ${leaveType} leave days are available.`
      );
      return;
    }

    if (!reason.trim()) {
      setErrorMsg('Please state a reason for taking leave.');
      return;
    }

    const res = applyLeave(leaveType, startDate, endDate, reason);
    if (!res.success) {
      setErrorMsg(res.message || 'Failed to submit leave application.');
    } else {
      // Clear form
      setReason('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-violet-50/60 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Apply for Leave</h3>
              <p className="text-xs text-slate-500">Submit a leave request for manager approval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Leave Type Selector with Live Balance Badges */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Leave Category
            </label>
            <div className="grid grid-cols-3 gap-2.5">
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
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-violet-600 bg-violet-50/70 ring-2 ring-violet-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-xs font-semibold text-slate-900">{type} Leave</span>
                    <span className="text-xs text-slate-500 mt-1">
                      <span className="font-mono font-medium text-slate-800">{b.available}</span> days left
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Date
              </label>
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
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                min="2026-09-01"
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Calculation summary card */}
          {startDate && endDate && (
            <div
              className={`p-3 rounded-xl border transition-colors flex items-center justify-between text-xs ${
                exceedsBalance
                  ? 'bg-rose-50/70 border-rose-200 text-rose-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>
                  {`${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)}`}
                </span>
              </div>
              <div className="font-semibold font-mono">
                <span>
                  {workingDays} {workingDays === 1 ? 'Working Day' : 'Working Days'}
                </span>
              </div>
            </div>
          )}

          {/* Warning if exceeds */}
          {exceedsBalance && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Exceeds your available {leaveType} balance ({currentQuota.available} days left).
            </p>
          )}

          {/* Reason */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Reason for Leave
              </label>
              <span className="text-[11px] text-slate-400">Required</span>
            </div>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErrorMsg(null);
              }}
              placeholder="e.g. Attending sister's wedding ceremonies and family functions in Jaipur..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-colors placeholder:text-slate-400 resize-none"
              required
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={exceedsBalance || workingDays <= 0}
              className={`px-5 py-2 text-xs font-medium text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5 ${
                exceedsBalance || workingDays <= 0
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'bg-violet-600 hover:bg-violet-700 active:scale-[0.98]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Submit Leave Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
