import React, { useState } from 'react';
import { useLeave } from '../../context/LeaveContext';
import { LeaveRequest } from '../../types/leave';
import { formatDisplayDate } from '../../utils/dateUtils';
import { StatusBadge, LeaveTypeBadge } from '../common/StatusBadge';
import { RejectModal } from './RejectModal';
import {
  Check,
  X,
  Clock,
  CheckCircle2,
  Users,
  Building,
  Search,
  CheckCheck,
} from 'lucide-react';

export const ManagerApprovalView: React.FC = () => {
  const {
    requests,
    approveLeave,
    rejectLeave,
    getEmployeeBalances,
    currentRole,
    currentUser,
    setActiveTab,
  } = useLeave();

  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'history'>('pending');
  const [rejectingRequest, setRejectingRequest] = useState<LeaveRequest | null>(null);

  // Role Guard: Only managers can view this panel
  if (currentRole !== 'manager') {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Manager Access Only</h3>
        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
          Employees can only apply for leaves and view their balances. Only authorized managers (Rajesh Nair) can access the approval panel to approve or reject team requests.
        </p>
        <button
          onClick={() => setActiveTab('dashboard')}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === 'Pending');
  const historyRequests = requests.filter((r) => r.status === 'Approved' || r.status === 'Rejected');

  const departments = ['All', 'Engineering', 'Marketing', 'Finance', 'People & HR'];

  const displayedRequests = (activeSubTab === 'pending' ? pendingRequests : historyRequests).filter(
    (req) => {
      const matchesDept = selectedDept === 'All' || req.department.includes(selectedDept);
      const matchesSearch =
        req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    }
  );

  const handleApprove = (req: LeaveRequest) => {
    approveLeave(req.id);
  };

  const handleConfirmReject = (requestId: string, reason: string) => {
    rejectLeave(requestId, reason);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-700 bg-violet-100/70 px-2.5 py-0.5 rounded">
              Leadership Console
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">Rajesh Nair (VP of Engineering & Director)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manager Approval Panel</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review department leave applications, evaluate coverage, and process requests.
          </p>
        </div>

        {/* Quick stat cards */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-2 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Pending Review</span>
              <span className="text-base font-bold font-mono text-slate-900">
                {pendingRequests.length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 px-4 py-2 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Processed</span>
              <span className="text-base font-bold font-mono text-slate-900">
                {historyRequests.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation & Filters bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Sub-tabs: Pending vs History */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              onClick={() => setActiveSubTab('pending')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                activeSubTab === 'pending'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Requests</span>
              {pendingRequests.length > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                activeSubTab === 'history'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Decision History</span>
            </button>
          </div>

          {/* Department selector and search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <Building className="w-3.5 h-3.5 text-slate-400 ml-1" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    Dept: {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search employee or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 w-44 sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Requests List */}
        {displayedRequests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">
              {activeSubTab === 'pending' ? 'All Caught Up!' : 'No History Found'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {activeSubTab === 'pending'
                ? 'There are no pending leave requests awaiting manager sign-off for the selected filters.'
                : 'No historical approvals or rejections match your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayedRequests.map((req) => {
              const balances = getEmployeeBalances(req.employeeId);
              const quota = balances[req.leaveType];

              return (
                <div
                  key={req.id}
                  className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Employee and Leave Info */}
                  <div className="flex items-start gap-3.5 max-w-2xl">
                    <img
                      src={req.employeeAvatar}
                      alt={req.employeeName}
                      className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900">
                          {req.employeeName}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-600">{req.department}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <LeaveTypeBadge type={req.leaveType} />
                        <span className="text-xs text-slate-400">·</span>
                        <StatusBadge status={req.status} size="sm" />
                      </div>

                      <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 font-mono">
                          {formatDisplayDate(req.startDate)} — {formatDisplayDate(req.endDate)}
                        </span>
                        <span className="text-slate-400">({req.days} working {req.days === 1 ? 'day' : 'days'})</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500">
                          Remaining available quota: <strong className="font-mono text-slate-800">{quota.available}d</strong>
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-150 inline-block mt-1">
                        <span className="font-medium text-slate-800">Reason:</span> "{req.reason}"
                      </p>

                      {/* Display reviewer feedback if in history */}
                      {req.status === 'Rejected' && req.rejectionReason && (
                        <p className="text-xs text-rose-700 bg-rose-50/70 p-2 rounded-lg border border-rose-200 block mt-1">
                          <strong className="font-semibold">Rejection Note:</strong> {req.rejectionReason}
                        </p>
                      )}
                      {req.status === 'Approved' && req.managerNote && (
                        <p className="text-xs text-emerald-700 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200 block mt-1">
                          <strong className="font-semibold">Manager Note:</strong> {req.managerNote}
                        </p>
                      )}

                      <div className="text-[11px] text-slate-400 pt-0.5">
                        Applied on {formatDisplayDate(req.appliedOn)} · ID: <span className="font-mono">{req.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 md:self-center">
                    {req.status === 'Pending' ? (
                      req.employeeId === currentUser.id ? (
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                          Self-Application (Awaiting Director Review)
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => setRejectingRequest(req)}
                            className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                          <button
                            onClick={() => handleApprove(req)}
                            className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        </>
                      )
                    ) : (
                      <div className="text-xs text-slate-500 font-medium">
                        Reviewed by {req.reviewedBy || 'Manager'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      <RejectModal
        request={rejectingRequest}
        isOpen={Boolean(rejectingRequest)}
        onClose={() => setRejectingRequest(null)}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
};
