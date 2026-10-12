import React, { useState, useMemo } from 'react';
import { Send, MessageCircle, Phone } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, Badge, Button, Tabs, Pagination, SearchInput, Modal, Select, Textarea, formatCurrency, formatDate, EmptyState } from '../components/ui';
import { v4 as uuid } from 'uuid';

export function NotificationsPage() {
  const { state, dispatch, addToast, addAuditLog } = useApp();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showTest, setShowTest] = useState(false);
  const perPage = 10;

  const filtered = useMemo(() => {
    let list = [...state.notifications].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
    if (tab === 'whatsapp') list = list.filter(n => n.channel === 'whatsapp');
    if (tab === 'sms') list = list.filter(n => n.channel === 'sms');
    if (tab === 'fee_reminder') list = list.filter(n => n.type === 'fee_reminder');
    if (tab === 'payment_confirmation') list = list.filter(n => n.type === 'payment_confirmation');
    if (tab === 'overdue') list = list.filter(n => n.type === 'overdue_reminder');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(n => {
        const student = state.students.find(s => s.id === n.studentId);
        return student?.fullName.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
      });
    }
    return list;
  }, [state.notifications, state.students, tab, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const getStudentName = (id: string) => state.students.find(s => s.id === id)?.fullName || 'Unknown';

  const tabs = [
    { id: 'all', label: 'All', count: state.notifications.length },
    { id: 'whatsapp', label: 'WhatsApp', count: state.notifications.filter(n => n.channel === 'whatsapp').length },
    { id: 'sms', label: 'SMS', count: state.notifications.filter(n => n.channel === 'sms').length },
    { id: 'fee_reminder', label: 'Fee Reminder', count: state.notifications.filter(n => n.type === 'fee_reminder').length },
    { id: 'payment_confirmation', label: 'Payment Confirmation', count: state.notifications.filter(n => n.type === 'payment_confirmation').length },
    { id: 'overdue', label: 'Overdue', count: state.notifications.filter(n => n.type === 'overdue_reminder').length },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
          <p className="text-sm text-text-secondary mt-0.5">Manage automated communication</p>
        </div>
        <Button onClick={() => setShowTest(true)}><Send className="w-4 h-4 mr-1.5" />Send Test Message</Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search notifications..." />
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
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase">Date & Time</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase">Student</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase hidden sm:table-cell">Type</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase">Channel</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase hidden lg:table-cell">Message</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(n => (
                <tr key={n.id} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-3.5 text-sm text-text-secondary">{formatDate(n.sentAt)}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-text-primary">{getStudentName(n.studentId)}</td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary hidden sm:table-cell capitalize">{n.type.replace(/_/g, ' ')}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {n.channel === 'whatsapp' ? <MessageCircle className="w-3.5 h-3.5 text-green-600" /> : <Phone className="w-3.5 h-3.5 text-blue-600" />}
                      <span className="text-sm capitalize">{n.channel}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary hidden lg:table-cell max-w-[250px] truncate">{n.message}</td>
                  <td className="px-5 py-3.5">
                    <div>
                      <Badge status={n.status}>{n.status}</Badge>
                      {n.failureReason && <p className="text-xs text-red-500 mt-1">{n.failureReason}</p>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paginated.length === 0 && <EmptyState title="No notifications" description="No notification records found." />}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-xs text-text-secondary">Total Sent</p>
          <p className="text-lg font-bold text-text-primary">{state.notifications.length}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-text-secondary">Delivered</p>
          <p className="text-lg font-bold text-emerald-700">{state.notifications.filter(n => n.status === 'delivered').length}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-text-secondary">Pending</p>
          <p className="text-lg font-bold text-amber-600">{state.notifications.filter(n => n.status === 'pending').length}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-text-secondary">Failed</p>
          <p className="text-lg font-bold text-red-600">{state.notifications.filter(n => n.status === 'failed').length}</p>
        </Card>
      </div>

      {/* Send Test Message Modal */}
      <TestMessageModal open={showTest} onClose={() => setShowTest(false)} />
    </div>
  );
}

function TestMessageModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, addToast, addAuditLog } = useApp();
  const [studentId, setStudentId] = useState('');
  const [channel, setChannel] = useState('whatsapp');
  const [message, setMessage] = useState('This is a test message from 𝗡𝗖² Fee Management System.');
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (!studentId) { addToast('error', 'Please select a student'); return; }
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    setSending(true);
    setTimeout(() => {
      const notification = {
        id: uuid(),
        studentId: student.id,
        type: 'fee_reminder' as const,
        channel: channel as 'whatsapp' | 'sms',
        message,
        recipient: channel === 'whatsapp' ? student.parentWhatsapp : (student.parentPhone || student.parentWhatsapp),
        status: 'sent' as const,
        providerMessageId: `msg_${uuid().slice(0, 8)}`,
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      addAuditLog('Message Sent', 'Notification', notification.id, `Test message sent to ${student.fullName} via ${channel}`);
      addToast('success', 'Test message sent successfully');
      setSending(false);
      onClose();
    }, 800);
  };

  return (
    <Modal open={open} onClose={onClose} title="Send Test Message" size="md">
      <div className="space-y-4">
        <Select label="Student" required value={studentId} onChange={e => setStudentId(e.target.value)}>
          <option value="">Select student</option>
          {state.students.filter(s => s.status === 'active').map(s => (
            <option key={s.id} value={s.id}>{s.fullName} ({s.studentId})</option>
          ))}
        </Select>

        <Select label="Channel" value={channel} onChange={e => setChannel(e.target.value)}>
          <option value="whatsapp">WhatsApp</option>
          <option value="sms">SMS</option>
        </Select>

        <Textarea label="Message" value={message} onChange={e => setMessage(e.target.value)} rows={4} />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSend} loading={sending}><Send className="w-4 h-4 mr-1.5" />Send</Button>
        </div>
      </div>
    </Modal>
  );
}
