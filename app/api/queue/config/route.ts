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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { loadBalancingStrategy } = body;

    if (!loadBalancingStrategy) {
      return NextResponse.json(
        { error: 'loadBalancingStrategy is required' },
        { status: 400 }
      );
    }

    // Validate strategy
    const validStrategies = ['round-robin', 'least-connections', 'weighted-response-time', 'resource-aware'];
    if (!validStrategies.includes(loadBalancingStrategy.name)) {
      return NextResponse.json(
        { error: `Invalid strategy. Must be one of: ${validStrategies.join(', ')}` },
        { status: 400 }
      );
    }

    const service = await getQueueService();
    await service.updateLoadBalancingStrategy(loadBalancingStrategy);

    return NextResponse.json({
      success: true,
      message: 'Load balancing strategy updated successfully',
      strategy: loadBalancingStrategy,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Queue config API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update queue configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return current configuration options and documentation
    const configuration = {
      loadBalancingStrategies: [
        {
          name: 'round-robin',
          description: 'Distributes requests evenly across all available workers',
          use_case: 'Simple, fair distribution when all workers have similar capabilities'
        },
        {
          name: 'least-connections',
          description: 'Routes requests to workers with the fastest average processing time',
          use_case: 'When workers have different performance characteristics'
        },
        {
          name: 'weighted-response-time',
          description: 'Considers both response time and success rate when selecting workers',
          use_case: 'Balanced approach considering both speed and reliability'
        },
        {
          name: 'resource-aware',
          description: 'Matches request resource requirements with worker capabilities',
          use_case: 'When requests have varying resource needs (CPU, memory, GPU)'
        }
      ],
      rateLimits: {
        free: { requests: 10, window: '1 minute' },
        premium: { requests: 100, window: '1 minute' },
        enterprise: { requests: 1000, window: '1 minute' }
      },
      priorityLevels: ['critical', 'high', 'medium', 'low'],
      requestTypes: ['ai-model', 'search', 'recommendation', 'pricing', 'benchmark'],
      userTiers: ['free', 'premium', 'enterprise'],
      circuitBreaker: {
        failure_threshold: 5,
        recovery_timeout: '1 minute'
      },
      autoScaling: {
        scale_up_triggers: [
          'Queue length > 50 AND wait time > 30 seconds',
          'CPU utilization > 80%'
        ],
        scale_down_triggers: [
          'Queue length < 5 AND wait time < 5 seconds AND CPU < 30%'
        ]
      }
    };

    return NextResponse.json({
      success: true,
      configuration,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Queue config GET API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get queue configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}