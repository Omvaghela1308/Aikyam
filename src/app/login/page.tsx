'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  HardHat,
  HeartPulse,
  User,
  ArrowRight,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { UserRole } from '@/types';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, isLoadingAuth, login } = useRole();

  const isRegistered = searchParams.get('registered') === 'true';
  const registeredId = searchParams.get('id') || '';
  const registeredRole = (searchParams.get('role') as UserRole) || 'Worker';

  const [selectedRole, setSelectedRole] = useState<UserRole>(registeredRole);
  const [username, setUsername] = useState(registeredId || 'W1026');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (registeredId) {
      setUsername(registeredId);
      setSelectedRole(registeredRole);
    }
  }, [registeredId, registeredRole]);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!isLoadingAuth && isLoggedIn) {
      router.replace('/dashboard');
    }
  }, [isLoggedIn, isLoadingAuth, router]);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
    if (role === 'Worker') {
      setUsername(registeredId || 'W1026');
      setPassword('123456');
    } else {
      setUsername('RSC-01');
      setPassword('123456');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a valid ID or Jacket Code.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      login(selectedRole, username.trim());
      setIsSubmitting(false);
      router.push('/dashboard');
    }, 250);
  };

  return (
    <div className="w-full max-w-[460px] max-h-[92vh] overflow-y-auto bg-white rounded-[28px] shadow-2xl border border-[var(--border)] transition-all my-auto">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#D97706] to-[#B45309] p-7 text-white text-center relative">
        <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 shadow-inner border border-white/25">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white">
          MineGuard Portal
        </h1>
        <p className="text-xs text-amber-100 mt-1 font-medium">
          Sign in to access real-time underground telemetry
        </p>
      </div>

      {/* Registration Success Banner */}
      {isRegistered && (
        <div className="mx-6 mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5 animate-in zoom-in-95 duration-200">
          <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Registration Successful! 🎉</p>
            <p className="text-emerald-700">
              Smart Jacket profile <strong>{registeredId}</strong> has been created. Please sign in below to access your dashboard.
            </p>
          </div>
        </div>
      )}

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
        {/* Account Classification */}
        <div>
          <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
            Account Classification
          </label>
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#FFFBEB] rounded-2xl border border-[#FDE68A]">
            <button
              type="button"
              onClick={() => handleRoleChange('Worker')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'Worker'
                  ? 'bg-white text-[#16A34A] shadow-sm border border-[#BBF7D0]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <HeartPulse className="w-4 h-4 text-[#16A34A]" />
              <span>Worker</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('Supervisor')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'Supervisor'
                  ? 'bg-white text-[#D97706] shadow-sm border border-[#FDE68A]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <HardHat className="w-4 h-4 text-[#D97706]" />
              <span>Rescuer</span>
            </button>
          </div>
        </div>

        {/* User ID / Jacket Code Input */}
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
            {selectedRole === 'Worker' ? 'Worker ID / Jacket Code' : 'Rescuer Control ID'}
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={selectedRole === 'Worker' ? 'e.g. W1026 or SJ-003' : 'e.g. RSC-01'}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] rounded-2xl text-xs font-medium text-[#0F172A] border border-[#EDE4D6] focus:outline-none focus:border-[#D97706] focus:bg-white shadow-2xs transition-colors"
            />
          </div>
        </div>

        {/* Passcode / PIN Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">
              Passcode / PIN
            </label>
            <span className="text-[11px] text-[#64748B]">Default: 123456</span>
          </div>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter passcode"
              required
              className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] rounded-2xl text-xs font-medium text-[#0F172A] border border-[#EDE4D6] focus:outline-none focus:border-[#D97706] focus:bg-white shadow-2xs transition-colors tracking-widest"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Role Description Note */}
        <div className="bg-[#F8FAFC] border border-[#EDE4D6] rounded-2xl p-3.5 text-xs text-[#475569] flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            {selectedRole === 'Worker' ? (
              <>
                Logging in as <strong>Underground Worker</strong> unlocks personal wearable telemetry, shift vitals, hazard alerts & instant SOS.
              </>
            ) : (
              <>
                Logging in as <strong>Rescuer Command</strong> opens the full mine 3D map, all worker jackets, toxic gas sensors & emergency control.
              </>
            )}
          </p>
        </div>

        {error && (
          <div className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-[#D97706] hover:bg-[#B45309] active:scale-[0.99] disabled:opacity-70 text-white text-xs font-bold rounded-2xl shadow-md shadow-amber-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer btn-3d"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Authenticating Session...</span>
            </div>
          ) : (
            <>
              <span>Sign In as {selectedRole === 'Supervisor' ? 'Rescuer Command' : 'Underground Worker'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Link to Register */}
        <div className="pt-2 text-center border-t border-[#EDE4D6]">
          <p className="text-xs text-[#64748B]">
            Don&apos;t have a Smart Jacket profile yet?{' '}
            <Link href="/register" className="font-bold text-[#D97706] hover:underline">
              Register New Jacket
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
      <Suspense fallback={<div className="text-xs text-amber-600 font-bold p-4">Loading Portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

