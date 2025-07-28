import { NextRequest, NextResponse } from 'next/server';
import DynamicPricingEngine from '@/services/pricingService';

// Initialize the pricing engine (in production, use singleton pattern)
let pricingEngine: DynamicPricingEngine | null = null;

async function getPricingEngine() {
  if (!pricingEngine) {
    pricingEngine = new DynamicPricingEngine();
    await pricingEngine.initializePricingEngine();
  }
  return pricingEngine;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');
    const testGroup = searchParams.get('testGroup') as 'control' | 'aggressive' | 'conservative' | null;

    if (!modelId) {
      return NextResponse.json(
        { error: 'modelId parameter is required' },
        { status: 400 }
      );
    }

    const engine = await getPricingEngine();
    
    let pricingResult;
    if (testGroup) {
      const testPrice = await engine.getTestPrice(modelId, testGroup);
      pricingResult = {
        multiplier: testPrice,
        reasoning: `Test pricing for ${testGroup} group`,
        confidence: 0.8
      };
    } else {
      pricingResult = await engine.optimizePrice(modelId);
    }

    return NextResponse.json({
      success: true,
      modelId,
      pricing: pricingResult,
      timestamp: new Date().toISOString(),
      testGroup: testGroup || 'production'
    });

  } catch (error) {
    console.error('Pricing API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to optimize pricing',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, testGroup, feedback } = body;

    if (!modelId) {
      return NextResponse.json(
        { error: 'modelId parameter is required' },
        { status: 400 }
      );
    }

    const engine = await getPricingEngine();
    
    // If feedback is provided, use it to improve the pricing model
    if (feedback) {
      // This would update the Q-learning model with real performance feedback
      console.log(`Pricing feedback for ${modelId}:`, feedback);
    }

    const pricingResult = await engine.optimizePrice(modelId);

    return NextResponse.json({
      success: true,
      modelId,
      pricing: pricingResult,
      timestamp: new Date().toISOString(),
      message: feedback ? 'Pricing updated with feedback' : 'Pricing optimized'
    });

  } catch (error) {
    console.error('Pricing optimization error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update pricing',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}