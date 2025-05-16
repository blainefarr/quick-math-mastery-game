
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
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// Define which log levels should be shown in production (only errors by default)
const PRODUCTION_LOG_LEVELS: LogLevel[] = ['error'];

// Control verbose logging of specific modules (even in dev mode)
const VERBOSE_MODULES: Record<string, boolean> = {
  auth: false,      // Set to true to enable detailed auth logs
  scores: false,    // Set to true to enable detailed score fetching logs
  profiles: false,  // Set to true to enable detailed profile logs
};

// Check if a specific module should log verbosely
const isVerbose = (module?: string): boolean => {
  if (!module) return true; // Default to verbose if no module specified
  return !!VERBOSE_MODULES[module];
};

// The actual logger implementation
const logger = {
  info: (message: string, ...args: any[]): void => {
    if (isDevelopment()) {
      console.info(`[INFO] ${message}`, ...args);
    } else if (PRODUCTION_LOG_LEVELS.includes('info')) {
      // In production, log with less detail
      console.info(`[INFO] ${message}`);
    }
  },
  
  warn: (message: string, ...args: any[]): void => {
    if (isDevelopment()) {
      console.warn(`[WARN] ${message}`, ...args);
    } else if (PRODUCTION_LOG_LEVELS.includes('warn') || args.some(arg => arg instanceof Error)) {
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
  
  // Updated to accept either a message string or an object as first parameter
  debug: (messageOrData: string | Record<string, any>, moduleOrData?: string | any, ...args: any[]): void => {
    // Skip logging in production altogether
    if (!isDevelopment()) return;
    
    // Handle different parameter patterns
    if (typeof messageOrData === 'string') {
      // Standard pattern: debug(message, module?, ...args)
      const message = messageOrData;
      const module = typeof moduleOrData === 'string' ? moduleOrData : undefined;
      
      // Only log if module is verbose or not specified
      if (isVerbose(module)) {
        const modulePrefix = module ? `[${module}]` : '';
        console.debug(`[DEBUG]${modulePrefix} ${message}`, ...(typeof moduleOrData === 'string' ? args : [moduleOrData, ...args]));
      }
    } else {
      // Object pattern: debug(dataObject)
      console.debug('[DEBUG]', messageOrData);
    }
  },
  
  // Module-specific logging with automatic verbosity filtering
  auth: {
    debug: (message: string, ...args: any[]): void => {
      logger.debug(message, 'auth', ...args);
    },
    info: (message: string, ...args: any[]): void => {
      if (isVerbose('auth')) {
        logger.info(`[auth] ${message}`, ...args);
      }
    }
  },
  
  scores: {
    debug: (message: string, ...args: any[]): void => {
      logger.debug(message, 'scores', ...args);
    },
    info: (message: string, ...args: any[]): void => {
      if (isVerbose('scores')) {
        logger.info(`[scores] ${message}`, ...args);
      }
    }
  }
};

export default logger;
