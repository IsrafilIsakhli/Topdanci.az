import Link from 'next/link';
import { BarChart3, MessageSquare, PackageCheck, Store } from 'lucide-react';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';

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
    text: 'Müştərilərlə birbaşa əlaqə yaradıb müraciət statistikasını görün.',
  },
  {
    icon: BarChart3,
    title: 'Mağaza panelindən idarə edin',
    text: 'Məhsulları, qiymətləri və görünürlüğü tək paneldən idarə edin.',
  },
];

export default function OpenStorePage() {
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

          <form className="panel">
            <h2>Mağaza müraciəti</h2>
            <div className="field-grid">
              <label className="field">
                <span>Ad və soyad</span>
                <input placeholder="Adınızı daxil edin" />
              </label>
              <label className="field">
                <span>E-poçt</span>
                <input placeholder="numune@email.com" type="email" />
              </label>
              <label className="field">
                <span>Telefon</span>
                <input placeholder="+994 (__) ___-__-__" />
              </label>
              <label className="field">
                <span>Mağaza adı</span>
                <input placeholder="Şirkət və ya mağaza adı" />
              </label>
              <label className="field">
                <span>Əsas kateqoriya</span>
                <select>
                  <option>Kateqoriya seçin</option>
                  <option>Geyim</option>
                  <option>Elektronika</option>
                  <option>İnşaat materialları</option>
                </select>
              </label>
              <label className="field">
                <span>Qısa mağaza təsviri</span>
                <textarea placeholder="Mağazanız və məhsullarınız haqqında qısa məlumat" />
              </label>
            </div>
            <button className="button button-primary button-full" type="submit">
              Müraciəti göndər
            </button>
            <p className="card-meta">
              Artıq hesabınız var?{' '}
              <Link className="card-link" href="/login">
                Daxil ol
              </Link>
            </p>
          </form>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
