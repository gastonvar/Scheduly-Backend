import { describe, expect, it } from 'vitest';
import { DISCOUNT_PER_REFERRAL, MAX_DISCOUNT } from '../../src/shared/constants.js';
import { applyDiscount, computeStudentDiscount } from '../../src/features/students/discounts.js';

describe('computeStudentDiscount', () => {
  it('returns 0 when there are no paid referral classes', () => {
    expect(computeStudentDiscount(['ref-1'], new Set())).toBe(0);
  });

  it('counts each paid referral once', () => {
    expect(computeStudentDiscount(['ref-1', 'ref-2'], new Set(['ref-1', 'ref-2']))).toBe(
      2 * DISCOUNT_PER_REFERRAL,
    );
  });

  it('caps discount at MAX_DISCOUNT', () => {
    const referrals = Array.from({ length: 10 }, (_, index) => `ref-${index}`);
    const paid = new Set(referrals);
    expect(computeStudentDiscount(referrals, paid)).toBe(MAX_DISCOUNT);
  });
});

describe('applyDiscount', () => {
  it('applies percentage discount', () => {
    expect(applyDiscount(1000, 10)).toBe(900);
  });
});
