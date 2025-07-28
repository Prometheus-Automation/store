import { NextRequest, NextResponse } from 'next/server';
import BenchmarkingService from '@/services/benchmarkingService';

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
    const modelId = searchParams.get('modelId');
    const period = searchParams.get('period') as 'hour' | 'day' | 'week' | 'month' || 'day';

    if (!modelId) {
      return NextResponse.json(
        { error: 'modelId parameter is required' },
        { status: 400 }
      );
    }

    const service = await getBenchmarkService();
    const metrics = await service.getPerformanceMetrics(modelId, period);

    return NextResponse.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Performance metrics API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get performance metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}