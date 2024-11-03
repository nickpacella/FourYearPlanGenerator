// src/app/api/getPrerequisites/route.ts

import { NextResponse } from 'next/server';
import { getPrerequisites } from '@/lib/getPrerequisites';

export async function GET() {
  try {
    const prerequisitesMap = await getPrerequisites();
    return NextResponse.json({ prerequisites: prerequisitesMap });
  } catch (error: any) {
    console.error('Error fetching prerequisites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prerequisites' },
      { status: 500 }
    );
  }
}
