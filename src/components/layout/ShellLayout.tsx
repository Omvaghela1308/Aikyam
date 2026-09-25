'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import LoginModal from '@/components/auth/LoginModal';
import { RoleProvider, useRole } from '@/context/RoleContext';
import { TelemetryProvider } from '@/context/TelemetryContext';
import { ShieldCheck } from 'lucide-react';

function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, isLoadingAuth } = useRole();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLandingPage = pathname === '/';

  // Authentication routing effect (the 3D landing page at '/' is public)
  useEffect(() => {
    if (!isLoadingAuth && !isLandingPage) {
      if (!isLoggedIn && pathname !== '/login') {
        router.replace('/login');
      } else if (isLoggedIn && pathname === '/login') {
        router.replace('/dashboard');
      }
    }
  }, [isLoggedIn, isLoadingAuth, isLandingPage, pathname, router]);

  // Landing and Login pages: render standalone without dashboard Sidebar/TopBar
  if (isLandingPage || pathname === '/login') {
    return <>{children}</>;
  }

  // Loading auth or redirecting unauthenticated visitor to login
  if (isLoadingAuth || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] flex flex-col items-center justify-center p-6 text-[#0F172A] select-none">
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#D97706] to-[#F59E0B] flex items-center justify-center shadow-lg shadow-amber-500/20 animate-pulse border border-white/40">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-base font-bold text-[#0F172A]">MineGuard Portal</h2>
        <p className="text-xs text-[#64748B] mt-1 font-mono">Loading telemetry session...</p>
      </div>
    );
  }

  // Authenticated Dashboard Layout
  return (
    <div className="min-h-screen bg-[#F7F3EC] flex">
      {/* Quick Role Switch / Login Modal if invoked */}
      <LoginModal />

      {/* Left Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`
          flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
          ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}
        `}
      >
        {/* Top Bar */}
        <TopBar onOpenMobile={() => setMobileOpen(true)} />

        {/* Floating Rounded White Content Panel */}
        <main className="flex-1 px-3 sm:px-6 lg:px-8 pb-6">
          <div className="bg-white border border-[#EDE4D6] rounded-[24px] shadow-[0_4px_24px_rgba(15,23,42,0.04)] min-h-[calc(100vh-6.5rem)] p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <TelemetryProvider>
        <ShellContent>{children}</ShellContent>
      </TelemetryProvider>
    </RoleProvider>
  );
}

export default ShellLayout;
