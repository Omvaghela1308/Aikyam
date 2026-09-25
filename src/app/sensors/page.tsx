'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Cpu,
  Wind,
  HeartPulse,
  Thermometer,
  Radio,
  MapPin,
  BatteryCharging,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  Camera,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from 'recharts';
import Card from '@/components/ui/Card';
import SectionHeader from '@/components/ui/SectionHeader';
import PillButton from '@/components/ui/PillButton';
import { useTelemetry } from '@/context/TelemetryContext';

type SensorTab = 'all' | 'gas' | 'vitals' | 'environment' | 'radiation' | 'location';

function SensorsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as SensorTab | null;
  const [activeTab, setActiveTab] = useState<SensorTab>('all');
  const { workers, isLive } = useTelemetry();

  useEffect(() => {
    if (tabParam && ['all', 'gas', 'vitals', 'environment', 'radiation', 'location'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Compute live values from telemetry
  const maxH2S = Math.max(...workers.map((w) => w.h2s));
  const avgHR = Math.round(workers.reduce((a, b) => a + b.heartRate, 0) / (workers.length || 1));
  const avgTemp = Number((workers.reduce((a, b) => a + b.temperature, 0) / (workers.length || 1)).toFixed(1));
  const avgHum = Math.round(workers.reduce((a, b) => a + b.humidity, 0) / (workers.length || 1));
  const maxPM = Math.max(...workers.map((w) => w.pm25));
  const avgRad = Number((workers.reduce((a, b) => a + b.radiationUSv, 0) / (workers.length || 1)).toFixed(2));
  const opticalStripDetected = workers.some((w) => w.colorimetricH2SDetected);

  // Exact 12 hardware components strictly required
  const hardwareList = [
    {
      id: 'hw-h2s-elec',
      name: 'H2S Electronic Sensor',
      model: 'SPEC 3SP_H2S_50',
      category: 'gas' as const,
      value: `${maxH2S.toFixed(1)}`,
      unit: 'ppm (Peak)',
      status: maxH2S > 10 ? 'critical' : maxH2S >= 5 ? 'warning' : 'safe',
      interface: 'Amperometric Ultra-Low Power I2C',
      pins: 'SDA, SCL, 3.3V, GND (A/D 16-bit)',
      range: '0.01 - 50.0 ppm (Ceiling: 10 ppm)',
      color: '#D97706',
      trend: [
        { time: 'T-15', val: 2.1 },
        { time: 'T-10', val: 4.8 },
        { time: 'T-5', val: 7.9 },
        { time: 'Now', val: maxH2S },
      ],
    },
    {
      id: 'hw-h2s-optic',
      name: 'Colorimetric H2S Strip + Camera',
      model: 'OV2640 + Lead Acetate Strip',
      category: 'gas' as const,
      value: opticalStripDetected ? 'Dark Stain Confirmed' : 'Strip Pristine',
      unit: 'Optical HSV Index',
      status: opticalStripDetected ? 'critical' : 'safe',
      interface: 'DVP 8-bit Parallel / SCCB Interface',
      pins: 'D0-D7, PCLK, VSYNC, HREF, XCLK, 3.3V',
      range: 'Color delta E > 15 = Positive H2S Confirmation',
      color: '#F59E0B',
      trend: [
        { time: 'T-15', val: 5 },
        { time: 'T-10', val: 12 },
        { time: 'T-5', val: 45 },
        { time: 'Now', val: opticalStripDetected ? 94 : 8 },
      ],
    },
    {
      id: 'hw-vitals-max',
      name: 'MAX30102 Pulse Oximeter & HR',
      model: 'MAX30102 High-Sensitivity PPG',
      category: 'vitals' as const,
      value: `${avgHR}`,
      unit: 'bpm (98% SpO2)',
      status: avgHR > 100 || avgHR < 60 ? 'warning' : 'safe',
      interface: 'I2C Digital (Up to 400kHz)',
      pins: 'SDA, SCL, INT, VIN (1.8V core / 3.3V LED)',
      range: 'HR: 30 - 220 bpm | SpO2: 70 - 100%',
      color: '#EF4444',
      trend: [
        { time: 'T-15', val: 74 },
        { time: 'T-10', val: 76 },
        { time: 'T-5', val: 79 },
        { time: 'Now', val: avgHR },
      ],
    },
    {
      id: 'hw-env-dht',
      name: 'Temperature & Humidity Sensor',
      model: 'DHT22 / AM2302 Calibrated',
      category: 'environment' as const,
      value: `${avgTemp}°C / ${avgHum}%`,
      unit: 'Temp & RH',
      status: avgTemp > 38 ? 'critical' : avgTemp >= 34 ? 'warning' : 'safe',
      interface: 'Single-Bus Proprietary Digital Signal',
      pins: 'DATA, VCC 3.3V-5V, GND, 4.7k Pullup',
      range: '-40 to 80°C (±0.5°C) | 0-100% RH (±2%)',
      color: '#EA580C',
      trend: [
        { time: 'T-15', val: 28.2 },
        { time: 'T-10', val: 28.8 },
        { time: 'T-5', val: 29.2 },
        { time: 'Now', val: avgTemp },
      ],
    },
    {
      id: 'hw-env-pms',
      name: 'Laser Dust Particulate Sensor',
      model: 'PMS5003 Laser Particle Counter',
      category: 'environment' as const,
      value: `${maxPM.toFixed(1)}`,
      unit: 'µg/m³ PM2.5',
      status: maxPM > 75 ? 'critical' : maxPM >= 35 ? 'warning' : 'safe',
      interface: 'UART Serial (9600-8-N-1)',
      pins: 'TX, RX, RESET, SET, VCC 5V, GND',
      range: '0.3 to 10 µm dust size | 0 - 1000 µg/m³',
      color: '#CA8A04',
      trend: [
        { time: 'T-15', val: 22 },
        { time: 'T-10', val: 34 },
        { time: 'T-5', val: 48 },
        { time: 'Now', val: maxPM },
      ],
    },
    {
      id: 'hw-rad-sbm',
      name: 'SBM-20 GM Tube Radiation',
      model: 'SBM-20 Hard Beta / Gamma Tube',
      category: 'radiation' as const,
      value: `${avgRad.toFixed(2)}`,
      unit: 'µSv/h (Dosimetry)',
      status: avgRad > 0.6 ? 'critical' : avgRad >= 0.3 ? 'warning' : 'safe',
      interface: 'High-Voltage Anode with Pulse Shaper',
      pins: 'HV Anode 400V DC, Cathode GND, Interrupt Pin',
      range: '22 CPM/µR/h (Co-60) | 0.01 - 100 µSv/h',
      color: '#9333EA',
      trend: [
        { time: 'T-15', val: 0.16 },
        { time: 'T-10', val: 0.19 },
        { time: 'T-5', val: 0.21 },
        { time: 'Now', val: avgRad },
      ],
    },
    {
      id: 'hw-loc-uwb',
      name: 'UWB Positioning Transceiver',
      model: 'Decawave DWM1000 UWB',
      category: 'location' as const,
      value: '8 Anchor Nodes',
      unit: '±0.25m 3D Precision',
      status: 'safe',
      interface: 'SPI High-Speed Bus (Up to 20MHz)',
      pins: 'MOSI, MISO, SCK, CS, WAKEUP, IRQ, 3.3V',
      range: 'Sub-surface Range 150m Line-of-sight TWR',
      color: '#16A34A',
      trend: [
        { time: 'T-15', val: 98 },
        { time: 'T-10', val: 99 },
        { time: 'T-5', val: 99 },
        { time: 'Now', val: 100 },
      ],
    },
    {
      id: 'hw-infra-lora',
      name: 'LoRa Telemetry Transceiver',
      model: 'Semtech SX1276 868MHz',
      category: 'all' as const,
      value: '-74 dBm',
      unit: 'RSSI (9.4 dB SNR)',
      status: 'safe',
      interface: 'SPI Bus with DIO0 Packet Interrupt',
      pins: 'SCK, MISO, MOSI, NSS, DIO0, RST, 3.3V',
      range: 'Up to 3.5 km subterranean multi-hop gallery',
      color: '#D97706',
      trend: [
        { time: 'T-15', val: -76 },
        { time: 'T-10', val: -74 },
        { time: 'T-5', val: -72 },
        { time: 'Now', val: -74 },
      ],
    },
    {
      id: 'hw-infra-esp32',
      name: 'Jacket Edge MCU Controller',
      model: 'ESP32-WROOM-32E Dual-Core',
      category: 'all' as const,
      value: '240 MHz',
      unit: 'Dual Xtensa LX6',
      status: 'safe',
      interface: 'Integrated FreeRTOS Edge Kernel',
      pins: '36 GPIOs, 12-bit ADC, 2x UART, SPI, I2C',
      range: '4MB Flash, 520KB SRAM, Hardware Crypto',
      color: '#475569',
      trend: [
        { time: 'T-15', val: 240 },
        { time: 'T-10', val: 240 },
        { time: 'T-5', val: 240 },
        { time: 'Now', val: 240 },
      ],
    },
    {
      id: 'hw-infra-battery',
      name: 'Intrinsically Safe Battery',
      model: 'LiFePO4 3.2V 6000mAh + BMS',
      category: 'all' as const,
      value: '92%',
      unit: 'State of Charge (SOC)',
      status: 'safe',
      interface: 'I2C Smart Fuel Gauge (BQ27441)',
      pins: 'VBAT, THERM, SDA, SCL, GND',
      range: 'Non-combustible LiFePO4 chemistry (18h shift)',
      color: '#22C55E',
      trend: [
        { time: 'T-15', val: 96 },
        { time: 'T-10', val: 94 },
        { time: 'T-5', val: 93 },
        { time: 'Now', val: 92 },
      ],
    },
    {
      id: 'hw-infra-pcm',
      name: 'PCM Phase Change Cooling Vest Pack',
      model: 'RT-28HC Paraffin Phase Change Pack',
      category: 'all' as const,
      value: '21°C Latent',
      unit: '28°C Transition Point',
      status: 'safe',
      interface: 'Integrated 1-Wire DS18B20 Core Probe',
      pins: 'Direct Body Contact Ergonomic Pockets',
      range: 'Endothermic heat absorption 245 kJ/kg',
      color: '#F59E0B',
      trend: [
        { time: 'T-15', val: 18 },
        { time: 'T-10', val: 19 },
        { time: 'T-5', val: 20 },
        { time: 'Now', val: 21 },
      ],
    },
    {
      id: 'hw-infra-sos',
      name: 'Jacket Tactile SOS Lapel Button',
      model: 'IP67 Sealed Tactile Switch',
      category: 'all' as const,
      value: 'Armed / Nominal',
      unit: 'Interrupt Line Active-Low',
      status: 'safe',
      interface: 'Debounced Hardware Interrupt GPIO',
      pins: 'GPIO 04, Internal Pull-Up, 100nF Filter',
      range: 'Instant broadcast over LoRa emergency slot',
      color: '#EF4444',
      trend: [
        { time: 'T-15', val: 0 },
        { time: 'T-10', val: 0 },
        { time: 'T-5', val: 0 },
        { time: 'Now', val: 0 },
      ],
    },
  ];

  // Filtered by active tab
  const filteredHardware = hardwareList.filter((item) => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  const tabs: { id: SensorTab; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Sensors (12)', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'gas', label: 'Gas (H2S)', icon: <Wind className="w-3.5 h-3.5" /> },
    { id: 'vitals', label: 'Vitals (MAX30102)', icon: <HeartPulse className="w-3.5 h-3.5" /> },
    { id: 'environment', label: 'Environment (DHT22 + PMS5003)', icon: <Thermometer className="w-3.5 h-3.5" /> },
    { id: 'radiation', label: 'Radiation (SBM-20)', icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'location', label: 'Location (UWB)', icon: <MapPin className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Certified Hardware <span className="text-[#D97706]">Sensors & Telemetry</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#D97706] bg-[#FEF3C7] border border-[#FDE68A] px-3 py-1.5 rounded-full font-semibold">
            ● ESP32 Hardware Bus: OK
          </span>
        </div>
      </div>

      {/* Sensor Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#EDE4D6]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap
              ${
                activeTab === tab.id
                  ? 'bg-[#D97706] text-white shadow-sm'
                  : 'bg-white text-[#475569] border border-[#EDE4D6] hover:bg-[#F8FAFC]'
              }
            `}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Hardware Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredHardware.map((hw) => (
          <Card key={hw.id} variant="interactive" padding="md" className="flex flex-col justify-between">
            <div>
              {/* Header: Name and Status */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-mono text-xs font-black text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded-md border border-[#FDE68A]">
                    {hw.model}
                  </span>
                  <h3 className="text-base font-bold text-[#0F172A] mt-2">
                    {hw.name}
                  </h3>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    hw.status === 'safe'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : hw.status === 'warning'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                  }`}
                >
                  ● {hw.status}
                </span>
              </div>

              {/* Current Live Value */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#0F172A] font-mono tracking-tight">
                  {hw.value}
                </span>
                <span className="text-xs font-bold text-[#64748B]">{hw.unit}</span>
              </div>

              {/* Mini Sparkline Chart (Recharts) */}
              <div className="mt-4 h-20 w-full bg-[#F8FAFC] rounded-xl p-1 border border-[#EDE4D6]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hw.trend} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`grad-${hw.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={hw.color} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={hw.color} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #EDE4D6',
                        fontSize: '10px',
                        padding: '4px 8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="val"
                      stroke={hw.color}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={`url(#grad-${hw.id})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Hardware Specifications */}
              <div className="mt-4 pt-3 border-t border-[#EDE4D6] space-y-1.5 text-xs text-[#64748B]">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[11px] font-medium text-[#475569]">Protocol</span>
                  <span className="font-mono text-[11px] text-[#0F172A] font-semibold text-right">{hw.interface}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[11px] font-medium text-[#475569]">Hardware Bus</span>
                  <span className="font-mono text-[10px] text-[#64748B] text-right">{hw.pins}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[11px] font-medium text-[#475569]">Operating Limits</span>
                  <span className="font-mono text-[10px] text-[#D97706] font-semibold text-right">{hw.range}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-[#EDE4D6] flex items-center justify-between text-[11px]">
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Edge Calibrated
              </span>
              <span className="font-mono text-[#64748B]">Node OK</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function SensorsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#64748B]">Loading certified hardware sensors...</div>}>
      <SensorsContent />
    </Suspense>
  );
}
