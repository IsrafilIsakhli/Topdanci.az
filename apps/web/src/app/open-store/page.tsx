import { BarChart3, MessageSquare, PackageCheck, Store } from 'lucide-react';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';
import { getCategories } from '../../lib/catalog-data';
import { OpenStoreForm } from './open-store-form';

const benefits = [
  {
    icon: PackageCheck,
    title: 'Məhsullarınızı nümayiş etdirin',
    text: 'Bütün məhsullarınızı vahid və professional vitrində təqdim edin.',
  },
  {
    icon: Store,
    title: 'Yeni alıcılara çatın',
    text: 'Azərbaycanın hər yerindən topdan alıcılar sizi asanlıqla tapsın.',
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp kliklərini izləyin',
    text: 'Müştərilərlə birbaşa əlaqə yaradın və müraciət statistikasını görün.',
  },
  {
    icon: BarChart3,
    title: 'Mağaza panelindən idarə edin',
    text: 'Məhsulları, qiymətləri və görünürlüğü tək paneldən idarə edin.',
  },
];

export default async function OpenStorePage() {
  const categories = await getCategories({ rootsOnly: true });

  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section">
        <div className="container open-store-layout">
          <aside>
            <h1>Mağazanızı TopdanBazar-da açın</h1>
            <p className="lead">
              Məhsullarınızı onlayn kataloqda nümayiş etdirin, yeni alıcılara çatın və müraciətləri bir paneldən izləyin.
            </p>
            <div className="benefit-list">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div className="benefit-item" key={benefit.title}>
                    <span className="icon-badge">
                      <Icon size={18} />
                    </span>
                    <span>
                      <strong>{benefit.title}</strong>
                      <span className="card-meta">{benefit.text}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </aside>

          <OpenStoreForm categories={categories.map(({ id, name, slug }) => ({ id: id ?? slug, name }))} />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
