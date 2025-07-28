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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction } = body;

    if (!transaction) {
      return NextResponse.json(
        { error: 'transaction data is required' },
        { status: 400 }
      );
    }

    // Validate required transaction fields
    const requiredFields = ['id', 'userId', 'amount', 'modelId', 'paymentMethod'];
    for (const field of requiredFields) {
      if (!transaction[field]) {
        return NextResponse.json(
          { error: `transaction.${field} is required` },
          { status: 400 }
        );
      }
    }

    const service = await getTrustService();
    
    // Assess transaction risk
    const riskAssessment = await service.assessTransactionRisk({
      ...transaction,
      timestamp: new Date(transaction.timestamp || Date.now()),
      status: transaction.status || 'pending'
    });

    // Determine response based on recommendation
    const responseData = {
      success: true,
      riskAssessment,
      timestamp: new Date().toISOString()
    };

    // Set appropriate HTTP status based on recommendation
    let statusCode = 200;
    switch (riskAssessment.recommendation) {
      case 'deny':
        statusCode = 403;
        responseData.success = false;
        break;
      case 'review':
        statusCode = 202; // Accepted for processing
        break;
      case 'challenge':
        statusCode = 202; // Accepted but requires additional verification
        break;
      case 'approve':
        statusCode = 200;
        break;
    }

    return NextResponse.json(responseData, { status: statusCode });

  } catch (error) {
    console.error('Risk assessment API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to assess transaction risk',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}