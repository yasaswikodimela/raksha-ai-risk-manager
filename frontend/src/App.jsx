import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import TransactionDetail from './pages/TransactionDetail';
import RiskAnalytics from './pages/RiskAnalytics';
import AuditTrail from './pages/AuditTrail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="transactions/:id" element={<TransactionDetail />} />
        <Route path="analytics" element={<RiskAnalytics />} />
        <Route path="audit" element={<AuditTrail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;