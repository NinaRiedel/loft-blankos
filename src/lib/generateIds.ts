export function generateIds(count: number): string[] {
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    ids.push(crypto.randomUUID());
  }
  return ids;
}

