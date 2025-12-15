'use client';

import React from 'react';
import { ToastContainer } from '@/components/ui/toast';

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
};