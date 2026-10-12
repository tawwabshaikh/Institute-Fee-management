import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Student, FeeRecord, Payment, Notification, MessageTemplate, AuditLog, SystemSettings, Toast } from '../types';
import { generateSeedData, getDefaultSettings, getDefaultTemplates } from '../data/seed';
import { v4 as uuid } from 'uuid';

interface AppState {
  students: Student[];
  feeRecords: FeeRecord[];
  payments: Payment[];
  notifications: Notification[];
  templates: MessageTemplate[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  isAuthenticated: boolean;
  toasts: Toast[];
}

type Action =
  | { type: 'SET_STATE'; payload: Partial<AppState> }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: string }
  | { type: 'ADD_FEE_RECORD'; payload: FeeRecord }
  | { type: 'ADD_PAYMENT'; payload: Payment }
  | { type: 'UPDATE_FEE_RECORD'; payload: FeeRecord }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_TEMPLATE'; payload: MessageTemplate }
  | { type: 'UPDATE_SETTINGS'; payload: SystemSettings }
  | { type: 'ADD_AUDIT_LOG'; payload: AuditLog }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'GENERATE_FEES'; payload: { month: number; year: number } };

const STORAGE_KEY = '𝗡𝗖²_fee_mgmt_data';

function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...parsed, toasts: [] };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  const seed = generateSeedData();
  return {
    ...seed,
    auditLogs: [],
    isAuthenticated: false,
    toasts: [],
  };
}

function saveState(state: AppState) {
  try {
    const { toasts, ...rest } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

function updateFeeRecordAfterPayment(feeRecord: FeeRecord, paymentAmount: number): FeeRecord {
  const newPaid = feeRecord.paidAmount + paymentAmount;
  const newDue = feeRecord.feeAmount - newPaid;
  let status: FeeRecord['status'];
  if (newDue <= 0) status = 'PAID';
  else if (newPaid > 0) status = 'PARTIAL';
  else status = 'PENDING';

  const now = new Date();
  const dueDate = new Date(feeRecord.dueDate);
  if (status !== 'PAID' && now > dueDate) status = 'OVERDUE';

  return { ...feeRecord, paidAmount: newPaid, dueAmount: Math.max(0, newDue), status, updatedAt: now.toISOString() };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'ADD_STUDENT':
      return { ...state, students: [...state.students, action.payload] };
    case 'UPDATE_STUDENT':
      return { ...state, students: state.students.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_STUDENT':
      return { ...state, students: state.students.filter(s => s.id !== action.payload) };
    case 'ADD_FEE_RECORD':
      return { ...state, feeRecords: [...state.feeRecords, action.payload] };
    case 'UPDATE_FEE_RECORD':
      return { ...state, feeRecords: state.feeRecords.map(f => f.id === action.payload.id ? action.payload : f) };
    case 'ADD_PAYMENT': {
      const payment = action.payload;
      const feeRecord = state.feeRecords.find(f => f.id === payment.feeRecordId);
      if (!feeRecord) return { ...state, payments: [...state.payments, payment] };
      const updatedFee = updateFeeRecordAfterPayment(feeRecord, payment.amount);
      return {
        ...state,
        payments: [...state.payments, payment],
        feeRecords: state.feeRecords.map(f => f.id === updatedFee.id ? updatedFee : f),
      };
    }
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'UPDATE_TEMPLATE':
      return { ...state, templates: state.templates.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };
    case 'ADD_AUDIT_LOG':
      return { ...state, auditLogs: [action.payload, ...state.auditLogs].slice(0, 500) };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    case 'LOGIN':
      return { ...state, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false };
    case 'GENERATE_FEES': {
      const { month, year } = action.payload;
      const newRecords: FeeRecord[] = [];
      const activeStudents = state.students.filter(s => s.status === 'active');
      activeStudents.forEach(student => {
        const exists = state.feeRecords.some(f =>
          f.studentId === student.id && f.billingMonth === month && f.billingYear === year
        );
        if (!exists) {
          const periodStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
          const lastDay = new Date(year, month + 1, 0).getDate();
          const periodEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
          const dueDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(student.feeDueDay).padStart(2, '0')}`;
          newRecords.push({
            id: uuid(),
            studentId: student.id,
            billingMonth: month,
            billingYear: year,
            periodStart,
            periodEnd,
            feeAmount: student.monthlyFee,
            paidAmount: 0,
            dueAmount: student.monthlyFee,
            dueDate,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      });
      return { ...state, feeRecords: [...state.feeRecords, ...newRecords] };
    }
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addToast: (type: Toast['type'], message: string) => void;
  addAuditLog: (action: string, entity: string, entityId: string, description: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state.students, state.feeRecords, state.payments, state.notifications, state.templates, state.settings, state.auditLogs, state.isAuthenticated]);

  const addToast = (type: Toast['type'], message: string) => {
    const id = uuid();
    dispatch({ type: 'ADD_TOAST', payload: { id, type, message } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 4000);
  };

  const addAuditLog = (action: string, entity: string, entityId: string, description: string) => {
    dispatch({
      type: 'ADD_AUDIT_LOG',
      payload: {
        id: uuid(),
        action,
        adminId: 'admin-1',
        adminName: 'Administrator',
        entity,
        entityId,
        description,
        createdAt: new Date().toISOString(),
      },
    });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, addToast, addAuditLog }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
