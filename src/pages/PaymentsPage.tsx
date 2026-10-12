import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Download, Eye } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, Badge, Button, SearchInput, Pagination, Select, formatCurrency, formatDate, getMonthName, EmptyState } from '../components/ui';

export function PaymentsPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentFilter = searchParams.get('student') || '';

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    let list = [...state.payments].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
    if (studentFilter) list = list.filter(p => p.studentId === studentFilter);
    if (methodFilter !== 'all') list = list.filter(p => p.paymentMethod === methodFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => {
        const student = state.students.find(s => s.id === p.studentId);
        return student?.fullName.toLowerCase().includes(q) || (p.transactionId || '').toLowerCase().includes(q) || p.receiptNumber.toLowerCase().includes(q);
      });
    }
    return list;
  }, [state.payments, state.students, search, methodFilter, studentFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const getStudentName = (id: string) => state.students.find(s => s.id === id)?.fullName || 'Unknown';

  const exportCSV = () => {
    const headers = ['Date', 'Receipt', 'Student', 'Month', 'Amount', 'Method', 'Transaction ID', 'Status'];
    const rows = filtered.map(p => {
      const fee = state.feeRecords.find(f => f.id === p.feeRecordId);
      return [
        p.paymentDate,
        p.receiptNumber,
        getStudentName(p.studentId),
        fee ? `${getMonthName(fee.billingMonth)} ${fee.billingYear}` : '-',
        p.amount,
        p.paymentMethod,
        p.transactionId || '',
        p.status,
      ];
    });
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Payments</h1>
          <p className="text-sm text-text-secondary mt-0.5">Track all payment transactions</p>
        </div>
        <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-1.5" />Export CSV</Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by student, receipt, or transaction ID..." />
          </div>
          <select value={methodFilter} onChange={e => { setMethodFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-white">
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="online">Online</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase">Receipt</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase">Student</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase hidden md:table-cell">Month</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-text-secondary uppercase">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase hidden sm:table-cell">Method</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase hidden lg:table-cell">Transaction ID</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(p => {
                const fee = state.feeRecords.find(f => f.id === p.feeRecordId);
                return (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 text-sm text-text-secondary">{formatDate(p.paymentDate)}</td>
                    <td className="px-5 py-3.5 text-sm font-mono text-text-secondary">{p.receiptNumber}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => navigate(`/students/${p.studentId}`)} className="text-sm font-medium text-text-primary hover:text-emerald-700 hover:underline">
                        {getStudentName(p.studentId)}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-text-secondary hidden md:table-cell">
                      {fee ? `${getMonthName(fee.billingMonth).slice(0, 3)} ${fee.billingYear}` : '-'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-right font-medium">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3.5 hidden sm:table-cell"><Badge status={p.paymentMethod}>{p.paymentMethod.replace('_', ' ')}</Badge></td>
                    <td className="px-5 py-3.5 text-sm font-mono text-text-secondary hidden lg:table-cell">{p.transactionId || '-'}</td>
                    <td className="px-5 py-3.5"><Badge status={p.status}>{p.status}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {paginated.length === 0 && <EmptyState title="No payments found" description="No payment records match your criteria." />}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-xs text-text-secondary">Total Payments</p>
          <p className="text-lg font-bold text-text-primary">{filtered.length}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-text-secondary">Total Amount</p>
          <p className="text-lg font-bold text-emerald-700">{formatCurrency(filtered.reduce((s, p) => s + p.amount, 0))}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-text-secondary">Cash</p>
          <p className="text-lg font-bold text-text-primary">{formatCurrency(filtered.filter(p => p.paymentMethod === 'cash').reduce((s, p) => s + p.amount, 0))}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-text-secondary">Digital</p>
          <p className="text-lg font-bold text-text-primary">{formatCurrency(filtered.filter(p => p.paymentMethod !== 'cash').reduce((s, p) => s + p.amount, 0))}</p>
        </Card>
      </div>
    </div>
  );
}
