import { exceptionManager } from '@/libs/services/exception-manager.service';

export const handleWagmiError = (error: any, customMessage?: string) => {
  exceptionManager.handleError(error, { 
    showToast: true, 
    customMessage 
  });
};

export const createWagmiErrorHandler = (context: string) => {
  return (error: any) => {
    handleWagmiError(error, `${context} failed`);
  };
};