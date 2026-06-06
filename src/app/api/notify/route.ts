import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createSession, updateDonorStatus } from '@/lib/store';
import { toWhatsAppJid } from '@/lib/donors';
import {
  sendBulkWhatsApp,
  buildBloodRequestMessage,
} from '@/lib/whatsapp';
import type { Donor, DonorStatus, RequestSession } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bloodGroup, location, donors } = body as {
      bloodGroup: string;
      location: string;
      donors: Donor[];
    };

    if (!bloodGroup || !location || !donors?.length) {
      return NextResponse.json(
        { error: 'Blood group, location, and donors are required' },
        { status: 400 }
      );
    }

    // Build session
    const sessionId = uuidv4();
    const donorStatuses: DonorStatus[] = donors.map((d) => ({
      donorId: d.donorId,
      name: d.fullName,
      phone: d.phone,
      bloodGroup: d.bloodGroup,
      location: d.location,
      whatsappStatus: 'pending' as const,
      reply: 'pending' as const,
      repliedAt: null,
    }));

    const session: RequestSession = {
      id: sessionId,
      createdAt: new Date().toISOString(),
      bloodGroupNeeded: bloodGroup,
      targetLocation: location,
      donors: donorStatuses,
    };

    // Persist session
    createSession(session);

    // Build WhatsApp message
    const message = buildBloodRequestMessage(bloodGroup, location);

    // Send all messages in parallel
    const recipients = donors.map((d) => ({
      jid: toWhatsAppJid(d.phone),
      message,
    }));

    const results = await sendBulkWhatsApp(recipients);

    // Update statuses based on send results
    let sent = 0;
    let failed = 0;

    for (const donor of donors) {
      const jid = toWhatsAppJid(donor.phone);
      const success = results.get(jid) ?? false;

      updateDonorStatus(sessionId, donor.donorId, {
        whatsappStatus: success ? 'sent' : 'failed',
      });

      if (success) sent++;
      else failed++;
    }

    return NextResponse.json({
      sessionId,
      total: donors.length,
      sent,
      failed,
    });
  } catch (error) {
    console.error('[API /notify] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
