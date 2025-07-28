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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelIds, benchmarkSuite, options } = body;

    if (!modelIds || !Array.isArray(modelIds) || modelIds.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 modelIds are required for comparison' },
        { status: 400 }
      );
    }

    if (!benchmarkSuite) {
      return NextResponse.json(
        { error: 'benchmarkSuite is required' },
        { status: 400 }
      );
    }

    const service = await getBenchmarkService();
    const comparison = await service.compareModels(modelIds, benchmarkSuite, options);

    return NextResponse.json({
      success: true,
      comparison,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Model comparison API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to compare models',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}