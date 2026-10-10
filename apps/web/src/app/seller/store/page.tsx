'use client';

import { FormEvent, useEffect, useState } from 'react';
import { BadgeCheck, CheckCircle2, Clock, Image as ImageIcon, Loader2, Phone, Save, Store, TimerReset, Upload } from 'lucide-react';
import { WorkingHoursField } from './working-hours-field';
import {
  getSellerStores,
  updateSellerStore,
  uploadStoreAsset,
  type SellerStore,
} from '../../../lib/seller-api';

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
  const [uploadingAsset, setUploadingAsset] = useState<'logo' | 'banner' | null>(null);
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

  async function handleAssetUpload(kind: 'logo' | 'banner', file?: File) {
    if (!store || !file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setMessage('');
      setError('JPG, PNG və ya WEBP formatında, maksimum 10 MB ölçülü şəkil seçin.');
      return;
    }

    setUploadingAsset(kind);
    setError('');
    setMessage('');
    try {
      const response = await uploadStoreAsset(store.id, kind, file);
      setStore((current) =>
        current
          ? {
              ...current,
              ...(kind === 'logo'
                ? { logoKey: response.data.cdnUrl ?? response.data.storageKey }
                : { bannerKey: response.data.cdnUrl ?? response.data.storageKey }),
            }
          : current,
      );
      setMessage(kind === 'logo' ? 'Mağaza loqosu yeniləndi.' : 'Mağaza örtük şəkli yeniləndi.');
    } catch {
      setError('Şəkil yüklənmədi. JPG, PNG və ya WEBP formatında 10 MB-dan kiçik fayl seçin.');
    } finally {
      setUploadingAsset(null);
    }
  }

  if (isLoading) {
    return (
      <div className="seller-page">
        <div className="dash2-page">
          <div className="dash2-skel is-hero" />
          <div className="dash2-skel is-panel" />
        </div>
      </div>
    );
  }

  if (!store || !form) {
    return (
      <div className="seller-page">
        <section className="dash2-state">
          <strong>Mağaza tapılmadı</strong>
          <p>Bu hesab üçün mağaza üzvlüyü görünmür.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="seller-page">
      <div className="dash2-page">
        <div className="dash2-page-head">
          <div>
            <h2>{store.name}</h2>
            <p>Alıcıların gördüyü mağaza məlumatlarını buradan idarə edin.</p>
          </div>
          <span className={`dash2-pill ${store.verified ? 'is-verified' : 'is-pending'}`}>
            {store.verified ? <BadgeCheck size={13} /> : <TimerReset size={13} />}
            {store.verified ? 'Təsdiqlənib' : 'Təsdiq gözləyir'}
          </span>
        </div>

        {message ? (
          <div className="form-alert form-alert-success" role="status">
            <CheckCircle2 size={17} />
            {message}
          </div>
        ) : null}
        {error ? <div className="form-alert form-alert-error" role="alert">{error}</div> : null}

        <form className="dash2-store-form" onSubmit={handleSubmit}>
          <section className="dash2-section dash2-col-2">
            <header className="dash2-section-head">
              <span className="dash2-card-icon">
                <Store size={19} />
              </span>
              <div>
                <h3>Mağaza məlumatları</h3>
                <p className="dash2-section-sub">Marketplace-də görünən əsas məlumatlar</p>
              </div>
            </header>
            <div className="dash2-form-grid">
              <label className="dash2-field">
                <span>Mağaza adı</span>
                <input value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
              </label>
              <label className="dash2-field">
                <span>Rəsmi ad</span>
                <input value={form.legalName} onChange={(event) => updateField('legalName', event.target.value)} />
              </label>
              <label className="dash2-field">
                <span>Şəhər</span>
                <input value={form.city} onChange={(event) => updateField('city', event.target.value)} required />
              </label>
              <label className="dash2-field">
                <span>Rayon</span>
                <input value={form.district} onChange={(event) => updateField('district', event.target.value)} />
              </label>
              <label className="dash2-field is-wide">
                <span>Ünvan</span>
                <input value={form.address} onChange={(event) => updateField('address', event.target.value)} />
              </label>
              <label className="dash2-field is-wide">
                <span>Açıqlama</span>
                <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} />
              </label>
            </div>
          </section>

          <section className="dash2-section dash2-col-2">
            <header className="dash2-section-head">
              <span className="dash2-card-icon">
                <ImageIcon size={19} />
              </span>
              <div>
                <h3>Mağaza şəkilləri</h3>
                <p className="dash2-section-sub">Loqo kvadrat, örtük şəkli isə üfüqi formatda daha yaxşı görünür</p>
              </div>
            </header>
            <div className="dash2-media-grid">
              <label className="dash2-media-field">
                <span className="dash2-media-preview" style={mediaStyle(store.logoKey)}>
                  {!mediaStyle(store.logoKey) ? <ImageIcon size={22} /> : null}
                </span>
                <span className="dash2-media-info">
                  <strong>Mağaza loqosu</strong>
                  <small>JPG, PNG və ya WEBP, maksimum 10 MB</small>
                </span>
                <span className="dash2-ghost-button">
                  {uploadingAsset === 'logo' ? <Loader2 className="spin-icon" size={15} /> : <Upload size={15} />}
                  Seç
                </span>
                <input
                  accept="image/jpeg,image/png,image/webp"
                  disabled={Boolean(uploadingAsset)}
                  aria-label="Mağaza loqosunu seç"
                  onChange={(event) => {
                    void handleAssetUpload('logo', event.target.files?.[0]);
                    event.target.value = '';
                  }}
                  type="file"
                />
              </label>

              <label className="dash2-media-field">
                <span className="dash2-media-preview" style={mediaStyle(store.bannerKey)}>
                  {!mediaStyle(store.bannerKey) ? <ImageIcon size={22} /> : null}
                </span>
                <span className="dash2-media-info">
                  <strong>Örtük şəkli</strong>
                  <small>Mağaza səhifəsinin yuxarı hissəsində göstərilir</small>
                </span>
                <span className="dash2-ghost-button">
                  {uploadingAsset === 'banner' ? <Loader2 className="spin-icon" size={15} /> : <Upload size={15} />}
                  Seç
                </span>
                <input
                  accept="image/jpeg,image/png,image/webp"
                  disabled={Boolean(uploadingAsset)}
                  aria-label="Örtük şəklini seç"
                  onChange={(event) => {
                    void handleAssetUpload('banner', event.target.files?.[0]);
                    event.target.value = '';
                  }}
                  type="file"
                />
              </label>
            </div>
          </section>

          <section className="dash2-section">
            <header className="dash2-section-head">
              <span className="dash2-card-icon">
                <Phone size={19} />
              </span>
              <div>
                <h3>Əlaqə</h3>
                <p className="dash2-section-sub">Alıcıların sizinlə əlaqə saxlayacağı məlumatlar</p>
              </div>
            </header>
            <div className="dash2-form-grid">
              <label className="dash2-field">
                <span>Telefon</span>
                <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
              </label>
              <label className="dash2-field">
                <span>WhatsApp</span>
                <input value={form.whatsappNumber} onChange={(event) => updateField('whatsappNumber', event.target.value)} />
              </label>
              <label className="dash2-field is-wide">
                <span>E-poçt</span>
                <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
              </label>
            </div>
          </section>

          <section className="dash2-section">
            <header className="dash2-section-head">
              <span className="dash2-card-icon">
                <Clock size={19} />
              </span>
              <div>
                <h3>İş saatları</h3>
                <p className="dash2-section-sub">Mağazanın xidmət göstərdiyi saatlar</p>
              </div>
            </header>
            <div className="dash2-form-grid">
              <WorkingHoursField label="Bazar ertəsi - Cümə" value={form.workdays} onChange={(value) => updateField('workdays', value)} wide />
              <WorkingHoursField label="Şənbə" value={form.saturday} onChange={(value) => updateField('saturday', value)} />
              <WorkingHoursField label="Bazar" value={form.sunday} onChange={(value) => updateField('sunday', value)} />
            </div>
          </section>

          <section className="dash2-savebar dash2-col-2">
            <div className="dash2-hero-id">
              <strong>{store.name}</strong>
              <small>
                {store.verified ? 'Təsdiqlənmiş mağaza' : 'Təsdiq gözləyir'} · {store.productCount} məhsul
              </small>
            </div>
            <button className="dash2-cta" type="submit" disabled={isSaving || Boolean(uploadingAsset)}>
              {isSaving ? <Loader2 className="spin-icon" size={16} /> : <Save size={16} />}
              {isSaving ? 'Yadda saxlanılır...' : 'Profili yadda saxla'}
            </button>
          </section>
        </form>
      </div>
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

function mediaStyle(value?: string | null) {
  if (!value) return undefined;
  const url = value.startsWith('http')
    ? value
    : process.env.NEXT_PUBLIC_CDN_BASE_URL
      ? `${process.env.NEXT_PUBLIC_CDN_BASE_URL.replace(/\/+$/, '')}/${value.replace(/^\/+/, '')}`
      : null;
  return url ? { backgroundImage: `url(${url})` } : undefined;
}
