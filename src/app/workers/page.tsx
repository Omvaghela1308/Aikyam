'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  HeartPulse,
  Wind,
  ShieldAlert,
  BatteryCharging,
  Activity,
  CheckCircle2,
  PhoneCall,
  HardHat,
  MapPin,
  Clock,
  ArrowRight,
  Database,
  Plus,
  Download,
  Upload,
  FileSpreadsheet,
  FileJson,
  Edit,
  Trash2,
  Save,
  X,
  UserPlus,
  Server,
  Eye,
  AlertTriangle,
  Radio,
  Zap,
  CloudFog,
  Thermometer
} from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import { useTelemetry } from '@/context/TelemetryContext';
import { useRole } from '@/context/RoleContext';
import SubterraneanWorkerMap from '@/components/dashboard/SubterraneanWorkerMap';

interface ExtendedWorkerRecord {
  id: string;
  name: string;
  jacketId: string;
  role: string;
  zone: string;
  status: 'online' | 'warning' | 'critical';
  heartRate: number;
  h2s: number;
  temperature: number;
  humidity: number;
  battery: number;
  bloodGroup: string;
  phone: string;
  shift: string;
  medicalConditions: string;
  emergencyContact: string;
  registeredDate: string;
}

export default function WorkersPage() {
  const { workers: liveWorkers, alerts, simulateJacketPacket, acknowledgeAlert } = useTelemetry();
  const { role } = useRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'warning' | 'critical'>('all');
  const [dbWorkers, setDbWorkers] = useState<ExtendedWorkerRecord[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);

  const selectedWorker = liveWorkers.find(
    (w) => w.id === selectedWorkerId || w.name.toLowerCase() === selectedWorkerId?.toLowerCase()
  ) || (selectedWorkerId ? liveWorkers[0] : null);

  const selectedDbRecord = dbWorkers.find(
    (d) => d.id === selectedWorker?.id || d.name.toLowerCase() === selectedWorker?.name.toLowerCase()
  );

  const selectedWorkerAlerts = alerts.filter(
    (a) =>
      a.workerId === selectedWorker?.id ||
      a.workerName === selectedWorker?.name ||
      a.zone === selectedWorker?.zone
  );

  // New Worker Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    jacketId: '',
    role: 'Underground Heavy Miner',
    zone: 'Deep Incline Shaft 4',
    bloodGroup: 'O+',
    phone: '+91 98765 43210',
    shift: 'Shift A (06:00 - 14:00)',
    medicalConditions: 'None (Fit for Deep Mining)',
    emergencyContact: '+91 98765 00000',
  });

  // Load from LocalStorage DB on mount
  useEffect(() => {
    const savedDB = localStorage.getItem('mineguard_workers_db');
    if (savedDB) {
      try {
        setDbWorkers(JSON.parse(savedDB));
        return;
      } catch (e) {
        console.error('Failed to parse workers DB', e);
      }
    }

    // Default seed database matching telemetry workers
    const seedRecords: ExtendedWorkerRecord[] = [
      {
        id: 'WKR-101',
        name: 'Rajesh Kumar',
        jacketId: 'SJ-001',
        role: 'Senior Excavation Operator',
        zone: 'Deep Incline Shaft 4',
        status: 'online',
        heartRate: 74,
        h2s: 3.2,
        temperature: 24.5,
        humidity: 62,
        battery: 94,
        bloodGroup: 'B+',
        phone: '+91 98765 11001',
        shift: 'Morning Shift A',
        medicalConditions: 'None (Passed Annual Fitness)',
        emergencyContact: '+91 98765 99001',
        registeredDate: '2025-01-15',
      },
      {
        id: 'WKR-102',
        name: 'Amit Sharma',
        jacketId: 'SJ-002',
        role: 'Roof Bolting & Shoring Technician',
        zone: 'Shaft 2 Tunnel Junction',
        status: 'warning',
        heartRate: 88,
        h2s: 14.5,
        temperature: 27.1,
        humidity: 68,
        battery: 81,
        bloodGroup: 'O+',
        phone: '+91 98765 11002',
        shift: 'Morning Shift A',
        medicalConditions: 'Mild Asthma (Inhaler Assigned)',
        emergencyContact: '+91 98765 99002',
        registeredDate: '2025-02-01',
      },
      {
        id: 'WKR-103',
        name: 'Suresh Patel',
        jacketId: 'SJ-004',
        role: 'Methane Ventilation Technician',
        zone: 'Shaft 3 Extraction Chamber',
        status: 'online',
        heartRate: 71,
        h2s: 2.1,
        temperature: 23.8,
        humidity: 60,
        battery: 98,
        bloodGroup: 'A+',
        phone: '+91 98765 11003',
        shift: 'Afternoon Shift B',
        medicalConditions: 'None',
        emergencyContact: '+91 98765 99003',
        registeredDate: '2025-02-10',
      },
      {
        id: 'WKR-104',
        name: 'Vikram Singh',
        jacketId: 'SJ-005',
        role: 'Heavy Machinery & Loader Specialist',
        zone: 'North Mine Drift Sector 1',
        status: 'online',
        heartRate: 76,
        h2s: 4.8,
        temperature: 25.2,
        humidity: 64,
        battery: 89,
        bloodGroup: 'AB+',
        phone: '+91 98765 11004',
        shift: 'Morning Shift A',
        medicalConditions: 'None',
        emergencyContact: '+91 98765 99004',
        registeredDate: '2025-02-20',
      },
      {
        id: 'WKR-105',
        name: 'Deepak Verma',
        jacketId: 'SJ-006',
        role: 'Subterranean Electrical & Lighting Engineer',
        zone: 'Substation Level 3',
        status: 'online',
        heartRate: 69,
        h2s: 1.5,
        temperature: 22.9,
        humidity: 58,
        battery: 92,
        bloodGroup: 'O-',
        phone: '+91 98765 11005',
        shift: 'Night Shift C',
        medicalConditions: 'Controlled Blood Pressure',
        emergencyContact: '+91 98765 99005',
        registeredDate: '2025-03-01',
      },
      {
        id: 'WKR-106',
        name: 'Manoj Tiwari',
        jacketId: 'SJ-008',
        role: 'Conveyor System Maintenance Specialist',
        zone: 'Shaft 4 Main Incline',
        status: 'online',
        heartRate: 75,
        h2s: 3.0,
        temperature: 24.1,
        humidity: 61,
        battery: 87,
        bloodGroup: 'B-',
        phone: '+91 98765 11006',
        shift: 'Afternoon Shift B',
        medicalConditions: 'None',
        emergencyContact: '+91 98765 99006',
        registeredDate: '2025-03-05',
      },
    ];

    setDbWorkers(seedRecords);
    localStorage.setItem('mineguard_workers_db', JSON.stringify(seedRecords));
  }, []);

  // Save to LocalStorage whenever DB state updates
  const saveToStorage = (updated: ExtendedWorkerRecord[]) => {
    setDbWorkers(updated);
    localStorage.setItem('mineguard_workers_db', JSON.stringify(updated));
  };

  // Add new worker record
  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    const newWorker: ExtendedWorkerRecord = {
      id: formData.id || `WKR-${100 + dbWorkers.length + 1}`,
      name: formData.name,
      jacketId: formData.jacketId || `SJ-0${dbWorkers.length + 10}`,
      role: formData.role,
      zone: formData.zone,
      status: 'online',
      heartRate: 72,
      h2s: 2.0,
      temperature: 24.0,
      humidity: 60,
      battery: 100,
      bloodGroup: formData.bloodGroup,
      phone: formData.phone,
      shift: formData.shift,
      medicalConditions: formData.medicalConditions,
      emergencyContact: formData.emergencyContact,
      registeredDate: new Date().toISOString().split('T')[0],
    };

    const updated = [newWorker, ...dbWorkers];
    saveToStorage(updated);
    setIsAddModalOpen(false);
    setFormData({
      id: '',
      name: '',
      jacketId: '',
      role: 'Underground Heavy Miner',
      zone: 'Deep Incline Shaft 4',
      bloodGroup: 'O+',
      phone: '+91 98765 43210',
      shift: 'Shift A (06:00 - 14:00)',
      medicalConditions: 'None (Fit for Deep Mining)',
      emergencyContact: '+91 98765 00000',
    });
  };

  // Delete worker record
  const handleDeleteWorker = (id: string) => {
    if (confirm(`Are you sure you want to delete worker record ${id} from database storage?`)) {
      const updated = dbWorkers.filter((w) => w.id !== id);
      saveToStorage(updated);
    }
  };

  // Export database as JSON file
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dbWorkers, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mineguard_workers_db_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export database as CSV file
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Role', 'Zone', 'JacketID', 'BloodGroup', 'Phone', 'EmergencyContact', 'Shift', 'MedicalConditions', 'RegisteredDate'];
    const rows = dbWorkers.map(w => [
      w.id,
      `"${w.name}"`,
      `"${w.role}"`,
      `"${w.zone}"`,
      w.jacketId,
      w.bloodGroup,
      w.phone,
      w.emergencyContact,
      `"${w.shift}"`,
      `"${w.medicalConditions}"`,
      w.registeredDate
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `mineguard_workers_db_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredDB = dbWorkers.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.role.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && w.status === statusFilter;
  });

  if (role === 'Worker') {
    const myWorker = liveWorkers.find((w) => w.id === 'W1026' || w.jacketId === 'SJ-003') || liveWorkers[0];
    const myAlerts = alerts.filter(
      (a) => a.workerId === myWorker.id || a.workerName === myWorker.name || a.zone === myWorker.zone
    );

    return (
      <div className="space-y-6 pb-12">
        {/* Worker Personal Header Banner (Matching Home Page) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-amber-50 via-slate-50 to-emerald-50 rounded-3xl border border-[#FDE68A]/60 shadow-xs">
          <div className="flex items-center gap-4">
            <Avatar name={myWorker.name} role={myWorker.role} size="lg" status={myWorker.status === 'online' ? 'safe' : myWorker.status === 'critical' ? 'danger' : 'warning'} />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">Sensor Data</h1>
            </div>
          </div>
        </div>

        {/* Smart Jacket Real-Time Sensor Telemetry Matrix */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 tracking-tight">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                  <Activity className="w-5 h-5" />
                </div>
                Smart Jacket Hardware & Real-Time Sensor Telemetry
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Real-time telemetry, ESP32 microcontroller status, gas sensor cluster & biometrics stream for {myWorker.name} ({myWorker.jacketId})
              </p>
            </div>
          </div>

          {/* Primary Telemetry Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* H2S Gas */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-amber-50 via-white to-amber-50/50 border border-amber-200/80 shadow-[0_4px_12px_rgba(217,119,6,0.06),_inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(217,119,6,0.15)] hover:border-amber-300 flex flex-col justify-between group">
              <div className="flex items-center justify-between text-amber-800">
                <span className="text-xs font-bold uppercase tracking-wide">H₂S Gas</span>
                <div className="p-1 rounded-md bg-amber-100 text-amber-600 group-hover:rotate-12 transition-transform">
                  <Wind className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2">
                <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">{myWorker.h2s.toFixed(1)}</span>
                <span className="text-xs text-slate-500 ml-1 font-semibold">ppm</span>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md inline-block text-center border border-amber-200/60">
                {myWorker.colorimetricH2SDetected ? '⚠️ Strip Discolored' : '✓ MQ-136 Safe'}
              </span>
            </div>

            {/* Heart Rate */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-rose-50 via-white to-rose-50/50 border border-rose-200/80 shadow-[0_4px_12px_rgba(244,63,94,0.06),_inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(244,63,94,0.15)] hover:border-rose-300 flex flex-col justify-between group">
              <div className="flex items-center justify-between text-rose-800">
                <span className="text-xs font-bold uppercase tracking-wide">Heart Rate</span>
                <div className="p-1 rounded-md bg-rose-100 text-rose-600 group-hover:scale-125 transition-transform">
                  <HeartPulse className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2">
                <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">{myWorker.heartRate}</span>
                <span className="text-xs text-slate-500 ml-1 font-semibold">bpm</span>
              </div>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md inline-block text-center border border-rose-200/60">
                MAX30102 PPG Optical
              </span>
            </div>

            {/* Temp & Humidity */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-amber-50 via-white to-amber-50/50 border border-amber-200/80 shadow-[0_4px_12px_rgba(245,158,11,0.06),_inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(245,158,11,0.15)] hover:border-amber-300 flex flex-col justify-between group">
              <div className="flex items-center justify-between text-amber-800">
                <span className="text-xs font-bold uppercase tracking-wide">Ambient Temp</span>
                <div className="p-1 rounded-md bg-amber-100 text-amber-600 group-hover:scale-110 transition-transform">
                  <Thermometer className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2">
                <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">{myWorker.temperature}°C</span>
                <span className="text-[11px] text-amber-800 block font-semibold">{myWorker.humidity}% Humidity</span>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md inline-block text-center border border-amber-200/60">
                DHT22 Dual Sensor
              </span>
            </div>

            {/* Dust PM2.5 */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-slate-100 via-white to-slate-100/50 border border-slate-300/80 shadow-[0_4px_12px_rgba(100,116,139,0.06),_inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(100,116,139,0.15)] hover:border-slate-400 flex flex-col justify-between group">
              <div className="flex items-center justify-between text-slate-800">
                <span className="text-xs font-bold uppercase tracking-wide">Dust PM2.5</span>
                <div className="p-1 rounded-md bg-slate-200 text-slate-700 group-hover:scale-110 transition-transform">
                  <CloudFog className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2">
                <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">{myWorker.pm25}</span>
                <span className="text-xs text-slate-500 ml-1 font-semibold">µg/m³</span>
              </div>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded-md inline-block text-center border border-slate-300/60">
                SDS011 Optical Dust
              </span>
            </div>

            {/* Battery & Cooling */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-emerald-50 via-white to-emerald-50/50 border border-emerald-200/80 shadow-[0_4px_12px_rgba(16,185,129,0.06),_inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(16,185,129,0.15)] hover:border-emerald-300 flex flex-col justify-between group">
              <div className="flex items-center justify-between text-emerald-800">
                <span className="text-xs font-bold uppercase tracking-wide">Battery Power</span>
                <div className="p-1 rounded-md bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">
                  <BatteryCharging className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2">
                <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">{myWorker.battery}%</span>
                <span className="text-[11px] text-emerald-700 block font-semibold">PCM Cooling (18°C)</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md inline-block text-center border border-emerald-200/60">
                LiFePO4 Safe Cell
              </span>
            </div>

            {/* LoRa / UWB Signal */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-purple-50 via-white to-purple-50/50 border border-purple-200/80 shadow-[0_4px_12px_rgba(168,85,247,0.06),_inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(168,85,247,0.15)] hover:border-purple-300 flex flex-col justify-between group">
              <div className="flex items-center justify-between text-purple-800">
                <span className="text-xs font-bold uppercase tracking-wide">LoRa / UWB</span>
                <div className="p-1 rounded-md bg-purple-100 text-purple-600 group-hover:rotate-45 transition-transform">
                  <Radio className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2">
                <span className="text-xl font-black text-slate-900 font-mono tracking-tight">{myWorker.loraRSSI} dBm</span>
                <span className="text-[10px] font-mono text-purple-700 block mt-0.5">({myWorker.uwbX}m, {myWorker.uwbY}m)</span>
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-md inline-block text-center border border-purple-200/60">
                SX1276 Mesh Mesh
              </span>
            </div>
          </div>

          {/* Embedded Hardware Architecture & Sub-System Modules */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Server className="w-4 h-4 text-amber-600" />
                  Hardware Architecture & Bus Sub-Systems
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">ESP32-WROOM node parameters and peripheral hardware diagnostic states</p>
              </div>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-md border border-slate-200/80">
                3 Hardware Bus Nodes Connected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Microcontroller & Power Unit */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-[0_8px_20px_rgba(15,23,42,0.05)] hover:shadow-[0_16px_32px_rgba(245,158,11,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900 text-xs">Microcontroller & Power</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Main Controller</span> <span className="font-semibold text-slate-900 font-mono">ESP32-WROOM-32U</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Firmware Build</span> <span className="font-semibold text-amber-600 font-mono">v2.4.1 (OTA)</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Power Cell</span> <span className="font-semibold text-emerald-700 font-mono">3.7V 1000mAh LiFePO4</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Est. Battery Life</span> <span className="font-semibold text-slate-800">14.2 Hours</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Energy Harvesting</span> <span className="font-medium text-slate-700">Solar Micro-Cell</span></div>
                </div>
              </div>

              {/* Multi-Gas Sensor Cluster */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-[0_8px_20px_rgba(15,23,42,0.05)] hover:shadow-[0_16px_32px_rgba(217,119,6,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                      <Wind className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900 text-xs">Multi-Gas Sensor Array</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Calibrated
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">H₂S Elec. Node</span> <span className="font-semibold text-amber-700 font-mono">{myWorker.h2s.toFixed(1)} ppm (MQ-136)</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Methane CH₄</span> <span className="font-semibold text-slate-800 font-mono">0.04% VOL</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Carbon Monoxide</span> <span className="font-semibold text-slate-800 font-mono">2.0 ppm</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Oxygen Concentration</span> <span className="font-semibold text-emerald-700 font-mono">20.9% (Optimal)</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Optic Reagent Strip</span> <span className="font-medium text-emerald-700">Intact / Safe</span></div>
                </div>
              </div>

              {/* Biometrics & Motion IMU */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-[0_8px_20px_rgba(15,23,42,0.05)] hover:shadow-[0_16px_32px_rgba(244,63,94,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900 text-xs">Biometrics & Motion IMU</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-purple-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                    Active
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Pulse Rate</span> <span className="font-semibold text-rose-600 font-mono">{myWorker.heartRate} bpm (MAX30102)</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">SpO₂ Blood Oxygen</span> <span className="font-semibold text-emerald-700 font-mono">99% (Normal)</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Skin Temperature</span> <span className="font-semibold text-amber-700 font-mono">36.8°C</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">6-Axis Motion Sensor</span> <span className="font-semibold text-slate-800 font-mono">MPU6050</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Worker Motion State</span> <span className="font-medium text-emerald-700">Active Work / Walking</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Sensor Calibration & Packet Stream Log Table */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-600" />
                  Telemetry Packet Stream & Calibration Logs
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Live incoming sensor payloads, signal strength & hardware verification</p>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-md border border-slate-200/80 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Auto-Syncing Telemetry
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200/80 tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Ingest Time</th>
                      <th className="py-3 px-4">Sensor Node</th>
                      <th className="py-3 px-4 font-mono">Raw Payload</th>
                      <th className="py-3 px-4">Calibrated Reading</th>
                      <th className="py-3 px-4 font-mono">Signal (RSSI)</th>
                      <th className="py-3 px-4">Diagnostic Health</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    <tr className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-medium">Just now</td>
                      <td className="py-3 px-4 font-bold text-amber-700">MQ-136 (H₂S)</td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">0x03E8 / 1.8V ADC</td>
                      <td className="py-3 px-4 font-bold text-slate-900 font-mono">{myWorker.h2s.toFixed(1)} ppm</td>
                      <td className="py-3 px-4 font-mono text-purple-700 font-semibold">{myWorker.loraRSSI} dBm</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Calibrated Safe
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-medium">10s ago</td>
                      <td className="py-3 px-4 font-bold text-rose-600">MAX30102 (Pulse)</td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">PPG IR 48200</td>
                      <td className="py-3 px-4 font-bold text-slate-900 font-mono">{myWorker.heartRate} bpm</td>
                      <td className="py-3 px-4 font-mono text-purple-700 font-semibold">{myWorker.loraRSSI} dBm</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Optimal Signal
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-medium">25s ago</td>
                      <td className="py-3 px-4 font-bold text-amber-600">DHT22 (Ambient)</td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">0x01A8 / 62% RH</td>
                      <td className="py-3 px-4 font-bold text-slate-900 font-mono">{myWorker.temperature}°C / {myWorker.humidity}% RH</td>
                      <td className="py-3 px-4 font-mono text-purple-700 font-semibold">{myWorker.loraRSSI} dBm</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active Sync
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-medium">40s ago</td>
                      <td className="py-3 px-4 font-bold text-orange-600">DW1000 (UWB)</td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">TOF Anchor #4 42.5m</td>
                      <td className="py-3 px-4 font-bold text-slate-900 font-mono">({myWorker.uwbX}m, {myWorker.uwbY}m)</td>
                      <td className="py-3 px-4 font-mono text-purple-700 font-semibold">{myWorker.loraRSSI} dBm</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                          Position Sync
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* NEW ADDITION (AT THE VERY BOTTOM): Shift Gas Exposure Tracker */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Shift Cumulative Gas & Dust Exposure (8-Hr TWA)</h3>
                <p className="text-[11px] text-slate-500">Calculated Time-Weighted Average against DGMS Underground Safety Limits</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* H2S Exposure */}
            <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">H₂S Cumulative Dose</span>
                <span className="font-mono font-bold text-amber-700">1.8 ppm / 10.0 ppm Limit</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '18%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Safe Operational Level</span>
                <span>18% Limit</span>
              </div>
            </div>

            {/* Methane CH4 Exposure */}
            <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Methane (CH₄) LEL</span>
                <span className="font-mono font-bold text-emerald-700">0.04% VOL / 0.75% Limit</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '6%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Well Below LEL Trigger</span>
                <span>6% Limit</span>
              </div>
            </div>

            {/* Dust Exposure */}
            <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Respirable Dust PM2.5 Intake</span>
                <span className="font-mono font-bold text-amber-700">27.2 µg/m³ / 150 µg/m³ Limit</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '18%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Good Airflow Rate</span>
                <span>18% Limit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-amber-50 via-slate-50 to-emerald-50 rounded-3xl border border-[#FDE68A]/60 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">Workers</h1>
          </div>
        </div>

        {/* Action: Add Worker Modal */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-600/30 border border-emerald-300/40 transition-all cursor-pointer flex items-center gap-2 transform hover:scale-[1.03] active:scale-[0.97]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Worker</span>
          </button>
        </div>
      </div>


      {/* Combined Unified Personnel Database & Live Telemetry Master Register */}
      <Card padding="lg" className="bg-white border-[#EDE4D6] shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <SectionHeader
            title="Personnel Database Records & Live Telemetry Register"
            highlightWord="Database Records & Live Telemetry"
            subtitle="Master underground storage register combining permanent personnel records, emergency logs, and real-time smart jacket telemetry"
            showAction={false}
          />

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, ID, zone, jacket..."
                className="pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-xs text-[#0F172A] border border-[#EDE4D6] focus:outline-none focus:border-[#D97706] shadow-2xs w-full sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 border border-[#EDE4D6] text-[#0F172A] focus:outline-none shadow-2xs cursor-pointer"
            >
              <option value="all">All Status ({dbWorkers.length})</option>
              <option value="online">Normal Safe</option>
              <option value="warning">Warning / Elevated</option>
              <option value="critical">Critical / SOS</option>
            </select>
          </div>
        </div>

        {/* Unified Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left text-xs text-[#0F172A]">
            <thead className="bg-[#F8FAFC] text-[#64748B] font-bold uppercase tracking-wider text-[10px] border-b border-[#EDE4D6]">
              <tr>
                <th className="p-3.5">Worker Identity & ID</th>
                <th className="p-3.5">Role & Zone</th>
                <th className="p-3.5">Smart Jacket & Status</th>
                <th className="p-3.5">Live Telemetry & Vitals</th>
                <th className="p-3.5">Blood & Emergency ICE</th>
                <th className="p-3.5">Shift & Medical Notes</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE4D6]">
              {filteredDB.map((worker) => (
                <tr
                  key={worker.id}
                  className="hover:bg-amber-50/50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedWorkerId(worker.id)}
                >
                  {/* Worker Identity */}
                  <td className="p-3.5 font-semibold">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={worker.name}
                        role={worker.role}
                        size="md"
                        status={worker.status === 'critical' ? 'danger' : worker.status === 'warning' ? 'warning' : 'safe'}
                      />
                      <div>
                        <div className="font-bold text-[#0F172A] flex items-center gap-1.5 text-sm">
                          <span>{worker.name}</span>
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-[#D97706] border border-amber-200">
                            {worker.id}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#64748B] font-mono">Reg: {worker.registeredDate}</span>
                      </div>
                    </div>
                  </td>

                  {/* Role & Sector */}
                  <td className="p-3.5">
                    <div className="font-bold text-slate-800">{worker.role}</div>
                    <div className="text-[11px] text-[#D97706] font-semibold flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span>{worker.zone}</span>
                    </div>
                  </td>

                  {/* Smart Jacket & Live Status */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800 text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {worker.jacketId}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full capitalize ${
                          worker.status === 'critical'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                            : worker.status === 'warning'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {worker.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                      <BatteryCharging className="w-3 h-3" />
                      <span>{worker.battery}% Battery</span>
                    </div>
                  </td>

                  {/* Live Telemetry & Vitals */}
                  <td className="p-3.5">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                      <div className="flex items-center gap-1 font-mono font-bold text-rose-600">
                        <HeartPulse className="w-3.5 h-3.5" />
                        <span>{worker.heartRate} bpm</span>
                      </div>
                      <div
                        className={`flex items-center gap-1 font-mono font-bold ${
                          worker.h2s > 10 ? 'text-rose-600 animate-pulse' : worker.h2s > 5 ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      >
                        <Wind className="w-3.5 h-3.5" />
                        <span>{worker.h2s} ppm H₂S</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono col-span-2">
                        {worker.temperature}°C • {worker.humidity}% RH
                      </div>
                    </div>
                  </td>

                  {/* Blood & Emergency Contact */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded">
                        {worker.bloodGroup}
                      </span>
                      <span className="font-mono text-[11px] text-slate-700">{worker.phone}</span>
                    </div>
                    <span className="text-[10px] text-[#64748B] block mt-0.5">ICE: {worker.emergencyContact}</span>
                  </td>

                  {/* Shift & Medical Notes */}
                  <td className="p-3.5 max-w-xs">
                    <span className="font-semibold text-slate-800 block">{worker.shift}</span>
                    <span className="text-[10px] text-slate-500 truncate block">{worker.medicalConditions}</span>
                  </td>

                  {/* Action Buttons */}
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWorkerId(worker.id);
                        }}
                        className="px-3 py-1.5 text-[11px] font-bold rounded-xl bg-amber-50 hover:bg-[#D97706] text-[#D97706] hover:text-white border border-amber-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Slidebar</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorker(worker.id);
                        }}
                        className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete from Database"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add New Worker Modal Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#EDE4D6] space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE4D6]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-black text-[#0F172A]">Register New Worker to Database</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWorker} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">Worker ID</label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="e.g. WKR-107"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#D97706]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">Assigned Role</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">Smart Jacket Serial ID</label>
                  <input
                    type="text"
                    required
                    value={formData.jacketId}
                    onChange={(e) => setFormData({ ...formData, jacketId: e.target.value })}
                    placeholder="e.g. SJ-020"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#D97706]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">Mine Sector / Zone</label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#D97706]"
                  >
                    <option value="Deep Incline Shaft 4">Deep Incline Shaft 4</option>
                    <option value="Shaft 2 Tunnel Junction">Shaft 2 Tunnel Junction</option>
                    <option value="Shaft 3 Extraction Chamber">Shaft 3 Extraction Chamber</option>
                    <option value="North Mine Drift Sector 1">North Mine Drift Sector 1</option>
                    <option value="Substation Level 3">Substation Level 3</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#D97706]"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#0F172A] block mb-1">Emergency Contact (ICE)</label>
                  <input
                    type="text"
                    required
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#D97706]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#0F172A] block mb-1">Medical Conditions / Notes</label>
                <input
                  type="text"
                  value={formData.medicalConditions}
                  onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#D97706]"
                />
              </div>

              <div className="pt-3 border-t border-[#EDE4D6] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Record to Storage</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Worker Live Sensor & Alert Details Sliding Drawer */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setSelectedWorkerId(null)}
          />

          {/* Sliding Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between">
              
              {/* Drawer Header */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <Avatar name={selectedWorker.name} role={selectedWorker.role} size="md" status={selectedWorker.status === 'critical' ? 'danger' : selectedWorker.status === 'warning' ? 'warning' : 'safe'} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black tracking-tight text-white">{selectedWorker.name}</h2>
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                        {selectedWorker.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                      {selectedWorker.role} • Jacket: {selectedWorker.jacketId}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedWorkerId(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                
                {/* Compact Status Banner */}
                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                  selectedWorker.sosActive || selectedWorker.status === 'critical'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : selectedWorker.status === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span>{selectedWorker.sosActive ? 'EMERGENCY SOS ACTIVE' : `Safety Status: ${selectedWorker.status.toUpperCase()}`}</span>
                  </div>
                  <span className="font-mono text-[10px] font-semibold opacity-75">
                    Sector: {selectedWorker.zone}
                  </span>
                </div>

                {/* Key Vitals (Compact 4-Grid) */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  {/* Heart Rate */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-[10px] font-bold uppercase">Heart Rate</span>
                      <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <div className="text-base font-black font-mono text-rose-600">
                      {selectedWorker.heartRate} <span className="text-[10px] font-normal text-slate-500">bpm</span>
                    </div>
                  </div>

                  {/* H2S Gas */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-[10px] font-bold uppercase">H₂S Gas</span>
                      <Wind className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className={`text-base font-black font-mono ${selectedWorker.h2s > 10 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {selectedWorker.h2s.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">ppm</span>
                    </div>
                  </div>

                  {/* Ambient Temp */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-[10px] font-bold uppercase">Temp & Humidity</span>
                      <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="text-base font-black font-mono text-slate-900">
                      {selectedWorker.temperature.toFixed(1)}°C <span className="text-[10px] font-normal text-slate-500">({selectedWorker.humidity.toFixed(0)}% RH)</span>
                    </div>
                  </div>

                  {/* Battery */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-[10px] font-bold uppercase">Jacket Battery</span>
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="text-base font-black font-mono text-emerald-600">
                      {selectedWorker.battery}%
                    </div>
                  </div>
                </div>

                {/* Emergency Contact & Medical Info */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Emergency & ICE Contact</span>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      Blood: {selectedDbRecord?.bloodGroup || 'O+'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 text-[11px]">
                    <span>Phone: <span className="font-mono font-semibold">{selectedDbRecord?.phone || '+91 98765 11001'}</span></span>
                    <span>ICE: <span className="font-mono font-semibold">{selectedDbRecord?.emergencyContact || '+91 98765 99001'}</span></span>
                  </div>
                </div>

                {/* Active Alerts (Shown only if alerts exist) */}
                {selectedWorkerAlerts.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-rose-600">Active Safety Alerts</span>
                    <div className="space-y-1.5">
                      {selectedWorkerAlerts.map((alert) => (
                        <div key={alert.id} className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs flex items-center justify-between">
                          <span className="font-bold text-rose-900">{alert.title}</span>
                          {!alert.acknowledged ? (
                            <button
                              type="button"
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                            >
                              Acknowledge
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600">Acknowledged</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-3.5 bg-white border-t border-slate-200 flex items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedWorkerId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Close
                </button>

                <Link
                  href="/analysis"
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#D97706] hover:bg-[#B45309] text-white transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>View 24h Analysis</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
