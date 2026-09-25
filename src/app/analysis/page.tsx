'use client';

import React, { useState } from 'react';
import {
  BarChart2,
  Clock,
  Wind,
  HeartPulse,
  Thermometer,
  BatteryCharging,
  Calendar,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import Card3D from '@/components/ui/Card3D';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import Avatar from '@/components/ui/Avatar';
import { useTelemetry } from '@/context/TelemetryContext';
import { useRole } from '@/context/RoleContext';

const hourlyShiftData = [
  { time: '08:00 AM', heartRate: 72, h2s: 0.8, temp: 24.5, pm25: 12 },
  { time: '09:00 AM', heartRate: 75, h2s: 1.2, temp: 25.0, pm25: 18 },
  { time: '10:00 AM', heartRate: 79, h2s: 2.0, temp: 26.1, pm25: 25 },
  { time: '11:00 AM', heartRate: 81, h2s: 3.4, temp: 27.4, pm25: 38 },
  { time: '12:00 PM', heartRate: 74, h2s: 1.8, temp: 26.8, pm25: 20 },
  { time: '01:00 PM', heartRate: 88, h2s: 8.5, temp: 31.2, pm25: 45 },
  { time: '02:00 PM', heartRate: 82, h2s: 4.2, temp: 28.5, pm25: 32 },
  { time: '03:00 PM', heartRate: 77, h2s: 2.1, temp: 27.0, pm25: 22 },
  { time: '04:00 PM', heartRate: 73, h2s: 1.1, temp: 25.5, pm25: 15 },
];

export default function AllDayAnalysisPage() {
  const { workers } = useTelemetry();
  const { role } = useRole();
  const myWorker = workers.find((w) => w.id === 'W1026' || w.jacketId === 'SJ-003') || workers[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EDE4D6] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Daily Analysis
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            24-hour shift health telemetry, gas exposure log, and vital milestones
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white text-[var(--accent-strong)] border border-[#FDE68A] shadow-2xs">
            <Calendar className="w-3.5 h-3.5" />
            Active Shift: 08:00 AM - 04:00 PM
          </span>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card3D className="bg-gradient-to-br from-rose-50/70 to-white border-rose-200">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-bold">Avg Heart Rate</span>
            <HeartPulse className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="mt-2">
            <AnimatedNumber value={76} decimals={0} suffix=" bpm" className="text-2xl font-black text-[#0F172A]" />
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">Peak: 88 bpm (Normal)</span>
        </Card3D>

        <Card3D className="bg-gradient-to-br from-amber-50/70 to-white border-amber-200">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-bold">Gas Exposure Dose</span>
            <Wind className="w-4 h-4" />
          </div>
          <div className="mt-2">
            <AnimatedNumber value={1.2} decimals={1} suffix=" ppm-h" className="text-2xl font-black text-[#0F172A]" />
          </div>
          <span className="text-[10px] text-amber-600 font-bold block mt-1">Below Permissible Limit</span>
        </Card3D>

        <Card3D className="bg-gradient-to-br from-teal-50/70 to-white border-teal-200">
          <div className="flex items-center justify-between text-teal-700">
            <span className="text-xs font-bold">PCM Cooling Vest</span>
            <Thermometer className="w-4 h-4" />
          </div>
          <div className="mt-2">
            <AnimatedNumber value={94} decimals={0} suffix="%" className="text-2xl font-black text-teal-700" />
          </div>
          <span className="text-[10px] text-teal-700 font-bold block mt-1">Active Cooling: 5.2 hrs</span>
        </Card3D>

        <Card3D className="bg-gradient-to-br from-emerald-50/70 to-white border-emerald-200">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold">Total Shift Log</span>
            <BatteryCharging className="w-4 h-4" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-[#0F172A] font-mono">7h 45m</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">Battery: 88% (LiFePO4)</span>
        </Card3D>
      </div>

      {/* 2. Interactive Area Chart of Heart Rate, H2S and Temp */}
      <Card3D className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[var(--accent-strong)]" />
            24-Hour Telemetry Trend (Heart Rate, H₂S & Temperature)
          </h2>
          <span className="text-xs font-mono text-[var(--accent-strong)] bg-[var(--accent-soft)] px-2.5 py-0.5 rounded-full font-semibold">
            Real-time Telemetry Stream
          </span>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyShiftData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorH2S" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D9488" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', borderColor: '#EDE4D6', fontSize: '12px' }} />
              <Area type="monotone" dataKey="heartRate" name="Heart Rate (bpm)" stroke="#EF4444" fillOpacity={1} fill="url(#colorHR)" />
              <Area type="monotone" dataKey="h2s" name="H₂S Gas (ppm)" stroke="#F59E0B" fillOpacity={1} fill="url(#colorH2S)" />
              <Area type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#0D9488" fillOpacity={1} fill="url(#colorTemp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card3D>

      {/* 3. Hourly Checkpoint Timeline Grid (3 cols desktop, 2 tablet, 1 mobile) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--accent-strong)]" />
            1-Hour Interval Checkpoints
          </h2>
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
            9 Checkpoints (08:00 AM - 04:00 PM)
          </span>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hourlyShiftData.map((item, idx) => (
            <Card3D
              key={item.time}
              className={`space-y-2 border ${
                item.h2s > 5
                  ? 'bg-rose-50/70 border-rose-200'
                  : idx % 2 === 0
                  ? 'bg-amber-50/50 border-amber-200'
                  : 'bg-emerald-50/50 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-extrabold text-[#0F172A] text-xs">{item.time}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#0F172A] border border-black/10">
                  Checkpoint #{idx + 1}
                </span>
              </div>
              <div className="text-[11px] space-y-1 font-mono pt-1">
                <div>• H₂S Gas: <span className="font-bold">{item.h2s} ppm</span></div>
                <div>• Pulse: <span className="font-bold">{item.heartRate} bpm</span> • Temp: <span className="font-bold">{item.temp}°C</span></div>
                <div>• Dust PM2.5: <span className="font-bold">{item.pm25} µg/m³</span></div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
    </div>
  );
}
