'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  Cpu,
  ArrowRight,
  BatteryCharging,
  CloudFog,
  Clock,
  Sun,
  Activity,
  BarChart2,
} from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import PastelTile from '@/components/ui/PastelTile';
import Avatar from '@/components/ui/Avatar';
import Card3D from '@/components/ui/Card3D';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import HazardAnalytics from '@/components/dashboard/HazardAnalytics';
import SubterraneanWorkerMap from '@/components/dashboard/SubterraneanWorkerMap';
import { useTelemetry } from '@/context/TelemetryContext';
import { useRole } from '@/context/RoleContext';

export default function HomePage() {
  const { workers, alerts, stats, acknowledgeAlert, physicalJacket } = useTelemetry();
  const { role, currentUser } = useRole();
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const maxH2S = Math.max(...workers.map((w) => w.h2s));
  const activeSOSCount = workers.filter((w) => w.sosActive).length;
  const myWorker = workers.find((w) => w.id === 'W1026' || w.jacketId === 'SJ-003') || workers[0];

  return (
    <div className="space-y-8">
      {/* 1. Welcome Strip */}
      <Card3D className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border-[var(--border)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)] flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
              <Sun className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                Good afternoon, {currentUser.name} 👋
              </h1>
              <p className="text-xs text-[#64748B] flex items-center gap-2 mt-0.5">
                <span className="font-semibold text-[var(--accent-strong)] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Shift B (08:00 AM - 04:00 PM)
                </span>
                <span>•</span>
                <span>Sub-surface Level −140 m</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-2xs ${
                physicalJacket?.isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  physicalJacket?.isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
                }`}
              />
              {physicalJacket?.isConnected ? 'Live Telemetry Link Active' : 'Simulated Telemetry Feed'}
            </span>
          </div>
        </div>
      </Card3D>

      {/* WORKER ROLE DASHBOARD */}
      {role === 'Worker' ? (
        <div className="space-y-8">
          {/* 2. Personal Smart Jacket Telemetry Cards (6 cols) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[var(--accent-strong)]" />
                Smart Jacket Telemetry Sensors
              </h2>
              <span className="text-xs text-[#64748B] font-mono">ID: {myWorker.jacketId}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* H2S Gas */}
              <Card3D className="bg-gradient-to-b from-teal-50/60 to-white border-teal-200/80">
                <div className="flex items-center justify-between text-teal-700">
                  <span className="text-xs font-bold">H₂S Gas</span>
                  <Wind className="w-4 h-4 animate-bounce" />
                </div>
                <div className="mt-3">
                  <AnimatedNumber
                    value={myWorker.h2s}
                    decimals={1}
                    className="text-2xl font-black text-[#0F172A]"
                  />
                  <span className="text-xs text-[#64748B] ml-1">ppm</span>
                </div>
                <span className="text-[10px] font-bold text-teal-600 mt-2 block">
                  {myWorker.colorimetricH2SDetected ? '⚠️ Discolored' : '✓ Normal Range'}
                </span>
              </Card3D>

              {/* Heart Rate */}
              <Card3D className="bg-gradient-to-b from-rose-50/60 to-white border-rose-200/80">
                <div className="flex items-center justify-between text-rose-700">
                  <span className="text-xs font-bold">Heart Rate</span>
                  <HeartPulse className="w-4 h-4 text-rose-500 animate-pulse" />
                </div>
                <div className="mt-3">
                  <AnimatedNumber
                    value={myWorker.heartRate}
                    decimals={0}
                    className="text-2xl font-black text-[#0F172A]"
                  />
                  <span className="text-xs text-[#64748B] ml-1">bpm</span>
                </div>
                <span className="text-[10px] font-bold text-rose-600 mt-2 block">MAX30102 Pulse</span>
              </Card3D>

              {/* Temp / Humidity */}
              <Card3D className="bg-gradient-to-b from-amber-50/60 to-white border-amber-200/80">
                <div className="flex items-center justify-between text-amber-700">
                  <span className="text-xs font-bold">Temp / Hum</span>
                  <Thermometer className="w-4 h-4" />
                </div>
                <div className="mt-3">
                  <AnimatedNumber
                    value={myWorker.temperature}
                    decimals={1}
                    suffix="°C"
                    className="text-xl font-black text-[#0F172A]"
                  />
                  <span className="text-xs text-[#64748B] block">{myWorker.humidity}% RH</span>
                </div>
                <span className="text-[10px] font-bold text-amber-600 mt-2 block">DHT22 Ambient</span>
              </Card3D>

              {/* Dust PM2.5 */}
              <Card3D className="bg-gradient-to-b from-slate-100/60 to-white border-slate-200/80">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-xs font-bold">Dust PM2.5</span>
                  <CloudFog className="w-4 h-4" />
                </div>
                <div className="mt-3">
                  <AnimatedNumber
                    value={myWorker.pm25}
                    decimals={0}
                    className="text-2xl font-black text-[#0F172A]"
                  />
                  <span className="text-xs text-[#64748B] ml-1">µg/m³</span>
                </div>
                <span className="text-[10px] font-bold text-slate-600 mt-2 block">Dust Particle</span>
              </Card3D>

              {/* Battery & Cooling */}
              <Card3D className="bg-gradient-to-b from-emerald-50/60 to-white border-emerald-200/80">
                <div className="flex items-center justify-between text-emerald-700">
                  <span className="text-xs font-bold">Battery & Vest</span>
                  <BatteryCharging className="w-4 h-4" />
                </div>
                <div className="mt-3">
                  <AnimatedNumber
                    value={myWorker.battery}
                    decimals={0}
                    suffix="%"
                    className="text-2xl font-black text-[#0F172A]"
                  />
                  <span className="text-xs text-emerald-600 ml-1">LiFePO4</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 mt-2 block truncate">
                  Vest: {myWorker.pcmCoolingStatus}
                </span>
              </Card3D>

              {/* LoRa / UWB */}
              <Card3D className="bg-gradient-to-b from-purple-50/60 to-white border-purple-200/80">
                <div className="flex items-center justify-between text-purple-700">
                  <span className="text-xs font-bold">LoRa / UWB</span>
                  <Radio className="w-4 h-4" />
                </div>
                <div className="mt-3">
                  <span className="text-lg font-black text-[#0F172A] font-mono">
                    {myWorker.loraRSSI} dBm
                  </span>
                  <span className="text-[11px] text-[#64748B] block font-mono">
                    ({myWorker.uwbX}m, {myWorker.uwbY}m)
                  </span>
                </div>
                <span className="text-[10px] font-bold text-purple-600 mt-2 block">Anchored</span>
              </Card3D>
            </div>
          </div>

          {/* 3. Two-Column Row: Pre-Shift PPE Checklist | Nearest Refuge Station */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card3D className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Pre-Shift PPE & Readiness Checklist
                </h3>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  4/4 Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[#0F172A]">Smart Jacket Paired</div>
                    <div className="text-[10px] text-emerald-800">ESP32 & Sensors Active</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[#0F172A]">Helmet Cap Lamp</div>
                    <div className="text-[10px] text-emerald-800">100% Charged (18h)</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[#0F172A]">Self-Rescuer Pack</div>
                    <div className="text-[10px] text-emerald-800">Sealed 60-min Oxygen</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[#0F172A]">PCM Cooling Vest</div>
                    <div className="text-[10px] text-emerald-800">Latent Heat Active</div>
                  </div>
                </div>
              </div>
            </Card3D>

            <Card3D className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[var(--accent-strong)]" />
                  Nearest Subterranean Refuge Station
                </h3>
                <span className="text-xs font-mono font-bold text-[var(--accent-strong)] bg-[var(--accent-soft)] px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
                  Station #2 (140m)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-1">
                  <span className="text-[10px] text-[#64748B] font-semibold block">Air Reserve</span>
                  <span className="text-lg font-black text-[#0F172A] font-mono block">96 Hours</span>
                  <span className="text-[9px] text-emerald-600 font-bold block">✓ Oxygen Full</span>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-1">
                  <span className="text-[10px] text-[#64748B] font-semibold block">Rations</span>
                  <span className="text-lg font-black text-[#0F172A] font-mono block">30 Persons</span>
                  <span className="text-[9px] text-amber-600 font-bold block">✓ Supplied</span>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-1">
                  <span className="text-[10px] text-[#64748B] font-semibold block">Comm Beacon</span>
                  <span className="text-lg font-black text-[var(--accent-strong)] font-mono block">LoRa</span>
                  <span className="text-[9px] text-emerald-600 font-bold block">✓ Direct Line</span>
                </div>
              </div>
            </Card3D>
          </div>
        </div>
      ) : (
        /* ADMIN / RESCUE ROLE DASHBOARD */
        <div className="space-y-8">
          <HazardAnalytics />

          {/* Subterranean Worker Map Component */}
          <Card3D className="p-0 overflow-hidden">
            <SubterraneanWorkerMap />
          </Card3D>
        </div>
      )}

      {/* 4. Sensor Status Grid (Merged Clean View) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 bg-[var(--accent-strong)] rounded-full" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#64748B]">
              Environmental Sensor Network Status
            </h2>
          </div>
          <span className="text-xs text-[var(--accent-strong)] font-mono bg-[var(--accent-soft)] px-2.5 py-0.5 rounded-full font-semibold">
            12 Sensors Online
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
        </div>
      </div>

      {/* 5. Safety Alerts Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[var(--accent-strong)] rounded-full" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                Safety <span className="text-[var(--accent-strong)]">Alerts</span>
              </h2>
              <p className="text-xs text-[#475569]">
                Real-time safety alerts from worker sensors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollCarousel('left')}
              className="p-2 rounded-full bg-white border border-[#EDE4D6] hover:bg-[#FFFBEB] text-[#475569] shadow-2xs transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="p-2 rounded-full bg-white border border-[#EDE4D6] hover:bg-[#FFFBEB] text-[#475569] shadow-2xs transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <Link
              href="/alerts"
              className="hidden sm:inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[var(--accent-strong)] text-[var(--accent-strong)] bg-white hover:bg-[var(--accent-soft)] shadow-2xs transition-colors ml-2"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="flex items-stretch gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x no-scrollbar"
        >
          {alerts.map((alert) => (
            <div key={alert.id} className="snap-start flex-shrink-0 w-80 sm:w-96">
              <Card3D
                className={`flex flex-col justify-between ${
                  alert.severity === 'critical'
                    ? 'bg-rose-50/70 border-rose-200'
                    : 'bg-amber-50/70 border-amber-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[11px] font-bold text-[#64748B]">
                      {alert.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        alert.severity === 'critical'
                          ? 'bg-rose-100 text-rose-700 animate-pulse'
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
                    <div className="text-[11px] text-[#64748B]">
                      {alert.jacketId} • {alert.zone}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#64748B]">{alert.timestamp}</span>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-white/90 rounded-full border border-black/10 shadow-2xs text-[var(--accent-strong)] cursor-pointer"
                      >
                        Ack
                      </button>
                    )}
                  </div>
                </div>
              </Card3D>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
