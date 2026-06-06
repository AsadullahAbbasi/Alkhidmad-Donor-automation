import { getWhatsAppSocket } from '../lib/whatsapp';

console.log('--- WhatsApp Login ---');
console.log('Starting connection. QR code will appear below if not logged in.');
console.log('Scan with: WhatsApp → Linked Devices → Link a Device\n');

getWhatsAppSocket()
  .then(() => {
    console.log('\nSocket ready. Keep this terminal open while using the app.');
  })
  .catch((err) => {
    console.error('Failed to connect WhatsApp:', err);
    process.exit(1);
  });
