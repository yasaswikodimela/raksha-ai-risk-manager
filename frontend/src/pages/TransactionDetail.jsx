import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import DecisionBadge from '../components/DecisionBadge';
import { ArrowLeft, BrainCircuit, AlertTriangle, Fingerprint, Clock, FileWarning, RefreshCw, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    const fetchTx = async () => {
      try {
        setLoading(true);
        const data = await api.getTransactionDetails(id);
        if (data.error) throw new Error(data.error);
        setTransaction(data);
      } catch (err) {
        setError(err.message || 'Failed to load transaction');
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, [id]);

  const handleInvestigate = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const result = await api.investigateTransaction(id);
      if (result.error) throw new Error(result.error);
      setAiResult(result.investigation);
    } catch (err) {
      setAiError(err.message || 'AI investigation failed. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-raksha-gold"></div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-700 mb-2">Transaction Not Found</h2>
        <p className="text-red-600 mb-6">{error}</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-white text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/')}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Transaction Details
          </h1>
          <p className="text-sm text-slate-500 font-mono mt-1">ID: {transaction.transaction_id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Overview & AI */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
            <div className={clsx(
              "absolute top-0 left-0 w-1 h-full",
              transaction.risk_level === 'HIGH' ? 'bg-red-500' : 
              transaction.risk_level === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
            )} />
            
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                <div>
                  <p className="text-sm text-slate-500 uppercase tracking-wider font-medium mb-1">Amount</p>
                  <h2 className="text-4xl font-bold text-slate-800">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </h2>
                  <div className="flex items-center gap-3 mt-4">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                      <Fingerprint className="w-4 h-4 text-slate-400" />
                      {transaction.payment_method.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {new Date(transaction.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3 min-w-[140px]">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Decision</p>
                    <DecisionBadge decision={transaction.decision} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Risk Level</p>
                    <RiskBadge level={transaction.risk_level} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Investigation Panel */}
          <div className="bg-raksha-dark rounded-xl shadow-lg border border-slate-800 overflow-hidden relative group">
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-raksha-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            
            <div className="p-6 border-b border-slate-800 flex justify-between items-center relative z-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-raksha-gold" />
                RAKSHA AI Investigation
              </h3>
              {!aiResult && !aiLoading && (
                <button 
                  onClick={handleInvestigate}
                  className="px-4 py-2 bg-raksha-gold hover:bg-raksha-goldlight text-raksha-dark font-semibold rounded-lg text-sm transition-colors shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                >
                  Investigate with AI
                </button>
              )}
            </div>
            
            <div className="p-6 relative z-10 text-slate-300 text-sm leading-relaxed min-h-[120px] flex flex-col justify-center">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <RefreshCw className="w-8 h-8 text-raksha-gold animate-spin mb-4" />
                  <p className="text-raksha-gold font-mono animate-pulse">Synthesizing evidence & investigating...</p>
                </div>
              ) : aiError ? (
                <div className="text-red-400 flex items-start gap-3 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Investigation Failed</p>
                    <p className="opacity-80">{aiError}</p>
                    <button onClick={handleInvestigate} className="mt-3 text-red-300 hover:text-white underline text-xs">Try again</button>
                  </div>
                </div>
              ) : aiResult ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-raksha-gold shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-medium mb-1">Analysis Complete</h4>
                      <div className="whitespace-pre-wrap text-slate-400">
                        {typeof aiResult === 'object' ? JSON.stringify(aiResult, null, 2) : aiResult}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 py-4">
                  <p>Trigger an AI investigation to generate an intelligent summary of risk factors and evidence.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Risk Factors & Score */}
        <div className="space-y-6">
          
          {/* Risk Score Widget */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-6">Predicted Risk Score</h3>
            
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke={transaction.risk_score > 0.7 ? '#ef4444' : transaction.risk_score > 0.3 ? '#f59e0b' : '#10b981'} 
                  strokeWidth="8"
                  strokeDasharray={`${transaction.risk_score * 283} 283`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-800">
                  {transaction.risk_score?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileWarning className="w-4 h-4" />
              Identified Risk Factors
            </h3>
            
            <div className="space-y-3">
              {transaction.risk_factors && transaction.risk_factors.length > 0 ? (
                transaction.risk_factors.map((factor, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-2">
                     <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                     <p className="text-sm font-medium text-slate-700">{factor}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">No specific risk factors flagged.</p>
              )}
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Transaction Audit Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-raksha-gold" />
          Audit Trail
        </h3>
        
        <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
          <AuditTimeline transactionId={id} />
        </div>
      </div>
    </div>
  );
}

function AuditTimeline({ transactionId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTransactionAudit(transactionId)
      .then(data => {
        if (!data.error) setLogs(data.audit_logs || []);
      })
      .finally(() => setLoading(false));
  }, [transactionId]);

  if (loading) return <p className="ml-6 text-sm text-slate-400">Loading audit logs...</p>;
  if (logs.length === 0) return <p className="ml-6 text-sm text-slate-400">No audit logs available.</p>;

  return logs.map((log, idx) => (
    <div key={idx} className="relative pl-6">
      <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-raksha-gold"></span>
      <div className="mb-1 text-xs text-slate-500 font-mono">
        {new Date(log.timestamp).toLocaleString()}
      </div>
      <h4 className="text-sm font-bold text-slate-800">{log.event_type}</h4>
      <p className="text-sm text-slate-600 mt-1">{log.details}</p>
    </div>
  ));
}

export default TransactionDetail;
