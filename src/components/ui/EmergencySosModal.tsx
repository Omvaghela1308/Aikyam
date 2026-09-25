'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  X,
  Radio,
  HeartPulse,
  Wind,
  Thermometer,
  BatteryCharging,
  LifeBuoy,
  CheckCircle2,
  Volume2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useTelemetry } from '@/context/TelemetryContext';
import Avatar from '@/components/ui/Avatar';

export default function EmergencySosModal() {
  const { workers, alerts, acknowledgeAlert } = useTelemetry();
  const [isOpen, setIsOpen] = useState(false);
  const [alarmSounding, setAlarmSounding] = useState(true);

  // Find any worker with active SOS panic button pressed or critical alert
  const sosWorker = workers.find((w) => w.sosActive || w.status === 'critical') || null;
  const sosAlert = alerts.find((a) => a.severity === 'critical' && !a.acknowledged) || null;

  useEffect(() => {
    if (sosWorker || sosAlert) {
      setIsOpen(true);
    }
  }, [sosWorker, sosAlert]);

  if (!isOpen || (!sosWorker && !sosAlert)) return null;

  const targetWorker = sosWorker || {
    id: 'W1026',
    name: sosAlert?.workerName || 'Underground Worker',
    jacketId: sosAlert?.jacketId || 'SJ-003',
    role: 'Underground Field Miner',
    zone: sosAlert?.zone || 'Deep Incline Shaft 4 (-320m)',
    h2s: 12.8,
    heartRate: 98,
    temperature: 34.2,
    battery: 88,
    lastPing: new Date().toLocaleTimeString(),
  };

  const handleDismiss = () => {
    if (sosAlert) {
      acknowledgeAlert(sosAlert.id);
    } else if (sosWorker) {
      // Clear worker SOS state
      acknowledgeAlert(`ALT-${sosWorker.id}`);
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-rose-500 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Emergency Red Flashing Banner */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white flex-shrink-0 animate-bounce">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase bg-white/20 text-white border border-white/30 tracking-wider">
                🚨 EMERGENCY SOS SIGNAL
              </span>
              <h2 className="text-xl font-black tracking-tight mt-0.5">Panic Switch Pushed!</h2>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close Alert"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SOS Details Body */}
        <div className="p-6 space-y-5">
          {/* Worker Identity Card */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <Avatar name={targetWorker.name} role={targetWorker.role} size="lg" status="danger" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-[#0F172A]">{targetWorker.name}</h3>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-800 border border-rose-300">
                    {targetWorker.id}
                  </span>
                </div>
                <p className="text-xs font-semibold text-rose-900 mt-0.5">
                  {targetWorker.role} • Jacket: <span className="font-mono font-bold">{targetWorker.jacketId}</span>
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                  Sector: <span className="font-bold text-slate-900">{targetWorker.zone}</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="px-2.5 py-1 text-[10px] font-black rounded-full bg-rose-600 text-white uppercase tracking-wider block animate-pulse">
                SOS PANIC TRIGGER
              </span>
              <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                {targetWorker.lastPing}
              </span>
            </div>
          </div>

          {/* Live Sensor Telemetry at Panic Moment */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Live Smart Jacket Vitals & Gas Reading at Emergency Signal
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 uppercase block font-sans">H₂S Gas</span>
                <span className="text-base font-black text-rose-600">{targetWorker.h2s.toFixed(1)} ppm</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 uppercase block font-sans">Heart Rate</span>
                <span className="text-base font-black text-rose-600">{targetWorker.heartRate} bpm</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 uppercase block font-sans">Ambient Temp</span>
                <span className="text-base font-black text-slate-900">{targetWorker.temperature}°C</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 uppercase block font-sans">Battery</span>
                <span className="text-base font-black text-emerald-600">{targetWorker.battery}%</span>
              </div>
            </div>
          </div>

          {/* Emergency Siren Indicator */}
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-600 animate-pulse" />
              <span className="font-bold">Subterranean Alarm Siren Status:</span>
              <span>{alarmSounding ? '🔊 Sounding High Decibel Siren' : 'Muted'}</span>
            </div>
            <button
              onClick={() => setAlarmSounding(!alarmSounding)}
              className="text-[10px] font-bold px-2 py-1 rounded bg-amber-200 text-amber-900 hover:bg-amber-300 transition-colors cursor-pointer"
            >
              {alarmSounding ? 'Mute' : 'Unmute'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleDismiss}
              className="w-full sm:w-1/2 py-3 px-4 rounded-2xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-2 border border-slate-300"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Acknowledge Signal</span>
            </button>

            <Link
              href="/rescue"
              onClick={handleDismiss}
              className="w-full sm:w-1/2 py-3 px-4 rounded-2xl font-extrabold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LifeBuoy className="w-4 h-4" />
              <span>Dispatch Rescue Team</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
