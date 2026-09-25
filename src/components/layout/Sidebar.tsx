'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Users,
  Bell,
  LifeBuoy,
  ChevronsLeft,
  ChevronsRight,
  MapPin,
  HardHat,
  HeartPulse,
  X,
  LogIn,
  LogOut,
  BarChart2,
} from 'lucide-react';
import { useRole } from '@/context/RoleContext';
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
  const { role, currentUser, roleBadgeColor, openLoginModal, logout } = useRole();

  const mainNavItems = [
    {
      title: 'Home',
      href: '/dashboard',
      icon: <Home className="w-5 h-5" />,
    },
    {
      title: 'Worker Map',
      href: '/map',
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      title: 'Daily Analysis',
      href: '/analysis',
      icon: <BarChart2 className="w-5 h-5" />,
    },
    {
      title: 'Alerts',
      href: '/alerts',
      icon: <Bell className="w-5 h-5" />,
    },
    ...(role !== 'Worker'
      ? [
          {
            title: 'Workers',
            href: '/workers',
            icon: <Users className="w-5 h-5" />,
          },
          {
            title: 'Rescue Team',
            href: '/rescue',
            icon: <LifeBuoy className="w-5 h-5" />,
          },
        ]
      : []),
  ];

  const isLinkActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
            onClick={onCloseMobile}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-[#EDE4D6]
          transition-all duration-300 ease-in-out select-none shadow-sm
          ${collapsed ? 'w-20' : 'w-72'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div
          className={`h-20 flex items-center border-b border-[#EDE4D6]/80 ${
            collapsed ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          {collapsed ? (
            <button
              onClick={onToggleCollapse}
              className="relative group p-1.5 rounded-2xl hover:bg-[#FFFBEB] transition-all cursor-pointer flex items-center justify-center border border-transparent hover:border-[#FDE68A]"
              title="Expand Sidebar"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)] flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-white"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M12 8v5" />
                  <circle cx="12" cy="15.5" r="0.8" fill="currentColor" />
                </svg>
              </div>

              {/* Hover Expand Overlay Badge */}
              <div className="absolute -right-1 -bottom-1 p-0.5 rounded-md bg-white border border-[#EDE4D6] shadow-2xs text-[var(--accent-strong)] group-hover:scale-110 transition-transform">
                <ChevronsRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ) : (
            <>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)] flex items-center justify-center shadow-md shadow-amber-500/20 p-2 flex-shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-full h-full text-white"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M12 8v5" />
                    <circle cx="12" cy="15.5" r="0.8" fill="currentColor" />
                  </svg>
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-xl font-black tracking-tight text-[#0F172A] leading-tight">
                    Mine<span className="text-[var(--accent)]">Guard</span>
                  </span>
                  <span className="text-[10px] font-semibold text-[#64748B] tracking-wider uppercase truncate">
                    Sense. Connect. Protect.
                  </span>
                </div>
              </div>

              {/* Collapse Toggle Button */}
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex flex-shrink-0 p-1.5 rounded-xl text-[#64748B] hover:text-[var(--accent)] hover:bg-[#FAF6EF] transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]"
                title="Collapse Sidebar"
              >
                <ChevronsLeft className="w-5 h-5" />
              </button>
            </>
          )}

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
            <motion.div
              initial={{ rotateX: 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-3 shadow-2xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  Signed In Account
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadgeColor}`}>
                  {role === 'Supervisor' ? 'Rescuer' : role}
                </span>
              </div>

              <div className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-[#FDE68A]/80 shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] flex items-center justify-center font-bold text-[var(--accent-strong)] text-xs flex-shrink-0">
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
            </motion.div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={openLoginModal}
                className="w-10 h-10 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)] flex items-center justify-center border border-[#FDE68A] hover:scale-105 transition-transform cursor-pointer"
                title={`Logged in: ${currentUser.name} (${role})`}
              >
                <LogIn className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {mainNavItems.map((item, idx) => {
            const active = isLinkActive(item.href);
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 + 0.1 }}
              >
                <Link
                  href={item.href}
                  onClick={onCloseMobile}
                  title={collapsed ? item.title : undefined}
                  className={`
                    relative flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 group
                    ${
                      active
                        ? 'text-[var(--accent-strong)]'
                        : 'text-[#475569] hover:text-[var(--accent-strong)] hover:bg-[#FAF6EF]'
                    }
                    ${collapsed ? 'justify-center px-0' : ''}
                  `}
                >
                  {/* Sliding 3D Pill Indicator */}
                  {active && (
                    <motion.div
                      layoutId="activeSidebarPill"
                      className="absolute inset-0 bg-[var(--accent-soft)] border border-[var(--border)] rounded-2xl shadow-2xs z-0"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}

                  <span className={`relative z-10 transition-transform group-hover:scale-110 ${active ? 'text-[var(--accent-strong)]' : ''}`}>
                    {item.icon}
                  </span>

                  {!collapsed && (
                    <span className="relative z-10 flex-1 truncate">{item.title}</span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Sidebar Footer / Sign Out Button */}
        <div className="p-3 border-t border-[#EDE4D6]/80">
          <button
            type="button"
            onClick={logout}
            className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs active:translate-y-0.5"
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
