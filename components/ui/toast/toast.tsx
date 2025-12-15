'use client';

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/libs/utils';
import type { Toast, ToastType } from '@/libs/stores/toast.store';

const toastVariants = {
  success: {
    bgColor: 'bg-green-100 dark:bg-green-900',
    borderColor: 'border-green-500 dark:border-green-700',
    textColor: 'text-green-900 dark:text-green-100',
    iconColor: 'text-green-600',
    hoverBg: 'hover:bg-green-200 dark:hover:bg-green-800',
  },
  info: {
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    borderColor: 'border-blue-500 dark:border-blue-700',
    textColor: 'text-blue-900 dark:text-blue-100',
    iconColor: 'text-blue-600',
    hoverBg: 'hover:bg-blue-200 dark:hover:bg-blue-800',
  },
  warning: {
    bgColor: 'bg-yellow-100 dark:bg-yellow-900',
    borderColor: 'border-yellow-500 dark:border-yellow-700',
    textColor: 'text-yellow-900 dark:text-yellow-100',
    iconColor: 'text-yellow-600',
    hoverBg: 'hover:bg-yellow-200 dark:hover:bg-yellow-800',
  },
  error: {
    bgColor: 'bg-red-100 dark:bg-red-900',
    borderColor: 'border-red-500 dark:border-red-700',
    textColor: 'text-red-900 dark:text-red-100',
    iconColor: 'text-red-600',
    hoverBg: 'hover:bg-red-200 dark:hover:bg-red-800',
  },
};

const ToastIcon = ({ className }: { type: ToastType; className?: string }) => (
  <svg
    stroke="currentColor"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      strokeWidth={2}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export const ToastComponent: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const variant = toastVariants[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, y: 100, scale: 0.3 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn(
        'relative',
        'border-l-4',
        'p-3',
        'rounded-lg',
        'flex items-start',
        'transition duration-300 ease-in-out',
        'transform hover:scale-105',
        'shadow-lg',
        'min-w-[320px] max-w-[420px]',
        variant.bgColor,
        variant.borderColor,
        variant.textColor,
        variant.hoverBg
      )}
      role="alert"
    >
      <ToastIcon
        type={toast.type}
        className={cn('h-5 w-5 flex-shrink-0 mr-3 mt-0.5', variant.iconColor)}
      />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-xs mt-1 opacity-90 leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>
      
      {toast.dismissible && (
        <button
          onClick={() => onDismiss(toast.id)}
          className={cn(
            'ml-2 flex-shrink-0',
            'p-1 rounded-full',
            'opacity-60 hover:opacity-100',
            'transition-opacity duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            variant.iconColor
          )}
          aria-label="Dismiss notification"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </motion.div>
  );
};