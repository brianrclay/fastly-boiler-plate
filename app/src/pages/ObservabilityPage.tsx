import { useCallback } from 'react';
import { L2Sidebar } from '../components/L2Sidebar';
import { Footer } from '../components/Footer';
import { Icon } from '../components/Icon';
import { observabilityNavData } from '../data/observabilityNav';
import { services } from '../data/services';
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

const cdnServices = services.filter(s => s.serviceType === 'CDN');
const computeServices = services.filter(s => s.serviceType === 'Compute');
const defaultServiceName = cdnServices[0]?.name || 'Maple 1';

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
          {renderPage(activeL2Item)}
        </div>
        <Footer />
      </div>
    </div>
  );
}

function renderPage(activeL2Item: string) {
  switch (activeL2Item) {
    case 'account-summary': return <AccountSummaryPage />;
    case 'service-overview': return <ServiceOverviewPage />;
    case 'all-services': return <AllServicesPage />;
    case 'obs-domains': return <DomainInspectorPage />;
    case 'origins': return <OriginInspectorPage />;
    case 'insights': return <InsightsPage />;
    case 'explorer': return <ExplorerPage />;
    case 'tailing': return <TailingPage />;
    case 'alerts-overview': return <AlertsOverviewPage />;
    case 'definitions': return <DefinitionsPage />;
    case 'integrations': return <IntegrationsPage />;
    case 'custom-dashboards': return <CustomDashboardsPage />;
    default: {
      const title = pageTitles[activeL2Item] || 'Account summary';
      return (
        <>
          <div className={styles.pageHeader}>
            <h1 className={styles.title}>{title}</h1>
          </div>
          <div className={styles.card}>
            <p className={styles.descText}>Content for this page is coming soon.</p>
          </div>
        </>
      );
    }
  }
}

/* ─── SVG Chart Components ─── */
function AreaChart({ data, color = 'var(--text-action)', height = 80, width = 400 }: { data: number[]; color?: string; height?: number; width?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: 4 + (height - 8) - ((v - min) / range) * (height - 8),
  }));
  const linePoints = pts.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = `0,${height} ${linePoints} ${width},${height}`;
  const uid = `obs-area-${data[0]}-${data.length}-${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={styles.chartSvg}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${uid})`} />
      <polyline points={linePoints} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BarChart({ data, color = 'var(--text-action)', height = 80, width = 400 }: { data: number[]; color?: string; height?: number; width?: number }) {
  const max = Math.max(...data);
  const barWidth = (width / data.length) * 0.7;
  const gap = (width / data.length) * 0.3;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={styles.chartSvg}>
      {data.map((v, i) => {
        const barH = (v / (max || 1)) * (height - 4);
        const x = i * (barWidth + gap);
        return <rect key={i} x={x} y={height - barH} width={barWidth} height={barH} fill={color} rx="1" opacity="0.8" />;
      })}
    </svg>
  );
}

function MultiLineChart({ series, height = 80, width = 400 }: { series: { data: number[]; color: string }[]; height?: number; width?: number }) {
  const allVals = series.flatMap(s => s.data);
  const max = Math.max(...allVals);
  const min = Math.min(...allVals);
  const range = max - min || 1;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={styles.chartSvg}>
      {series.map((s, si) => {
        const pts = s.data.map((v, i) => ({
          x: (i / (s.data.length - 1)) * width,
          y: 4 + (height - 8) - ((v - min) / range) * (height - 8),
        }));
        const linePoints = pts.map(p => `${p.x},${p.y}`).join(' ');
        return <polyline key={si} points={linePoints} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
      })}
    </svg>
  );
}

/* ─── Reusable UI Elements ─── */
function FilterBar({ children }: { children: React.ReactNode }) {
  return <div className={styles.filterBar}>{children}</div>;
}

function FilterDropdown({ label, value }: { label?: string; value: string }) {
  return (
    <button className={styles.filterDropdown}>
      {label && <span className={styles.filterLabel}>{label}</span>}
      <span className={styles.filterValue}>{value}</span>
      <Icon name="chevron-down" size={16} />
    </button>
  );
}

function Pill({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'info' | 'trial' }) {
  const cls = variant === 'success' ? styles.pillSuccess
    : variant === 'info' ? styles.pillInfo
    : variant === 'trial' ? styles.pillTrial
    : styles.pillDefault;
  return <span className={cls}>{children}</span>;
}

function PrimaryButton({ children, icon }: { children: React.ReactNode; icon?: string }) {
  return (
    <button className={styles.primaryBtn}>
      {icon && <Icon name={icon} size={20} style={{ color: 'white' }} />}
      {children}
    </button>
  );
}

function OutlinedButton({ children, icon }: { children: React.ReactNode; icon?: string }) {
  return (
    <button className={styles.outlinedBtn}>
      {icon && <Icon name={icon} size={20} />}
      {children}
    </button>
  );
}

function WarningBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.warningBanner}>
      <Icon name="attention-filled" size={20} />
      <div className={styles.warningBannerText}>{children}</div>
    </div>
  );
}

function Toggle({ on = false }: { on?: boolean }) {
  return <div className={on ? styles.toggleOn : styles.toggleOff} />;
}

function ChartCard({ title, description, children, legendItems }: {
  title: string;
  description?: string;
  children: React.ReactNode;
  legendItems?: { color: string; label: string; value: string }[];
}) {
  return (
    <div className={styles.card}>
      <div className={styles.chartCardHeader}>
        <h3 className={styles.chartCardTitle}>{title}</h3>
        {description && <p className={styles.chartCardDesc}>{description}</p>}
      </div>
      <div className={styles.chartArea}>
        {children}
      </div>
      {legendItems && legendItems.length > 0 && (
        <div className={styles.chartLegend}>
          {legendItems.map((item, i) => (
            <div key={i} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: item.color }} />
              <span className={styles.legendLabel}>{item.label}</span>
              <span className={styles.legendValue}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({ title, count }: { title: string; count?: number }) {
  return (
    <div className={styles.collapsibleSection}>
      <div className={styles.collapsibleHeader}>
        <Icon name="chevron-right" size={20} />
        <span className={styles.collapsibleTitle}>{title}</span>
        {count !== undefined && <span className={styles.collapsibleCount}>{count}</span>}
      </div>
    </div>
  );
}

/* ─── Sample chart data generators ─── */
const requestsData = [40, 42, 38, 45, 50, 48, 55, 60, 58, 62, 65, 60, 58, 55, 52, 50, 48, 55, 60, 65, 70, 68, 72, 75];
const bandwidthData = [20, 22, 25, 28, 30, 32, 35, 38, 40, 42, 38, 35, 33, 36, 40, 45, 48, 50, 52, 55, 58, 60, 62, 65];
const errorData = [2, 1.5, 1.8, 2.2, 1.9, 1.6, 2.0, 2.5, 2.3, 1.8, 1.5, 1.2, 1.4, 1.6, 1.8, 2.0, 1.7, 1.5, 1.3, 1.6, 1.8, 2.1, 1.9, 1.7];
const hitRatioData = [88, 89, 90, 91, 89, 88, 90, 92, 93, 91, 90, 89, 91, 92, 93, 94, 92, 91, 90, 92, 93, 94, 95, 93];
const rpsData = [1200, 1400, 1300, 1500, 1600, 1550, 1700, 1800, 1750, 1900, 2000, 1950, 1850, 1800, 1750, 1700, 1800, 1900, 2000, 2100, 2050, 2150, 2200, 2100];
const status5xxData = [5, 3, 4, 6, 8, 7, 5, 4, 3, 2, 4, 6, 5, 3, 4, 5, 7, 6, 4, 3, 5, 4, 3, 2];
const statusCodesData = [200, 210, 205, 215, 220, 225, 230, 240, 235, 245, 250, 248, 240, 235, 230, 225, 235, 245, 255, 260, 265, 270, 275, 268];
const originOffloadData = [92, 93, 91, 94, 95, 93, 92, 94, 95, 96, 94, 93, 95, 96, 97, 95, 94, 96, 97, 98, 96, 95, 97, 96];

/* ═══════════════════════════════════════════════════
   1. ACCOUNT SUMMARY PAGE
   ═══════════════════════════════════════════════════ */
function AccountSummaryPage() {
  const stats = [
    { label: 'Current week total', value: '11.73B', sub: 'Requests' },
    { label: 'Last 7 day change', value: '-0.2%', sub: 'Requests' },
    { label: 'Current week total', value: '198.66 TB', sub: 'Bandwidth' },
    { label: 'Last 7 day change', value: '+9.14%', sub: 'Bandwidth' },
    { label: 'Current week average', value: '1.41%', sub: 'Error ratio' },
    { label: 'Last 7 day change', value: '+51.48%', sub: 'Error ratio' },
  ];

  const alertRows = Array.from({ length: 5 }, (_, i) => ({
    name: 'Discovery - 4xx Rate (excl 404) Above Threshold',
    started: `2026-04-${String(14 + i).padStart(2, '0')} 09:${String(15 + i * 3).padStart(2, '0')} UTC`,
    ended: `2026-04-${String(14 + i).padStart(2, '0')} 10:${String(30 + i * 5).padStart(2, '0')} UTC`,
  }));

  const dashboardRows = Array.from({ length: 5 }, (_, i) => ({
    name: `Custom Dashboard ${i + 1}`,
    created: `2026-03-${String(10 + i).padStart(2, '0')}`,
    updated: `2026-04-${String(5 + i * 2).padStart(2, '0')}`,
  }));

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Account Summary</h1>
          <Pill variant="trial">active trial</Pill>
        </div>
      </div>

      {/* Stat cards row */}
      <div className={styles.statsRow}>
        {stats.map((stat, i) => (
          <div key={i} className={styles.statCard}>
            <span className={styles.statLabel}>{stat.label}</span>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statSub}>{stat.sub}</span>
          </div>
        ))}
      </div>

      {/* Chart cards */}
      <div className={styles.chartGrid3}>
        <ChartCard
          title="Requests"
          description="Total number of requests"
          legendItems={[
            { color: 'var(--text-action)', label: 'All requests', value: '11.73B' },
          ]}
        >
          <AreaChart data={requestsData} />
        </ChartCard>
        <ChartCard
          title="Bandwidth"
          description="Total bandwidth transferred"
          legendItems={[
            { color: 'var(--text-action)', label: 'Total bandwidth', value: '198.66 TB' },
          ]}
        >
          <AreaChart data={bandwidthData} />
        </ChartCard>
        <ChartCard
          title="Error ratio"
          description="Percentage of error responses"
          legendItems={[
            { color: 'var(--text-action)', label: 'Error ratio', value: '1.41%' },
          ]}
        >
          <AreaChart data={errorData} color="var(--COLOR--error--text, #bd140a)" />
        </ChartCard>
      </div>

      <button className={styles.linkBtn}>All Services &gt;</button>

      {/* Latest Alerts & Custom Dashboards */}
      <div className={styles.twoColRow}>
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Latest Alerts</h3>
          <table className={styles.obsTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Started</th>
                <th>Ended</th>
              </tr>
            </thead>
            <tbody>
              {alertRows.map((row, i) => (
                <tr key={i}>
                  <td><button className={styles.tableLinkBtn}>{row.name}</button></td>
                  <td className={styles.monoCell}>{row.started}</td>
                  <td className={styles.monoCell}>{row.ended}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Custom Dashboards</h3>
          <table className={styles.obsTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Created on</th>
                <th>Updated on</th>
              </tr>
            </thead>
            <tbody>
              {dashboardRows.map((row, i) => (
                <tr key={i}>
                  <td><button className={styles.tableLinkBtn}>{row.name}</button></td>
                  <td className={styles.monoCell}>{row.created}</td>
                  <td className={styles.monoCell}>{row.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promo banners */}
      <div className={styles.twoColRow}>
        <div className={styles.promoBanner}>
          <div className={styles.promoBannerContent}>
            <h3 className={styles.promoBannerTitle}>Domain Inspector</h3>
            <p className={styles.promoBannerDesc}>Monitor traffic and performance at the domain level with granular analytics and real-time data.</p>
            <button className={styles.linkBtn}>Learn more</button>
          </div>
        </div>
        <div className={styles.promoBanner}>
          <div className={styles.promoBannerContent}>
            <h3 className={styles.promoBannerTitle}>Origin Inspector</h3>
            <p className={styles.promoBannerDesc}>Get deep visibility into origin server traffic, latency, and error rates to optimize performance.</p>
            <button className={styles.linkBtn}>Learn more</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   2. SERVICE OVERVIEW PAGE
   ═══════════════════════════════════════════════════ */
function ServiceOverviewPage() {
  const metricCards = [
    { title: 'Hit Ratio', desc: 'Cache hit percentage', data: hitRatioData, value: '93.2%' },
    { title: 'Origin Offload', desc: 'Traffic served from cache', data: originOffloadData, value: '96.1%' },
    { title: 'Requests', desc: 'Total requests', data: requestsData, value: '1.24B' },
    { title: 'Requests Per Second', desc: 'Average RPS', data: rpsData, value: '14,342' },
    { title: 'Bandwidth', desc: 'Total bandwidth', data: bandwidthData, value: '28.4 TB' },
    { title: 'Total Bandwidth', desc: 'Combined bandwidth', data: bandwidthData.map(v => v * 1.2), value: '34.1 TB' },
    { title: 'All Status Codes', desc: 'HTTP status code distribution', data: statusCodesData, value: '—', isBar: true },
    { title: 'Error Ratio', desc: 'Error response percentage', data: errorData, value: '1.41%', isError: true },
    { title: 'Status 5XX Details', desc: 'Server error breakdown', data: status5xxData, value: '0.03%', isError: true },
  ];

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Service Overview</h1>
          <Pill variant="info">Deliver</Pill>
          <div className={styles.headerActions}>
            <button className={styles.actionBtn}>Options <Icon name="chevron-down" size={16} /></button>
            <button className={styles.actionBtn}>Service configuration</button>
            <PrimaryButton icon="add">Create dashboard</PrimaryButton>
          </div>
        </div>
      </div>

      <FilterBar>
        <FilterDropdown label="Service:" value={defaultServiceName} />
        <FilterDropdown label="Region:" value="All regions" />
        <FilterDropdown label="Data Resolution:" value="Auto" />
        <FilterDropdown label="Time Range:" value="Last 1 hour UTC" />
      </FilterBar>

      <div className={styles.chartGrid3}>
        {metricCards.map((m, i) => (
          <ChartCard
            key={i}
            title={m.title}
            description={m.desc}
            legendItems={[
              { color: m.isError ? 'var(--COLOR--error--text, #bd140a)' : 'var(--text-action)', label: m.title, value: m.value },
            ]}
          >
            {m.isBar ? (
              <BarChart data={m.data} />
            ) : (
              <AreaChart data={m.data} color={m.isError ? 'var(--COLOR--error--text, #bd140a)' : 'var(--text-action)'} />
            )}
          </ChartCard>
        ))}
      </div>

      <CollapsibleSection title="Deliver" count={cdnServices.length} />
      <CollapsibleSection title="Compute" count={computeServices.length} />
      <CollapsibleSection title="Image Optimizer" count={0} />
      <CollapsibleSection title="WebSockets" count={0} />
      <CollapsibleSection title="Fanout" count={0} />
    </>
  );
}

/* ═══════════════════════════════════════════════════
   3. ALL SERVICES PAGE
   ═══════════════════════════════════════════════════ */
function AllServicesPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>All Services</h1>
          <Pill variant="default">All Services</Pill>
          <div className={styles.headerActions}>
            <button className={styles.actionBtn}>Options <Icon name="chevron-down" size={16} /></button>
            <PrimaryButton icon="add">Create dashboard</PrimaryButton>
          </div>
        </div>
      </div>

      <FilterBar>
        <FilterDropdown value="Select..." />
        <FilterDropdown label="Region:" value="All regions" />
        <FilterDropdown label="Data Resolution:" value="Auto" />
        <FilterDropdown label="Time Range:" value="Last 1 hour UTC" />
      </FilterBar>

      <div className={styles.chartGrid3}>
        <ChartCard
          title="Requests"
          description="Total number of requests"
          legendItems={[
            { color: 'var(--text-action)', label: 'All requests', value: '11.73B' },
          ]}
        >
          <AreaChart data={requestsData} />
        </ChartCard>
        <ChartCard
          title="Total Bandwidth"
          description="Total bandwidth transferred"
          legendItems={[
            { color: 'var(--text-action)', label: 'Total bandwidth', value: '198.66 TB' },
          ]}
        >
          <AreaChart data={bandwidthData} />
        </ChartCard>
        <ChartCard
          title="Error Ratio"
          description="Percentage of error responses"
          legendItems={[
            { color: 'var(--COLOR--error--text, #bd140a)', label: 'Error ratio', value: '1.41%' },
          ]}
        >
          <AreaChart data={errorData} color="var(--COLOR--error--text, #bd140a)" />
        </ChartCard>
      </div>

      <CollapsibleSection title="Deliver" count={cdnServices.length} />
      <CollapsibleSection title="Compute" count={computeServices.length} />
      <CollapsibleSection title="Image Optimizer" count={0} />
      <CollapsibleSection title="WebSockets" count={0} />
      <CollapsibleSection title="Fanout" count={0} />
    </>
  );
}

/* ═══════════════════════════════════════════════════
   4. DOMAIN INSPECTOR PAGE
   ═══════════════════════════════════════════════════ */
function DomainInspectorPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Domain Inspector</h1>
          <Pill variant="info">Deliver</Pill>
          <div className={styles.headerActions}>
            <button className={styles.actionBtn}>Options <Icon name="chevron-down" size={16} /></button>
            <button className={styles.actionBtn}>Service configuration</button>
            <PrimaryButton icon="add">Create dashboard</PrimaryButton>
          </div>
        </div>
      </div>

      <FilterBar>
        <FilterDropdown label="Service:" value={defaultServiceName} />
        <FilterDropdown label="Domain:" value="All domains" />
        <FilterDropdown label="Region:" value="All regions" />
        <FilterDropdown label="Data Resolution:" value="Auto" />
        <FilterDropdown label="Time Range:" value="Last 1 hour UTC" />
        <button className={styles.liveBtn}>Live</button>
      </FilterBar>

      <div className={styles.toggleRow}>
        <span className={styles.toggleLabel}>Monitor domain responses</span>
        <Toggle on={false} />
        <span className={styles.toggleState}>OFF</span>
      </div>

      <WarningBanner>
        <strong>Domain Inspector is not enabled.</strong> Enable Domain Inspector to view domain-level analytics for this service. Domain-level data provides granular visibility into traffic patterns, performance metrics, and error rates for each domain configured on your service.
      </WarningBanner>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   5. ORIGIN INSPECTOR PAGE
   ═══════════════════════════════════════════════════ */
function OriginInspectorPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Origin Inspector</h1>
          <Pill variant="info">Deliver</Pill>
          <div className={styles.headerActions}>
            <button className={styles.actionBtn}>Options <Icon name="chevron-down" size={16} /></button>
            <button className={styles.actionBtn}>Service configuration</button>
            <PrimaryButton icon="add">Create dashboard</PrimaryButton>
          </div>
        </div>
      </div>

      <FilterBar>
        <FilterDropdown label="Service:" value={defaultServiceName} />
        <FilterDropdown label="Origin:" value="All origins" />
        <FilterDropdown label="Region:" value="All regions" />
        <FilterDropdown label="Data Resolution:" value="Auto" />
        <FilterDropdown label="Time Range:" value="Last 1 hour UTC" />
        <button className={styles.liveBtn}>Live</button>
      </FilterBar>

      <div className={styles.toggleRow}>
        <span className={styles.toggleLabel}>Monitor origin responses</span>
        <Toggle on={false} />
        <span className={styles.toggleState}>OFF</span>
      </div>

      <WarningBanner>
        <strong>Origin Inspector is not enabled.</strong> Enable Origin Inspector to view origin-level analytics for this service. Origin-level data provides deep visibility into origin server traffic, latency, and error rates to help you optimize performance.
      </WarningBanner>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   6. INSIGHTS PAGE
   ═══════════════════════════════════════════════════ */
function InsightsPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Insights</h1>
          <Pill variant="info">Deliver</Pill>
        </div>
        <p className={styles.descText}>Gain deeper visibility into your traffic patterns with AI-powered insights and anomaly detection. Identify trends, correlate events, and optimize your service configuration.</p>
      </div>

      <FilterBar>
        <FilterDropdown label="Service:" value={defaultServiceName} />
        <FilterDropdown label="Domain:" value="All domains" />
        <FilterDropdown value="Filters" />
        <FilterDropdown label="Time Range:" value="Last 1 hour UTC" />
      </FilterBar>

      <div className={styles.toggleRow}>
        <span className={styles.toggleLabel}>Enable Insights and Log Explorer</span>
        <Toggle on={false} />
        <span className={styles.toggleState}>OFF</span>
      </div>

      <WarningBanner>
        <strong>Insights is not enabled.</strong> Enable Insights and Log Explorer to access AI-powered traffic analysis, anomaly detection, and advanced log querying capabilities for this service.
      </WarningBanner>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   7. EXPLORER PAGE
   ═══════════════════════════════════════════════════ */
function ExplorerPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Explorer</h1>
          <Pill variant="info">Deliver</Pill>
        </div>
        <p className={styles.descText}>Search and analyze your log data in real-time. Use the Log Explorer to filter, query, and investigate specific requests across your services.</p>
      </div>

      <FilterBar>
        <FilterDropdown label="Service:" value={defaultServiceName} />
        <div className={styles.searchInput}>
          <Icon name="search" size={16} />
          <span className={styles.searchPlaceholder}>Search domains...</span>
        </div>
        <FilterDropdown value="Filters" />
        <FilterDropdown label="Time Range:" value="Last 1 hour UTC" />
      </FilterBar>

      <WarningBanner>
        <strong>Log Explorer is disabled.</strong> The Log Explorer feature requires Insights to be enabled. Please enable Insights and Log Explorer from the Insights page to start querying your log data.
      </WarningBanner>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   8. TAILING PAGE
   ═══════════════════════════════════════════════════ */
function TailingPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Tailing</h1>
        <p className={styles.descText}>Stream real-time logs from your Compute services. Monitor live traffic, debug requests, and observe events as they happen at the edge.</p>
      </div>

      <FilterBar>
        <FilterDropdown label="Compute service:" value={computeServices[0]?.name || 'Select service'} />
        <FilterDropdown label="Events:" value="All events" />
        <div className={styles.filterSpacer} />
        <OutlinedButton>Pause</OutlinedButton>
      </FilterBar>

      <div className={styles.tailingArea}>
        <p className={styles.tailingWaiting}>Waiting for logs...</p>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   9. ALERTS OVERVIEW PAGE
   ═══════════════════════════════════════════════════ */
function AlertsOverviewPage() {
  const resolvedAlerts = Array.from({ length: 10 }, (_, i) => ({
    started: `2026-04-${String(10 + i).padStart(2, '0')} 08:${String(15 + i * 2).padStart(2, '0')} UTC`,
    name: i % 3 === 0 ? '4xx Rate Above Threshold' : i % 3 === 1 ? '5xx Rate Above Threshold' : 'Origin Latency Above Threshold',
    customer: 'Acme Corp',
    service: cdnServices[i % cdnServices.length]?.name || 'Maple 1',
    source: 'Stats',
    metric: i % 3 === 0 ? '4xx Error Rate' : i % 3 === 1 ? '5xx Error Rate' : 'Origin Latency p95',
  }));

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Admin Alerts</h1>
          <div className={styles.headerActions}>
            <PrimaryButton icon="add">Add alert definition</PrimaryButton>
          </div>
        </div>
      </div>

      <FilterBar>
        <FilterDropdown label="Customer:" value="All" />
        <FilterDropdown label="Service:" value="All services" />
        <FilterDropdown label="Definition:" value="All" />
        <FilterDropdown label="Created By:" value="All" />
        <FilterDropdown label="Time Range:" value="Last 7 days UTC" />
      </FilterBar>

      {/* Firing alerts */}
      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>Firing alerts (0)</h3>
        <div className={styles.emptyStateGreen}>
          <Icon name="check-circle-filled" size={32} />
          <div className={styles.emptyStateGreenText}>
            <strong>No alerts firing</strong>
            <span>You&apos;re all good for now!</span>
          </div>
        </div>
      </div>

      {/* Resolved alerts */}
      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>Resolved alerts</h3>
        <table className={styles.obsTable}>
          <thead>
            <tr>
              <th>Started UTC</th>
              <th>Name</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Source</th>
              <th>Metric</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {resolvedAlerts.map((alert, i) => (
              <tr key={i}>
                <td className={styles.monoCell}>{alert.started}</td>
                <td><button className={styles.tableLinkBtn}>{alert.name}</button></td>
                <td>{alert.customer}</td>
                <td>{alert.service}</td>
                <td>{alert.source}</td>
                <td>{alert.metric}</td>
                <td><button className={styles.tableLinkBtn}>Details</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.loadMoreRow}>
          <OutlinedButton>Load more</OutlinedButton>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   10. DEFINITIONS PAGE
   ═══════════════════════════════════════════════════ */
function DefinitionsPage() {
  const definitions = [
    {
      title: '4xx Rate (excl 404) Above Threshold',
      pills: ['Stats'],
      description: 'Triggers when the 4xx error rate (excluding 404s) exceeds the configured threshold for the specified time window.',
      dateAdded: '2026-01-15',
      customer: 'Acme Corp',
      service: cdnServices[0]?.name || 'Maple 1',
      metric: '4xx Error Rate (excl 404)',
      source: 'Stats',
    },
    {
      title: '5xx Rate Above Threshold',
      pills: ['Stats', 'Critical'],
      description: 'Triggers when the 5xx server error rate exceeds the configured threshold. This alert monitors server-side errors that may indicate origin issues.',
      dateAdded: '2026-02-03',
      customer: 'Acme Corp',
      service: cdnServices[1]?.name || 'Unnamed service 14',
      metric: '5xx Error Rate',
      source: 'Stats',
    },
    {
      title: 'Origin Latency p95 Above Threshold',
      pills: [],
      description: 'Triggers when the 95th percentile origin response time exceeds the configured threshold, indicating degraded origin performance.',
      dateAdded: '2026-03-12',
      customer: 'Acme Corp',
      service: cdnServices[2]?.name || 'Atlas',
      metric: 'Origin Latency p95',
      source: 'Domain Inspector',
    },
  ];

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Admin alert definitions</h1>
          <div className={styles.headerActions}>
            <PrimaryButton icon="add">Add alert definition</PrimaryButton>
          </div>
        </div>
      </div>

      <FilterBar>
        <div className={styles.searchInput}>
          <Icon name="search" size={16} />
          <span className={styles.searchPlaceholder}>Search definitions...</span>
        </div>
        <FilterDropdown label="Customer:" value="All" />
        <FilterDropdown label="Service:" value="All services" />
        <FilterDropdown label="Created By:" value="All" />
      </FilterBar>

      {definitions.map((def, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.definitionHeader}>
            <div className={styles.definitionTitleRow}>
              <h3 className={styles.definitionTitle}>{def.title}</h3>
              {def.pills.map((pill, pi) => (
                <Pill key={pi} variant="default">{pill}</Pill>
              ))}
            </div>
            <div className={styles.definitionActions}>
              <button className={styles.iconBtn}><Icon name="edit" size={20} /></button>
              <button className={styles.iconBtn}><Icon name="trash" size={20} /></button>
            </div>
          </div>
          <p className={styles.descText}>{def.description}</p>
          <div className={styles.definitionDetailsGrid}>
            <div className={styles.definitionDetail}>
              <span className={styles.definitionDetailLabel}>Date added</span>
              <span className={styles.definitionDetailValue}>{def.dateAdded}</span>
            </div>
            <div className={styles.definitionDetail}>
              <span className={styles.definitionDetailLabel}>Customer</span>
              <span className={styles.definitionDetailValue}>{def.customer}</span>
            </div>
            <div className={styles.definitionDetail}>
              <span className={styles.definitionDetailLabel}>Service</span>
              <span className={styles.definitionDetailValue}>{def.service}</span>
            </div>
            <div className={styles.definitionDetail}>
              <span className={styles.definitionDetailLabel}>Metric</span>
              <span className={styles.definitionDetailValue}>{def.metric}</span>
            </div>
            <div className={styles.definitionDetail}>
              <span className={styles.definitionDetailLabel}>Source</span>
              <span className={styles.definitionDetailValue}>{def.source}</span>
            </div>
          </div>
          <button className={styles.linkBtn}>Show all details</button>
        </div>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   11. INTEGRATIONS PAGE
   ═══════════════════════════════════════════════════ */
function IntegrationsPage() {
  const integrations = [
    { icon: 'bell', channel: '#prod-alerts', description: 'Production alerts channel for all critical service notifications', dateAdded: '2026-01-10', type: 'Slack' },
    { icon: 'bell', channel: '#staging-alerts', description: 'Staging environment alerts and notifications', dateAdded: '2026-02-05', type: 'Slack' },
    { icon: 'bell', channel: 'ops-team@acme.com', description: 'Operations team email notifications for P1 incidents', dateAdded: '2026-01-22', type: 'Email' },
    { icon: 'bell', channel: '#engineering-alerts', description: 'Engineering team Slack channel for service health alerts', dateAdded: '2026-03-01', type: 'Slack' },
    { icon: 'bell', channel: 'sre@acme.com', description: 'SRE team email digest for weekly alert summaries', dateAdded: '2026-02-18', type: 'Email' },
  ];

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Alert integrations</h1>
          <div className={styles.headerActions}>
            <PrimaryButton icon="add">Add alert integration</PrimaryButton>
          </div>
        </div>
      </div>

      <FilterBar>
        <FilterDropdown label="Type:" value="All types" />
      </FilterBar>

      {integrations.map((integ, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.integrationRow}>
            <div className={styles.integrationIcon}>
              <Icon name={integ.icon} size={24} />
            </div>
            <div className={styles.integrationContent}>
              <div className={styles.integrationHeader}>
                <h3 className={styles.integrationChannel}>{integ.channel}</h3>
                <Pill variant="default">{integ.type}</Pill>
              </div>
              <p className={styles.descText}>{integ.description}</p>
              <span className={styles.integrationMeta}>Date added: {integ.dateAdded}</span>
            </div>
            <div className={styles.integrationActions}>
              <button className={styles.iconBtn}><Icon name="edit" size={20} /></button>
              <button className={styles.iconBtn}><Icon name="trash" size={20} /></button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   12. CUSTOM DASHBOARDS PAGE
   ═══════════════════════════════════════════════════ */
function CustomDashboardsPage() {
  const dashboards = Array.from({ length: 10 }, (_, i) => ({
    name: i === 0 ? 'Production Overview' : i === 1 ? 'CDN Performance' : i === 2 ? 'Error Monitoring' : i === 3 ? 'Origin Health' : i === 4 ? 'Traffic Analysis' : i === 5 ? 'Security Dashboard' : i === 6 ? 'Bandwidth Report' : i === 7 ? 'Latency Tracker' : i === 8 ? 'Cache Efficiency' : 'Edge Performance',
    createdBy: i % 2 === 0 ? 'Jessica Gram' : 'Alex Jefferson',
    updatedOn: `2026-04-${String(1 + i * 2).padStart(2, '0')}`,
  }));

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Custom Dashboards</h1>
          <div className={styles.headerActions}>
            <PrimaryButton icon="add">Create new dashboard</PrimaryButton>
          </div>
        </div>
        <p className={styles.descText}>Create and manage custom dashboards to visualize the metrics that matter most to your team. Combine charts, tables, and alerts into a single view.</p>
      </div>

      <FilterBar>
        <div className={styles.searchInput}>
          <Icon name="search" size={16} />
          <span className={styles.searchPlaceholder}>Search dashboards...</span>
        </div>
        <FilterDropdown label="Created by:" value="All" />
      </FilterBar>

      <div className={styles.card}>
        <table className={styles.obsTable}>
          <thead>
            <tr>
              <th className={styles.checkboxCol}>
                <input type="checkbox" className={styles.checkbox} />
              </th>
              <th>Name</th>
              <th>Created by</th>
              <th>Updated on</th>
            </tr>
          </thead>
          <tbody>
            {dashboards.map((d, i) => (
              <tr key={i}>
                <td className={styles.checkboxCol}>
                  <input type="checkbox" className={styles.checkbox} />
                </td>
                <td><button className={styles.tableLinkBtn}>{d.name}</button></td>
                <td>{d.createdBy}</td>
                <td className={styles.monoCell}>{d.updatedOn}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.tablePagination}>
          <span className={styles.paginationInfo}>1-10 of 100 results</span>
          <div className={styles.paginationSpacer} />
          <span className={styles.paginationPageSelector}>
            Page <button className={styles.paginationPageBtn}>1 <Icon name="chevron-down" size={16} /></button>
          </span>
          <div className={styles.paginationArrows}>
            <button className={styles.paginationArrow}><Icon name="chevron-left" size={20} /></button>
            <button className={styles.paginationArrow}><Icon name="chevron-right" size={20} /></button>
          </div>
        </div>
      </div>
    </>
  );
}
