import React from 'react';

export type AvatarStatus = 'safe' | 'warning' | 'danger' | 'critical' | 'offline';

export interface AvatarProps {
  name: string;
  /** Job role; inspectors, rescuers and supervisors get a white helmet, everyone else yellow */
  role?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: AvatarStatus;
  className?: string;
}

export function getInitials(name: string): string {
  if (!name) return 'MG';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Stable hash so a worker gets the same face on every page
function hashName(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v + amount));
  return '#' + [clamp(n >> 16), clamp((n >> 8) & 255), clamp(n & 255)]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('');
}

const SKIN_TONES = ['#F1C27D', '#E0AC69', '#D19A62', '#C68642', '#A86B3C', '#8D5524'];
const BACKDROPS = ['#FEF3C7', '#DCFCE7', '#FEF3C7', '#EDE9FE', '#FFE4E6', '#CCFBF1'];
const HAIR_COLORS = ['#1F1A17', '#2B211C', '#3B2A20'];
const WHITE_HELMET_ROLES = /inspector|rescue|supervisor|command|controller/i;

/** Illustrated miner: hard hat with headlamp and hi-vis vest, derived from the name */
export function MinerFace({ name, role }: { name: string; role?: string }) {
  const h = hashName(name || 'MineGuard');
  const skin = SKIN_TONES[h % SKIN_TONES.length];
  const backdrop = BACKDROPS[(h >>> 5) % BACKDROPS.length];
  const hair = HAIR_COLORS[(h >>> 9) % HAIR_COLORS.length];
  const facialHair = (h >>> 12) % 3; // 0 none, 1 moustache, 2 moustache + beard
  const whiteHelmet = !!role && WHITE_HELMET_ROLES.test(role);
  const helmet = whiteHelmet ? '#F8FAFC' : '#FACC15';
  const helmetEdge = whiteHelmet ? '#CBD5E1' : '#CA8A04';

  return (
    <svg viewBox="0 0 64 64" className="w-full h-full block" aria-hidden="true">
      <rect width="64" height="64" fill={backdrop} />
      {/* Hi-vis vest with reflective strip */}
      <path d="M6 66c1-12 11-18 26-18s25 6 26 18z" fill="#F97316" />
      <path d="M26 48l6 7 6-7" fill="#1E3A5F" />
      <rect x="6" y="57" width="52" height="3.2" fill="#E2E8F0" opacity="0.95" />
      {/* Neck, ears, face */}
      <rect x="27.5" y="40" width="9" height="9" rx="3" fill={shade(skin, -18)} />
      <circle cx="20.5" cy="34" r="3" fill={shade(skin, -10)} />
      <circle cx="43.5" cy="34" r="3" fill={shade(skin, -10)} />
      <ellipse cx="32" cy="33.5" rx="11.5" ry="12.5" fill={skin} />
      {facialHair === 2 && (
        <path d="M22 36c1 9 5 13 10 13s9-4 10-13c-2 3-5 5-10 5s-8-2-10-5z" fill={hair} opacity="0.9" />
      )}
      <path d="M24.8 30.4h4.4M34.8 30.4h4.4" stroke={hair} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="27.2" cy="33.6" r="1.5" fill="#1E293B" />
      <circle cx="36.8" cy="33.6" r="1.5" fill="#1E293B" />
      <path d="M31.2 35.5c.4 1.4.4 2.3-.2 2.9" stroke={shade(skin, -35)} strokeWidth="1" fill="none" strokeLinecap="round" />
      {facialHair >= 1 && (
        <path d="M27 40.2c1.6-1.6 3.4-1.8 5-.6 1.6-1.2 3.4-1 5 .6-1.8.9-3.4 1-5 .2-1.6.8-3.2.7-5-.2z" fill={hair} />
      )}
      <path d="M28.6 42.6c2.2 1.4 4.6 1.4 6.8 0" stroke="#7F1D1D" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Hard hat with headlamp */}
      <path d="M18.5 28c0-9 6-14.5 13.5-14.5S45.5 19 45.5 28z" fill={helmet} stroke={helmetEdge} strokeWidth="0.8" />
      <path d="M32 13.8v14" stroke={helmetEdge} strokeWidth="1.2" opacity="0.55" />
      <rect x="14.5" y="26.4" width="35" height="3.8" rx="1.9" fill={helmet} stroke={helmetEdge} strokeWidth="0.8" />
      <rect x="28" y="18.2" width="8" height="6.4" rx="1.6" fill="#334155" />
      <circle cx="32" cy="21.4" r="2.1" fill="#FDE68A" />
    </svg>
  );
}

export function Avatar({ name, role, size = 'md', status, className = '' }: AvatarProps) {
  const sizeClasses = {
    xs: 'w-7 h-7',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14',
  }[size];

  const ringClasses = {
    safe: 'ring-2 ring-[#22C55E] ring-offset-2 ring-offset-white',
    warning: 'ring-2 ring-[#F59E0B] ring-offset-2 ring-offset-white',
    danger: 'ring-2 ring-[#EF4444] ring-offset-2 ring-offset-white',
    critical: 'ring-2 ring-[#EF4444] ring-offset-2 ring-offset-white animate-pulse',
    offline: 'ring-2 ring-[#94A3B8] ring-offset-2 ring-offset-white',
  };

  const statusDotClasses = {
    safe: 'bg-[#22C55E]',
    warning: 'bg-[#F59E0B]',
    danger: 'bg-[#EF4444]',
    critical: 'bg-[#EF4444] animate-ping',
    offline: 'bg-[#94A3B8]',
  };

  const dotSize = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  }[size];

  return (
    <div className="relative inline-flex flex-shrink-0 items-center justify-center">
      <div
        className={`
          flex items-center justify-center rounded-full overflow-hidden
          select-none border border-[#FDE68A] transition-transform
          ${sizeClasses}
          ${status ? ringClasses[status] : ''}
          ${className}
        `}
        title={name}
        role="img"
        aria-label={name}
      >
        <MinerFace name={name} role={role} />
      </div>

      {status && (
        <span
          className={`
            absolute bottom-0 right-0 rounded-full border-2 border-white
            ${dotSize} ${statusDotClasses[status]}
          `}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}

export default Avatar;
