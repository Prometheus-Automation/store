import { NextRequest, NextResponse } from 'next/server';
import HybridRecommendationEngine from '@/services/recommendationService';

// Initialize the recommendation engine (in production, use singleton pattern)
let recommendationEngine: HybridRecommendationEngine | null = null;

async function getRecommendationEngine() {
  if (!recommendationEngine) {
    recommendationEngine = new HybridRecommendationEngine();
    await recommendationEngine.initializeEngine();
  }
  return recommendationEngine;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const count = parseInt(searchParams.get('count') || '10');
    const diversityWeight = parseFloat(searchParams.get('diversityWeight') || '0.3');
    const experimentGroup = searchParams.get('experimentGroup') as 'control' | 'treatment' | null;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    const engine = await getRecommendationEngine();
    
    let recommendations;
    if (experimentGroup) {
      recommendations = await engine.getRecommendationsWithExperiment(userId, experimentGroup);
    } else {
      recommendations = await engine.getRecommendations(userId, count, diversityWeight);
    }

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Recommendation API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, interaction } = body;

    if (!userId || !interaction) {
      return NextResponse.json(
        { error: 'userId and interaction parameters are required' },
        { status: 400 }
      );
    }

    const engine = await getRecommendationEngine();
    await engine.updateUserProfile(userId, interaction);

    return NextResponse.json({
      success: true,
      message: 'User profile updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('User profile update error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update user profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}