import { NextRequest, NextResponse } from 'next/server';
import TrustScoreService from '@/services/trustScoreService';

// Initialize the trust score service (singleton pattern)
let trustService: TrustScoreService | null = null;

async function getTrustService() {
  if (!trustService) {
    trustService = new TrustScoreService();
    await trustService.initializeService();
  }
  return trustService;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    const service = await getTrustService();
    const trustScore = await service.calculateTrustScore(userId);

    return NextResponse.json({
      success: true,
      trustScore,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Trust score API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to calculate trust score',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, behavior } = body;

    if (!userId || !behavior) {
      return NextResponse.json(
        { error: 'userId and behavior are required' },
        { status: 400 }
      );
    }

    const service = await getTrustService();
    
    // Track the behavior
    await service.trackUserBehavior({
      ...behavior,
      userId,
      timestamp: new Date(behavior.timestamp || Date.now())
    });

    // Recalculate trust score
    const updatedTrustScore = await service.calculateTrustScore(userId);

    return NextResponse.json({
      success: true,
      message: 'Behavior tracked successfully',
      trustScore: updatedTrustScore,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Behavior tracking error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to track behavior',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}