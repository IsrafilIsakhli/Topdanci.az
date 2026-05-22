import { AdminStoreDetailPage } from './store-detail-page';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminStoreDetailPage id={id} />;
}
