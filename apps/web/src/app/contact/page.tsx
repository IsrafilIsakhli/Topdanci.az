import { ArrowUpRight, CheckCircle2, Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';
import { ContactForm } from './contact-form';

const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.replace(/\D/g, '') ?? '';
const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() ?? '';
const contactCards = [
  ...(/^\d{10,15}$/.test(supportPhone) ? [{
    icon: MessageCircle,
    title: 'WhatsApp dəstəyi',
    text: 'Mağaza, məhsul və reklam sualları üçün ən sürətli əlaqə.',
    value: `+${supportPhone}`,
    href: `https://wa.me/${supportPhone}`,
  }] : []),
  ...(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail) ? [{
    icon: Mail,
    title: 'E-poçt',
    text: 'Rəsmi müraciət və tərəfdaşlıq təklifləri üçün yazın.',
    value: supportEmail,
    href: `mailto:${supportEmail}`,
  }] : []),
  {
    icon: MessageCircle,
    title: 'Dəstəyə yazın',
    text: 'Müraciətlər növbə ilə cavablandırılır.',
    value: 'Müraciət forması',
    href: '#contact-form',
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
      <section className="contact-v2">
        <div className="container contact-v2-layout">
          <aside className="contact-v2-copy">
            <span className="section-eyebrow">
              <ShieldCheck size={16} />
              Dəstək və əlaqə
            </span>
            <div className="contact-v2-heading">
              <h1>Sualınız var? Birlikdə həll edək.</h1>
              <p>
                Mağaza açmaq, məhsul yerləşdirmək, reklam və texniki məsələlərlə bağlı doğru komandaya birbaşa yazın.
              </p>
            </div>

            <div className="contact-v2-assurance" aria-label="Dəstək üstünlükləri">
              <span><CheckCircle2 size={17} /> Müraciətiniz qorunur</span>
              <span><CheckCircle2 size={17} /> Cavab məsul şəxsə yönləndirilir</span>
            </div>

            <div className="contact-v2-channels">
              {contactCards.map((card) => {
                const Icon = card.icon;
                return (
                  <a className="contact-v2-channel" href={card.href} key={card.title}>
                    <span className="contact-v2-channel-icon">
                      <Icon size={18} />
                    </span>
                    <span className="contact-v2-channel-copy">
                      <strong>{card.title}</strong>
                      <span>{card.text}</span>
                      <b>{card.value}</b>
                    </span>
                    <ArrowUpRight className="contact-v2-channel-arrow" size={18} aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </aside>

          <ContactForm />
        </div>
      </section>

      <section className="contact-v2-faq-section">
        <div className="container contact-v2-faq-layout">
          <div className="contact-v2-faq-heading">
            <span className="section-eyebrow">Tez cavablar</span>
            <h2>Ən çox soruşulanlar</h2>
            <p>Yazmazdan əvvəl axtardığınız cavab burada ola bilər.</p>
          </div>
          <div className="contact-v2-faq-list">
            {faqs.map((item) => (
              <details className="contact-v2-faq-item" key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
