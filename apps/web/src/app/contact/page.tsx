import { Mail, MessageSquare, Phone } from 'lucide-react';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';

export default function ContactPage() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section">
        <div className="container open-store-layout">
          <div>
            <h1>Əlaqə</h1>
            <p className="lead">
              Platforma ilə bağlı sualınız varsa yazın. Məhsul qiyməti və topdan sifariş danışıqları birbaşa
              mağazalarla aparılır.
            </p>
            <div className="benefit-list">
              <div className="benefit-item">
                <span className="icon-badge">
                  <Phone size={18} />
                </span>
                <span>
                  <strong>Telefon</strong>
                  <span className="card-meta">+994 00 000 00 00</span>
                </span>
              </div>
              <div className="benefit-item">
                <span className="icon-badge">
                  <Mail size={18} />
                </span>
                <span>
                  <strong>E-poçt</strong>
                  <span className="card-meta">support@topdanbazar.az</span>
                </span>
              </div>
            </div>
          </div>
          <form className="panel">
            <h2>Mesaj göndər</h2>
            <div className="field-grid">
              <label className="field">
                <span>Ad</span>
                <input placeholder="Adınız" />
              </label>
              <label className="field">
                <span>E-poçt</span>
                <input placeholder="numune@email.com" />
              </label>
              <label className="field">
                <span>Mesaj</span>
                <textarea placeholder="Mesajınızı yazın" />
              </label>
            </div>
            <button className="button button-primary button-full" type="submit">
              <MessageSquare size={17} />
              Göndər
            </button>
          </form>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
