import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="section">
      <div className="container panel">
        <h1>Səhifə tapılmadı</h1>
        <p className="lead">Axtardığınız səhifə mövcud deyil və ya yayımdan qaldırılıb.</p>
        <Link className="button button-primary" href="/">
          Ana səhifəyə qayıt
        </Link>
      </div>
    </main>
  );
}
