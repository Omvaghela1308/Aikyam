import React, { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'flat' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function Card({
  children,
  variant = 'default',
  padding = 'lg',
  className = '',
  ...props
}: CardProps) {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  }[padding];

  const variantClasses = {
    default:
      'bg-white rounded-[22px] border border-[#E2E8F0] shadow-[0_8px_25px_rgba(15,23,42,0.06),_0_2px_4px_rgba(217,119,6,0.04)] transition-all duration-300 hover:shadow-[0_16px_35px_rgba(217,119,6,0.12),_0_4px_10px_rgba(15,23,42,0.06)] hover:-translate-y-1 hover:border-[#FDE68A]',
    flat:
      'bg-white rounded-[22px] border border-[#E2E8F0] shadow-[0_4px_12px_rgba(15,23,42,0.04)] transition-all duration-300 hover:shadow-[0_10px_25px_rgba(15,23,42,0.08)]',
    interactive:
      'bg-white rounded-[22px] border border-[#E2E8F0] shadow-[0_8px_25px_rgba(15,23,42,0.06),_0_2px_4px_rgba(217,119,6,0.04)] transition-all duration-300 hover:shadow-[0_18px_40px_rgba(217,119,6,0.15)] hover:border-[#FBBF24] hover:-translate-y-1.5 cursor-pointer',
  }[variant];

  return (
    <div className={`${variantClasses} ${paddingClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
