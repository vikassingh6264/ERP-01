import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FlaskConical, 
  Package, 
  FileText, 
  ShoppingCart, 
  Truck, 
  DollarSign,
  LogOut,
  Menu,
  X,
  BarChart3
} from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['Marketing', 'Lab', 'Logistics', 'Admin'] },
    { icon: Users, label: 'Inquiries', path: '/inquiries', roles: ['Marketing', 'Admin'] },
    { icon: FlaskConical, label: 'Samples', path: '/samples', roles: ['Lab', 'Admin'] },
    { icon: Package, label: 'Lab Tests', path: '/lab-tests', roles: ['Lab', 'Admin'] },
    { icon: Package, label: 'Chemical Inventory', path: '/chemicals', roles: ['Lab', 'Admin'] },
    { icon: FileText, label: 'Quotations', path: '/quotations', roles: ['Marketing', 'Admin'] },
    { icon: ShoppingCart, label: 'Sales Orders', path: '/sales-orders', roles: ['Marketing', 'Logistics', 'Admin'] },
    { icon: FileText, label: 'Invoices', path: '/invoices', roles: ['Marketing', 'Admin'] },
    { icon: ShoppingCart, label: 'Purchase Orders', path: '/purchase-orders', roles: ['Logistics', 'Admin'] },
    { icon: Truck, label: 'Shipments', path: '/shipments', roles: ['Logistics', 'Admin'] },
    { icon: DollarSign, label: 'Payments', path: '/payments', roles: ['Admin'] },
    { icon: BarChart3, label: 'Reports & Analytics', path: '/reports', roles: ['Admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const MenuItem = ({ item }) => {
    const isActive = location.pathname === item.path;
    return (
      <button
        data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
        onClick={() => {
          navigate(item.path);
          setSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
          isActive
            ? 'bg-teal-600 text-white shadow-sm'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <item.icon className="w-5 h-5" />
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 text-white">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>
            ChemExport
          </h1>
          <p className="text-xs text-slate-400 mt-1">ERP & Lab Management</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredMenuItems.map((item, index) => (
            <MenuItem key={index} item={item} />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center font-semibold">
              {user?.full_name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.full_name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role}</p>
            </div>
          </div>
          <Button
            data-testid="logout-button"
            onClick={handleLogout}
            variant="outline"
            className="w-full border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <aside className="w-64 h-full bg-slate-900 text-white" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  ChemExport
                </h1>
                <p className="text-xs text-slate-400 mt-1">ERP & Lab Management</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="p-4 space-y-2 overflow-y-auto">
              {filteredMenuItems.map((item, index) => (
                <MenuItem key={index} item={item} />
              ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center font-semibold">
                  {user?.full_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.full_name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.role}</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between lg:justify-end">
          <button
            data-testid="mobile-menu-button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-600 hover:text-slate-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{user?.full_name}</p>
              <p className="text-xs text-slate-500">{user?.role}</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;