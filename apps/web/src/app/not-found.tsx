import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="section">
      <div className="container panel">
        <h1>Sehife tapilmadi</h1>
        <p className="lead">Axtardiginiz sehife movcud deyil ve ya yayimdan qaldirilib.</p>
        <Link className="button button-primary" href="/">
          Ana sehifeye qayit
        </Link>
      </div>
    </main>
  );
}
