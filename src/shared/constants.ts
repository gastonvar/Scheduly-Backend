export const PRICE_STEP = 50;
export const DISCOUNT_PER_REFERRAL = 10;
export const MAX_DISCOUNT = 50;

export const CONTACT_TYPES = ['Email', 'Phone', 'WhatsApp', 'Discord'] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];

export const CLASS_PAYMENT_STATUSES = ['paid', 'unpaid', 'free'] as const;
export type ClassPaymentStatus = (typeof CLASS_PAYMENT_STATUSES)[number];

export const SESSION_COOKIE_NAME = 'scheduly.sid';
export const CSRF_COOKIE_NAME = 'scheduly.csrf';
export const CSRF_HEADER_NAME = 'x-csrf-token';

export const SUBJECT_COLOR_PALETTE = [
  'oklch(0.55 0.18 293)',
  'oklch(0.58 0.16 200)',
  'oklch(0.62 0.17 145)',
  'oklch(0.58 0.19 25)',
  'oklch(0.55 0.15 320)',
  'oklch(0.6 0.14 85)',
  'oklch(0.52 0.14 250)',
  'oklch(0.58 0.12 170)',
  'oklch(0.56 0.17 55)',
  'oklch(0.54 0.16 10)',
] as const;

export function pickSubjectColor(usedColors: string[] = []): string {
  const available = SUBJECT_COLOR_PALETTE.filter((color) => !usedColors.includes(color));
  const pool = available.length > 0 ? available : SUBJECT_COLOR_PALETTE;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? 'oklch(0.55 0.18 293)';
}
