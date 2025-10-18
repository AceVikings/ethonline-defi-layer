import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  Network, 
  TrendingUp, 
  Wallet2, 
  LayoutDashboard,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const navigationItems = [
  {
    name: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    description: 'Overview & Analytics'
  },
  {
    name: 'Aave Yield',
    path: '/aave',
    icon: TrendingUp,
    description: 'Earn on Sepolia'
  },
  {
    name: 'Profile',
    path: '/profile',
    icon: Wallet2,
    description: 'Balances & Stats'
  },
];

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-navy via-deep-space to-deep-navy">
      {/* Animated background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-violet/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-aqua-blue/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 backdrop-blur-xl bg-deep-navy/50">
        <div className="flex items-center justify-between px-6 h-20">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl glass-card glass-card-hover"
          >
            {sidebarOpen ? (
              <X className="h-6 w-6 text-off-white" />
            ) : (
              <Menu className="h-6 w-6 text-off-white" />
            )}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-violet to-aqua-blue flex items-center justify-center">
              <Network className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 
                className="text-lg font-bold gradient-text" 
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                AlphaFlow
              </h1>
              <p className="text-[10px] text-soft-gray uppercase tracking-wider">
                Autonomous Multi‑Chain DeFi
              </p>
            </div>
          </div>

          {/* Right side - just wallet */}
          <div className="flex items-center gap-4">
            {/* Network Status - Desktop only */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full glass-card">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aqua-blue opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-aqua-blue" />
              </div>
              <span className="text-sm text-off-white font-medium" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
                Network Live
              </span>
            </div>
            
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block fixed left-0 top-20 bottom-0 w-72 border-r border-white/10 backdrop-blur-xl bg-deep-navy/50 z-30">
        <div className="p-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`block p-4 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'glass-card border-2 border-neon-violet bg-neon-violet/10'
                    : 'glass-card border border-soft-gray/10 hover:border-neon-violet/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-neon-violet/30 to-neon-violet/10 border-2 border-neon-violet/30'
                      : 'bg-gradient-to-br from-soft-gray/10 to-transparent border border-soft-gray/20 group-hover:border-neon-violet/30'
                  }`}>
                    <Icon className={`h-6 w-6 ${isActive ? 'text-neon-violet' : 'text-soft-gray group-hover:text-neon-violet'}`} />
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${isActive ? 'text-off-white' : 'text-soft-gray group-hover:text-off-white'}`}>
                      {item.name}
                    </div>
                    <div className="text-xs text-soft-gray">
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <ChevronRight className="h-5 w-5 text-neon-violet" />
                  )}
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
          <div className="p-4 rounded-xl glass-card border border-aqua-blue/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aqua-blue/30 to-aqua-blue/10 flex items-center justify-center">
                <Network className="h-4 w-4 text-aqua-blue" />
              </div>
              <div className="text-sm font-semibold text-off-white">
                6 Testnets
              </div>
            </div>
            <p className="text-xs text-soft-gray">
              Connected via Avail Nexus
            </p>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <aside className="lg:hidden fixed left-0 top-20 bottom-0 w-80 border-r border-white/10 backdrop-blur-xl bg-deep-navy/95 z-50 overflow-y-auto">
            <div className="p-6 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`block p-4 rounded-xl transition-all duration-300 group ${
                      isActive
                        ? 'glass-card border-2 border-neon-violet bg-neon-violet/10'
                        : 'glass-card border border-soft-gray/10 hover:border-neon-violet/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-br from-neon-violet/30 to-neon-violet/10 border-2 border-neon-violet/30'
                          : 'bg-gradient-to-br from-soft-gray/10 to-transparent border border-soft-gray/20 group-hover:border-neon-violet/30'
                      }`}>
                        <Icon className={`h-6 w-6 ${isActive ? 'text-neon-violet' : 'text-soft-gray group-hover:text-neon-violet'}`} />
                      </div>
                      <div className="flex-1">
                        <div className={`font-semibold ${isActive ? 'text-off-white' : 'text-soft-gray group-hover:text-off-white'}`}>
                          {item.name}
                        </div>
                        <div className="text-xs text-soft-gray">
                          {item.description}
                        </div>
                      </div>
                      {isActive && (
                        <ChevronRight className="h-5 w-5 text-neon-violet" />
                      )}
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="lg:ml-72 pt-20 min-h-screen">
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="lg:ml-72 relative z-10 border-t border-white/10 backdrop-blur-xl bg-deep-navy/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-violet to-aqua-blue flex items-center justify-center">
                <Network className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  AlphaFlow
                </h2>
                <p className="text-[10px] text-soft-gray">Autonomous Multi‑Chain DeFi</p>
              </div>
            </div>
            <p className="text-sm text-soft-gray/70">
              © 2025 AlphaFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
