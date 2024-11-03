// src/app/api/getMinors/route.ts

import { NextResponse } from 'next/server';
import { getMinors } from '@/lib/getMinors';
import { Minor } from '@/types/Minor';

export async function GET() {
  try {
    const minors: Minor[] = await getMinors();

    const minorNames = minors.map((minor) => minor.name);

    return NextResponse.json({ minors: minorNames });
  } catch (error: any) {
    console.error('Error in GET /api/getMinors:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch minors.' },
      { status: 500 }
    );
  }
}
