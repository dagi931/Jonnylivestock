/**
 * Frontend Error Sanitizer
 * Ensures that technical stack traces, database columns, Prisma errors,
 * server file paths, or raw backend crashes are NEVER displayed to customers.
 */

export function sanitizeClientError(
  rawError: any,
  fallbackMessage: string = 'Unable to process your request. Please try again or contact customer support.'
): string {
  if (!rawError) return fallbackMessage;

  const message = typeof rawError === 'string' ? rawError : rawError?.message || '';
  if (!message || typeof message !== 'string') return fallbackMessage;

  const lower = message.toLowerCase();

  // Check for any internal technical jargon, Prisma, SQL, filesystem paths, etc.
  const technicalSignatures = [
    'prisma',
    'invocation',
    'column',
    'database',
    'relation',
    'table',
    'postgres',
    'syntax error',
    'does not exist',
    'foreign key',
    'unique constraint',
    'invalid `',
    'at async',
    'stack trace',
    'c:\\',
    '\\users\\',
    '/server/',
    '/src/',
    'internal server error',
    'econnrefused',
    'etimedout',
    'select ',
    'insert into',
    'update ',
    'where ',
    'pgbouncer',
    'supabase'
  ];

  const hasLeak = technicalSignatures.some((sig) => lower.includes(sig));
  if (hasLeak) {
    return fallbackMessage;
  }

  // If the message is abnormally long (e.g. an unhandled HTML error page or trace dump), shield it
  if (message.length > 160) {
    return fallbackMessage;
  }

  return message;
}
