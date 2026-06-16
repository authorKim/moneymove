import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { useEffect } from 'react'
import { useSupabaseStore } from './store/supabase'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DirectInvestment from './pages/DirectInvestment'
import InvestmentSummary from './pages/InvestmentSummary'
import Assets from './pages/Assets'
import Dividends from './pages/Dividends'
import AssetGrowth from './pages/AssetGrowth'
import DataManagement from './pages/DataManagement'
import Settings from './pages/Settings'

function AppContent() {
  const { user, loading } = useAuth()
  const { loadAll, isLoading } = useSupabaseStore()

  useEffect(() => {
    if (user) {
      loadAll(user.id)
    }
  }, [user?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-sm">로딩 중...</div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-gray-500 text-sm">데이터 불러오는 중...</div>
        </div>
      </div>
    )
  }

  return (
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
  )
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HashRouter>
  )
}
