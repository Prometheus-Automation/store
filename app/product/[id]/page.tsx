import { Metadata } from 'next';
import ProductDetailPage from '@/components/pages/ProductDetailPage';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // In a real app, you'd fetch the product data here
  const { id } = await params;
  // const product = await fetchProduct(id);
  
  return {
    title: `AI Model - Prometheus Automation`,
    description: `Discover this premium AI model and add it to your toolkit.`,
    openGraph: {
      title: `AI Model - Prometheus Automation`,
      description: `Discover this premium AI model and add it to your toolkit.`,
      type: 'website',
    },
  };
}

export default async function ProductDetail({ params }: Props) {
  const { id } = await params;
  return <ProductDetailPage />;
}