'use client';

import React from 'react';
import {
  Wind,
  Flame,
  Activity,
  Gauge,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Fan,
  Mountain,
  ThermometerSnowflake,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import { useTelemetry } from '@/context/TelemetryContext';

export default function HazardAnalytics() {
  const { workers } = useTelemetry();

  // Compute live gas metrics from worker telemetries
  const maxH2S = Math.max(...workers.map((w) => w.h2s), 0);
  const avgTemp = Math.round(
    workers.reduce((acc, w) => acc + (w.temperature || 36.8), 0) / (workers.length || 1)
  );

  const gasMonitors = [
    {
      name: 'Methane (CH₄)',
      value: '0.45%',
      threshold: '< 1.0% Safe',
      status: 'safe',
      icon: <Flame className="w-4 h-4 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
      progress: 45,
      barColor: 'bg-emerald-500',
    },
    {
      name: 'Carbon Monoxide (CO)',
      value: '12 ppm',
      threshold: '< 25 ppm Normal',
      status: 'safe',
      // Safe readings stay out of amber, which means "warning" on this dashboard
      icon: <Wind className="w-4 h-4 text-teal-600" />,
      bg: 'bg-teal-50 border-teal-200',
      text: 'text-teal-700',
      progress: 48,
      barColor: 'bg-teal-500',
    },
    {
      name: 'Hydrogen Sulfide (H₂S)',
      value: `${maxH2S.toFixed(1)} ppm`,
      threshold: maxH2S >= 10 ? 'CRITICAL ALERT' : maxH2S >= 5 ? 'Warning (>5 ppm)' : '< 5 ppm Safe',
      status: maxH2S >= 10 ? 'danger' : maxH2S >= 5 ? 'warning' : 'safe',
      icon: <ShieldAlert className="w-4 h-4 text-amber-600" />,
      bg: maxH2S >= 10 ? 'bg-rose-50 border-rose-200' : maxH2S >= 5 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200',
      text: maxH2S >= 10 ? 'text-rose-700' : maxH2S >= 5 ? 'text-amber-700' : 'text-emerald-700',
      progress: Math.min((maxH2S / 15) * 100, 100),
      barColor: maxH2S >= 10 ? 'bg-rose-500' : maxH2S >= 5 ? 'bg-amber-500' : 'bg-emerald-500',
    },
    {
      name: 'Oxygen Concentration (O₂)',
      value: '20.8%',
      threshold: '19.5% - 23.5% Optimal',
      status: 'safe',
      icon: <Gauge className="w-4 h-4 text-cyan-600" />,
      bg: 'bg-cyan-50 border-cyan-200',
      text: 'text-cyan-700',
      progress: 88,
      barColor: 'bg-cyan-500',
    },
  ];

  return (
    <Card variant="flat" padding="lg" className="bg-white border-[#EDE4D6] shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D97706] to-[#F59E0B] p-2 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#0F172A] tracking-tight">
              Mine Environment & Hazard Analytics
            </h2>
          </div>
        </div>
      </div>

      {/* Gas Threshold Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {gasMonitors.map((gas) => (
          <div
            key={gas.name}
            className={`p-4 rounded-2xl border ${gas.bg} transition-all duration-150 flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                  {gas.icon}
                  {gas.name}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white ${gas.text}`}>
                  {gas.status.toUpperCase()}
                </span>
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <span className={`text-2xl font-black font-mono ${gas.text}`}>{gas.value}</span>
                <span className="text-[11px] font-semibold text-[#64748B]">{gas.threshold}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 w-full bg-white/80 rounded-full h-1.5 overflow-hidden border border-black/5">
              <div
                className={`h-full ${gas.barColor} transition-all duration-500`}
                style={{ width: `${gas.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
