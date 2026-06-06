// ─── Donor (from CSV) ───────────────────────────────────────────
export interface Donor {
  donorId: string;
  fullName: string;
  gender: string;
  dob: string;
  age: number;
  bloodGroup: BloodGroup;
  lastDonationDate: string | null;
  weight: number;
  city: string;
  location: KarachiArea;
  phone: string;
}

// ─── Blood Groups ───────────────────────────────────────────────
export type BloodGroup =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'O+'
  | 'O-'
  | 'AB+'
  | 'AB-';

export const BLOOD_GROUPS: BloodGroup[] = [
  'O-',
  'O+',
  'A-',
  'A+',
  'B-',
  'B+',
  'AB-',
  'AB+',
];

// ─── Karachi Areas ──────────────────────────────────────────────
export type KarachiArea =
  | 'Gulshan-e-Iqbal'
  | 'Jamshed Town'
  | 'Korangi'
  | 'Landhi'
  | 'North Nazimabad'
  | 'New Karachi'
  | 'Saddar'
  | 'Lyari'
  | 'Malir'
  | 'Orangi'
  | 'Keamari'
  | 'Baldia'
  | 'SITE'
  | 'Gadap'
  | 'Shah Faisal';

export const KARACHI_AREAS: KarachiArea[] = [
  'Gulshan-e-Iqbal',
  'Jamshed Town',
  'Korangi',
  'Landhi',
  'North Nazimabad',
  'New Karachi',
  'Saddar',
  'Lyari',
  'Malir',
  'Orangi',
  'Keamari',
  'Baldia',
  'SITE',
  'Gadap',
  'Shah Faisal',
];

// ─── Runtime State ──────────────────────────────────────────────
export interface DonorStatus {
  donorId: string;
  name: string;
  phone: string;
  bloodGroup: string;
  location: string;
  whatsappStatus: 'pending' | 'sent' | 'failed';
  reply: 'pending' | 'yes' | 'no';
  repliedAt: string | null;
}

export interface RequestSession {
  id: string;
  createdAt: string;
  bloodGroupNeeded: string;
  targetLocation: string;
  donors: DonorStatus[];
}

export interface AppState {
  sessions: RequestSession[];
}
