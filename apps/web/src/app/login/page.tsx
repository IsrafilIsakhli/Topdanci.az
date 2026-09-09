import { SiteHeader } from '../../components/site-header';
import { LoginForm } from './login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="authx-shell">
        <LoginForm next={next} />
      </section>
    </main>
  );
}
