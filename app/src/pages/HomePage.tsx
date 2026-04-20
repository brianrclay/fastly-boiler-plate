import { useState, useRef, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { services as allServicesData } from '../data/services';
import { usePrototype } from '../context/PrototypeContext';
import styles from './HomePage.module.css';

/* ─── Static data ─── */
interface HomeServiceConfig {
  type: 'Production' | 'Staging' | 'Draft' | 'Locked';
  version?: string;
}

interface HomeService {
  name: string;
  id: string;
  type: 'CDN' | 'Compute';
  configs: HomeServiceConfig[];
  rps: number;
  status: string;
}

const servicesList: HomeService[] = allServicesData
  .map((s) => ({
    name: s.name,
    id: s.id,
    type: s.serviceType,
    configs: s.configs.map((c) => ({ type: c.type, version: c.version })),
    rps: s.rps,
    status: 'Blocking',
  }))
  .sort((a, b) => b.rps - a.rps);

const workspacesList = [
  { name: 'Acme Prod', rps: '0 R/s', linked: 'Linked to 3 services' },
  { name: 'Workspace Two', rps: '0 R/s', linked: 'Linked to 1 service' },
  { name: 'Workspace Two', rps: '0 R/s', linked: 'Linked to 1 service' },
];

interface HomePageProps {
  title?: string;
  pageVisible?: boolean;
  onNavigate?: (id: string) => void;
  onServiceClick?: (name: string) => void;
  onCreateService?: () => void;
}

export function HomePage({ title = 'Home', pageVisible = true, onNavigate, onServiceClick, onCreateService }: HomePageProps) {
  const { isBrandNew } = usePrototype();

  if (title !== 'Home') {
    return <GenericPage title={title} pageVisible={pageVisible} />;
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={`${styles.pageContent} ${pageVisible ? styles.pageContentAnimate : styles.pageContentHidden}`}>
        {isBrandNew ? (
          <BrandNewHome onNavigate={onNavigate} onCreateService={onCreateService} />
        ) : (
          <>
            <PageHeader onNavigate={onNavigate} onCreateService={onCreateService} />
            <div className={styles.columns}>
              <div className={styles.colLeft}>
                <AccountMetrics onNavigate={onNavigate} />
                <DdosMetrics onNavigate={onNavigate} />
                <WafMetrics onNavigate={onNavigate} />
                <TlsCard onNavigate={onNavigate} />
                <UsageSpendCard onNavigate={onNavigate} />
              </div>
              <div className={styles.colRight}>
                <ServicesCard onNavigate={onNavigate} onServiceClick={onServiceClick} />
                <WorkspacesCard onNavigate={onNavigate} />
                <QuickCreate onNavigate={onNavigate} onCreateService={onCreateService} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Hook: close dropdown on outside click ─── */
function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return { open, setOpen, ref };
}

/* ─── Generic fallback for non-home pages ─── */
function GenericPage({ title, pageVisible }: { title: string; pageVisible: boolean }) {
  return (
    <div className={styles.pageWrapper}>
      <div className={`${styles.pageContent} ${pageVisible ? styles.pageContentAnimate : styles.pageContentHidden}`}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>{title}</h1>
        </div>
        <div className={styles.genericCards}>
          <div className={styles.genericCardsRow}>
            <div className={styles.genericCard} />
            <div className={styles.genericCard} />
          </div>
          <div className={styles.genericCard} />
          <div className={styles.genericCard} />
        </div>
      </div>
    </div>
  );
}

/* ─── Page header with Create dropdown ─── */
function PageHeader({ onNavigate, onCreateService }: { onNavigate?: (id: string) => void; onCreateService?: () => void }) {
  const { open, setOpen, ref } = useDropdown();

  const createItems = [
    { label: 'CDN Service', icon: 'network-services-colorful', nav: 'cdn' },
    { label: 'Compute Service', icon: 'compute-colorful', nav: 'compute' },
    { label: 'Next-Gen WAF Workspace', icon: 'security-colorful', nav: 'next-gen-waf' },
    { label: 'Custom dashboard', icon: 'observability-colorful', nav: 'custom-dashboards' },
  ];

  return (
    <div className={styles.pageHeader}>
      <div className={styles.pageHeaderRow}>
        <h1 className={styles.title}>Acme Co.</h1>
        <div className={styles.dropdownWrapper} ref={ref}>
          <button className={styles.createBtn} onClick={() => setOpen(!open)}>
            Create
            <Icon name="chevron-down" size={20} style={{ color: 'white' }} />
          </button>
          {open && (
            <div className={styles.dropdown}>
              {createItems.map((item) => (
                <button
                  key={item.label}
                  className={styles.dropdownItem}
                  onClick={() => { setOpen(false); item.nav === 'cdn' && onCreateService ? onCreateService() : onNavigate?.(item.nav); }}
                >
                  <Icon name={item.icon} size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Metric widget card (reusable) ─── */
function MetricWidgetCard({ title: cardTitle, subtitle, metrics, cols, linkText, onLinkClick, sparklines }: {
  title: string;
  subtitle: string;
  metrics: { label: string; value: string }[];
  cols: number;
  linkText: string;
  onLinkClick?: () => void;
  sparklines?: number[][];
}) {
  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3 className={styles.widgetTitle}>{cardTitle}</h3>
        <span className={styles.widgetSubtitle}>{subtitle}</span>
      </div>
      <div className={styles.metricGrid} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {metrics.map((m, i) => (
          sparklines && sparklines[i] ? (
            <button key={i} className={styles.metricCell} onClick={onLinkClick}>
              <span className={styles.metricLabel}>{m.label}</span>
              <span className={styles.metricValue}>{m.value}</span>
              <div className={styles.miniSparklineWrap}>
                <MiniSparkline data={sparklines[i]} />
                <div className={styles.miniSparklineFade} />
              </div>
              <div className={styles.metricCellHover}>
                <div className={styles.acctMetricHoverBtn}>
                  <Icon name="search" size={20} />
                  <span>View dashboard</span>
                </div>
              </div>
            </button>
          ) : (
            <div key={i} className={styles.metricCell}>
              <span className={styles.metricLabel}>{m.label}</span>
              <span className={styles.metricValue}>{m.value}</span>
            </div>
          )
        ))}
      </div>
      <div className={styles.widgetFooter}>
        <button className={styles.widgetLink} onClick={onLinkClick}>{linkText}</button>
      </div>
    </div>
  );
}

/* ─── Account metrics ─── */
const accountMetrics = [
  { label: 'Requests', value: '129,181', spark: [30, 28, 35, 40, 38, 45, 50, 48, 55, 52] },
  { label: 'Average hit ratio', value: '98.23%', spark: [50, 48, 45, 42, 40, 38, 35, 33, 30, 28] },
  { label: 'Errors', value: '1,181', spark: [10, 12, 15, 20, 18, 25, 30, 28, 35, 40] },
  { label: 'Average error ratio', value: '1.67%', spark: [5, 6, 5, 7, 6, 5, 6, 5, 6, 5] },
  { label: 'Bandwidth', value: '142,781 GB', spark: [20, 22, 25, 28, 30, 32, 35, 38, 40, 42] },
  { label: 'vCPU usage', value: '182,212 ms', spark: [35, 33, 30, 28, 30, 32, 28, 25, 22, 20] },
];

function MiniSparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 96;
  const h = 40;
  const padTop = 4;
  const uid = `spark-${data[0]}-${data[data.length - 1]}`;

  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: padTop + h - ((v - min) / range) * h,
  }));

  const linePoints = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPoints = `0,48 ${linePoints} ${w},48`;

  return (
    <svg viewBox={`0 0 ${w} 48`} preserveAspectRatio="none" className={styles.miniSparkline}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5DAFCF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5DAFCF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${uid})`} />
      <polyline points={linePoints} fill="none" stroke="#5DAFCF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AccountMetrics({ onNavigate }: { onNavigate?: (id: string) => void }) {
  return (
    <div className={styles.acctCard}>
      <div className={styles.widgetHeader}>
        <h3 className={styles.widgetTitle}>Account metrics</h3>
        <span className={styles.widgetSubtitle}>Month-to-date</span>
      </div>
      <div className={styles.metricGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {accountMetrics.map((m, i) => (
          <button key={i} className={styles.acctMetricCell} onClick={() => onNavigate?.('observability')}>
            <span className={styles.metricLabel}>{m.label}</span>
            <span className={styles.metricValue}>{m.value}</span>
            <div className={styles.miniSparklineWrap}>
              <MiniSparkline data={m.spark} />
              <div className={styles.miniSparklineFade} />
            </div>
            <div className={styles.acctMetricHover}>
              <div className={styles.acctMetricHoverBtn}>
                <Icon name="search" size={20} />
                <span>Open in Observability</span>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className={styles.widgetFooter}>
        <button className={styles.widgetLink} onClick={() => onNavigate?.('observability')}>View Observability dashboard</button>
      </div>
    </div>
  );
}

/* ─── DDoS metrics ─── */
function DdosMetrics({ onNavigate }: { onNavigate?: (id: string) => void }) {
  return (
    <MetricWidgetCard
      title="DDoS Protection metrics"
      subtitle="Last 30 days"
      cols={2}
      metrics={[
        { label: 'All requests', value: '123.45k' },
        { label: 'Allowed requests', value: '999' },
        { label: 'DDoS attack requests', value: '123.45k' },
        { label: 'DDoS attack requests mitigated', value: '999' },
      ]}
      sparklines={[
        [30, 28, 35, 40, 38, 45, 50, 48, 55, 52],
        [10, 12, 8, 15, 11, 14, 9, 13, 10, 12],
        [25, 30, 28, 35, 33, 40, 38, 45, 42, 48],
        [20, 18, 22, 25, 23, 28, 26, 30, 28, 32],
      ]}
      linkText="View DDoS Protection dashboard"
      onLinkClick={() => onNavigate?.('ddos-protection')}
    />
  );
}

/* ─── WAF metrics ─── */
function WafMetrics({ onNavigate }: { onNavigate?: (id: string) => void }) {
  return (
    <MetricWidgetCard
      title="Next-Gen WAF metrics"
      subtitle="Last 30 days"
      cols={2}
      metrics={[
        { label: 'Request volume', value: '123.45k' },
        { label: 'Blocked requests', value: '999' },
      ]}
      sparklines={[
        [40, 45, 42, 50, 48, 55, 52, 58, 55, 60],
        [5, 8, 6, 10, 7, 12, 9, 11, 8, 10],
      ]}
      linkText="View Next-Gen WAF dashboard"
      onLinkClick={() => onNavigate?.('next-gen-waf')}
    />
  );
}

/* ─── TLS card ─── */
function TlsCard({ onNavigate }: { onNavigate?: (id: string) => void }) {
  return (
    <div className={styles.tlsCard}>
      <h3 className={styles.widgetTitle} style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('tls-management')}>TLS</h3>
      <TlsRow
        sectionTitle="Fastly managed"
        items={[
          { label: 'Valid', value: '10', color: 'var(--COLOR--success--text, #25741e)' },
          { label: 'Pending', value: '0', color: 'var(--text-primary)' },
          { label: 'Renewing', value: '1', color: 'var(--COLOR--caution--text, #996500)' },
          { label: 'Failed', value: '2', color: 'var(--COLOR--error--text, #bd140a)' },
        ]}
      />
      <TlsRow
        sectionTitle="Self-managed certificates"
        items={[
          { label: 'Valid', value: '10', color: 'var(--COLOR--success--text, #25741e)' },
          { label: 'Expiring', value: '1', color: 'var(--COLOR--caution--text, #996500)' },
          { label: 'Expired', value: '2', color: 'var(--COLOR--error--text, #bd140a)' },
        ]}
      />
    </div>
  );
}

function TlsRow({ sectionTitle, items }: { sectionTitle: string; items: { label: string; value: string; color: string }[] }) {
  return (
    <div className={styles.tlsSection}>
      <h4 className={styles.tlsSectionTitle}>{sectionTitle}</h4>
      <div className={styles.tlsMetrics}>
        {items.map((item, i) => (
          <div key={i} className={styles.tlsMetric}>
            <span className={styles.tlsMetricLabel}>{item.label}</span>
            <span className={styles.tlsMetricValue} style={{ color: item.color }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Usage & spend alert ─── */
function UsageSpendCard({ onNavigate }: { onNavigate?: (id: string) => void }) {
  const spent = 20.13;
  const limit = 100;
  const pct = (spent / limit) * 100;

  return (
    <div className={styles.spendCard}>
      <div className={styles.spendHeader}>
        <h3 className={styles.widgetTitle}>Usage &amp; spend alert</h3>
        <div className={styles.spendActions}>
          <button className={styles.spendActionLink} onClick={() => onNavigate?.('billing')}>Edit spend alert</button>
          <button className={styles.spendActionLink} onClick={() => onNavigate?.('billing')}>Usage</button>
        </div>
      </div>
      <div className={styles.spendProgress}>
        <div className={styles.spendProgressHeader}>
          <span className={styles.spendProgressLabel}>Spend alert progress</span>
          <span className={styles.spendProgressLabel}>${spent.toFixed(2)} / ${limit}</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
          <div className={styles.progressMarker} style={{ left: '80%' }} />
        </div>
        <span className={styles.spendHelpText}>
          An email will be sent at 80% and 100% of your ${limit.toFixed(2)} spend alert limit.
        </span>
      </div>
      <div className={styles.spendLineItems}>
        <div className={styles.spendLine}><span>CDN</span><span>$18.13</span></div>
        <div className={styles.spendLine}><span>Compute</span><span>$1.00</span></div>
        <div className={styles.spendLine}><span>KV Storage</span><span>$1.00</span></div>
      </div>
    </div>
  );
}

/* ─── Services card ─── */
const sortOptions = [
  { id: 'last-viewed', label: 'Last viewed' },
  { id: 'highest-rps', label: 'Highest R/s' },
  { id: 'recently-created', label: 'Recently created' },
  { id: 'last-changed', label: 'Last changed' },
];

function ServicesCard({ onNavigate, onServiceClick }: { onNavigate?: (id: string) => void; onServiceClick?: (name: string) => void }) {
  const { isBrandNew } = usePrototype();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('last-viewed');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const sortDropdown = useDropdown();

  const tabs = [
    { id: 'all', label: 'All', icon: 'platform' },
    { id: 'cdn', label: 'CDN', icon: 'network-services-colorful' },
    { id: 'compute', label: 'Compute', icon: 'compute-colorful' },
  ];

  const activeServicesList = isBrandNew ? [] : servicesList;

  const filtered = activeServicesList.filter((s) => {
    if (activeTab !== 'all' && s.type.toLowerCase() !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className={styles.listCard}>
      <div className={styles.listCardHeader}>
        <h3 className={styles.widgetTitle}>Services</h3>
        <div className={styles.listCardActions}>
          <button className={styles.tabLink} onClick={() => onNavigate?.('compute')}>Compute</button>
          <button className={styles.tabLink} onClick={() => onNavigate?.('cdn')}>CDN</button>
        </div>
      </div>
      <div className={styles.listControls}>
        <div className={styles.listSearch}>
          <Icon name="search" size={20} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className={`${styles.dropdownWrapper} ${styles.sortWrapper}`} ref={sortDropdown.ref}>
          <button className={styles.listSort} onClick={() => sortDropdown.setOpen(!sortDropdown.open)}>
            {sortOptions.find((o) => o.id === sortBy)?.label}
            <Icon name="chevron-down" size={20} />
          </button>
          {sortDropdown.open && (
            <div className={styles.dropdown}>
              {sortOptions.map((opt) => (
                <button
                  key={opt.id}
                  className={`${styles.dropdownItem} ${sortBy === opt.id ? styles.dropdownItemActive : ''}`}
                  onClick={() => { setSortBy(opt.id); sortDropdown.setOpen(false); }}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.id && <Icon name="check" size={20} style={{ color: 'var(--text-action)' }} />}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          className={`${styles.favButton} ${favoritesOnly ? styles.favButtonActive : ''}`}
          onClick={() => setFavoritesOnly(!favoritesOnly)}
        >
          <Icon name={favoritesOnly ? 'star-filled' : 'star'} size={20} />
        </button>
      </div>
      <div className={styles.tabRow}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon name={tab.icon} size={20} />
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.serviceList}>
        {filtered.slice(0, 5).map((svc, i) => (
          <div key={i} className={styles.serviceRow}>
            <div className={styles.serviceMain}>
              <span className={styles.serviceIcon}>
                <Icon name={svc.type === 'Compute' ? 'compute-colorful' : 'network-services-colorful'} size={20} />
              </span>
              <button className={styles.serviceNameLink} onClick={() => onServiceClick?.(svc.name)}>{svc.name}</button>
              <div className={styles.serviceActions}>
                {svc.configs[0] && (
                  <span className={styles.versionPill}>
                    v{svc.configs[0].version || svc.configs[0].type}
                  </span>
                )}
                <Icon name="star" size={20} style={{ color: 'var(--text-secondary)' }} />
              </div>
            </div>
            <div className={styles.serviceSub}>
              <span className={styles.statusPill}>{svc.status}</span>
              <span className={styles.separator} />
              <span className={styles.serviceRps}>{svc.rps.toLocaleString()} R/s</span>
            </div>
          </div>
        ))}
      </div>
      <Pagination total={30} perPage={5} />
    </div>
  );
}

/* ─── Workspaces card ─── */
function WorkspacesCard({ onNavigate }: { onNavigate?: (id: string) => void }) {
  return (
    <div className={styles.listCard}>
      <div className={styles.listCardHeader}>
        <h3 className={styles.widgetTitle}>Workspaces</h3>
        <button className={styles.tabLink} onClick={() => onNavigate?.('next-gen-waf')}>Next-Gen WAF</button>
      </div>
      <div className={styles.listControls}>
        <div className={styles.listSearch}>
          <Icon name="search" size={20} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <input type="text" placeholder="Search" />
        </div>
        <button className={styles.listSort}>
          Last viewed
          <Icon name="chevron-down" size={20} />
        </button>
      </div>
      <div className={styles.serviceList}>
        {workspacesList.map((ws, i) => (
          <div key={i} className={styles.serviceRow}>
            <div className={styles.serviceMain}>
              <span className={styles.serviceIcon}>
                <Icon name="security-colorful" size={20} />
              </span>
              <span className={styles.serviceName}>{ws.name}</span>
              <Icon name="star" size={20} style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div className={styles.serviceSub}>
              <span className={styles.serviceRps}>{ws.rps}</span>
              <span className={styles.separator} />
              <span className={styles.serviceRps}>{ws.linked}</span>
            </div>
          </div>
        ))}
      </div>
      <Pagination total={30} perPage={5} />
    </div>
  );
}

/* ─── Quick create ─── */
function QuickCreate({ onNavigate, onCreateService }: { onNavigate?: (id: string) => void; onCreateService?: () => void }) {
  const items = [
    { label: 'CDN service', nav: 'cdn' },
    { label: 'Next-Gen WAF Workspace', nav: 'next-gen-waf' },
    { label: 'Compute Service', nav: 'compute' },
    { label: 'Custom dashboard', nav: 'custom-dashboards' },
  ];
  return (
    <div className={styles.quickCreate}>
      <h3 className={styles.widgetTitle}>Quick create</h3>
      <div className={styles.quickCreateButtons}>
        {items.map((item) => (
          <button key={item.label} className={styles.quickCreateBtn} onClick={() => item.nav === 'cdn' && onCreateService ? onCreateService() : onNavigate?.(item.nav)}>
            <Icon name="add" size={20} />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Pagination ─── */
function Pagination({ total, perPage }: { total: number; perPage: number }) {
  return (
    <div className={styles.pagination}>
      <div className={styles.paginationLeft}>
        <span className={styles.paginationLabel}>Results per page:</span>
        <button className={styles.paginationSelect}>
          {perPage}
          <Icon name="chevron-down" size={20} />
        </button>
      </div>
      <div className={styles.paginationRight}>
        <span className={styles.paginationInfo}>{total} results</span>
        <div className={styles.paginationArrows}>
          <button className={styles.paginationArrow}>
            <Icon name="chevron-left" size={20} />
          </button>
          <button className={styles.paginationArrow}>
            <Icon name="chevron-right" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Brand New User Home ─── */
function BrandNewHome({ onNavigate, onCreateService }: { onNavigate?: (id: string) => void; onCreateService?: () => void }) {
  const metricRows = [
    [{ label: 'Requests', value: '--' }, { label: 'Average hit ratio', value: '--' }],
    [{ label: 'Errors', value: '--' }, { label: 'Average error ratio', value: '--' }],
    [{ label: 'Bandwidth', value: '--' }, { label: 'Average error ratio', value: '--' }],
  ];

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderRow}>
          <h1 className={styles.title}>Acme Co.</h1>
          <button className={styles.createBtn} onClick={onCreateService}>
            Create service
            <Icon name="chevron-down" size={20} style={{ color: 'white' }} />
          </button>
        </div>
      </div>
      <div className={styles.columns}>
        <div className={styles.colLeft}>
          {/* Get started */}
          <div className={styles.getStartedCard}>
            <h3 className={styles.widgetTitle}>Get started</h3>
            <div className={styles.getStartedItems}>
              <div className={styles.getStartedItem}>
                <div className={styles.getStartedIcon}>
                  <Icon name="cdn" size={20} />
                </div>
                <div className={styles.getStartedContent}>
                  <h4 className={styles.getStartedItemTitle}>Create your first service</h4>
                  <p className={styles.getStartedItemDesc}>Deploy your application on the worlds fastest CDN.</p>
                  <button className={styles.createBtnSmall} onClick={onCreateService}>Create CDN service</button>
                </div>
              </div>
              <div className={styles.getStartedItem}>
                <div className={styles.getStartedIcon}>
                  <Icon name="user-management" size={20} />
                </div>
                <div className={styles.getStartedContent}>
                  <h4 className={styles.getStartedItemTitle}>Invite your teammates</h4>
                  <p className={styles.getStartedItemDesc}>Invite as many team members to your account as you'd like. All seats on Fastly <strong>are free</strong>.</p>
                  <button className={styles.outlinedBtn} onClick={() => onNavigate?.('user-management')}>Send an invite</button>
                </div>
              </div>
            </div>
          </div>

          {/* Account metrics */}
          <div className={styles.metricsCard}>
            <div className={styles.metricsCardHeader}>
              <h3 className={styles.widgetTitle}>Account metrics</h3>
              <span className={styles.metricsSubtext}>Data from the last 30 days</span>
            </div>
            <div className={styles.metricsGrid}>
              {metricRows.map((row, ri) => (
                <div key={ri} className={styles.metricsGridRow}>
                  {row.map((m, ci) => (
                    <div key={ci} className={styles.metricsGridCell}>
                      <span className={styles.metricsGridLabel}>{m.label}</span>
                      <span className={styles.metricsGridValue}>{m.value}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className={styles.metricsFooter}>
              <button className={styles.actionLinkBtn} onClick={() => onNavigate?.('observability')}>View Observability dashboard</button>
            </div>
          </div>

          {/* DDoS */}
          <div className={styles.promoCard}>
            <h3 className={styles.widgetTitle}>DDoS Protection metrics</h3>
            <span className={styles.metricsSubtext}>Data from the last 30 days</span>
            <div className={styles.promoBanner}>
              <Icon name="info-filled" size={24} style={{ color: 'var(--text-action)', flexShrink: 0 }} />
              <div className={styles.promoBannerContent}>
                <h4 className={styles.promoBannerTitle}>Get started with DDoS Protection</h4>
                <p className={styles.promoBannerDesc}>Automatic DDoS protection that keeps any application and API available and performant.</p>
              </div>
              <button className={styles.outlinedBtn}>Enable</button>
            </div>
          </div>

          {/* WAF */}
          <div className={styles.promoCard}>
            <h3 className={styles.widgetTitle}>Next-Gen WAF metrics</h3>
            <span className={styles.metricsSubtext}>Data from the last 30 days</span>
            <div className={styles.promoBanner}>
              <Icon name="info-filled" size={24} style={{ color: 'var(--text-action)', flexShrink: 0 }} />
              <div className={styles.promoBannerContent}>
                <h4 className={styles.promoBannerTitle}>Protect your applications and APIs</h4>
                <p className={styles.promoBannerDesc}>Lorem ipsum nisi tristique accumsan condimentum urna tincidunt etiam at elit pretium amet turpis tellus.</p>
              </div>
              <button className={styles.outlinedBtn}>Enable</button>
            </div>
          </div>

          {/* TLS */}
          <div className={styles.promoCard}>
            <h3 className={styles.widgetTitle}>TLS Certificate Status</h3>
            <span className={styles.metricsSubtext}>Data from the last 30 days</span>
            <div className={styles.promoBanner}>
              <Icon name="info-filled" size={24} style={{ color: 'var(--text-action)', flexShrink: 0 }} />
              <div className={styles.promoBannerContent}>
                <h4 className={styles.promoBannerTitle}>Add a TLS certificate</h4>
                <p className={styles.promoBannerDesc}>Lorem ipsum nisi tristique accumsan condimentum urna tincidunt etiam at elit pretium amet turpis tellus.</p>
              </div>
              <button className={styles.outlinedBtn}>Enable</button>
            </div>
          </div>

          {/* Plan usage */}
          <div className={styles.promoCard}>
            <h3 className={styles.widgetTitle}>Plan usage</h3>
            <span className={styles.metricsSubtext}>Month-to-date</span>
            <div className={styles.planUsageRows}>
              <div className={styles.planUsageRow}>
                <span className={styles.planUsageLabel}>Requests</span>
                <span className={styles.planUsageValue}>-- <span className={styles.planUsageSep}>|</span> Billed units: --</span>
              </div>
              <div className={styles.planUsageRow}>
                <span className={styles.planUsageLabel}>Bandwidth</span>
                <span className={styles.planUsageValue}>--</span>
              </div>
              <div className={styles.planUsageRow}>
                <span className={styles.planUsageLabel}>Compute duration</span>
                <span className={styles.planUsageValue}>--</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.colRight}>
          {/* Services empty */}
          <div className={styles.servicesWidget}>
            <div className={styles.emptyWidgetHeader}>
              <h3 className={styles.widgetTitle}>Services</h3>
            </div>
            <div className={styles.searchRow}>
              <div className={styles.searchInput}>
                <Icon name="search" size={20} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Search</span>
              </div>
              <div className={styles.sortDropdown}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Last viewed</span>
                <Icon name="caret-down" size={20} style={{ color: 'var(--text-secondary)' }} />
              </div>
            </div>
            <div className={styles.emptyState}>
              <h4 className={styles.emptyStateTitle}>There are no services to display</h4>
              <p className={styles.emptyStateDesc}>Create your first service to see data.</p>
            </div>
          </div>

          {/* Workspaces empty */}
          <div className={styles.servicesWidget}>
            <div className={styles.emptyWidgetHeader}>
              <h3 className={styles.widgetTitle}>Workspaces</h3>
            </div>
            <div className={styles.searchRow}>
              <div className={styles.searchInput}>
                <Icon name="search" size={20} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Search</span>
              </div>
            </div>
            <div className={styles.emptyState}>
              <h4 className={styles.emptyStateTitle}>There are no workspaces to display</h4>
              <p className={styles.emptyStateDesc}>Create your first workspace to see data.</p>
            </div>
          </div>

          {/* Quick create */}
          <QuickCreate onNavigate={onNavigate} onCreateService={onCreateService} />
        </div>
      </div>
    </>
  );
}
