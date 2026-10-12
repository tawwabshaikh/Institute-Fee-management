import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, IndianRupee, TrendingUp, AlertTriangle, Clock, Plus, CreditCard, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../store/AppContext';
import { Card, StatCard, Badge, Button, formatCurrency, formatDate, getMonthName } from '../components/ui';

export function DashboardPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const stats = useMemo(() => {
    const activeStudents = state.students.filter(s => s.status === 'active');
    const currentFees = state.feeRecords.filter(f => f.billingMonth === selectedMonth && f.billingYear === selectedYear);

    const totalExpected = currentFees.reduce((sum, f) => sum + f.feeAmount, 0);
    const totalCollected = currentFees.reduce((sum, f) => sum + f.paidAmount, 0);
    const totalPending = currentFees.filter(f => f.status === 'PENDING' || f.status === 'PARTIAL').reduce((sum, f) => sum + f.dueAmount, 0);
    const totalOverdue = currentFees.filter(f => f.status === 'OVERDUE').reduce((sum, f) => sum + f.dueAmount, 0);

    return { activeStudents: activeStudents.length, totalExpected, totalCollected, totalPending, totalOverdue, currentFees };
  }, [state.students, state.feeRecords, selectedMonth, selectedYear]);

  const collectionData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      let m = now.getMonth() - i;
      let y = now.getFullYear();
      if (m < 0) { m += 12; y -= 1; }
      const fees = state.feeRecords.filter(f => f.billingMonth === m && f.billingYear === y);
      const expected = fees.reduce((s, f) => s + f.feeAmount, 0);
      const collected = fees.reduce((s, f) => s + f.paidAmount, 0);
      months.push({ name: getMonthName(m).slice(0, 3), expected, collected, pending: expected - collected });
    }
    return months;
  }, [state.feeRecords]);

  const paymentMethodData = useMemo(() => {
    const methods: Record<string, number> = { Cash: 0, UPI: 0, 'Bank Transfer': 0, Online: 0 };
    state.payments.forEach(p => {
      if (p.paymentMethod === 'cash') methods.Cash += p.amount;
      else if (p.paymentMethod === 'upi') methods.UPI += p.amount;
      else if (p.paymentMethod === 'bank_transfer') methods['Bank Transfer'] += p.amount;
      else methods.Online += p.amount;
    });
    return Object.entries(methods).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [state.payments]);

  const recentPayments = useMemo(() => {
    return [...state.payments].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()).slice(0, 5);
  }, [state.payments]);

  const upcomingDues = useMemo(() => {
    return state.feeRecords
      .filter(f => f.status !== 'PAID' && f.billingMonth === selectedMonth && f.billingYear === selectedYear)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [state.feeRecords, selectedMonth, selectedYear]);

  const PIE_COLORS = ['#064E3B', '#0F766E', '#10B981', '#6EE7B7'];

  const getStudentName = (id: string) => state.students.find(s => s.id === id)?.fullName || 'Unknown';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-0.5">Welcome back! Here's what's happening at your institute today.</p>
        </div>
        <select
          value={`${selectedYear}-${selectedMonth}`}
          onChange={e => { const [y, m] = e.target.value.split('-').map(Number); setSelectedYear(y); setSelectedMonth(m); }}
          className="px-3 py-2 border border-border rounded-lg text-sm bg-white"
        >
          {Array.from({ length: 12 }, (_, i) => {
            let m = now.getMonth() - i;
            let y = now.getFullYear();
            if (m < 0) { m += 12; y -= 1; }
            return <option key={i} value={`${y}-${m}`}>{getMonthName(m)} {y}</option>;
          })}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={<Users className="w-5 h-5" />} label="Total Students" value={String(stats.activeStudents)} subtext="Active students" color="emerald" />
        <StatCard icon={<IndianRupee className="w-5 h-5" />} label="Total Expected" value={formatCurrency(stats.totalExpected)} subtext={`${getMonthName(selectedMonth)} fees`} color="blue" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Collected" value={formatCurrency(stats.totalCollected)} subtext={`${stats.totalExpected > 0 ? Math.round((stats.totalCollected / stats.totalExpected) * 100) : 0}% collected`} color="emerald" />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Pending" value={formatCurrency(stats.totalPending)} subtext="Awaiting payment" color="amber" />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Overdue" value={formatCurrency(stats.totalOverdue)} subtext="Past due date" color="red" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collection Chart */}
        <Card className="lg:col-span-2 p-5">
          <h3 className="text-base font-semibold text-text-primary mb-4">Fee Collection Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={collectionData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="expected" fill="#D1FAE5" radius={[4, 4, 0, 0]} name="Expected" />
                <Bar dataKey="collected" fill="#064E3B" radius={[4, 4, 0, 0]} name="Collected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="p-5">
          <h3 className="text-base font-semibold text-text-primary mb-4">Payment Methods</h3>
          <div className="h-48 flex items-center justify-center">
            {paymentMethodData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentMethodData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                    {paymentMethodData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-text-secondary">No payment data</p>
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {paymentMethodData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-text-secondary">{d.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-base font-semibold text-text-primary">Recent Payments</h3>
            <button onClick={() => navigate('/payments')} className="text-xs text-emerald-700 font-medium hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-text-secondary border-b border-border">
                  <th className="text-left px-5 py-2.5 font-medium">Date</th>
                  <th className="text-left px-5 py-2.5 font-medium">Student</th>
                  <th className="text-right px-5 py-2.5 font-medium">Amount</th>
                  <th className="text-left px-5 py-2.5 font-medium">Method</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm text-text-secondary">{formatDate(p.paymentDate)}</td>
                    <td className="px-5 py-3 text-sm font-medium text-text-primary">{getStudentName(p.studentId)}</td>
                    <td className="px-5 py-3 text-sm text-right font-medium text-text-primary">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3"><Badge status={p.paymentMethod}>{p.paymentMethod.replace('_', ' ')}</Badge></td>
                  </tr>
                ))}
                {recentPayments.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-text-secondary">No payments yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Upcoming Dues */}
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-base font-semibold text-text-primary">Upcoming Dues</h3>
            <button onClick={() => navigate('/fees')} className="text-xs text-emerald-700 font-medium hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-text-secondary border-b border-border">
                  <th className="text-left px-5 py-2.5 font-medium">Student</th>
                  <th className="text-right px-5 py-2.5 font-medium">Due</th>
                  <th className="text-left px-5 py-2.5 font-medium">Due Date</th>
                  <th className="text-left px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingDues.map(f => {
                  const daysLeft = Math.ceil((new Date(f.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={f.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                      <td className="px-5 py-3 text-sm font-medium text-text-primary">{getStudentName(f.studentId)}</td>
                      <td className="px-5 py-3 text-sm text-right font-medium text-text-primary">{formatCurrency(f.dueAmount)}</td>
                      <td className="px-5 py-3 text-sm text-text-secondary">{formatDate(f.dueDate)}</td>
                      <td className="px-5 py-3"><Badge status={f.status}>{f.status}</Badge></td>
                    </tr>
                  );
                })}
                {upcomingDues.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-text-secondary">All fees are paid!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-5">
        <h3 className="text-base font-semibold text-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button variant="outline" onClick={() => navigate('/students/add')} className="justify-start gap-2">
            <Plus className="w-4 h-4" /> Add Student
          </Button>
          <Button variant="outline" onClick={() => navigate('/payments')} className="justify-start gap-2">
            <CreditCard className="w-4 h-4" /> Record Payment
          </Button>
          <Button variant="outline" onClick={() => navigate('/fees')} className="justify-start gap-2">
            <AlertTriangle className="w-4 h-4" /> View Pending
          </Button>
          <Button variant="outline" onClick={() => navigate('/notifications')} className="justify-start gap-2">
            <Bell className="w-4 h-4" /> Send Message
          </Button>
        </div>
      </Card>
    </div>
  );
}
