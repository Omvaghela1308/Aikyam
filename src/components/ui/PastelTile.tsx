import React, { ReactNode } from 'react';
import Link from 'next/link';

export type PastelColor = 'blue' | 'peach' | 'yellow' | 'green' | 'lavender' | 'rose';

export interface PastelTileProps {
  title: string;
  subtitle?: string;
  metric?: string;
  unit?: string;
  icon: ReactNode;
  color?: PastelColor;
  href?: string;
  badge?: string;
  className?: string;
}

const colorStyles: Record<
  PastelColor,
  {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    iconBg: string;
  }
> = {
  blue: {
    bg: 'bg-[#E0F2FE]/70 hover:bg-[#E0F2FE]',
    border: 'border-[#BAE6FD]',
    text: 'text-[#0369A1]',
    badgeBg: 'bg-white/80',
    badgeText: 'text-[#0284C7]',
    iconBg: 'bg-white text-[#0284C7]',
  },
  peach: {
    bg: 'bg-[#FFEDD5]/70 hover:bg-[#FFEDD5]',
    border: 'border-[#FED7AA]',
    text: 'text-[#C2410C]',
    badgeBg: 'bg-white/80',
    badgeText: 'text-[#EA580C]',
    iconBg: 'bg-white text-[#EA580C]',
  },
  yellow: {
    bg: 'bg-[#FEF9C3]/70 hover:bg-[#FEF9C3]',
    border: 'border-[#FEF08A]',
    text: 'text-[#A16207]',
    badgeBg: 'bg-white/80',
    badgeText: 'text-[#CA8A04]',
    iconBg: 'bg-white text-[#CA8A04]',
  },
  green: {
    bg: 'bg-[#DCFCE7]/70 hover:bg-[#DCFCE7]',
    border: 'border-[#BBF7D0]',
    text: 'text-[#15803D]',
    badgeBg: 'bg-white/80',
    badgeText: 'text-[#16A34A]',
    iconBg: 'bg-white text-[#16A34A]',
  },
  lavender: {
    bg: 'bg-[#F3E8FF]/70 hover:bg-[#F3E8FF]',
    border: 'border-[#E9D5FF]',
    text: 'text-[#7E22CE]',
    badgeBg: 'bg-white/80',
    badgeText: 'text-[#9333EA]',
    iconBg: 'bg-white text-[#9333EA]',
  },
  rose: {
    bg: 'bg-[#FFE4E6]/70 hover:bg-[#FFE4E6]',
    border: 'border-[#FECDD3]',
    text: 'text-[#BE123C]',
    badgeBg: 'bg-white/80',
    badgeText: 'text-[#E11D48]',
    iconBg: 'bg-white text-[#E11D48]',
  },
};

export function PastelTile({
  title,
  subtitle,
  metric,
  unit,
  icon,
  color = 'blue',
  href,
  badge,
  className = '',
}: PastelTileProps) {
  const styles = colorStyles[color];

  const content = (
    <div
      className={`
        relative rounded-[20px] p-4.5 sm:p-5 border transition-all duration-200
        hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col justify-between
        ${styles.bg} ${styles.border} ${className}
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-2xs ${styles.iconBg}`}
        >
          {icon}
        </div>

        {badge && (
          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs ${styles.badgeBg} ${styles.badgeText}`}
          >
            {badge}
          </span>
        )}
      </div>

      <div>
        <h3 className={`text-base font-bold tracking-tight ${styles.text}`}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-[#475569] mt-0.5 line-clamp-1">{subtitle}</p>
        )}

        {metric && (
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-2xl font-black text-[#0F172A] tracking-tight font-mono">
              {metric}
            </span>
            {unit && <span className="text-xs font-semibold text-[#475569]">{unit}</span>}
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}

export default PastelTile;
