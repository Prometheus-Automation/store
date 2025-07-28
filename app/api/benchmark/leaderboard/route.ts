import { NextRequest, NextResponse } from 'next/server';
import BenchmarkingService from '@/services/benchmarkingService';

// Force dynamic route for leaderboard API
export const dynamic = 'force-dynamic';

// Initialize the benchmarking service (singleton pattern)
let benchmarkService: BenchmarkingService | null = null;

async function getBenchmarkService() {
  if (!benchmarkService) {
    benchmarkService = new BenchmarkingService();
    await benchmarkService.initializeService();
  }
  return benchmarkService;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const suiteId = searchParams.get('suiteId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!category) {
      return NextResponse.json(
        { error: 'category parameter is required' },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    const service = await getBenchmarkService();
    const leaderboard = await service.getLeaderboard(category, suiteId, limit);

    return NextResponse.json({
      success: true,
      leaderboard,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get leaderboard',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}