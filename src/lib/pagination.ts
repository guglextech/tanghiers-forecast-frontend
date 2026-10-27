import { asList } from '@/lib/api/resources';

export const PAGE_SIZE = 10;

export function readPage<T>(payload: unknown): { items: T[]; total: number } {
  const items = asList<T>(payload);
  const total =
    payload && typeof payload === 'object' && !Array.isArray(payload) && typeof (payload as { total?: number }).total === 'number'
      ? (payload as { total: number }).total
      : items.length;
  return { items, total };
}

export function pageCount(total: number, pageSize = PAGE_SIZE) {
  return Math.max(1, Math.ceil(total / pageSize));
}
