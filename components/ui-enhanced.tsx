'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = true, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-gradient-to-br from-slate-900/50 to-slate-900/20
        border border-amber-500/20 rounded-xl
        p-4 transition-all duration-300
        ${hover ? 'hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
}: ButtonProps) {
  const baseClasses = `
    font-semibold rounded-lg transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${loading ? 'opacity-70 cursor-not-allowed' : ''}
  `;

  const variantClasses = {
    primary: 'bg-amber-500 text-black hover:bg-amber-400 active:scale-95',
    secondary: 'bg-slate-700 text-white hover:bg-slate-600 active:scale-95',
    outline: 'border border-amber-500 text-amber-500 hover:bg-amber-500/10 active:scale-95',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {loading ? 'جاري...' : children}
    </button>
  );
}

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
}

export function Badge({ label, variant = 'info' }: BadgeProps) {
  const variantClasses = {
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5
        rounded-full text-xs font-medium
        border ${variantClasses[variant]}
      `}
    >
      {label}
    </span>
  );
}
