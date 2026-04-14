import { useEffect, useRef } from 'react';
import { Icon } from './Icon';
import styles from './AvatarMenu.module.css';

interface AvatarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export function AvatarMenu({ isOpen, onClose, onNavigate, isDark, onToggleDark }: AvatarMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    requestAnimationFrame(() => {
      document.addEventListener('mousedown', handleClick);
    });
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={menuRef} className={styles.menu}>
      <button className={styles.menuItem} onClick={() => { onNavigate('profile-security'); onClose(); }}>
        <Icon name="profile-nav" size={20} />
        <span className={styles.label}>Profile &amp; security</span>
        <Icon name="export" size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
      </button>
      <button className={styles.menuItem} onClick={() => { onNavigate('api-tokens'); onClose(); }}>
        <Icon name="api-tokens" size={20} />
        <span className={styles.label}>API Tokens</span>
      </button>
      <button className={styles.menuItem} onClick={() => { onNavigate('user-management'); onClose(); }}>
        <Icon name="user-management" size={20} />
        <span className={styles.label}>User management</span>
      </button>
      <button className={styles.menuItem} onClick={onClose}>
        <Icon name="switch-account" size={20} />
        <span className={styles.label}>Switch account</span>
      </button>
      <button className={styles.menuItem} onClick={onClose}>
        <Icon name="sign-out" size={20} />
        <span className={styles.label}>Sign out</span>
      </button>
      <div className={styles.divider} />
      <div className={styles.themeRow}>
        <Icon name={isDark ? 'light-mode' : 'dark-mode'} size={20} />
        <span className={styles.label}>Dark theme</span>
        <button
          className={`${styles.toggle} ${isDark ? styles.toggleOn : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleDark();
          }}
          aria-label="Toggle dark theme"
        >
          <span className={styles.toggleTrack}>
            {isDark ? (
              <>
                <span className={styles.toggleText}>ON</span>
                <span className={styles.toggleHandle} />
              </>
            ) : (
              <>
                <span className={styles.toggleHandle} />
                <span className={styles.toggleText}>OFF</span>
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
