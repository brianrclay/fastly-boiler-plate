import { useCallback } from 'react';
import { L2Sidebar } from '../components/L2Sidebar';
import { Footer } from '../components/Footer';
import { billingNavData } from '../data/billingNav';
import styles from './ObservabilityPage.module.css';

const pageTitles: Record<string, string> = {
  'billing-overview': 'Billing overview',
  'invoices': 'Invoices',
  'plan-usage': 'Plan usage',
  'month-to-date': 'Month-to-date',
  'spend-alerts': 'Spend alerts',
  'billing-information': 'Billing information',
};

interface BillingPageProps {
  pageVisible?: boolean;
  activeSubItem?: string;
  onSubItemChange?: (id: string) => void;
}

export function BillingPage({ pageVisible = true, activeSubItem, onSubItemChange }: BillingPageProps) {
  const activeL2Item = activeSubItem || 'billing-overview';

  const handleItemClick = useCallback((id: string) => {
    onSubItemChange?.(id);
  }, [onSubItemChange]);

  const pageTitle = pageTitles[activeL2Item] || 'Billing overview';

  return (
    <div className={styles.pageShell}>
      <L2Sidebar
        title="Billing"
        icon="billing"
        navData={billingNavData}
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
