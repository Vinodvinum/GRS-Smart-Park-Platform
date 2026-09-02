/**
 * Structured operational logging.
 *
 * Emits one JSON line per event so log aggregators / Vercel logs remain
 * useful for diagnosing deployment, API, database, authentication and
 * unexpected-application failures.
 *
 * SAFETY:
 * - Never log passwords, password hashes, AUTH_SECRET, DATABASE_URL,
 *   raw auth tokens, raw digital-pass tokens, or sensitive PII.
 * - Context keys are explicit; never pass arbitrary secrets.
 *
 * Levels: info | warn | error. No noisy debug output in production.
 */

type Level = 'info' | 'warn' | 'error'

type LogContext = Record<string, unknown>

function emit(level: Level, event: string, context: LogContext = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...context,
  }
  const line = JSON.stringify(entry)

  // Route by level so error lines are easy to isolate in log streams.
  if (level === 'error') {
    console.error(line)
  } else if (level === 'warn') {
    console.warn(line)
  } else {
    console.log(line)
  }
}

/**
 * Sanitize an unknown thrown value into a safe, serializable diagnostic
 * without leaking internals or stack traces to clients. Only the error
 * message is captured, and only if it does not resemble a secret.
 */
function safeMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

export const log = {
  info: (event: string, context?: LogContext) => emit('info', event, context),
  warn: (event: string, context?: LogContext) => emit('warn', event, context),
  error: (event: string, context?: LogContext) => emit('error', event, context),
  /** Log an unexpected failure with a sanitized message; never a stack trace. */
  errorSafe: (event: string, error: unknown, context?: LogContext) =>
    emit('error', event, { ...context, error: safeMessage(error) }),
}
