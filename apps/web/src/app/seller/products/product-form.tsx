'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ImagePlus, Loader2, Save, Send } from 'lucide-react';
import Link from 'next/link';
import {
  createSellerProduct,
  getCategoryOptions,
  getSellerProduct,
  getSellerStores,
  submitSellerProduct,
  updateSellerProduct,
  uploadProductImage,
  type CategoryOption,
  type ProductPayload,
  type SellerProduct,
  type SellerStore,
} from '../../../lib/seller-api';

type ProductFormState = {
  storeId: string;
  categoryId: string;
  title: string;
  description: string;
  price: string;
  priceType: 'FIXED' | 'NEGOTIABLE';
  currency: string;
  unit: 'PIECE' | 'BOX' | 'KG' | 'TON' | 'METER' | 'PACKAGE';
  minOrderQuantity: string;
  stockStatus: string;
};

const emptyForm: ProductFormState = {
  storeId: '',
  categoryId: '',
  title: '',
  description: '',
  price: '',
  priceType: 'NEGOTIABLE',
  currency: 'AZN',
  unit: 'PIECE',
  minOrderQuantity: '',
  stockStatus: 'IN_STOCK',
};

export function SellerProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [stores, setStores] = useState<SellerStore[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [product, setProduct] = useState<SellerProduct | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    Promise.all([
      getSellerStores(),
      getCategoryOptions(),
      productId ? getSellerProduct(productId) : Promise.resolve(null),
    ])
      .then(([storeResponse, categoryResponse, productResponse]) => {
        if (!mounted) return;

        const storeList = storeResponse.data;
        const categoryList = categoryResponse.data;
        setStores(storeList);
        setCategories(categoryList);

        if (productResponse) {
          const current = productResponse.data;
          setProduct(current);
          setForm({
            storeId: current.store.id,
            categoryId: current.category?.id ?? '',
            title: current.title,
            description: current.description ?? '',
            price: current.price ?? '',
            priceType: current.priceType,
            currency: current.currency ?? 'AZN',
            unit: current.unit as ProductFormState['unit'],
            minOrderQuantity: current.minOrderQuantity ?? '',
            stockStatus: current.stockStatus ?? 'IN_STOCK',
          });
        } else {
          setForm((current) => ({ ...current, storeId: storeList[0]?.id ?? '' }));
        }
      })
      .catch(() => setError('Form məlumatları yüklənmədi.'))
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [productId]);

  const canSubmitReview = useMemo(() => {
    return !product || ['DRAFT', 'REJECTED', 'PASSIVE'].includes(product.status);
  }, [product]);

  function updateField<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveProduct(false);
  }

  async function handleSubmitReview() {
    await saveProduct(true);
  }

  async function saveProduct(submitReview: boolean) {
    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = toProductPayload(form);
      const saved = productId || product?.id
        ? await updateSellerProduct(productId ?? product!.id, payload)
        : await createSellerProduct(payload);
      const savedProduct = saved.data;

      for (const file of files) {
        await uploadProductImage(savedProduct.id, file);
      }

      const finalProduct = submitReview ? (await submitSellerProduct(savedProduct.id)).data : savedProduct;
      setProduct(finalProduct);
      setFiles([]);
      setMessage(submitReview ? 'Məhsul yoxlamaya göndərildi.' : 'Məhsul qaralama kimi saxlanıldı.');

      if (!productId) {
        router.replace(`/seller/products/${finalProduct.id}/edit`);
      }
      router.refresh();
    } catch {
      setError('Əməliyyat alınmadı. Məlumatları yoxlayıb yenidən cəhd edin.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="seller-skeleton seller-skeleton-hero">Məhsul formu hazırlanır</div>;
  }

  return (
    <div className="seller-page">
      <div className="seller-page-head">
        <Link className="seller-back-link" href="/seller/products">
          <ArrowLeft size={17} />
          Məhsullara qayıt
        </Link>
        <div>
          <span className="seller-kicker">{productId ? 'Redaktə' : 'Yeni məhsul'}</span>
          <h2>{productId ? 'Məhsulu redaktə edin' : 'Kataloqa yeni məhsul əlavə edin'}</h2>
          <p>Satış platforması deyil: alıcılar məhsulu görüb sizinlə WhatsApp və ya telefonla əlaqə saxlayır.</p>
        </div>
      </div>

      {message ? (
        <div className="form-alert form-alert-success">
          <CheckCircle2 size={17} />
          {message}
        </div>
      ) : null}
      {error ? <div className="form-alert form-alert-error">{error}</div> : null}

      <form className="seller-form-layout" onSubmit={handleSave}>
        <section className="seller-card seller-form-card">
          <h3>Əsas məlumatlar</h3>
          <div className="seller-form-grid">
            <label className="field">
              <span>Mağaza</span>
              <select value={form.storeId} onChange={(event) => updateField('storeId', event.target.value)} required disabled={Boolean(productId)}>
                <option value="">Mağaza seçin</option>
                {stores.map((store) => (
                  <option value={store.id} key={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Kateqoriya</span>
              <select value={form.categoryId} onChange={(event) => updateField('categoryId', event.target.value)}>
                <option value="">Kateqoriya seçin</option>
                {categories.map((category) => (
                  <option value={category.id} key={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field seller-span-2">
              <span>Məhsul adı</span>
              <input
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Məsələn: Sement M-400 50 kq"
                maxLength={180}
                required
              />
            </label>
            <label className="field seller-span-2">
              <span>Açıqlama</span>
              <textarea
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Minimum sifariş, çatdırılma şərtləri və məhsul xüsusiyyətləri..."
                maxLength={3000}
              />
            </label>
          </div>
        </section>

        <aside className="seller-card seller-form-card">
          <h3>Qiymət və status</h3>
          <div className="field-grid">
            <label className="field">
              <span>Qiymət növü</span>
              <select value={form.priceType} onChange={(event) => updateField('priceType', event.target.value as ProductFormState['priceType'])}>
                <option value="NEGOTIABLE">Razılaşma yolu ilə</option>
                <option value="FIXED">Sabit qiymət</option>
              </select>
            </label>
            <label className="field">
              <span>Qiymət</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                disabled={form.priceType === 'NEGOTIABLE'}
                onChange={(event) => updateField('price', event.target.value)}
                placeholder="0.00"
              />
            </label>
            <label className="field">
              <span>Ölçü vahidi</span>
              <select value={form.unit} onChange={(event) => updateField('unit', event.target.value as ProductFormState['unit'])}>
                <option value="PIECE">Ədəd</option>
                <option value="BOX">Qutu</option>
                <option value="KG">Kq</option>
                <option value="TON">Ton</option>
                <option value="METER">Metr</option>
                <option value="PACKAGE">Paket</option>
              </select>
            </label>
            <label className="field">
              <span>Minimum sifariş</span>
              <input
                type="number"
                min="0"
                value={form.minOrderQuantity}
                onChange={(event) => updateField('minOrderQuantity', event.target.value)}
                placeholder="50"
              />
            </label>
            <label className="field">
              <span>Anbar statusu</span>
              <select value={form.stockStatus} onChange={(event) => updateField('stockStatus', event.target.value)}>
                <option value="IN_STOCK">Stokda var</option>
                <option value="PREORDER">Öncədən sifariş</option>
                <option value="OUT_OF_STOCK">Müvəqqəti yoxdur</option>
              </select>
            </label>
          </div>
        </aside>

        <section className="seller-card seller-form-card seller-span-2">
          <div className="seller-card-head">
            <div>
              <h3>Şəkillər</h3>
              <p>JPG, PNG və WebP. API böyük faylı qəbul etmir, fayl birbaşa S3-ə yüklənir.</p>
            </div>
          </div>
          <label className="seller-upload-box">
            <ImagePlus size={28} />
            <strong>Şəkil seçin</strong>
            <span>{files.length ? `${files.length} fayl seçildi` : 'Yüksək keyfiyyətli məhsul şəkilləri əlavə edin.'}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 6))}
            />
          </label>
          {product?.images.length ? (
            <div className="seller-image-grid">
              {product.images.map((image) => (
                <span className="seller-image-chip" key={image.id}>
                  <span style={{ backgroundImage: image.cdnUrl ? `url(${image.cdnUrl})` : undefined }} />
                  <em>{image.status}</em>
                </span>
              ))}
            </div>
          ) : null}
        </section>

        <div className="seller-form-actions seller-span-2">
          <button className="button" type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="spin-icon" size={16} /> : <Save size={16} />}
            Qaralama saxla
          </button>
          <button className="button button-primary" type="button" disabled={isSaving || !canSubmitReview} onClick={() => void handleSubmitReview()}>
            {isSaving ? <Loader2 className="spin-icon" size={16} /> : <Send size={16} />}
            Yoxlamaya göndər
          </button>
        </div>
      </form>
    </div>
  );
}

function toProductPayload(form: ProductFormState): ProductPayload {
  const payload: ProductPayload = {
    storeId: form.storeId,
    ...(form.categoryId ? { categoryId: form.categoryId } : {}),
    title: form.title.trim(),
    ...(form.description.trim() ? { description: form.description.trim() } : { description: '' }),
    priceType: form.priceType,
    currency: form.currency,
    unit: form.unit,
    stockStatus: form.stockStatus,
  };

  if (form.priceType === 'FIXED' && form.price) {
    payload.price = Number(form.price);
  }

  if (form.minOrderQuantity) {
    payload.minOrderQuantity = Number(form.minOrderQuantity);
  }

  return payload;
}
