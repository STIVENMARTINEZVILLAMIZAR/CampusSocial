import type { Timestamp } from 'firebase/firestore';

type DateLike = Date | Timestamp | string | number | null | undefined;

export function toDate(value: DateLike): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate();
  }
  const d = new Date(value as string | number);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDateTime(value: DateLike): string {
  const d = toDate(value);
  if (!d) return '—';
  return d.toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatRelative(value: DateLike): string {
  const d = toDate(value);
  if (!d) return '—';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;
  return formatDateTime(d);
}
