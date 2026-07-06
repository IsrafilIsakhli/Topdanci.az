import { Clock3, Mail, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';
import { ContactForm } from './contact-form';

const contactCards = [
  {
    icon: MessageCircle,
    title: 'WhatsApp dəstəyi',
    text: 'Mağaza, məhsul və reklam sualları üçün ən sürətli əlaqə.',
    value: '+994 00 000 00 00',
  },
  {
    icon: Mail,
    title: 'E-poçt',
    text: 'Rəsmi müraciət və tərəfdaşlıq təklifləri üçün yazın.',
    value: 'support@topdanbazar.az',
  },
  {
    icon: Clock3,
    title: 'İş saatları',
    text: 'Müraciətlər növbə ilə cavablandırılır.',
    value: 'B.e - C. 09:00-18:00',
  },
];

const faqs = [
  {
    question: 'Mağaza açmaq üçün nə lazımdır?',
    answer: 'Əsas məlumatlarınızı göndərin, komanda müraciəti yoxlayıb sizinlə əlaqə saxlayacaq.',
  },
  {
    question: 'Məhsul qiymətini kimlə danışmalıyam?',
    answer: 'TopdanBazar satış etmir. Qiymət və sifariş danışığı birbaşa mağaza ilə aparılır.',
  },
  {
    question: 'Ödənişli vitrin necə işləyir?',
    answer: 'Premium yerləşdirmə üçün müraciət edin, uyğun paket və görünürlük şərtləri izah olunacaq.',
  },
];

export default function ContactPage() {
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section contact-page-section">
        <div className="container contact-hero-layout">
          <aside className="contact-copy">
            <span className="section-eyebrow">
              <ShieldCheck size={16} />
              Dəstək və əlaqə
            </span>
            <h1>Bizimlə rahat əlaqə saxlayın</h1>
            <p className="lead">
              Mağaza açmaq, məhsul yerləşdirmək, reklam almaq və texniki suallar üçün müraciətinizi göndərin.
            </p>

            <div className="contact-card-grid">
              {contactCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div className="contact-info-card" key={card.title}>
                    <span className="icon-badge">
                      <Icon size={18} />
                    </span>
                    <span>
                      <strong>{card.title}</strong>
                      <span className="card-meta">{card.text}</span>
                      <b>{card.value}</b>
                    </span>
                  </div>
                );
              })}
            </div>
          </aside>

          <ContactForm />
        </div>
      </section>

      <section className="section contact-faq-section">
        <div className="container contact-faq-layout">
          <div>
            <span className="section-eyebrow">Tez cavablar</span>
            <h2>Ən çox soruşulanlar</h2>
          </div>
          <div className="contact-faq-grid">
            {faqs.map((item) => (
              <article className="contact-faq-card" key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
