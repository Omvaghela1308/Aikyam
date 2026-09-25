'use client';

import React, { useState } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';
import PillButton from '@/components/ui/PillButton';
import Avatar from '@/components/ui/Avatar';
import { useTelemetry } from '@/context/TelemetryContext';
import {
  Bell,
  AlertTriangle,
  Wind,
  ShieldAlert,
  CheckCircle2,
  Filter,
  Volume2,
  VolumeX,
  Check,
  Send,
} from 'lucide-react';
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

  const activeAlertsList = alerts.length > 0
    ? alerts.map(a => ({
        id: a.id,
        title: a.title,
        category: 'Safety Alert',
        zone: a.zone,
        level: (a.severity === 'critical' ? 'danger' : a.severity === 'warning' ? 'warning' : 'warning') as 'danger' | 'warning',
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

  const unacknowledgedCount = activeAlertsList.filter(a => !isAlertAck(a.id, a.acknowledged)).length;

  const filteredAlerts = activeAlertsList.filter((a) => {
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
    if (!nextMuted) {
      soundManager.playEmergencyAlarm(1.0);
    }
    showNotification(nextMuted ? 'Muted non-critical warning alarms.' : 'Unmuted alarms • Audio channel test siren playing.');
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
    setLocalAckState(prev => ({ ...prev, [id]: true }));
    if (acknowledgeAlert) acknowledgeAlert(id);
    soundManager.playAcknowledgeChime();
    showNotification(`Alert ${id} acknowledged successfully.`);
  };

  const handleDispatchTech = (id: string, zone: string) => {
    setDispatchedAlerts(prev => ({ ...prev, [id]: true }));
    soundManager.playWarningBeep();
    showNotification(`Safety Tech dispatched to ${zone} for alert ${id}.`);
  };

  return (
    <div className="space-y-6">
      {actionMessage && (
        <div className="fixed top-24 right-8 z-50 bg-[#0F172A] text-white px-5 py-3 rounded-2xl shadow-xl border border-amber-400/40 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{actionMessage}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Alerts
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <PillButton
            variant={mutedNonCritical ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleMuteToggle}
            icon={mutedNonCritical ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          >
            {mutedNonCritical ? 'Unmute Alarms' : 'Mute Non-Critical Alarms'}
          </PillButton>

          <PillButton
            variant="primary"
            size="sm"
            onClick={handleAcknowledgeAll}
            disabled={unacknowledgedCount === 0}
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            Acknowledge All ({unacknowledgedCount})
          </PillButton>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#EDE4D6] pb-3">
        {(['all', 'danger', 'warning', 'resolved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`
              px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors cursor-pointer
              ${
                activeFilter === tab
                  ? 'bg-[#D97706] text-white shadow-2xs'
                  : 'bg-white text-[#475569] border border-[#EDE4D6] hover:bg-[#F8FAFC]'
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Alert Feed */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#EDE4D6]">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#0F172A]">No Active Alerts</h3>
            <p className="text-xs text-[#64748B] mt-1">All subterranean mine safety telemetry parameters are in optimal range.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isAck = isAlertAck(alert.id, alert.acknowledged);
            const isDispatched = dispatchedAlerts[alert.id];

            return (
              <Card
                key={alert.id}
                variant="interactive"
                padding="md"
                className={alert.level === 'danger' && !isAck ? 'border-rose-200 bg-rose-50/20' : ''}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        isAck
                          ? 'bg-emerald-100 text-emerald-600'
                          : alert.level === 'danger'
                          ? 'bg-rose-100 text-rose-600'
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
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isAck
                              ? 'bg-emerald-100 text-emerald-700'
                              : alert.level === 'danger'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {isAck ? 'Resolved' : alert.level}
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

                  {/* Timestamp & Worker Chip */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 flex-shrink-0">
                    <span className="text-xs font-medium text-[#64748B]">
                      {alert.timestamp}
                    </span>

                    <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-full border border-[#EDE4D6]">
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
                          : 'bg-white border-[#FDE68A] hover:bg-[#FEF3C7] text-[#D97706]'
                      }`}
                    >
                      {isDispatched ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                      <span>{isDispatched ? 'Tech Dispatched' : 'Dispatch Safety Tech'}</span>
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
