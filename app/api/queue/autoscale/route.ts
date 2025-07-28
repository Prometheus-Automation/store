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

export async function POST(request: NextRequest) {
  try {
    const service = await getQueueService();
    const result = await service.autoScale();

    return NextResponse.json({
      success: true,
      scaling: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Auto-scale API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform auto-scaling',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const service = await getQueueService();
    
    // Get current status to show scaling potential
    const status = await service.getQueueStatus();
    const analytics = await service.getAnalytics('hour');
    
    // Determine scaling recommendation without actually scaling
    const totalQueueLength = Object.values(status.queues).reduce((sum: number, q: any) => sum + q.length, 0);
    const avgWaitTime = analytics.latency.p95;
    const cpuUtilization = analytics.resource_utilization.cpu;
    
    let recommendation = 'maintain';
    let reason = 'Current capacity is optimal';
    
    if (totalQueueLength > 50 && avgWaitTime > 30000) {
      recommendation = 'scale-up';
      reason = `High queue length (${totalQueueLength}) and wait time (${avgWaitTime}ms)`;
    } else if (cpuUtilization > 0.8) {
      recommendation = 'scale-up';
      reason = `High CPU utilization (${Math.round(cpuUtilization * 100)}%)`;
    } else if (totalQueueLength < 5 && avgWaitTime < 5000 && cpuUtilization < 0.3) {
      recommendation = 'scale-down';
      reason = `Low demand: queue(${totalQueueLength}), wait(${avgWaitTime}ms), CPU(${Math.round(cpuUtilization * 100)}%)`;
    }

    return NextResponse.json({
      success: true,
      current_status: status,
      recommendation: {
        action: recommendation,
        reason,
        metrics: {
          queue_length: totalQueueLength,
          avg_wait_time: avgWaitTime,
          cpu_utilization: cpuUtilization
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Auto-scale status API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get auto-scale status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}