import { useEffect, useRef } from 'react';
import { Icon } from './Icon';
import styles from './AppSwitcher.module.css';

interface AppSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSwitcher({ isOpen, onClose }: AppSwitcherProps) {
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
      <button className={`${styles.appItem} ${styles.appItemActive}`} onClick={onClose}>
        <div className={styles.appHeader}>
          <Icon name="fastly-logo" size={24} />
          <span className={styles.appName}>Fastly</span>
        </div>
        <p className={styles.appDescription}>
          CDN for site performance using ready-to-use solutions or custom VCL
        </p>
      </button>
      <button className={styles.appItem} onClick={onClose}>
        <div className={styles.appHeader}>
          <Icon name="security-colorful" size={24} />
          <span className={styles.appName}>Next-Gen WAF</span>
        </div>
        <p className={styles.appDescription}>
          Web application and API protection
        </p>
      </button>
    </div>
  );
}
