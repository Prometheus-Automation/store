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
    const { modelId, suiteId, options } = body;

    if (!modelId || !suiteId) {
      return NextResponse.json(
        { error: 'modelId and suiteId are required' },
        { status: 400 }
      );
    }

    const service = await getBenchmarkService();
    
    // Run the benchmark
    const result = await service.runBenchmark(modelId, suiteId, options);

    return NextResponse.json({
      success: true,
      result,
      message: 'Benchmark completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Benchmark API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run benchmark',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}