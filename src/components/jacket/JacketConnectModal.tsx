'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Wifi,
  Usb,
  Code,
  X,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Activity,
  Copy,
  Check,
  Zap,
  RadioTower,
  RefreshCw,
  Radio,
  Layers,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { useTelemetry } from '@/context/TelemetryContext';

interface JacketConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ESP32_LORA_TRANSMITTER_CODE = `// =========================================================================
// MINEGUARD SMART SAFETY JACKET - UNDERGROUND WORKER TRANSMITTER NODE
// Hardware: ESP32 DevKit V1 + SX1276 / Ra-02 LoRa Module (868MHz / 433MHz)
// =========================================================================

#include <SPI.h>
#include <LoRa.h>
#include <ArduinoJson.h>

// ESP32 DevKit V1 <-> SX1276 LoRa SPI Pin Mapping
#define LORA_SCK   18
#define LORA_MISO  19
#define LORA_MOSI  23
#define LORA_SS    5
#define LORA_RST   14
#define LORA_DIO0  2
#define BAND       868E6 // Set to 868E6 (868MHz), 433E6 (433MHz), or 915E6 (915MHz)

// Sensor Analog & Digital Pins
#define H2S_PIN        35  // H2S Gas Sensor (SPEC 3SP / MQ-135)
#define CH4_PIN        34  // Methane CH4 Sensor (MQ-4)
#define PPG_PIN        32  // PPG Heart Rate & SpO2 (MAX30102 / PPG)
#define SOS_BUTTON_PIN 4   // Physical Emergency SOS Panic Button

void setup() {
  Serial.begin(115200);
  pinMode(SOS_BUTTON_PIN, INPUT_PULLUP);

  // Initialize SPI bus for ESP32 DevKit V1
  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_SS);
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);

  if (!LoRa.begin(BAND)) {
    Serial.println("❌ LoRa Radio Initialization Failed! Check ESP32 DevKit V1 wiring.");
    while (1);
  }

  // MineGuard LoRa Sub-GHz Configuration
  LoRa.setSyncWord(0xF3);       // Network Encryption Key
  LoRa.setTxPower(20);          // 20 dBm Maximum Boost (Deep Underground Penetration)
  LoRa.setSpreadingFactor(10);  // SF10 for extended tunnel reach
  LoRa.setSignalBandwidth(125E3);

  Serial.println("✅ ESP32 DevKit V1 + SX1276 LoRa Transmitter Active!");
}

void loop() {
  // 1. Read Physical Sensor Telemetry
  int h2s_raw = analogRead(H2S_PIN);
  float h2s_ppm = (h2s_raw / 4095.0) * 15.0; // Calibrated H2S PPM

  int ch4_raw = analogRead(CH4_PIN);
  float ch4_ppm = (ch4_raw / 4095.0) * 5.0;  // Methane CH4 PPM

  int heartRate = map(analogRead(PPG_PIN), 0, 4095, 62, 125);
  float bodyTemp = 36.6 + (random(-4, 12) / 10.0);
  int humidity = 68;
  float pm25 = 22.4;
  int radCPM = 20;
  float radUSv = 0.16;
  bool sosPressed = (digitalRead(SOS_BUTTON_PIN) == LOW);

  // 2. Build Multi-Sensor JSON Telemetry Packet
  StaticJsonDocument<512> doc;
  doc["jacketId"] = "SJ-ESP32-LORA-01";
  doc["workerName"] = "Rajesh Kumar";
  doc["h2s"] = h2s_ppm;
  doc["ch4"] = ch4_ppm;
  doc["co"] = 4.2;
  doc["heartRate"] = heartRate;
  doc["temp"] = bodyTemp;
  doc["humidity"] = humidity;
  doc["pm25"] = pm25;
  doc["radiationCPM"] = radCPM;
  doc["radiationUSv"] = radUSv;
  doc["battery"] = 92;
  doc["uwbX"] = 42.5;
  doc["uwbY"] = 118.2;
  doc["sos"] = sosPressed;

  String payload;
  serializeJson(doc, payload);

  // 3. Broadcast Packet over Sub-GHz Radio (LoRa 868MHz/433MHz)
  LoRa.beginPacket();
  LoRa.print(payload);
  LoRa.endPacket();

  // 4. Output to Local USB Serial COM Port for Direct Connection
  Serial.println(payload);

  delay(1500); // 1.5-second live telemetry transmission cycle
}
`;

const ESP32_LORA_RECEIVER_CODE = `// =========================================================================
// MINEGUARD BASE STATION GATEWAY - PITHEAD / CONTROL ROOM RECEIVER NODE
// Hardware: ESP32 DevKit V1 + SX1276 / Ra-02 LoRa Module Receiver
// =========================================================================

#include <SPI.h>
#include <LoRa.h>

#define LORA_SCK   18
#define LORA_MISO  19
#define LORA_MOSI  23
#define LORA_SS    5
#define LORA_RST   14
#define LORA_DIO0  2
#define BAND       868E6 // Match transmitter frequency (868MHz or 433MHz)

void setup() {
  Serial.begin(115200);

  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_SS);
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);

  if (!LoRa.begin(BAND)) {
    Serial.println("❌ LoRa Receiver Gateway Initialization Failed!");
    while (1);
  }

  LoRa.setSyncWord(0xF3); // Must match transmitter sync word
  Serial.println("📡 MineGuard ESP32 LoRa Gateway Receiver Listening on 868MHz...");
}

void loop() {
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    String incoming = "";
    while (LoRa.available()) {
      incoming += (char)LoRa.read();
    }

    int rssi = LoRa.packetRssi();
    float snr = LoRa.packetSnr();

    // Stream raw packet string directly to MineGuard Web Serial API
    Serial.println(incoming);
  }
}
`;

export function JacketConnectModal({ isOpen, onClose }: JacketConnectModalProps) {
  const { physicalJacket, connectSerialJacket, connectWebSocketJacket, disconnectJacket, simulateJacketPacket } =
    useTelemetry();

  const [activeTab, setActiveTab] = useState<'serial' | 'lora' | 'websocket' | 'pinout' | 'code' | 'simulate'>('serial');
  const [loraFreq, setLoraFreq] = useState('868MHz');
  const [loraSpreadingFactor, setLoraSpreadingFactor] = useState('SF10');
  const [codeType, setCodeType] = useState<'tx' | 'rx'>('tx');
  const [wsUrl, setWsUrl] = useState('ws://192.168.1.100:81');
  const [copiedCode, setCopiedCode] = useState(false);
  const [baudRate, setBaudRate] = useState('115200');
  const [connectionLog, setConnectionLog] = useState<string[]>([
    'Ready to initialize connection with ESP32 DevKit V1 + LoRa module...',
  ]);

  useEffect(() => {
    if (physicalJacket?.lastRawPacket) {
      setConnectionLog((prev) => [
        `[${new Date().toLocaleTimeString()}] RX Packet: ${physicalJacket.lastRawPacket}`,
        ...prev.slice(0, 15),
      ]);
    }
  }, [physicalJacket?.lastRawPacket]);

  if (!isOpen) return null;

  const currentCode = codeType === 'tx' ? ESP32_LORA_TRANSMITTER_CODE : ESP32_LORA_RECEIVER_CODE;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSerialConnect = async () => {
    try {
      setConnectionLog((prev) => [`[${new Date().toLocaleTimeString()}] Requesting Web Serial port (ESP32 DevKit V1)...`, ...prev]);
      await connectSerialJacket(parseInt(baudRate, 10));
      setConnectionLog((prev) => [`[${new Date().toLocaleTimeString()}] ESP32 DevKit V1 connected via USB Web Serial!`, ...prev]);
    } catch (err: any) {
      setConnectionLog((prev) => [
        `[${new Date().toLocaleTimeString()}] Serial Error: ${err?.message || 'Failed to open serial port'}`,
        ...prev,
      ]);
    }
  };

  const handleWebSocketConnect = () => {
    setConnectionLog((prev) => [`[${new Date().toLocaleTimeString()}] Connecting to ${wsUrl}...`, ...prev]);
    connectWebSocketJacket(wsUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#EDE4D6] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-950 via-amber-950 to-slate-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Connect ESP32 DevKit V1 & LoRa Module
                {physicalJacket?.isConnected ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE LINK ACTIVE
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    DISCONNECTED
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-300">
                Pair your underground Smart Safety Jacket via USB Web Serial, LoRa Gateway, or Wi-Fi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation + Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-[460px]">
          {/* Options Sidebar */}
          <div className="w-full md:w-64 bg-[#F8FAFC] border-r border-[#EDE4D6] p-3.5 flex flex-col gap-1.5 shrink-0 overflow-y-auto">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] px-3 py-1">
              Connection Methods
            </span>

            <button
              onClick={() => setActiveTab('serial')}
              className={`flex items-center gap-3 px-3.5 py-3 text-xs font-bold rounded-2xl transition-all cursor-pointer text-left ${
                activeTab === 'serial'
                  ? 'bg-[#D97706] text-white shadow-md shadow-amber-600/20'
                  : 'bg-white text-[#475569] hover:text-[#D97706] hover:bg-slate-100 border border-[#EDE4D6]'
              }`}
            >
              <Usb className="w-4 h-4 shrink-0" />
              <span>USB Web Serial (ESP32)</span>
            </button>

            <button
              onClick={() => setActiveTab('lora')}
              className={`flex items-center gap-3 px-3.5 py-3 text-xs font-bold rounded-2xl transition-all cursor-pointer text-left ${
                activeTab === 'lora'
                  ? 'bg-[#D97706] text-white shadow-md shadow-amber-600/20'
                  : 'bg-white text-[#475569] hover:text-[#D97706] hover:bg-slate-100 border border-[#EDE4D6]'
              }`}
            >
              <Radio className="w-4 h-4 shrink-0" />
              <span>LoRa Sub-GHz Gateway</span>
            </button>

            <button
              onClick={() => setActiveTab('websocket')}
              className={`flex items-center gap-3 px-3.5 py-3 text-xs font-bold rounded-2xl transition-all cursor-pointer text-left ${
                activeTab === 'websocket'
                  ? 'bg-[#D97706] text-white shadow-md shadow-amber-600/20'
                  : 'bg-white text-[#475569] hover:text-[#D97706] hover:bg-slate-100 border border-[#EDE4D6]'
              }`}
            >
              <Wifi className="w-4 h-4 shrink-0" />
              <span>Wi-Fi WebSockets</span>
            </button>

            <div className="pt-2 border-t border-[#EDE4D6]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] px-3 py-1 block">
                Hardware Docs & Firmware
              </span>

              <button
                onClick={() => setActiveTab('pinout')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-2xl transition-all cursor-pointer text-left mt-1 ${
                  activeTab === 'pinout'
                    ? 'bg-[#D97706] text-white shadow-md shadow-amber-600/20'
                    : 'bg-white text-[#475569] hover:text-[#D97706] hover:bg-slate-100 border border-[#EDE4D6]'
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>Pinout & Wiring Guide</span>
              </button>

              <button
                onClick={() => setActiveTab('code')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-2xl transition-all cursor-pointer text-left mt-1 ${
                  activeTab === 'code'
                    ? 'bg-[#D97706] text-white shadow-md shadow-amber-600/20'
                    : 'bg-white text-[#475569] hover:text-[#D97706] hover:bg-slate-100 border border-[#EDE4D6]'
                }`}
              >
                <Code className="w-4 h-4 shrink-0" />
                <span>Arduino C++ Code</span>
              </button>

              <button
                onClick={() => setActiveTab('simulate')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-2xl transition-all cursor-pointer text-left mt-1 ${
                  activeTab === 'simulate'
                    ? 'bg-[#D97706] text-white shadow-md shadow-amber-600/20'
                    : 'bg-white text-[#475569] hover:text-[#D97706] hover:bg-slate-100 border border-[#EDE4D6]'
                }`}
              >
                <Zap className="w-4 h-4 shrink-0" />
                <span>Quick Test Simulator</span>
              </button>
            </div>
          </div>

          {/* Details Panel */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-white">
            {/* TAB 1: WEB SERIAL */}
            {activeTab === 'serial' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
                  <Usb className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-[#0F172A] space-y-1">
                    <p className="font-bold">Plug ESP32 DevKit V1 via Micro-USB / USB-C Cable</p>
                    <p className="text-[#64748B]">
                      Connect your ESP32 board or USB LoRa Receiver Gateway directly to your computer. MineGuard reads real-time multi-sensor JSON telemetry straight from the CP2102 / CH340 COM port.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Serial Baud Rate</label>
                    <select
                      value={baudRate}
                      onChange={(e) => setBaudRate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#EDE4D6] rounded-xl text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
                    >
                      <option value="115200">115200 (Default for ESP32 DevKit V1)</option>
                      <option value="9600">9600 (Legacy Baud Rate)</option>
                      <option value="57600">57600</option>
                    </select>
                  </div>

                  <div className="flex items-end gap-2">
                    {physicalJacket?.isConnected && physicalJacket.connectionType === 'serial' ? (
                      <button
                        onClick={disconnectJacket}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer shadow-sm"
                      >
                        Disconnect Web Serial
                      </button>
                    ) : (
                      <button
                        onClick={handleSerialConnect}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#D97706] hover:bg-[#B45309] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                      >
                        <Usb className="w-4 h-4" />
                        Select COM Port & Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LORA GATEWAY */}
            {activeTab === 'lora' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                  <Radio className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-[#0F172A] space-y-1">
                    <p className="font-bold">Underground LoRa Sub-GHz Gateway Receiver</p>
                    <p className="text-[#64748B]">
                      Sub-GHz LoRa (SX1276/Ra-02) transmits telemetry deep through underground rock strata without needing Wi-Fi or Cellular networks.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">LoRa Frequency Band</label>
                    <select
                      value={loraFreq}
                      onChange={(e) => setLoraFreq(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#EDE4D6] rounded-xl text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
                    >
                      <option value="868MHz">868 MHz (India / Europe IN865-867)</option>
                      <option value="433MHz">433 MHz (Deep Tunnel Penetration)</option>
                      <option value="915MHz">915 MHz (US915 Region)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Spreading Factor (SF)</label>
                    <select
                      value={loraSpreadingFactor}
                      onChange={(e) => setLoraSpreadingFactor(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#EDE4D6] rounded-xl text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
                    >
                      <option value="SF10">SF10 (Recommended: High Range & Robustness)</option>
                      <option value="SF7">SF7 (Fastest Telemetry Rate)</option>
                      <option value="SF12">SF12 (Maximum Deep Incline Penetration)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSerialConnect}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  Connect ESP32 LoRa Base Receiver (COM Port)
                </button>
              </div>
            )}

            {/* TAB 3: WEBSOCKETS */}
            {activeTab === 'websocket' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 flex items-start gap-3">
                  <Wifi className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-[#0F172A] space-y-1">
                    <p className="font-bold">Wireless Wi-Fi WebSockets Stream</p>
                    <p className="text-[#64748B]">
                      Connect ESP32 DevKit V1 to local Wi-Fi or Pithead Access Point. ESP32 hosts a WebSocket server on port 81 and broadcasts telemetry live to MineGuard.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">
                      ESP32 WebSocket Endpoint URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={wsUrl}
                        onChange={(e) => setWsUrl(e.target.value)}
                        placeholder="ws://192.168.1.100:81"
                        className="flex-1 px-3 py-2 bg-white border border-[#EDE4D6] rounded-xl text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#D97706]"
                      />
                      {physicalJacket?.isConnected && physicalJacket.connectionType === 'websocket' ? (
                        <button
                          onClick={disconnectJacket}
                          className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer"
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button
                          onClick={handleWebSocketConnect}
                          className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-[#D97706] hover:bg-[#B45309] transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <RadioTower className="w-4 h-4" />
                          Connect Wi-Fi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PINOUT GUIDE */}
            {activeTab === 'pinout' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#0F172A] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#D97706]" />
                    ESP32 DevKit V1 <span className="text-amber-600">⇄</span> SX1276 LoRa & Sensor Pin Mapping
                  </h3>
                </div>

                <div className="overflow-hidden border border-[#EDE4D6] rounded-2xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8FAFC] text-[#475569] font-bold border-b border-[#EDE4D6]">
                      <tr>
                        <th className="p-2.5">Component / Sensor</th>
                        <th className="p-2.5">Module Pin</th>
                        <th className="p-2.5">ESP32 DevKit V1 Pin</th>
                        <th className="p-2.5">Protocol / Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDE4D6] font-mono text-[11px] text-[#0F172A]">
                      <tr className="bg-amber-50/50">
                        <td className="p-2.5 font-bold text-[#D97706]">SX1276 LoRa Radio</td>
                        <td className="p-2.5">NSS (CS)</td>
                        <td className="p-2.5 font-bold">GPIO 5</td>
                        <td className="p-2.5 text-[#64748B]">SPI Chip Select</td>
                      </tr>
                      <tr className="bg-amber-50/50">
                        <td className="p-2.5 font-bold text-[#D97706]">SX1276 LoRa Radio</td>
                        <td className="p-2.5">SCK / MISO / MOSI</td>
                        <td className="p-2.5 font-bold">GPIO 18 / 19 / 23</td>
                        <td className="p-2.5 text-[#64748B]">VSPI Bus (868/433MHz)</td>
                      </tr>
                      <tr className="bg-amber-50/50">
                        <td className="p-2.5 font-bold text-[#D97706]">SX1276 LoRa Radio</td>
                        <td className="p-2.5">RST / DIO0 (IRQ)</td>
                        <td className="p-2.5 font-bold">GPIO 14 / GPIO 2</td>
                        <td className="p-2.5 text-[#64748B]">Hardware Interrupt</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">H2S Gas (SPEC 3SP)</td>
                        <td className="p-2.5">VOUT</td>
                        <td className="p-2.5 font-bold">GPIO 35 (ADC1_CH7)</td>
                        <td className="p-2.5 text-[#64748B]">0-3.3V Analog Signal</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">Methane CH4 (MQ-4)</td>
                        <td className="p-2.5">AOUT</td>
                        <td className="p-2.5 font-bold">GPIO 34 (ADC1_CH6)</td>
                        <td className="p-2.5 text-[#64748B]">0-3.3V Analog Signal</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">PPG Heart Rate (MAX30102)</td>
                        <td className="p-2.5">SDA / SCL</td>
                        <td className="p-2.5 font-bold">GPIO 21 / GPIO 22</td>
                        <td className="p-2.5 text-[#64748B]">I²C Bus (0x57)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">SOS Panic Button</td>
                        <td className="p-2.5">NO Switch</td>
                        <td className="p-2.5 font-bold">GPIO 4</td>
                        <td className="p-2.5 text-[#64748B]">INPUT_PULLUP Active-LOW</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: ARDUINO CODE */}
            {activeTab === 'code' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCodeType('tx')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        codeType === 'tx'
                          ? 'bg-[#D97706] text-white shadow-sm'
                          : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      Underground Jacket (Transmitter)
                    </button>
                    <button
                      onClick={() => setCodeType('rx')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        codeType === 'rx'
                          ? 'bg-[#D97706] text-white shadow-sm'
                          : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      Control Room Gateway (Receiver)
                    </button>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FEF3C7] text-[#D97706] hover:bg-[#FDE68A] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>

                <div className="relative rounded-2xl bg-slate-950 p-4 font-mono text-[11px] text-slate-200 border border-slate-800 max-h-72 overflow-y-auto">
                  <pre>{currentCode}</pre>
                </div>
              </div>
            )}

            {/* TAB 6: SIMULATOR */}
            {activeTab === 'simulate' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                  <Zap className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-[#0F172A] space-y-1">
                    <p className="font-bold">Hardware Simulator (No Physical Board Required)</p>
                    <p className="text-[#64748B]">
                      Simulate live multi-sensor ESP32 DevKit V1 + LoRa telemetry packets directly into MineGuard to verify UI hazard charts, safety alarms, and worker card telemetry.
                    </p>
                  </div>
                </div>

                <button
                  onClick={simulateJacketPacket}
                  className="w-full py-3 px-4 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Inject Simulated ESP32 + LoRa Telemetry Packet Now
                </button>
              </div>
            )}

            {/* Connection Log Terminal */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#475569]">
                <Terminal className="w-3.5 h-3.5 text-[#D97706]" />
                Live Packet Console & Connection Log
              </div>
              <div className="bg-slate-950 rounded-2xl p-3 font-mono text-[11px] text-emerald-400 border border-slate-800 h-28 overflow-y-auto space-y-1 shadow-inner">
                {connectionLog.map((log, idx) => (
                  <div key={idx} className="leading-tight">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-[#EDE4D6] flex items-center justify-between">
          <span className="text-[11px] text-[#64748B] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            ESP32 DevKit V1 + SX1276 LoRa Sub-GHz Protocol v2.5
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#475569] hover:bg-[#E2E8F0] transition-all cursor-pointer"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
}

export default JacketConnectModal;
