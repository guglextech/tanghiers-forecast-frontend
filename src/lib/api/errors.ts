export class ApiError extends Error {
  status: number;
  code: string | null;
  path?: string;

  constructor(message: string, status = 400, code: string | null = null, path?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.path = path;
  }
}

export function errorMessage(payload: unknown, fallback = 'Something went wrong.') {
  if (!payload || typeof payload !== 'object') return fallback;
  const body = payload as { message?: unknown; error?: unknown };
  if (Array.isArray(body.message)) return body.message.filter(Boolean).join(' ');
  if (typeof body.message === 'string' && body.message.trim()) return body.message;
  if (typeof body.error === 'string' && body.error.trim()) return body.error;
  return fallback;
}
