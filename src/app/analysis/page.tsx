'use client';

import React, { useState } from 'react';
import {
  BarChart2,
  Clock,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Wind,
  HeartPulse,
  Thermometer,
  BatteryCharging,
  Radio,
  HardHat,
  Users,
  ShieldCheck,
  Activity,
  Calendar,
  CloudFog,
  Filter
} from 'lucide-react';
import Card from '@/components/ui/Card';
import SectionHeader from '@/components/ui/SectionHeader';
import Avatar from '@/components/ui/Avatar';
import { useTelemetry } from '@/context/TelemetryContext';
import { useRole } from '@/context/RoleContext';

export default function AllDayAnalysisPage() {
  const { workers, stats, isLive } = useTelemetry();
  const { role, currentUser } = useRole();
  const [selectedShift, setSelectedShift] = useState<'morning' | 'afternoon' | 'full'>('full');

  // Single worker telemetry for Worker Role (Underground Worker)
  const myWorker = workers.find((w) => w.id === 'W1026' || w.jacketId === 'SJ-003') || workers[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Page header, same layout as the Alerts page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EDE4D6] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Daily Analysis
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white text-[#D97706] border border-[#FDE68A] shadow-2xs">
            <Calendar className="w-3.5 h-3.5" />
            Shift: 08:00 AM - 04:00 PM
          </span>
        </div>
      </div>

      {/* WORKER ROLE: Individual Worker All-Day Detailed Analysis */}
      {role === 'Worker' ? (
        <div className="space-y-6">
          {/* Individual Shift Metric Summaries */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card variant="interactive" padding="md" className="bg-white border-[#EDE4D6]">
              <span className="text-xs font-medium text-[#64748B]">Average Heart Rate</span>
              <div className="text-2xl font-black text-[#0F172A] font-mono mt-1">76 bpm</div>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">Peak: 88 bpm (Normal)</span>
            </Card>

            <Card variant="interactive" padding="md" className="bg-white border-[#EDE4D6]">
              <span className="text-xs font-medium text-[#64748B]">Gas Exposure Dose</span>
              <div className="text-2xl font-black text-[#D97706] font-mono mt-1">1.2 ppm-h</div>
              <span className="text-[10px] text-amber-600 font-bold block mt-1">Below Permissible Limit</span>
            </Card>

            <Card variant="interactive" padding="md" className="bg-white border-[#EDE4D6]">
              <span className="text-xs font-medium text-[#64748B]">PCM Vest Cooling</span>
              <div className="text-2xl font-black text-teal-600 font-mono mt-1">94%</div>
              <span className="text-[10px] text-teal-700 font-bold block mt-1">Active Cooling: 5.2 hrs</span>
            </Card>

            <Card variant="interactive" padding="md" className="bg-white border-[#EDE4D6]">
              <span className="text-xs font-medium text-[#64748B]">Total Shift Log</span>
              <div className="text-2xl font-black text-[#0F172A] font-mono mt-1">7h 45m</div>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">Battery: 88% (LiFePO4)</span>
            </Card>
          </div>

          {/* Personal Timewise All-Day Shift Analysis Section */}
          <div className="bg-white rounded-3xl p-6 border border-[#EDE4D6] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#D97706]" />
                  My Personal All-Day Shift Analysis
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Timewise 24-hour shift health telemetry, gas exposure log, and vital milestones for {myWorker.name}
                </p>
              </div>

              <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#FEF3C7] text-[#D97706] font-bold border border-[#FDE68A]">
                Active Shift: 08:00 AM - 04:00 PM
              </span>
            </div>

            {/* 1-Hour Interval All-Day Shift Analysis Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#D97706]" />
                  1-Hour Interval All-Day Shift Health & Environmental Breakdown
                </h3>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  9 Hourly Checkpoints (08:00 AM - 04:00 PM)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3">
                {/* 08:00 AM */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0F172A] text-xs">08:00 AM</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-800">Shift Entry</span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-900">Underground Shaft Entry & Briefing</p>
                  <div className="text-[11px] text-emerald-800 space-y-0.5 font-mono pt-2 border-t border-emerald-200/60">
                    <div>• H₂S Gas: <span className="font-bold">0.8 ppm</span> (Safe)</div>
                    <div>• Pulse: <span className="font-bold">72 bpm</span> • Temp: <span className="font-bold">24.5°C</span></div>
                    <div>• Dust PM2.5: <span className="font-bold">12 µg/m³</span> • Battery: <span className="font-bold">100%</span></div>
                  </div>
                </div>

                {/* 09:00 AM */}
                <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0F172A] text-xs">09:00 AM</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-800">Descent</span>
                  </div>
                  <p className="text-xs font-semibold text-amber-900">Shaft 4 Incline Descent</p>
                  <div className="text-[11px] text-amber-800 space-y-0.5 font-mono pt-2 border-t border-amber-200/60">
                    <div>• H₂S Gas: <span className="font-bold">1.2 ppm</span> (Safe)</div>
                    <div>• Pulse: <span className="font-bold">75 bpm</span> • Temp: <span className="font-bold">25.0°C</span></div>
                    <div>• Dust PM2.5: <span className="font-bold">18 µg/m³</span> • Battery: <span className="font-bold">97%</span></div>
                  </div>
                </div>

                {/* 10:00 AM */}
                <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0F172A] text-xs">10:00 AM</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-800">Calibration</span>
                  </div>
                  <p className="text-xs font-semibold text-amber-900">Drill Rig Calibration & Positioning</p>
                  <div className="text-[11px] text-amber-800 space-y-0.5 font-mono pt-2 border-t border-amber-200/60">
                    <div>• H₂S Gas: <span className="font-bold">2.0 ppm</span> (Normal)</div>
                    <div>• Pulse: <span className="font-bold">79 bpm</span> • Temp: <span className="font-bold">26.1°C</span></div>
                    <div>• Dust PM2.5: <span className="font-bold">25 µg/m³</span> • Battery: <span className="font-bold">94%</span></div>
                  </div>
                </div>

                {/* 11:00 AM */}
                <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0F172A] text-xs">11:00 AM</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-800">Active Duty</span>
                  </div>
                  <p className="text-xs font-semibold text-amber-900">Active Tunnel Shaft Excavation</p>
                  <div className="text-[11px] text-amber-800 space-y-0.5 font-mono pt-2 border-t border-amber-200/60">
                    <div>• H₂S Gas: <span className="font-bold">3.4 ppm</span> (Normal)</div>
                    <div>• Pulse: <span className="font-bold">81 bpm</span> • PCM Cooling: <span className="font-bold text-teal-600">Active (18°C)</span></div>
                    <div>• Dust PM2.5: <span className="font-bold">38 µg/m³</span> • Battery: <span className="font-bold">91%</span></div>
                  </div>
                </div>

                {/* 12:00 PM */}
                <div className="p-3.5 rounded-2xl bg-teal-50/90 border border-teal-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0F172A] text-xs">12:00 PM</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-teal-200 text-teal-900">Mid-Shift</span>
                  </div>
                  <p className="text-xs font-semibold text-teal-900">Mid-Shift Hydration & Radio Check</p>
                  <div className="text-[11px] text-teal-800 space-y-0.5 font-mono pt-2 border-t border-teal-200/60">
                    <div>• H₂S Gas: <span className="font-bold">1.8 ppm</span> (Safe)</div>
                    <div>• Pulse: <span className="font-bold">74 bpm</span> • Temp: <span className="font-bold">26.8°C</span></div>
                    <div>• Dust PM2.5: <span className="font-bold">20 µg/m³</span> • Battery: <span className="font-bold">89%</span></div>
                  </div>
                </div>

                {/* 01:00 PM */}
                <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0F172A] text-xs">01:00 PM</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">Peak Load</span>
                  </div>
                  <p className="text-xs font-semibold text-amber-900">Heavy Excavation Peak Load</p>
                  <div className="text-[11px] text-amber-900 space-y-0.5 font-mono pt-2 border-t border-amber-200/60">
                    <div>• H₂S Gas: <span className="font-bold">8.5 ppm</span> (Elevated)</div>
                    <div>• Pulse: <span className="font-bold">88 bpm</span> • Temp: <span className="font-bold">31.2°C</span></div>
                    <div>• Dust PM2.5: <span className="font-bold">45 µg/m³</span> • Battery: <span className="font-bold">86%</span></div>
                  </div>
                </div>

                {/* 02:00 PM */}
                <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0F172A] text-xs">02:00 PM</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">Ventilation</span>
                  </div>
                  <p className="text-xs font-semibold text-amber-900">Section Air Vent Flush Cycle</p>
                  <div className="text-[11px] text-amber-900 space-y-0.5 font-mono pt-2 border-t border-amber-200/60">
                    <div>• H₂S Gas: <span className="font-bold">4.2 ppm</span> (Normalizing)</div>
                    <div>• Pulse: <span className="font-bold">82 bpm</span> • PCM Cooling: <span className="font-bold text-teal-600">Active</span></div>
                    <div>• Dust PM2.5: <span className="font-bold">32 µg/m³</span> • Battery: <span className="font-bold">84%</span></div>
                  </div>
                </div>

                {/* 03:00 PM */}
                <div className="p-3.5 rounded-2xl bg-orange-50/90 border border-orange-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0F172A] text-xs">03:00 PM</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-orange-200 text-orange-900">Shoring</span>
                  </div>
                  <p className="text-xs font-semibold text-orange-900">Shaft Timbering & Site Secure</p>
                  <div className="text-[11px] text-orange-800 space-y-0.5 font-mono pt-2 border-t border-orange-200/60">
                    <div>• H₂S Gas: <span className="font-bold">2.1 ppm</span> (Clear)</div>
                    <div>• Pulse: <span className="font-bold">77 bpm</span> • Temp: <span className="font-bold">27.0°C</span></div>
                    <div>• Dust PM2.5: <span className="font-bold">22 µg/m³</span> • Battery: <span className="font-bold">82%</span></div>
                  </div>
                </div>

                {/* 04:00 PM */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0F172A] text-xs">04:00 PM</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-800">Shift Wrap</span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-900">Surface Egress & Gear Check-in</p>
                  <div className="text-[11px] text-emerald-800 space-y-0.5 font-mono pt-2 border-t border-emerald-200/60">
                    <div>• H₂S Gas: <span className="font-bold">1.1 ppm</span> (Safe)</div>
                    <div>• Pulse: <span className="font-bold">73 bpm</span> • Temp: <span className="font-bold">25.5°C</span></div>
                    <div>• Dust PM2.5: <span className="font-bold">15 µg/m³</span> • Battery: <span className="font-bold">88%</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SUPERVISOR / RESCUER ROLE: Mine-Wide All Workers Shift Analysis */
        <div className="space-y-6">
          <SectionHeader
            title="Mine-Wide All Workers Shift Telemetry & Analysis"
            highlightWord="All Workers"
            subtitle="Full 24-hour shift health telemetry breakdown across all active underground rescue miners"
            showAction={false}
          />

          {/* All Workers Grid Roster */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {workers.map((worker) => (
              <Card key={worker.id} variant="interactive" padding="md" className="bg-white border-[#EDE4D6] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={worker.name} role={worker.role} size="md" status={worker.status === 'online' ? 'safe' : worker.status} />
                      <div>
                        <h3 className="text-sm font-bold text-[#0F172A] leading-tight">{worker.name}</h3>
                        <p className="text-[11px] text-[#64748B] mt-0.5">{worker.role}</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#FDE68A]">
                      {worker.id}
                    </span>
                  </div>

                  <div className="mt-3 text-[11px] text-[#64748B] bg-[#F8FAFC] px-2.5 py-1.5 rounded-lg border border-[#EDE4D6] flex justify-between">
                    <span>{worker.zone}</span>
                    <span className="font-mono font-bold text-[#D97706]">{worker.jacketId}</span>
                  </div>

                  {/* Vitals Summary */}
                  <div className="mt-3 pt-2.5 border-t border-[#E2E8F0] grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[9px] text-[#64748B] uppercase block">H₂S Gas</span>
                      <span className="font-mono font-bold text-[#D97706]">{worker.h2s.toFixed(1)} ppm</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#64748B] uppercase block">Pulse</span>
                      <span className="font-mono font-bold text-[#0F172A]">{worker.heartRate} bpm</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#64748B] uppercase block">Battery</span>
                      <span className="font-mono font-bold text-emerald-600">{worker.battery}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[10px]">
                  <span className="text-[#64748B]">24h Shift Status</span>
                  <span className="font-bold text-emerald-700 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                    ● Normal Shift Logged
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
