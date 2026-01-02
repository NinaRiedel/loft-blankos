import { randomUUID } from 'node:crypto';

export function generateIds(count: number): string[] {
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    ids.push(randomUUID());
  }
  return ids;
}

