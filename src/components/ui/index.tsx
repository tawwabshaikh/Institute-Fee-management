import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Search, CheckCircle2, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import type { Toast as ToastType } from '../../types';

// Button
export function Button({ children, variant = 'primary', size = 'md', disabled, loading, onClick, className = '', type = 'button', ...props }: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-emerald-900 text-white hover:bg-emerald-800 focus:ring-emerald-700',
    secondary: 'bg-gray-100 text-text-primary hover:bg-gray-200 focus:ring-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
    ghost: 'text-text-secondary hover:bg-gray-100 focus:ring-gray-300',
    outline: 'border border-border text-text-primary hover:bg-gray-50 focus:ring-emerald-300',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button type={type} disabled={disabled || loading} onClick={onClick} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}

// Input
export function Input({ label, error, required, className = '', ...props }: {
  label?: string; error?: string; required?: boolean; className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-text-primary mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <input {...props} className={`w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition-colors ${error ? 'border-red-500 focus:ring-red-500/30' : ''}`} />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Select
export function Select({ label, error, required, children, className = '', ...props }: {
  label?: string; error?: string; required?: boolean; children: React.ReactNode; className?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-text-primary mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <select {...props} className={`w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition-colors bg-white ${error ? 'border-red-500' : ''}`}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Textarea
export function Textarea({ label, error, required, className = '', ...props }: {
  label?: string; error?: string; required?: boolean; className?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-text-primary mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <textarea {...props} className={`w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition-colors resize-none ${error ? 'border-red-500' : ''}`} />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Badge
export function Badge({ status, children }: { status: string; children?: React.ReactNode }) {
  const colors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-800',
    inactive: 'bg-gray-100 text-gray-600',
    PAID: 'bg-emerald-100 text-emerald-800',
    PENDING: 'bg-amber-100 text-amber-800',
    PARTIAL: 'bg-orange-100 text-orange-800',
    OVERDUE: 'bg-red-100 text-red-800',
    paid: 'bg-emerald-100 text-emerald-800',
    due: 'bg-amber-100 text-amber-800',
    partial: 'bg-orange-100 text-orange-800',
    overdue: 'bg-red-100 text-red-800',
    sent: 'bg-blue-100 text-blue-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    failed: 'bg-red-100 text-red-800',
    pending: 'bg-amber-100 text-amber-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cash: 'bg-gray-100 text-gray-700',
    upi: 'bg-purple-100 text-purple-800',
    bank_transfer: 'bg-blue-100 text-blue-800',
    online: 'bg-teal-100 text-teal-800',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {children || status}
    </span>
  );
}

// Card
export function Card({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`bg-surface border border-border rounded-xl shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}>
      {children}
    </div>
  );
}

// Modal
export function Modal({ open, onClose, title, children, size = 'md' }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-surface rounded-2xl shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto animate-fadeIn`}>
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ConfirmDialog
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmText?: string; danger?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-text-secondary mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }}>{confirmText}</Button>
      </div>
    </Modal>
  );
}

// SearchInput
export function SearchInput({ value, onChange, placeholder = 'Search...' }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700"
      />
    </div>
  );
}

// Pagination
export function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <p className="text-sm text-text-secondary">Page {page} of {totalPages}</p>
      <div className="flex gap-1">
        <button disabled={page === 1} onClick={() => onPageChange(page - 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let p = page - 2 + i;
          if (p < 1) p = i + 1;
          if (p > totalPages) p = totalPages - (4 - i);
          if (p < 1) return null;
          return (
            <button key={p} onClick={() => onPageChange(p)} className={`w-8 h-8 rounded-lg text-sm font-medium ${p === page ? 'bg-emerald-900 text-white' : 'hover:bg-gray-100'}`}>{p}</button>
          );
        })}
        <button disabled={page === totalPages} onClick={() => onPageChange(page + 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

// EmptyState
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Info className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-base font-medium text-text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-text-secondary mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

// LoadingState
export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
    </div>
  );
}

// Toast Container
export function ToastContainer() {
  const { state } = useApp();
  const icons: Record<string, React.ComponentType<{className?: string}>> = { success: CheckCircle2, error: AlertCircle, info: Info, warning: AlertTriangle };
  const colors: Record<string, string> = { success: 'bg-emerald-50 border-emerald-200 text-emerald-800', error: 'bg-red-50 border-red-200 text-red-800', info: 'bg-blue-50 border-blue-200 text-blue-800', warning: 'bg-amber-50 border-amber-200 text-amber-800' };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {state.toasts.map((toast: ToastType) => {
        const Icon = icons[toast.type] || Info;
        return (
          <div key={toast.id} className={`animate-toastIn flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg ${colors[toast.type] || colors.info}`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
}

// Tabs
export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string; count?: number }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 border-b border-border overflow-x-auto">
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)}
          className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${active === tab.id ? 'border-emerald-700 text-emerald-900' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
          {tab.label}{tab.count !== undefined && <span className="ml-1.5 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}

// StatCard
export function StatCard({ icon, label, value, subtext, color = 'emerald' }: {
  icon: React.ReactNode; label: string; value: string; subtext?: string; color?: string;
}) {
  const bgColors: Record<string, string> = {
    emerald: 'bg-emerald-50', blue: 'bg-blue-50', amber: 'bg-amber-50', red: 'bg-red-50', purple: 'bg-purple-50'
  };
  const iconColors: Record<string, string> = {
    emerald: 'text-emerald-700', blue: 'text-blue-700', amber: 'text-amber-700', red: 'text-red-700', purple: 'text-purple-700'
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary mb-1">{label}</p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          {subtext && <p className="text-xs text-text-secondary mt-1">{subtext}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${bgColors[color]}`}>
          <div className={iconColors[color]}>{icon}</div>
        </div>
      </div>
    </Card>
  );
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

// Format date
export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Month names
export function getMonthName(month: number): string {
  return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month];
}

// Generate receipt number
export function generateReceiptNumber(): string {
  return `RCP-${String(Math.floor(Math.random() * 9000) + 1000)}`;
}
