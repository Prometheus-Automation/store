import { NextRequest, NextResponse } from 'next/server';
import { ModelService } from '@/services/modelService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const query = searchParams.get('query') || searchParams.get('q');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const pricing_model = searchParams.get('pricing_model');
    const min_price = searchParams.get('min_price');
    const max_price = searchParams.get('max_price');
    const min_rating = searchParams.get('min_rating');
    const framework = searchParams.get('framework');
    const tags = searchParams.get('tags')?.split(',');
    const developer_id = searchParams.get('developer_id');
    const sort_by = (searchParams.get('sort_by') as 'created_at' | 'price' | 'average_rating') || 'created_at';
    const sort_order = (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc';
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');
    const featured = searchParams.get('featured') === 'true';

    // Handle featured models request
    if (featured) {
      const featuredModels = await ModelService.getFeaturedModels(limit);
      return NextResponse.json({
        success: true,
        data: featuredModels,
        total: featuredModels.length,
        featured: true,
        timestamp: new Date().toISOString()
      });
    }

    // Build filters object
    const filters = {
      ...(category && { category }),
      ...(subcategory && { subcategory }),
      ...(pricing_model && { pricing_model }),
      ...(min_price && { min_price: parseFloat(min_price) }),
      ...(max_price && { max_price: parseFloat(max_price) }),
      ...(min_rating && { min_rating: parseFloat(min_rating) }),
      ...(framework && { framework }),
      ...(tags && { tags }),
      ...(developer_id && { developer_id })
    };

    // Build search parameters
    const searchParams_obj = {
      ...(query && { query }),
      filters,
      sort_by,
      sort_order,
      page,
      limit
    };

    const result = await ModelService.getModels(searchParams_obj);

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Models API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch models',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'pricing_model'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const result = await ModelService.createModel(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Model created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Model creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create model',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}