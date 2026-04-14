import { useEffect } from 'react';
import { Icon } from './Icon';
import styles from './NotificationsDrawer.module.css';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export function NotificationsDrawer({ isOpen, onClose, onNavigate }: NotificationsDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}>
      <div className={styles.scrim} onClick={onClose} />
      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.headerText}>
              <h2 className={styles.title}>Notifications</h2>
              <p className={styles.subtitle}>3 unread notifications</p>
            </div>
            <button className={styles.closeButton} onClick={onClose} aria-label="Close notifications">
              <Icon name="close" size={24} />
            </button>
          </div>
          <div className={styles.actions}>
            <button className={styles.actionButton}>Mark all as read</button>
            <button className={styles.actionButton}>Archive all</button>
            <button className={styles.actionLink} onClick={() => { onNavigate('notifications'); onClose(); }}>All notifications</button>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Icon name="notifications-empty" size={80} />
            </div>
            <h3 className={styles.emptyTitle}>No unread notifications</h3>
            <p className={styles.emptyDescription}>You don't have any unread notifications</p>
          </div>
        </div>
      </div>
    </div>
  );
}
