import { NextRequest, NextResponse } from 'next/server';
import { ModelService } from '@/services/modelService';

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const analytics = await ModelService.getModelAnalytics(id);

    if (!analytics) {
      return NextResponse.json(
        { error: 'Analytics not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Model analytics error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch model analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}