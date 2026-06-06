import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  type WASocket,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import path from 'path';
import qrcode from 'qrcode-terminal';
import { updateDonorReplyByPhone } from './store';

const AUTH_DIR = path.join(process.cwd(), 'auth_info');

// ─── Singleton ──────────────────────────────────────────────────
let sock: WASocket | null = null;
let connecting = false;

/**
 * Get or create the WhatsApp socket connection.
 * On first run, prints QR code to terminal for scanning.
 */
export async function getWhatsAppSocket(): Promise<WASocket> {
  if (sock) return sock;
  if (connecting) {
    // Wait for the ongoing connection attempt
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (sock) {
          clearInterval(interval);
          resolve(sock);
        }
      }, 500);
    });
  }

  connecting = true;

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const socket = makeWASocket({
    auth: state,
    browser: ['Al-Khidmat Matcher', 'Chrome', '1.0.0'],
  });

  // Persist credentials
  socket.ev.on('creds.update', saveCreds);

  // ─── Incoming message handler (YES/NO replies) ──────────────
  socket.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      // Allow testing from own number - don't skip fromMe early!
      if (!msg.message) continue;

      const body =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        '';

      const trimmed = body.trim().toLowerCase();
      const senderJid = msg.key.remoteJid || '';
      // Extract phone number from JID (remove @s.whatsapp.net)
      const phone = senderJid.split('@')[0];

      // Debug log for yes/no to ensure we see it
      if (trimmed === 'yes' || trimmed === 'no') {
        console.log(`[WhatsApp] Incoming "${trimmed}" from ${phone} (fromMe: ${msg.key.fromMe})`);

        const result = updateDonorReplyByPhone(
          phone,
          trimmed as 'yes' | 'no'
        );
        if (result) {
          console.log(
            `[WhatsApp] 📬 ${phone} replied "${trimmed}" → session ${result.sessionId}`
          );
        } else {
          console.log(`[WhatsApp] ⚠️ Could not find a pending request for phone ${phone}`);
        }
      }
    }
  });

  // Connection lifecycle + QR code display
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      sock = socket;
      connecting = false;
      resolve(socket);
    }, 30000);

    socket.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log('\n--- SCAN THIS QR CODE WITH WHATSAPP ---');
        console.log('Open WhatsApp → Linked Devices → Link a Device\n');
        qrcode.generate(qr, { small: true });
        console.log('----------------------------------------\n');
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        console.log(
          `[WhatsApp] Connection closed. Status: ${statusCode}. ` +
            (shouldReconnect ? 'Reconnecting...' : 'Logged out.')
        );

        sock = null;
        connecting = false;

        if (shouldReconnect) {
          getWhatsAppSocket();
        }
      } else if (connection === 'open') {
        console.log('[WhatsApp] ✅ Connected successfully');
        sock = socket;
        connecting = false;
        clearTimeout(timeout);
        resolve(socket);
      }
    });
  });
}

/**
 * Send a WhatsApp message to a single phone number.
 */
export async function sendWhatsAppMessage(
  jid: string,
  text: string
): Promise<boolean> {
  try {
    const socket = await getWhatsAppSocket();
    await socket.sendMessage(jid, { text });
    return true;
  } catch (error) {
    console.error(`[WhatsApp] Failed to send to ${jid}:`, error);
    return false;
  }
}

/**
 * Send messages to multiple recipients in parallel.
 */
export async function sendBulkWhatsApp(
  recipients: Array<{ jid: string; message: string }>
): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();

  const promises = recipients.map(async ({ jid, message }) => {
    const success = await sendWhatsAppMessage(jid, message);
    results.set(jid, success);
  });

  await Promise.all(promises);
  return results;
}

/**
 * Build the blood request message template.
 */
export function buildBloodRequestMessage(
  bloodGroup: string,
  location: string
): string {
  return (
    `🩸 *AL-KHIDMAT BLOOD REQUEST*\n\n` +
    `A patient in *${location}* urgently needs *${bloodGroup}* blood.\n\n` +
    `Can you donate today?\n` +
    `Reply *YES* or *NO*\n\n` +
    `— Al-Khidmat Foundation`
  );
}
