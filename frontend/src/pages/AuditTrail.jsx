import React from 'react';
import { FileText, Search } from 'lucide-react';

function AuditTrail() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-raksha-dark tracking-tight">System Audit Trail</h1>
        <p className="text-slate-500 mt-1">Immutable record of system events and risk decisions.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Transaction ID..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-raksha-gold/50"
            />
          </div>
        </div>
        <div className="p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-slate-600">Global Audit Log</h3>
          <p className="text-slate-500 mt-2">Search for a specific transaction to view its detailed audit timeline.</p>
        </div>
      </div>
    </div>
  );
}

export default AuditTrail;

