import { Mail, Phone } from 'lucide-react';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';
import { ContactForm } from './contact-form';

export default function ContactPage() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section">
        <div className="container open-store-layout">
          <div>
            <h1>Əlaqə</h1>
            <p className="lead">
              Platforma ilə bağlı sualınız varsa yazın. Məhsul qiyməti və topdan sifariş danışıqları birbaşa mağazalarla aparılır.
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

          <ContactForm />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
