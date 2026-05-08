'use client';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="section">
      <div className="container panel">
        <h1>Sehife yuklenmedi</h1>
        <p className="lead">Texniki problem yarandi. Bir az sonra yeniden yoxlayin.</p>
        <button className="button button-primary" type="button" onClick={reset}>
          Yeniden cehd et
        </button>
      </div>
    </main>
  );
}
