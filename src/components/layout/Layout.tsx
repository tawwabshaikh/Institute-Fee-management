import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Receipt, Bell, BarChart3, Settings, LogOut, Menu, X, GraduationCap, ChevronDown } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { ToastContainer } from '../ui';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'students', label: 'Students', icon: Users, path: '/students' },
  { id: 'fees', label: 'Fees', icon: CreditCard, path: '/fees' },
  { id: 'payments', label: 'Payments', icon: Receipt, path: '/payments' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
  { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useApp();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-emerald-900 text-white flex flex-col transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Brand */}
        <div className="px-6 py-5 border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base font-bold">𝗡𝗖²</h1>
              <p className="text-[10px] text-emerald-300 uppercase tracking-wider">Fee Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-white/15 text-white' : 'text-emerald-200 hover:bg-white/8 hover:text-white'}`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Admin info */}
        <div className="px-4 py-4 border-t border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-sm font-bold">A</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin</p>
              <p className="text-xs text-emerald-300">Administrator</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Logout">
              <LogOut className="w-4 h-4 text-emerald-300" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="bg-surface border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-xs text-text-secondary">𝗡𝗖² Institute</p>
              <p className="text-[10px] text-text-secondary italic">Feel The Quality of Education.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs text-text-secondary bg-gray-50 px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              System Online
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
