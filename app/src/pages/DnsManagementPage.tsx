import { useCallback } from 'react';
import { L2Sidebar } from '../components/L2Sidebar';
import { Footer } from '../components/Footer';
import { dnsNavData } from '../data/dnsNav';
import styles from './ObservabilityPage.module.css';

const pageTitles: Record<string, string> = {
  'dns-zones': 'Zones',
  'dns-tsig-keys': 'TSIG keys',
};

interface DnsManagementPageProps {
  pageVisible?: boolean;
  activeSubItem?: string;
  onSubItemChange?: (id: string) => void;
}

export function DnsManagementPage({ pageVisible = true, activeSubItem, onSubItemChange }: DnsManagementPageProps) {
  const activeL2Item = activeSubItem || 'dns-zones';

  const handleItemClick = useCallback((id: string) => {
    onSubItemChange?.(id);
  }, [onSubItemChange]);

  const pageTitle = pageTitles[activeL2Item] || 'Zones';

  return (
    <div className={styles.pageShell}>
      <L2Sidebar
        title="DNS Management"
        icon="domains"
        navData={dnsNavData}
        activeItem={activeL2Item}
        onItemClick={handleItemClick}
      />
      <div className={styles.contentWrapper}>
        <div
          key={activeL2Item}
          className={`${styles.pageContent} ${pageVisible ? styles.pageContentAnimate : styles.pageContentHidden}`}
        >
          <div className={styles.pageHeader}>
            <h1 className={styles.title}>{pageTitle}</h1>
          </div>
          <div className={styles.cardsWrapper}>
            <div className={styles.cardsRow}>
              <div className={styles.card} />
              <div className={styles.card} />
            </div>
            <div className={styles.card} />
            <div className={styles.card} />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
