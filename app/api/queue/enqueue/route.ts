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
    const body = await request.json();
    const { 
      userId, 
      type, 
      priority = 'medium',
      payload,
      estimatedDuration = 1000,
      resourceRequirements = { cpu: 0.5, memory: 512 },
      maxRetries = 3,
      deadline,
      userTier = 'free'
    } = body;

    // Validate required fields
    if (!userId || !type || !payload) {
      return NextResponse.json(
        { error: 'userId, type, and payload are required' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['ai-model', 'search', 'recommendation', 'pricing', 'benchmark'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities = ['critical', 'high', 'medium', 'low'];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate user tier
    const validTiers = ['free', 'premium', 'enterprise'];
    if (!validTiers.includes(userTier)) {
      return NextResponse.json(
        { error: `Invalid userTier. Must be one of: ${validTiers.join(', ')}` },
        { status: 400 }
      );
    }

    const service = await getQueueService();
    
    const queueRequest = {
      userId,
      type,
      priority,
      payload,
      estimatedDuration,
      resourceRequirements,
      maxRetries,
      deadline: deadline ? new Date(deadline) : undefined,
      userTier
    };

    const result = await service.enqueue(queueRequest);

    return NextResponse.json({
      success: true,
      requestId: result.id,
      estimatedWaitTime: result.estimatedWaitTime,
      position: result.position,
      message: 'Request successfully queued',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Enqueue API error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Rate limit exceeded')) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            details: error.message
          },
          { status: 429 }
        );
      }
      
      if (error.message.includes('Circuit breaker is open')) {
        return NextResponse.json(
          { 
            error: 'Service temporarily unavailable',
            details: error.message
          },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to enqueue request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}