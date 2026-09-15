import { describe, expect, it } from 'vitest';
import { PRICE_STEP } from '../../src/shared/constants.js';
import {
  computeClassPrice,
  computeClassTotals,
  snapToValidPrice,
} from '../../src/features/classes/class-price.js';

describe('snapToValidPrice', () => {
  it('snaps to nearest PRICE_STEP and never below 0', () => {
    expect(snapToValidPrice(374)).toBe(350);
    expect(snapToValidPrice(376)).toBe(400);
    expect(snapToValidPrice(300)).toBe(300);
    expect(snapToValidPrice(-20)).toBe(0);
    expect(snapToValidPrice(PRICE_STEP / 2)).toBe(PRICE_STEP);
  });
});

describe('computeClassPrice', () => {
  it('computes base and final price with surcharge', () => {
    expect(computeClassPrice({ pricePerHour: 500 }, 2, 10)).toEqual({
      basePrice: 1000,
      surchargePercent: 10,
      finalPrice: 1100,
    });
  });

  it('prices quarter-hour durations without rounding up to a full hour', () => {
    expect(computeClassPrice({ pricePerHour: 400 }, 0.25, 0)).toEqual({
      basePrice: 100,
      surchargePercent: 0,
      finalPrice: 100,
    });
    expect(computeClassPrice({ pricePerHour: 400 }, 1.5, 0)).toEqual({
      basePrice: 600,
      surchargePercent: 0,
      finalPrice: 600,
    });
  });
});

describe('computeClassTotals', () => {
  it('multiplies unit base by attendees and applies per-student discounts', () => {
    const unit = computeClassPrice({ pricePerHour: 350 }, 1, 0);
    expect(
      computeClassTotals(unit, [{ discountPercent: 0 }, { discountPercent: 10 }]),
    ).toEqual({
      basePrice: 700,
      surchargePercent: 0,
      finalPrice: 350 + 315,
    });
  });
});
