'use client';

import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Save, Store } from 'lucide-react';
import { getSellerStores, updateSellerStore, type SellerStore } from '../../../lib/seller-api';

type StoreForm = {
  name: string;
  legalName: string;
  description: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  workdays: string;
  saturday: string;
  sunday: string;
};

export default function SellerStorePage() {
  const [store, setStore] = useState<SellerStore | null>(null);
  const [form, setForm] = useState<StoreForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getSellerStores()
      .then((response) => {
        const firstStore = response.data[0] ?? null;
        setStore(firstStore);
        setForm(firstStore ? toStoreForm(firstStore) : null);
      })
      .catch(() => setError('Mağaza məlumatları yüklənmədi.'))
      .finally(() => setIsLoading(false));
  }, []);

  function updateField<K extends keyof StoreForm>(key: K, value: StoreForm[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!store || !form) return;

    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await updateSellerStore(store.id, {
        name: form.name,
        legalName: form.legalName || null,
        description: form.description || null,
        city: form.city,
        district: form.district || null,
        address: form.address || null,
        phone: form.phone || null,
        whatsappNumber: form.whatsappNumber || null,
        email: form.email || null,
        workingHours: {
          workdays: form.workdays,
          saturday: form.saturday,
          sunday: form.sunday,
        },
      });
      setStore(response.data);
      setForm(toStoreForm(response.data));
      setMessage('Mağaza profili yeniləndi.');
    } catch {
      setError('Mağaza profili yenilənmədi.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="seller-skeleton seller-skeleton-hero">Mağaza profili hazırlanır</div>;
  }

  if (!store || !form) {
    return (
      <div className="seller-card seller-state-card">
        <h2>Mağaza tapılmadı</h2>
        <p>Bu hesab üçün mağaza üzvlüyü görünmür.</p>
      </div>
    );
  }

  return (
    <div className="seller-page">
      <div className="seller-page-head">
        <span className="seller-kicker">Mağaza profili</span>
        <h2>{store.name}</h2>
        <p>Alıcıların gördüyü mağaza məlumatlarını buradan idarə edin.</p>
      </div>

      {message ? (
        <div className="form-alert form-alert-success">
          <CheckCircle2 size={17} />
          {message}
        </div>
      ) : null}
      {error ? <div className="form-alert form-alert-error">{error}</div> : null}

      <form className="seller-form-layout" onSubmit={handleSubmit}>
        <section className="seller-card seller-form-card seller-span-2">
          <h3>Mağaza məlumatları</h3>
          <div className="seller-form-grid">
            <label className="field">
              <span>Mağaza adı</span>
              <input value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
            </label>
            <label className="field">
              <span>Rəsmi ad</span>
              <input value={form.legalName} onChange={(event) => updateField('legalName', event.target.value)} />
            </label>
            <label className="field">
              <span>Şəhər</span>
              <input value={form.city} onChange={(event) => updateField('city', event.target.value)} required />
            </label>
            <label className="field">
              <span>Rayon</span>
              <input value={form.district} onChange={(event) => updateField('district', event.target.value)} />
            </label>
            <label className="field seller-span-2">
              <span>Ünvan</span>
              <input value={form.address} onChange={(event) => updateField('address', event.target.value)} />
            </label>
            <label className="field seller-span-2">
              <span>Açıqlama</span>
              <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} />
            </label>
          </div>
        </section>

        <aside className="seller-card seller-form-card">
          <h3>Əlaqə</h3>
          <div className="field-grid">
            <label className="field">
              <span>Telefon</span>
              <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
            </label>
            <label className="field">
              <span>WhatsApp</span>
              <input value={form.whatsappNumber} onChange={(event) => updateField('whatsappNumber', event.target.value)} />
            </label>
            <label className="field">
              <span>E-poçt</span>
              <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
            </label>
          </div>
        </aside>

        <aside className="seller-card seller-form-card">
          <h3>İş saatları</h3>
          <div className="field-grid">
            <label className="field">
              <span>Bazar ertəsi - Cümə</span>
              <input value={form.workdays} onChange={(event) => updateField('workdays', event.target.value)} />
            </label>
            <label className="field">
              <span>Şənbə</span>
              <input value={form.saturday} onChange={(event) => updateField('saturday', event.target.value)} />
            </label>
            <label className="field">
              <span>Bazar</span>
              <input value={form.sunday} onChange={(event) => updateField('sunday', event.target.value)} />
            </label>
          </div>
        </aside>

        <section className="seller-card seller-form-card seller-span-2">
          <div className="seller-profile-preview">
            <span>
              <Store size={24} />
            </span>
            <div>
              <strong>{store.name}</strong>
              <small>
                {store.verified ? 'Təsdiqlənmiş mağaza' : 'Təsdiq gözləyir'} · {store.productCount} məhsul
              </small>
            </div>
          </div>
          <button className="button button-primary" type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="spin-icon" size={16} /> : <Save size={16} />}
            Profili yadda saxla
          </button>
        </section>
      </form>
    </div>
  );
}

function toStoreForm(store: SellerStore): StoreForm {
  const hours = store.workingHours as Partial<Record<'workdays' | 'saturday' | 'sunday', string>> | null;

  return {
    name: store.name,
    legalName: store.legalName ?? '',
    description: store.description ?? '',
    city: store.city ?? '',
    district: store.district ?? '',
    address: store.address ?? '',
    phone: store.phone ?? '',
    whatsappNumber: store.whatsappNumber ?? '',
    email: store.email ?? '',
    workdays: hours?.workdays ?? '09:00 - 18:00',
    saturday: hours?.saturday ?? '10:00 - 15:00',
    sunday: hours?.sunday ?? 'Bağlıdır',
  };
}
