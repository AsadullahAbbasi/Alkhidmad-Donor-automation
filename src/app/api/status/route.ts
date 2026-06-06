import { NextRequest, NextResponse } from 'next/server';
import { getSession, getLatestSession } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    let session;
    if (sessionId) {
      session = getSession(sessionId);
    } else {
      // If no sessionId provided, get the latest session
      session = getLatestSession();
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Compute stats
    const stats = {
      total: session.donors.length,
      sent: session.donors.filter((d) => d.whatsappStatus === 'sent').length,
      failed: session.donors.filter((d) => d.whatsappStatus === 'failed').length,
      pending: session.donors.filter((d) => d.reply === 'pending').length,
      accepted: session.donors.filter((d) => d.reply === 'yes').length,
      declined: session.donors.filter((d) => d.reply === 'no').length,
    };

    return NextResponse.json({ session, stats });
  } catch (error) {
    console.error('[API /status] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
