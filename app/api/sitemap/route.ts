import { NextResponse } from 'next/server';
import { ModelService } from '@/services/modelService';

export async function GET() {
  try {
    // Get all approved models for sitemap
    const { data: models } = await ModelService.getModels({ limit: 1000 });
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://store.prometheusautomation.com';
    
    const staticPages = [
      '',
      '/auth/signin',
      '/dashboard',
      '/CommunityPage',
    ];

    const dynamicPages = models.map(model => `/product/${model.slug}`);

    const allPages = [...staticPages, ...dynamicPages];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.startsWith('/product/') ? 'weekly' : 'monthly'}</changefreq>
    <priority>${page === '' ? '1.0' : page.startsWith('/product/') ? '0.8' : '0.6'}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}