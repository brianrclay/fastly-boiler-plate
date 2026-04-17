import { useCallback } from 'react';
import { Icon } from '../components/Icon';
import { L2Sidebar } from '../components/L2Sidebar';
import { Footer } from '../components/Footer';
import { billingNavData } from '../data/billingNav';
import styles from './BillingPage.module.css';
import obsStyles from './ObservabilityPage.module.css';

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
  const isOverview = activeL2Item === 'billing-overview';
  const isInvoices = activeL2Item === 'invoices';

  const renderContent = () => {
    if (isOverview) return <BillingOverview />;
    if (isInvoices) return <InvoicesPage />;
    if (activeL2Item === 'billing-information') return <BillingInformationPage />;
    return (
      <>
        <div className={obsStyles.pageHeader}>
          <h1 className={obsStyles.title}>{pageTitle}</h1>
        </div>
        <div className={obsStyles.cardsWrapper}>
          <div className={obsStyles.cardsRow}>
            <div className={obsStyles.card} />
            <div className={obsStyles.card} />
          </div>
          <div className={obsStyles.card} />
        </div>
      </>
    );
  };

  return (
    <div className={obsStyles.pageShell}>
      <L2Sidebar
        title="Billing"
        icon="billing"
        navData={billingNavData}
        activeItem={activeL2Item}
        onItemClick={handleItemClick}
      />
      <div className={obsStyles.contentWrapper}>
        <div
          key={activeL2Item}
          className={`${obsStyles.pageContent} ${pageVisible ? obsStyles.pageContentAnimate : obsStyles.pageContentHidden}`}
        >
          {renderContent()}
        </div>
        <Footer />
      </div>
    </div>
  );
}

/* ─── Billing Overview ─── */
const invoices = [
  { date: 'Jan 2025', status: 'Outstanding', amount: '$50.00' },
  { date: 'Dec 2024', status: 'Paid', amount: '$50.00' },
  { date: 'Nov 2024', status: 'Paid', amount: '$80.00' },
  { date: 'Oct 2024', status: 'Paid', amount: '$60.00' },
  { date: 'Sep 2024', status: 'Paid', amount: '$60.00' },
  { date: 'Aug 2024', status: 'Paid', amount: '$50.00' },
];

const addons = [
  { name: 'Bot management', usage: '1.1b requests', mtdBill: '$17.17', lastBill: '$24.23' },
  { name: 'Next-Gen WAF', usage: '313 requests', mtdBill: '$102.11', lastBill: '$495.13' },
];

const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const chartConfigs = [
  { title: 'Total bill', subtitle: 'Total amount that Fastly billed your account', full: true, current: '$600.00', previous: '$500.00' },
  { title: 'Full-site Delivery bill', subtitle: 'Amount billed for Full-site Delivery', full: false, current: '$400.00', previous: '$350.00' },
  { title: 'Compute bill', subtitle: 'Amount billed for Compute', full: false, current: '$0.00', previous: '$0.00' },
  { title: 'Bandwidth', subtitle: 'Total bandwidth processed for your account', full: false, current: '1,901,112.03 GB', previous: '$6,741.06' },
  { title: 'Requests', subtitle: 'Number of requests processed for your account', full: false, current: '14,911,178', previous: '12,744,178' },
];

const otherProducts = [
  { name: 'Compute Annual Package', amount: '$100,000.00' },
  { name: 'Config Store Usage', amount: '$0.00' },
  { name: 'DDoS Protection & Mitigation Service', amount: '$0.00' },
  { name: 'Fastly TLS - Certainly', amount: '$0.00' },
  { name: 'Domain Inspector - Enterprise', amount: '$0.00' },
  { name: 'Dedicated IP addresses', amount: '$0.00' },
];

const regions = [
  { name: 'Africa', color: '#008885', amount: '$100,068.00' },
  { name: 'Asia', color: '#33bda0', amount: '$0.00' },
  { name: 'Europe', color: '#fddfb3', amount: '$0.00' },
  { name: 'India', color: '#ff9da0', amount: '$0.00' },
  { name: 'Latin America', color: '#88dbf2', amount: '$0.00' },
  { name: 'North America', color: '#006a8d', amount: '$0.00' },
];

function BillingOverview() {
  return (
    <div className={styles.billing}>
      <div className={styles.billingHeader}>
        <h1 className={styles.pageTitle}>Billing overview</h1>
      </div>

      {/* Plan card */}
      <div className={styles.planCard}>
        <div className={styles.planInfo}>
          <span className={styles.planLabel}>Current plan:</span>
          <span className={styles.planName}>Custom plan</span>
        </div>
        <div className={styles.planActions}>
          <button className={styles.linkBtn}>View usage</button>
          <button className={styles.primaryBtn}>Edit plan</button>
        </div>
      </div>

      {/* Invoices + Add-ons row */}
      <div className={styles.cardRow}>
        <div className={styles.tableCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Invoices</h3>
            <button className={styles.cardLink}>All invoices</button>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Invoice ↓</th>
                <th>Status</th>
                <th className={styles.thRight}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <tr key={i}>
                  <td><button className={styles.invoiceLink}>{inv.date}</button></td>
                  <td><span className={styles.statusDot} style={{ backgroundColor: inv.status === 'Outstanding' ? 'var(--COLOR--caution--text, #996500)' : 'var(--COLOR--success--text, #25741e)' }} />{inv.status}</td>
                  <td className={styles.tdRight}>{inv.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.tableCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Purchased add-ons</h3>
            <button className={styles.cardLink}>All add-ons</button>
          </div>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Add-on ↓</th>
                  <th>MTD usage</th>
                  <th>MTD bill</th>
                  <th>Last month bill</th>
                  <th className={styles.thAction} />
                </tr>
              </thead>
              <tbody>
                {addons.map((a, i) => (
                  <tr key={i}>
                    <td><button className={styles.invoiceLink}>{a.name}</button></td>
                    <td>{a.usage}</td>
                    <td>{a.mtdBill}</td>
                    <td>{a.lastBill}</td>
                    <td><Icon name="more" size={20} style={{ color: 'var(--text-secondary)' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Billing metrics */}
      <h2 className={styles.sectionHeading}>Billing metrics</h2>
      <div className={styles.filterRow}>
        <button className={styles.filterBtn}><span>Date: Last 12 months</span><Icon name="calendar" size={20} /></button>
        <button className={styles.filterBtn}><span>Region: Any</span><Icon name="chevron-down" size={20} /></button>
        <button className={styles.exportBtn}><Icon name="export" size={20} /> Export</button>
      </div>

      {/* Charts */}
      <BillingChart {...chartConfigs[0]} />
      <div className={styles.chartPairRow}>
        <BillingChart {...chartConfigs[1]} />
        <BillingChart {...chartConfigs[2]} />
      </div>
      <div className={styles.chartPairRow}>
        <BillingChart {...chartConfigs[3]} />
        <BillingChart {...chartConfigs[4]} />
      </div>

      {/* Other services */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.cardTitle}>Other services &amp; products</h3>
          <p className={styles.chartSubtitle}>All Fastly services and products excluding Compute and Full-Site Delivery</p>
        </div>
        <ChartPlaceholder />
        <div className={styles.legendList}>
          {otherProducts.map((p, i) => (
            <div key={i} className={styles.legendRow}>
              <span className={styles.legendDot} style={{ backgroundColor: ['#008885', '#33bda0', '#fddfb3', '#ff9da0', '#88dbf2', '#006a8d'][i % 6] }} />
              <span className={styles.legendLabel}>{p.name}</span>
              <span className={styles.legendValue}>{p.amount}</span>
            </div>
          ))}
          <div className={styles.legendRow}>
            <span className={styles.legendLabel} style={{ fontWeight: 700 }}>Total</span>
            <span className={styles.legendValue} style={{ fontWeight: 700 }}>$100,000.00</span>
          </div>
        </div>
      </div>

      {/* Regional bills */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.cardTitle}>Regional bills</h3>
          <p className={styles.chartSubtitle}>How to read your invoices for Fastly services and products, subdivided by geographical regions, including non-regional offerings</p>
        </div>
        <div className={styles.filterRow} style={{ marginBottom: 'var(--spacing-5)' }}>
          <button className={styles.filterBtn}><span>Product: Any</span><Icon name="chevron-down" size={20} /></button>
        </div>
        <ChartPlaceholder />
        <div className={styles.legendList}>
          {regions.map((r, i) => (
            <div key={i} className={styles.legendRow}>
              <span className={styles.legendDot} style={{ backgroundColor: r.color }} />
              <span className={styles.legendLabel}>{r.name}</span>
              <span className={styles.legendValue}>{r.amount}</span>
            </div>
          ))}
          <div className={styles.legendRow}>
            <span className={styles.legendLabel} style={{ fontWeight: 700 }}>Total</span>
            <span className={styles.legendValue} style={{ fontWeight: 700 }}>$100,068.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Chart components ─── */
function BillingChart({ title, subtitle, current, previous }: { title: string; subtitle: string; current: string; previous: string }) {
  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.chartSubtitle}>{subtitle}</p>
      </div>
      <ChartPlaceholder />
      <div className={styles.legendItem}>
        <span className={styles.legendDot} style={{ backgroundColor: 'var(--COLOR--data-viz--one, #008885)' }} />
        <span className={styles.legendLabel}>{title} (Sep 23 - Aug 24)</span>
        <span className={styles.legendValue}>{current}</span>
      </div>
      <div className={styles.legendItem}>
        <span className={styles.legendDotOutline} />
        <span className={styles.legendLabel}>Previous year (Sep 22 - Aug 23)</span>
        <span className={styles.legendValue}>{previous}</span>
      </div>
    </div>
  );
}

function ChartPlaceholder() {
  const pad = 4;
  const h = 200;
  const w = 600;
  const pts1 = Array.from({ length: 12 }, (_, i) => ({
    x: (i / 11) * w,
    y: pad + 20 + Math.sin(i * 0.8) * 40 + Math.random() * 30,
  }));
  const pts2 = Array.from({ length: 12 }, (_, i) => ({
    x: (i / 11) * w,
    y: pad + 60 + Math.cos(i * 0.6) * 30 + Math.random() * 20,
  }));
  const line1 = pts1.map((p) => `${p.x},${p.y}`).join(' ');
  const line2 = pts2.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className={styles.chartArea}>
      <svg viewBox={`0 0 ${w} ${h + pad}`} preserveAspectRatio="none" className={styles.chartSvg}>
        <polyline points={line1} fill="none" stroke="var(--COLOR--data-viz--one, #008885)" strokeWidth="2" />
        <polyline points={line2} fill="none" stroke="var(--COLOR--data-viz--one, #008885)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
      </svg>
      <div className={styles.chartXAxis}>
        {months.map((m) => <span key={m}>{m}</span>)}
      </div>
    </div>
  );
}

/* ─── Billing Information Page ─── */
function BillingInformationPage() {
  return (
    <div className={styles.billingInfoPage}>
      <div className={styles.billingInfoHeader}>
        <h1 className={styles.pageTitle}>Billing information</h1>
      </div>

      {/* Payment method */}
      <div className={styles.infoCard}>
        <div className={styles.infoCardHeader}>
          <h3 className={styles.cardTitle}>Payment method</h3>
        </div>
        <div className={styles.infoCardBody}>
          <span className={styles.infoValue}>Visa ending in 4242</span>
          <span className={styles.infoLabel}>Expires 03/2027</span>
          <div className={styles.paymentActions}>
            <button className={styles.editLink}>Edit</button>
            <button className={styles.removeLink}>Remove</button>
          </div>
        </div>
      </div>

      {/* Billing address */}
      <div className={styles.infoCard}>
        <div className={styles.infoCardHeader}>
          <h3 className={styles.cardTitle}>Billing address</h3>
        </div>
        <div className={styles.infoCardBody}>
          <p className={styles.addressText}>
            {'Acme Co.\n123 Main Street\nSuite 400\nSan Francisco, CA 94105\nUnited States'}
          </p>
          <div>
            <button className={styles.editLink}>Edit</button>
          </div>
        </div>
      </div>

      {/* Current plan */}
      <div className={styles.infoCard}>
        <div className={styles.infoCardHeader}>
          <h3 className={styles.cardTitle}>Current plan</h3>
        </div>
        <div className={styles.infoCardBody}>
          <span className={styles.infoValueBold}>Custom plan</span>
          <div className={styles.planDetailsGrid}>
            <div className={styles.planDetailItem}>
              <span className={styles.infoLabel}>Monthly commitment</span>
              <span className={styles.infoValue}>$500.00</span>
            </div>
            <div className={styles.planDetailItem}>
              <span className={styles.infoLabel}>Billing cycle</span>
              <span className={styles.infoValue}>Monthly</span>
            </div>
            <div className={styles.planDetailItem}>
              <span className={styles.infoLabel}>Next renewal</span>
              <span className={styles.infoValue}>Jan 15, 2026</span>
            </div>
          </div>
          <div className={styles.planCardActions}>
            <button className={styles.linkBtn}>View usage</button>
            <button className={styles.primaryBtn}>Edit plan</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Invoices Page ─── */
const invoicesFullData = [
  { date: 'Dec 2024', status: 'Outstanding', amount: '$729.35' },
  { date: 'Nov 2024', status: 'Paid', amount: '$455.61' },
  { date: 'Oct 2024', status: 'Paid', amount: '$1,421.42' },
  { date: 'Sep 2024', status: 'Paid', amount: '$876.28' },
  { date: 'Aug 2024', status: 'Paid', amount: '$753.14' },
  { date: 'Jul 2024', status: 'Paid', amount: '$3,852.32' },
  { date: 'Jun 2024', status: 'Paid', amount: '$54.32' },
  { date: 'May 2024', status: 'Paid', amount: '$918.41' },
  { date: 'Apr 2024', status: 'Paid', amount: '$465.11' },
  { date: 'Mar 2024', status: 'Paid', amount: '$2,100.00' },
];

function InvoicesPage() {
  return (
    <div className={styles.invoicesPage}>
      <div className={styles.invoicesHeader}>
        <h1 className={styles.pageTitle}>Invoices</h1>
        <p className={styles.invoicesSubheadline}>
          Please email <a href="mailto:billing@fastly.com" className={styles.invoicesEmailLink}>billing@fastly.com</a> to receive invoices by email. It may take approximately a day to see the invoices in the control panel.
        </p>
      </div>
      <div className={styles.tableScroll}>
        <table className={styles.invoicesTable}>
          <thead>
            <tr>
              <th>Invoice ↓</th>
              <th>Status</th>
              <th className={styles.thRight}>Amount</th>
              <th className={styles.thAction} />
            </tr>
          </thead>
          <tbody>
            {invoicesFullData.map((inv, i) => (
              <tr key={i}>
                <td><button className={styles.invoiceLink}>{inv.date}</button></td>
                <td>
                  <span className={styles.statusDot} style={{ backgroundColor: inv.status === 'Outstanding' ? 'var(--COLOR--error--text, #e9190c)' : 'var(--COLOR--success--text, #25741e)' }} />
                  {inv.status}
                </td>
                <td className={styles.tdRight}>{inv.amount}</td>
                <td><button className={styles.printLink}>Print</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
