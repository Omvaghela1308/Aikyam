'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ShieldCheck, HardHat, HeartPulse, Lock, User, LogIn, KeyRound } from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { UserRole } from '@/types';

export default function LoginModal() {
  const router = useRouter();
  const { isLoginModalOpen, closeLoginModal, login, role } = useRole();
  const [selectedRole, setSelectedRole] = useState<UserRole>(role);
  const [username, setUsername] = useState(role === 'Worker' ? 'W1026' : 'SUP-01');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState('');

  if (!isLoginModalOpen) return null;

  const handleRoleSelect = (r: UserRole) => {
    setSelectedRole(r);
    setUsername(r === 'Worker' ? 'W1026' : 'RSC-01');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your ID or username.');
      return;
    }
    login(selectedRole, username);
    if (selectedRole === 'Worker') {
      router.push('/dashboard');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#BAE6FD] overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] p-6 text-white text-center relative">
          <button
            onClick={closeLoginModal}
            className="absolute right-4 top-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>

          <h2 className="text-2xl font-black tracking-tight">MineGuard Sign In</h2>
          <p className="text-xs text-sky-100 mt-1 font-medium">
            Enter your credentials to access safety telemetry
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Select Account Role
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F0F7FF] rounded-2xl border border-[#BAE6FD]">
              <button
                type="button"
                onClick={() => handleRoleSelect('Supervisor')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'Supervisor'
                    ? 'bg-white text-[#0284C7] shadow-sm border border-[#BAE6FD]'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <HardHat className="w-4 h-4 text-[#0284C7]" />
                <span>Rescuer</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('Worker')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'Worker'
                    ? 'bg-white text-[#16A34A] shadow-sm border border-[#BBF7D0]'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <HeartPulse className="w-4 h-4 text-[#16A34A]" />
                <span>Worker</span>
              </button>
            </div>
          </div>

          {/* User ID Input */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              {selectedRole === 'Worker' ? 'Worker ID / Jacket Code' : 'Rescuer ID'}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={selectedRole === 'Worker' ? 'e.g. W1026 or SJ-003' : 'e.g. RSC-01'}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] rounded-2xl text-xs font-medium text-[#0F172A] border border-[#E3EAF5] focus:outline-none focus:border-[#0284C7] focus:bg-white shadow-2xs transition-colors"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Passcode / PIN
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter passcode"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] rounded-2xl text-xs font-medium text-[#0F172A] border border-[#E3EAF5] focus:outline-none focus:border-[#0284C7] focus:bg-white shadow-2xs transition-colors"
              />
            </div>
          </div>

          {/* Demo Credentials Info Box */}
          <div className="bg-[#F0F7FF] border border-[#BAE6FD] rounded-2xl p-3 text-xs space-y-1">
            <div className="font-bold text-[#0284C7] flex items-center justify-between">
              <span>🔑 Demo Credentials</span>
              <span className="text-[10px] bg-white border border-[#BAE6FD] px-2 py-0.5 rounded-full font-mono text-[#0284C7]">
                Quick Login
              </span>
            </div>
            <div className="text-[#475569] text-[11px] grid grid-cols-2 gap-2 pt-1">
              <div className="bg-white p-2 rounded-xl border border-[#BAE6FD]/60">
                <div className="font-bold text-[#0F172A]">Rescuer</div>
                <div className="font-mono text-[#0284C7]">RSC-01</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#BAE6FD]/60">
                <div className="font-bold text-[#0F172A]">Worker</div>
                <div className="font-mono text-[#16A34A]">W1026</div>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-2xl shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In as {selectedRole === 'Supervisor' ? 'Rescuer' : selectedRole}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
