import { NavLink } from 'react-router-dom';
import { useStore } from '../store';
import { useExchangeRate } from '../hooks/useExchangeRate';

const navItems = [
  { to: '/', label: '대시보드', icon: '📊' },
  { to: '/direct-investment', label: '직접투자', icon: '📈' },
  { to: '/investment-summary', label: '투자 종합', icon: '📋' },
  { to: '/assets', label: '비투자 자산', icon: '🏦' },
  { to: '/dividends', label: '배당 내역', icon: '💰' },
  { to: '/asset-growth', label: '자산증식', icon: '📉' },
  { to: '/data-management', label: '데이터 관리', icon: '💾' },
  { to: '/settings', label: '설정', icon: '⚙️' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { settings } = useStore();
  useExchangeRate();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-lg font-bold text-white">MoneyMove</h1>
          <p className="text-xs text-gray-400 mt-1">개인 자산관리</p>
        </div>
        <nav className="flex-1 py-4">
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
        <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
          <div>환율: <span className="text-green-400 font-mono">₩{settings.exchangeRate.toLocaleString()}</span></div>
          {settings.rateUpdatedAt && (
            <div className="mt-1 text-gray-500">
              {new Date(settings.rateUpdatedAt).toLocaleDateString('ko-KR')}
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
