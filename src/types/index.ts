export type UserRole = 'Supervisor' | 'Worker';

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string | number;
  badgeVariant?: 'safe' | 'warning' | 'danger' | 'info';
  children?: {
    title: string;
    href: string;
    description?: string;
  }[];
  roles?: UserRole[];
}

export type StatusType = 'safe' | 'warning' | 'danger' | 'offline';

export interface WorkerProfile {
  id: string;
  name: string;
  role: string;
  jacketId: string;
  zone: string;
  status: StatusType;
  heartRate: number;
  spo2: number;
  bodyTemp: number;
  gasExposure: string;
  battery: number;
  lastPing: string;
}

export interface AlertItem {
  id: string;
  title: string;
  category: 'Gas Leak' | 'Fall Detected' | 'High Temperature' | 'Low Oxygen' | 'SOS Emergency' | 'Radiation Spike';
  level: 'danger' | 'warning' | 'info';
  zone: string;
  timestamp: string;
  workerId?: string;
  workerName?: string;
  acknowledged: boolean;
}

export interface SensorSummary {
  id: string;
  name: string;
  type: string;
  value: string;
  unit: string;
  status: StatusType;
  zone: string;
  trend: 'up' | 'down' | 'stable';
}
