'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import LoginModal from '@/components/auth/LoginModal';
import { RoleProvider, useRole } from '@/context/RoleContext';
import { TelemetryProvider } from '@/context/TelemetryContext';
import { ShieldCheck, Home, MapPin, BarChart2, Bell } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';

function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, isLoadingAuth } = useRole();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [playIntro, setPlayIntro] = useState(false);

  const isLandingPage = pathname === '/';

  useEffect(() => {
    if (!isLoadingAuth && !isLandingPage) {
      if (!isLoggedIn && pathname !== '/login' && pathname !== '/register') {
        router.replace('/login');
      } else if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
        router.replace('/dashboard');
      }
    }
  }, [isLoggedIn, isLoadingAuth, isLandingPage, pathname, router]);

  // Entrance flow flag check
  useEffect(() => {
    if (isLoggedIn && !isLandingPage && pathname !== '/login' && pathname !== '/register') {
      const hasSeenIntro = sessionStorage.getItem('hasSeenLoginIntro');
      if (!hasSeenIntro) {
        setPlayIntro(true);
        sessionStorage.setItem('hasSeenLoginIntro', 'true');
      }
    }
  }, [isLoggedIn, isLandingPage, pathname]);

  if (isLandingPage || pathname === '/login' || pathname === '/register') {
    return <>{children}</>;
  }

  if (isLoadingAuth || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center p-6 text-[var(--text-primary)] select-none">
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-[var(--accent-strong)] flex items-center justify-center shadow-lg shadow-amber-500/20 animate-pulse border border-white/40">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-base font-bold text-[#0F172A]">MineGuard Portal</h2>
        <p className="text-xs text-[#64748B] mt-1 font-mono">Loading telemetry session...</p>
      </div>
    );
  }

  const mobileTabs = [
    { label: 'Home', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
    { label: 'Map', href: '/map', icon: <MapPin className="w-5 h-5" /> },
    { label: 'Analysis', href: '/analysis', icon: <BarChart2 className="w-5 h-5" /> },
    { label: 'Alerts', href: '/alerts', icon: <Bell className="w-5 h-5" /> },
  ];

  return (
    <div
      onClick={() => setPlayIntro(false)}
      className="min-h-screen bg-[var(--bg-app)] flex selection:bg-[var(--accent-soft)] selection:text-[var(--accent-strong)]"
    >
      <LoginModal />

      {/* Left Sidebar */}
      <motion.div
        initial={playIntro ? { x: -300, rotateY: -15, opacity: 0 } : false}
        animate={{ x: 0, rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
      </motion.div>

      {/* Main Content Area */}
      <div
        className={`
          flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out p-4 sm:p-6 pb-20 sm:pb-6
          ${collapsed ? 'lg:pl-[104px]' : 'lg:pl-[312px]'}
        `}
      >
        <main className="flex-1 flex flex-col min-h-0">
          <motion.div
            initial={playIntro ? { opacity: 0, y: 30 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-card)] shadow-[var(--shadow-3d)] flex-1 flex flex-col min-h-[calc(100vh-3rem)] overflow-hidden"
          >
            {/* Embedded Header inside white panel */}
            <TopBar onOpenMobile={() => setMobileOpen(true)} />

            {/* Main Page Content with Page Transition */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
              <AnimatePresence mode="wait">
                <PageTransition key={pathname}>{children}</PageTransition>
              </AnimatePresence>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (< 640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EDE4D6] flex justify-around items-center py-2 px-3 shadow-lg">
        {mobileTabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 text-[11px] font-semibold py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-[var(--accent-strong)] bg-[var(--accent-soft)]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </Link>
          );
        })}
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
