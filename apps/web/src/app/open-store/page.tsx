import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';
import { getCategories } from '../../lib/catalog-data';
import { OpenStoreForm } from './open-store-form';

export const dynamic = 'force-dynamic';

export default async function OpenStorePage() {
  const categories = await getCategories({ rootsOnly: true });

  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="authx-shell">
        <OpenStoreForm categories={categories.map(({ id, name, slug }) => ({ id: id ?? slug, name }))} />
      </section>
      <SiteFooter />
    </main>
  );
}