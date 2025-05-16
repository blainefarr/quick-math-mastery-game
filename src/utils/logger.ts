
// Logger utility for consistent logging across the application

// Log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

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
const formatLog = (level: LogLevel, message: string | object, ...args: any[]) => {
  const timestamp = new Date().toISOString();
  
  // Format different types of messages
  const formattedMessage = typeof message === 'object' 
    ? JSON.stringify(message, null, 2)
    : message;
  
  // Style the log based on level
  console.log(`%c[${level.toUpperCase()}] ${timestamp}:`, LOG_STYLES[level], formattedMessage, ...args);
};

// Logger object with methods for each log level
const logger = {
  debug: (message: string | object, ...args: any[]) => {
    if (SHOW_DEBUG) {
      formatLog('debug', message, ...args);
    }
  },
  info: (message: string | object, ...args: any[]) => {
    formatLog('info', message, ...args);
  },
  warn: (message: string | object, ...args: any[]) => {
    formatLog('warn', message, ...args);
  },
  error: (message: string | object, ...args: any[]) => {
    formatLog('error', message, ...args);
  }
};

export default logger;
