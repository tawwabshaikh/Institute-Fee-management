import { Student, FeeRecord, Payment, Notification, MessageTemplate, AuditLog, SystemSettings } from '../types';
import { v4 as uuid } from 'uuid';

const courses = [
  { name: 'Web Development', batch: 'WD-01', fee: 2500 },
  { name: 'Web Development', batch: 'WD-02', fee: 2500 },
  { name: 'Python Programming', batch: 'PY-01', fee: 3000 },
  { name: 'Python Programming', batch: 'PY-02', fee: 3000 },
  { name: 'Digital Marketing', batch: 'DM-01', fee: 2000 },
  { name: 'Graphic Design', batch: 'GD-01', fee: 2500 },
  { name: 'Data Science', batch: 'DS-01', fee: 3500 },
  { name: 'Mobile App Development', batch: 'MA-01', fee: 3000 },
];

const firstNames = ['Ahmed', 'Sara', 'Mohammed', 'Fatima', 'Ali', 'Aisha', 'Omar', 'Zainab', 'Hassan', 'Maryam', 'Ibrahim', 'Khadija', 'Yusuf', 'Amina', 'Bilal', 'Hana', 'Tariq', 'Sana', 'Imran', 'Nadia', 'Faisal', 'Rida', 'Kamran', 'Bushra', 'Saad'];
const lastNames = ['Shaikh', 'Khan', 'Patel', 'Ansari', 'Siddiqui', 'Qureshi', 'Malik', 'Sheikh', 'Ahmed', 'Raza', 'Ali', 'Hussain', 'Mirza', 'Beg', 'Syed'];

function randomDate(start: Date, end: Date): string {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split('T')[0];
}

function generateStudents(): Student[] {
  const students: Student[] = [];
  for (let i = 0; i < 25; i++) {
    const course = courses[i % courses.length];
    const fn = firstNames[i];
    const ln = lastNames[i % lastNames.length];
    const isActive = i < 23;
    students.push({
      id: uuid(),
      studentId: `STU-${String(i + 1).padStart(3, '0')}`,
      fullName: `${fn} ${ln}`,
      dateOfBirth: randomDate(new Date(1995, 0, 1), new Date(2003, 11, 31)),
      gender: i % 3 === 0 ? 'female' : 'male',
      phone: `98765${String(40000 + i).slice(0, 5)}`,
      whatsapp: `98765${String(40000 + i).slice(0, 5)}`,
      address: `${10 + i}, Main Road, City`,
      parentName: `${firstNames[(i + 5) % 25]} ${ln}`,
      parentPhone: `98765${String(50000 + i).slice(0, 5)}`,
      parentWhatsapp: `98765${String(50000 + i).slice(0, 5)}`,
      course: course.name,
      batch: course.batch,
      joiningDate: randomDate(new Date(2024, 0, 1), new Date(2026, 5, 30)),
      monthlyFee: course.fee,
      feeDueDay: i % 5 === 0 ? 10 : (i % 3 === 0 ? 5 : 1),
      status: isActive ? 'active' : 'inactive',
      createdAt: new Date(2024, 0, 1).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  return students;
}

function generateFeeRecords(students: Student[]): FeeRecord[] {
  const records: FeeRecord[] = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  students.filter(s => s.status === 'active').forEach((student, idx) => {
    // Generate records for last 4 months
    for (let m = 0; m < 4; m++) {
      let month = currentMonth - m;
      let year = currentYear;
      if (month < 0) { month += 12; year -= 1; }

      const periodStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const periodEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      const dueDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(student.feeDueDay).padStart(2, '0')}`;

      let status: FeeRecord['status'];
      let paidAmount: number;

      if (m === 0) {
        // Current month - mix of statuses
        if (idx % 5 === 0) { status = 'PAID'; paidAmount = student.monthlyFee; }
        else if (idx % 5 === 1) { status = 'PARTIAL'; paidAmount = Math.round(student.monthlyFee * 0.4); }
        else if (idx % 5 === 2) { status = 'PENDING'; paidAmount = 0; }
        else if (idx % 5 === 3) { status = 'OVERDUE'; paidAmount = 0; }
        else { status = 'PAID'; paidAmount = student.monthlyFee; }
      } else if (m === 1) {
        // Last month
        if (idx % 7 === 0) { status = 'PARTIAL'; paidAmount = Math.round(student.monthlyFee * 0.6); }
        else if (idx % 7 === 1) { status = 'OVERDUE'; paidAmount = 0; }
        else { status = 'PAID'; paidAmount = student.monthlyFee; }
      } else {
        // Older months - mostly paid
        if (idx % 10 === 0) { status = 'PARTIAL'; paidAmount = Math.round(student.monthlyFee * 0.5); }
        else { status = 'PAID'; paidAmount = student.monthlyFee; }
      }

      records.push({
        id: uuid(),
        studentId: student.id,
        billingMonth: month,
        billingYear: year,
        periodStart,
        periodEnd,
        feeAmount: student.monthlyFee,
        paidAmount,
        dueAmount: student.monthlyFee - paidAmount,
        dueDate,
        status,
        createdAt: new Date(year, month, 1).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  });
  return records;
}

function generatePayments(students: Student[], feeRecords: FeeRecord[]): Payment[] {
  const payments: Payment[] = [];
  const methods: Payment['paymentMethod'][] = ['cash', 'upi', 'bank_transfer', 'online'];

  feeRecords.filter(f => f.paidAmount > 0).forEach((record, idx) => {
    const student = students.find(s => s.id === record.studentId)!;
    const method = methods[idx % methods.length];
    const isPartial = record.status === 'PARTIAL';

    payments.push({
      id: uuid(),
      receiptNumber: `RCP-${String(idx + 1).padStart(4, '0')}`,
      studentId: student.id,
      feeRecordId: record.id,
      amount: record.paidAmount,
      paymentMethod: method,
      transactionId: method !== 'cash' ? `TXN${String(Math.random()).slice(2, 14)}` : undefined,
      paymentDate: `${record.billingYear}-${String(record.billingMonth + 1).padStart(2, '0')}-${String(Math.min(student.feeDueDay + Math.floor(Math.random() * 5), 28)).padStart(2, '0')}`,
      notes: isPartial ? 'Partial payment' : undefined,
      status: 'completed',
      createdAt: new Date().toISOString(),
    });

    // Add second payment for some partial records
    if (isPartial && idx % 3 === 0) {
      const remaining = record.feeAmount - record.paidAmount;
      const secondAmount = Math.round(remaining * 0.5);
      payments.push({
        id: uuid(),
        receiptNumber: `RCP-${String(payments.length + 1).padStart(4, '0')}`,
        studentId: student.id,
        feeRecordId: record.id,
        amount: secondAmount,
        paymentMethod: methods[(idx + 1) % methods.length],
        transactionId: `TXN${String(Math.random()).slice(2, 14)}`,
        paymentDate: `${record.billingYear}-${String(record.billingMonth + 1).padStart(2, '0')}-${String(Math.min(student.feeDueDay + 10, 28)).padStart(2, '0')}`,
        notes: 'Second installment',
        status: 'completed',
        createdAt: new Date().toISOString(),
      });
    }
  });
  return payments;
}

function generateNotifications(students: Student[]): Notification[] {
  const notifications: Notification[] = [];
  const types: Notification['type'][] = ['fee_reminder', 'payment_confirmation', 'overdue_reminder'];
  const statuses: Notification['status'][] = ['delivered', 'sent', 'failed', 'pending'];

  for (let i = 0; i < 30; i++) {
    const student = students[i % students.length];
    const type = types[i % types.length];
    const channel: Notification['channel'] = i % 4 === 0 ? 'sms' : 'whatsapp';
    const status = statuses[i % statuses.length];

    notifications.push({
      id: uuid(),
      studentId: student.id,
      type,
      channel,
      message: type === 'fee_reminder' ? `Dear ${student.parentName}, fee reminder for ${student.fullName}` :
               type === 'payment_confirmation' ? `Payment received for ${student.fullName}` :
               `Overdue reminder for ${student.fullName}`,
      recipient: channel === 'whatsapp' ? student.parentWhatsapp : (student.parentPhone || student.parentWhatsapp),
      status,
      providerMessageId: status !== 'failed' ? `msg_${uuid().slice(0, 8)}` : undefined,
      failureReason: status === 'failed' ? 'Number not registered on WhatsApp' : undefined,
      sentAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    });
  }
  return notifications;
}

export function getDefaultSettings(): SystemSettings {
  return {
    instituteName: '𝗡𝗖² Institute',
    instituteAddress: '123 Education Lane, Knowledge City, 400001',
    institutePhone: '+91 98765 43210',
    instituteEmail: 'admin@𝗡𝗖²institute.com',
    defaultMonthlyFee: 2500,
    defaultDueDay: 1,
    billingCycle: 'monthly',
    whatsappEnabled: true,
    smsEnabled: true,
    smsFallbackEnabled: true,
    reminderBeforeDue: 3,
    reminderOnDueDate: true,
    reminderAfterDue: 3,
    overdueReminder: 7,
    onlinePaymentEnabled: false,
  };
}

export function getDefaultTemplates(): MessageTemplate[] {
  return [
    {
      id: uuid(),
      name: 'Fee Reminder',
      type: 'fee_reminder',
      content: `Assalamu Alaikum {{parent_name}},\n\nThis is a gentle reminder that {{student_name}}'s {{month}} month fee of ₹{{amount}} is due on {{due_date}}.\n\nKindly submit the fee at your earliest convenience.\n\nRegards,\n{{institute_name}}`,
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuid(),
      name: 'Fee Due',
      type: 'fee_due',
      content: `Dear {{parent_name}},\n\n{{student_name}}'s fee of ₹{{amount}} for {{month}} is due today ({{due_date}}).\n\nPlease arrange the payment.\n\n{{institute_name}}`,
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuid(),
      name: 'Overdue Reminder',
      type: 'overdue_reminder',
      content: `Dear {{parent_name}},\n\nThis is to inform you that {{student_name}}'s fee of ₹{{due_amount}} for {{month}} is overdue.\n\nPlease clear the dues at the earliest to avoid any inconvenience.\n\n{{institute_name}}`,
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuid(),
      name: 'Payment Confirmation',
      type: 'payment_confirmation',
      content: `Dear {{parent_name}},\n\nWe have received ₹{{amount}} as fee payment for {{student_name}} for {{month}}.\n\nPayment Method: {{payment_method}}\n\nThank you!\n{{institute_name}}`,
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuid(),
      name: 'Receipt',
      type: 'receipt',
      content: `Dear {{parent_name}},\n\nFee receipt for {{student_name}}:\n\nMonth: {{month}}\nAmount: ₹{{amount}}\nPayment Method: {{payment_method}}\n\nThank you for your payment.\n{{institute_name}}`,
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function generateSeedData() {
  const students = generateStudents();
  const feeRecords = generateFeeRecords(students);
  const payments = generatePayments(students, feeRecords);
  const notifications = generateNotifications(students);
  const templates = getDefaultTemplates();
  const settings = getDefaultSettings();

  return { students, feeRecords, payments, notifications, templates, settings };
}
