import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/40 to-slate-100">
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                </div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">DeFlow</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <div className="text-gray-500">Connected</div>
                  <div className="font-mono text-xs text-gray-900">
                    {user?.ethAddress.slice(0, 6)}...{user?.ethAddress.slice(-4)}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-orange-600 transition"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-20">
            <h1 className="text-4xl font-black text-gray-900 mb-4">
              Welcome to DeFlow
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your workflow builder will appear here soon.
            </p>
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
              <h2 className="text-lg font-bold text-gray-900 mb-4">User Info</h2>
              <div className="text-left space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Address:</span>{' '}
                  <span className="font-mono">{user?.ethAddress}</span>
                </div>
                <div>
                  <span className="text-gray-500">Auth Method:</span>{' '}
                  <span className="capitalize">{user?.authMethod || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Last Login:</span>{' '}
                  <span>{user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
