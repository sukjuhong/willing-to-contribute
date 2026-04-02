import { NextResponse } from 'next/server';
import { calculateMaintainerScore } from '../../../../recommended/maintainerScore';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const CACHE_TTL_SECONDS = 21600; // 6 hours — must match maintainerScore.ts

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> },
) {
  const { owner, repo } = await params;

  if (!owner || !repo || typeof owner !== 'string' || typeof repo !== 'string') {
    return NextResponse.json(
      { error: 'Invalid owner or repo parameter' },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  try {
    const score = await calculateMaintainerScore(owner, repo);

    return NextResponse.json(
      {
        owner,
        repo,
        grade: score.grade,
        avgResponseTimeHours: score.avgResponseTimeHours,
        avgMergeTimeHours: score.avgMergeTimeHours,
        mergeRate: score.mergeRate,
        ttl: CACHE_TTL_SECONDS,
      },
      { headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error(`Error fetching score for ${owner}/${repo}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
