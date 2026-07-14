export const IMPROVE_COOLDOWN_DAYS = 15;
const COOLDOWN_MS = IMPROVE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

export function canImproveNow(lastUpdatedAt: Date, now: Date = new Date()): boolean {
  return now.getTime() - lastUpdatedAt.getTime() >= COOLDOWN_MS;
}

export function nextEligibleDate(lastUpdatedAt: Date): Date {
  return new Date(lastUpdatedAt.getTime() + COOLDOWN_MS);
}

export function daysRemaining(lastUpdatedAt: Date, now: Date = new Date()): number {
  const ms = nextEligibleDate(lastUpdatedAt).getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}
