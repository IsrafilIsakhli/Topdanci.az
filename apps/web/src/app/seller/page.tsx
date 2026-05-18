import { Eye, MessageSquare, PackageCheck, Store } from 'lucide-react';

const stats = [
  { label: 'Toplam məhsul', value: '142', icon: PackageCheck },
  { label: 'Aktiv məhsul', value: '138', icon: Store },
  { label: 'WhatsApp klikləri', value: '845', icon: MessageSquare },
  { label: 'Mağaza baxışları', value: '3,240', icon: Eye },
];

export default function SellerDashboardPage() {
  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <strong className="brand">Mağaza Paneli</strong>
        <p className="card-meta">Satıcı mərkəzi</p>
      </aside>
      <section className="dashboard-main">
        <div className="section-title-row">
          <div>
            <h1>İdarəetmə Paneli</h1>
            <p className="lead">Mağazanızın görünürlüğünü və müraciətlərini izləyin.</p>
          </div>
        </div>
        <div className="stat-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article className="card stat-card" key={stat.label}>
                <Icon color="#064e3b" />
                <span className="card-meta">{stat.label}</span>
                <strong>{stat.value}</strong>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
