import { Eye, MessageSquare, PackageCheck, Store } from 'lucide-react';

const stats = [
  { label: 'Toplam mehsul', value: '142', icon: PackageCheck },
  { label: 'Aktiv mehsul', value: '138', icon: Store },
  { label: 'WhatsApp klikleri', value: '845', icon: MessageSquare },
  { label: 'Magaza baxislari', value: '3,240', icon: Eye },
];

export default function SellerDashboardPage() {
  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <strong className="brand">Magaza Paneli</strong>
        <p className="card-meta">Satici merkezi</p>
      </aside>
      <section className="dashboard-main">
        <div className="section-title-row">
          <div>
            <h1>Idareetme Paneli</h1>
            <p className="lead">Magazanizin gorunurluyunu ve muracietlerini izleyin.</p>
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
