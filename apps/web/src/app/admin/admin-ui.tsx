import type { ReactNode } from 'react';
import { AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import { statusLabel } from '../../lib/status-labels';
import { formatDateTime } from '../../lib/display-format';

export function AdminPageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="admin-page-header">
      <div>
        {kicker ? <span className="admin-kicker">{kicker}</span> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="admin-header-action">{action}</div> : null}
    </div>
  );
}

export function AdminMetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <article className="admin-stat-card">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {hint ? <small>{hint}</small> : null}
      </div>
      {icon ? <em>{icon}</em> : null}
    </article>
  );
}

export function AdminStatusBadge({ status }: { status?: string | null }) {
  const rawStatus = status ?? 'UNKNOWN';
  const normalized = rawStatus.toLowerCase().replaceAll('_', '-');

  return <span className={`admin-status admin-status-${normalized}`}>{statusLabel(rawStatus)}</span>;
}

export function AdminLoadingBlock({ label = 'Məlumatlar yüklənir' }: { label?: string }) {
  return (
    <div className="admin-state-card">
      <Loader2 className="admin-spin" size={22} />
      <strong>{label}</strong>
    </div>
  );
}

export function AdminErrorBlock({ message = 'Məlumatları yükləmək mümkün olmadı.' }: { message?: string }) {
  return (
    <div className="admin-state-card admin-state-error">
      <AlertCircle size={22} />
      <strong>{message}</strong>
      <span>Bir az sonra yenidən yoxlayın və ya API statusunu sistem səhifəsində kontrol edin.</span>
    </div>
  );
}

export function AdminEmptyBlock({ title, description }: { title: string; description?: string }) {
  return (
    <div className="admin-state-card">
      <strong>{title}</strong>
      {description ? <span>{description}</span> : null}
    </div>
  );
}

export function AdminListLink({
  href,
  title,
  meta,
  badge,
}: {
  href: string;
  title: string;
  meta?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <a className="admin-list-link" href={href}>
      <span>
        <strong>{title}</strong>
        {meta ? <small>{meta}</small> : null}
      </span>
      {badge}
      <ChevronRight size={18} />
    </a>
  );
}

export function formatDate(value?: string | null): string {
  return formatDateTime(value);
}

export function compactNumber(value?: number | null): string {
  return new Intl.NumberFormat('az-AZ', { notation: 'compact', maximumFractionDigits: 1 }).format(value ?? 0);
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Naməlum xəta baş verdi.';
}
