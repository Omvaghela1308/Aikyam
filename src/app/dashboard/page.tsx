'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import {
  Wind,
  HeartPulse,
  Thermometer,
  Radio,
  MapPin,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  Cpu,
  Eye,
  Camera,
  Activity,
  ArrowRight,
  BatteryCharging,
  CloudFog,
  Clock,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  BarChart2,
} from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import PastelTile from '@/components/ui/PastelTile';
import PillButton from '@/components/ui/PillButton';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import HazardAnalytics from '@/components/dashboard/HazardAnalytics';
import { useTelemetry } from '@/context/TelemetryContext';
import { useRole } from '@/context/RoleContext';

export default function HomePage() {
  const { workers, alerts, stats, isLive, toggleLive, acknowledgeAlert } = useTelemetry();
  const { role } = useRole();
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Find max H2S reading currently active
  const maxH2S = Math.max(...workers.map((w) => w.h2s));
  const activeSOSCount = workers.filter((w) => w.sosActive).length;

  const myWorker = workers.find((w) => w.id === 'W1026' || w.jacketId === 'SJ-003') || workers[0];

  return (
    <div className="space-y-8">
      {/* If Worker role, display logged-in worker's personal telemetry & 24h shift analysis */}
      {role === 'Worker' ? (
        <div className="space-y-6">
          {/* Personal Smart Jacket Telemetry Sensors Grid */}
          <div className="bg-white rounded-3xl p-6 border border-[#EDE4D6] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-[#D97706]" />
                  Smart Jacket Telemetry
                </h2>
                <p className="text-xs text-[#64748B]">
                  Sensor telemetry stream for {myWorker.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-b from-teal-50 via-white to-teal-50/50 border border-teal-200/80 shadow-[0_4px_12px_rgba(13,148,136,0.06),_inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(13,148,136,0.15)] hover:border-teal-300 flex flex-col justify-between group">
                <div className="flex items-center justify-between text-teal-700">
                  <span className="text-xs font-semibold">H₂S Gas</span>
                  <Wind className="w-4 h-4 transition-transform group-hover:rotate-12" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-black text-[#0F172A] font-mono">{myWorker.h2s.toFixed(1)}</span>
                  <span className="text-xs text-[#64748B] ml-1 font-medium">ppm</span>
                </div>
                <span className="text-[10px] font-bold text-teal-600 mt-1">
                  {myWorker.colorimetricH2SDetected ? '⚠️ Strip Discolored' : '✓ Normal Range'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-b from-rose-50 via-white to-rose-50/50 border border-rose-200/80 shadow-[0_4px_12px_rgba(244,63,94,0.06),_inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(244,63,94,0.15)] hover:border-rose-300 flex flex-col justify-between group">
                <div className="flex items-center justify-between text-rose-700">
                  <span className="text-xs font-semibold">Heart Rate</span>
                  <HeartPulse className="w-4 h-4 transition-transform group-hover:scale-125 text-rose-500" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-black text-[#0F172A] font-mono">{myWorker.heartRate}</span>
                  <span className="text-xs text-[#64748B] ml-1 font-medium">bpm</span>
                </div>
                <span className="text-[10px] font-bold text-rose-600 mt-1">MAX30102 Pulse</span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-50 via-white to-amber-50/50 border border-amber-200/80 shadow-[0_4px_12px_rgba(245,158,11,0.06),_inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(245,158,11,0.15)] hover:border-amber-300 flex flex-col justify-between group">
                <div className="flex items-center justify-between text-amber-700">
                  <span className="text-xs font-semibold">Temp / Humidity</span>
                  <Thermometer className="w-4 h-4 transition-transform group-hover:scale-110" />
                </div>
                <div className="mt-2">
                  <span className="text-xl font-black text-[#0F172A] font-mono">{myWorker.temperature}°C</span>
                  <span className="text-xs text-[#64748B] block font-medium">{myWorker.humidity}% RH</span>
                </div>
                <span className="text-[10px] font-bold text-amber-600 mt-1">DHT22 Ambient</span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-100 via-white to-slate-100/50 border border-slate-200/80 shadow-[0_4px_12px_rgba(100,116,139,0.06),_inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(100,116,139,0.15)] hover:border-slate-300 flex flex-col justify-between group">
                <div className="flex items-center justify-between text-amber-800">
                  <span className="text-xs font-semibold">Dust PM2.5</span>
                  <CloudFog className="w-4 h-4 transition-transform group-hover:scale-110" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-black text-[#0F172A] font-mono">{myWorker.pm25}</span>
                  <span className="text-xs text-[#64748B] ml-1 font-medium">µg/m³</span>
                </div>
                <span className="text-[10px] font-bold text-amber-800 mt-1">Dust Particle</span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-50 via-white to-emerald-50/50 border border-emerald-200/80 shadow-[0_4px_12px_rgba(16,185,129,0.06),_inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(16,185,129,0.15)] hover:border-emerald-300 flex flex-col justify-between group">
                <div className="flex items-center justify-between text-emerald-700">
                  <span className="text-xs font-semibold">Battery & Cooling</span>
                  <BatteryCharging className="w-4 h-4 transition-transform group-hover:scale-110" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-black text-[#0F172A] font-mono">{myWorker.battery}%</span>
                  <span className="text-xs text-emerald-600 ml-1 font-medium">LiFePO4</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 mt-1">PCM Vest: {myWorker.pcmCoolingStatus}</span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-50 via-white to-purple-50/50 border border-purple-200/80 shadow-[0_4px_12px_rgba(168,85,247,0.06),_inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(168,85,247,0.15)] hover:border-purple-300 flex flex-col justify-between group">
                <div className="flex items-center justify-between text-purple-700">
                  <span className="text-xs font-semibold">LoRa / UWB</span>
                  <Radio className="w-4 h-4 transition-transform group-hover:rotate-45" />
                </div>
                <div className="mt-2">
                  <span className="text-base font-black text-[#0F172A] font-mono">{myWorker.loraRSSI} dBm</span>
                  <span className="text-[11px] text-[#64748B] block font-mono">({myWorker.uwbX}m, {myWorker.uwbY}m)</span>
                </div>
                <span className="text-[10px] font-bold text-purple-600 mt-1">Position Anchored</span>
              </div>
            </div>
          </div>

          {/* 2-Column Section: Pre-Shift Safety Checklist & Refuge Chamber Station (Placed at bottom) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Interactive Pre-Shift PPE & Equipment Readiness Checklist */}
            <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-[0_10px_28px_rgba(15,23,42,0.06),_0_2px_6px_rgba(217,119,6,0.04)] hover:shadow-[0_18px_38px_rgba(217,119,6,0.14)] transition-all duration-300 hover:-translate-y-1 space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Pre-Shift Safety & PPE Readiness Checklist
                </h2>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  4/4 Verified
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-[0_2px_8px_rgba(16,185,129,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_6px_16px_rgba(16,185,129,0.15)] flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[#0F172A]">Smart Jacket Paired</div>
                    <div className="text-[10px] text-emerald-800 font-medium">ESP32 & Sensors Ready</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-[0_2px_8px_rgba(16,185,129,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_6px_16px_rgba(16,185,129,0.15)] flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[#0F172A]">Helmet Cap Lamp</div>
                    <div className="text-[10px] text-emerald-800 font-medium">100% Charged (18h)</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-[0_2px_8px_rgba(16,185,129,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_6px_16px_rgba(16,185,129,0.15)] flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[#0F172A]">Self-Rescuer Oxygen Pack</div>
                    <div className="text-[10px] text-emerald-800 font-medium">Sealed 60-min Oxygen</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-[0_2px_8px_rgba(16,185,129,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_6px_16px_rgba(16,185,129,0.15)] flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[#0F172A]">PCM Cooling Vest Pack</div>
                    <div className="text-[10px] text-emerald-800 font-medium">Latent Cooling Active</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Nearest Underground Refuge Chamber & Emergency Safety Hub */}
            <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-[0_10px_28px_rgba(15,23,42,0.06),_0_2px_6px_rgba(217,119,6,0.04)] hover:shadow-[0_18px_38px_rgba(217,119,6,0.14)] transition-all duration-300 hover:-translate-y-1 space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#D97706]" />
                  Nearest Subterranean Refuge Station
                </h2>
                <span className="text-xs font-mono font-bold text-[#D97706] bg-[#FEF3C7] px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
                  Station #2 (140m)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 shadow-[0_2px_8px_rgba(217,119,6,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_6px_16px_rgba(217,119,6,0.14)] space-y-1">
                  <span className="text-[10px] text-[#64748B] font-semibold block">Air Reserve</span>
                  <span className="text-lg font-black text-[#0F172A] font-mono block">96 Hours</span>
                  <span className="text-[9px] text-emerald-600 font-bold block">✓ Oxygen Banks Full</span>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 shadow-[0_2px_8px_rgba(217,119,6,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_6px_16px_rgba(217,119,6,0.14)] space-y-1">
                  <span className="text-[10px] text-[#64748B] font-semibold block">Water & Rations</span>
                  <span className="text-lg font-black text-[#0F172A] font-mono block">30 Persons</span>
                  <span className="text-[9px] text-amber-600 font-bold block">✓ Fully Supplied</span>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 shadow-[0_2px_8px_rgba(217,119,6,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_6px_16px_rgba(217,119,6,0.14)] space-y-1">
                  <span className="text-[10px] text-[#64748B] font-semibold block">Comm Beacon</span>
                  <span className="text-lg font-black text-[#D97706] font-mono block">Sub-GHz</span>
                  <span className="text-[9px] text-emerald-600 font-bold block">✓ Direct Surface Line</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <HazardAnalytics />
          
          {/* Shift Health & Safety Analysis for Supervisor Overview */}
          <div className="bg-white rounded-3xl p-6 border border-[#EDE4D6] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div>
                <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-[#D97706]" />
                  Mine-Wide All Workers Shift Analysis
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  24-hour shift health telemetry breakdown across all underground rescue miners
                </p>
              </div>

              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#D97706] font-bold border border-[#FDE68A]">
                Active Shift: 08:00 AM - 04:00 PM • {workers.length} Miners Logged
              </span>
            </div>

            {/* All Workers Telemetry & Shift Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workers.map((worker) => (
                <div key={worker.id} className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#EDE4D6] flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={worker.name} role={worker.role} size="sm" status={worker.status === 'online' ? 'safe' : worker.status} />
                      <div>
                        <div className="text-xs font-bold text-[#0F172A]">{worker.name}</div>
                        <div className="text-[10px] text-[#64748B]">{worker.role} • {worker.zone}</div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#FDE68A]">
                      {worker.id}
                    </span>
                  </div>

                  {/* Vitals Summary */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-[#E2E8F0]">
                    <div>
                      <span className="text-[9px] text-[#64748B] block">H₂S Gas</span>
                      <span className="font-mono font-bold text-[#D97706]">{worker.h2s.toFixed(1)} ppm</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#64748B] block">Pulse</span>
                      <span className="font-mono font-bold text-[#0F172A]">{worker.heartRate} bpm</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#64748B] block">Battery</span>
                      <span className="font-mono font-bold text-emerald-600">{worker.battery}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] bg-white p-2 rounded-xl border border-[#E2E8F0]">
                    <span className="text-[#64748B]">Shift Status</span>
                    <span className="font-bold text-emerald-700">● 08:00 AM Normal</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}



      {/* Pastel Category Tiles with Live Hardware Status */}
      {role !== 'Supervisor' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-5 bg-[#D97706] rounded-full" />
              <span className="text-sm font-bold uppercase tracking-wider text-[#64748B]">
                Sensor Status
              </span>
            </div>
            <span className="text-xs text-[#D97706] font-mono bg-[#FEF3C7] px-2.5 py-0.5 rounded-full font-semibold">
              12 Active Sensors
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* 1. Gas H2S */}
            <PastelTile
              title="Harmful Gas"
              subtitle="H2S Sensor"
              metric={maxH2S.toFixed(1)}
              unit="ppm max"
              color="blue"
              href="/sensors?tab=gas"
              badge={maxH2S > 10 ? 'Danger (>10)' : maxH2S >= 5 ? 'Warning' : 'Safe'}
              icon={<Wind className="w-5 h-5" />}
            />

            {/* 2. Vitals */}
            <PastelTile
              title="Heart Rate"
              subtitle="Pulse Sensor"
              metric={`${stats.avgHeartRate}`}
              unit="bpm avg"
              color="peach"
              href="/sensors?tab=vitals"
              badge={stats.vitalsWarningCount > 0 ? `${stats.vitalsWarningCount} Warning` : 'Normal'}
              icon={<HeartPulse className="w-5 h-5" />}
            />

            {/* 3. Radiation */}
            <PastelTile
              title="Radiation"
              subtitle="Radiation Sensor"
              metric="0.22"
              unit="µSv/h"
              color="lavender"
              href="/sensors?tab=radiation"
              badge="< 0.30 Safe"
              icon={<Radio className="w-5 h-5" />}
            />

            {/* 4. Environment */}
            <PastelTile
              title="Air & Temp"
              subtitle="Temp & Humidity"
              metric="28.4"
              unit="°C / 45% RH"
              color="yellow"
              href="/sensors?tab=environment"
              badge="Good Air Quality"
              icon={<Thermometer className="w-5 h-5" />}
            />

            {/* 5. Worker Locations */}
            <PastelTile
              title="Location"
              subtitle="Location Tracking"
              metric="8/8"
              unit="anchors"
              color="green"
              href="/sensors?tab=location"
              badge="Accurate"
              icon={<MapPin className="w-5 h-5" />}
            />

            {/* 6. SOS Button (Only for non-worker dashboard) */}
            {role !== 'Worker' && (
              <PastelTile
                title="Emergency SOS"
                subtitle="Jacket SOS Switch"
                metric={`${activeSOSCount}`}
                unit="active"
                color="rose"
                href="/alerts"
                badge={activeSOSCount > 0 ? 'HELP NEEDED' : 'All Clear'}
                icon={<Zap className="w-5 h-5" />}
              />
            )}
          </div>
        </div>
      )}

      {/* Live Alerts Horizontal Scroll Carousel */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#D97706] rounded-full" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                Safety <span className="text-[#D97706]">Alerts</span>
              </h2>
              <p className="text-xs text-[#475569]">
                Real-time safety alerts from worker sensors
              </p>
            </div>
          </div>

          {/* Carousel Arrow Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollCarousel('left')}
              className="p-2 rounded-full bg-white border border-[#EDE4D6] hover:border-[#FDE68A] hover:bg-[#FFFBEB] text-[#475569] hover:text-[#D97706] shadow-2xs transition-colors cursor-pointer"
              aria-label="Scroll Alerts Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="p-2 rounded-full bg-white border border-[#EDE4D6] hover:border-[#FDE68A] hover:bg-[#FFFBEB] text-[#475569] hover:text-[#D97706] shadow-2xs transition-colors cursor-pointer"
              aria-label="Scroll Alerts Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <Link
              href="/alerts"
              className="hidden sm:inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[#D97706] text-[#D97706] bg-white hover:bg-[#FEF3C7]/50 shadow-2xs transition-colors ml-2"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={carouselRef}
          className="flex items-stretch gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`
                snap-start flex-shrink-0 w-80 sm:w-96 rounded-[20px] p-5 border transition-all duration-200 shadow-sm flex flex-col justify-between
                ${
                  alert.severity === 'critical'
                    ? 'bg-rose-50/70 border-rose-200'
                    : alert.severity === 'warning'
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-amber-50/70 border-amber-200'
                }
              `}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[11px] font-bold text-[#64748B]">
                    {alert.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      alert.severity === 'critical'
                        ? 'bg-rose-100 text-rose-700'
                        : alert.severity === 'warning'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    ● {alert.severity}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#0F172A] leading-snug">
                  {alert.title}
                </h3>

                <p className="text-xs text-[#475569] mt-1.5 line-clamp-2 leading-relaxed">
                  {alert.message}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-[#0F172A]">{alert.workerName}</div>
                  <div className="text-[11px] text-[#64748B]">{alert.jacketId} • {alert.zone}</div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#64748B]">{alert.timestamp}</span>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-white/90 rounded-full border border-black/10 shadow-2xs text-[#D97706] cursor-pointer"
                    >
                      Ack
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Live Miners Quick Glance */}
      {role === 'Supervisor' && (
        <div>
          <SectionHeader
            title="Live Worker Safety"
            highlightWord="Worker Safety"
            subtitle="Real-time updates from worker safety jackets"
            actionText="View All 8 Workers"
            actionHref="/workers"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workers.slice(0, 4).map((worker) => (
              <Card key={worker.id} variant="interactive" padding="md">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={worker.name} role={worker.role} size="md" status={worker.status === 'online' ? 'safe' : worker.status} />
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A] leading-tight">
                        {worker.name}
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">{worker.role}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] font-semibold border border-[#FDE68A]">
                    {worker.id}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EDE4D6] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">H2S Level</span>
                    <span className={`font-mono font-bold ${worker.h2s > 10 ? 'text-[#EF4444]' : worker.h2s >= 5 ? 'text-[#F59E0B]' : 'text-[#D97706]'}`}>
                      {worker.h2s.toFixed(1)} ppm
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">Pulse (MAX30102)</span>
                    <span className="font-mono font-bold text-[#0F172A]">
                      {worker.heartRate} bpm
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-[#64748B] bg-[#F8FAFC] px-2.5 py-1.5 rounded-xl">
                  <span className="truncate max-w-[130px]">{worker.zone}</span>
                  <span
                    className={`font-semibold capitalize ${
                      worker.status === 'online'
                        ? 'text-[#22C55E]'
                        : worker.status === 'warning'
                        ? 'text-[#F59E0B]'
                        : 'text-[#EF4444] animate-pulse'
                    }`}
                  >
                    ● {worker.status}
                  </span>
                </div>

                <div className="mt-3">
                  <Link href={`/workers/${worker.id}`} className="block">
                    <button className="w-full py-1.5 text-xs font-semibold rounded-full border border-[#FDE68A] text-[#D97706] bg-white hover:bg-[#FEF3C7]/50 transition-colors cursor-pointer shadow-2xs">
                      View Details & Trends →
                    </button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
