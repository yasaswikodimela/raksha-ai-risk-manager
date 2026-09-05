import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, Activity, FileText, Menu, Server } from 'lucide-react';
import { api } from '../services/api';
import { usePolling } from '../hooks/usePolling';
import clsx from 'clsx';

function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const { data: healthData, error: healthError } = usePolling(api.checkHealth, 10000);
  const isOnline = healthData?.status === 'ok' && !healthError;

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Risk Analytics', href: '/analytics', icon: Activity },
    { name: 'Audit Trail', href: '/audit', icon: FileText },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-raksha-bg font-sans text-slate-800">
      
      {/* Mobile Sidebar Overlay */}
      <div className={clsx("fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm lg:hidden transition-opacity", 
            mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none")} 
           onClick={() => setMobileMenuOpen(false)} />

      {/* Sidebar */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-raksha-dark text-slate-300 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:flex lg:flex-col",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo Area */}
        <div className="flex items-center h-20 px-6 bg-slate-900/50 border-b border-slate-800">
          <img src="/Raksha.png" alt="RAKSHA Logo" className="h-10 w-auto mr-3 object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
          <div className="flex flex-col">
            <span className="text-raksha-gold font-bold tracking-widest text-lg leading-tight uppercase">Raksha</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Risk Manager</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                  isActive 
                    ? "bg-slate-800/80 text-raksha-gold font-medium border border-slate-700/50" 
                    : "hover:bg-slate-800/40 hover:text-white"
                )}
              >
                <item.icon className={clsx("w-5 h-5", isActive ? "text-raksha-gold" : "text-slate-500 group-hover:text-slate-300")} />
                {item.name}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom System Status */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-800 text-xs">
          <h4 className="text-slate-500 font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
            <Server className="w-3.5 h-3.5" /> System Status
          </h4>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span>Backend API</span>
              <div className="flex items-center gap-1.5">
                <span className={clsx("w-2 h-2 rounded-full", isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]")} />
                <span className={isOnline ? "text-emerald-400" : "text-red-400"}>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
            <div className="flex justify-between items-center opacity-80">
              <span>Razorpay</span>
              <div className="flex items-center gap-1.5">
                <span className={clsx("w-1.5 h-1.5 rounded-full", isOnline ? "bg-emerald-500" : "bg-slate-600")} />
                <span>Connected</span>
              </div>
            </div>
            <div className="flex justify-between items-center opacity-80">
              <span>AI Engine</span>
              <div className="flex items-center gap-1.5">
                <span className={clsx("w-1.5 h-1.5 rounded-full", isOnline ? "bg-emerald-500" : "bg-slate-600")} />
                <span>Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
             <img src="/Raksha.png" alt="Logo" className="h-8 w-auto" />
             <span className="font-bold text-raksha-dark">RAKSHA</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-md"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Global Error Banner if Offline */}
        {!isOnline && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center justify-center text-sm text-red-700">
            <ShieldAlert className="w-4 h-4 mr-2" />
            Unable to connect to RAKSHA backend. Running in Demo Mode / Retrying...
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;

