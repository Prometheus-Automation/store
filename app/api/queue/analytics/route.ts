import { NextRequest, NextResponse } from 'next/server';
import QueueService from '@/services/queueService';

// Initialize the queue service (singleton pattern)
let queueService: QueueService | null = null;

async function getQueueService() {
  if (!queueService) {
    queueService = new QueueService();
  }
  return queueService;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'hour' | 'day' | 'week' || 'hour';

    // Validate period
    const validPeriods = ['hour', 'day', 'week'];
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: `Invalid period. Must be one of: ${validPeriods.join(', ')}` },
        { status: 400 }
      );
    }

    const service = await getQueueService();
    const analytics = await service.getAnalytics(period);

    return NextResponse.json({
      success: true,
      period,
      analytics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Queue analytics API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get queue analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}