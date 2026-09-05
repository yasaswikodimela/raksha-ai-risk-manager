import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePolling } from '../hooks/usePolling';
import { api } from '../services/api';
import MetricCard from '../components/MetricCard';
import RiskBadge from '../components/RiskBadge';
import DecisionBadge from '../components/DecisionBadge';
import { ShieldCheck, ShieldAlert, Activity, Users, CreditCard, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

function Dashboard() {
  const navigate = useNavigate();
  const { data: metricsData, isLoading: metricsLoading } = usePolling(api.getMetrics, 5000);
  const { data: transactionsData, isLoading: txLoading } = usePolling(api.getTransactions, 5000);

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
  };

  const riskChartData = useMemo(() => {
    if (!metricsData) return [];
    return [
      { name: 'LOW', value: metricsData.low_risk || 0, color: '#10b981' },
      { name: 'MEDIUM', value: metricsData.medium_risk || 0, color: '#f59e0b' },
      { name: 'HIGH', value: metricsData.high_risk || 0, color: '#ef4444' },
    ];
  }, [metricsData]);

  const transactions = useMemo(() => {
    return (transactionsData?.transactions || []).slice(0, 15); // Show latest 15
  }, [transactionsData]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-raksha-dark tracking-tight">Risk Command Center</h1>
          <p className="text-slate-500 mt-1">Real-time transaction risk monitoring and intelligent investigation.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-raksha-gold opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-raksha-gold"></span>
          </span>
          Live Feed Active
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Transactions Analyzed" 
          value={metricsLoading ? "..." : (metricsData?.transactions_analyzed?.toLocaleString() || "0")} 
          icon={Activity} 
        />
        <MetricCard 
          title="High Risk" 
          value={metricsLoading ? "..." : (metricsData?.high_risk?.toLocaleString() || "0")} 
          icon={ShieldAlert}
          subtitle="Requires immediate review"
        />
        <MetricCard 
          title="Precision" 
          value={metricsLoading ? "..." : `${((metricsData?.precision || 0) * 100).toFixed(1)}%`} 
          icon={ShieldCheck} 
        />
        <MetricCard 
          title="False Positives" 
          value={metricsLoading ? "..." : (metricsData?.false_positives?.toLocaleString() || "0")} 
          icon={Users} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Distribution Chart */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Risk Exposure</h2>
          <div className="flex-1 min-h-[250px] relative">
            {metricsLoading ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [value, 'Transactions']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Transaction Monitor Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-raksha-gold" />
              Live Transaction Monitor
            </h2>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Transaction ID</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Method</th>
                  <th className="px-6 py-4 font-medium">Risk Score</th>
                  <th className="px-6 py-4 font-medium">Risk Level</th>
                  <th className="px-6 py-4 font-medium">Decision</th>
                  <th className="px-6 py-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {txLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                      <Shield className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                      No transactions detected yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr 
                      key={tx.transaction_id} 
                      onClick={() => navigate(`/transactions/${tx.transaction_id}`)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">
                        {tx.transaction_id.substring(0, 12)}...
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {formatCurrency(tx.amount, tx.currency)}
                      </td>
                      <td className="px-6 py-4 text-slate-500 uppercase text-xs">
                        {tx.payment_method}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono">{tx.risk_score?.toFixed(3)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <RiskBadge level={tx.risk_level} />
                      </td>
                      <td className="px-6 py-4">
                        <DecisionBadge decision={tx.decision} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-raksha-gold transition-colors inline-block" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;

