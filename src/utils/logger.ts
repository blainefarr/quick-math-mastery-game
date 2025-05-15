
/**
 * Centralized logging utility with environment-aware logging
 * Only outputs logs in development environment to prevent data leakage in production
 */

// Environment detection - safer than process.env which may not be available in browser
const isDevelopment = (): boolean => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' || 
         window.location.hostname.includes('preview--');
};

// Log levels for filtering
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// The actual logger implementation
const logger = {
  info: (message: string, ...args: any[]): void => {
    if (isDevelopment()) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]): void => {
    if (isDevelopment()) {
      console.warn(`[WARN] ${message}`, ...args);
    } else if (args.some(arg => arg instanceof Error)) {
      // Always log warnings with errors in production, but without details
      console.warn(`[WARN] An operation failed`);
    }
  },
  
  error: (message: string, ...args: any[]): void => {
    // Errors are always logged, but with different detail levels
    if (isDevelopment()) {
      console.error(`[ERROR] ${message}`, ...args);
    } else {
      // In production, log the error without potentially sensitive details
      console.error(`[ERROR] An error occurred`);
      
      // Here you could add production error reporting like Sentry
      // sendToErrorReporting(message, args);
    }
  },
  
  debug: (message: string, ...args: any[]): void => {
    // Debug logs only in development
    if (isDevelopment()) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
};

export default logger;
