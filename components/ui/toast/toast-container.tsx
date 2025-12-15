'use client';

import React from 'react';
import { AnimatePresence } from 'motion/react';
import { ToastComponent } from './toast';
import { useToastStore } from '@/libs/stores/toast.store';
import { cn } from '@/libs/utils';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4',
        'z-[9999]',
        'pointer-events-none',
        'space-y-3'
      )}
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto"
          >
            <ToastComponent
              toast={toast}
              onDismiss={removeToast}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};