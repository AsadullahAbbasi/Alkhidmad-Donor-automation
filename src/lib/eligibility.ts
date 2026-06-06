import type { Donor } from './types';

/**
 * A donor is INELIGIBLE if any of these are true:
 *   1. Weight is 50 kg or below
 *   2. Last donation was less than 90 days ago
 *
 * Donors with no lastDonationDate are considered eligible
 * (they haven't donated recently, or ever).
 */
export function isEligible(donor: Donor, today: Date = new Date()): boolean {
  // Rule 1: Must weigh more than 50 kg
  if (donor.weight <= 50) return false;

  // Rule 2: Must not have donated in the last 90 days
  if (donor.lastDonationDate) {
    const lastDonation = new Date(donor.lastDonationDate);
    const diffMs = today.getTime() - lastDonation.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 90) return false;
  }

  return true;
}
