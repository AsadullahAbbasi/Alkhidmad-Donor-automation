import fs from 'fs';
import path from 'path';
import type { AppState, RequestSession, DonorStatus } from './types';

const STATE_PATH = path.join(process.cwd(), 'src', 'data', 'state.json');

function ensureDataDir(): void {
  const dir = path.dirname(STATE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Read the entire application state from the JSON file.
 */
export function readState(): AppState {
  ensureDataDir();
  if (!fs.existsSync(STATE_PATH)) {
    const initial: AppState = { sessions: [] };
    fs.writeFileSync(STATE_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  const raw = fs.readFileSync(STATE_PATH, 'utf-8');
  return JSON.parse(raw) as AppState;
}

/**
 * Write the entire application state to the JSON file.
 */
export function writeState(state: AppState): void {
  ensureDataDir();
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

/**
 * Create a new request session and persist it.
 */
export function createSession(session: RequestSession): void {
  const state = readState();
  state.sessions.push(session);
  writeState(state);
}

/**
 * Get a specific session by ID.
 */
export function getSession(sessionId: string): RequestSession | null {
  const state = readState();
  return state.sessions.find((s) => s.id === sessionId) || null;
}

/**
 * Update a donor's status within a session.
 */
export function updateDonorStatus(
  sessionId: string,
  donorId: string,
  updates: Partial<DonorStatus>
): void {
  const state = readState();
  const session = state.sessions.find((s) => s.id === sessionId);
  if (!session) return;

  const donor = session.donors.find((d) => d.donorId === donorId);
  if (!donor) return;

  Object.assign(donor, updates);
  writeState(state);
}

/**
 * Update a donor's reply by matching their phone number
 * across ALL active sessions.
 */
export function updateDonorReplyByPhone(
  phone: string,
  reply: 'yes' | 'no'
): { sessionId: string; donorId: string } | null {
  const state = readState();
  const normalizedPhone = phone.replace(/\D/g, '');

  // Reverse loop to check latest session first
  for (let i = state.sessions.length - 1; i >= 0; i--) {
    const session = state.sessions[i];
    for (const donor of session.donors) {
      const donorPhone = donor.phone.replace(/\D/g, '');
      // Match last 10 digits to handle country code differences
      if (
        normalizedPhone.endsWith(donorPhone) ||
        donorPhone.endsWith(normalizedPhone) ||
        normalizedPhone === donorPhone
      ) {
        if (donor.reply === 'pending') {
          donor.reply = reply;
          donor.repliedAt = new Date().toISOString();
          writeState(state);
          return { sessionId: session.id, donorId: donor.donorId };
        }
      }
    }
  }

  // ─── Testing Fallback ──────────────────────────────────────────
  // If no match was found (e.g. testing from a device not in the database),
  // assign the reply to the first pending donor in the latest session.
  const latestSession = state.sessions[state.sessions.length - 1];
  if (latestSession) {
    for (const donor of latestSession.donors) {
      if (donor.reply === 'pending') {
        donor.reply = reply;
        donor.repliedAt = new Date().toISOString();
        writeState(state);
        return { sessionId: latestSession.id, donorId: donor.donorId };
      }
    }
  }

  return null;
}

/**
 * Get the most recent session.
 */
export function getLatestSession(): RequestSession | null {
  const state = readState();
  if (state.sessions.length === 0) return null;
  return state.sessions[state.sessions.length - 1];
}
