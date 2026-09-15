import { MIN_CLASS_DURATION_HOURS, PRICE_STEP } from '../../shared/constants.js';
import { applyDiscount } from '../students/discounts.js';

export type ClassUnitPrice = {
  basePrice: number;
  surchargePercent: number;
  finalPrice: number;
};

export function snapToValidPrice(value: number): number {
  const snapped = Math.round(value / PRICE_STEP) * PRICE_STEP;
  return Math.max(0, snapped);
}

export function computeClassPrice(
  subject: { pricePerHour: number },
  durationHours: number,
  surchargePercent: number,
): ClassUnitPrice {
  const safeDuration = Math.max(MIN_CLASS_DURATION_HOURS, durationHours);
  const safeSurcharge = Math.max(0, surchargePercent);
  const basePrice = subject.pricePerHour * safeDuration;
  const finalPrice = basePrice * (1 + safeSurcharge / 100);

  return {
    basePrice,
    surchargePercent: safeSurcharge,
    finalPrice,
  };
}

export function computeClassTotals(
  unitPrice: ClassUnitPrice,
  attendees: { discountPercent: number }[],
): ClassUnitPrice {
  if (attendees.length === 0) {
    return { basePrice: 0, finalPrice: 0, surchargePercent: unitPrice.surchargePercent };
  }

  return {
    basePrice: attendees.length * unitPrice.basePrice,
    finalPrice: attendees.reduce(
      (total, student) => total + applyDiscount(unitPrice.finalPrice, student.discountPercent),
      0,
    ),
    surchargePercent: unitPrice.surchargePercent,
  };
}

export function freeClassTotals(): ClassUnitPrice {
  return { basePrice: 0, surchargePercent: 0, finalPrice: 0 };
}

export function toMoneyInt(value: number): number {
  return Math.round(value);
}
