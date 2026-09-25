'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LifeBuoy,
  ShieldAlert,
  Radio,
  Wifi,
  Cpu,
  PhoneCall,
  UserCheck,
  AlertTriangle,
  Zap,
  MapPin,
  HeartPulse,
  Wind,
  BatteryCharging,
  CheckCircle2,
  RefreshCw,
  Clock,
  HardHat,
  Search,
  ExternalLink,
  Users,
  Eye,
  Activity,
  X,
  CloudFog,
  Thermometer
} from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import { useTelemetry } from '@/context/TelemetryContext';
import { useRole } from '@/context/RoleContext';
import JacketConnectModal from '@/components/jacket/JacketConnectModal';
import SubterraneanWorkerMap from '@/components/dashboard/SubterraneanWorkerMap';

// Rescue team roster data with comprehensive gear, O2 levels, telemetry, and duty logs
const rescueTeamMembers = [
  {
    id: 'RSC-101',
    name: 'Underground Worker',
    role: 'Drill Operator',
    specialization: 'High-Altitude & Collapse Shaft Rescue',
    status: 'active',
    zone: 'Deep Incline Shaft 4',
    depth: '-320m Shaft Depth',
    jacketId: 'SJ-003',
    battery: 88,
    o2Tank: '94% (280 bar SCBA)',
    meshSignal: '-64 dBm (99.8% RSSI)',
    shiftTime: 'Shift A • 6h 15m on duty',
    missionsCompleted: '5 Shaft Evacuations',
    bloodPressure: '118/78 mmHg',
    spo2: '99%',
    lastPing: '2s ago',
    equipment: ['SCBA Rebreather (4h)', 'UWB Beacon', 'Hydraulic Spreader', 'Gas Quad-Monitor'],
    vitals: 'Heart 76 bpm • Temp 36.8°C',
    certification: 'Level III HazMat & Mine Evacuation (Valid 2028)',
    phone: '+91 98765 43210'
  },
  {
    id: 'RSC-102',
    name: 'Major Suresh Rawat',
    role: 'Toxic Gas & Ventilation Medic',
    specialization: 'H2S Neutralization & Traumatic Care',
    status: 'standby',
    zone: 'Shaft 2 Command Outpost',
    depth: '-180m Base Command',
    jacketId: 'SJ-007',
    battery: 95,
    o2Tank: '98% (295 bar SCBA)',
    meshSignal: '-58 dBm (100% RSSI)',
    shiftTime: 'Shift A • 4h 30m on duty',
    missionsCompleted: '3 Gas Leak Clears',
    bloodPressure: '122/80 mmHg',
    spo2: '98%',
    lastPing: '1s ago',
    equipment: ['Multi-Gas Detector', 'O2 Resuscitator Kit', 'Thermal Imager', 'Air Purifier Unit'],
    vitals: 'Heart 68 bpm • Temp 36.6°C',
    certification: 'Advanced Wilderness EMT & Heavy Extraction',
    phone: '+91 98765 43211'
  },
  {
    id: 'RSC-103',
    name: 'Captain Anita Desai',
    role: 'Underground Structural & Rigging Specialist',
    specialization: 'Roof Bolting & Trench Shoring',
    status: 'active',
    zone: 'Shaft 3 Pit Junction',
    depth: '-245m Cave Sector',
    jacketId: 'SJ-009',
    battery: 82,
    o2Tank: '89% (265 bar SCBA)',
    meshSignal: '-72 dBm (97.5% RSSI)',
    shiftTime: 'Shift B • 3h 10m on duty',
    missionsCompleted: '6 Structural Bolts',
    bloodPressure: '120/79 mmHg',
    spo2: '99%',
    lastPing: '4s ago',
    equipment: ['LoRa Mesh Transceiver', 'Heavy Winch System', 'Acoustic Lifelock', 'Laser Distance Meter'],
    vitals: 'Heart 74 bpm • Temp 36.9°C',
    certification: 'Mine Safety Directorate Certified Extraction Expert',
    phone: '+91 98765 43212'
  },
  {
    id: 'RSC-104',
    name: 'Vikram Choudhary',
    role: 'Subterranean Drone & Sensor Operator',
    specialization: 'Robotic Tunnel Reconnaissance',
    status: 'ready',
    zone: 'Surface Rescue Hub',
    depth: '0m Surface Command',
    jacketId: 'SJ-012',
    battery: 100,
    o2Tank: '100% (300 bar Reserve)',
    meshSignal: '-45 dBm (Strong Sub-GHz)',
    shiftTime: 'Shift A • 5h 00m on duty',
    missionsCompleted: '12 Recon Flights',
    bloodPressure: '115/75 mmHg',
    spo2: '100%',
    lastPing: '0s ago',
    equipment: ['Thermal Recon Drone', 'Sub-GHz Repeater', 'Gas Mapper', 'HD FPV Goggles'],
    vitals: 'Heart 70 bpm • Temp 36.5°C',
    certification: 'DGCA Commercial Drone & Mine Recon Specialist',
    phone: '+91 98765 43213'
  },
  {
    id: 'RSC-105',
    name: 'Dr. Neha Kulkarni',
    role: 'Hyperbaric & Subterranean Physician',
    specialization: 'High-Pressure Oxygen & Decompression Trauma',
    status: 'active',
    zone: 'Underground Field Clinic (Shaft 4)',
    depth: '-310m Medical Bay',
    jacketId: 'SJ-015',
    battery: 92,
    o2Tank: '96% (288 bar SCBA)',
    meshSignal: '-61 dBm (99.1% RSSI)',
    shiftTime: 'Shift B • 2h 45m on duty',
    missionsCompleted: '4 Triage Treatments',
    bloodPressure: '116/76 mmHg',
    spo2: '99%',
    lastPing: '3s ago',
    equipment: ['Portable Defibrillator', 'Plasma Expander Kit', 'Hyperbaric Chamber Link', 'Surgical Field Pack'],
    vitals: 'Heart 72 bpm • Temp 36.7°C',
    certification: 'MD Emergency Medicine & Deep Mine Trauma Fellow',
    phone: '+91 98765 43214'
  },
  {
    id: 'RSC-106',
    name: 'Inspector Rajesh Meena',
    role: 'Rapid Hazard Control & Explosives Rescue',
    specialization: 'Methane Suppression & Heavy Collapse Clearance',
    status: 'ready',
    zone: 'North Mine Tunnel Junction',
    depth: '-195m North Shaft',
    jacketId: 'SJ-018',
    battery: 89,
    o2Tank: '91% (272 bar SCBA)',
    meshSignal: '-68 dBm (98.4% RSSI)',
    shiftTime: 'Shift A • 7h 20m on duty',
    missionsCompleted: '2 Demolition Safety Checks',
    bloodPressure: '124/82 mmHg',
    spo2: '98%',
    lastPing: '1s ago',
    equipment: ['Foam Suppression Gun', 'Hydraulic Cutter', 'Explosive Gas Analyzer', 'Blast Shield'],
    vitals: 'Heart 75 bpm • Temp 36.6°C',
    certification: 'Directorate General of Mine Safety (DGMS) First Responder',
    phone: '+91 98765 43215'
  }
];

export default function RescueDashboardPage() {
  const { workers, alerts, physicalJacket, connectSerialJacket, simulateJacketPacket, acknowledgeAlert } = useTelemetry();
  const { role } = useRole();
  const [activeTab, setActiveTab] = useState<'rescue' | 'workers'>('rescue');
  const [jacketModalOpen, setJacketModalOpen] = useState(false);
  const [sosFilter, setSosFilter] = useState<'all' | 'sos' | 'ready'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [selectedRescuerId, setSelectedRescuerId] = useState<string | null>(null);

  const selectedWorker = workers.find((w) => w.id === selectedWorkerId);
  const selectedRescuer = rescueTeamMembers.find((m) => m.id === selectedRescuerId);

  const selectedWorkerAlerts = alerts.filter(
    (a) =>
      a.workerId === selectedWorker?.id ||
      a.workerName === selectedWorker?.name ||
      a.zone === selectedWorker?.zone
  );



  // Miners currently requiring emergency SOS attention
  const activeSOSMiners = workers.filter((w) => w.sosActive || w.status === 'warning');

  const filteredMembers = rescueTeamMembers.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (sosFilter === 'sos') return matchesSearch && m.status === 'active';
    if (sosFilter === 'ready') return matchesSearch && (m.status === 'ready' || m.status === 'standby');
    return matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-rose-900 via-slate-900 to-amber-900 rounded-3xl text-white shadow-lg border border-rose-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 flex-shrink-0 animate-pulse">
            <LifeBuoy className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Underground Rescue Team Command</h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Emergency Response active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency SOS Hardware Connection & Status Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Card 2: Active Emergency SOS Signals */}
        <Card variant="interactive" padding="md" className="bg-white border-[#EDE4D6]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Miners Needing Assistance ({activeSOSMiners.length})
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
              High Priority
            </span>
          </div>

          <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
            {activeSOSMiners.length > 0 ? (
              activeSOSMiners.map((miner) => (
                <div
                  key={miner.id}
                  onClick={() => setSelectedWorkerId(miner.id)}
                  className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 flex items-center justify-between text-xs cursor-pointer hover:bg-rose-100 transition-colors"
                  title="Click to view full live sensor slidebar"
                >
                  <div>
                    <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                      <span>{miner.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white border text-rose-600">{miner.jacketId}</span>
                    </div>
                    <div className="text-[10px] text-[#64748B]">{miner.zone} • Gas {miner.h2s.toFixed(1)} ppm</div>
                  </div>
                  <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-rose-600 text-white animate-pulse">
                    SOS ACTIVE
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-emerald-600 font-medium bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                All clear — No active miner SOS alerts currently
              </div>
            )}
          </div>
        </Card>

        {/* Card 3: Rescue Command Dispatch Hotlines */}
        <Card variant="interactive" padding="md" className="bg-white border-[#EDE4D6]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#D97706]" />
              Emergency Dispatch Hotline
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-[#D97706] font-bold">
              24/7 Monitored
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div>
                <div className="font-bold text-[#0F172A]">Central Surface Base</div>
                <div className="text-[10px] text-[#64748B]">Direct Radio Channel 4 (462.5625 MHz)</div>
              </div>
              <span className="font-mono font-bold text-[#D97706]">Ext #401</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div>
                <div className="font-bold text-[#0F172A]">Shaft 4 Medical Station</div>
                <div className="text-[10px] text-[#64748B]">Trauma & Hyperbaric Chamber</div>
              </div>
              <span className="font-mono font-bold text-[#D97706]">Ext #911</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Subterranean Worker & Rescuer Real-Time Location Map */}
      <SubterraneanWorkerMap
        title="Rescuer & Underground Worker Location Map"
        subtitle="Real-time Sub-GHz mesh tracking of all active rescue personnel, miners, and smart jackets"
        showAllWorkers={true}
      />

      {/* Rescue Team Personnel Section */}
      <div className="space-y-6">
        {/* Simple Clean Header Container */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-[#EDE4D6] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center flex-shrink-0">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#0F172A]">
                  Rescue Team Personnel
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  {rescueTeamMembers.length} Active
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Active rescue personnel roster, live vitals telemetry, and duty logs
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search personnel, role, ID..."
              className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] rounded-xl text-xs font-medium text-[#0F172A] border border-[#EDE4D6] focus:outline-none focus:border-[#D97706] focus:bg-white shadow-2xs transition-colors"
            />
          </div>
        </div>

        {/* Clean Simplified Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <Card
              key={member.id}
              variant="interactive"
              padding="md"
              className="bg-white border-[#EDE4D6] shadow-xs space-y-3 cursor-pointer hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between"
              onClick={() => setSelectedRescuerId(member.id)}
            >
              <div className="space-y-3">
                {/* Header: Avatar, Name, ID & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={member.name} role="Rescuer" size="md" status="safe" />
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">{member.name}</h3>
                      <p className="text-xs text-[#64748B]">{member.role}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    member.status === 'active'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    ● {member.status}
                  </span>
                </div>

                {/* Sector & Telemetry Summary Box */}
                <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#EDE4D6] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#64748B] block font-medium">Sector & Depth</span>
                    <span className="font-bold text-[#0F172A] truncate block">{member.zone}</span>
                    <span className="text-[10px] text-[#D97706] font-mono block">{member.depth}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] block font-medium">SCBA & Battery</span>
                    <span className="font-mono font-bold text-cyan-700 block">O₂ {member.o2Tank.split(' ')[0]}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold block">⚡ {member.battery}% Battery</span>
                  </div>
                </div>

                {/* Vitals & Shift Summary */}
                <div className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium">
                  <span>{member.vitals.split('•')[0]}</span>
                  <span className="font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-[10px]">
                    SpO₂ {member.spo2}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-[#EDE4D6] flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-mono text-[11px]">{member.phone}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRescuerId(member.id);
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3 h-3" />
                  <span>View Details</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Rescue Team Member Telemetry & Gear Sliding Drawer */}
      {selectedRescuer && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setSelectedRescuerId(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between">
              
              {/* Drawer Header */}
              <div className="p-5 bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3.5">
                  <Avatar name={selectedRescuer.name} role="Rescuer" size="lg" status="safe" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black tracking-tight text-white">{selectedRescuer.name}</h2>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-400/30">
                        {selectedRescuer.id}
                      </span>
                    </div>
                    <p className="text-xs text-rose-200 font-bold mt-0.5">
                      {selectedRescuer.role}
                    </p>
                    <p className="text-[11px] text-slate-300">
                      {selectedRescuer.specialization}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRescuerId(null)}
                  className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-slate-50/50">
                
                {/* 1. Status & Sector Location Banner */}
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                  selectedRescuer.status === 'active'
                    ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                    : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      selectedRescuer.status === 'active' ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-600 text-white'
                    }`}>
                      <LifeBuoy className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold block text-slate-500">
                        Operational Status
                      </span>
                      <span className="text-sm font-black capitalize">
                        {selectedRescuer.status === 'active' ? '● Deployed Active Emergency Duty' : '● Standby / Ready for Emergency'}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right font-mono text-xs text-slate-700 bg-white/80 px-3 py-1.5 rounded-xl border border-black/5">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Sector</span>
                    <span className="font-bold text-[#0F172A]">{selectedRescuer.zone}</span>
                    <span className="text-[10px] text-[#D97706] block font-semibold">{selectedRescuer.depth}</span>
                  </div>
                </div>

                {/* 2. SCBA Oxygen Rebreather & Hardware Telemetry */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-cyan-600" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        SCBA Oxygen Capacity
                      </span>
                    </div>
                    <span className="font-mono font-black text-cyan-700 text-xs px-2.5 py-0.5 rounded bg-cyan-50 border border-cyan-200">
                      {selectedRescuer.o2Tank}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-amber-600 h-full rounded-full transition-all"
                      style={{ width: selectedRescuer.o2Tank.split('%')[0] + '%' }}
                    />
                  </div>

                  {/* Hardware Telemetry Row */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Smart Jacket</span>
                      <span className="font-mono font-bold text-slate-900">{selectedRescuer.jacketId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Battery</span>
                      <span className="font-mono font-bold text-emerald-600">⚡ {selectedRescuer.battery}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Mesh RSSI</span>
                      <span className="font-mono font-bold text-[#D97706]">{selectedRescuer.meshSignal.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Medical Vitals (Clean 3-tile grid) */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Live Medical Vitals
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Heart Rate</span>
                      <span className="text-sm font-black text-slate-900 font-mono">{selectedRescuer.vitals.split('•')[0].replace('Heart', '').trim()}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">SpO₂ Oxygen</span>
                      <span className="text-sm font-black text-emerald-600 font-mono">{selectedRescuer.spo2}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Blood Pressure</span>
                      <span className="text-sm font-black text-rose-700 font-mono">{selectedRescuer.bloodPressure}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Assigned Emergency Tools & Equipment */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <HardHat className="w-4 h-4 text-[#D97706]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Assigned Gear & Tools
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedRescuer.equipment.map((gear: string, idx: number) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-medium border border-slate-200">
                        {gear}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 5. Duty Shift & Safety Certification */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Duty & Missions</span>
                    <span className="font-bold text-emerald-700">{selectedRescuer.shiftTime} • {selectedRescuer.missionsCompleted}</span>
                  </div>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-slate-500 font-medium">Certification</span>
                    <span className="font-bold text-slate-800 truncate max-w-[220px]">{selectedRescuer.certification}</span>
                  </div>
                </div>

              </div>

              {/* Footer Dispatch Intercom */}
              <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-slate-600 font-bold">{selectedRescuer.phone}</span>
                <a
                  href={`tel:${selectedRescuer.phone}`}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-2 shadow-md shadow-rose-600/20 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Dispatch Intercom</span>
                </a>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ESP32 Jacket Connection Modal */}
      <JacketConnectModal
        isOpen={jacketModalOpen}
        onClose={() => setJacketModalOpen(false)}
      />
    </div>
  );
}
