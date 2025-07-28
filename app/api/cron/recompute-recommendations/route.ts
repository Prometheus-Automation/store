import { NextRequest, NextResponse } from 'next/server';
import HybridRecommendationEngine from '@/services/recommendationService';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request from Vercel
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting recommendation engine recomputation...');
    
    const recommendationEngine = new HybridRecommendationEngine();
    
    // Reinitialize the engine with latest data
    await recommendationEngine.initializeEngine();
    
    // TODO: In production, implement batch processing for all users
    // For now, we'll just log the initialization
    console.log('Recommendation engine recomputed successfully');

    return NextResponse.json({
      success: true,
      message: 'Recommendations recomputed successfully',
      timestamp: new Date().toISOString(),
      stats: {
        // TODO: Add actual stats from the recommendation engine
        modelsProcessed: 0,
        usersProcessed: 0,
        executionTime: '0ms'
      }
    });

  } catch (error) {
    console.error('Recommendation cron job error:', error);
    return NextResponse.json(
      { 
        error: 'Recommendation recomputation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}