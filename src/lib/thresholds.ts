import { WorkerStatus } from '@/types/telemetry';

export const THRESHOLDS = {
  h2s: {
    safeMax: 5.0, // ppm
    warningMax: 10.0, // ppm
    criticalMin: 10.0, // ppm
    unit: 'ppm',
  },
  heartRate: {
    safeMin: 60,
    safeMax: 100,
    warningMax: 120,
    criticalMin: 120,
    unit: 'bpm',
  },
  temperature: {
    safeMax: 34.0, // °C jacket ambient
    warningMax: 38.0,
    criticalMin: 38.0,
    unit: '°C',
  },
  radiation: {
    safeMax: 0.30, // µSv/h
    warningMax: 0.60,
    criticalMin: 0.60,
    unit: 'µSv/h',
    cpmFactor: 120, // Approx ~120 CPM = 1 µSv/h for SBM-20
  },
  pm25: {
    safeMax: 35.0, // µg/m³
    warningMax: 75.0,
    criticalMin: 75.0,
    unit: 'µg/m³',
  },
  battery: {
    warningMin: 20, // %
    criticalMin: 10,
    unit: '%',
  },
};

export function getH2SStatus(val: number): 'safe' | 'warning' | 'critical' {
  if (val > THRESHOLDS.h2s.warningMax) return 'critical';
  if (val >= THRESHOLDS.h2s.safeMax) return 'warning';
  return 'safe';
}

export function getHeartRateStatus(val: number): 'safe' | 'warning' | 'critical' {
  if (val > THRESHOLDS.heartRate.warningMax || val < 45) return 'critical';
  if (val > THRESHOLDS.heartRate.safeMax || val < THRESHOLDS.heartRate.safeMin) return 'warning';
  return 'safe';
}

export function getTemperatureStatus(val: number): 'safe' | 'warning' | 'critical' {
  if (val >= THRESHOLDS.temperature.criticalMin) return 'critical';
  if (val >= THRESHOLDS.temperature.safeMax) return 'warning';
  return 'safe';
}

export function getRadiationStatus(val: number): 'safe' | 'warning' | 'critical' {
  if (val >= THRESHOLDS.radiation.criticalMin) return 'critical';
  if (val >= THRESHOLDS.radiation.safeMax) return 'warning';
  return 'safe';
}

export function getPM25Status(val: number): 'safe' | 'warning' | 'critical' {
  if (val >= THRESHOLDS.pm25.criticalMin) return 'critical';
  if (val >= THRESHOLDS.pm25.safeMax) return 'warning';
  return 'safe';
}

export function getBatteryStatus(val: number): 'safe' | 'warning' | 'critical' {
  if (val <= THRESHOLDS.battery.criticalMin) return 'critical';
  if (val <= THRESHOLDS.battery.warningMin) return 'warning';
  return 'safe';
}

export function calculateWorkerStatus(readings: {
  h2s: number;
  heartRate: number;
  temperature: number;
  radiationUSv: number;
  pm25: number;
  battery: number;
  sosActive?: boolean;
}): WorkerStatus {
  if (readings.sosActive) return 'critical';

  const statuses = [
    getH2SStatus(readings.h2s),
    getHeartRateStatus(readings.heartRate),
    getTemperatureStatus(readings.temperature),
    getRadiationStatus(readings.radiationUSv),
    getPM25Status(readings.pm25),
    getBatteryStatus(readings.battery),
  ];

  if (statuses.includes('critical')) return 'critical';
  if (statuses.includes('warning')) return 'warning';
  return 'online';
}
