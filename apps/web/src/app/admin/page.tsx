import { AlertTriangle, Eye, MessageSquare, Store } from 'lucide-react';

const stats = [
  { label: 'Toplam magaza', value: '1,245', icon: Store },
  { label: 'Bugunku baxislari', value: '28,901', icon: Eye },
  { label: 'WhatsApp klikleri', value: '3,421', icon: MessageSquare },
  { label: 'Sikayetler', value: '12', icon: AlertTriangle },
];

export default function AdminDashboardPage() {
  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <strong className="brand">Admin Paneli</strong>
        <p className="card-meta">Platforma idareetmesi</p>
      </aside>
      <section className="dashboard-main">
        <div className="section-title-row">
          <div>
            <h1>Umumi Baxis</h1>
            <p className="lead">Sistemin cari veziyyeti ve moderator gozleyen qeydlere baxin.</p>
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
