// Which mine level each worker is on (0 = surface, 3 = deepest).
// Shared by the 3D map and the "Workers near you" list.
export const WORKER_LEVEL_MAP: Record<string, number> = {
  W1024: 3,
  W1025: 2,
  W1026: 3,
  W1027: 1,
  W1028: 3,
  W1029: 2,
  W1030: 0,
  W1031: 1,
  'WKR-101': 1,
  'WKR-102': 2,
  'WKR-103': 3,
  'WKR-104': 3,
  'WKR-105': 0,
  'WKR-106': 2,
};

/** Level for a worker; unknown IDs are spread across levels by list position */
export function getWorkerLevel(workerId: string, index: number): number {
  return WORKER_LEVEL_MAP[workerId] ?? index % 4;
}

// The logged-in worker's own jacket (the demo login always maps to this worker)
export const MY_WORKER_ID = 'W1026';
