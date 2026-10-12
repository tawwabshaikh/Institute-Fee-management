import React, { useState } from 'react';
import { Save, Building2, CreditCard, Bell, Clock, Shield, FileText } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, Button, Input, Select, Textarea, Tabs } from '../components/ui';

export function SettingsPage() {
  const { state, dispatch, addToast, addAuditLog } = useApp();
  const [tab, setTab] = useState('institute');
  const [settings, setSettings] = useState({ ...state.settings });
  const [templates, setTemplates] = useState([...state.templates]);
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'institute', label: 'Institute' },
    { id: 'fee', label: 'Fee Settings' },
    { id: 'notification', label: 'Notifications' },
    { id: 'reminder', label: 'Reminders' },
    { id: 'payment', label: 'Payment' },
    { id: 'templates', label: 'Templates' },
    { id: 'audit', label: 'Audit Logs' },
  ];

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      addAuditLog('Settings Updated', 'SystemSettings', 'settings', 'System settings updated');
      addToast('success', 'Settings saved successfully');
      setSaving(false);
    }, 500);
  };

  const handleSaveTemplate = (id: string, content: string) => {
    const updated = templates.map(t => t.id === id ? { ...t, content, updatedAt: new Date().toISOString() } : t);
    setTemplates(updated);
    updated.forEach(t => dispatch({ type: 'UPDATE_TEMPLATE', payload: t }));
    addAuditLog('Settings Updated', 'MessageTemplate', id, 'Message template updated');
    addToast('success', 'Template saved successfully');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-0.5">Configure your institute and system settings</p>
      </div>

      <Card>
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
        <div className="p-6">
          {tab === 'institute' && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2"><Building2 className="w-5 h-5" />Institute Information</h3>
              <Input label="Institute Name" value={settings.instituteName} onChange={e => updateSetting('instituteName', e.target.value)} />
              <Input label="Address" value={settings.instituteAddress} onChange={e => updateSetting('instituteAddress', e.target.value)} />
              <Input label="Phone" value={settings.institutePhone} onChange={e => updateSetting('institutePhone', e.target.value)} />
              <Input label="Email" type="email" value={settings.instituteEmail} onChange={e => updateSetting('instituteEmail', e.target.value)} />
              <div className="pt-2">
                <Button onClick={handleSave} loading={saving}><Save className="w-4 h-4 mr-1.5" />Save Changes</Button>
              </div>
            </div>
          )}

          {tab === 'fee' && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2"><CreditCard className="w-5 h-5" />Fee Settings</h3>
              <Input label="Default Monthly Fee (₹)" type="number" value={settings.defaultMonthlyFee} onChange={e => updateSetting('defaultMonthlyFee', Number(e.target.value))} />
              <Input label="Default Due Day" type="number" value={settings.defaultDueDay} onChange={e => updateSetting('defaultDueDay', Number(e.target.value))} min={1} max={28} />
              <Select label="Billing Cycle" value={settings.billingCycle} onChange={e => updateSetting('billingCycle', e.target.value)}>
                <option value="monthly">Monthly</option>
              </Select>
              <div className="pt-2">
                <Button onClick={handleSave} loading={saving}><Save className="w-4 h-4 mr-1.5" />Save Changes</Button>
              </div>
            </div>
          )}

          {tab === 'notification' && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2"><Bell className="w-5 h-5" />Notification Settings</h3>
              <ToggleSetting label="WhatsApp Notifications" description="Enable sending notifications via WhatsApp Business API" checked={settings.whatsappEnabled} onChange={v => updateSetting('whatsappEnabled', v)} />
              <ToggleSetting label="SMS Notifications" description="Enable sending notifications via SMS" checked={settings.smsEnabled} onChange={v => updateSetting('smsEnabled', v)} />
              <ToggleSetting label="SMS Fallback" description="Automatically send SMS if WhatsApp delivery fails" checked={settings.smsFallbackEnabled} onChange={v => updateSetting('smsFallbackEnabled', v)} />
              <div className="pt-2">
                <Button onClick={handleSave} loading={saving}><Save className="w-4 h-4 mr-1.5" />Save Changes</Button>
              </div>
            </div>
          )}

          {tab === 'reminder' && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2"><Clock className="w-5 h-5" />Reminder Settings</h3>
              <Input label="Reminder Before Due (days)" type="number" value={settings.reminderBeforeDue} onChange={e => updateSetting('reminderBeforeDue', Number(e.target.value))} />
              <ToggleSetting label="Reminder On Due Date" description="Send reminder on the exact due date" checked={settings.reminderOnDueDate} onChange={v => updateSetting('reminderOnDueDate', v)} />
              <Input label="Reminder After Due (days)" type="number" value={settings.reminderAfterDue} onChange={e => updateSetting('reminderAfterDue', Number(e.target.value))} />
              <Input label="Overdue Reminder (days)" type="number" value={settings.overdueReminder} onChange={e => updateSetting('overdueReminder', Number(e.target.value))} />
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-xs text-text-secondary font-medium mb-2">Reminder Schedule:</p>
                <ul className="text-xs text-text-secondary space-y-1">
                  <li>• {settings.reminderBeforeDue} days before due date</li>
                  <li>• {settings.reminderOnDueDate ? 'On due date' : 'Not on due date'}</li>
                  <li>• {settings.reminderAfterDue} days after due date</li>
                  <li>• {settings.overdueReminder} days after due date (overdue)</li>
                </ul>
              </div>
              <div className="pt-2">
                <Button onClick={handleSave} loading={saving}><Save className="w-4 h-4 mr-1.5" />Save Changes</Button>
              </div>
            </div>
          )}

          {tab === 'payment' && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2"><Shield className="w-5 h-5" />Payment Settings</h3>
              <ToggleSetting label="Online Payment" description="Enable online payment gateway for students" checked={settings.onlinePaymentEnabled} onChange={v => updateSetting('onlinePaymentEnabled', v)} />
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <p className="text-xs text-amber-800">
                  <strong>Note:</strong> Online payment requires payment gateway configuration. Set the following environment variables:
                </p>
                <code className="text-xs text-amber-700 mt-2 block font-mono">
                  PAYMENT_GATEWAY_KEY=<br />
                  PAYMENT_GATEWAY_SECRET=
                </code>
              </div>
              <div className="pt-2">
                <Button onClick={handleSave} loading={saving}><Save className="w-4 h-4 mr-1.5" />Save Changes</Button>
              </div>
            </div>
          )}

          {tab === 'templates' && <TemplatesSection templates={templates} onSave={handleSaveTemplate} />}

          {tab === 'audit' && <AuditLogsSection state={state} />}
        </div>
      </Card>
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-secondary mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-emerald-700' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}

function TemplatesSection({ templates, onSave }: { templates: any[]; onSave: (id: string, content: string) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const startEdit = (t: any) => {
    setEditingId(t.id);
    setEditContent(t.content);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-text-primary flex items-center gap-2"><FileText className="w-5 h-5" />Message Templates</h3>
      <p className="text-sm text-text-secondary">
        Available variables: <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{'{{student_name}} {{parent_name}} {{month}} {{amount}} {{due_amount}} {{due_date}} {{payment_method}} {{institute_name}}'}</code>
      </p>
      <div className="space-y-3">
        {templates.map(t => (
          <Card key={t.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-text-primary">{t.name}</h4>
              {editingId === t.id ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { onSave(t.id, editContent); setEditingId(null); }}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => startEdit(t)}>Edit</Button>
              )}
            </div>
            {editingId === t.id ? (
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                rows={6}
              />
            ) : (
              <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans">{t.content}</pre>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function AuditLogsSection({ state }: { state: any }) {
  const formatDate = (d: string) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-text-primary">Audit Logs</h3>
      <p className="text-sm text-text-secondary">Track all important admin actions</p>
      {state.auditLogs.length === 0 ? (
        <p className="text-sm text-text-secondary text-center py-8">No audit logs yet. Actions will be recorded here.</p>
      ) : (
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white">
              <tr className="text-xs text-text-secondary border-b border-border">
                <th className="text-left px-4 py-2.5 font-medium">Date/Time</th>
                <th className="text-left px-4 py-2.5 font-medium">Action</th>
                <th className="text-left px-4 py-2.5 font-medium hidden sm:table-cell">Entity</th>
                <th className="text-left px-4 py-2.5 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {state.auditLogs.slice(0, 50).map((log: any) => (
                <tr key={log.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  <td className="px-4 py-3 text-sm font-medium">{log.action}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary hidden sm:table-cell">{log.entity}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
