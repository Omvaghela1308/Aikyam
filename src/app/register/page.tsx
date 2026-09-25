'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  MapPin,
  Cpu,
} from 'lucide-react';
import { UserRole } from '@/types';

export default function RegisterPage() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<UserRole>('Worker');
  const [fullName, setFullName] = useState('');
  const [jacketId, setJacketId] = useState('');
  const [zone, setZone] = useState('Shaft 3 - Level 4 Coal Face');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
    if (role === 'Worker' && !jacketId) {
      setJacketId('W1032');
    } else if (role === 'Supervisor' && !jacketId) {
      setJacketId('RSC-02');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!jacketId.trim()) {
      setError('Please enter a valid Worker ID or Smart Jacket Code.');
      return;
    }
    if (password.length < 4) {
      setError('Passcode must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passcodes do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);

    // Store in localStorage for mock persistence
    try {
      const newUser = {
        name: fullName.trim(),
        jacketId: jacketId.trim().toUpperCase(),
        role: selectedRole,
        zone: zone,
      };
      localStorage.setItem('mineguard_registered_user', JSON.stringify(newUser));
    } catch (err) {
      // Ignore localStorage errors
    }

    setTimeout(() => {
      setIsSubmitting(false);
      // Redirect to login page with registered query param & ID
      const queryId = encodeURIComponent(jacketId.trim());
      router.push(`/login?registered=true&id=${queryId}&role=${selectedRole}`);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* Centered Register Card */}
      <div className="w-full max-w-[500px] bg-white rounded-[28px] shadow-2xl border border-[#EDE4D6] overflow-hidden my-auto transition-all">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 sm:p-7 text-white text-center relative">
          <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 shadow-inner border border-white/25">
            <Cpu className="w-7 h-7 text-white animate-pulse" />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white">
            Smart Jacket Registration
          </h1>
          <p className="text-xs text-amber-100 mt-1 font-medium max-w-sm mx-auto">
            Register your underground worker profile & ESP32 Smart Safety Vest ID
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4 text-left">
          {/* Account Classification Toggle */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Select Role Classification
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
                <span>Underground Worker</span>
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
                <span>Rescuer Command</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] rounded-2xl text-xs font-medium text-[#0F172A] border border-[#EDE4D6] focus:outline-none focus:border-[#D97706] focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Worker ID / Smart Jacket Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                {selectedRole === 'Worker' ? 'Worker ID / Jacket Code' : 'Rescuer Control ID'}
              </label>
              <div className="relative">
                <Cpu className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="text"
                  value={jacketId}
                  onChange={(e) => setJacketId(e.target.value)}
                  placeholder={selectedRole === 'Worker' ? 'e.g. W1032 or SJ-009' : 'e.g. RSC-02'}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-[#F8FAFC] rounded-2xl text-xs font-mono font-bold text-[#0F172A] border border-[#EDE4D6] focus:outline-none focus:border-[#D97706] focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Mining Sector Zone */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Assigned Mine Sector
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#F8FAFC] rounded-2xl text-xs font-medium text-[#0F172A] border border-[#EDE4D6] focus:outline-none focus:border-[#D97706] focus:bg-white transition-colors"
                >
                  <option value="Shaft 3 - Level 4 Coal Face">Shaft 3 - Level 4 Coal Face</option>
                  <option value="Tunnel 2 - Heading East">Tunnel 2 - Heading East</option>
                  <option value="Deep Incline Shaft 4">Deep Incline Shaft 4</option>
                  <option value="Shaft 1 - Main Intake Drift">Shaft 1 - Main Intake Drift</option>
                  <option value="Level 4 - Sump & Drainage">Level 4 - Sump & Drainage</option>
                </select>
              </div>
            </div>
          </div>

          {/* Passcode / PIN & Confirm Passcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Create Passcode / PIN
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 4 digits"
                  required
                  className="w-full pl-10 pr-8 py-2.5 bg-[#F8FAFC] rounded-2xl text-xs font-medium text-[#0F172A] border border-[#EDE4D6] focus:outline-none focus:border-[#D97706] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Confirm Passcode
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat passcode"
                  required
                  className="w-full pl-10 pr-8 py-2.5 bg-[#F8FAFC] rounded-2xl text-xs font-medium text-[#0F172A] border border-[#EDE4D6] focus:outline-none focus:border-[#D97706] focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Register Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-[#D97706] hover:bg-[#B45309] active:scale-[0.99] disabled:opacity-70 text-white text-xs font-bold rounded-2xl shadow-md shadow-amber-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer btn-3d mt-2"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Registering Profile & Smart Jacket...</span>
              </div>
            ) : (
              <>
                <span>Complete Registration & Proceed to Login</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Already registered link */}
          <div className="pt-2 text-center border-t border-[#EDE4D6]">
            <p className="text-xs text-[#64748B]">
              Already registered your Smart Jacket?{' '}
              <Link href="/login" className="font-bold text-[#D97706] hover:underline">
                Sign In Here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
