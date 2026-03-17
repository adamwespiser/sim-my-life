export interface LoggerConsole {
  debug: (message: string, payload?: unknown) => void;
  error: (message: string, payload?: unknown) => void;
  info: (message: string, payload?: unknown) => void;
  warn: (message: string, payload?: unknown) => void;
}

export interface Logger {
  debug: (event: string, payload?: unknown) => void;
  error: (event: string, payload?: unknown) => void;
  info: (event: string, payload?: unknown) => void;
  warn: (event: string, payload?: unknown) => void;
}

export interface CreateLoggerInput {
  console?: LoggerConsole;
  prefix?: string;
  verbose?: boolean;
}

const defaultConsole: LoggerConsole = {
  debug: console.debug.bind(console),
  error: console.error.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
};

export function createLogger(input: CreateLoggerInput = {}): Logger {
  const loggerConsole = input.console ?? defaultConsole;
  const prefix = input.prefix ?? "sim-returns:";
  const verbose = input.verbose ?? false;

  return {
    debug: (event, payload) => {
      if (!verbose) {
        return;
      }

      writeLog(loggerConsole.debug, prefix, event, payload);
    },
    error: (event, payload) => {
      writeLog(loggerConsole.error, prefix, event, payload);
    },
    info: (event, payload) => {
      writeLog(loggerConsole.info, prefix, event, payload);
    },
    warn: (event, payload) => {
      writeLog(loggerConsole.warn, prefix, event, payload);
    },
  };
}

function writeLog(
  logMethod: (message: string, payload?: unknown) => void,
  prefix: string,
  event: string,
  payload?: unknown,
) {
  const message = `${prefix} ${event}`;

  if (payload === undefined) {
    logMethod(message);
    return;
  }

  logMethod(message, payload);
}
