import React, { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../store/AppContext';
import { Card, Tabs, Button, formatCurrency, getMonthName, formatDate } from '../components/ui';

export function ReportsPage() {
  const { state } = useApp();
  const [tab, setTab] = useState('collection');

  const tabs = [
    { id: 'collection', label: 'Collection Report' },
    { id: 'methods', label: 'Payment Methods' },
    { id: 'due', label: 'Due Report' },
    { id: 'student', label: 'Student Report' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
        <p className="text-sm text-text-secondary mt-0.5">Analyze fee collection and payment data</p>
      </div>

      <Card>
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
        <div className="p-5">
          {tab === 'collection' && <CollectionReport state={state} />}
          {tab === 'methods' && <PaymentMethodsReport state={state} />}
          {tab === 'due' && <DueReport state={state} />}
          {tab === 'student' && <StudentReport state={state} />}
        </div>
      </Card>
    </div>
  );
}

function CollectionReport({ state }: { state: any }) {
  const now = new Date();
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      let m = now.getMonth() - i;
      let y = now.getFullYear();
      if (m < 0) { m += 12; y -= 1; }
      const fees = state.feeRecords.filter((f: any) => f.billingMonth === m && f.billingYear === y);
      const expected = fees.reduce((s: number, f: any) => s + f.feeAmount, 0);
      const collected = fees.reduce((s: number, f: any) => s + f.paidAmount, 0);
      months.push({ name: getMonthName(m).slice(0, 3), expected, collected, pending: expected - collected });
    }
    return months;
  }, [state.feeRecords]);

  const totalExpected = monthlyData.reduce((s, d) => s + d.expected, 0);
  const totalCollected = monthlyData.reduce((s, d) => s + d.collected, 0);
  const totalPending = totalExpected - totalCollected;
  const totalOverdue = state.feeRecords.filter((f: any) => f.status === 'OVERDUE').reduce((s: number, f: any) => s + f.dueAmount, 0);

  const exportCSV = () => {
    const headers = ['Month', 'Expected', 'Collected', 'Pending'];
    const rows = monthlyData.map(d => [d.name, d.expected, d.collected, d.pending]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'collection_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-1.5" />Export CSV</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-xs text-text-secondary">Total Expected</p>
          <p className="text-lg font-bold text-text-primary">{formatCurrency(totalExpected)}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-text-secondary">Total Collected</p>
          <p className="text-lg font-bold text-emerald-700">{formatCurrency(totalCollected)}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-text-secondary">Total Pending</p>
          <p className="text-lg font-bold text-amber-600">{formatCurrency(totalPending)}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-text-secondary">Total Overdue</p>
          <p className="text-lg font-bold text-red-600">{formatCurrency(totalOverdue)}</p>
        </Card>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="expected" fill="#D1FAE5" radius={[4, 4, 0, 0]} name="Expected" />
            <Bar dataKey="collected" fill="#064E3B" radius={[4, 4, 0, 0]} name="Collected" />
            <Bar dataKey="pending" fill="#FCD34D" radius={[4, 4, 0, 0]} name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PaymentMethodsReport({ state }: { state: any }) {
  const data = useMemo(() => {
    const methods: Record<string, number> = { Cash: 0, UPI: 0, 'Bank Transfer': 0, Online: 0 };
    state.payments.forEach((p: any) => {
      if (p.paymentMethod === 'cash') methods.Cash += p.amount;
      else if (p.paymentMethod === 'upi') methods.UPI += p.amount;
      else if (p.paymentMethod === 'bank_transfer') methods['Bank Transfer'] += p.amount;
      else methods.Online += p.amount;
    });
    return Object.entries(methods).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [state.payments]);

  const COLORS = ['#064E3B', '#0F766E', '#10B981', '#6EE7B7'];
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={2}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-sm font-medium">{d.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatCurrency(d.value)}</p>
                <p className="text-xs text-text-secondary">{total > 0 ? Math.round((d.value / total) * 100) : 0}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DueReport({ state }: { state: any }) {
  const dues = useMemo(() => {
    return state.feeRecords
      .filter((f: any) => f.status !== 'PAID')
      .map((f: any) => {
        const student = state.students.find((s: any) => s.id === f.studentId);
        const daysOverdue = Math.max(0, Math.ceil((Date.now() - new Date(f.dueDate).getTime()) / (1000 * 60 * 60 * 24)));
        return { ...f, studentName: student?.fullName || 'Unknown', studentId: student?.studentId || '-', daysOverdue };
      })
      .sort((a: any, b: any) => b.daysOverdue - a.daysOverdue);
  }, [state.feeRecords, state.students]);

  const exportCSV = () => {
    const headers = ['Student', 'Student ID', 'Fee', 'Paid', 'Due', 'Due Date', 'Days Overdue', 'Status'];
    const rows = dues.map((d: any) => [d.studentName, d.studentId, d.feeAmount, d.paidAmount, d.dueAmount, d.dueDate, d.daysOverdue, d.status]);
    const csv = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'due_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-1.5" />Export CSV</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-text-secondary border-b border-border">
              <th className="text-left px-4 py-2.5 font-medium">Student</th>
              <th className="text-right px-4 py-2.5 font-medium">Fee</th>
              <th className="text-right px-4 py-2.5 font-medium">Paid</th>
              <th className="text-right px-4 py-2.5 font-medium">Due</th>
              <th className="text-left px-4 py-2.5 font-medium hidden sm:table-cell">Due Date</th>
              <th className="text-right px-4 py-2.5 font-medium hidden md:table-cell">Days Overdue</th>
              <th className="text-left px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {dues.slice(0, 20).map((d: any) => (
              <tr key={d.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium">{d.studentName}</p>
                  <p className="text-xs text-text-secondary">{d.studentId}</p>
                </td>
                <td className="px-4 py-3 text-sm text-right">{formatCurrency(d.feeAmount)}</td>
                <td className="px-4 py-3 text-sm text-right text-emerald-700">{formatCurrency(d.paidAmount)}</td>
                <td className="px-4 py-3 text-sm text-right font-medium text-red-600">{formatCurrency(d.dueAmount)}</td>
                <td className="px-4 py-3 text-sm text-text-secondary hidden sm:table-cell">{formatDate(d.dueDate)}</td>
                <td className="px-4 py-3 text-sm text-right hidden md:table-cell">
                  {d.daysOverdue > 0 ? <span className="text-red-600 font-medium">{d.daysOverdue} days</span> : '-'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    d.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                    d.status === 'PARTIAL' ? 'bg-orange-100 text-orange-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>{d.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {dues.length === 0 && <p className="text-center text-sm text-text-secondary py-8">No outstanding dues!</p>}
    </div>
  );
}

function StudentReport({ state }: { state: any }) {
  const data = useMemo(() => {
    return state.students.map((s: any) => {
      const fees = state.feeRecords.filter((f: any) => f.studentId === s.id);
      const totalFees = fees.reduce((sum: number, f: any) => sum + f.feeAmount, 0);
      const totalPaid = fees.reduce((sum: number, f: any) => sum + f.paidAmount, 0);
      const totalPending = fees.reduce((sum: number, f: any) => sum + f.dueAmount, 0);
      return { ...s, totalFees, totalPaid, totalPending };
    });
  }, [state.students, state.feeRecords]);

  const exportCSV = () => {
    const headers = ['Student', 'Student ID', 'Course', 'Total Fees', 'Total Paid', 'Total Pending'];
    const rows = data.map((d: any) => [d.fullName, d.studentId, d.course, d.totalFees, d.totalPaid, d.totalPending]);
    const csv = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'student_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-1.5" />Export CSV</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-text-secondary border-b border-border">
              <th className="text-left px-4 py-2.5 font-medium">Student</th>
              <th className="text-left px-4 py-2.5 font-medium hidden sm:table-cell">Course</th>
              <th className="text-right px-4 py-2.5 font-medium">Total Fees</th>
              <th className="text-right px-4 py-2.5 font-medium">Total Paid</th>
              <th className="text-right px-4 py-2.5 font-medium">Total Pending</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d: any) => (
              <tr key={d.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium">{d.fullName}</p>
                  <p className="text-xs text-text-secondary">{d.studentId}</p>
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary hidden sm:table-cell">{d.course}</td>
                <td className="px-4 py-3 text-sm text-right">{formatCurrency(d.totalFees)}</td>
                <td className="px-4 py-3 text-sm text-right text-emerald-700">{formatCurrency(d.totalPaid)}</td>
                <td className="px-4 py-3 text-sm text-right font-medium text-red-600">{formatCurrency(d.totalPending)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
