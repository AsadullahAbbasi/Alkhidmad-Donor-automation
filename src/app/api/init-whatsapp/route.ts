import { NextResponse } from 'next/server';
import { getWhatsAppSocket } from '@/lib/whatsapp';

export async function GET() {
  try {
    // This triggers the singleton's getWhatsAppSocket call
    // Which in turn prints the QR to terminal if not logged in
    await getWhatsAppSocket();
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'WhatsApp bridge activated. Check terminal for QR code if not connected.' 
    });
  } catch (error) {
    console.error('[API /init-whatsapp] Error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to init' }, { status: 500 });
  }
}
