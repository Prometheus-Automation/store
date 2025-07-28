import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connectivity
    const { data, error } = await supabase
      .from('ai_models')
      .select('count')
      .limit(1);
    
    const dbStatus = error ? 'unhealthy' : 'healthy';
    const dbLatency = Date.now() - startTime;

    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'NEXT_PUBLIC_APP_URL'
    ];
    
    const envStatus = requiredEnvVars.every(envVar => 
      process.env[envVar] && !process.env[envVar]?.includes('your-')
    ) ? 'healthy' : 'unhealthy';

    // Overall status
    const overallStatus = dbStatus === 'healthy' && envStatus === 'healthy' 
      ? 'healthy' : 'unhealthy';

    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`,
          error: error?.message || null
        },
        environment: {
          status: envStatus,
          missing: requiredEnvVars.filter(envVar => 
            !process.env[envVar] || process.env[envVar]?.includes('your-')
          )
        }
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };

    return NextResponse.json(healthData, {
      status: overallStatus === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        checks: {
          database: { status: 'unhealthy', error: 'Connection failed' },
          environment: { status: 'unknown' }
        }
      },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      }
    );
  }
}