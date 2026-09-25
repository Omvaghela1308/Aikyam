'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  VolumeX,
  Check,
  Send,
  ShieldAlert,
} from 'lucide-react';
import Card3D from '@/components/ui/Card3D';
import Avatar from '@/components/ui/Avatar';
import { useTelemetry } from '@/context/TelemetryContext';
import { soundManager } from '@/lib/sound-effects';

export default function AlertsPage() {
  const { alerts, acknowledgeAlert } = useTelemetry();
  const [activeFilter, setActiveFilter] = useState<'all' | 'danger' | 'warning' | 'resolved'>('all');
  const [mutedNonCritical, setMutedNonCritical] = useState(false);
  const [dispatchedAlerts, setDispatchedAlerts] = useState<Record<string, boolean>>({});
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [localAckState, setLocalAckState] = useState<Record<string, boolean>>({});

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const defaultAlertList = [
    {
      id: 'ALT-8891',
      title: 'Hydrogen Sulfide (H2S) Danger',
      category: 'Toxic Gas',
      zone: 'Tunnel 3 - Extraction Heading',
      level: 'danger' as const,
      timestamp: 'Just now (1 min ago)',
      worker: 'Manoj Yadav',
      workerJacket: 'J-119',
      details: 'High gas level detected! Evacuate area immediately.',
      acknowledged: false,
    },
    {
      id: 'ALT-8890',
      title: 'High Heart Rate & Heat Warning',
      category: 'Worker Health',
      zone: 'Deep Shaft 4',
      level: 'warning' as const,
      timestamp: '6 mins ago',
      worker: 'Sunil Sharma',
      workerJacket: 'J-104',
      details: 'High heart rate and high temperature warning.',
      acknowledged: false,
    },
    {
      id: 'ALT-8887',
      title: 'Gas Surge Warning',
      category: 'Air Quality',
      zone: 'Main Belt Conveyor B1',
      level: 'warning' as const,
      timestamp: '18 mins ago',
      worker: 'Ramesh Verma',
      workerJacket: 'J-101',
      details: 'Carbon monoxide rise detected in zone.',
      acknowledged: false,
    },
    {
      id: 'ALT-8882',
      title: 'Ground Movement Warning',
      category: 'Ground Safety',
      zone: 'Level 2 Extraction',
      level: 'danger' as const,
      timestamp: '42 mins ago',
      worker: 'Vikram Singh',
      workerJacket: 'J-108',
      details: 'Minor ground movement detected in sector.',
      acknowledged: true,
    },
  ];

  const activeAlertsList =
    alerts.length > 0
      ? alerts.map((a) => ({
          id: a.id,
          title: a.title,
          category: 'Safety Alert',
          zone: a.zone,
          level: (a.severity === 'critical' ? 'danger' : 'warning') as 'danger' | 'warning',
          timestamp: a.timestamp,
          worker: a.workerName || 'Underground Miner',
          workerJacket: a.jacketId || 'SJ-001',
          details: a.message,
          acknowledged: a.acknowledged,
        }))
      : defaultAlertList;

  const isAlertAck = (id: string, initialAck: boolean) => {
    return localAckState[id] !== undefined ? localAckState[id] : initialAck;
  };

  const unacknowledgedCount = activeAlertsList.filter((a) => !isAlertAck(a.id, a.acknowledged)).length;

  // Sorting: Danger first, then warning, then acknowledged
  const sortedAlerts = [...activeAlertsList].sort((a, b) => {
    const ackA = isAlertAck(a.id, a.acknowledged);
    const ackB = isAlertAck(b.id, b.acknowledged);
    if (ackA !== ackB) return ackA ? 1 : -1;
    if (a.level === 'danger' && b.level !== 'danger') return -1;
    if (a.level !== 'danger' && b.level === 'danger') return 1;
    return 0;
  });

  const filteredAlerts = sortedAlerts.filter((a) => {
    const ack = isAlertAck(a.id, a.acknowledged);
    if (activeFilter === 'danger') return a.level === 'danger' && !ack;
    if (activeFilter === 'warning') return a.level === 'warning' && !ack;
    if (activeFilter === 'resolved') return ack;
    if (mutedNonCritical && a.level === 'warning') return false;
    return true;
  });

  const handleMuteToggle = () => {
    const nextMuted = !mutedNonCritical;
    setMutedNonCritical(nextMuted);
    soundManager.setMuted(nextMuted);
    showNotification(nextMuted ? 'Muted non-critical warning alarms.' : 'Unmuted alarms.');
  };

  const handleAcknowledgeAll = () => {
    const newAckState: Record<string, boolean> = { ...localAckState };
    activeAlertsList.forEach((a) => {
      newAckState[a.id] = true;
      if (acknowledgeAlert) acknowledgeAlert(a.id);
    });
    setLocalAckState(newAckState);
    soundManager.playAcknowledgeChime();
    showNotification(`Acknowledged all pending safety alerts.`);
  };

  const handleSingleAcknowledge = (id: string) => {
    setLocalAckState((prev) => ({ ...prev, [id]: true }));
    if (acknowledgeAlert) acknowledgeAlert(id);
    soundManager.playAcknowledgeChime();
    showNotification(`Alert ${id} acknowledged and moved to Resolved.`);
  };

  const handleDispatchTech = (id: string, zone: string) => {
    setDispatchedAlerts((prev) => ({ ...prev, [id]: true }));
    soundManager.playWarningBeep();
    showNotification(`Safety Tech dispatched to ${zone} for alert ${id}.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {actionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 right-8 z-50 bg-[#0F172A] text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-400/40 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-xs font-semibold">{actionMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EDE4D6] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Safety Hazard Alerts
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Prioritized real-time incident feed and safety hazard dispatch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMuteToggle}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs border ${
              mutedNonCritical
                ? 'bg-[var(--accent-strong)] text-white border-[var(--accent-strong)]'
                : 'bg-white text-[#475569] border-[#EDE4D6] hover:bg-slate-50'
            }`}
          >
            {mutedNonCritical ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{mutedNonCritical ? 'Unmute Alarms' : 'Mute Alarms'}</span>
          </button>

          <button
            onClick={handleAcknowledgeAll}
            disabled={unacknowledgedCount === 0}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[var(--accent-strong)] text-white hover:bg-[var(--accent)] disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Acknowledge All ({unacknowledgedCount})</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Filter Chips (Segmented Control) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {(['all', 'danger', 'warning', 'resolved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`
              px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap
              ${
                activeFilter === tab
                  ? 'bg-[var(--accent-strong)] text-white shadow-xs scale-105'
                  : 'bg-white text-[#64748B] border border-[#EDE4D6] hover:bg-slate-50'
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Alert Feed List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card3D className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#0F172A]">No Active Hazard Alerts</h3>
            <p className="text-xs text-[#64748B] mt-1">
              All subterranean mine safety telemetry parameters are in optimal range.
            </p>
          </Card3D>
        ) : (
          <AnimatePresence>
            {filteredAlerts.map((alert) => {
              const isAck = isAlertAck(alert.id, alert.acknowledged);
              const isDispatched = dispatchedAlerts[alert.id];

              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card3D
                    className={
                      alert.level === 'danger' && !isAck
                        ? 'border-rose-200 bg-rose-50/40'
                        : isAck
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-amber-200 bg-amber-50/30'
                    }
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                            isAck
                              ? 'bg-emerald-100 text-emerald-600'
                              : alert.level === 'danger'
                              ? 'bg-rose-100 text-rose-600 animate-pulse'
                              : 'bg-amber-100 text-amber-600'
                          }`}
                        >
                          {isAck ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#64748B]">
                              {alert.id}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                isAck
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : alert.level === 'danger'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              ● {isAck ? 'Resolved' : alert.level}
                            </span>
                            <span className="text-[11px] text-[#64748B]">
                              • {alert.category}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-[#0F172A] mt-1">
                            {alert.title}
                          </h3>

                          <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                            {alert.details}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 flex-shrink-0">
                        <span className="text-xs font-medium text-[#64748B]">
                          {alert.timestamp}
                        </span>

                        <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-full border border-[#EDE4D6] shadow-2xs">
                          <Avatar name={alert.worker} size="xs" status={isAck ? 'safe' : alert.level} />
                          <span className="text-xs font-semibold text-[#0F172A]">
                            {alert.worker} ({alert.workerJacket})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#EDE4D6] flex items-center justify-between text-xs">
                      <span className="text-[#64748B]">
                        Affected Zone: <strong className="text-[#0F172A]">{alert.zone}</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        {!isAck && (
                          <button
                            onClick={() => handleSingleAcknowledge(alert.id)}
                            className="px-3 py-1 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-full shadow-2xs cursor-pointer flex items-center gap-1.5 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Acknowledge</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDispatchTech(alert.id, alert.zone)}
                          disabled={isDispatched}
                          className={`px-3 py-1 border font-semibold rounded-full shadow-2xs cursor-pointer flex items-center gap-1.5 transition-all ${
                            isDispatched
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-800 opacity-80 cursor-default'
                              : 'bg-white border-[#FDE68A] hover:bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                          }`}
                        >
                          {isDispatched ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                          <span>{isDispatched ? 'Tech Dispatched' : 'Dispatch Safety Tech'}</span>
                        </button>
                      </div>
                    </div>
                  </Card3D>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
