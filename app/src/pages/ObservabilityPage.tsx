import { useCallback } from 'react';
import { L2Sidebar } from '../components/L2Sidebar';
import { Footer } from '../components/Footer';
import { observabilityNavData } from '../data/observabilityNav';
import styles from './ObservabilityPage.module.css';

// Map L2 nav items to page titles
const pageTitles: Record<string, string> = {
  'account-summary': 'Account summary',
  'services': 'Services',
  'service-overview': 'Service overview',
  'all-services': 'All services',
  'obs-domains': 'Domains',
  'origins': 'Origins',
  'insights': 'Insights',
  'logs': 'Logs',
  'explorer': 'Explorer',
  'tailing': 'Tailing',
  'alerts': 'Alerts',
  'alerts-overview': 'Alerts overview',
  'definitions': 'Definitions',
  'integrations': 'Integrations',
  'custom-dashboards': 'Custom Dashboards',
};

interface ObservabilityPageProps {
  pageVisible?: boolean;
  activeSubItem?: string;
  onSubItemChange?: (id: string) => void;
}

export function ObservabilityPage({ pageVisible = true, activeSubItem, onSubItemChange }: ObservabilityPageProps) {
  const activeL2Item = activeSubItem || 'account-summary';

  const handleItemClick = useCallback((id: string) => {
    onSubItemChange?.(id);
  }, [onSubItemChange]);

  const pageTitle = pageTitles[activeL2Item] || 'Account summary';

  return (
    <div className={styles.pageShell}>
      <L2Sidebar
        title="Observability"
        icon="observability"
        navData={observabilityNavData}
        activeItem={activeL2Item}
        onItemClick={handleItemClick}
        defaultExpanded={{}}
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
