import React, { useState } from 'react';
import { useLeave } from '../../context/LeaveContext';
import { LeaveRequest, LeaveStatus, LeaveType } from '../../types/leave';
import { formatDisplayDate } from '../../utils/dateUtils';
import { StatusBadge, LeaveTypeBadge } from '../common/StatusBadge';
import {
  Search,
  Filter,
  Ban,
  Calendar,
  Eye,
  X,
  FileText,
  Clock,
  ArrowUpDown,
  PlusCircle,
} from 'lucide-react';

export const LeaveRequestsView: React.FC = () => {
  const { currentUser, requests, cancelLeave, setIsApplyModalOpen, currentRole } = useLeave();

  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [scopeFilter, setScopeFilter] = useState<'my' | 'all'>('my');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    // If employee role, always restrict strictly to currentUser.id
    if (currentRole === 'employee' || scopeFilter === 'my') {
      if (req.employeeId !== currentUser.id) return false;
    }
    // Type filter
    if (typeFilter !== 'All' && req.leaveType !== typeFilter) {
      return false;
    }
    // Status filter
    if (statusFilter !== 'All' && req.status !== statusFilter) {
      return false;
    }
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = req.employeeName.toLowerCase().includes(q);
      const matchReason = req.reason.toLowerCase().includes(q);
      const matchId = req.id.toLowerCase().includes(q);
      if (!matchName && !matchReason && !matchId) return false;
    }
    return true;
  });

  const handleCancel = (req: LeaveRequest) => {
    if (window.confirm(`Are you sure you want to cancel leave request ${req.id}?`)) {
      cancelLeave(req.id);
    }
  };

  const isManager = currentRole === 'manager';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {isManager ? 'Leave Applications Registry' : 'My Leave Requests'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isManager
              ? 'Comprehensive registry of department leave filings and audit logs.'
              : 'Track, filter, and manage your submitted leave applications.'}
          </p>
        </div>

        {!isManager && (
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 active:scale-[0.98] rounded-xl shadow-2xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply for Leave</span>
          </button>
        )}
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* If Manager, allow toggling scope; if employee, display clean count */}
          {isManager ? (
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
              <button
                onClick={() => setScopeFilter('my')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  scopeFilter === 'my'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Applications ({requests.filter((r) => r.employeeId === currentUser.id).length})
              </button>
              <button
                onClick={() => setScopeFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  scopeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Team ({requests.length})
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-600 font-medium">
              Showing leave records for <strong className="text-slate-900">{currentUser.name}</strong> ({filteredRequests.length} total)
            </div>
          )}

          {/* Search Bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={isManager && scopeFilter === 'all' ? "Search by employee, ID, or reason..." : "Search by ID or reason..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-700">Filters:</span>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium"
            >
              <option value="All">All Types</option>
              <option value="Casual">Casual Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Earned">Earned Leave</option>
            </select>
          </div>

          {(statusFilter !== 'All' || typeFilter !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('All');
                setTypeFilter('All');
                setSearchQuery('');
              }}
              className="text-violet-600 hover:text-violet-800 font-medium underline underline-offset-2 ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">No requests found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no leave requests matching your current filters. Try changing or clearing
              your search filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Request ID</th>
                  {scopeFilter === 'all' && <th className="py-3 px-4">Employee</th>}
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Dates & Duration</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Applied On</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRequests.map((req) => {
                  const isOwnPending = req.employeeId === currentUser.id && req.status === 'Pending';

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                        {req.id}
                      </td>

                      {/* Employee (if organization wide) */}
                      {scopeFilter === 'all' && (
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <img
                              src={req.employeeAvatar}
                              alt={req.employeeName}
                              className="w-6 h-6 rounded-full object-cover border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="font-semibold text-slate-900 leading-tight">
                                {req.employeeName}
                              </div>
                              <div className="text-[11px] text-slate-400">{req.department}</div>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Leave Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <LeaveTypeBadge type={req.leaveType} />
                      </td>

                      {/* Dates & Duration */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 font-mono">
                          {formatDisplayDate(req.startDate)} - {formatDisplayDate(req.endDate)}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {req.days} {req.days === 1 ? 'day' : 'days'}
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="truncate text-slate-600" title={req.reason}>
                          {req.reason}
                        </p>
                      </td>

                      {/* Applied On */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono whitespace-nowrap">
                        {formatDisplayDate(req.appliedOn)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={req.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isOwnPending && (
                            <button
                              onClick={() => handleCancel(req)}
                              className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200/80 rounded-md transition-colors flex items-center gap-1"
                              title="Cancel this pending request"
                            >
                              <Ban className="w-3 h-3" />
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-700">
                  {selectedRequest.id}
                </span>
                <span className="text-slate-300">·</span>
                <StatusBadge status={selectedRequest.status} size="sm" />
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <img
                  src={selectedRequest.employeeAvatar}
                  alt={selectedRequest.employeeName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {selectedRequest.employeeName}
                  </h4>
                  <p className="text-slate-500">{selectedRequest.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">Leave Type</span>
                  <LeaveTypeBadge type={selectedRequest.leaveType} />
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">Total Duration</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedRequest.days} {selectedRequest.days === 1 ? 'Working Day' : 'Working Days'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">Start Date</span>
                  <span className="font-mono font-medium text-slate-800">
                    {formatDisplayDate(selectedRequest.startDate)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">End Date</span>
                  <span className="font-mono font-medium text-slate-800">
                    {formatDisplayDate(selectedRequest.endDate)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Reason for Leave</span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-150 text-slate-700 leading-relaxed italic">
                  "{selectedRequest.reason}"
                </p>
              </div>

              {/* Reviewer Feedback / Notes */}
              {selectedRequest.rejectionReason && (
                <div>
                  <span className="text-rose-600 font-semibold block text-[11px] mb-1">
                    Manager Rejection Feedback
                  </span>
                  <p className="p-3 bg-rose-50/70 rounded-xl border border-rose-200 text-rose-800 leading-relaxed">
                    {selectedRequest.rejectionReason}
                  </p>
                </div>
              )}

              {selectedRequest.managerNote && (
                <div>
                  <span className="text-emerald-700 font-semibold block text-[11px] mb-1">
                    Manager Approval Note
                  </span>
                  <p className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-emerald-800 leading-relaxed">
                    {selectedRequest.managerNote}
                  </p>
                </div>
              )}

              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100">
                <span>Submitted on {formatDisplayDate(selectedRequest.appliedOn)}</span>
                {selectedRequest.reviewedAt && (
                  <span>Reviewed on {formatDisplayDate(selectedRequest.reviewedAt)}</span>
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
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
