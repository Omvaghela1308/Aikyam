'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  Menu,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Radio,
  LogIn,
  LogOut,
  Cpu,
  MapPin,
  Wind,
  HeartPulse,
} from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { useRole } from '@/context/RoleContext';
import { useTelemetry } from '@/context/TelemetryContext';
import JacketConnectModal from '@/components/jacket/JacketConnectModal';
import { soundManager } from '@/lib/sound-effects';

interface TopBarProps {
  onOpenMobile: () => void;
}

export function TopBar({ onOpenMobile }: TopBarProps) {
  const pathname = usePathname();
  const { role, openLoginModal, logout, isLoggedIn } = useRole();
  const { alerts, stats, physicalJacket, simulateJacketPacket } = useTelemetry();
  const [searchValue, setSearchValue] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [jacketModalOpen, setJacketModalOpen] = useState(false);
  const [sosPopupOpen, setSosPopupOpen] = useState(false);

  // Generate breadcrumb trail
  const getBreadcrumbs = () => {
    // Dashboard home lives at /dashboard, so it is the "Home" crumb rather than its own segment
    const parts = pathname.split('/').filter((part) => part && part !== 'dashboard');
    const crumbs = [{ label: 'Home', href: '/dashboard' }];

    let accumulated = '';
    for (const part of parts) {
      accumulated += `/${part}`;
      let label = part.charAt(0).toUpperCase() + part.slice(1);
      if (part === 'map') label = 'Worker Map';
      if (part === 'alerts') label = 'Alerts';
      if (part === 'analysis') label = 'Daily Analysis';
      if (part === 'workers') label = role === 'Worker' ? 'Sensor Data' : 'Workers';

      crumbs.push({ label, href: accumulated });
    }
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Role-specific current user
  const currentUser = {
    Supervisor: { name: 'Rescuer Command', title: 'Chief Rescue Safety Controller', status: 'safe' as const },
    Worker: { name: 'Underground Worker', title: 'Smart Jacket Telemetry Active', status: 'safe' as const },
  }[role];

  return (
    <>
      <header className="h-20 flex items-center justify-between gap-2 px-3 sm:px-6 lg:px-8 bg-transparent">
        {/* Left: Mobile Toggle + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0 sm:flex-shrink">
          <button
            onClick={onOpenMobile}
            className="lg:hidden flex-shrink-0 p-2 rounded-xl bg-white text-[#475569] hover:text-[#D97706] hover:bg-white border border-[#EDE4D6] shadow-2xs"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb Path */}
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.href}>
                  {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />}
                  {isLast ? (
                    <span className="text-[#0F172A] font-semibold truncate max-w-[200px]">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="hover:text-[#D97706] transition-colors truncate"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Middle: Search Bar (HIDDEN FOR WORKER ROLE) */}
        {/* On phones the search moves to its own row below the header, see mobileSearchOpen */}
        {role !== 'Worker' ? (
          <div className="hidden sm:block flex-1 max-w-md mx-3 sm:mx-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#94A3B8]" />
              </div>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search workers, jacket IDs, gas sensors..."
                className="w-full pl-9 pr-14 py-2 bg-white rounded-full text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] border border-[#EDE4D6] focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/15 transition-all shadow-2xs"
              />
              <span className="hidden md:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                Ctrl K
              </span>
            </div>
          </div>
        ) : (
          <div className="hidden sm:block flex-1" />
        )}

        {/* Right: Connect Jacket Button, Quick SOS Status, Notification Bell, Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Mobile search toggle */}
          {role !== 'Worker' && (
            <button
              type="button"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="sm:hidden p-2.5 rounded-full bg-white border border-[#EDE4D6] text-[#475569] hover:text-[#D97706] transition-all cursor-pointer shadow-2xs"
              aria-label="Search"
              aria-expanded={mobileSearchOpen}
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Connect with Smart Jacket Button (Only for Worker role) */}
          {role === 'Worker' && (
            <button
              onClick={() => setJacketModalOpen(true)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md hover:scale-[1.03] active:scale-[0.97] ${
                physicalJacket?.isConnected
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border border-emerald-400/50 shadow-emerald-500/25 animate-pulse'
                  : 'bg-gradient-to-r from-amber-600 via-orange-600 to-orange-600 text-white border border-orange-400/40 shadow-orange-500/25 hover:shadow-orange-500/40 hover:from-amber-700 hover:to-orange-700'
              }`}
              title="Connect your physical smart jacket board via Web Serial or Wi-Fi"
            >
              <Cpu className="w-4 h-4 text-amber-200 animate-pulse" />
              <span className="hidden sm:inline">
                {physicalJacket?.isConnected ? 'Jacket Connected' : 'Connect with Jacket'}
              </span>
              <span className="sm:hidden">Jacket</span>
            </button>
          )}

          {/* Emergency SOS Button (Hidden for Worker role) */}
          {role !== 'Worker' && (
            <button
              onClick={() => {
                soundManager.playEmergencyAlarm(1.5);
                setSosPopupOpen(true);
              }}
              className="px-3 sm:px-4 py-2 rounded-full text-xs font-black bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-md shadow-rose-600/30 border border-rose-400/40 transition-all cursor-pointer flex items-center gap-1.5 animate-pulse transform hover:scale-[1.03] active:scale-[0.97]"
              title="Trigger Instant Emergency SOS Panic Alert across website"
            >
              <ShieldAlert className="w-4 h-4 text-white animate-bounce" />
              <span className="hidden sm:inline">Emergency SOS</span>
              <span className="sm:hidden">SOS</span>
            </button>
          )}

          {/* Notification Bell with Badge */}
          <div className="relative">
            <button
              onClick={() => setAlertModalOpen(!alertModalOpen)}
              className="relative p-2.5 rounded-full bg-white border border-[#EDE4D6] text-[#475569] hover:text-[#D97706] hover:border-[#FDE68A] hover:bg-[#FFFBEB] transition-all cursor-pointer shadow-2xs"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[9px] font-bold text-white shadow-xs animate-bounce">
                  {alerts.length}
                </span>
              )}
            </button>

            {/* Quick Alert Dropdown */}
            {alertModalOpen && (
              <div className="fixed left-3 right-3 top-20 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 bg-white rounded-2xl border border-[#EDE4D6] shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EDE4D6]">
                  <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
                    Active Safety Alerts ({alerts.length})
                  </span>
                  <Link
                    href="/alerts"
                    onClick={() => setAlertModalOpen(false)}
                    className="text-[11px] font-semibold text-[#D97706] hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="space-y-2 text-xs max-h-72 overflow-y-auto">
                  {alerts.slice(0, 4).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                        alert.severity === 'critical'
                          ? 'bg-rose-50 border-rose-100 text-rose-900'
                          : alert.severity === 'warning'
                          ? 'bg-amber-50 border-amber-100 text-amber-900'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                          alert.severity === 'critical'
                            ? 'bg-rose-500 animate-ping'
                            : alert.severity === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate">{alert.title}</div>
                        <div className="text-[10px] text-[#64748B] mt-0.5">
                          {alert.workerName} ({alert.jacketId}) • {alert.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sign In Button (shown only when logged out) */}
          {!isLoggedIn && (
            <button
              onClick={openLoginModal}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-[#D97706] bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#FDE68A] transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
              title="Sign In or Switch Role"
            >
              <LogIn className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Sign In / Login</span>
            </button>
          )}

          {/* User Profile initials Avatar */}
          <div className="flex items-center gap-1 sm:gap-2 pl-1.5 sm:pl-2 border-l border-[#EDE4D6]">
            <Avatar
              name={currentUser.name}
              role={role}
              size="md"
              status={currentUser.status}
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-[#0F172A] leading-tight truncate max-w-[130px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-[#64748B] font-medium truncate max-w-[130px]">
                {currentUser.title}
              </span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-xl text-[#64748B] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer sm:ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile search row, opened from the search icon */}
      {role !== 'Worker' && mobileSearchOpen && (
        <div className="sm:hidden px-3 pb-3 -mt-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#94A3B8]" />
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search workers, jacket IDs..."
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 bg-white rounded-full text-sm text-[#0F172A] placeholder-[#94A3B8] border border-[#EDE4D6] focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/15 transition-all shadow-2xs"
            />
          </div>
        </div>
      )}

      {/* ESP32 Jacket Connection Modal */}
      <JacketConnectModal
        isOpen={jacketModalOpen}
        onClose={() => setJacketModalOpen(false)}
      />

      {/* Big Emergency SOS Alert Modal with Continuous Floating & Hover Animation */}
      {sosPopupOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-emergency-backdrop animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl sm:max-w-3xl bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border-2 sm:border-4 border-red-500 shadow-red-500/40 text-center space-y-6 ring-8 ring-red-500/20 animate-emergency-modal transition-all">
            
            {/* Top Pulsing Alarm Siren with 3D Hover & continuous bounce */}
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-red-500/50 group cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-3 hover:shadow-2xl hover:shadow-red-600/70 animate-bounce">
              <ShieldAlert className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600 border-2 border-white"></span>
              </span>
            </div>

            {/* Alert Header Text */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-300 shadow-sm animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                CRITICAL LIFE-SAFETY EMERGENCY ALERT
              </div>
              <h3 className="text-2xl sm:text-4xl font-black text-red-600 tracking-tight drop-shadow-xs">
                Emergency SOS Signal Triggered
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl mx-auto">
                An urgent emergency panic alert has been triggered from the underground sensor network. Immediate acknowledgment and rescue response required.
              </p>
            </div>

            {/* Continuous Floating & Interactive 3D Hover Detail Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 text-left">
              {/* Worker Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-red-50/90 to-rose-50/50 border-2 border-red-200/80 hover:border-red-500 hover:bg-red-50 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer group animate-emergency-card-float-1">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Assigned Worker</span>
                    <span className="text-sm sm:text-base font-black text-slate-900 block">Manoj Yadav</span>
                    <span className="text-[10px] font-mono font-bold text-red-600">ID: W1028 • Smart Jacket SJ-004</span>
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-red-50/90 to-rose-50/50 border-2 border-red-200/80 hover:border-red-500 hover:bg-red-50 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer group animate-emergency-card-float-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <MapPin className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Underground Sector</span>
                    <span className="text-sm sm:text-base font-black text-slate-900 block">Level 4 - Sump & Drainage</span>
                    <span className="text-[10px] font-semibold text-slate-500">Depth: -320m • Incline Shaft B</span>
                  </div>
                </div>
              </div>

              {/* Gas Hazard Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-red-100/80 to-rose-100/60 border-2 border-red-300 hover:border-red-600 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer group animate-emergency-card-float-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-600 text-white group-hover:scale-110 transition-transform">
                    <Wind className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-800 block">Toxic Gas Hazard</span>
                    <span className="text-base sm:text-lg font-black text-red-700 font-mono block">11.8 ppm H₂S</span>
                    <span className="text-[10px] font-bold text-red-600 uppercase">Immediate Evacuation Alert</span>
                  </div>
                </div>
              </div>

              {/* Vitals Telemetry Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-red-50/90 to-rose-50/50 border-2 border-red-200/80 hover:border-red-500 hover:bg-red-50 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer group animate-emergency-card-float-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <HeartPulse className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Live Vital Telemetry</span>
                    <span className="text-sm sm:text-base font-black text-slate-900 block">Pulse: 104 bpm • 34.8°C</span>
                    <span className="text-[10px] font-semibold text-emerald-600">Battery: 88% • Network Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Large Interactive Action Button with Continuous Glow & Bounce */}
            <button
              onClick={() => {
                soundManager.playAcknowledgeChime();
                setSosPopupOpen(false);
              }}
              className="w-full py-4 sm:py-5 px-6 rounded-2xl sm:rounded-3xl text-base sm:text-lg font-black bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white shadow-xl shadow-red-600/50 hover:shadow-red-600/90 border border-red-400/60 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-3 tracking-wide animate-pulse"
            >
              <ShieldAlert className="w-6 h-6 text-white animate-bounce" />
              <span>Acknowledge Emergency & Close</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default TopBar;
