export default function LoadingPage() {
  return (
    <main className="route-loading" aria-busy="true" aria-label="Səhifə yüklənir">
      <div className="route-loading-bar" />
      <div className="route-loading-content">
        <div className="route-loading-line route-loading-title" />
        <div className="route-loading-line" />
        <div className="route-loading-grid">
          <div className="route-loading-card" />
          <div className="route-loading-card" />
          <div className="route-loading-card" />
        </div>
      </div>
    </main>
  );
}
