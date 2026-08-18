/**
 * Shared logger utility for all backend services
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  error?: Error;
}

class Logger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  private formatLog(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message: `[${this.serviceName}] ${message}`,
      data,
    };
  }

  debug(message: string, data?: any) {
    console.debug(JSON.stringify(this.formatLog('debug', message, data)));
  }

  info(message: string, data?: any) {
    console.info(JSON.stringify(this.formatLog('info', message, data)));
  }

  warn(message: string, data?: any) {
    console.warn(JSON.stringify(this.formatLog('warn', message, data)));
  }

  error(message: string, error?: Error | string, data?: any) {
    const entry = this.formatLog('error', message, data);
    if (error instanceof Error) {
      entry.error = error;
    }
    console.error(JSON.stringify(entry));
  }
}

export default Logger;
