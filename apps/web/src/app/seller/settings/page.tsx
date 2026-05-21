'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ShieldCheck, UserCircle } from 'lucide-react';
import { getSession, logout, type AuthUser } from '../../../lib/seller-api';

export default function SellerSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    getSession().then((session) => {
      if (session.data.authenticated) {
        setUser(session.data.user);
      }
    });
  }, []);

  async function handleLogout(allDevices: boolean) {
    setIsWorking(true);
    await logout(allDevices).catch(() => null);
    router.replace('/login');
    router.refresh();
  }

  return (
    <div className="seller-page">
      <div className="seller-page-head">
        <span className="seller-kicker">Hesab</span>
        <h2>Ayarlar</h2>
        <p>Hesab məlumatları və təhlükəsiz çıxış əməliyyatları.</p>
      </div>

      <section className="seller-two-column">
        <article className="seller-card">
          <div className="seller-card-head">
            <div>
              <span className="seller-kicker">Profil</span>
              <h3>Hesab məlumatı</h3>
            </div>
            <UserCircle size={28} />
          </div>
          <div className="seller-settings-list">
            <span>
              <small>E-poçt</small>
              <strong>{user?.email ?? 'Yoxdur'}</strong>
            </span>
            <span>
              <small>Telefon</small>
              <strong>{user?.phone ?? 'Yoxdur'}</strong>
            </span>
            <span>
              <small>Rol</small>
              <strong>{user?.role ?? 'SELLER'}</strong>
            </span>
            <span>
              <small>Status</small>
              <strong>{user?.status ?? 'ACTIVE'}</strong>
            </span>
          </div>
        </article>

        <article className="seller-card">
          <div className="seller-card-head">
            <div>
              <span className="seller-kicker">Təhlükəsizlik</span>
              <h3>Session idarəsi</h3>
            </div>
            <ShieldCheck size={28} />
          </div>
          <p className="seller-muted">
            Tokenlər localStorage-a yazılmır. Giriş httpOnly cookie və CSRF qoruması ilə işləyir.
          </p>
          <div className="seller-settings-actions">
            <button className="button" type="button" disabled={isWorking} onClick={() => void handleLogout(false)}>
              <LogOut size={16} />
              Bu cihazdan çıx
            </button>
            <button className="button button-primary" type="button" disabled={isWorking} onClick={() => void handleLogout(true)}>
              <LogOut size={16} />
              Bütün cihazlardan çıx
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
