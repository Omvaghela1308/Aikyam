export interface JacketPart {
  k: string;
  nm: string;
  fn: string;
  loc: string;
  bus: string;
  ic: string;
  p?: [number, number, number];
  face?: 'front' | 'back' | 'inside';
  side?: 'left' | 'right';
  nopin?: boolean;
}
