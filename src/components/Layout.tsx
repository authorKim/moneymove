import { NavLink } from 'react-router-dom'
import { useSupabaseStore } from '../store/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useExchangeRate } from '../hooks/useExchangeRate'

const navItems = [
  { to: '/', label: '대시보드', icon: '📊' },
  { to: '/direct-investment', label: '직접투자', icon: '📈' },
  { to: '/investment-summary', label: '투자종합', icon: '📋' },
  { to: '/assets', label: '비투자자산', icon: '🏦' },
  { to: '/dividends', label: '배당', icon: '💰' },
  { to: '/asset-growth', label: '자산증식', icon: '📉' },
  { to: '/data-management', label: '데이터', icon: '💾' },
  { to: '/settings', label: '설정', icon: '⚙️' },
]

// Bottom tab items (5 main tabs for mobile)
const tabItems = [
  { to: '/', label: '대시보드', icon: '📊' },
  { to: '/direct-investment', label: '투자', icon: '📈' },
  { to: '/assets', label: '자산', icon: '🏦' },
  { to: '/dividends', label: '배당', icon: '💰' },
  { to: '/settings', label: '설정', icon: '⚙️' },
]

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { settings } = useSupabaseStore()
  const { user, signOut } = useAuth()
  useExchangeRate()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* PC Sidebar */}
      <aside className="hidden md:flex w-56 bg-gray-900 text-white flex-col shrink-0">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-lg font-bold text-white">MoneyMove</h1>
          <p className="text-xs text-gray-400 mt-1">개인 자산관리 v1.1</p>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700 text-xs text-gray-400 space-y-2">
          <div>환율: <span className="text-green-400 font-mono">₩{settings.exchangeRate.toLocaleString()}</span></div>
          {settings.rateUpdatedAt && (
            <div className="text-gray-500">
              {new Date(settings.rateUpdatedAt).toLocaleDateString('ko-KR')} 기준
            </div>
          )}
          {user && (
            <div className="pt-1">
              <div className="text-gray-400 truncate text-xs mb-1">{user.email}</div>
              <button
                onClick={signOut}
                className="w-full text-left text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div>
            <span className="font-bold text-gray-900">MoneyMove</span>
            <span className="text-xs text-gray-400 ml-2">v1.1</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono">₩{settings.exchangeRate.toLocaleString()}</span>
            <button
              onClick={signOut}
              className="text-xs text-red-500 border border-red-200 px-2 py-1 rounded-lg"
            >
              로그아웃
            </button>
          </div>
        </div>

        <div className="p-3 md:p-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
        {tabItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`
            }
          >
            <span className="text-lg mb-0.5">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
