import { StoreApplicationDetailPage } from './store-application-detail-page';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StoreApplicationDetailPage id={id} />;
}
