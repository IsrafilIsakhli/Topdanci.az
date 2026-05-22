import { AdminProductDetailPage } from './product-detail-page';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminProductDetailPage id={id} />;
}
