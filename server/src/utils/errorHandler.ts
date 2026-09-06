/**
 * Backend Error Sanitization Utility
 * Prevents internal database schemas, Prisma stack traces, SQL errors,
 * and system paths from leaking to the frontend client.
 */

export function sanitizeErrorMessage(
  error: any,
  fallbackMessage: string = 'Unable to process your request at this time. Please try again or contact support.'
): string {
  // Always log the full technical error to the server console for debugging
  console.error('[BACKEND_ERROR_OCCURRED]:', error);

  if (!error) return fallbackMessage;

  const rawMessage = typeof error === 'string' ? error : error?.message || '';
  if (!rawMessage) return fallbackMessage;

  const lower = rawMessage.toLowerCase();

  // Detect sensitive technical keywords, Prisma, SQL, DB columns, system file paths
  const technicalIndicators = [
    'prisma',
    'invocation',
    'column',
    'relation',
    'table',
    'database',
    'postgres',
    'select',
    'insert',
    'where',
    'join',
    'foreign key',
    'unique constraint',
    'syntax error',
    'does not exist',
    'invalid `prisma',
    '\\users\\',
    'c:\\',
    '/home/',
    '/var/',
    'at async',
    'stack trace',
    'etimedout',
    'econnrefused',
    'pgbouncer',
    'supabase'
  ];

  const hasTechnicalLeak = technicalIndicators.some((indicator) => lower.includes(indicator));

  if (hasTechnicalLeak) {
    return fallbackMessage;
  }

  // If it's a safe, clean message (e.g. business validation), return it
  return rawMessage;
}
