'use client';

import Link from 'next/link';
import { Bell, CheckCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from '../lib/notification-api';

export function NotificationCenter({ classPrefix }: { classPrefix: 'seller' | 'admin' }) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    getNotifications()
      .then((response) => {
        setItems(response.data);
        setUnreadCount(response.meta.unreadCount);
      })
      .catch(() => setHasError(true));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setIsOpen(false);
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [isOpen]);

  async function readOne(item: AppNotification) {
    if (!item.readAt) {
      await markNotificationRead(item.id).catch(() => null);
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, readAt: new Date().toISOString() } : entry));
      setUnreadCount((current) => Math.max(0, current - 1));
    }
    setIsOpen(false);
  }

  async function readAll() {
    await markAllNotificationsRead().catch(() => null);
    const readAt = new Date().toISOString();
    setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? readAt })));
    setUnreadCount(0);
  }

  return (
    <div className="notification-center">
      <button
        aria-expanded={isOpen}
        aria-label={unreadCount ? `Bildirişlər, ${unreadCount} oxunmamış` : 'Bildirişlər'}
        className={`${classPrefix}-icon-button`}
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <Bell size={18} />
        {unreadCount ? <span className="notification-count">{unreadCount > 99 ? '99+' : unreadCount}</span> : null}
      </button>
      {isOpen ? (
        <section aria-label="Bildiriş mərkəzi" className="notification-popover">
          <header>
            <div>
              <strong>Bildirişlər</strong>
              <small>{unreadCount} oxunmamış</small>
            </div>
            <button aria-label="Bağla" onClick={() => setIsOpen(false)} type="button"><X size={17} /></button>
          </header>
          {items.length ? (
            <div className="notification-list">
              {items.map((item) => {
                const content = (
                  <>
                    <span className={`notification-dot notification-${item.type.toLowerCase()}`} />
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.message}</small>
                      <time>{new Date(item.createdAt).toLocaleString('az-AZ')}</time>
                    </span>
                  </>
                );
                return item.href ? (
                  <Link className={item.readAt ? '' : 'is-unread'} href={item.href} key={item.id} onClick={() => void readOne(item)}>
                    {content}
                  </Link>
                ) : (
                  <button className={item.readAt ? '' : 'is-unread'} key={item.id} onClick={() => void readOne(item)} type="button">
                    {content}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="notification-empty">{hasError ? 'Bildirişlər yüklənmədi.' : 'Yeni bildiriş yoxdur.'}</p>
          )}
          {unreadCount ? (
            <button className="notification-read-all" onClick={() => void readAll()} type="button">
              <CheckCheck size={16} /> Hamısını oxunmuş et
            </button>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
