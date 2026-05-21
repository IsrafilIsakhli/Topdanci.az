'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eye, Mail, MessageSquare, Phone, Store } from 'lucide-react';
import { getSellerLeads, type SellerLead } from '../../../lib/seller-api';

const typeOptions = [
  { value: '', label: 'Bütün hadisələr' },
  { value: 'PRODUCT_VIEW', label: 'Məhsul baxışı' },
  { value: 'STORE_VIEW', label: 'Mağaza baxışı' },
  { value: 'WHATSAPP_CLICK', label: 'WhatsApp klik' },
  { value: 'PHONE_REVEAL', label: 'Telefon göstərildi' },
  { value: 'EMAIL_CLICK', label: 'E-poçt klik' },
];

const leadLabels = {
  PRODUCT_VIEW: 'Məhsul baxışı',
  STORE_VIEW: 'Mağaza baxışı',
  WHATSAPP_CLICK: 'WhatsApp klik',
  PHONE_REVEAL: 'Telefon göstərildi',
  EMAIL_CLICK: 'E-poçt klik',
};

export default function SellerLeadsPage() {
  const [range, setRange] = useState('30d');
  const [type, setType] = useState('');
  const [leads, setLeads] = useState<SellerLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const params = useMemo(() => ({ range, type: type || undefined }), [range, type]);

  useEffect(() => {
    setIsLoading(true);
    getSellerLeads(params)
      .then((response) => {
        setLeads(response.data);
        setError('');
      })
      .catch(() => setError('Müraciətlər yüklənmədi.'))
      .finally(() => setIsLoading(false));
  }, [params]);

  return (
    <div className="seller-page">
      <div className="seller-page-head">
        <span className="seller-kicker">Lead hadisələri</span>
        <h2>Müraciətlər və baxışlar</h2>
        <p>Alıcıların baxış, WhatsApp və telefon hərəkətləri burada görünür. Şəxsi IP məlumatları göstərilmir.</p>
      </div>

      <section className="seller-card seller-filter-card seller-filter-compact">
        <select value={range} onChange={(event) => setRange(event.target.value)}>
          <option value="7d">Son 7 gün</option>
          <option value="30d">Son 30 gün</option>
          <option value="90d">Son 90 gün</option>
        </select>
        <select value={type} onChange={(event) => setType(event.target.value)}>
          {typeOptions.map((item) => (
            <option value={item.value} key={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </section>

      {error ? <div className="form-alert form-alert-error">{error}</div> : null}

      <section className="seller-card">
        {isLoading ? (
          <div className="seller-table-loading">Müraciətlər yüklənir</div>
        ) : leads.length ? (
          <div className="seller-lead-timeline">
            {leads.map((lead) => {
              const Icon = iconForLead(lead.type);
              return (
                <article className="seller-lead-row" key={lead.id}>
                  <span className="seller-icon-soft">
                    <Icon size={18} />
                  </span>
                  <div>
                    <strong>{leadLabels[lead.type]}</strong>
                    <p>{lead.product?.title ?? lead.store.name}</p>
                    <small>{lead.store.name}</small>
                  </div>
                  <time>{new Date(lead.createdAt).toLocaleString('az-AZ')}</time>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="seller-empty">
            <h3>Müraciət yoxdur</h3>
            <p>Seçilən period üçün lead hadisəsi tapılmadı.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function iconForLead(type: SellerLead['type']) {
  if (type === 'WHATSAPP_CLICK') return MessageSquare;
  if (type === 'PHONE_REVEAL') return Phone;
  if (type === 'EMAIL_CLICK') return Mail;
  if (type === 'STORE_VIEW') return Store;
  return Eye;
}
