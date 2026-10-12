import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CreditCard, Bell, Search, Download } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, Badge, Button, SearchInput, Pagination, Tabs, Modal, Input, Select, formatCurrency, formatDate, getMonthName, EmptyState, generateReceiptNumber } from '../components/ui';
import { v4 as uuid } from 'uuid';

export function FeesPage() {
  const { state, dispatch, addToast, addAuditLog } = useApp();
  const navigate = useNavigate();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [showGenerate, setShowGenerate] = useState(false);
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const perPage = 10;

  const currentFees = useMemo(() => {
    let fees = state.feeRecords.filter(f => f.billingMonth === selectedMonth && f.billingYear === selectedYear);
    if (tab !== 'all') {
      fees = fees.filter(f => f.status.toLowerCase() === tab);
    }
    if (search) {
      const q = search.toLowerCase();
      fees = fees.filter(f => {
        const student = state.students.find(s => s.id === f.studentId);
        return student?.fullName.toLowerCase().includes(q) || student?.studentId.toLowerCase().includes(q) || (student?.phone || '').includes(q);
      });
    }
    return fees;
  }, [state.feeRecords, state.students, selectedMonth, selectedYear, tab, search]);

  const totalPages = Math.ceil(currentFees.length / perPage);
  const paginated = currentFees.slice((page - 1) * perPage, page * perPage);

  const handleGenerateFees = () => {
    setGenerating(true);
    setTimeout(() => {
      const activeStudents = state.students.filter(s => s.status === 'active');
      const existing = state.feeRecords.filter(f => f.billingMonth === selectedMonth && f.billingYear === selectedYear).length;
      dispatch({ type: 'GENERATE_FEES', payload: { month: selectedMonth, year: selectedYear } });
      const created = activeStudents.length - existing;
      addAuditLog('Fee Generated', 'FeeRecord', `${selectedMonth}-${selectedYear}`, `Generated fees for ${getMonthName(selectedMonth)} ${selectedYear}: ${created} created, ${existing} already existed`);
      addToast('success', `${created} fee records created. ${existing} already existed.`);
      setGenerating(false);
      setShowGenerate(false);
    }, 800);
  };

  const handleSendReminder = (feeRecordId: string) => {
    const fee = state.feeRecords.find(f => f.id === feeRecordId);
    if (!fee) return;
    const student = state.students.find(s => s.id === fee.studentId);
    if (!student) return;

    const notification = {
      id: uuid(),
      studentId: student.id,
      type: 'fee_reminder' as const,
      channel: 'whatsapp' as const,
      message: `Dear ${student.parentName}, this is a reminder that ${student.fullName}'s fee of ${formatCurrency(fee.dueAmount)} for ${getMonthName(fee.billingMonth)} is due.`,
      recipient: student.parentWhatsapp,
      status: 'sent' as const,
      providerMessageId: `msg_${uuid().slice(0, 8)}`,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    addAuditLog('Message Sent', 'Notification', notification.id, `Fee reminder sent to ${student.fullName}`);
    addToast('success', 'Reminder sent successfully');
  };

  const tabs = [
    { id: 'all', label: 'All', count: state.feeRecords.filter(f => f.billingMonth === selectedMonth && f.billingYear === selectedYear).length },
    { id: 'paid', label: 'Paid', count: state.feeRecords.filter(f => f.billingMonth === selectedMonth && f.billingYear === selectedYear && f.status === 'PAID').length },
    { id: 'partial', label: 'Partial', count: state.feeRecords.filter(f => f.billingMonth === selectedMonth && f.billingYear === selectedYear && f.status === 'PARTIAL').length },
    { id: 'pending', label: 'Due', count: state.feeRecords.filter(f => f.billingMonth === selectedMonth && f.billingYear === selectedYear && f.status === 'PENDING').length },
    { id: 'overdue', label: 'Overdue', count: state.feeRecords.filter(f => f.billingMonth === selectedMonth && f.billingYear === selectedYear && f.status === 'OVERDUE').length },
  ];

  const getStudentName = (id: string) => state.students.find(s => s.id === id)?.fullName || 'Unknown';
  const getStudentId = (id: string) => state.students.find(s => s.id === id)?.studentId || '-';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Fees</h1>
          <p className="text-sm text-text-secondary mt-0.5">Manage monthly fees and dues</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={`${selectedYear}-${selectedMonth}`} onChange={e => { const [y, m] = e.target.value.split('-').map(Number); setSelectedYear(y); setSelectedMonth(m); setPage(1); }}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-white">
            {Array.from({ length: 12 }, (_, i) => {
              let m = now.getMonth() - i; let y = now.getFullYear();
              if (m < 0) { m += 12; y -= 1; }
              return <option key={i} value={`${y}-${m}`}>{getMonthName(m)} {y}</option>;
            })}
          </select>
          <Button variant="outline" onClick={() => setShowGenerate(true)}><Plus className="w-4 h-4 mr-1.5" />Generate Fees</Button>
          <Button onClick={() => navigate('/payments')}><CreditCard className="w-4 h-4 mr-1.5" />Record Payment</Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by student name, ID or phone..." />
        <div className="mt-3">
          <Tabs tabs={tabs} active={tab} onChange={t => { setTab(t); setPage(1); }} />
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase">Student ID</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase">Student</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-text-secondary uppercase">Fee</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-text-secondary uppercase hidden sm:table-cell">Paid</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-text-secondary uppercase">Due</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase hidden md:table-cell">Due Date</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-text-secondary uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(fee => (
                <tr key={fee.id} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-3.5 text-sm font-mono text-text-secondary">{getStudentId(fee.studentId)}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-text-primary">{getStudentName(fee.studentId)}</td>
                  <td className="px-5 py-3.5 text-sm text-right">{formatCurrency(fee.feeAmount)}</td>
                  <td className="px-5 py-3.5 text-sm text-right text-emerald-700 hidden sm:table-cell">{formatCurrency(fee.paidAmount)}</td>
                  <td className="px-5 py-3.5 text-sm text-right font-medium text-red-600">{formatCurrency(fee.dueAmount)}</td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary hidden md:table-cell">{formatDate(fee.dueDate)}</td>
                  <td className="px-5 py-3.5"><Badge status={fee.status}>{fee.status}</Badge></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`/students/${fee.studentId}`)} className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary" title="View">
                        <Search className="w-4 h-4" />
                      </button>
                      {fee.status !== 'PAID' && (
                        <>
                          <button onClick={() => setShowPayment(fee.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-emerald-700" title="Record Payment">
                            <CreditCard className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleSendReminder(fee.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-blue-600" title="Send Reminder">
                            <Bell className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paginated.length === 0 && <EmptyState title="No fee records found" description="Generate fees for this month or adjust your filters." />}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      {/* Generate Fees Modal */}
      <Modal open={showGenerate} onClose={() => setShowGenerate(false)} title="Generate Monthly Fees" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Generate fee records for <strong>{getMonthName(selectedMonth)} {selectedYear}</strong> for all active students.
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm"><strong>Active Students:</strong> {state.students.filter(s => s.status === 'active').length}</p>
            <p className="text-sm"><strong>Existing Records:</strong> {state.feeRecords.filter(f => f.billingMonth === selectedMonth && f.billingYear === selectedYear).length}</p>
          </div>
          <p className="text-xs text-text-secondary">Duplicate records will be skipped automatically.</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowGenerate(false)}>Cancel</Button>
            <Button onClick={handleGenerateFees} loading={generating}>Generate Fees</Button>
          </div>
        </div>
      </Modal>

      {/* Record Payment Modal */}
      {showPayment && <PaymentModal feeRecordId={showPayment} onClose={() => setShowPayment(null)} />}
    </div>
  );
}

function PaymentModal({ feeRecordId, onClose }: { feeRecordId: string; onClose: () => void }) {
  const { state, dispatch, addToast, addAuditLog } = useApp();
  const fee = state.feeRecords.find(f => f.id === feeRecordId);
  const student = fee ? state.students.find(s => s.id === fee.studentId) : null;

  const [amount, setAmount] = useState<number>(fee?.dueAmount || 0);
  const [method, setMethod] = useState('cash');
  const [transactionId, setTransactionId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  if (!fee || !student) return null;

  const remaining = fee.dueAmount - Number(amount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) { addToast('error', 'Please enter a valid amount'); return; }
    if (Number(amount) > fee.dueAmount) { addToast('error', 'Amount exceeds remaining due'); return; }

    setSaving(true);
    setTimeout(() => {
      const payment = {
        id: uuid(),
        receiptNumber: generateReceiptNumber(),
        studentId: student.id,
        feeRecordId: fee.id,
        amount: Number(amount),
        paymentMethod: method as any,
        transactionId: transactionId || undefined,
        paymentDate,
        notes: notes || undefined,
        status: 'completed' as const,
        createdAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_PAYMENT', payload: payment });

      // Create notification
      const notification = {
        id: uuid(),
        studentId: student.id,
        type: 'payment_confirmation' as const,
        channel: 'whatsapp' as const,
        message: `Dear ${student.parentName}, payment of ${formatCurrency(Number(amount))} received for ${student.fullName} for ${getMonthName(fee.billingMonth)}. Thank you!`,
        recipient: student.parentWhatsapp,
        status: 'sent' as const,
        providerMessageId: `msg_${uuid().slice(0, 8)}`,
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

      addAuditLog('Payment Added', 'Payment', payment.id, `${formatCurrency(Number(amount))} received from ${student.fullName} via ${method}`);
      addToast('success', `Payment of ${formatCurrency(Number(amount))} recorded successfully`);
      setSaving(false);
      onClose();
    }, 600);
  };

  return (
    <Modal open={true} onClose={onClose} title="Record Payment" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Student</span>
            <span className="font-medium">{student.fullName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Billing Month</span>
            <span className="font-medium">{getMonthName(fee.billingMonth)} {fee.billingYear}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Total Fee</span>
            <span className="font-medium">{formatCurrency(fee.feeAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Already Paid</span>
            <span className="font-medium text-emerald-700">{formatCurrency(fee.paidAmount)}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-border pt-2">
            <span className="text-text-secondary font-medium">Remaining</span>
            <span className="font-bold text-red-600">{formatCurrency(fee.dueAmount)}</span>
          </div>
        </div>

        <Input label="Amount to Pay (₹)" type="number" required value={amount} onChange={e => setAmount(Number(e.target.value))} min={1} max={fee.dueAmount} />

        {remaining >= 0 && (
          <div className="text-sm p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="text-text-secondary">Remaining after payment: </span>
            <span className="font-semibold text-emerald-800">{formatCurrency(remaining)}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Payment Method <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['cash', 'upi', 'bank_transfer', 'online'] as const).map(m => (
              <label key={m} className={`flex items-center justify-center gap-2 px-3 py-2.5 border rounded-lg cursor-pointer text-sm transition-colors ${method === m ? 'border-emerald-700 bg-emerald-50 text-emerald-800' : 'border-border hover:border-gray-300'}`}>
                <input type="radio" name="method" value={m} checked={method === m} onChange={() => setMethod(m)} className="sr-only" />
                {m.replace('_', ' ')}
              </label>
            ))}
          </div>
        </div>

        {(method !== 'cash') && (
          <Input label="Transaction ID" value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="Enter transaction reference" />
        )}

        <Input label="Payment Date" type="date" required value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
        <Input label="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional notes" />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>Save Payment</Button>
        </div>
      </form>
    </Modal>
  );
}
