'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { WorkerTelemetry, HardwareSensor, SafetyAlert } from '@/types/telemetry';
import { initialWorkers, initialSensors, initialAlerts } from '@/lib/mock-data';
import { subscribeToTelemetry } from '@/lib/data-source';
import { useRole } from '@/context/RoleContext';

interface TelemetryStats {
  total: number;
  online: number;
  warning: number;
  critical: number;
  h2sHighCount: number;
  vitalsWarningCount: number;
  avgHeartRate: number;
  avgH2S: number;
  activeSensors: number;
}

export interface PhysicalJacketState {
  isConnected: boolean;
  connectionType: 'serial' | 'websocket' | 'simulator' | null;
  lastRawPacket: string | null;
  lastPacketTime: string | null;
}

interface TelemetryContextType {
  /** Workers scoped to the user's role (a Worker sees only themselves) */
  workers: WorkerTelemetry[];
  /** Every worker regardless of role, e.g. for showing co-workers on the map */
  allWorkers: WorkerTelemetry[];
  sensors: HardwareSensor[];
  alerts: SafetyAlert[];
  stats: TelemetryStats;
  isLive: boolean;
  physicalJacket: PhysicalJacketState;
  toggleLive: () => void;
  acknowledgeAlert: (alertId: string) => void;
  getWorker: (id: string) => WorkerTelemetry | undefined;
  connectSerialJacket: (baudRate?: number) => Promise<void>;
  connectWebSocketJacket: (wsUrl: string) => void;
  disconnectJacket: () => void;
  simulateJacketPacket: () => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const { role } = useRole();
  const [allWorkers, setAllWorkers] = useState<WorkerTelemetry[]>(initialWorkers);
  const [sensors, setSensors] = useState<HardwareSensor[]>(initialSensors);
  const [alerts, setAlerts] = useState<SafetyAlert[]>(initialAlerts);
  const [isLive, setIsLive] = useState(true);

  // ESP32 Physical Jacket connection state
  const [physicalJacket, setPhysicalJacket] = useState<PhysicalJacketState>({
    isConnected: false,
    connectionType: null,
    lastRawPacket: null,
    lastPacketTime: null,
  });

  const [activeSocket, setActiveSocket] = useState<WebSocket | null>(null);

  // Helper to ingest parsed ESP32 JSON data into active workers, sensors & alerts
  const ingestJacketData = (data: any, rawLine: string) => {
    const timestamp = new Date().toLocaleTimeString();

    setPhysicalJacket((prev) => ({
      ...prev,
      lastRawPacket: rawLine,
      lastPacketTime: timestamp,
    }));

    const jacketId = String(data.jacketId || data.jacket_id || data.id || 'SJ-ESP32-LIVE');
    const workerName = String(data.workerName || data.worker_name || data.name || 'Rajesh Kumar (ESP32 Live)');

    // Gas Telemetry
    const h2s = Number(data.h2s ?? data.H2S ?? data.h2s_ppm ?? 0.5);
    const ch4 = Number(data.ch4 ?? data.CH4 ?? data.methane ?? 0.25);
    const co = Number(data.co ?? data.CO ?? 4.0);

    // Vitals Telemetry
    const heartRate = Math.round(Number(data.heartRate ?? data.heart_rate ?? data.hr ?? data.bpm ?? 76));
    const temp = Number((Number(data.temp ?? data.temperature ?? data.body_temp ?? 36.6)).toFixed(1));
    const humidity = Math.round(Number(data.humidity ?? data.hum ?? data.rh ?? 68));

    // Environmental & Radiation Telemetry
    const pm25 = Number((Number(data.pm25 ?? data.pm2_5 ?? data.dust ?? 22.4)).toFixed(1));
    const radiationCPM = Math.round(Number(data.radiationCPM ?? data.cpm ?? data.rad ?? 20));
    const radiationUSv = Number((Number(data.radiationUSv ?? data.usv ?? (radiationCPM / 120))).toFixed(2));

    // Power, Network & Positioning Telemetry
    const battery = Math.round(Number(data.battery ?? data.batt ?? data.battery_level ?? 94));
    const loraRSSI = Math.round(Number(data.loraRSSI ?? data.rssi ?? -72));
    const loraSNR = Number((Number(data.loraSNR ?? data.snr ?? 9.5)).toFixed(1));
    const uwbX = Number((Number(data.uwbX ?? data.x ?? 42.5)).toFixed(1));
    const uwbY = Number((Number(data.uwbY ?? data.y ?? 118.2)).toFixed(1));
    
    const pcmCoolingStatus = data.pcmCoolingStatus || data.cooling || (temp > 38 ? 'Exhausted (28°C)' : temp > 34 ? 'Partially Depleted (25°C)' : 'Active Cooling (18°C)');
    const sos = Boolean(data.sos ?? data.panic ?? data.emergency ?? false);
    const colorimetricH2SDetected = Boolean(data.colorimetricH2SDetected ?? data.colorimetric ?? (h2s > 10));

    const isCritical = sos || ch4 > 2.5 || h2s > 10 || heartRate > 120 || temp > 38 || radiationUSv > 0.60;
    const isWarning = ch4 > 1.2 || h2s >= 5 || heartRate > 100 || heartRate < 55 || temp > 34 || pm25 > 35;
    const status = isCritical ? 'critical' : isWarning ? 'warning' : 'online';

    setAllWorkers((prevWorkers) => {
      const existingIdx = prevWorkers.findIndex(
        (w) => w.jacketId === jacketId || w.id === 'W-ESP32-LIVE'
      );

      const existingWorker = prevWorkers[existingIdx];
      const prevHistory = existingWorker?.history || [];

      const newHistoryPoint = {
        time: timestamp.slice(0, 5),
        h2s: h2s,
        heartRate: heartRate,
        temperature: temp,
        humidity: humidity,
        pm25: pm25,
        radiationUSv: radiationUSv,
      };

      const updatedHistory = [...prevHistory, newHistoryPoint].slice(-15);

      const liveWorker: WorkerTelemetry = {
        id: 'W-ESP32-LIVE',
        name: workerName,
        jacketId: jacketId,
        role: 'ESP32 Live Wearer',
        zone: 'Shaft 3 - Live ESP32 Stream',
        status: status as any,
        heartRate: heartRate,
        temperature: temp,
        battery: battery,
        h2s: h2s,
        humidity: humidity,
        pm25: pm25,
        radiationCPM: radiationCPM,
        radiationUSv: radiationUSv,
        loraRSSI: loraRSSI,
        loraSNR: loraSNR,
        uwbX: uwbX,
        uwbY: uwbY,
        pcmCoolingStatus: pcmCoolingStatus as any,
        sosActive: sos,
        colorimetricH2SDetected: colorimetricH2SDetected,
        lastPing: timestamp,
        history: updatedHistory,
      };

      if (existingIdx >= 0) {
        const copy = [...prevWorkers];
        copy[existingIdx] = liveWorker;
        return copy;
      } else {
        return [liveWorker, ...prevWorkers];
      }
    });

    // Simultaneously update sensor hardware grid state for real accuracy
    setSensors((prevSensors) => {
      return prevSensors.map((sensor) => {
        if (sensor.id === 'SENS-H2S-E') {
          return {
            ...sensor,
            value: h2s,
            status: h2s > 10 ? 'critical' : h2s >= 5 ? 'warning' : 'safe',
            trend: [...sensor.trend.slice(-3), { time: timestamp.slice(0, 5), value: h2s }],
          };
        }
        if (sensor.id === 'SENS-H2S-OPT') {
          return {
            ...sensor,
            value: colorimetricH2SDetected ? 'Positive (Darkened Stain)' : 'Clear (No Stain)',
            status: colorimetricH2SDetected ? 'critical' : 'safe',
          };
        }
        if (sensor.id === 'SENS-PPG') {
          return {
            ...sensor,
            value: heartRate,
            status: heartRate > 120 || heartRate < 50 ? 'critical' : heartRate > 100 ? 'warning' : 'safe',
            trend: [...sensor.trend.slice(-3), { time: timestamp.slice(0, 5), value: heartRate }],
          };
        }
        if (sensor.id === 'SENS-ENV-DHT') {
          return {
            ...sensor,
            value: `${temp}°C / ${humidity}%`,
            status: temp > 38 ? 'critical' : temp > 34 ? 'warning' : 'safe',
            trend: [...sensor.trend.slice(-3), { time: timestamp.slice(0, 5), value: temp }],
          };
        }
        if (sensor.id === 'SENS-DUST-PM') {
          return {
            ...sensor,
            value: pm25,
            status: pm25 > 75 ? 'critical' : pm25 > 35 ? 'warning' : 'safe',
            trend: [...sensor.trend.slice(-3), { time: timestamp.slice(0, 5), value: pm25 }],
          };
        }
        if (sensor.id === 'SENS-RAD-GM') {
          return {
            ...sensor,
            value: `${radiationUSv} µSv/h (${radiationCPM} CPM)`,
            status: radiationUSv > 0.6 ? 'critical' : radiationUSv > 0.3 ? 'warning' : 'safe',
            trend: [...sensor.trend.slice(-3), { time: timestamp.slice(0, 5), value: radiationUSv }],
          };
        }
        if (sensor.id === 'SENS-LOC-UWB') {
          return {
            ...sensor,
            value: `X: ${uwbX}m, Y: ${uwbY}m (Live Fix)`,
            status: 'safe',
          };
        }
        return sensor;
      });
    });

    if (sos || isCritical) {
      setAlerts((prevAlerts) => [
        {
          id: `ALT-ESP32-${Date.now()}`,
          title: sos ? '🚨 ESP32 HARDWARE SOS PANIC BUTTON TRIGGERED!' : 'Critical Hazardous Conditions (ESP32)',
          workerName: workerName,
          workerId: 'W-ESP32-LIVE',
          jacketId: jacketId,
          zone: 'Shaft 3 - Live ESP32',
          severity: 'critical',
          timestamp: timestamp,
          message: sos
            ? 'Worker pressed physical panic button on ESP32 smart jacket.'
            : `H2S: ${h2s} PPM | Temp: ${temp}°C | HR: ${heartRate} BPM | PM2.5: ${pm25} µg/m³`,
          acknowledged: false,
        },
        ...prevAlerts,
      ]);
    }
  };

  // Connect via Chrome/Edge Web Serial API
  const connectSerialJacket = async (baudRate: number = 115200) => {
    if (!('serial' in navigator)) {
      throw new Error('Web Serial API is not supported by your browser. Please use Chrome or Edge.');
    }

    // @ts-ignore
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate });

    setPhysicalJacket({
      isConnected: true,
      connectionType: 'serial',
      lastRawPacket: 'Serial port opened at baud ' + baudRate,
      lastPacketTime: new Date().toLocaleTimeString(),
    });

    // @ts-ignore
    const textDecoder = new TextDecoderStream();
    // @ts-ignore
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    let buffer = '';

    (async () => {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            reader.releaseLock();
            break;
          }
          if (value) {
            buffer += value;
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                try {
                  const json = JSON.parse(trimmed);
                  ingestJacketData(json, trimmed);
                } catch (e) {
                  // ignored invalid json line
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Serial read error:', err);
      }
    })();
  };

  // Connect via Wi-Fi WebSockets
  const connectWebSocketJacket = (wsUrl: string) => {
    if (activeSocket) {
      activeSocket.close();
    }

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setPhysicalJacket({
        isConnected: true,
        connectionType: 'websocket',
        lastRawPacket: `Connected to ${wsUrl}`,
        lastPacketTime: new Date().toLocaleTimeString(),
      });
    };

    ws.onmessage = (event) => {
      const raw = event.data;
      if (typeof raw === 'string' && raw.trim().startsWith('{')) {
        try {
          const json = JSON.parse(raw.trim());
          ingestJacketData(json, raw);
        } catch (e) {
          // ignore
        }
      }
    };

    ws.onclose = () => {
      setPhysicalJacket((prev) => ({
        ...prev,
        isConnected: false,
        connectionType: null,
      }));
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    setActiveSocket(ws);
  };

  // Disconnect active physical jacket
  const disconnectJacket = () => {
    if (activeSocket) {
      activeSocket.close();
      setActiveSocket(null);
    }
    setPhysicalJacket({
      isConnected: false,
      connectionType: null,
      lastRawPacket: null,
      lastPacketTime: null,
    });
  };

  // Simulate an ESP32 hardware packet
  const simulateJacketPacket = () => {
    const radCPM = Math.floor(14 + Math.random() * 16);
    const mockPacket = {
      jacketId: 'SJ-ESP32-LIVE',
      workerName: 'Rajesh Kumar (Live ESP32)',
      h2s: Number((Math.random() * 7.5).toFixed(2)),
      ch4: Number((0.15 + Math.random() * 0.6).toFixed(2)),
      co: Number((2.0 + Math.random() * 5.0).toFixed(1)),
      heartRate: Math.floor(68 + Math.random() * 42),
      temp: Number((36.2 + Math.random() * 2.1).toFixed(1)),
      humidity: Math.floor(62 + Math.random() * 20),
      pm25: Number((16.0 + Math.random() * 30.0).toFixed(1)),
      radiationCPM: radCPM,
      radiationUSv: Number((radCPM / 120).toFixed(2)),
      battery: Math.floor(84 + Math.random() * 15),
      uwbX: Number((24.0 + Math.random() * 40.0).toFixed(1)),
      uwbY: Number((85.0 + Math.random() * 80.0).toFixed(1)),
      rssi: Math.floor(-82 + Math.random() * 20),
      snr: Number((8.0 + Math.random() * 4.0).toFixed(1)),
      sos: Math.random() > 0.88,
    };
    ingestJacketData(mockPacket, JSON.stringify(mockPacket));
  };

  // 3-second simulation ticker for mock fleet
  useEffect(() => {
    if (!isLive) return;

    const unsubscribe = subscribeToTelemetry((updatedWorkers) => {
      setAllWorkers((prev) => {
        // preserve live ESP32 worker if connected or simulated
        const liveWorker = prev.find((w) => w.id === 'W-ESP32-LIVE');
        if (liveWorker) {
          return [liveWorker, ...updatedWorkers.filter((w) => w.id !== 'W-ESP32-LIVE')];
        }
        return updatedWorkers;
      });

      // Also gently update sensor values corresponding to fleet state
      setSensors((prevSensors) => {
        const h2sWorker = updatedWorkers.find((w) => w.jacketId === 'SJ-005') || updatedWorkers[0];
        const avgHR = Math.round(
          updatedWorkers.reduce((acc, w) => acc + w.heartRate, 0) / updatedWorkers.length
        );

        return prevSensors.map((sensor) => {
          if (sensor.id === 'SENS-H2S-E') {
            return {
              ...sensor,
              value: h2sWorker.h2s,
              status: h2sWorker.h2s > 10 ? 'critical' : h2sWorker.h2s >= 5 ? 'warning' : 'safe',
            };
          }
          if (sensor.id === 'SENS-PPG') {
            return {
              ...sensor,
              value: avgHR,
            };
          }
          return sensor;
        });
      });
    }, 3000);

    return () => unsubscribe();
  }, [isLive]);

  // Scope workers according to user role
  const workers = useMemo(() => {
    if (role === 'Worker') {
      const myWorker = allWorkers.find(
        (w) => w.name.includes('Vikram') || w.jacketId === 'SJ-003' || w.id === 'W1026' || w.id === 'W-ESP32-LIVE'
      );
      return myWorker ? [myWorker] : [allWorkers[0]];
    }
    return allWorkers;
  }, [role, allWorkers]);

  // Scope alerts according to user role
  const scopedAlerts = useMemo(() => {
    return alerts;
  }, [alerts]);

  // Compute live aggregates based on scoped workers
  const stats: TelemetryStats = useMemo(() => {
    const total = workers.length;
    const online = workers.filter((w) => w.status === 'online').length;
    const warning = workers.filter((w) => w.status === 'warning').length;
    const critical = workers.filter((w) => w.status === 'critical').length;
    const h2sHighCount = workers.filter((w) => w.h2s >= 5.0).length;
    const vitalsWarningCount = workers.filter((w) => w.heartRate > 100 || w.heartRate < 60).length;
    const avgHeartRate = Math.round(workers.reduce((a, b) => a + b.heartRate, 0) / (total || 1));
    const avgH2S = Number((workers.reduce((a, b) => a + b.h2s, 0) / (total || 1)).toFixed(2));

    return {
      total,
      online,
      warning,
      critical,
      h2sHighCount,
      vitalsWarningCount,
      avgHeartRate,
      avgH2S,
      activeSensors: sensors.length,
    };
  }, [workers, sensors]);

  const toggleLive = () => setIsLive((prev) => !prev);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
    // Also reset worker sosActive and critical status to clear emergency modal
    setAllWorkers((prev) =>
      prev.map((w) => ({ ...w, sosActive: false, status: w.status === 'critical' ? 'online' : w.status }))
    );
  };

  const getWorker = (id: string) => {
    if (role === 'Worker') {
      const myWorker = workers[0];
      if (
        id.toLowerCase() === myWorker.id.toLowerCase() ||
        id.toLowerCase() === myWorker.jacketId.toLowerCase()
      ) {
        return myWorker;
      }
      return undefined;
    }

    return allWorkers.find(
      (w) => w.id.toLowerCase() === id.toLowerCase() || w.jacketId.toLowerCase() === id.toLowerCase()
    );
  };

  return (
    <TelemetryContext.Provider
      value={{
        workers,
        allWorkers,
        sensors,
        alerts: scopedAlerts,
        stats,
        isLive,
        physicalJacket,
        toggleLive,
        acknowledgeAlert,
        getWorker,
        connectSerialJacket,
        connectWebSocketJacket,
        disconnectJacket,
        simulateJacketPacket,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
}

