import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DirectInvestment from './pages/DirectInvestment';
import InvestmentSummary from './pages/InvestmentSummary';
import Assets from './pages/Assets';
import Dividends from './pages/Dividends';
import AssetGrowth from './pages/AssetGrowth';
import DataManagement from './pages/DataManagement';
import Settings from './pages/Settings';

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/direct-investment" element={<DirectInvestment />} />
          <Route path="/investment-summary" element={<InvestmentSummary />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/dividends" element={<Dividends />} />
          <Route path="/asset-growth" element={<AssetGrowth />} />
          <Route path="/data-management" element={<DataManagement />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
