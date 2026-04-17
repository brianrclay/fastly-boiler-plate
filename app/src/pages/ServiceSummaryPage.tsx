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
const configNavItems = [
  { id: 'domains', label: 'Domains', badge: '2' },
  { id: 'origins', label: 'Origins', expandable: true },
  { id: 'settings', label: 'Settings', expandable: true },
  { id: 'content', label: 'Content', expandable: true },
  { id: 'logging', label: 'Logging', badge: '0' },
  { id: 'vcl', label: 'VCL' },
  { id: 'image-optimizer', label: 'Image Optimizer', badge: 'Off' },
  { id: 'conditions', label: 'Conditions', badge: '0' },
  { id: 'acl', label: 'Access control lists', badge: '0' },
  { id: 'dictionaries', label: 'Dictionaries', badge: '0' },
  { id: 'security', label: 'Security', expandable: true },
];

function ConfigurationContent({ serviceName: _serviceName }: { serviceName: string }) {
  const [activeSection, setActiveSection] = useState('domains');
  const [domainSearch, setDomainSearch] = useState('');

  const domains = [
    { domain: 'www.fastly.com', comment: 'Marketing site' },
    { domain: 'www.fastly.com', comment: '-' },
  ];

  const filteredDomains = domainSearch
    ? domains.filter((d) => d.domain.toLowerCase().includes(domainSearch.toLowerCase()))
    : domains;

  return (
    <div className={styles.configLayout}>
      {/* Settings sidebar */}
      <div className={styles.configSidebar}>
        <div className={styles.configSearch}>
          <Icon name="search" size={20} style={{ color: 'var(--text-secondary)' }} />
          <input type="text" placeholder="Search all settings" />
        </div>
        <nav className={styles.configNav}>
          {configNavItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.configNavItem} ${activeSection === item.id ? styles.configNavItemActive : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className={styles.configNavLabel}>{item.label}</span>
              {item.badge && <span className={styles.configNavBadge}>{item.badge}</span>}
              {item.expandable && <Icon name="chevron-down" size={20} style={{ color: 'var(--text-secondary)' }} />}
            </button>
          ))}
        </nav>
      </div>

      {/* Content area */}
      <div className={styles.configContent}>
        <div className={`${styles.card} ${styles.configCard}`}>
          <div className={styles.configContentHeader}>
            <h2 className={styles.sectionTitle}>Domains</h2>
          </div>
          <div className={styles.configContentControls}>
            <div className={styles.configDomainSearch}>
              <Icon name="search" size={20} style={{ color: 'var(--text-secondary)' }} />
              <input type="text" placeholder="Search domains" value={domainSearch} onChange={(e) => setDomainSearch(e.target.value)} />
            </div>
            <button className={styles.addDomainBtn}><Icon name="add" size={20} /> Add domain</button>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Domain ↓</th>
                <th>Comment</th>
                <th className={styles.configActionsCol} />
              </tr>
            </thead>
            <tbody>
              {filteredDomains.map((d, i) => (
                <tr key={i}>
                  <td>{d.domain}</td>
                  <td>{d.comment}</td>
                  <td className={styles.configRowActions}>
                    <button className={styles.configRowAction}><Icon name="edit" size={20} /></button>
                    <button className={styles.configRowAction}><Icon name="trash" size={20} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
