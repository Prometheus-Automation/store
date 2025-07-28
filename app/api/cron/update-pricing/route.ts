import { NextRequest, NextResponse } from 'next/server';
import DynamicPricingEngine from '@/services/pricingService';
import { ModelService } from '@/services/modelService';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request from Vercel
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting automated pricing update...');
    
    // Get all active models
    const { data: models } = await ModelService.getModels({ limit: 1000 });
    
    const pricingEngine = new DynamicPricingEngine();
    await pricingEngine.initializePricingEngine();
    
    const results = [];
    let updatedCount = 0;
    let errorCount = 0;

    // Update pricing for each model
    for (const model of models) {
      try {
        const pricingAction = await pricingEngine.optimizePrice(model.id);
        
        // Only update if the price change is significant (>2%)
        if (Math.abs(pricingAction.multiplier - 1) > 0.02) {
          const newPrice = model.price * pricingAction.multiplier;
          
          await ModelService.updateModel(model.id, {
            price: newPrice,
            updated_at: new Date().toISOString()
          });
          
          results.push({
            modelId: model.id,
            modelName: model.name,
            oldPrice: model.price,
            newPrice: newPrice,
            multiplier: pricingAction.multiplier,
            reasoning: pricingAction.reasoning,
            confidence: pricingAction.confidence
          });
          
          updatedCount++;
        }
      } catch (error) {
        console.error(`Pricing update failed for model ${model.id}:`, error);
        errorCount++;
      }
    }

    console.log(`Pricing update completed: ${updatedCount} updated, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      message: 'Pricing update completed',
      stats: {
        totalModels: models.length,
        updatedCount,
        errorCount,
        timestamp: new Date().toISOString()
      },
      results: results.slice(0, 10) // Return first 10 for debugging
    });

  } catch (error) {
    console.error('Pricing cron job error:', error);
    return NextResponse.json(
      { 
        error: 'Pricing update failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}