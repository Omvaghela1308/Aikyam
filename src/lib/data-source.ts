import { WorkerTelemetry, HardwareSensor, SafetyAlert } from '@/types/telemetry';
import { initialWorkers, initialSensors, initialAlerts } from './mock-data';
import { calculateWorkerStatus } from './thresholds';

/**
 * Data Access Layer (DataSource)
 * 
 * Abstracted layer to fetch workers, sensors, and alerts.
 * This can be substituted with real ESP32 LoRa Gateway HTTP/WebSocket endpoints
 * or MQTT broker connections in the future without changing UI components.
 */

// In-memory store for simulation
let currentWorkers: WorkerTelemetry[] = JSON.parse(JSON.stringify(initialWorkers));
let currentSensors: HardwareSensor[] = JSON.parse(JSON.stringify(initialSensors));
let currentAlerts: SafetyAlert[] = JSON.parse(JSON.stringify(initialAlerts));

export async function getWorkers(): Promise<WorkerTelemetry[]> {
  // Simulates network latency
  return Promise.resolve([...currentWorkers]);
}

export async function getWorkerById(id: string): Promise<WorkerTelemetry | undefined> {
  const worker = currentWorkers.find((w) => w.id.toLowerCase() === id.toLowerCase() || w.jacketId.toLowerCase() === id.toLowerCase());
  return Promise.resolve(worker ? { ...worker } : undefined);
}

export async function getSensors(): Promise<HardwareSensor[]> {
  return Promise.resolve([...currentSensors]);
}

export async function getAlerts(): Promise<SafetyAlert[]> {
  return Promise.resolve([...currentAlerts]);
}

/**
 * Simulates real-time sensor fluctuation every 3 seconds.
 * Fluctuates readings slightly within realistic physical bounds
 * and recalculates worker safety status dynamically.
 */
export function simulateTelemetryStep(workers: WorkerTelemetry[]): WorkerTelemetry[] {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  return workers.map((worker) => {
    // Random subtle fluctuations
    const h2sDelta = (Math.random() - 0.48) * 0.2; // slight drift
    const hrDelta = Math.floor((Math.random() - 0.48) * 3);
    const tempDelta = (Math.random() - 0.48) * 0.15;
    const pmDelta = (Math.random() - 0.48) * 1.5;
    const radDelta = Math.floor((Math.random() - 0.5) * 3);

    // Clamp values to realistic physical constraints
    const newH2S = Math.max(0.1, Number((worker.h2s + h2sDelta).toFixed(2)));
    const newHR = Math.max(55, Math.min(160, worker.heartRate + hrDelta));
    const newTemp = Math.max(22.0, Math.min(42.0, Number((worker.temperature + tempDelta).toFixed(1))));
    const newPM = Math.max(5.0, Number((worker.pm25 + pmDelta).toFixed(1)));
    const newCPM = Math.max(10, worker.radiationCPM + radDelta);
    const newUSv = Number((newCPM / 120).toFixed(2));

    // LoRa RSSI minor fluctuation (-95 to -55 dBm)
    const newRSSI = Math.min(-55, Math.max(-95, worker.loraRSSI + Math.floor((Math.random() - 0.5) * 2)));

    // Calculate new status dynamically based on updated sensor readings
    const newStatus = calculateWorkerStatus({
      h2s: newH2S,
      heartRate: newHR,
      temperature: newTemp,
      radiationUSv: newUSv,
      pm25: newPM,
      battery: worker.battery,
      sosActive: worker.sosActive,
    });

    // Update historical telemetry array (keep last 12 points)
    const updatedHistory = [...worker.history];
    if (updatedHistory.length > 0) {
      // replace the latest or push a rolling sample
      updatedHistory[updatedHistory.length - 1] = {
        time: timeStr.slice(0, 5),
        h2s: newH2S,
        heartRate: newHR,
        temperature: newTemp,
        humidity: worker.humidity,
        pm25: newPM,
        radiationUSv: newUSv,
      };
    }

    return {
      ...worker,
      h2s: newH2S,
      heartRate: newHR,
      temperature: newTemp,
      pm25: newPM,
      radiationCPM: newCPM,
      radiationUSv: newUSv,
      loraRSSI: newRSSI,
      status: newStatus,
      lastPing: 'Just now',
      history: updatedHistory,
    };
  });
}

/**
 * Subscribes a listener to live telemetry ticks.
 * Returns an unsubscription function.
 */
export function subscribeToTelemetry(
  onTick: (workers: WorkerTelemetry[]) => void,
  intervalMs: number = 3000
): () => void {
  const timer = setInterval(() => {
    currentWorkers = simulateTelemetryStep(currentWorkers);
    onTick([...currentWorkers]);
  }, intervalMs);

  return () => clearInterval(timer);
}
