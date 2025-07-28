import { NextRequest, NextResponse } from 'next/server';
import SemanticSearchEngine from '@/services/semanticSearchService';

// Initialize the search engine (in production, use singleton pattern)
let searchEngine: SemanticSearchEngine | null = null;

async function getSearchEngine() {
  if (!searchEngine) {
    searchEngine = new SemanticSearchEngine();
    await searchEngine.initializeSearchEngine();
  }
  return searchEngine;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query');
    const maxResults = parseInt(searchParams.get('maxResults') || '20');
    const userId = searchParams.get('userId');
    
    // Parse filters from query parameters
    const category = searchParams.get('category')?.split(',');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('minRating');
    const maxRating = searchParams.get('maxRating');
    const tags = searchParams.get('tags')?.split(',');
    const complexity = searchParams.get('complexity')?.split(',');
    const skillLevel = searchParams.get('skillLevel') as 'beginner' | 'intermediate' | 'expert' | undefined;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const engine = await getSearchEngine();
    
    // Build search query object
    const searchQuery = {
      text: query,
      maxResults,
      filters: {
        ...(category && { category }),
        ...(minPrice && maxPrice && { 
          priceRange: { min: parseFloat(minPrice), max: parseFloat(maxPrice) } 
        }),
        ...(minRating && maxRating && { 
          rating: { min: parseFloat(minRating), max: parseFloat(maxRating) } 
        }),
        ...(tags && { tags }),
        ...(complexity && { complexity })
      },
      userContext: {
        ...(userId && { userId }),
        ...(skillLevel && { skillLevel })
      }
    };

    const results = await engine.search(searchQuery);

    return NextResponse.json({
      success: true,
      query: query,
      results,
      totalResults: results.length,
      timestamp: new Date().toISOString(),
      searchId: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters, userContext, maxResults = 20 } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required in request body' },
        { status: 400 }
      );
    }

    const engine = await getSearchEngine();
    
    const searchQuery = {
      text: query,
      maxResults,
      filters,
      userContext
    };

    const results = await engine.search(searchQuery);

    return NextResponse.json({
      success: true,
      query: query,
      results,
      totalResults: results.length,
      timestamp: new Date().toISOString(),
      searchId: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

  } catch (error) {
    console.error('Advanced search API error:', error);
    return NextResponse.json(
      { 
        error: 'Advanced search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Suggestions endpoint
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partialQuery = searchParams.get('partial');
    const userId = searchParams.get('userId');
    const skillLevel = searchParams.get('skillLevel') as 'beginner' | 'intermediate' | 'expert' | undefined;

    if (!partialQuery) {
      return NextResponse.json(
        { error: 'Partial query parameter is required' },
        { status: 400 }
      );
    }

    const engine = await getSearchEngine();
    
    const userContext = {
      ...(userId && { userId }),
      ...(skillLevel && { skillLevel })
    };

    const suggestions = await engine.getSearchSuggestions(partialQuery, userContext);

    return NextResponse.json({
      success: true,
      partialQuery,
      suggestions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Search suggestions API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get search suggestions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}