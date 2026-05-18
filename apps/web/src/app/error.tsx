'use client';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="section">
      <div className="container panel">
        <h1>Səhifə yüklənmədi</h1>
        <p className="lead">Texniki problem yarandı. Bir az sonra yenidən yoxlayın.</p>
        <button className="button button-primary" type="button" onClick={reset}>
          Yenidən cəhd et
        </button>
      </div>
    </main>
  );
}
