import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, UserX } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, Badge, Button, SearchInput, Pagination, Tabs, Modal, ConfirmDialog, Input, Select, formatCurrency, EmptyState } from '../components/ui';
import { Student } from '../types';
import { v4 as uuid } from 'uuid';

export function StudentsPage() {
  const { state, dispatch, addToast, addAuditLog } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const perPage = 10;

  const filtered = useMemo(() => {
    let list = state.students;
    if (tab === 'active') list = list.filter(s => s.status === 'active');
    if (tab === 'inactive') list = list.filter(s => s.status === 'inactive');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.fullName.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q) || (s.phone || '').includes(q) || (s.parentPhone || '').includes(q));
    }
    return list;
  }, [state.students, tab, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDeactivate = (student: Student) => {
    dispatch({ type: 'UPDATE_STUDENT', payload: { ...student, status: student.status === 'active' ? 'inactive' : 'active', updatedAt: new Date().toISOString() } });
    addAuditLog(student.status === 'active' ? 'Student Deactivated' : 'Student Activated', 'Student', student.id, `${student.fullName} ${student.status === 'active' ? 'deactivated' : 'activated'}`);
    addToast('success', `Student ${student.status === 'active' ? 'deactivated' : 'activated'} successfully`);
  };

  const handleDelete = (id: string) => {
    const student = state.students.find(s => s.id === id);
    dispatch({ type: 'DELETE_STUDENT', payload: id });
    addAuditLog('Student Deleted', 'Student', id, `${student?.fullName} deleted`);
    addToast('success', 'Student deleted successfully');
    setDeleteId(null);
  };

  const tabs = [
    { id: 'all', label: 'All', count: state.students.length },
    { id: 'active', label: 'Active', count: state.students.filter(s => s.status === 'active').length },
    { id: 'inactive', label: 'Inactive', count: state.students.filter(s => s.status === 'inactive').length },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Students</h1>
          <p className="text-sm text-text-secondary mt-0.5">Manage all your students</p>
        </div>
        <Button onClick={() => navigate('/students/add')}><Plus className="w-4 h-4 mr-2" />Add Student</Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by name, ID, or phone..." />
          </div>
        </div>
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
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase">Name</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase hidden md:table-cell">Course</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase hidden lg:table-cell">Batch</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-text-secondary uppercase">Monthly Fee</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-text-secondary uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(student => (
                <tr key={student.id} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-mono text-text-secondary">{student.studentId}</td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-text-primary">{student.fullName}</p>
                    <p className="text-xs text-text-secondary md:hidden">{student.course}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary hidden md:table-cell">{student.course}</td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary hidden lg:table-cell">{student.batch || '-'}</td>
                  <td className="px-5 py-3.5 text-sm text-right font-medium text-text-primary">{formatCurrency(student.monthlyFee)}</td>
                  <td className="px-5 py-3.5"><Badge status={student.status}>{student.status}</Badge></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`/students/${student.id}`)} className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary hover:text-text-primary" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => navigate(`/students/${student.id}/edit`)} className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary hover:text-text-primary" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeactivate(student)} className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary hover:text-amber-600" title={student.status === 'active' ? 'Deactivate' : 'Activate'}>
                        <UserX className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(student.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary hover:text-red-600" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paginated.length === 0 && <EmptyState title="No students found" description="Try adjusting your search or filter." action={<Button onClick={() => navigate('/students/add')}>Add Student</Button>} />}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone. All associated fee records and payments will also be removed."
        confirmText="Delete"
        danger
      />
    </div>
  );
}

// Add/Edit Student Form
export function StudentFormPage({ editId }: { editId?: string }) {
  const { state, dispatch, addToast, addAuditLog } = useApp();
  const navigate = useNavigate();
  const existing = editId ? state.students.find(s => s.id === editId) : undefined;

  const [form, setForm] = useState({
    fullName: existing?.fullName || '',
    dateOfBirth: existing?.dateOfBirth || '',
    gender: existing?.gender || '' as string,
    phone: existing?.phone || '',
    whatsapp: existing?.whatsapp || '',
    address: existing?.address || '',
    parentName: existing?.parentName || '',
    parentPhone: existing?.parentPhone || '',
    parentWhatsapp: existing?.parentWhatsapp || '',
    course: existing?.course || '',
    batch: existing?.batch || '',
    joiningDate: existing?.joiningDate || new Date().toISOString().split('T')[0],
    monthlyFee: existing?.monthlyFee || state.settings.defaultMonthlyFee,
    feeDueDay: existing?.feeDueDay || state.settings.defaultDueDay,
    status: existing?.status || 'active' as string,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const update = (field: string, value: string | number) => setForm(prev => ({ ...prev, [field]: value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.parentName.trim()) errs.parentName = 'Parent name is required';
    if (!form.parentWhatsapp.trim()) errs.parentWhatsapp = 'Parent WhatsApp is required';
    if (!form.course.trim()) errs.course = 'Course is required';
    if (!form.joiningDate) errs.joiningDate = 'Joining date is required';
    if (!form.monthlyFee || form.monthlyFee <= 0) errs.monthlyFee = 'Monthly fee must be greater than 0';
    if (!form.feeDueDay || form.feeDueDay < 1 || form.feeDueDay > 28) errs.feeDueDay = 'Due day must be 1-28';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    setTimeout(() => {
      if (existing) {
        const updated: Student = { ...existing, ...form, gender: form.gender as Student['gender'], status: form.status as Student['status'], monthlyFee: Number(form.monthlyFee), feeDueDay: Number(form.feeDueDay), updatedAt: new Date().toISOString() };
        dispatch({ type: 'UPDATE_STUDENT', payload: updated });
        addAuditLog('Student Updated', 'Student', existing.id, `${form.fullName} updated`);
        addToast('success', 'Student updated successfully');
      } else {
        const newStudent: Student = {
          id: uuid(),
          studentId: `STU-${String(state.students.length + 1).padStart(3, '0')}`,
          fullName: form.fullName,
          dateOfBirth: form.dateOfBirth || undefined,
          gender: form.gender as Student['gender'] || undefined,
          phone: form.phone || undefined,
          whatsapp: form.whatsapp || undefined,
          address: form.address || undefined,
          parentName: form.parentName,
          parentPhone: form.parentPhone || undefined,
          parentWhatsapp: form.parentWhatsapp,
          course: form.course,
          batch: form.batch || undefined,
          joiningDate: form.joiningDate,
          monthlyFee: Number(form.monthlyFee),
          feeDueDay: Number(form.feeDueDay),
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_STUDENT', payload: newStudent });
        addAuditLog('Student Created', 'Student', newStudent.id, `${form.fullName} added`);
        addToast('success', 'Student added successfully');
        navigate(`/students/${newStudent.id}`);
        return;
      }
      setSaving(false);
      navigate(`/students/${existing.id}`);
    }, 500);
  };

  const courses = ['Web Development', 'Python Programming', 'Digital Marketing', 'Graphic Design', 'Data Science', 'Mobile App Development'];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{existing ? 'Edit Student' : 'Add Student'}</h1>
        <p className="text-sm text-text-secondary mt-0.5">{existing ? 'Update student information' : 'Fill in the details to add a new student'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card className="p-6">
          <h3 className="text-base font-semibold text-text-primary mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" required value={form.fullName} onChange={e => update('fullName', e.target.value)} error={errors.fullName} placeholder="Enter full name" />
            <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} />
            <Select label="Gender" value={form.gender} onChange={e => update('gender', e.target.value)}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
            <Input label="Student Phone" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="Phone number" />
            <Input label="Student WhatsApp" value={form.whatsapp} onChange={e => update('whatsapp', e.target.value)} placeholder="WhatsApp number" />
            <Input label="Address" value={form.address} onChange={e => update('address', e.target.value)} placeholder="Full address" className="sm:col-span-2" />
          </div>
        </Card>

        {/* Parent Information */}
        <Card className="p-6">
          <h3 className="text-base font-semibold text-text-primary mb-4">Parent / Guardian Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Parent Name" required value={form.parentName} onChange={e => update('parentName', e.target.value)} error={errors.parentName} placeholder="Parent/Guardian name" />
            <Input label="Parent Phone" value={form.parentPhone} onChange={e => update('parentPhone', e.target.value)} placeholder="Phone number" />
            <Input label="Parent WhatsApp" required value={form.parentWhatsapp} onChange={e => update('parentWhatsapp', e.target.value)} error={errors.parentWhatsapp} placeholder="WhatsApp number" />
          </div>
        </Card>

        {/* Academic Information */}
        <Card className="p-6">
          <h3 className="text-base font-semibold text-text-primary mb-4">Academic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Course" required value={form.course} onChange={e => update('course', e.target.value)} error={errors.course}>
              <option value="">Select course</option>
              {courses.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input label="Batch" value={form.batch} onChange={e => update('batch', e.target.value)} placeholder="e.g., WD-01" />
            <Input label="Joining Date" type="date" required value={form.joiningDate} onChange={e => update('joiningDate', e.target.value)} error={errors.joiningDate} />
          </div>
        </Card>

        {/* Fee Information */}
        <Card className="p-6">
          <h3 className="text-base font-semibold text-text-primary mb-4">Fee Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Monthly Fee (₹)" type="number" required value={form.monthlyFee} onChange={e => update('monthlyFee', e.target.value)} error={errors.monthlyFee} min={0} />
            <Input label="Fee Due Day" type="number" required value={form.feeDueDay} onChange={e => update('feeDueDay', e.target.value)} error={errors.feeDueDay} min={1} max={28} />
            {existing && (
              <Select label="Status" value={form.status} onChange={e => update('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={saving}>{existing ? 'Update Student' : 'Save Student'}</Button>
        </div>
      </form>
    </div>
  );
}
