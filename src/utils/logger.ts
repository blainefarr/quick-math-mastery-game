
// Logger utility for consistent logging across the application

// Log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Log category (optional) for filtering logs
type LogCategory = string | undefined;

// Whether to show debug logs in production
const SHOW_DEBUG = import.meta.env.MODE === 'development';

// Consistent color styling for different log levels
const LOG_STYLES = {
  debug: 'color: #6c757d',
  info: 'color: #0d6efd',
  warn: 'color: #fd7e14',
  error: 'color: #dc3545',
};

// Helper function to format the log output
const formatLog = (
  level: LogLevel, 
  message: string | object | Error, 
  category?: LogCategory, 
  ...args: any[]
) => {
  const timestamp = new Date().toISOString();
  
  // Format different types of messages
  let formattedMessage: string;
  
  if (message instanceof Error) {
    formattedMessage = `${message.name}: ${message.message}`;
    // Add error to args so the stack trace is visible in console
    args = [message, ...args];
  } else if (typeof message === 'object') {
    try {
      formattedMessage = JSON.stringify(message, null, 2);
    } catch (e) {
      formattedMessage = '[Unstringifiable object]';
      args = [message, ...args]; // Keep the original object in args
    }
  } else {
    formattedMessage = message;
  }
  
  // Add category to the log format if provided
  const categoryStr = category ? `[${category}] ` : '';
  
  // Style the log based on level
  console.log(
    `%c[${level.toUpperCase()}] ${timestamp}: ${categoryStr}`,
    LOG_STYLES[level], 
    formattedMessage, 
    ...args
  );
};

// Logger object with methods for each log level
const logger = {
  debug: (message: string | object | Error, categoryOrArgs?: LogCategory | any, ...args: any[]) => {
    if (SHOW_DEBUG) {
      // Handle optional category parameter
      if (typeof categoryOrArgs === 'string') {
        formatLog('debug', message, categoryOrArgs, ...args);
      } else {
        formatLog('debug', message, undefined, categoryOrArgs, ...args);
      }
    }
  },
  info: (message: string | object | Error, categoryOrArgs?: LogCategory | any, ...args: any[]) => {
    // Handle optional category parameter
    if (typeof categoryOrArgs === 'string') {
      formatLog('info', message, categoryOrArgs, ...args);
    } else {
      formatLog('info', message, undefined, categoryOrArgs, ...args);
    }
  },
  warn: (message: string | object | Error, categoryOrArgs?: LogCategory | any, ...args: any[]) => {
    // Handle optional category parameter
    if (typeof categoryOrArgs === 'string') {
      formatLog('warn', message, categoryOrArgs, ...args);
    } else {
      formatLog('warn', message, undefined, categoryOrArgs, ...args);
    }
  },
  error: (message: string | object | Error, categoryOrArgs?: LogCategory | any, ...args: any[]) => {
    // Handle optional category parameter
    if (typeof categoryOrArgs === 'string') {
      formatLog('error', message, categoryOrArgs, ...args);
    } else {
      formatLog('error', message, undefined, categoryOrArgs, ...args);
    }
  }
};

export default logger;
