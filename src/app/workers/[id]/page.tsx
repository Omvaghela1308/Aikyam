'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  HeartPulse,
  Wind,
  Thermometer,
  CloudFog,
  Radio,
  BatteryCharging,
  Cpu,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Activity,
  Layers,
  Clock,
  Sparkles,
  Camera,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import SectionHeader from '@/components/ui/SectionHeader';
import PillButton from '@/components/ui/PillButton';
import { useTelemetry } from '@/context/TelemetryContext';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function WorkerDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { getWorker, isLive } = useTelemetry();
  const worker = getWorker(id);

  if (!worker) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-[#0F172A]">Worker Not Found</h2>
        <p className="text-sm text-[#475569] mt-2">
          No miner with ID or Jacket ID matching &ldquo;{id}&rdquo; was found in the active telemetry pool.
        </p>
        <Link href="/workers" className="mt-6 inline-block">
          <PillButton variant="primary">Return to Worker Roster</PillButton>
        </Link>
      </div>
    );
  }

  // Format chart data from historical points
  const chartData = worker.history.map((point) => ({
    time: point.time,
    h2s: point.h2s,
    heartRate: point.heartRate,
    temperature: point.temperature,
    pm25: point.pm25,
    radiation: point.radiationUSv,
  }));

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <Link
          href="/workers"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#D97706] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Live Workers</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#64748B] bg-[#F1F5F9] px-2.5 py-1 rounded-full border border-[#E2E8F0]">
            Sync: {worker.lastPing}
          </span>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
              worker.status === 'online'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : worker.status === 'warning'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
            }`}
          >
            ● Status: {worker.status}
          </span>
        </div>
      </div>

      {/* Miner Header Card */}
      <Card variant="flat" padding="lg" className="bg-gradient-to-r from-[#FFFBEB] via-white to-[#FFFBEB] border-[#FDE68A]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar
              name={worker.name}
              role={worker.role}
              size="xl"
              status={worker.status === 'online' ? 'safe' : worker.status}
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                  {worker.name}
                </h1>
                <span className="font-mono text-xs font-bold text-[#D97706] bg-white px-2 py-0.5 rounded-full border border-[#FDE68A] shadow-2xs">
                  {worker.id}
                </span>
                <span className="font-mono text-xs font-bold text-[#475569] bg-[#F8FAFC] px-2 py-0.5 rounded-full border border-[#E2E8F0]">
                  {worker.jacketId}
                </span>
              </div>
              <p className="text-sm font-semibold text-[#D97706] mt-0.5">{worker.role}</p>
              <p className="text-xs text-[#64748B] flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#D97706]" />
                {worker.zone} • UWB Coordinates: ({worker.uwbX}m, {worker.uwbY}m)
              </p>
            </div>
          </div>

          {/* Quick Jacket Hardware Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-white px-3 py-1.5 rounded-2xl border border-[#EDE4D6] shadow-2xs">
              <span className="text-[10px] text-[#64748B] uppercase block">ESP32 Core</span>
              <span className="font-mono font-bold text-[#0F172A]">WROOM-32E</span>
            </div>
            <div className="bg-white px-3 py-1.5 rounded-2xl border border-[#EDE4D6] shadow-2xs">
              <span className="text-[10px] text-[#64748B] uppercase block">LoRa Node</span>
              <span className="font-mono font-bold text-[#D97706]">{worker.loraRSSI} dBm</span>
            </div>
            <div className="bg-white px-3 py-1.5 rounded-2xl border border-[#EDE4D6] shadow-2xs">
              <span className="text-[10px] text-[#64748B] uppercase block">Battery LiFePO4</span>
              <span className="font-mono font-bold text-emerald-600">{worker.battery}%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Real-time Hardware Readings Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* H2S SPEC */}
        <Card variant="flat" padding="sm" className="bg-[#FFFBEB] border-[#FDE68A]">
          <span className="text-[10px] font-bold text-[#D97706] uppercase">H2S Electronic</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-2xl font-black font-mono ${worker.h2s > 10 ? 'text-rose-600' : worker.h2s >= 5 ? 'text-amber-600' : 'text-[#D97706]'}`}>
              {worker.h2s.toFixed(1)}
            </span>
            <span className="text-[10px] text-[#64748B]">ppm</span>
          </div>
          <span className="text-[9px] font-mono text-[#64748B]">SPEC 3SP_H2S_50</span>
        </Card>

        {/* Pulse MAX30102 */}
        <Card variant="flat" padding="sm" className="bg-[#FFF1F2] border-[#FECDD3]">
          <span className="text-[10px] font-bold text-[#E11D48] uppercase">Heart Rate</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-[#0F172A]">
              {worker.heartRate}
            </span>
            <span className="text-[10px] text-[#64748B]">bpm</span>
          </div>
          <span className="text-[9px] font-mono text-[#64748B]">MAX30102 PPG</span>
        </Card>

        {/* Temperature DHT22 */}
        <Card variant="flat" padding="sm" className="bg-[#FFF7ED] border-[#FFEDD5]">
          <span className="text-[10px] font-bold text-[#EA580C] uppercase">Jacket Temp</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-[#0F172A]">
              {worker.temperature}
            </span>
            <span className="text-[10px] text-[#64748B]">°C</span>
          </div>
          <span className="text-[9px] font-mono text-[#64748B]">DHT22 ({worker.humidity}% RH)</span>
        </Card>

        {/* Dust PMS5003 */}
        <Card variant="flat" padding="sm" className="bg-[#FEFCE8] border-[#FEF08A]">
          <span className="text-[10px] font-bold text-[#A16207] uppercase">Dust PM2.5</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-[#0F172A]">
              {worker.pm25}
            </span>
            <span className="text-[10px] text-[#64748B]">µg/m³</span>
          </div>
          <span className="text-[9px] font-mono text-[#64748B]">PMS5003 Laser</span>
        </Card>

        {/* Radiation SBM-20 */}
        <Card variant="flat" padding="sm" className="bg-[#FAF5FF] border-[#E9D5FF]">
          <span className="text-[10px] font-bold text-[#9333EA] uppercase">Radiation</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-[#0F172A]">
              {worker.radiationUSv}
            </span>
            <span className="text-[10px] text-[#64748B]">µSv/h</span>
          </div>
          <span className="text-[9px] font-mono text-[#64748B]">SBM-20 ({worker.radiationCPM} CPM)</span>
        </Card>

        {/* PCM Pack */}
        <Card variant="flat" padding="sm" className="bg-[#F0FDF4] border-[#BBF7D0]">
          <span className="text-[10px] font-bold text-[#16A34A] uppercase">PCM Cooling</span>
          <div className="mt-1 text-xs font-bold text-[#0F172A] leading-tight line-clamp-2">
            {worker.pcmCoolingStatus}
          </div>
          <span className="text-[9px] font-mono text-[#64748B]">RT-28HC Vest</span>
        </Card>
      </div>

      {/* Recharts: Last 1 Hour Historical Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: H2S Gas Exposure Trend */}
        <Card variant="default" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-[#D97706] rounded-full" />
                <h2 className="text-base font-bold text-[#0F172A]">
                  H2S Toxic Gas Exposure — Last 1 Hour
                </h2>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                SPEC 3SP_H2S_50 electrochemical sensor reading (ppm)
              </p>
            </div>

            <span className="text-[10px] font-mono font-bold bg-[#FEF3C7] text-[#D97706] px-2 py-0.5 rounded-full">
              Ceiling: 10.0 ppm
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="h2sGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE4D6" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} domain={[0, 15]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #FDE68A',
                    boxShadow: '0 4px 16px rgba(15,23,42,0.08)',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value} ppm`, 'H2S Level']}
                />
                <Area
                  type="monotone"
                  dataKey="h2s"
                  stroke="#D97706"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#h2sGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#EDE4D6]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Safe (&lt; 5 ppm)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Warning (5-10 ppm)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Danger (&gt; 10 ppm)
            </span>
          </div>
        </Card>

        {/* Chart 2: Heart Rate Pulse Trend */}
        <Card variant="default" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-[#EF4444] rounded-full" />
                <h2 className="text-base font-bold text-[#0F172A]">
                  Heart Rate Biometrics — Last 1 Hour
                </h2>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                MAX30102 dual-wavelength PPG optical pulse stream (bpm)
              </p>
            </div>

            <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
              Target: 60-100 BPM
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE4D6" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} domain={[50, 150]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #FECDD3',
                    boxShadow: '0 4px 16px rgba(15,23,42,0.08)',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value} bpm`, 'Heart Rate']}
                />
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  dot={{ fill: '#EF4444', r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#EDE4D6]">
            <span>Average: {worker.heartRate} bpm</span>
            <span>Peak: {Math.max(...chartData.map((d) => d.heartRate))} bpm</span>
            <span>Min: {Math.min(...chartData.map((d) => d.heartRate))} bpm</span>
          </div>
        </Card>
      </div>

      {/* Multi-Hazard Optical & Electronic Cross-Validation Banner */}
      <Card variant="flat" padding="md" className="bg-[#F8FAFC]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
              <Camera className="w-5 h-5 text-[#D97706]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                Dual-Verification: Electronic Sensor & Optical Colorimetric Strip
              </h3>
              <p className="text-xs text-[#475569] mt-0.5">
                SPEC amperometric cell provides instant millisecond alarm; OV2640 optical strip camera provides visual chemical stain verification (anti-false alarm).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                worker.colorimetricH2SDetected
                  ? 'bg-rose-100 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              Optical Strip: {worker.colorimetricH2SDetected ? 'Dark Stain Confirmed' : 'Strip Clear'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
