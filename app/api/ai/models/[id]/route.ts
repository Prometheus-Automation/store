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
    
    // Check if it's a slug or ID
    const isSlug = !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    
    let model;
    if (isSlug) {
      model = await ModelService.getModelBySlug(id);
    } else {
      // For UUID, we'd need a getModelById method - placeholder for now
      model = await ModelService.getModelBySlug(id);
    }

    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: model,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Model fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch model',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await ModelService.updateModel(id, body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'Unauthorized' ? 403 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Model updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Model update error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update model',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const result = await ModelService.deleteModel(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'Unauthorized' ? 403 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Model deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Model deletion error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete model',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}