import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
}

export function PillButton({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  ...props
}: PillButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-sm hover:shadow-[0_4px_12px_rgba(2,132,199,0.25)] border border-transparent',
    secondary:
      'bg-white text-[#0284C7] border border-[#BAE6FD] hover:bg-[#E0F2FE]/50 shadow-xs',
    ghost:
      'bg-transparent text-[#475569] hover:text-[#0284C7] hover:bg-[#F1F5F9]',
    danger:
      'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-sm hover:shadow-[0_4px_12px_rgba(239,68,68,0.25)] border border-transparent',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </button>
  );
}

export default PillButton;
