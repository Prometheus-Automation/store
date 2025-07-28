import { NextRequest, NextResponse } from 'next/server';
import { ModelService } from '@/services/modelService';

export async function GET(request: NextRequest) {
  try {
    const categories = await ModelService.getCategories();

    return NextResponse.json({
      success: true,
      data: categories,
      total: categories.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}