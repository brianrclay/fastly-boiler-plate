import { useEffect, useRef } from 'react';
import { Icon } from './Icon';
import styles from './HelpMenu.module.css';

const helpItems = [
  { id: 'documentation', label: 'Documentation', icon: 'documentation' },
  { id: 'developer-hub', label: 'Developer Hub', icon: 'developer-hub' },
  { id: 'community', label: 'Fastly Community', icon: 'community' },
  { id: 'academy', label: 'Fastly Academy', icon: 'academy' },
  { id: 'fastly-status', label: 'Fastly Status', icon: 'fastly-status' },
  { id: 'contact-sales', label: 'Contact sales', icon: 'contact-sales' },
  { id: 'support', label: 'Support', icon: 'support' },
];

interface HelpMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpMenu({ isOpen, onClose }: HelpMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay listener so the opening click doesn't immediately close it
    requestAnimationFrame(() => {
      document.addEventListener('mousedown', handleClick);
    });
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={menuRef} className={styles.menu}>
      {helpItems.map((item) => (
        <button key={item.id} className={styles.menuItem} onClick={onClose}>
          <Icon name={item.icon} size={20} />
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
