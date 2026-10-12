export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

export interface Student {
  id: string;
  studentId: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  whatsapp?: string;
  address?: string;
  parentName: string;
  parentPhone?: string;
  parentWhatsapp: string;
  course: string;
  batch?: string;
  joiningDate: string;
  monthlyFee: number;
  feeDueDay: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  billingMonth: number;
  billingYear: number;
  periodStart: string;
  periodEnd: string;
  feeAmount: number;
  paidAmount: number;
  dueAmount: number;
  dueDate: string;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  receiptNumber: string;
  studentId: string;
  feeRecordId: string;
  amount: number;
  paymentMethod: 'cash' | 'upi' | 'bank_transfer' | 'online';
  transactionId?: string;
  paymentDate: string;
  notes?: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

export interface Notification {
  id: string;
  studentId: string;
  type: 'fee_reminder' | 'payment_confirmation' | 'overdue_reminder' | 'receipt';
  channel: 'whatsapp' | 'sms';
  message: string;
  recipient: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  providerMessageId?: string;
  failureReason?: string;
  sentAt: string;
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  type: 'fee_reminder' | 'fee_due' | 'overdue_reminder' | 'payment_confirmation' | 'receipt';
  content: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  adminId: string;
  adminName: string;
  entity: string;
  entityId: string;
  description: string;
  createdAt: string;
}

export interface SystemSettings {
  instituteName: string;
  instituteAddress: string;
  institutePhone: string;
  instituteEmail: string;
  defaultMonthlyFee: number;
  defaultDueDay: number;
  billingCycle: 'monthly';
  whatsappEnabled: boolean;
  smsEnabled: boolean;
  smsFallbackEnabled: boolean;
  reminderBeforeDue: number;
  reminderOnDueDate: boolean;
  reminderAfterDue: number;
  overdueReminder: number;
  onlinePaymentEnabled: boolean;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'online';
export type FeeStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
export type NotificationType = 'fee_reminder' | 'payment_confirmation' | 'overdue_reminder' | 'receipt';
export type NotificationChannel = 'whatsapp' | 'sms';
export type NotificationStatus = 'sent' | 'delivered' | 'failed' | 'pending';
