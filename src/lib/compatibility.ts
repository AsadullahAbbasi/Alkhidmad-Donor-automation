import type { BloodGroup } from './types';

/**
 * ABO/Rh compatibility matrix.
 * For each blood group a patient NEEDS, lists which donor blood groups
 * are compatible (can donate to that patient).
 *
 * Based on standard red-blood-cell transfusion rules:
 *   O−  → universal donor
 *   AB+ → universal recipient
 */
export const COMPATIBLE_DONORS: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

/**
 * Check if a donor's blood group is compatible with a patient's need.
 */
export function isBloodCompatible(
  donorBloodGroup: BloodGroup,
  patientNeeds: BloodGroup
): boolean {
  return COMPATIBLE_DONORS[patientNeeds].includes(donorBloodGroup);
}
