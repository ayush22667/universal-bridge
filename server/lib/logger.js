const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const LOG_LEVEL = process.env.LOG_LEVEL;
if (!LOG_LEVEL || !(LOG_LEVEL in LEVELS)) {
  throw new Error('LOG_LEVEL environment variable is required (debug | info | warn | error)');
}
const MIN_LEVEL = LEVELS[LOG_LEVEL];

export function log(level, message, meta = {}) {
  if (LEVELS[level] < MIN_LEVEL) return;

  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  if (level === 'error') {
    console.error(JSON.stringify(logEntry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    log('info', 'Request completed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${Date.now() - start}ms`,
      ip: req.ip,
    });
  });

  next();
}
