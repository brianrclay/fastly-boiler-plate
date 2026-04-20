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
              <div className={styles.titleWrap}>
                <h1 className={styles.title}>{serviceName}</h1>
                <ServiceSwitcher
                  currentServiceName={serviceName}
                  serviceType={isCompute ? 'Compute' : 'CDN'}
                  onSelect={(name) => onNavigate?.(`service:${name}`)}
                />
              </div>
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
            <VersionToolbar latestVersion={m.latestVersion} totalVersions={m.totalVersions} />
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
              <div className={styles.paginationSpacer} />
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
              <div className={styles.paginationSpacer} />
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

/* ─── Service switcher popover ─── */
function ServiceSwitcher({ currentServiceName, serviceType, onSelect }: { currentServiceName: string; serviceType: 'CDN' | 'Compute'; onSelect: (name: string) => void }) {
  const dd = useDropdown();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites' | 'activated'>('recent');

  const sameTypeServices = allServices.filter((s) => s.serviceType === serviceType);
  const filtered = search
    ? sameTypeServices.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()))
    : sameTypeServices;

  return (
    <div className={styles.ddWrapper} ref={dd.ref}>
      <button className={styles.versionDropdownBtn} onClick={() => dd.setOpen(!dd.open)}>
        <Icon name="chevron-down" size={16} />
      </button>
      {dd.open && (
        <div className={styles.serviceSwitcher}>
          <div className={styles.serviceSwitcherArrow} />
          <div className={styles.serviceSwitcherSearch}>
            <div className={styles.serviceSwitcherSearchInput}>
              <Icon name="search" size={20} style={{ color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search by ID, name, or domain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              {search && (
                <button className={styles.serviceSwitcherClear} onClick={() => setSearch('')}>Clear</button>
              )}
            </div>
          </div>
          <div className={styles.serviceSwitcherTabs}>
            {(['recent', 'favorites', 'activated'] as const).map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? styles.serviceSwitcherTabActive : styles.serviceSwitcherTab}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'recent' ? 'Recently visited' : tab === 'favorites' ? 'Favorites' : 'Last activated'}
              </button>
            ))}
          </div>
          <div className={styles.serviceSwitcherList}>
            {filtered.map((svc) => (
              <button
                key={svc.id}
                className={`${styles.serviceSwitcherRow} ${svc.name === currentServiceName ? styles.serviceSwitcherRowActive : ''}`}
                onClick={() => { onSelect(svc.name); dd.setOpen(false); }}
              >
                <div className={styles.serviceSwitcherRowContent}>
                  <Icon name={svc.serviceType === 'Compute' ? 'compute' : 'cdn'} size={20} />
                  <div className={styles.serviceSwitcherRowText}>
                    <span className={styles.serviceSwitcherRowName}>{svc.name}</span>
                    <div className={styles.serviceSwitcherRowMeta}>
                      <span className={styles.serviceSwitcherRowId}>{svc.id}</span>
                      <span className={styles.serviceSwitcherRowSep} />
                      <span className={styles.serviceSwitcherRowType}>{svc.serviceType}</span>
                    </div>
                  </div>
                </div>
                {svc.configs[0] && (
                  <span className={`${styles.versionSwitcherPill} ${svc.configs[0].type === 'Production' ? styles.configPillProduction : svc.configs[0].type === 'Draft' ? styles.pillDraft : svc.configs[0].type === 'Staging' ? styles.configPillStaging : styles.pillLocked}`}>
                    {svc.configs[0].version ? `v${svc.configs[0].version}` : svc.configs[0].type}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className={styles.serviceSwitcherFooter}>
            <span className={styles.serviceSwitcherFooterLabel}>Quick links</span>
            <button className={styles.serviceSwitcherFooterLink}>Create a new service</button>
            <button className={styles.serviceSwitcherFooterLink}>{serviceType} docs</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Version toolbar with sticky behavior and switcher ─── */
function VersionToolbar({ latestVersion, totalVersions }: { latestVersion: number; totalVersions: number }) {
  const [isSticky, setIsSticky] = useState(false);

  const toolbarRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const switcherDD = useDropdown();

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const versionData = Array.from({ length: Math.min(totalVersions, 5) }, (_, i) => {
    const ver = latestVersion - i;
    const status = i === 0 ? 'Draft' : i === 1 ? 'Production' : i === 2 ? 'Staging' : 'Locked';
    const edited = i === 0 ? 'Today' : `${i * 5 + 1}d ago`;
    return { version: ver, status, edited, comment: i > 0 ? 'Lorem ipsum dolor sit amet consectetur...' : 'No version comment' };
  });

  return (
    <>
      <div ref={sentinelRef} />
      <div ref={toolbarRef} className={`${styles.versionToolbar} ${isSticky ? styles.versionToolbarSticky : ''}`}>
        <div className={styles.versionToolbarTop}>
          <div className={styles.versionToolbarLeft}>
            <span className={isSticky ? styles.versionToolbarTitleSmall : styles.versionToolbarTitle}>Version {latestVersion}</span>
            <div className={styles.ddWrapper} ref={switcherDD.ref}>
              <button className={styles.versionDropdownBtn} onClick={() => switcherDD.setOpen(!switcherDD.open)}>
                <Icon name="chevron-down" size={16} />
              </button>
              {switcherDD.open && (
                <div className={styles.versionSwitcher}>
                  <div className={styles.versionSwitcherArrow} />
                  {versionData.map((v, i) => (
                    <div key={v.version} className={`${styles.versionSwitcherItem} ${i === 0 ? styles.versionSwitcherItemSelected : ''}`} onClick={() => switcherDD.setOpen(false)}>
                      <div className={styles.versionSwitcherRow}>
                        <div className={styles.versionSwitcherLeft}>
                          <span className={`${styles.versionSwitcherVersion} ${i === 0 ? styles.versionSwitcherVersionActive : ''}`}>Version {v.version}</span>
                          <span className={`${styles.versionSwitcherPill} ${v.status === 'Draft' ? styles.pillDraft : v.status === 'Production' ? styles.configPillProduction : v.status === 'Staging' ? styles.configPillStaging : styles.pillLocked}`}>{v.status}</span>
                        </div>
                        <span className={styles.versionSwitcherEdited}>Edited: {v.edited}</span>
                      </div>
                      <div className={styles.versionSwitcherComment}>
                        <Icon name="edit-comment" size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                        <span>{v.comment}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className={styles.configDraftPill}>
              <Icon name="edit" size={16} />
              Draft
            </span>
          </div>
          <div className={styles.versionToolbarActions}>
            <button className={styles.actionLink}><Icon name="show-vcl" size={isSticky ? 16 : 20} /> Show VCL</button>
            <button className={styles.actionLink}><Icon name="diff" size={isSticky ? 16 : 20} /> Diff versions</button>
            <button className={styles.cloneBtn}><Icon name="copy" size={isSticky ? 16 : 20} /> Clone</button>
            <button className={styles.activateBtn}>Activate</button>
          </div>
        </div>
        {!isSticky && (
          <button className={styles.commentLink}><Icon name="edit-comment" size={20} /> Add version comment</button>
        )}
      </div>
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
  const [navSearch, setNavSearch] = useState('');
  const layoutRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const filteredNavItems = navSearch
    ? configNavItems.filter((item) => {
        const q = navSearch.toLowerCase();
        if (item.label.toLowerCase().includes(q)) return true;
        if (item.children?.some((c) => c.label.toLowerCase().includes(q))) return true;
        return false;
      }).map((item) => {
        if (!item.children) return item;
        const q = navSearch.toLowerCase();
        if (item.label.toLowerCase().includes(q)) return item;
        return { ...item, children: item.children.filter((c) => c.label.toLowerCase().includes(q)) };
      })
    : configNavItems;

  const handleToggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToElement = (el: Element) => {
    const scrollContainer = el.closest(`.${styles.main}`);
    if (!scrollContainer) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    const stickyHeight = 60;
    const elTop = el.getBoundingClientRect().top - scrollContainer.getBoundingClientRect().top + scrollContainer.scrollTop;
    scrollContainer.scrollTo({ top: elTop - stickyHeight, behavior: 'smooth' });
  };

  const handleNavClick = (item: ConfigNavItem) => {
    setActiveSection(item.id);
    if (item.children && !expandedItems[item.id]) {
      setExpandedItems((prev) => ({ ...prev, [item.id]: true }));
    }
    requestAnimationFrame(() => {
      if (contentRef.current) scrollToElement(contentRef.current);
    });
  };

  const handleChildClick = (parentId: string, childId: string) => {
    setActiveSection(parentId);
    requestAnimationFrame(() => {
      const el = contentRef.current?.querySelector(`[data-section="${childId}"]`);
      if (el) scrollToElement(el);
    });
  };

  return (
    <div className={styles.configLayout} ref={layoutRef}>
      <div className={styles.configSidebar}>
        <div className={styles.configSearch}>
          <Icon name="search" size={20} style={{ color: 'var(--text-secondary)' }} />
          <input type="text" placeholder="Search all settings" value={navSearch} onChange={(e) => setNavSearch(e.target.value)} />
        </div>
        <nav className={styles.configNav}>
          {filteredNavItems.map((item) => {
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
    case 'settings': return <SettingsPage />;
    case 'content': return <ContentPage />;
    case 'logging': return <LoggingPage />;
    case 'vcl': return <VclPage />;
    case 'image-optimizer': return <ImageOptimizerPage />;
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
          <h2 className={styles.configPageTitleH2}>Domains</h2>
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
          <div className={styles.paginationSpacer} />
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
          <div className={styles.paginationSpacer} />
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

/* ─── Settings page ─── */
function SettingsPage() {
  return (
    <div className={styles.configPageWrap}>
      {/* IP block list */}
      <div data-section="settings-ip-block-list" className={`${styles.card} ${styles.configCard}`}>
        <div className={styles.settingsToggleRow}>
          <div className={styles.settingsToggle} />
          <div className={styles.settingsToggleInfo}>
            <h4 className={styles.settingsToggleTitle}>IP block list</h4>
            <p className={styles.settingsToggleDesc}>Restrict access by blocking known bad IPs. Our guide to <button className={styles.inlineLink}>IP block lists</button>.</p>
          </div>
        </div>
        <table className={styles.table}>
          <thead><tr><th>Address</th><th>Comment</th><th>Date added</th></tr></thead>
          <tbody><tr><td>—</td><td>—</td><td>—</td></tr></tbody>
        </table>
        <p className={styles.settingsAdvancedNote}>No addresses</p>
        <p className={styles.settingsAdvancedNote}>Advanced: Other types of access control lists are supported in <button className={styles.inlineLink}>ACLs</button>.</p>
      </div>

      {/* Override host */}
      <div data-section="settings-override-host" className={`${styles.card} ${styles.configCard}`}>
        <div className={styles.settingsToggleRow}>
          <div className={styles.settingsToggle} />
          <div className={styles.settingsToggleInfo}>
            <h4 className={styles.settingsToggleTitle}>Override host</h4>
            <p className={styles.settingsToggleDesc}>Override the host header from any host sending requests to your origin. To override a specific host, edit your origins instead. Our guide to <button className={styles.inlineLink}>override host</button>.</p>
          </div>
        </div>
        <div className={styles.settingsDetailRow}>
          <span className={styles.settingsDetailLabel}>Override host header:</span>
          <span className={styles.settingsDetailValue}>None</span>
        </div>
      </div>

      {/* Serve stale */}
      <div data-section="settings-serve-stale" className={`${styles.card} ${styles.configCard}`}>
        <div className={styles.settingsToggleRow}>
          <div className={styles.settingsToggle} />
          <div className={styles.settingsToggleInfo}>
            <h4 className={styles.settingsToggleTitle}>Serve stale content on origin failure</h4>
            <p className={styles.settingsToggleDesc}>When Fastly can't connect to the origin, continue to serve the current "stale" content to satisfy requests instead of showing end-users an error. Our guide to <button className={styles.inlineLink}>serving stale content</button>.</p>
          </div>
        </div>
      </div>

      {/* Force TLS and HSTS */}
      <div data-section="settings-force-tls" className={`${styles.card} ${styles.configCard} ${styles.settingsCardActiveGreen}`}>
        <div className={styles.settingsToggleRow}>
          <div className={styles.settingsToggleOn} />
          <div className={styles.settingsToggleInfo}>
            <h4 className={styles.settingsToggleTitle}>Force TLS and enable HSTS</h4>
            <p className={styles.settingsToggleDesc}>Force TLS and HTTP Strict Transport Security (HSTS) to ensure that every request is secure. This setting depends on TLS being enabled on your domains. We recommend switching to production (1 year) after testing with a short duration. Our guide to <button className={styles.inlineLink}>TLS and HSTS</button>.</p>
          </div>
        </div>
        <div className={styles.settingsHstsDuration}>
          <span className={styles.settingsHstsDurationLabel}>Define HSTS duration <span className={styles.settingsWarningDot} /> :</span>
          <div className={styles.settingsRadioGroup}>
            <label className={`${styles.settingsRadioItem} ${styles.settingsRadioItemSelected}`}>
              <input type="radio" name="hsts" defaultChecked /> Testing - 5 minutes <span className={styles.settingsDetailValueMono}>[max-age=300]</span>
            </label>
            <label className={styles.settingsRadioItem}>
              <input type="radio" name="hsts" /> Production - 1 year <span className={styles.settingsDetailValueMono}>[max-age=31557600]</span>
            </label>
          </div>
        </div>
        <p className={styles.settingsAdvancedNote}>Advanced: For more fine grained control, <button className={styles.inlineLink}>set up HSTS with a custom header</button>.</p>
      </div>

      {/* HTTP/3 */}
      <div data-section="settings-http3" className={`${styles.card} ${styles.configCard}`}>
        <div className={styles.settingsToggleRow}>
          <div className={styles.settingsToggle} />
          <div className={styles.settingsToggleInfo}>
            <h4 className={styles.settingsToggleTitle}>HTTP/3</h4>
            <p className={styles.settingsToggleDesc}>Advertise QUIC support, allowing clients to switch to HTTP/3 for future requests. Requires you to enable TLS on domains in this service. Our <button className={styles.inlineLink}>guide to QUIC and HTTPS</button>.</p>
          </div>
        </div>
      </div>

      {/* WebSockets */}
      <div data-section="settings-websockets" className={styles.settingsPromoCard}>
        <h3 className={styles.settingsCardTitle}>WebSockets</h3>
        <p className={styles.settingsCardDesc}>Enable WebSockets to interact with clients in real-time, and reduce latency inherent in unidirectional communication. Our guide to <button className={styles.inlineLink}>WebSockets</button>.</p>
        <div className={styles.settingsPromoActions}>
          <button className={styles.editBtn}>Purchase WebSockets</button>
          <button className={styles.addDomainBtn}>Learn more</button>
        </div>
      </div>

      {/* Fallback TTL */}
      <div data-section="settings-apex-redirects" className={`${styles.card} ${styles.configCard} ${styles.settingsCardActiveGreen}`}>
        <div className={styles.settingsCardHeader}>
          <h3 className={styles.settingsCardTitle}>Fallback TTL</h3>
          <p className={styles.settingsCardDesc}>Edit the fallback TTL (3600 sec by default) to customize the catch-all TTL used for objects that don't have a specific TTL set. Our guide to <button className={styles.inlineLink}>fallback TTL</button>.</p>
        </div>
        <div className={styles.settingsDetailRow}>
          <span className={styles.settingsDetailLabel}>Fallback TTL (sec):</span>
          <span style={{ color: 'var(--text-action)', fontWeight: 600, fontSize: 14 }}>3600</span>
          <Icon name="edit" size={16} style={{ color: 'var(--text-action)' }} />
        </div>
      </div>

      {/* Redirect traffic to www subdomains */}
      <div className={`${styles.card} ${styles.configCard} ${styles.settingsCardActiveGreen}`}>
        <div className={styles.settingsCardHeader}>
          <h3 className={styles.settingsCardTitle}>Redirect traffic to www subdomains</h3>
          <p className={styles.settingsCardDesc}>Redirect traffic for apex domains, subdomains, or wildcard domains from this service to a www subdomain so that you always arrive in a consistent location. For example, the example.com apex domain would be redirected to www.example.com. Our guide to <button className={styles.inlineLink}>redirecting traffic</button>.</p>
        </div>
        <table className={styles.table}>
          <thead><tr><th>Domain</th><th>Status</th><th>Date Added</th></tr></thead>
          <tbody><tr><td>—</td><td>—</td><td>—</td></tr></tbody>
        </table>
        <button className={styles.addDomainBtn}><Icon name="add" size={20} /> Add apex redirect</button>
      </div>

      {/* Request settings */}
      <div data-section="settings-request-settings" className={styles.configPageWrap}>
        <h3 className={styles.settingsCardTitle}>Request settings</h3>
        <p className={styles.settingsCardDesc}>Request Settings are used to customize Fastly's request handling. When used with <button className={styles.inlineLink}>Conditions</button> the Request Settings allow you to fine tune how specific types of requests are handled.</p>
        <button className={styles.addDomainBtn}><Icon name="add" size={20} /> Create request setting</button>
        <div className={`${styles.card} ${styles.configCard}`}>
          <div className={styles.headerItemRow}>
            <div className={styles.headerItemLeft}>
              <span className={styles.headerItemName}>Force TLS</span>
              <span className={styles.headerItemGenerated}>Generated by <button className={styles.inlineLink}>force TLS and enable HSTS</button></span>
            </div>
            <button className={styles.configRowAction}><Icon name="more" size={20} /></button>
          </div>
          <button className={styles.moreDetailsBtn}>Show details <Icon name="chevron-down" size={16} /></button>
        </div>
      </div>

      {/* Cache settings */}
      <div data-section="settings-cache-settings" className={styles.configPageWrap}>
        <h3 className={styles.settingsCardTitle}>Cache settings</h3>
        <p className={styles.settingsCardDesc}>Cache Settings <button className={styles.inlineLink}>controls how caching is performed</button> on Fastly. When used with <button className={styles.inlineLink}>Conditions</button>, the Cache Settings provide you with fine grain control over how long content persists in the cache.</p>
        <div className={`${styles.card} ${styles.configCard}`}>
          <p className={styles.configEmptyText} style={{ fontStyle: 'italic' }}>There are no cache settings.</p>
          <button className={styles.addDomainBtn}><Icon name="add" size={20} /> Create your first cache setting</button>
        </div>
      </div>

      {/* Cache reservation */}
      <div className={styles.configPageWrap}>
        <h3 className={styles.settingsCardTitle}>Cache reservation</h3>
        <p className={styles.settingsCardDesc}>Cache Reservation provides a custom caching layer at Fastly's edge where you can reserve cache space specifically for your content at Fastly shielding locations and thus minimize content eviction in these multi-tenant environments. By prioritizing your content's cache storage, Cache Reservation allows that content to stay in cache longer, thereby optimizing your origin's offload from any CDN, including Fastly, and reducing your cloud egress costs.</p>
        <p className={styles.settingsCardDesc}>Our guide to <button className={styles.inlineLink}>Cache reservation</button>.</p>
        <p className={styles.settingsCardDesc}>Cache reservation is not available for trial.</p>
      </div>
    </div>
  );
}

/* ─── Content page ─── */
function ContentPage() {
  const [compressionFormat, setCompressionFormat] = useState('brotli');
  const [compressionPolicy, setCompressionPolicy] = useState('default');

  return (
    <div className={styles.configPageWrap}>
      {/* Request settings */}
      <div data-section="content-headers" className={`${styles.card} ${styles.configCard}`}>
        <div className={styles.settingsCardHeader}>
          <h3 className={styles.settingsCardTitle}>Header settings</h3>
          <p className={styles.settingsCardDesc}>Lorem ipsum dolor sit amet consectetur. Ut sed amet tortor malesuada eu. Sit sed ut eget sed.</p>
        </div>
        <button className={styles.addDomainBtn}><Icon name="add" size={20} /> Create a header</button>
      </div>

      {/* Compression */}
      <div data-section="content-compression" className={`${styles.card} ${styles.configCard}`}>
        <div className={styles.compressionCardLayout}>
          <div className={styles.compressionToggleWrap}>
            <div className={styles.settingsToggle} />
          </div>
          <div className={styles.compressionContent}>
            <div className={styles.settingsCardHeader}>
              <h3 className={styles.settingsCardTitle}>Compression</h3>
              <p className={styles.settingsCardDesc}>Compress content to transfer data faster. Our guide to compression.</p>
            </div>

            <div className={styles.compressionSubsection}>
              <h4 className={styles.compressionSubsectionTitle}>Compression format</h4>
              <div className={styles.radioSelectRow}>
                <label className={`${styles.radioSelectBox} ${compressionFormat === 'brotli' ? styles.radioSelectBoxSelected : ''}`}>
                  <input type="radio" name="compressionFormat" className={styles.radioSelectInput} checked={compressionFormat === 'brotli'} onChange={() => setCompressionFormat('brotli')} />
                  <div className={styles.radioSelectContent}>
                    <span className={styles.radioSelectLabel}>Brotli</span>
                    <span className={styles.radioSelectDesc}>Include support for Brotli compression on this service. We will default to Brotli compression whenever browser support for it is available. When it isn't, we will use gzip compression.</span>
                  </div>
                </label>
                <label className={`${styles.radioSelectBox} ${compressionFormat === 'gzip' ? styles.radioSelectBoxSelected : ''}`}>
                  <input type="radio" name="compressionFormat" className={styles.radioSelectInput} checked={compressionFormat === 'gzip'} onChange={() => setCompressionFormat('gzip')} />
                  <div className={styles.radioSelectContent}>
                    <span className={styles.radioSelectLabel}>gzip only</span>
                    <span className={styles.radioSelectDesc}>Include support for gzip compression on this service. Do not use Brotli compression.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className={styles.compressionSubsection}>
              <h4 className={styles.compressionSubsectionTitle}>Compression policy</h4>
              <div className={styles.radioSelectRow}>
                <label className={`${styles.radioSelectBox} ${compressionPolicy === 'default' ? styles.radioSelectBoxSelected : ''}`}>
                  <input type="radio" name="compressionPolicy" className={styles.radioSelectInput} checked={compressionPolicy === 'default'} onChange={() => setCompressionPolicy('default')} />
                  <div className={styles.radioSelectContent}>
                    <span className={styles.radioSelectLabel}>Default</span>
                    <span className={styles.radioSelectDesc}>Get started with compression using Fastly's recommended file extensions and content types for gzip and Brotli formats.</span>
                  </div>
                </label>
                <label className={`${styles.radioSelectBox} ${compressionPolicy === 'advanced' ? styles.radioSelectBoxSelected : ''}`}>
                  <input type="radio" name="compressionPolicy" className={styles.radioSelectInput} checked={compressionPolicy === 'advanced'} onChange={() => setCompressionPolicy('advanced')} />
                  <div className={styles.radioSelectContent}>
                    <span className={styles.radioSelectLabel}>Advanced policy</span>
                    <span className={styles.radioSelectDesc}>With advanced compression you can customize the exact file extensions and content types to compress under specific conditions.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Response settings */}
      <div data-section="content-responses" className={`${styles.card} ${styles.configCard}`}>
        <div className={styles.settingsCardHeader}>
          <h3 className={styles.settingsCardTitle}>Response settings</h3>
          <p className={styles.settingsCardDesc}>Let Fastly serve your static HTML or TXT files. Our guide to synthetic responses.</p>
        </div>
        <div className={styles.settingsToggleRow}>
          <div className={styles.settingsToggle} />
          <div className={styles.settingsToggleInfo}>
            <h4 className={styles.settingsToggleTitle}>404 page</h4>
            <p className={styles.settingsToggleDesc}>You can style this response to look like your application.</p>
          </div>
        </div>
        <div className={styles.settingsToggleRow}>
          <div className={styles.settingsToggle} />
          <div className={styles.settingsToggleInfo}>
            <h4 className={styles.settingsToggleTitle}>503 page</h4>
            <p className={styles.settingsToggleDesc}>You can style this response to look like your application.</p>
          </div>
        </div>
        <div className={styles.settingsToggleRow}>
          <div className={styles.settingsToggle} />
          <div className={styles.settingsToggleInfo}>
            <h4 className={styles.settingsToggleTitle}>robots.txt</h4>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Logging page ─── */
function LoggingPage() {
  return (
    <div className={styles.configPageWrap}>
      <div className={styles.configPageHeader}>
        <h2 className={styles.configPageTitle}>Logging</h2>
        <p className={styles.configPageDesc}>For more information, read our <button className={styles.inlineLink}>logging documentation</button>.</p>
      </div>
      <div className={styles.vclEmptyState}>
        <Icon name="compatibility-2-illustration" size={80} />
        <h3 className={styles.vclEmptyTitle}>No logging endpoints yet</h3>
        <p className={styles.configCardDesc} style={{ textAlign: 'center' }}>After you create a logging endpoint they will appear here</p>
        <div className={styles.vclEmptyActions}>
          <button className={styles.editBtn}>Add endpoint <Icon name="chevron-down" size={20} style={{ color: 'white' }} /></button>
          <button className={styles.addDomainBtn}>Documentation <Icon name="export" size={20} /></button>
        </div>
      </div>
    </div>
  );
}

/* ─── VCL page ─── */
function VclPage() {
  const [activeTab, setActiveTab] = useState<'snippets' | 'custom' | 'complete'>('snippets');

  const vclLines: { text: string; color?: string; highlight?: string }[] = [
    { text: '# Noticing changes to your VCL? The event log', color: 'green' },
    { text: '# (https://docs.fastly.com/en/guides/reviewing-service-activity-with-the-event-log)', color: 'green' },
    { text: "# in the web interface shows changes to your service's configurations and the", color: 'green' },
    { text: '# change log on developer.fastly.com (https://developer.fastly.com/reference/changes/vcl/)', color: 'green' },
    { text: '# provides info on changes to the Fastly-provided VCL itself.', color: 'green' },
    { text: 'pragma optional_param geoip_opt_in true;' },
    { text: 'pragma optional_param max_object_size 52428800;' },
    { text: 'pragma optional_param smiss_max_object_size 52428800;' },
    { text: 'pragma optional_param fetchless_purge_all 1;' },
    { text: 'pragma optional_param chash_randomize_on_pass true;' },
    { text: 'pragma optional_param default_ssl_check_cert 1;' },
    { text: 'pragma optional_param max_backends 20;' },
    { text: 'pragma optional_param customer_id "6MIv9yBm7CPkS96GbCByMB";' },
    { text: 'C!' },
    { text: 'W!' },
    { text: '# Backends', color: 'green' },
    { text: 'backend F_Host_1 {' },
    { text: '    .between_bytes_timeout = 10s;' },
    { text: '    .connect_timeout = 1s;' },
    { text: '    .first_byte_timeout = 15s;' },
    { text: '    .host = "192.178.12.12";' },
    { text: '    .max_connections = 200;' },
    { text: '    .port = "80";' },
    { text: '    .share_key = "ngrfSqoDLkLxShlCB25wP5";' },
    { text: '}' },
    { text: 'backend F_Host_2 {', highlight: 'error' },
    { text: '    .between_bytes_timeout = 10s;' },
    { text: '    .connect_timeout = 1s;' },
    { text: '    .first_byte_timeout = 15s;' },
    { text: '    .host = "0.0.0.0";' },
    { text: '    .max_connections = 200;' },
    { text: '    .port = "80";' },
    { text: '    .share_key = "ngrfSqoDLkLxShlCB25wP5";' },
    { text: '}' },
    { text: '' },
    { text: 'function handler(event) {', highlight: 'info' },
    { text: '  let clientGeo = event.client.geo', highlight: 'info' },
    { text: '', highlight: 'info' },
    { text: '  event.request.headers.set("client-geo-continent", clientGeo.continent)', highlight: 'info' },
    { text: '  event.request.headers.set("client-geo-country", clientGeo.country_code)', highlight: 'info' },
    { text: '  event.request.headers.set("client-geo-latitude", clientGeo.latitude)', highlight: 'info' },
    { text: '  event.request.headers.set("client-geo-longitude", clientGeo.longitude)', highlight: 'info' },
    { text: '', highlight: 'info' },
    { text: '  return fetch(event.request, { backend: "origin_0" })', highlight: 'info' },
    { text: '}', highlight: 'info' },
    { text: '' },
    { text: '# Backends', color: 'green' },
    { text: 'backend F_Host_1 {' },
    { text: '    .between_bytes_timeout = 10s;' },
    { text: '    .connect_timeout = 1s;' },
    { text: '    .first_byte_timeout = 15s;' },
    { text: '    .host = "192.178.12.12";' },
    { text: '    .max_connections = 200;' },
    { text: '    .port = "80";' },
    { text: '    .share_key = "ngrfSqoDLkLxShlCB25wP5";' },
    { text: '}' },
  ];

  return (
    <div className={styles.configPageWrap}>
      <div className={styles.configPageHeader}>
        <h2 className={styles.configPageTitle}>VCL</h2>
        <div className={styles.vclSubheader}>
          <span className={styles.configCardDesc}>313 lines</span>
          <span className={styles.vclSep} />
          <Icon name="attention-filled" size={20} />
          <span className={styles.configCardDesc}>1 error</span>
          <span className={styles.vclSep} />
          <Icon name="attention-filled" size={20} />
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
          <button className={styles.vclFullscreenBtn}>
            <Icon name="fullscreen" size={20} /> Fullscreen
          </button>
        </div>
        <div data-section={`vcl-${activeTab}`} className={activeTab === 'complete' ? styles.vclContentComplete : styles.vclContent}>
          {activeTab === 'complete' ? (
            <div className={styles.vclCodeEditor}>
              <div className={styles.vclLineNumbers}>
                {vclLines.map((_, i) => (
                  <span key={i} className={`${styles.vclLineNum} ${vclLines[i].highlight === 'error' ? styles.vclLineNumError : ''}`}>{i + 1}</span>
                ))}
              </div>
              <div className={styles.vclCodeLines}>
                {vclLines.map((line, i) => (
                  <div key={i} className={`${styles.vclCodeLine} ${line.highlight === 'error' ? styles.vclLineError : ''} ${line.highlight === 'info' ? styles.vclLineInfo : ''}`}>
                    <span style={line.color === 'green' ? { color: 'green' } : undefined}>{line.text || '\u200B'}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.vclEmptyState}>
              <Icon name="devops-illustration" size={80} />
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

/* ─── Image Optimizer page ─── */
function ImageOptimizerPage() {
  return (
    <div className={styles.configPageWrap}>
      <div className={`${styles.card} ${styles.configCard}`}>
        <div className={styles.settingsCardHeader}>
          <div className={styles.configCardTitleRow}>
            <h3 className={styles.settingsCardTitle}>Image Optimizer</h3>
            <span className={styles.versionedPill}>Immediate update</span>
            <Icon name="help" size={20} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <p className={styles.settingsCardDesc}>Fastly's Image Optimizer allows you to transform and serve images at the edge, closer to your users. Offline image pre-processing tasks can take significant time. We perform the transformation tasks for you programmatically in real-time, allowing you to speed up delivery. <button className={styles.inlineLink}>Image Optimizer guide.</button></p>
        </div>
        <div className={styles.ioDropdownSection}>
          <label className={styles.ioDropdownLabel}>Fallback location</label>
          <button className={styles.ioDropdownSelect}>
            <span className={styles.ioDropdownPlaceholder}>Select location</span>
            <Icon name="caret-down" size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <p className={styles.ioDropdownHint}>Choose the geographic region closest to the origin where your images are stored. For origins without shielding configured, this region determines the fallback shield region for Image Optimizer requests.</p>
        </div>
        <button className={styles.addDomainBtn}>Enable Image Optimizer</button>
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
      <div className={styles.vclEmptyState}>
        <Icon name="devops-illustration" size={80} />
        <h3 className={styles.vclEmptyTitle}>No dictionaries added</h3>
        <p className={styles.configCardDesc} style={{ textAlign: 'center' }}>A list of key-value pairs that can be referenced and used by your custom edge logic.</p>
        <div className={styles.vclEmptyActions}>
          <button className={styles.addDomainBtn}><Icon name="add" size={20} /> Create your first dictionary</button>
        </div>
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
      <div className={styles.vclEmptyState}>
        <Icon name="devops-illustration" size={80} />
        <h3 className={styles.vclEmptyTitle}>No ACLs added</h3>
        <p className={styles.configCardDesc} style={{ textAlign: 'center' }}>Filter traffic by specifying which IP addresses should be allowed or blocked.</p>
        <div className={styles.vclEmptyActions}>
          <button className={styles.addDomainBtn}><Icon name="add" size={20} /> Create your first ACL</button>
        </div>
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
