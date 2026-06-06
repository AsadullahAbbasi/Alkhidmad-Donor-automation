import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import type { Donor, BloodGroup, KarachiArea } from './types';

const CSV_PATH = path.join(process.cwd(), '..', 'Untitled spreadsheet - Karachi_Eligible_Donors_Database.csv');
const JSON_PATH = path.join(process.cwd(), 'src', 'data', 'donors.json');

/**
 * Parse the CSV and return typed Donor objects.
 * Falls back to the pre-built JSON if CSV is unavailable.
 */
export function loadDonors(): Donor[] {
  // Try JSON cache first
  if (fs.existsSync(JSON_PATH)) {
    const raw = fs.readFileSync(JSON_PATH, 'utf-8');
    return JSON.parse(raw) as Donor[];
  }

  // Parse CSV
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`Donor database not found at ${CSV_PATH}`);
  }

  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as Record<string, string>[];

  const donors: Donor[] = records.map((r) => ({
    donorId: r['Donor ID'] || '',
    fullName: r['Full Name'] || '',
    gender: r['Gender'] || '',
    dob: r['DOB'] || '',
    age: parseInt(r['Age'], 10) || 0,
    bloodGroup: (r['Blood Group'] || '') as BloodGroup,
    lastDonationDate: r['Last Donation Date'] || null,
    weight: parseInt(r['Weight (kg)'], 10) || 0,
    city: r['City'] || 'Karachi',
    location: (r['Location'] || '') as KarachiArea,
    phone: r['Phone No'] || '',
  }));

  // Cache as JSON
  const dataDir = path.dirname(JSON_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(JSON_PATH, JSON.stringify(donors, null, 2));

  return donors;
}

/**
 * Format a local phone number to WhatsApp JID.
 * Prepends Pakistan country code 92 if not already present.
 */
export function toWhatsAppJid(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const withCountryCode = digits.startsWith('92') ? digits : `92${digits}`;
  return `${withCountryCode}@s.whatsapp.net`;
}
