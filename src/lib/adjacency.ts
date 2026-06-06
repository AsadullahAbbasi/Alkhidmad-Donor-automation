import type { KarachiArea } from './types';

/**
 * Adjacency map of 15 Karachi areas.
 * Derived from the city's district / subdivision geography.
 *
 * District Central  → North Nazimabad, New Karachi
 * District East     → Gulshan-e-Iqbal, Jamshed Town
 * District South    → Saddar, Lyari, Keamari
 * District West     → SITE, Baldia, Orangi
 * District Korangi  → Korangi, Landhi, Shah Faisal
 * District Malir    → Malir, Gadap
 */
export const ADJACENCY: Record<KarachiArea, KarachiArea[]> = {
  'Gulshan-e-Iqbal': ['Jamshed Town', 'North Nazimabad', 'Shah Faisal', 'Korangi'],
  'Jamshed Town': ['Gulshan-e-Iqbal', 'Saddar', 'Shah Faisal', 'Lyari'],
  'Korangi': ['Gulshan-e-Iqbal', 'Landhi', 'Shah Faisal', 'Malir'],
  'Landhi': ['Korangi', 'Malir', 'Shah Faisal', 'Gadap'],
  'North Nazimabad': ['Gulshan-e-Iqbal', 'New Karachi', 'Orangi', 'SITE'],
  'New Karachi': ['North Nazimabad', 'Orangi', 'Gadap', 'SITE'],
  'Saddar': ['Jamshed Town', 'Lyari', 'Keamari', 'SITE'],
  'Lyari': ['Saddar', 'Jamshed Town', 'Keamari', 'Baldia'],
  'Malir': ['Korangi', 'Landhi', 'Gadap', 'Shah Faisal'],
  'Orangi': ['North Nazimabad', 'New Karachi', 'Baldia', 'SITE'],
  'Keamari': ['Saddar', 'Lyari', 'Baldia', 'SITE'],
  'Baldia': ['Lyari', 'Orangi', 'Keamari', 'SITE'],
  'SITE': ['North Nazimabad', 'Saddar', 'Orangi', 'Keamari', 'Baldia', 'New Karachi'],
  'Gadap': ['New Karachi', 'Malir', 'Landhi'],
  'Shah Faisal': ['Gulshan-e-Iqbal', 'Jamshed Town', 'Korangi', 'Landhi', 'Malir'],
};

/**
 * Returns the target area plus all its neighboring areas.
 */
export function getSearchAreas(target: KarachiArea): KarachiArea[] {
  return [target, ...(ADJACENCY[target] || [])];
}
