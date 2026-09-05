import { Activity } from 'lucide-react';

function RiskAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-raksha-dark tracking-tight">Risk Analytics</h1>
        <p className="text-slate-500 mt-1">Detailed historical trends and pattern analysis.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
        <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-slate-600">Advanced Analytics Available in Production</h3>
        <p className="text-slate-500 mt-2">Connect to a live data warehouse to view historical trends.</p>
      </div>
    </div>
  );
}

export default RiskAnalytics;

