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
    const requestId = searchParams.get('requestId');

    const service = await getQueueService();

    if (requestId) {
      // Get specific request status
      const requestStatus = await service.getRequestStatus(requestId);
      
      return NextResponse.json({
        success: true,
        requestId,
        ...requestStatus,
        timestamp: new Date().toISOString()
      });
    } else {
      // Get overall queue status
      const queueStatus = await service.getQueueStatus();
      
      return NextResponse.json({
        success: true,
        status: queueStatus,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Queue status API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get queue status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, userId } = body;

    if (!requestId || !userId) {
      return NextResponse.json(
        { error: 'requestId and userId are required' },
        { status: 400 }
      );
    }

    const service = await getQueueService();
    const cancelled = await service.cancelRequest(requestId, userId);

    if (cancelled) {
      return NextResponse.json({
        success: true,
        message: 'Request cancelled successfully',
        requestId,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        { 
          error: 'Request not found or cannot be cancelled',
          requestId
        },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Cancel request API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to cancel request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}