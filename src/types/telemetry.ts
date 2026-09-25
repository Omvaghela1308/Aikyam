export type WorkerStatus = 'online' | 'warning' | 'critical';

export interface TelemetryPoint {
  time: string;
  h2s: number;
  heartRate: number;
  temperature: number;
  humidity: number;
  pm25: number;
  radiationUSv: number;
}

export interface WorkerTelemetry {
  id: string; // e.g. W1024
  name: string;
  jacketId: string; // e.g. SJ-001
  role: string;
  zone: string;
  status: WorkerStatus;
  h2s: number; // ppm
  heartRate: number; // bpm
  temperature: number; // °C
  humidity: number; // %
  pm25: number; // µg/m³
  radiationCPM: number; // CPM
  radiationUSv: number; // µSv/h
  battery: number; // %
  loraRSSI: number; // dBm (e.g. -74)
  loraSNR: number; // dB (e.g. 9.2)
  uwbX: number; // meters from gallery datum
  uwbY: number; // meters from gallery datum
  pcmCoolingStatus: 'Active Cooling (18°C)' | 'Nominal (21°C)' | 'Partially Depleted (25°C)' | 'Exhausted (28°C)';
  sosActive: boolean;
  colorimetricH2SDetected: boolean;
  lastPing: string;
  history: TelemetryPoint[];
}

export type HardwareSensorType =
  | 'gas'
  | 'vitals'
  | 'environment'
  | 'radiation'
  | 'location'
  | 'infrastructure';

export interface HardwareSensor {
  id: string;
  name: string;
  model: string; // Displayed in JetBrains Mono font
  type: HardwareSensorType;
  value: number | string;
  unit: string;
  status: 'safe' | 'warning' | 'critical';
  zone: string;
  hardwareSpecs: string;
  trend: { time: string; value: number }[];
}

export interface SafetyAlert {
  id: string;
  title: string;
  workerName: string;
  workerId: string;
  jacketId: string;
  zone: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  message: string;
  acknowledged: boolean;
}
