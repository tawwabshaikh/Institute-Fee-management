import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, CreditCard, Phone, MessageCircle, Calendar, MapPin, User, GraduationCap } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, Badge, Button, Tabs, formatCurrency, formatDate, getMonthName, EmptyState } from '../components/ui';

export function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useApp();
  const [tab, setTab] = useState('overview');

  const student = state.students.find(s => s.id === id);
  if (!student) return (
    <div className="text-center py-12">
      <p className="text-text-secondary">Student not found</p>
      <Button variant="outline" onClick={() => navigate('/students')} className="mt-4">Back to Students</Button>
    </div>
  );

  const feeRecords = state.feeRecords.filter(f => f.studentId === student.id).sort((a, b) => (b.billingYear - a.billingYear) || (b.billingMonth - a.billingMonth));
  const payments = state.payments.filter(p => p.studentId === student.id).sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  const notifications = state.notifications.filter(n => n.studentId === student.id);

  const totalFees = feeRecords.reduce((s, f) => s + f.feeAmount, 0);
  const totalPaid = feeRecords.reduce((s, f) => s + f.paidAmount, 0);
  const totalDue = feeRecords.reduce((s, f) => s + f.dueAmount, 0);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'fees', label: 'Fee History', count: feeRecords.length },
    { id: 'payments', label: 'Payments', count: payments.length },
    { id: 'notifications', label: 'Notifications', count: notifications.length },
    { id: 'details', label: 'Details' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/students')} className="p-2 rounded-lg hover:bg-gray-100 mt-1"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-text-primary">{student.fullName}</h1>
                <Badge status={student.status}>{student.status}</Badge>
              </div>
              <p className="text-sm text-text-secondary mt-0.5">{student.studentId} • {student.course} {student.batch && `• ${student.batch}`}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(`/students/${id}/edit`)}><Edit2 className="w-4 h-4 mr-1.5" />Edit</Button>
              <Button onClick={() => navigate(`/payments?student=${id}`)}><CreditCard className="w-4 h-4 mr-1.5" />Record Payment</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-xs text-text-secondary mb-1">Total Fees</p>
          <p className="text-lg font-bold text-text-primary">{formatCurrency(totalFees)}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-text-secondary mb-1">Total Paid</p>
          <p className="text-lg font-bold text-emerald-700">{formatCurrency(totalPaid)}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-text-secondary mb-1">Total Due</p>
          <p className="text-lg font-bold text-red-600">{formatCurrency(totalDue)}</p>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
        <div className="p-5">
          {tab === 'overview' && <OverviewTab student={student} feeRecords={feeRecords} payments={payments} />}
          {tab === 'fees' && <FeeHistoryTab feeRecords={feeRecords} navigate={navigate} studentId={id!} />}
          {tab === 'payments' && <PaymentsTab payments={payments} state={state} />}
          {tab === 'notifications' && <NotificationsTab notifications={notifications} state={state} />}
          {tab === 'details' && <DetailsTab student={student} />}
        </div>
      </Card>
    </div>
  );
}

function OverviewTab({ student, feeRecords, payments }: { student: any; feeRecords: any[]; payments: any[] }) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentFee = feeRecords.find(f => f.billingMonth === currentMonth && f.billingYear === currentYear);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-sm font-semibold text-text-primary mb-3">Student Information</h4>
        <div className="space-y-2.5">
          <InfoRow icon={<User className="w-4 h-4" />} label="Student ID" value={student.studentId} />
          <InfoRow icon={<GraduationCap className="w-4 h-4" />} label="Course" value={`${student.course} ${student.batch ? `(${student.batch})` : ''}`} />
          <InfoRow icon={<Calendar className="w-4 h-4" />} label="Joining Date" value={formatDate(student.joiningDate)} />
          <InfoRow icon={<CreditCard className="w-4 h-4" />} label="Monthly Fee" value={formatCurrency(student.monthlyFee)} />
          <InfoRow icon={<Calendar className="w-4 h-4" />} label="Due Day" value={`${student.feeDueDay} of every month`} />
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-text-primary mb-3">Contact Information</h4>
        <div className="space-y-2.5">
          {student.phone && <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={student.phone} />}
          {student.whatsapp && <InfoRow icon={<MessageCircle className="w-4 h-4" />} label="WhatsApp" value={student.whatsapp} />}
          <InfoRow icon={<User className="w-4 h-4" />} label="Parent Name" value={student.parentName} />
          {student.parentPhone && <InfoRow icon={<Phone className="w-4 h-4" />} label="Parent Phone" value={student.parentPhone} />}
          <InfoRow icon={<MessageCircle className="w-4 h-4" />} label="Parent WhatsApp" value={student.parentWhatsapp} />
        </div>
      </div>
      {currentFee && (
        <div className="md:col-span-2">
          <h4 className="text-sm font-semibold text-text-primary mb-3">Current Month Status</h4>
          <Card className="p-4 bg-gray-50">
            <div className="flex flex-wrap gap-6">
              <div><p className="text-xs text-text-secondary">Fee</p><p className="text-sm font-semibold">{formatCurrency(currentFee.feeAmount)}</p></div>
              <div><p className="text-xs text-text-secondary">Paid</p><p className="text-sm font-semibold text-emerald-700">{formatCurrency(currentFee.paidAmount)}</p></div>
              <div><p className="text-xs text-text-secondary">Due</p><p className="text-sm font-semibold text-red-600">{formatCurrency(currentFee.dueAmount)}</p></div>
              <div><p className="text-xs text-text-secondary">Status</p><Badge status={currentFee.status}>{currentFee.status}</Badge></div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-text-secondary">{icon}</span>
      <span className="text-text-secondary min-w-[100px]">{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </div>
  );
}

function FeeHistoryTab({ feeRecords, navigate, studentId }: { feeRecords: any[]; navigate: any; studentId: string }) {
  if (feeRecords.length === 0) return <EmptyState title="No fee records" description="No fee records found for this student." />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-xs text-text-secondary border-b border-border">
            <th className="text-left px-4 py-2.5 font-medium">Month</th>
            <th className="text-right px-4 py-2.5 font-medium">Fee</th>
            <th className="text-right px-4 py-2.5 font-medium">Paid</th>
            <th className="text-right px-4 py-2.5 font-medium">Due</th>
            <th className="text-left px-4 py-2.5 font-medium">Due Date</th>
            <th className="text-left px-4 py-2.5 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {feeRecords.map(f => (
            <tr key={f.id} className="border-b border-border last:border-0 hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium">{getMonthName(f.billingMonth)} {f.billingYear}</td>
              <td className="px-4 py-3 text-sm text-right">{formatCurrency(f.feeAmount)}</td>
              <td className="px-4 py-3 text-sm text-right text-emerald-700">{formatCurrency(f.paidAmount)}</td>
              <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(f.dueAmount)}</td>
              <td className="px-4 py-3 text-sm text-text-secondary">{formatDate(f.dueDate)}</td>
              <td className="px-4 py-3"><Badge status={f.status}>{f.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PaymentsTab({ payments, state }: { payments: any[]; state: any }) {
  if (payments.length === 0) return <EmptyState title="No payments" description="No payments recorded for this student." />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-xs text-text-secondary border-b border-border">
            <th className="text-left px-4 py-2.5 font-medium">Date</th>
            <th className="text-left px-4 py-2.5 font-medium">Receipt</th>
            <th className="text-right px-4 py-2.5 font-medium">Amount</th>
            <th className="text-left px-4 py-2.5 font-medium">Method</th>
            <th className="text-left px-4 py-2.5 font-medium">Transaction ID</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(p => (
            <tr key={p.id} className="border-b border-border last:border-0 hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">{formatDate(p.paymentDate)}</td>
              <td className="px-4 py-3 text-sm font-mono text-text-secondary">{p.receiptNumber}</td>
              <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(p.amount)}</td>
              <td className="px-4 py-3"><Badge status={p.paymentMethod}>{p.paymentMethod.replace('_', ' ')}</Badge></td>
              <td className="px-4 py-3 text-sm font-mono text-text-secondary">{p.transactionId || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NotificationsTab({ notifications, state }: { notifications: any[]; state: any }) {
  if (notifications.length === 0) return <EmptyState title="No notifications" description="No notifications sent to this student." />;

  return (
    <div className="space-y-3">
      {notifications.map(n => (
        <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
          <Badge status={n.status}>{n.status}</Badge>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-primary">{n.message}</p>
            <p className="text-xs text-text-secondary mt-1">{n.channel} • {formatDate(n.sentAt)} • {n.type.replace('_', ' ')}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailsTab({ student }: { student: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-sm font-semibold text-text-primary mb-3">Personal Details</h4>
        <div className="space-y-2 text-sm">
          <p><span className="text-text-secondary">Full Name:</span> <span className="font-medium">{student.fullName}</span></p>
          <p><span className="text-text-secondary">Date of Birth:</span> <span className="font-medium">{student.dateOfBirth ? formatDate(student.dateOfBirth) : '-'}</span></p>
          <p><span className="text-text-secondary">Gender:</span> <span className="font-medium capitalize">{student.gender || '-'}</span></p>
          <p><span className="text-text-secondary">Address:</span> <span className="font-medium">{student.address || '-'}</span></p>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-text-primary mb-3">System Information</h4>
        <div className="space-y-2 text-sm">
          <p><span className="text-text-secondary">Created:</span> <span className="font-medium">{formatDate(student.createdAt)}</span></p>
          <p><span className="text-text-secondary">Last Updated:</span> <span className="font-medium">{formatDate(student.updatedAt)}</span></p>
          <p><span className="text-text-secondary">Status:</span> <Badge status={student.status}>{student.status}</Badge></p>
        </div>
      </div>
    </div>
  );
}
