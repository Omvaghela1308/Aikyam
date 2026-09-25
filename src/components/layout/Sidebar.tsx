'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Activity,
  Map,
  Bell,
  LifeBuoy,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldAlert,
  Wind,
  HeartPulse,
  Thermometer,
  Radio,
  MapPin,
  Check,
  HardHat,
  X,
  LogIn,
  LogOut,
  BarChart2,
} from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { useTelemetry } from '@/context/TelemetryContext';
import { UserRole } from '@/types';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { role, setRole, currentUser, roleBadgeColor, openLoginModal, logout } = useRole();
  const { stats, alerts } = useTelemetry();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const rolesList: { role: UserRole; title: string; subtitle: string; icon: React.ReactNode }[] = [
    {
      role: 'Supervisor',
      title: 'Rescuer',
      subtitle: 'Rescue Command Center',
      icon: <HardHat className="w-4 h-4 text-[#D97706]" />,
    },
    {
      role: 'Worker',
      title: 'Worker',
      subtitle: 'My Safety Info',
      icon: <HeartPulse className="w-4 h-4 text-[#16A34A]" />,
    },
  ];

  const mainNavItems: { title: string; href: string; icon: React.ReactNode }[] = [
    {
      title: 'Home',
      href: '/dashboard',
      icon: <Home className="w-5 h-5 text-[#D97706]" />,
    },
    {
      title: 'Worker Map',
      href: '/map',
      icon: <MapPin className="w-5 h-5 text-orange-600" />,
    },
    {
      title: 'Daily Analysis',
      href: '/analysis',
      icon: <BarChart2 className="w-5 h-5 text-[#D97706]" />,
    },
  ];

  const bottomNavItems = [
    {
      title: 'Alerts',
      href: '/alerts',
      icon: <Bell className="w-5 h-5 text-amber-500" />,
    },
    ...(role !== 'Worker' ? [
      {
        title: 'Workers',
        href: '/workers',
        icon: <Users className="w-5 h-5 text-emerald-600" />,
      }
    ] : []),
  ];

  const isLinkActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/workers') return pathname === '/workers';
    if (href.includes('#')) {
      return pathname === '/dashboard' && typeof window !== 'undefined' && window.location.hash === '#analysis';
    }
    return pathname.startsWith(href.split('?')[0]);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-[#EDE4D6]
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-20' : 'w-72'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        {/* Collapsed rail is too narrow for logo + toggle side by side, so they stack */}
        <div
          className={`h-20 flex border-b border-[#EDE4D6]/80 ${
            collapsed
              ? 'flex-col items-center justify-center gap-1 px-2'
              : 'items-center justify-between px-4'
          }`}
        >
          {/* Brand only; not a link */}
          <div className="flex items-center gap-3 overflow-hidden select-none">
            {/* MineGuard SVG Logo */}
            <div
              className={`rounded-2xl bg-gradient-to-br from-[#D97706] to-[#F59E0B] flex items-center justify-center shadow-md shadow-amber-500/20 flex-shrink-0 ${
                collapsed ? 'w-9 h-9 p-1.5' : 'w-10 h-10 p-2'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-full h-full text-white"
              >
                {/* Shield + Mine Beacon */}
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v5" />
                <circle cx="12" cy="15.5" r="0.8" fill="currentColor" />
              </svg>
            </div>

            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xl font-black tracking-tight text-[#0F172A] leading-tight">
                  Mine<span className="text-[#D97706]">Guard</span>
                </span>
                <span className="text-[10px] font-semibold text-[#64748B] tracking-wider uppercase truncate">
                  Sense. Connect. Protect.
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex flex-shrink-0 p-1 rounded-lg text-[#64748B] hover:text-[#D97706] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:text-[#D97706] hover:bg-[#F1F5F9]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Profile Card */}
        <div className="px-3 pt-3 pb-2">
          {!collapsed ? (
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  Signed In Account
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadgeColor}`}>
                  {role === 'Supervisor' ? 'Rescuer' : role}
                </span>
              </div>

              <div className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-[#FDE68A]/80 shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-[#FEF3C7] flex items-center justify-center font-bold text-[#D97706] text-xs flex-shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#0F172A] truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] font-medium text-[#64748B] truncate">
                    ID: {currentUser.id}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Collapsed Role Indicator */
            <div className="flex justify-center">
              <button
                onClick={openLoginModal}
                className="w-10 h-10 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center border border-[#FDE68A] hover:scale-105 transition-transform cursor-pointer"
                title={`Logged in: ${currentUser.name} (${role})`}
              >
                <LogIn className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
          {/* Main Top Nav */}
          {mainNavItems.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={collapsed ? item.title : undefined}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all duration-150 group
                  ${
                    active
                      ? 'bg-[#FEF3C7] text-[#D97706] font-semibold shadow-2xs'
                      : 'text-[#475569] hover:text-[#D97706] hover:bg-[#F8FAFC]'
                  }
                  ${collapsed ? 'justify-center px-0' : ''}
                `}
              >
                <span className={`transition-colors ${active ? 'text-[#D97706]' : 'group-hover:text-[#D97706]'}`}>
                  {item.icon}
                </span>

                {!collapsed && (
                  <span className="flex-1 truncate">{item.title}</span>
                )}
              </Link>
            );
          })}

          {/* Rescue Team Navigation Item (Shown for Rescuer/Supervisor role) */}
          {role !== 'Worker' && (
            <Link
              href="/rescue"
              onClick={onCloseMobile}
              title={collapsed ? 'Rescue Team' : undefined}
              className={`
                flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all duration-150 group
                ${
                  pathname.startsWith('/rescue')
                    ? 'bg-rose-50 text-rose-700 font-semibold shadow-2xs'
                    : 'text-[#475569] hover:text-rose-600 hover:bg-[#F8FAFC]'
                }
                ${collapsed ? 'justify-center px-0' : ''}
              `}
            >
              <LifeBuoy className="w-5 h-5 text-rose-600 flex-shrink-0" />
              {!collapsed && (
                <span className="flex-1 truncate">Rescue Team</span>
              )}
            </Link>
          )}
          {bottomNavItems.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={collapsed ? item.title : undefined}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all duration-150 group
                  ${
                    active
                      ? 'bg-[#FEF3C7] text-[#D97706] font-semibold shadow-2xs'
                      : 'text-[#475569] hover:text-[#D97706] hover:bg-[#F8FAFC]'
                  }
                  ${collapsed ? 'justify-center px-0' : ''}
                `}
              >
                <span className={`transition-colors ${active ? 'text-[#D97706]' : 'group-hover:text-[#D97706]'}`}>
                  {item.icon}
                </span>

                {!collapsed && (
                  <span className="flex-1 truncate">{item.title}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#EDE4D6]/80">
          <button
            type="button"
            onClick={logout}
            className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
            title="Sign Out of Account"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
