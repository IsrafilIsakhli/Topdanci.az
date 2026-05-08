import Link from 'next/link';
import { BarChart3, MessageSquare, PackageCheck, Store } from 'lucide-react';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';

const benefits = [
  {
    icon: PackageCheck,
    title: 'Mehsullarinizi numayis etdirin',
    text: 'Butun mehsullarinizi vahid ve professional vitrinde teqdim edin.',
  },
  {
    icon: Store,
    title: 'Yeni alicilara catin',
    text: 'Azerbaycanin her yerinden topdan alicilar sizi asanliqla tapsin.',
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp kliklerini izleyin',
    text: 'Musterilerle birbasa elaqe yaradib muraciet statistikasini gorun.',
  },
  {
    icon: BarChart3,
    title: 'Magaza panelinden idare edin',
    text: 'Mehsullari, qiymetleri ve gorunurluyu tek panelden idare edin.',
  },
];

export default function OpenStorePage() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section">
        <div className="container open-store-layout">
          <aside>
            <h1>Magazanizi TopdanBazar-da acin</h1>
            <p className="lead">
              Mehsullarinizi onlayn kataloqda numayis etdirin, yeni alicilara catin ve muracietleri
              bir panelden izleyin.
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
            <h2>Magaza muracieti</h2>
            <div className="field-grid">
              <label className="field">
                <span>Ad ve soyad</span>
                <input placeholder="Adinizi daxil edin" />
              </label>
              <label className="field">
                <span>E-poct</span>
                <input placeholder="numune@email.com" type="email" />
              </label>
              <label className="field">
                <span>Telefon</span>
                <input placeholder="+994 (__) ___-__-__" />
              </label>
              <label className="field">
                <span>Magaza adi</span>
                <input placeholder="Sirket ve ya magaza adi" />
              </label>
              <label className="field">
                <span>Esas kateqoriya</span>
                <select>
                  <option>Kateqoriya secin</option>
                  <option>Geyim</option>
                  <option>Elektronika</option>
                  <option>Insaat materiallari</option>
                </select>
              </label>
              <label className="field">
                <span>Qisa magaza tesviri</span>
                <textarea placeholder="Magazaniz ve mehsullariniz haqqinda qisa melumat" />
              </label>
            </div>
            <button className="button button-primary button-full" type="submit">
              Muracieti gonder
            </button>
            <p className="card-meta">
              Artiq hesabiniz var? <Link className="card-link" href="/login">Daxil ol</Link>
            </p>
          </form>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
