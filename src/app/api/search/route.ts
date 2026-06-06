import { NextRequest, NextResponse } from 'next/server';
import { loadDonors } from '@/lib/donors';
import { isEligible } from '@/lib/eligibility';
import { isBloodCompatible } from '@/lib/compatibility';
import { getSearchAreas } from '@/lib/adjacency';
import type { BloodGroup, KarachiArea } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bloodGroup, location } = body as {
      bloodGroup: BloodGroup;
      location: KarachiArea;
    };

    if (!bloodGroup || !location) {
      return NextResponse.json(
        { error: 'Blood group and location are required' },
        { status: 400 }
      );
    }

    // 1. Load all donors
    const allDonors = loadDonors();

    // 2. Get search areas (target + neighbors)
    const searchAreas = getSearchAreas(location);

    // 3. Apply filters in pipeline
    const matchedDonors = allDonors.filter((donor) => {
      // a) Proximity: donor must be in target or neighboring areas
      if (!searchAreas.includes(donor.location)) return false;

      // b) Eligibility: weight > 50 && last donation >= 90 days
      if (!isEligible(donor)) return false;

      // c) Blood compatibility
      if (!isBloodCompatible(donor.bloodGroup, bloodGroup)) return false;

      return true;
    });

    return NextResponse.json({
      donors: matchedDonors,
      count: matchedDonors.length,
      searchAreas,
      bloodGroup,
      location,
    });
  } catch (error) {
    console.error('[API /search] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
