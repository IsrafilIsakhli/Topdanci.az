'use client';

import { useEffect, useMemo, useState } from 'react';
import { Inbox, Loader2 } from 'lucide-react';
import { getSellerLeads, type SellerLead } from '../../../lib/seller-api';
import { leadIcon, leadLabels, leadTone, timeAgo } from '../dashboard/dashboard-utils';

const typeOptions = [
  { value: '', label: 'Bütün hadisələr' },
  { value: 'PRODUCT_VIEW', label: 'Məhsul baxışı' },
  { value: 'STORE_VIEW', label: 'Mağaza baxışı' },
  { value: 'WHATSAPP_CLICK', label: 'WhatsApp klik' },
  { value: 'PHONE_REVEAL', label: 'Telefon göstərildi' },
  { value: 'EMAIL_CLICK', label: 'E-poçt klik' },
];

export default function SellerLeadsPage() {
  const [range, setRange] = useState('30d');
  const [type, setType] = useState('');
  const [leads, setLeads] = useState<SellerLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const params = useMemo(() => ({ range, type: type || undefined }), [range, type]);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    getSellerLeads(params)
      .then((response) => {
        if (!mounted) return;
        setLeads(response.data);
        setError('');
      })
      .catch(() => {
        if (mounted) setError('Müraciətlər yüklənmədi.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [params]);

  return (
    <div className="seller-page">
      <div className="dash2-page">
        <div className="dash2-page-head">
          <div>
            <h2>Müraciətlər və baxışlar</h2>
            <p>Alıcıların baxış, WhatsApp və telefon hərəkətləri burada görünür. Şəxsi IP məlumatları göstərilmir.</p>
          </div>
          {leads.length ? <span className="dash2-chip">{leads.length} hadisə</span> : null}
        </div>

        <section aria-label="Filtrlər" className="dash2-toolbar">
          <select className="dash2-select" value={range} onChange={(event) => setRange(event.target.value)}>
            <option value="7d">Son 7 gün</option>
            <option value="30d">Son 30 gün</option>
            <option value="90d">Son 90 gün</option>
          </select>
          <select className="dash2-select" value={type} onChange={(event) => setType(event.target.value)}>
            {typeOptions.map((item) => (
              <option value={item.value} key={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </section>

        {error ? <div className="form-alert form-alert-error">{error}</div> : null}

        {isLoading ? (
          <div className="dash2-list-card">
            <div className="seller-table-loading">
              <Loader2 className="spin-icon" size={20} />
              Müraciətlər yüklənir
            </div>
          </div>
        ) : leads.length ? (
          <section className="dash2-section">
            <div className="dash2-timeline">
              {leads.map((lead, index) => {
                const Icon = leadIcon(lead.type);
                return (
                  <div className={`dash2-tl-row ${leadTone(lead.type)}`} key={lead.id} style={{ animationDelay: `${index * 40}ms` }}>
                    <span className="dash2-tl-dot">
                      <Icon size={16} />
                    </span>
                    <div className="dash2-tl-body">
                      <strong>{leadLabels[lead.type]}</strong>
                      <small>{lead.product?.title ?? lead.store.name}</small>
                    </div>
                    <time className="dash2-tl-time">{timeAgo(lead.createdAt)}</time>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="dash2-section">
            <div className="dash2-empty">
              <Inbox size={22} />
              <strong>Müraciət yoxdur</strong>
              <span>Seçilən period üçün lead hadisəsi tapılmadı.</span>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
