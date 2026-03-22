export function createTicketIds(count: number): string[] {
    return Array.from({length: count}, () => crypto.randomUUID());
}
