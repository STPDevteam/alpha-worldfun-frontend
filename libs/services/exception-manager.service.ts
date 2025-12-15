import { useToastStore, type ToastType } from '@/libs/stores/toast.store';

export enum ErrorCategory {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  WALLET = 'WALLET',
  UNKNOWN = 'UNKNOWN',
}

export interface CategorizedError {
  category: ErrorCategory;
  message: string;
  originalError?: Error;
  statusCode?: number;
  details?: Record<string, any>;
}

export class ExceptionManagerService {
  private static instance: ExceptionManagerService;

  private constructor() {}

  static getInstance(): ExceptionManagerService {
    if (!ExceptionManagerService.instance) {
      ExceptionManagerService.instance = new ExceptionManagerService();
    }
    return ExceptionManagerService.instance;
  }

  categorizeError(error: Error | any): CategorizedError {
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        category: ErrorCategory.NETWORK,
        message: 'Network connection failed. Please check your internet connection.',
        originalError: error,
      };
    }

    // HTTP errors from API responses
    if (error.response || error.status) {
      const statusCode = error.response?.status || error.status;
      return this.categorizeHttpError(statusCode, error);
    }

    // Wallet/Web3 errors
    if (error.code && typeof error.code === 'number') {
      return this.categorizeWalletError(error);
    }

    // Validation errors
    if (error.name === 'ValidationError' || error.message?.includes('validation')) {
      return {
        category: ErrorCategory.VALIDATION,
        message: error.message || 'Invalid input provided.',
        originalError: error,
      };
    }

    // Unknown errors
    return {
      category: ErrorCategory.UNKNOWN,
      message: error.message || 'An unexpected error occurred.',
      originalError: error,
    };
  }

  private categorizeHttpError(statusCode: number, error: any): CategorizedError {
    const details = error.response?.data || {};
    
    switch (statusCode) {
      case 400:
        return {
          category: ErrorCategory.VALIDATION,
          message: details.message || 'Invalid request. Please check your input.',
          statusCode,
          originalError: error,
          details,
        };
      
      case 401:
        return {
          category: ErrorCategory.AUTHENTICATION,
          message: 'Authentication required. Please sign in again.',
          statusCode,
          originalError: error,
          details,
        };
      
      case 403:
        return {
          category: ErrorCategory.AUTHORIZATION,
          message: 'Access denied. You do not have permission for this action.',
          statusCode,
          originalError: error,
          details,
        };
      
      case 404:
        return {
          category: ErrorCategory.NOT_FOUND,
          message: 'The requested resource was not found.',
          statusCode,
          originalError: error,
          details,
        };
      
      case 429:
        return {
          category: ErrorCategory.SERVER,
          message: 'Too many requests. Please try again later.',
          statusCode,
          originalError: error,
          details,
        };
      
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          category: ErrorCategory.SERVER,
          message: 'Server error. Please try again later.',
          statusCode,
          originalError: error,
          details,
        };
      
      default:
        return {
          category: ErrorCategory.SERVER,
          message: `Server returned ${statusCode} error.`,
          statusCode,
          originalError: error,
          details,
        };
    }
  }

  private categorizeWalletError(error: any): CategorizedError {
    const code = error.code;
    
    // Common Web3 error codes
    switch (code) {
      case 4001:
        return {
          category: ErrorCategory.WALLET,
          message: 'Transaction was rejected by user.',
          originalError: error,
        };
      
      case 4100:
        return {
          category: ErrorCategory.WALLET,
          message: 'The requested account and/or method has not been authorized.',
          originalError: error,
        };
      
      case 4200:
        return {
          category: ErrorCategory.WALLET,
          message: 'The requested method is not supported by this Ethereum provider.',
          originalError: error,
        };
      
      case 4900:
        return {
          category: ErrorCategory.WALLET,
          message: 'The provider is disconnected from all chains.',
          originalError: error,
        };
      
      case 4901:
        return {
          category: ErrorCategory.WALLET,
          message: 'The provider is disconnected from the specified chain.',
          originalError: error,
        };
      
      case -32002:
        return {
          category: ErrorCategory.WALLET,
          message: 'Request is already pending. Please wait.',
          originalError: error,
        };
      
      case -32603:
        return {
          category: ErrorCategory.WALLET,
          message: 'Internal wallet error occurred.',
          originalError: error,
        };
      
      default:
        return {
          category: ErrorCategory.WALLET,
          message: error.message || 'Wallet operation failed.',
          originalError: error,
        };
    }
  }

  getToastType(category: ErrorCategory): ToastType {
    switch (category) {
      case ErrorCategory.NETWORK:
      case ErrorCategory.SERVER:
        return 'error';
      
      case ErrorCategory.VALIDATION:
        return 'warning';
      
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        return 'warning';
      
      case ErrorCategory.NOT_FOUND:
        return 'info';
      
      case ErrorCategory.WALLET:
        return 'warning';
      
      default:
        return 'error';
    }
  }

  handleError(error: Error | any, options?: { showToast?: boolean; customMessage?: string }) {
    const { showToast = true, customMessage } = options || {};
    
    const categorizedError = this.categorizeError(error);
    
    // Log error for debugging
    console.error('[ExceptionManager]', {
      category: categorizedError.category,
      message: categorizedError.message,
      originalError: categorizedError.originalError,
      statusCode: categorizedError.statusCode,
      details: categorizedError.details,
    });

    if (showToast) {
      const toastType = this.getToastType(categorizedError.category);
      const message = customMessage || categorizedError.message;
      
      // Use the store directly for now, will be integrated with provider later
      useToastStore.getState().addToast({
        type: toastType,
        title: this.getCategoryTitle(categorizedError.category),
        description: message,
        duration: toastType === 'error' ? 8000 : 5000,
      });
    }

    return categorizedError;
  }

  private getCategoryTitle(category: ErrorCategory): string {
    switch (category) {
      case ErrorCategory.NETWORK:
        return 'Connection Error';
      case ErrorCategory.VALIDATION:
        return 'Invalid Input';
      case ErrorCategory.AUTHENTICATION:
        return 'Authentication Required';
      case ErrorCategory.AUTHORIZATION:
        return 'Access Denied';
      case ErrorCategory.NOT_FOUND:
        return 'Not Found';
      case ErrorCategory.SERVER:
        return 'Server Error';
      case ErrorCategory.WALLET:
        return 'Wallet Error';
      default:
        return 'Error';
    }
  }
}

export const exceptionManager = ExceptionManagerService.getInstance();