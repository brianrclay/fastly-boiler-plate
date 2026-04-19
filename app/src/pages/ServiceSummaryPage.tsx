import { useState, useRef, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Footer } from '../components/Footer';
import { services as allServices } from '../data/services';
import styles from './ServiceSummaryPage.module.css';

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);
  return { open, setOpen, ref };
}

/* ─── Simple seeded random for consistent per-service data ─── */
function seedRandom(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return () => { h = (h * 16807 + 0) % 2147483647; return (h & 0x7fffffff) / 2147483647; };
}

function genMetrics(name: string) {
  const r = seedRandom(name);
  return {
    requests: Math.floor(r() * 500000) + 10000,
    bandwidth: Math.floor(r() * 300000) + 5000,
    hitRatio: +(r() * 60 + 30).toFixed(2),
    missesPerSec: Math.floor(r() * 80000) + 1000,
    errorRatio: +(r() * 15 + 0.5).toFixed(2),
    latestVersion: Math.floor(r() * 10) + 1,
    totalVersions: Math.floor(r() * 5) + 3,
    sparklines: Array.from({ length: 5 }, () =>
      Array.from({ length: 10 }, () => Math.floor(r() * 60) + 10)
    ),
  };
}

function genVersions(name: string, latest: number, total: number) {
  const r = seedRandom(name + 'versions');
  const statuses = ['Latest draft', 'Draft', 'Locked', 'Locked', 'Locked'];
  const comments = ['Managed by Terraform', 'Managed by Terraform', 'In the ever-evolving landscape of digital services, our comm…', '-', '-'];
  const users = ['Jessica Gram', 'Alex Jefferson', 'Jessica Gram', 'Alex Jefferson', 'Jessica Gram'];
  return Array.from({ length: Math.min(total, 5) }, (_, i) => ({
    version: latest - i,
    status: statuses[i] || 'Locked',
    comment: comments[i] || '-',
    modified: `2025-06-${String(28 - i).padStart(2, '0')} ${String(Math.floor(r() * 12) + 1).padStart(2, '0')}:${String(Math.floor(r() * 59)).padStart(2, '0')}`,
    created: `2025-06-28 13:33`,
    user: users[i],
  }));
}

function genEvents(name: string, latestVer: number) {
  const r = seedRandom(name + 'events');
  const users = ['Jessica Gram', 'Alex Jefferson'];
  const types = ['created', 'activated', 'cloned'];
  return Array.from({ length: 10 }, (_, i) => ({
    date: `2019-11-11 08:12`,
    event: `Version ${Math.max(1, latestVer - Math.floor(i / 3))} ${types[i % 3]}`,
    eventVersion: Math.max(1, latestVer - Math.floor(i / 3)),
    user: users[Math.floor(r() * users.length)],
  }));
}

interface Props {
  serviceName: string;
  pageVisible?: boolean;
  onNavigate?: (id: string) => void;
}

export function ServiceSummaryPage({ serviceName, pageVisible = true, onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<'summary' | 'configuration'>('summary');
  const svcData = allServices.find((s) => s.name === serviceName);
  const m = genMetrics(serviceName);
  const versions = genVersions(serviceName, m.latestVersion, m.totalVersions);
  const events = genEvents(serviceName, m.latestVersion);
  const serviceId = svcData?.id || Array.from(serviceName).map((c) => c.charCodeAt(0).toString(16)).join('').slice(0, 20);
  const configs = svcData?.configs || [{ type: 'Draft' as const, version: '1' }];
  const isCompute = svcData?.serviceType === 'Compute';
  const parentPage = isCompute ? 'compute' : 'cdn';
  const parentLabel = isCompute ? 'Compute services' : 'CDN services';

  const metricsRow = [
    { label: 'Requests', value: m.requests.toLocaleString(), spark: m.sparklines[0] },
    { label: 'Bandwidth', value: `${m.bandwidth.toLocaleString()} GB`, spark: m.sparklines[1] },
    { label: 'Hit ratio', value: `${m.hitRatio}%`, spark: m.sparklines[2] },
    { label: 'Misses per second', value: m.missesPerSec.toLocaleString(), spark: m.sparklines[3] },
    { label: 'Error ratio', value: `${m.errorRatio}%`, spark: m.sparklines[4] },
  ];

  return (
    <>
      <main className={styles.main}>
        <div className={`${styles.page} ${pageVisible ? styles.pageAnimate : styles.pageHidden}`}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.breadcrumb}>
              <button className={styles.breadcrumbLink} onClick={() => onNavigate?.(parentPage)}>{parentLabel}</button>
              <span className={styles.breadcrumbSep}>/</span>
              <span className={styles.breadcrumbCurrent}>{serviceName}</span>
            </div>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{serviceName}</h1>
              <HeaderActions onNavigate={onNavigate} />
            </div>
            <div className={styles.serviceInfo}>
              <span className={styles.serviceId}>{serviceId}</span>
              {configs.map((cfg, i) => (
                <span key={i} className={styles.configGroup}>
                  <span className={styles.infoSep} />
                  <span className={`${styles.configPill} ${styles[`configPill${cfg.type}`]}`}>
                    {cfg.type === 'Locked' ? 'Inactive' : cfg.type === 'Draft' && !configs.some(c => c.type === 'Production') ? 'Inactive' : cfg.type}
                  </span>
                  {cfg.version && (
                    <button className={styles.configVersionLink}>Version {cfg.version}</button>
                  )}
                </span>
              ))}
            </div>
            <div className={styles.tabBar}>
              <button className={activeTab === 'summary' ? styles.tabActive : styles.tabInactive} onClick={() => setActiveTab('summary')}>Service summary</button>
              <button className={activeTab === 'configuration' ? styles.tabActive : styles.tabInactive} onClick={() => setActiveTab('configuration')}>Service configuration</button>
            </div>
          </div>

          {/* Version section */}
          {activeTab === 'summary' ? (
            <div className={styles.card}>
              <div className={styles.versionHeader}>
                <div className={styles.versionLeft}>
                  <span className={styles.versionTitle}>Version {m.latestVersion}</span>
                  <span className={styles.draftPill}>Latest draft</span>
                </div>
                <div className={styles.versionActions}>
                  <button className={styles.actionLink}>Diff version</button>
                  <button className={styles.editBtn}><Icon name="edit" size={20} style={{ color: 'white' }} /> Edit</button>
                </div>
              </div>
              <button className={styles.commentLink}><Icon name="edit" size={16} /> Add version comment</button>
              <button className={styles.detailsToggle}>Version details <Icon name="chevron-down" size={20} /></button>
            </div>
          ) : (
            <div className={styles.versionToolbar}>
              <div className={styles.versionToolbarTop}>
                <div className={styles.versionToolbarLeft}>
                  <span className={styles.versionToolbarTitle}>Version {m.latestVersion}</span>
                  <button className={styles.versionDropdownBtn}>
                    <Icon name="chevron-down" size={16} />
                  </button>
                  <span className={styles.configDraftPill}>
                    <Icon name="edit" size={16} />
                    Draft
                  </span>
                </div>
                <div className={styles.versionToolbarActions}>
                  <button className={styles.actionLink}><Icon name="chevron-left" size={20} /> Show VCL</button>
                  <button className={styles.actionLink}><Icon name="add" size={20} /> Diff versions</button>
                  <button className={styles.cloneBtn}><Icon name="copy" size={20} /> Clone</button>
                  <button className={styles.activateBtn}>Activate</button>
                </div>
              </div>
              <button className={styles.commentLink}><Icon name="edit-comment" size={20} /> Add version comment</button>
            </div>
          )}

          {activeTab === 'configuration' && (
            <ConfigurationContent serviceName={serviceName} />
          )}

          {activeTab === 'summary' && <>
          {/* Metrics row */}
          <div className={styles.metricsRow}>
            {metricsRow.map((metric, i) => (
              <div key={i} className={styles.metricCard}>
                <span className={styles.metricLabel}>{metric.label}</span>
                <span className={styles.metricValue}>{metric.value}</span>
                <div className={styles.metricSparkWrap}>
                  <MetricSparkline data={metric.spark} />
                  <div className={styles.metricSparkFade} />
                </div>
              </div>
            ))}
          </div>

          {/* All versions */}
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>All versions</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Version ↓</th>
                  <th>Status</th>
                  <th>Comment</th>
                  <th>Created on</th>
                  <th>Diff version</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {versions.map((v) => (
                  <tr key={v.version}>
                    <td><button className={styles.versionLink}>Version {v.version}</button></td>
                    <td><span className={`${styles.versionStatusPill} ${v.status === 'Locked' ? styles.pillLocked : styles.pillDraft}`}>{v.status}</span></td>
                    <td className={styles.commentCol}>{v.comment}</td>
                    <td>{v.created}</td>
                    <td><button className={styles.actionLink}>Diff version</button></td>
                    <td><Icon name="more" size={20} style={{ color: 'var(--text-secondary)' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={styles.tablePagination}>
              <span className={styles.paginationLabel}>Results per page: <button className={styles.paginationSelect}>5 <Icon name="chevron-down" size={20} /></button></span>
              <span className={styles.paginationInfo}>1–{versions.length} of {versions.length} results</span>
              <div className={styles.paginationArrows}>
                <button className={styles.paginationArrow}><Icon name="chevron-left" size={20} /></button>
                <button className={styles.paginationArrow}><Icon name="chevron-right" size={20} /></button>
              </div>
            </div>
          </div>

          {/* Feature banners */}
          <div className={styles.bannersRow}>
            <div className={styles.banner}>
              <div className={styles.bannerIcon}><Icon name="ddos-protection-illustration" size={32} /></div>
              <div className={styles.bannerContent}>
                <h3 className={styles.bannerTitle}>DDoS protection</h3>
                <p className={styles.bannerDesc}>Deploy rapidly and protect against application DDoS attacks.</p>
                <button className={styles.bannerLink} onClick={() => onNavigate?.('ddos-protection')}>Set up DDoS Protection</button>
              </div>
              <button className={styles.bannerClose}><Icon name="close" size={20} /></button>
            </div>
            <div className={styles.banner}>
              <div className={styles.bannerIcon}><Icon name="image-optimizer-illustration" size={32} /></div>
              <div className={styles.bannerContent}>
                <h3 className={styles.bannerTitle}>Image Optimizer</h3>
                <p className={styles.bannerDesc}>Optimize and transform images at the edge to improve load times and enhance user experience.</p>
                <button className={styles.bannerLink}>Set up Image Optimizer</button>
              </div>
              <button className={styles.bannerClose}><Icon name="close" size={20} /></button>
            </div>
          </div>

          {/* Service details */}
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Service details</h2>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Domains</span>
                <span className={styles.detailValueWrap}>example.com, demo-site.org, testdomain.net, mywebsite.co, sampleapp.io... <button className={styles.actionLinkSmall}>all domains</button></span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Hosts</span>
                <span className={styles.detailValue}>acmebucket.s3.us-east-2.amazonaws.com</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Image Optimizer status</span>
                <span className={styles.detailValue}><span className={styles.dotGreen} /> Enabled</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Default compression</span>
                <span className={styles.detailValue}>Enabled</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Override default host</span>
                <span className={styles.detailValue}>Enabled</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Next-Gen WAF status</span>
                <span className={styles.detailValue}><Icon name="next-gen-waf" size={20} /> Logging</span>
              </div>
            </div>
          </div>

          {/* Event log */}
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Event log</h2>
            <div className={styles.filterRow}>
              <button className={styles.filterBtn}><span className={styles.filterBtnText}>All time</span> <Icon name="calendar" size={20} /></button>
              <button className={styles.filterBtn}><span className={styles.filterBtnText}>Event type</span> <Icon name="chevron-down" size={20} /></button>
              <button className={styles.filterBtn}><span className={styles.filterBtnText}>User</span> <Icon name="chevron-down" size={20} /></button>
            </div>
            <table className={styles.eventTable}>
              <thead>
                <tr>
                  <th className={styles.eventThDate}>Date ↓</th>
                  <th>Event</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev, i) => {
                  const isCreated = ev.event.includes('created');
                  const initial = ev.user.charAt(0);
                  return (
                    <tr key={i}>
                      <td className={styles.eventDateCell}>{ev.date}</td>
                      <td>
                        <div className={styles.eventCellInner}>
                          <div className={styles.timelineDotCol}>
                            <div className={styles.timelineLine} />
                            <div className={`${styles.timelineDot} ${isCreated ? styles.timelineDotBlue : styles.timelineDotGreen}`} />
                          </div>
                          <span className={styles.eventText}>
                            <button className={styles.versionLink}>Version {ev.eventVersion}</button> {ev.event.split(/Version \d+/)[1]}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.userCellInner}>
                          <span className={styles.avatar}>{initial}</span>
                          <span>{ev.user}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className={styles.tablePagination}>
              <span className={styles.paginationLabel}>Results per page: <button className={styles.paginationSelect}>10 <Icon name="chevron-down" size={20} /></button></span>
              <span className={styles.paginationInfo}>1–10 results</span>
              <div className={styles.paginationArrows}>
                <button className={styles.paginationArrow}><Icon name="chevron-left" size={20} /></button>
                <button className={styles.paginationArrow}><Icon name="chevron-right" size={20} /></button>
              </div>
            </div>
          </div>
          </>}
        </div>
        <Footer />
      </main>
    </>
  );
}

/* ─── Configuration tab content ─── */
interface ConfigNavChild {
  id: string;
  label: string;
  badge: string;
}

interface ConfigNavItem {
  id: string;
  label: string;
  badge?: string;
  children?: ConfigNavChild[];
}

const configNavItems: ConfigNavItem[] = [
  { id: 'domains', label: 'Domains', badge: '2' },
  {
    id: 'origins', label: 'Origins', children: [
      { id: 'origins-hosts', label: 'Hosts', badge: '1' },
      { id: 'origins-health-checks', label: 'Health checks', badge: '0' },
    ],
  },
  {
    id: 'settings', label: 'Settings', children: [
      { id: 'settings-ip-block-list', label: 'IP block list', badge: 'Off' },
      { id: 'settings-override-host', label: 'Override host', badge: 'Off' },
      { id: 'settings-serve-stale', label: 'Serve stale', badge: '1' },
      { id: 'settings-force-tls', label: 'Force TLS and HSTS', badge: 'Off' },
      { id: 'settings-http3', label: 'HTTP/3', badge: 'Off' },
      { id: 'settings-websockets', label: 'WebSockets', badge: 'Off' },
      { id: 'settings-apex-redirects', label: 'Apex redirects', badge: '0' },
      { id: 'settings-request-settings', label: 'Request settings', badge: '0' },
      { id: 'settings-cache-settings', label: 'Cache settings', badge: '0' },
    ],
  },
  {
    id: 'content', label: 'Content', children: [
      { id: 'content-headers', label: 'Headers', badge: '0' },
      { id: 'content-compression', label: 'Compression', badge: '0' },
      { id: 'content-responses', label: 'Responses', badge: '0' },
    ],
  },
  { id: 'logging', label: 'Logging', badge: '0' },
  {
    id: 'vcl', label: 'VCL', children: [
      { id: 'vcl-snippets', label: 'VCL snippets', badge: '0' },
      { id: 'vcl-custom', label: 'Custom VCL', badge: '0' },
      { id: 'vcl-complete', label: 'Complete VCL', badge: '' },
    ],
  },
  { id: 'image-optimizer', label: 'Image Optimizer', badge: 'Off' },
  { id: 'conditions', label: 'Conditions', badge: '0' },
  { id: 'acl', label: 'Access control lists', badge: '0' },
  { id: 'dictionaries', label: 'Dictionaries', badge: '0' },
  {
    id: 'security', label: 'Security', children: [
      { id: 'security-ddos', label: 'DDoS Protection', badge: 'Off' },
      { id: 'security-api-discovery', label: 'API Discovery', badge: 'Off' },
      { id: 'security-bot-mgmt', label: 'Bot Management', badge: 'Off' },
      { id: 'security-ddos-mitigation', label: 'DDoS mitigation', badge: 'On' },
      { id: 'security-rate-limiting', label: 'Rate Limiting', badge: 'Off' },
    ],
  },
];

function ConfigurationContent({ serviceName: _serviceName }: { serviceName: string }) {
  const [activeSection, setActiveSection] = useState('domains');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const layoutRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleToggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNavClick = (item: ConfigNavItem) => {
    setActiveSection(item.id);
    if (item.children && !expandedItems[item.id]) {
      setExpandedItems((prev) => ({ ...prev, [item.id]: true }));
    }
    requestAnimationFrame(() => {
      layoutRef.current?.scrollIntoView({ block: 'start' });
    });
  };

  const handleChildClick = (parentId: string, childId: string) => {
    setActiveSection(parentId);
    requestAnimationFrame(() => {
      const el = contentRef.current?.querySelector(`[data-section="${childId}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className={styles.configLayout} ref={layoutRef}>
      <div className={styles.configSidebar}>
        <div className={styles.configSearch}>
          <Icon name="search" size={20} style={{ color: 'var(--text-secondary)' }} />
          <input type="text" placeholder="Search all settings" />
        </div>
        <nav className={styles.configNav}>
          {configNavItems.map((item) => {
            const isActive = activeSection === item.id;
            const isExpanded = !!expandedItems[item.id];
            const hasChildren = !!item.children;

            if (hasChildren) {
              return (
                <div
                  key={item.id}
                  className={`${styles.configNavExpandable} ${isExpanded ? styles.configNavExpandableOpen : ''} ${isActive ? styles.configNavExpandableSelected : ''}`}
                >
                  <div className={styles.configNavParent}>
                    <button
                      className={`${styles.configNavParentBtn} ${isActive ? styles.configNavParentActive : ''}`}
                      onClick={() => handleNavClick(item)}
                    >
                      <span className={styles.configNavLabel}>{item.label}</span>
                    </button>
                    <button
                      className={styles.configNavChevron}
                      onClick={(e) => handleToggleExpand(item.id, e)}
                    >
                      <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} />
                    </button>
                  </div>
                  {isExpanded && item.children && (
                    <div className={styles.configNavChildren}>
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          className={styles.configNavChild}
                          onClick={() => handleChildClick(item.id, child.id)}
                        >
                          <span className={styles.configNavChildLabel}>{child.label}</span>
                          <span className={styles.configNavChildBadge}>{child.badge}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                className={`${styles.configNavItem} ${isActive ? styles.configNavItemActive : ''}`}
                onClick={() => handleNavClick(item)}
              >
                <span className={styles.configNavLabel}>{item.label}</span>
                {item.badge != null && <span className={styles.configNavBadge}>{item.badge}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={styles.configContent} ref={contentRef}>
        <ConfigPage pageId={activeSection} />
      </div>
    </div>
  );
}

function ConfigPage({ pageId }: { pageId: string }) {
  switch (pageId) {
    case 'domains': return <DomainsPage />;
    case 'origins': return <OriginsPage />;
    case 'content': return <ContentPage />;
    case 'logging': return <LoggingPage />;
    case 'vcl': return <VclPage />;
    case 'conditions': return <ConditionsPage />;
    case 'dictionaries': return <DictionariesPage />;
    case 'acl': return <AclPage />;
    case 'security': return <SecurityPage />;
    default: {
      const item = configNavItems.find((i) => i.id === pageId);
      if (!item) return null;
      return (
        <div className={styles.configPageWrap}>
          <div className={styles.configPageHeader}>
            <h2 className={styles.configPageTitle}>{item.label}</h2>
          </div>
          {item.children ? (
            item.children.map((child) => (
              <div key={child.id} data-section={child.id} className={`${styles.card} ${styles.configCard}`}>
                <div className={styles.configContentHeader}>
                  <h3 className={styles.configSectionSubtitle}>{child.label}</h3>
                </div>
                <p className={styles.configEmptyText}>Placeholder content for {child.label}.</p>
              </div>
            ))
          ) : (
            <div className={`${styles.card} ${styles.configCard}`}>
              <p className={styles.configEmptyText}>Placeholder content for {item.label}.</p>
            </div>
          )}
        </div>
      );
    }
  }
}

/* ─── Domains page ─── */
function DomainsPage() {
  const [domainSearch, setDomainSearch] = useState('');
  const domains = [
    { domain: 'hgrsefafdsc.com', comment: '—' },
    { domain: 'hgtrbdfsfd.com', comment: '—' },
    { domain: 'tewfdsafdas.com', comment: '—' },
  ];
  const filtered = domainSearch
    ? domains.filter((d) => d.domain.toLowerCase().includes(domainSearch.toLowerCase()))
    : domains;

  return (
    <div className={styles.configPageWrap}>
      <div className={styles.configPageHeader}>
        <div className={styles.configPageHeaderTop}>
          <h2 className={styles.configPageTitle}>Domains</h2>
          <button className={styles.addDomainBtn}><Icon name="add" size={20} /> Add domain</button>
        </div>
        <p className={styles.configPageDesc}>Domains route requests to your service. Link them to your origin (content source) when setting up the service.</p>
        <div className={styles.configSearchInput}>
          <Icon name="search" size={20} style={{ color: 'var(--text-secondary)' }} />
          <input type="text" placeholder="Search domains" value={domainSearch} onChange={(e) => setDomainSearch(e.target.value)} />
        </div>
      </div>

      <div className={`${styles.card} ${styles.configCard}`}>
        <div className={styles.configContentHeader}>
          <div className={styles.configCardTitleRow}>
            <h3 className={styles.configCardTitle}>Classic domains</h3>
            <span className={styles.versionedPill}>Versioned</span>
            <Icon name="help" size={20} style={{ color: 'var(--text-secondary)' }} />
          </div>
        </div>
        <p className={styles.configCardDesc}>These domains are tied to specific versions and are not as flexible as the above Domain Management domains.</p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Domain</th>
              <th>Comment</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr key={i}>
                <td>{d.domain}</td>
                <td>{d.comment}</td>
                <td className={styles.domainRowActions}>
                  <span className={styles.domainWarningDot} />
                  <button className={styles.domainActionLink}>Migrate</button>
                  <button className={styles.domainActionBold}>Test</button>
                  <button className={styles.configRowAction}><Icon name="more" size={20} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Origins page ─── */
const hostsData = [
  { address: 'images.ctfassets.net', port: 443, name: 'dfeast01', tls: 'Yes', shielding: '-', chart: false, healthCheck: '/health', condition: '-', autoBalance: 'No' },
  { address: 'images.ctfassets.net', port: 443, name: 'dfeast01', tls: 'Yes', shielding: '-', chart: false, healthCheck: '/health', condition: 'If Always false', autoBalance: 'No' },
  { address: 'images.ctfassets.net', port: 443, name: 'dfeast01', tls: 'Yes', shielding: '-', chart: true, healthCheck: '/health', condition: 'If Always false', autoBalance: 'No' },
];

const healthChecksData = [
  { name: 'HEAD /robots.txt - acme.com', description: 'Default Health Check', expectedResponse: '200', checkFrequency: '15000', path: '/health' },
  { name: 'HEAD /robots.txt - acme.com', description: 'Default Health Check', expectedResponse: '200', checkFrequency: '15000', path: '/health' },
];

function OriginsPage() {
  return (
    <div className={styles.configPageWrap}>
      <div data-section="origins-hosts" className={`${styles.card} ${styles.configCard}`}>
        <div className={styles.configContentHeader}>
          <h3 className={styles.configCardTitle}>Hosts</h3>
        </div>
        <p className={styles.configCardDesc}>Hosts are used as backends for your site. In addition to the IP address and port, the information is used to uniquely identify a domain.</p>
        <div className={styles.configControlsRow}>
          <div className={styles.configSearchInput}>
            <Icon name="search" size={20} style={{ color: 'var(--text-secondary)' }} />
            <input type="text" placeholder="Search hosts" />
          </div>
          <div className={styles.configControlsDivider} />
          <button className={styles.expandAllLink}>Expand all hosts</button>
          <button className={styles.addDomainBtn}><Icon name="add" size={20} /> Add host</button>
        </div>
        <div className={styles.hostsList}>
          {hostsData.map((host, i) => (
            <div key={i} className={styles.hostRow}>
              <div className={styles.hostRowHeader}>
                <div className={styles.hostRowHeaderLeft}>
                  <button className={styles.hostNameLink}>{host.address} : {host.port}</button>
                  <span className={styles.hostSubtext}>{host.name}</span>
                </div>
                <div className={styles.hostRowActions}>
                  <button className={styles.hostConditionLink}>{host.condition === '-' ? 'Attach condition' : 'Detach condition'}</button>
                  <button className={styles.configRowAction}><Icon name="more" size={20} /></button>
                </div>
              </div>
              <div className={styles.hostDetailsGrid}>
                <div className={styles.hostDetailItem}>
                  <span className={styles.hostDetailLabel}>TLS from Fastly to your host</span>
                  <span className={styles.hostDetailValue}>{host.tls}</span>
                </div>
                <div className={styles.hostDetailItem}>
                  <span className={styles.hostDetailLabel}>Shielding</span>
                  <span className={styles.hostDetailValue}>{host.shielding}</span>
                </div>
                <div className={styles.hostDetailItem}>
                  <span className={styles.hostDetailLabel}>Last 2 hours of responses</span>
                  <span className={styles.hostDetailValue}>{host.chart ? '—' : 'No data'}</span>
                </div>
              </div>
              <div className={styles.hostDetailsGrid}>
                <div className={styles.hostDetailItem}>
                  <span className={styles.hostDetailLabel}>Health check</span>
                  <span className={styles.hostDetailValue}>{host.healthCheck}</span>
                </div>
                <div className={styles.hostDetailItem}>
                  <span className={styles.hostDetailLabel}>Condition</span>
                  {host.condition !== '-' ? (
                    <button className={styles.hostConditionValueLink}>{host.condition}</button>
                  ) : (
                    <span className={styles.hostDetailValue}>-</span>
                  )}
                </div>
                <div className={styles.hostDetailItem}>
                  <span className={styles.hostDetailLabel}>Auto load balance</span>
                  <span className={styles.hostDetailValue}>{host.autoBalance}</span>
                </div>
              </div>
              <button className={styles.moreDetailsBtn}>More details <Icon name="chevron-down" size={16} /></button>
            </div>
          ))}
        </div>
        <div className={styles.tablePagination}>
          <span className={styles.paginationLabel}>Results per page: <button className={styles.paginationSelect}>5 <Icon name="chevron-down" size={20} /></button></span>
          <span className={styles.paginationInfo}>30 results</span>
          <div className={styles.paginationArrows}>
            <button className={styles.paginationArrow}><Icon name="chevron-left" size={20} /></button>
            <button className={styles.paginationArrow}><Icon name="chevron-right" size={20} /></button>
          </div>
        </div>
      </div>

      <div data-section="origins-health-checks" className={`${styles.card} ${styles.configCard}`}>
        <div className={styles.configContentHeader}>
          <h3 className={styles.configCardTitle}>Health checks</h3>
        </div>
        <p className={styles.configCardDesc}>Health checks <button className={styles.inlineLink}>monitor the status of your hosts</button>—you can set Fastly to use a different origin, serve stale content, and more.</p>
        <div className={styles.configControlsRow}>
          <div className={styles.configSearchInput}>
            <Icon name="search" size={20} style={{ color: 'var(--text-secondary)' }} />
            <input type="text" placeholder="Search health checks" />
          </div>
          <div className={styles.configControlsDivider} />
          <button className={styles.addDomainBtn}><Icon name="add" size={20} /> Add health check</button>
        </div>
        <div className={styles.hostsList}>
          {healthChecksData.map((hc, i) => (
            <div key={i} className={styles.hostRow}>
              <div className={styles.hostRowHeader}>
                <div className={styles.hostRowHeaderLeft}>
                  <button className={styles.hostNameLink}>{hc.name}</button>
                  <span className={styles.hostSubtext}>{hc.description}</span>
                </div>
                <div className={styles.hostRowActions}>
                  <button className={styles.configRowAction}><Icon name="edit" size={20} /></button>
                  <button className={styles.configRowAction}><Icon name="trash" size={20} /></button>
                </div>
              </div>
              <div className={styles.hostDetailsGrid}>
                <div className={styles.hostDetailItem}>
                  <span className={styles.hostDetailLabel}>Expected response</span>
                  <span className={styles.hostDetailValue}>{hc.expectedResponse}</span>
                </div>
                <div className={styles.hostDetailItem}>
                  <span className={styles.hostDetailLabel}>Check frequency</span>
                  <span className={styles.hostDetailValue}>{hc.checkFrequency}</span>
                </div>
                <div className={styles.hostDetailItem}>
                  <span className={styles.hostDetailLabel}>Health check</span>
                  <span className={styles.hostDetailValue}>{hc.path}</span>
                </div>
              </div>
              <button className={styles.moreDetailsBtn}>Show custom headers <Icon name="chevron-down" size={16} /></button>
            </div>
          ))}
        </div>
        <div className={styles.tablePagination}>
          <span className={styles.paginationLabel}>Results per page: <button className={styles.paginationSelect}>5 <Icon name="chevron-down" size={20} /></button></span>
          <span className={styles.paginationInfo}>2 results</span>
          <div className={styles.paginationArrows}>
            <button className={styles.paginationArrow}><Icon name="chevron-left" size={20} /></button>
            <button className={styles.paginationArrow}><Icon name="chevron-right" size={20} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Security page ─── */
const securityPromos = [
  { id: 'ddos', title: 'DDoS Protection', desc: 'Automatic DDoS Protection that keeps any application and API available and performant.', cta: 'Purchase DDoS Protection' },
  { id: 'api-discovery', title: 'API Discovery', desc: 'Monitor network data streams to discover, aggregate, and inventory all API calls.', cta: 'Contact Fastly Sales' },
  { id: 'bot-mgmt', title: 'Bot Management', desc: 'Enables advanced bot capabilities, including Client Challenges and Client-Side Detection, for stronger protection in your Next-Gen WAF workspace.', cta: 'Contact Fastly Sales' },
];

function SecurityPage() {
  return (
    <div className={styles.configPageWrap}>
      <div className={styles.configPageHeader}>
        <h2 className={styles.configPageTitle}>Security</h2>
        <p className={styles.configPageDesc}>Configure and manage security settings from the <button className={styles.inlineLink}>Security page</button>.</p>
      </div>

      {securityPromos.map((promo) => (
        <div key={promo.id} data-section={`security-${promo.id}`} className={styles.securityPromoCard}>
          <h3 className={styles.securityPromoTitle}>{promo.title}</h3>
          <p className={styles.securityPromoDesc}>{promo.desc}</p>
          <div className={styles.securityPromoActions}>
            <button className={styles.securityPromoCta}>{promo.cta}</button>
            <button className={styles.securityPromoLearn}>Learn more</button>
          </div>
        </div>
      ))}

      <div data-section="security-ddos-mitigation" className={`${styles.card} ${styles.configCard}`}>
        <div className={styles.configCardTitleRow}>
          <h3 className={styles.configCardTitle}>Always-on DDoS mitigation</h3>
          <span className={styles.enabledPill}>Enabled</span>
        </div>
        <p className={styles.configCardDesc}>Fastly's high-bandwidth globally distributed network was built with <button className={styles.inlineLink}>Always-on DDoS mitigation</button>.</p>
      </div>

      <div data-section="security-rate-limiting" className={`${styles.card} ${styles.configCard}`}>
        <div className={styles.configContentHeader}>
          <h3 className={styles.configCardTitle}>Rate Limiting</h3>
        </div>
        <p className={styles.configCardDesc}>Set up a Rate Limiting policy to control the rate of requests sent or received to prevent attacks. <button className={styles.inlineLink}>Learn more about Rate Limiting</button>.</p>
        <p className={styles.configCardDesc}><button className={styles.inlineLink}>Rate Limiting</button> has not been enabled on this account. To enable Rate Limiting, contact <button className={styles.inlineLink}>Fastly Sales</button>.</p>
      </div>
    </div>
  );
}

/* ─── Content page ─── */
function ContentPage() {
  return (
    <div className={styles.configPageWrap}>
      {/* Headers */}
      <div data-section="content-headers" className={styles.configPageWrap}>
        <h2 className={styles.configPageTitle}>Headers</h2>
        <div className={`${styles.card} ${styles.configCard}`}>
          <button className={styles.addDomainBtn}><Icon name="add" size={20} /> Create a header</button>
        </div>
        <div className={`${styles.card} ${styles.configCard}`}>
          <div className={styles.headerItemRow}>
            <div className={styles.headerItemLeft}>
              <span className={styles.headerItemName}>Enable HSTS</span>
              <span className={styles.headerItemGenerated}>Generated by <button className={styles.inlineLink}>force TLS and enable HSTS</button></span>
            </div>
          </div>
          <span className={styles.headerItemType}>Response / Set</span>
          <button className={styles.moreDetailsBtn}>Show all details <Icon name="chevron-down" size={16} /></button>
        </div>
      </div>

      {/* Compression */}
      <div data-section="content-compression" className={styles.configPageWrap}>
        <h2 className={styles.configPageTitle}>Compression</h2>
        <p className={styles.configPageDesc}>Compress content to transfer data faster. Our guide to <button className={styles.inlineLink}>compression</button>.</p>

        <div className={styles.configPageWrap}>
          <div className={styles.configCardTitleRow}>
            <h3 className={styles.configSectionSubtitle}>Select compression format</h3>
            <span className={styles.versionedPill}>Immediate update</span>
            <Icon name="help" size={20} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <p className={styles.configCardDesc}>Select the format for compression on this service.</p>
          <div className={`${styles.card} ${styles.configCard}`}>
            <label className={styles.radioRow}>
              <input type="radio" name="compression" className={styles.radioInput} />
              <div className={styles.radioContent}>
                <span className={styles.radioLabel}>Use Brotli compression when available</span>
                <span className={styles.radioDesc}>Include support for Brotli compression on this service. We will default to Brotli compression whenever browser support for it is available. When it isn't, we will use gzip compression.</span>
              </div>
            </label>
            <label className={styles.radioRow}>
              <input type="radio" name="compression" className={styles.radioInput} defaultChecked />
              <div className={styles.radioContent}>
                <span className={styles.radioLabel}>Use gzip only compression</span>
                <span className={styles.radioDesc}>Include support for gzip compression on this service. Do not use Brotli compression.</span>
              </div>
            </label>
          </div>
        </div>

        <div className={styles.configPageWrap}>
          <h3 className={styles.configSectionSubtitle}>Set up compression policy</h3>
          <div className={styles.toggleCard}>
            <div className={styles.toggleRow}>
              <span className={styles.togglePill}>ON</span>
              <div className={styles.toggleContent}>
                <span className={styles.toggleTitle}>Use default compression policy</span>
                <span className={styles.configCardDesc}>Get started with compression using Fastly's recommended file extensions and content types for gzip and Brotli formats.</span>
                <button className={styles.inlineLink}>Show the defaults</button>
              </div>
            </div>
          </div>
          <p className={styles.configCardDesc}>With advanced compression you can customize the exact file extensions and content types to compress under specific conditions.</p>
          <div className={`${styles.card} ${styles.configCard}`}>
            <button className={styles.addDomainBtn}><Icon name="add" size={20} /> Set up advanced compression</button>
          </div>
        </div>
      </div>

      {/* Responses */}
      <div data-section="content-responses" className={styles.configPageWrap}>
        <h2 className={styles.configPageTitle}>Responses</h2>
        <div className={styles.toggleCard}>
          <h3 className={styles.configCardTitle}>Synthetic responses</h3>
          <p className={styles.configCardDesc}>Let Fastly serve your static HTML or TXT files. Our guide to <button className={styles.inlineLink}>synthetic responses</button>.</p>
          {[
            { name: '404 page', type: 'HTML response', preview: '<!DOCTYPE html>…' },
            { name: '503 page', type: 'HTML response', preview: '<!DOCTYPE html>…' },
            { name: 'robots.txt', type: 'TXT response', preview: 'User-Agent: *…' },
          ].map((resp, i) => (
            <div key={i} className={styles.syntheticResponseRow}>
              <div className={styles.syntheticResponseHeader}>
                <span className={styles.togglePillOff}>OFF</span>
                <span className={styles.syntheticResponseName}>{resp.name}</span>
              </div>
              <p className={styles.configCardDesc}>You can style this response to look like your application.</p>
              <div className={styles.codePreview}>
                <span className={styles.codePreviewLabel}>{resp.type}</span>
                <span className={styles.codePreviewContent}>{resp.preview}</span>
              </div>
            </div>
          ))}
        </div>
        <p className={styles.configCardDesc}>With advanced responses you can customize the response body, status code, and MIME type of your response.</p>
        <div className={`${styles.card} ${styles.configCard}`}>
          <button className={styles.addDomainBtn}><Icon name="add" size={20} /> Set up advanced response</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Logging page ─── */
const loggingEndpoints = [
  'Amazon Kinesis Data Streams', 'Amazon S3', 'Apache Kafka', 'Datadog', 'Elasticsearch',
  'FTP', 'Google BigQuery', 'Google Cloud Storage', 'Grafana Cloud Logs', 'HTTPS',
  'Google Cloud Pub/Sub', 'Heroku Logplex', 'Honeycomb', 'LogDNA (via Syslog)', 'Loggly',
  'Logshuttle', 'Microsoft Azure Blob Storage', 'New Relic Logs', 'New Relic OTLP',
  'Openstack', 'Papertrail', 'Rackspace Cloud Files', 'Scalyr', 'SFTP',
  'Spaces by DigitalOcean', 'Splunk', 'Sumologic', 'Syslog',
];

function LoggingPage() {
  return (
    <div className={styles.configPageWrap}>
      <div className={styles.configPageHeader}>
        <h2 className={styles.configPageTitle}>Choose your logging endpoint</h2>
        <p className={styles.configPageDesc}>For more information, read our <button className={styles.inlineLink}>logging documentation</button>.</p>
      </div>
      <div className={styles.endpointList}>
        {loggingEndpoints.map((ep) => (
          <div key={ep} className={styles.endpointRow}>
            <span className={styles.endpointName}>{ep}</span>
            <div className={styles.endpointActions}>
              <button className={styles.inlineLink}>Documentation</button>
              <button className={styles.addDomainBtn}><Icon name="add" size={20} /> Create endpoint</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── VCL page ─── */
function VclPage() {
  const [activeTab, setActiveTab] = useState<'snippets' | 'custom' | 'complete'>('snippets');

  const vclCode = `# Noticing changes to your VCL? The event log
# (https://docs.fastly.com/en/guides/reviewing-service-activity-with-the-event-log)
# in the web interface shows changes to your service's configurations and the
# change log on developer.fastly.com (https://developer.fastly.com/reference/changes/vcl/)
# provides info on changes to the Fastly-provided VCL itself.
pragma optional_param geoip_opt_in true;
pragma optional_param max_object_size 52428800;
pragma optional_param smiss_max_object_size 52428800;
pragma optional_param fetchless_purge_all 1;
pragma optional_param chash_randomize_on_pass true;
pragma optional_param default_ssl_check_cert 1;
pragma optional_param max_backends 20;
pragma optional_param customer_id "6MIv9yBm7CPkS96GbCByMB";
C!
W!
# Backends
backend F_Host_1 {
    .between_bytes_timeout = 10s;
    .connect_timeout = 1s;
    .first_byte_timeout = 15s;
    .host = "192.178.12.12";
    .max_connections = 200;
    .port = "80";
    .share_key = "ngrfSqoDLkLxShlCB25wP5";
}`;

  return (
    <div className={styles.configPageWrap}>
      <div className={styles.configPageHeader}>
        <h2 className={styles.configPageTitle}>VCL</h2>
        <div className={styles.vclSubheader}>
          <span className={styles.configCardDesc}>313 lines</span>
          <span className={styles.vclSep} />
          <span className={styles.vclErrorDot} />
          <span className={styles.configCardDesc}>1 error</span>
          <span className={styles.vclSep} />
          <span className={styles.vclWarningDot} />
          <span className={styles.configCardDesc}>1 warning</span>
        </div>
      </div>
      <div className={`${styles.card} ${styles.configCard}`} style={{ padding: 0 }}>
        <div className={styles.vclTabBar}>
          <div className={styles.vclTabs}>
            {(['snippets', 'custom', 'complete'] as const).map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? styles.vclTabActive : styles.vclTabInactive}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'snippets' ? 'VCL snippets' : tab === 'custom' ? 'Custom VCL' : 'Complete VCL'}
              </button>
            ))}
          </div>
          <button className={styles.expandAllLink}>
            <Icon name="export" size={20} /> Fullscreen
          </button>
        </div>
        <div data-section={`vcl-${activeTab}`} className={styles.vclContent}>
          {activeTab === 'complete' ? (
            <pre className={styles.vclCodeBlock}><code>{vclCode}</code></pre>
          ) : (
            <div className={styles.vclEmptyState}>
              <Icon name="dev-tools" size={80} />
              <h3 className={styles.vclEmptyTitle}>
                {activeTab === 'snippets' ? 'No VCL snippets added' : 'No Custom VCL added'}
              </h3>
              <p className={styles.configCardDesc} style={{ textAlign: 'center' }}>
                {activeTab === 'snippets'
                  ? 'VCL snippets are blocks of VCL logic that are inserted into your configuration. Go to our documentation to learn more.'
                  : 'Create your own Varnish Configuration Language (VCL) files with specialized configurations.'}
              </p>
              <div className={styles.vclEmptyActions}>
                <button className={styles.addDomainBtn}>
                  <Icon name="add" size={20} /> {activeTab === 'snippets' ? 'Add a VCL snippet' : 'Upload custom VCL'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Conditions page ─── */
function ConditionsPage() {
  return (
    <div className={styles.configPageWrap}>
      <div className={styles.configPageHeader}>
        <h2 className={styles.configPageTitle}>Manage conditions</h2>
        <p className={styles.configPageDesc}>An overview of how conditions are used and mapped in your service. Learn more about <button className={styles.inlineLink}>how to apply conditions and troubleshooting tips</button>.</p>
        <div className={styles.configPageHeaderTop}>
          <button className={styles.addDomainBtn}><Icon name="add" size={20} /> Create Condition</button>
          <div style={{ flex: 1 }} />
          <div className={styles.configSearchInput}>
            <Icon name="search" size={20} style={{ color: 'var(--text-secondary)' }} />
            <input type="text" placeholder="Search conditions..." />
          </div>
        </div>
      </div>
      <div className={styles.conditionSection}>
        <h3 className={styles.configSectionSubtitle}>1 Request condition</h3>
        <div className={`${styles.card} ${styles.configCard}`}>
          <div className={styles.conditionHeader}>
            <div className={styles.conditionHeaderLeft}>
              <span className={styles.conditionIf}>IF</span>
              <button className={styles.inlineLink}>test</button>
              <button className={styles.configRowAction}><Icon name="edit" size={20} /></button>
            </div>
            <button className={styles.configRowAction}><Icon name="trash" size={20} /></button>
          </div>
          <span className={styles.hostSubtext}>test</span>
          <div className={styles.conditionDetailsRow}>
            <span className={styles.hostDetailLabel}>Priority</span>
            <span className={styles.hostDetailValue}>10</span>
            <span className={styles.hostDetailLabel}>Type</span>
            <span className={styles.hostDetailValue}>Request</span>
          </div>
          <div className={styles.conditionThen}>
            <span className={styles.conditionThenLabel}>THEN</span>
            <span className={styles.configEmptyText} style={{ fontStyle: 'italic' }}>Not applied to anything</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Dictionaries page ─── */
function DictionariesPage() {
  return (
    <div className={styles.configPageWrap}>
      <div className={styles.configPageHeader}>
        <h2 className={styles.configPageTitle}>Dictionaries</h2>
        <p className={styles.configPageDesc}>A list of key-value pairs that can be referenced and used by your custom edge logic (such as VCL snippets or custom VCL). Our guide to <button className={styles.inlineLink}>working with dictionaries</button>.</p>
      </div>
      <div className={`${styles.card} ${styles.configCard}`}>
        <p className={styles.configEmptyText} style={{ fontStyle: 'italic' }}>There are no dictionaries.</p>
        <button className={styles.addDomainBtn}><Icon name="add" size={20} /> Create your first dictionary</button>
      </div>
    </div>
  );
}

/* ─── Access control lists page ─── */
function AclPage() {
  return (
    <div className={styles.configPageWrap}>
      <div className={styles.configPageHeader}>
        <h2 className={styles.configPageTitle}>Access control lists</h2>
        <p className={styles.configPageDesc}>Filter traffic by specifying which IP addresses should be allowed or blocked. You must use a condition to reference a list and specify a response.</p>
      </div>
      <div className={`${styles.card} ${styles.configCard}`}>
        <p className={styles.configEmptyText} style={{ fontStyle: 'italic' }}>There are no ACLs.</p>
        <button className={styles.addDomainBtn}><Icon name="add" size={20} /> Create your first ACL</button>
      </div>
    </div>
  );
}

/* ─── Sparkline with gradient fill ─── */
/* ─── Header actions with dropdowns ─── */
function HeaderActions({ onNavigate }: { onNavigate?: (id: string) => void }) {
  const optionsDD = useDropdown();
  const purgeDD = useDropdown();

  return (
    <div className={styles.headerActions}>
      <div className={styles.ddWrapper} ref={optionsDD.ref}>
        <button className={styles.actionLink} onClick={() => { optionsDD.setOpen(!optionsDD.open); purgeDD.setOpen(false); }}>
          Options <Icon name="chevron-down" size={20} />
        </button>
        {optionsDD.open && (
          <div className={styles.headerDropdown}>
            <button className={styles.ddItem} onClick={() => optionsDD.setOpen(false)}>
              <Icon name="edit" size={20} /><span>Edit service name</span>
            </button>
            <button className={styles.ddItem} onClick={() => optionsDD.setOpen(false)}>
              <Icon name="edit-comment" size={20} /><span>Add comment</span>
            </button>
            <button className={styles.ddItem} onClick={() => optionsDD.setOpen(false)}>
              <Icon name="copy" size={20} /><span>Copy to a service</span>
            </button>
            <button className={styles.ddItemDisabled}>
              <Icon name="deactivate" size={20} /><span>Deactivate</span>
            </button>
            <button className={styles.ddItem} onClick={() => optionsDD.setOpen(false)}>
              <Icon name="trash" size={20} /><span>Delete service</span>
            </button>
          </div>
        )}
      </div>
      <div className={styles.ddWrapper} ref={purgeDD.ref}>
        <button className={styles.actionLink} onClick={() => { purgeDD.setOpen(!purgeDD.open); optionsDD.setOpen(false); }}>
          Purge <Icon name="chevron-down" size={20} />
        </button>
        {purgeDD.open && (
          <div className={styles.headerDropdown}>
            <button className={styles.ddItem} onClick={() => purgeDD.setOpen(false)}>
              <span>Purge URL</span>
            </button>
            <button className={styles.ddItem} onClick={() => purgeDD.setOpen(false)}>
              <span>Purge key</span>
            </button>
            <button className={styles.ddItem} onClick={() => purgeDD.setOpen(false)}>
              <span>Purge all</span>
            </button>
          </div>
        )}
      </div>
      <button className={styles.actionLink}>Check cache</button>
      <button className={styles.obsBtn} onClick={() => onNavigate?.('observability')}>Observability</button>
    </div>
  );
}

function MetricSparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 85;
  const h = 24;
  const uid = `svc-spark-${data[0]}-${data[data.length - 1]}`;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: 3 + h - ((v - min) / range) * h,
  }));
  const linePoints = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPoints = `0,30 ${linePoints} ${w},30`;
  return (
    <svg viewBox={`0 0 ${w} 30`} preserveAspectRatio="none" className={styles.metricSparkSvg}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5DAFCF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5DAFCF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${uid})`} />
      <polyline points={linePoints} fill="none" stroke="#5DAFCF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
