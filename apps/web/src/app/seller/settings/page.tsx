'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Loader2, LogOut, Save, ShieldCheck, UserCircle } from 'lucide-react';
import { ApiClientError } from '../../../lib/api-client';
import {
  changePassword,
  getSession,
  logout,
  updateAccount,
  type AuthUser,
} from '../../../lib/seller-api';

export default function SellerSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  // Account form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountMessage, setAccountMessage] = useState('');
  const [accountError, setAccountError] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    getSession().then((session) => {
      if (session.data.authenticated) {
        setUser(session.data.user);
        setEmail(session.data.user.email ?? '');
        setPhone(session.data.user.phone ?? '');
      }
    });
  }, []);

  async function handleLogout(allDevices: boolean) {
    setIsWorking(true);
    await logout(allDevices).catch(() => null);
    router.replace('/login');
    router.refresh();
  }

  async function handleAccountSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accountPassword.trim()) {
      setAccountError('Təhlükəsizlik üçün cari şifrənizi daxil edin.');
      return;
    }

    setIsSavingAccount(true);
    setAccountError('');
    setAccountMessage('');

    try {
      const payload: {
        currentPassword: string;
        fullName?: string;
        email?: string;
        phone?: string;
      } = { currentPassword: accountPassword };

      const currentEmail = user?.email ?? '';
      const currentPhone = user?.phone ?? '';

      if (fullName.trim()) payload.fullName = fullName.trim();
      if (email.trim() !== currentEmail) payload.email = email.trim();
      if (phone.trim() !== currentPhone) payload.phone = phone.trim();

      if (Object.keys(payload).length === 1) {
        setAccountError('Dəyişiklik yoxdur — məlumatları yeniləyin.');
        return;
      }

      const response = await updateAccount(payload);
      setUser(response.data.user);
      setAccountPassword('');
      setAccountMessage('Hesab məlumatları yeniləndi.');
      router.refresh();
    } catch (caught) {
      setAccountError(getAccountError(caught));
    } finally {
      setIsSavingAccount(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Yeni şifrələr bir-birinə uyğun gəlmir.');
      return;
    }

    setIsSavingPassword(true);

    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Şifrəniz yeniləndi. Növbəti girişdə yeni şifrəni istifadə edin.');
    } catch (caught) {
      if (caught instanceof ApiClientError && caught.status === 400) {
        setPasswordError('Yeni şifrə ən azı 8 simvol — böyük hərf, kiçik hərf və rəqəm olmalıdır.');
      } else if (caught instanceof ApiClientError && caught.status === 401) {
        setPasswordError('Cari şifrə yanlışdır.');
      } else {
        setPasswordError('Şifrə yenilənmədi. Bir az sonra yenidən cəhd edin.');
      }
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <div className="seller-page">
      <div className="seller-page-head">
        <h2>Ayarlar</h2>
        <p>Hesab məlumatları, təhlükəsizlik və çıxış əməliyyatları.</p>
      </div>

      <section className="seller-two-column">
        <form className="seller-card seller-form" onSubmit={handleAccountSubmit}>
          <div className="seller-card-head">
            <div>
              <h3>Hesab məlumatı</h3>
              <p>Məlumatları dəyişmək üçün cari şifrənizi daxil edin.</p>
            </div>
            <UserCircle size={24} />
          </div>

          {accountMessage ? <div className="form-alert form-alert-success">{accountMessage}</div> : null}
          {accountError ? <div className="form-alert form-alert-error">{accountError}</div> : null}

          <div className="seller-form-grid">
            <label className="seller-field">
              <span>Ad və soyad</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Əlavə etmək istəyirsinizsə doldurun"
                maxLength={120}
              />
            </label>
            <label className="seller-field">
              <span>E-poçt</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seller@topdanci.az"
                maxLength={180}
              />
            </label>
            <label className="seller-field">
              <span>Telefon</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+994 50 000 00 00"
                maxLength={32}
              />
            </label>
            <label className="seller-field">
              <span>Cari şifrə *</span>
              <input
                type="password"
                value={accountPassword}
                onChange={(event) => setAccountPassword(event.target.value)}
                placeholder="Dəyişikliyi təsdiqləyin"
                autoComplete="current-password"
                required
              />
            </label>
          </div>

          <button className="button button-primary seller-form-submit" type="submit" disabled={isSavingAccount}>
            {isSavingAccount ? <Loader2 className="spin-icon" size={16} /> : <Save size={16} />}
            Məlumatları yenilə
          </button>
        </form>

        <div className="seller-column">
          <form className="seller-card seller-form" onSubmit={handlePasswordSubmit}>
            <div className="seller-card-head">
              <div>
                <h3>Şifrəni dəyiş</h3>
                <p>Ən azı 8 simvol — böyük hərf, kiçik hərf və rəqəm.</p>
              </div>
              <KeyRound size={24} />
            </div>

            {passwordMessage ? <div className="form-alert form-alert-success">{passwordMessage}</div> : null}
            {passwordError ? <div className="form-alert form-alert-error">{passwordError}</div> : null}

            <div className="seller-form-grid seller-form-grid-single">
              <label className="seller-field">
                <span>Cari şifrə</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>
              <label className="seller-field">
                <span>Yeni şifrə</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>
              <label className="seller-field">
                <span>Yeni şifrə (təkrar)</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>
            </div>

            <button className="button button-primary seller-form-submit" type="submit" disabled={isSavingPassword}>
              {isSavingPassword ? <Loader2 className="spin-icon" size={16} /> : <KeyRound size={16} />}
              Şifrəni yenilə
            </button>
          </form>

          <section className="seller-card seller-form">
            <div className="seller-card-head">
              <div>
                <h3>Session idarəsi</h3>
                <p>Giriş httpOnly cookie və CSRF qoruması ilə işləyir.</p>
              </div>
              <ShieldCheck size={24} />
            </div>
            <div className="seller-settings-actions">
              <button className="button" type="button" disabled={isWorking} onClick={() => void handleLogout(false)}>
                <LogOut size={16} />
                Bu cihazdan çıx
              </button>
              <button
                className="button button-primary"
                type="button"
                disabled={isWorking}
                onClick={() => void handleLogout(true)}
              >
                <LogOut size={16} />
                Bütün cihazlardan çıx
              </button>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function getAccountError(caught: unknown): string {
  if (caught instanceof ApiClientError) {
    if (caught.status === 401) {
      return 'Cari şifrə yanlışdır.';
    }
    if (caught.status === 409) {
      return caught.message.includes('phone')
        ? 'Bu telefon artıq başqa hesabda istifadə olunur.'
        : 'Bu e-poçt artıq başqa hesabda istifadə olunur.';
    }
    if (caught.status === 429) {
      return 'Çox cəhd etdiniz. Bir az sonra yenidən yoxlayın.';
    }
  }

  return 'Məlumatlar yenilənmədi. Məlumatları yoxlayıb yenidən cəhd edin.';
}
