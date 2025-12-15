import { useCallback } from 'react';
import { useToastStore, type Toast, type ToastType } from '@/libs/stores/toast.store';

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
  dismissible?: boolean;
}

export const useToast = () => {
  const { addToast, removeToast, clearAllToasts } = useToastStore();

  const toast = useCallback((type: ToastType, options: ToastOptions) => {
    addToast({
      type,
      ...options,
    });
  }, [addToast]);

  // Convenience methods
  const success = useCallback((options: ToastOptions) => {
    toast('success', options);
  }, [toast]);

  const error = useCallback((options: ToastOptions) => {
    toast('error', options);
  }, [toast]);

  const warning = useCallback((options: ToastOptions) => {
    toast('warning', options);
  }, [toast]);

  const info = useCallback((options: ToastOptions) => {
    toast('info', options);
  }, [toast]);

  return {
    toast,
    success,
    error,
    warning,
    info,
    dismiss: removeToast,
    clear: clearAllToasts,
  };
};