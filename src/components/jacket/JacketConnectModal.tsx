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
} from 'lucide-react';
import { useTelemetry } from '@/context/TelemetryContext';

interface JacketConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ARDUINO_ESP32_CODE = `#include <WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>

// MineGuard ESP32 Smart Safety Jacket Firmware
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

WebSocketsServer webSocket = WebSocketsServer(81);

// Pin Definitions
#define MQ4_PIN 34       // Methane CH4 Sensor
#define MQ135_PIN 35     // H2S / Air Quality Sensor
#define SOS_BUTTON_PIN 4 // Emergency Panic Switch

void setup() {
  Serial.begin(115200);
  pinMode(SOS_BUTTON_PIN, INPUT_PULLUP);

  // WiFi Setup
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Connected! IP: " + WiFi.localIP().toString());

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  webSocket.loop();

  // Read sensors
  int ch4_raw = analogRead(MQ4_PIN);
  float ch4_ppm = (ch4_raw / 4095.0) * 5.0; // Simulated PPM

  int h2s_raw = analogRead(MQ135_PIN);
  float h2s_ppm = (h2s_raw / 4095.0) * 12.0;

  int heartRate = random(70, 95);
  bool sosPressed = (digitalRead(SOS_BUTTON_PIN) == LOW);

  // Build JSON telemetry packet
  StaticJsonDocument<256> doc;
  doc["jacketId"] = "SJ-ESP32-LIVE";
  doc["workerName"] = "Live ESP32 Wearer";
  doc["ch4"] = ch4_ppm;
  doc["h2s"] = h2s_ppm;
  doc["co"] = random(2, 10);
  doc["heartRate"] = heartRate;
  doc["temp"] = random(36, 38);
  doc["battery"] = random(85, 99);
  doc["sos"] = sosPressed;

  String jsonString;
  serializeJson(doc, jsonString);

  // Print to Serial COM (Web Serial API)
  Serial.println(jsonString);

  // Broadcast over WebSockets
  webSocket.broadcastTXT(jsonString);

  delay(2000);
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  if (type == WStype_CONNECTED) {
    Serial.printf("[%u] Connected to MineGuard Dashboard!\\n", num);
  }
}
`;

export function JacketConnectModal({ isOpen, onClose }: JacketConnectModalProps) {
  const { physicalJacket, connectSerialJacket, connectWebSocketJacket, disconnectJacket, simulateJacketPacket } =
    useTelemetry();

  const [activeTab, setActiveTab] = useState<'serial' | 'websocket' | 'code' | 'simulate'>('serial');
  const [wsUrl, setWsUrl] = useState('ws://192.168.1.100:81');
  const [copiedCode, setCopiedCode] = useState(false);
  const [baudRate, setBaudRate] = useState('115200');
  const [connectionLog, setConnectionLog] = useState<string[]>([
    'Ready to initialize connection with ESP32 Smart Jacket board...',
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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ARDUINO_ESP32_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSerialConnect = async () => {
    try {
      setConnectionLog((prev) => [`[${new Date().toLocaleTimeString()}] Requesting Web Serial port...`, ...prev]);
      await connectSerialJacket(parseInt(baudRate, 10));
      setConnectionLog((prev) => [`[${new Date().toLocaleTimeString()}] Web Serial connected successfully!`, ...prev]);
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
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#EDE4D6] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/20 border border-orange-400/30 text-orange-400">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Connect with Smart Jacket
                {physicalJacket?.isConnected ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE LINK ACTIVE
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600">
                    DISCONNECTED
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-300">
                Pair your physical underground safety vest with real-time sensors via Web Serial or Wi-Fi.
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

        {/* Vertical Options Navigation + Content Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-[420px]">
          {/* Vertical Options Navigation Sidebar */}
          <div className="w-full md:w-64 bg-[#F8FAFC] border-r border-[#EDE4D6] p-4 flex flex-col gap-2 shrink-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] px-3 py-1">
              Connection Options
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
              <span>USB Web Serial</span>
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

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-3 px-3.5 py-3 text-xs font-bold rounded-2xl transition-all cursor-pointer text-left ${
                activeTab === 'code'
                  ? 'bg-[#D97706] text-white shadow-md shadow-amber-600/20'
                  : 'bg-white text-[#475569] hover:text-[#D97706] hover:bg-slate-100 border border-[#EDE4D6]'
              }`}
            >
              <Code className="w-4 h-4 shrink-0" />
              <span>ESP32 Arduino Firmware</span>
            </button>

            <button
              onClick={() => setActiveTab('simulate')}
              className={`flex items-center gap-3 px-3.5 py-3 text-xs font-bold rounded-2xl transition-all cursor-pointer text-left ${
                activeTab === 'simulate'
                  ? 'bg-[#D97706] text-white shadow-md shadow-amber-600/20'
                  : 'bg-white text-[#475569] hover:text-[#D97706] hover:bg-slate-100 border border-[#EDE4D6]'
              }`}
            >
              <Zap className="w-4 h-4 shrink-0" />
              <span>Quick Test / Simulator</span>
            </button>
          </div>

          {/* Option Details Content Area */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-white">
            {/* TAB 1: WEB SERIAL */}
            {activeTab === 'serial' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                <Usb className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-[#0F172A] space-y-1">
                  <p className="font-bold">Plug ESP32 into Laptop/PC via USB Cable</p>
                  <p className="text-[#64748B]">
                    MineGuard will directly read JSON packets emitted by your ESP32 over Web Serial API. Works in Google Chrome, Microsoft Edge, and Opera.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Baud Rate</label>
                  <select
                    value={baudRate}
                    onChange={(e) => setBaudRate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EDE4D6] rounded-xl text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
                  >
                    <option value="115200">115200 (Recommended for ESP32)</option>
                    <option value="9600">9600 (Standard Serial)</option>
                    <option value="57600">57600</option>
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  {physicalJacket?.isConnected && physicalJacket.connectionType === 'serial' ? (
                    <button
                      onClick={disconnectJacket}
                      className="w-full py-2 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer shadow-sm"
                    >
                      Disconnect Web Serial
                    </button>
                  ) : (
                    <button
                      onClick={handleSerialConnect}
                      className="w-full py-2 px-4 rounded-xl text-xs font-bold text-white bg-[#D97706] hover:bg-[#B45309] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                    >
                      <Usb className="w-4 h-4" />
                      Select COM Port & Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WEBSOCKETS */}
          {activeTab === 'websocket' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 flex items-start gap-3">
                <Wifi className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-[#0F172A] space-y-1">
                  <p className="font-bold">Wireless IP Telemetry Stream</p>
                  <p className="text-[#64748B]">
                    Connect your ESP32 to local Wi-Fi or access point. ESP32 hosts a WebSocket server on port 81 and broadcasts telemetry wirelessly to MineGuard.
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

          {/* TAB 3: CODE */}
          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F172A]">
                  Arduino IDE Firmware Source Code (ESP32 C++)
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FEF3C7] text-[#D97706] hover:bg-[#FDE68A] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copied!' : 'Copy Arduino Code'}
                </button>
              </div>

              <div className="relative rounded-2xl bg-slate-950 p-4 font-mono text-[11px] text-slate-200 border border-slate-800 max-h-64 overflow-y-auto">
                <pre>{ARDUINO_ESP32_CODE}</pre>
              </div>
            </div>
          )}

          {/* TAB 4: SIMULATOR */}
          {activeTab === 'simulate' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                <Zap className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-[#0F172A] space-y-1">
                  <p className="font-bold">Hardware Simulator (No Physical Board Required)</p>
                  <p className="text-[#64748B]">
                    Simulate real-time ESP32 packet data directly into MineGuard to verify UI hazard charts, safety alarms, and worker card telemetry.
                  </p>
                </div>
              </div>

              <button
                onClick={simulateJacketPacket}
                className="w-full py-3 px-4 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                Inject Simulated ESP32 Telemetry Packet Now
              </button>
            </div>
          )}

          {/* Connection Log Terminal */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#475569]">
              <Terminal className="w-3.5 h-3.5 text-[#D97706]" />
              Live Packet Console & Connection Log
            </div>
            <div className="bg-slate-900 rounded-2xl p-3 font-mono text-[11px] text-emerald-400 border border-slate-800 h-28 overflow-y-auto space-y-1 shadow-inner">
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
        <div className="px-6 py-3 bg-[#F8FAFC] border-t border-[#EDE4D6] flex items-center justify-between">
          <span className="text-[11px] text-[#64748B] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            ESP32 MineGuard Protocol v2.4 (Serial/WS JSON)
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
