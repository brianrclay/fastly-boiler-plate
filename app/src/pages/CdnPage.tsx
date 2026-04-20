import { useState, useCallback, useMemo } from 'react';
import { Icon } from '../components/Icon';
import { Footer } from '../components/Footer';
import { services } from '../data/services';
import { usePrototype } from '../context/PrototypeContext';
import styles from './CdnPage.module.css';

const filterChips = [
  { label: 'Status', type: 'dropdown' as const },
  { label: 'Has feature enabled', type: 'dropdown' as const },
  { label: 'Last changed on', type: 'date' as const },
  { label: 'Created on', type: 'date' as const },
  { label: 'Has staged version', type: 'checkbox' as const },
  { label: 'Is favorite', type: 'checkbox' as const },
];

type SortField = 'name' | 'rps' | 'date';
type SortDirection = 'asc' | 'desc';

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 294;
  const h = 56;
  const padTop = 8;
  const uid = `cdn-spark-${data[0]}-${data[data.length - 1]}`;

  const pts = data.map((val, i) => ({
    x: (i / (data.length - 1)) * w,
    y: padTop + h - ((val - min) / range) * h,
  }));

  const linePoints = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPoints = `0,72 ${linePoints} ${w},72`;

  return (
    <div className={styles.chartContainer}>
      <svg viewBox={`0 0 ${w} 72`} preserveAspectRatio="none" className={styles.sparklineSvg}>
        <defs>
          <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5DAFCF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#5DAFCF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#${uid})`} />
        <polyline
          points={linePoints}
          fill="none"
          stroke="#5DAFCF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function pillClass(type: string): string {
  switch (type) {
    case 'Production': return styles.pillProduction;
    case 'Staging': return styles.pillStaging;
    case 'Draft': return styles.pillDraft;
    case 'QA': return styles.pillQA;
    case 'Locked': return styles.pillLocked;
    default: return '';
  }
}

export function CdnPage({ pageVisible = true, onServiceClick }: { pageVisible?: boolean; onServiceClick?: (name: string) => void }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'expanded' | 'condensed'>('expanded');
  const [sortField, setSortField] = useState<SortField>('rps');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = useCallback((field: SortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField]);

  const { isBrandNew } = usePrototype();
  const cdnServices = useMemo(() => isBrandNew ? [] : services.filter((s) => s.serviceType === 'CDN'), [isBrandNew]);

  const sortedServices = useMemo(() => {
    const filtered = searchQuery
      ? cdnServices.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase()))
      : [...cdnServices];

    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'rps':
          cmp = a.rps - b.rps;
          break;
        case 'date':
          cmp = a.date.localeCompare(b.date);
          break;
      }
      return sortDirection === 'desc' ? -cmp : cmp;
    });

    return filtered;
  }, [cdnServices, searchQuery, sortField, sortDirection]);

  const totalResults = sortedServices.length;

  return (
    <>
      <main style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div className={styles.pageWrapper}>
          <div className={`${styles.pageContent} ${pageVisible ? styles.pageContentAnimate : styles.pageContentHidden}`}>
            {/* Page header */}
            <div className={styles.pageHeader}>
              <h1 className={styles.title}>CDN services</h1>
            </div>

            {/* Controls row */}
            <div className={styles.controlsRow}>
              <div className={styles.searchBarFrame}>
                <div className={styles.searchInput}>
                  <Icon name="search" size={20} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  className={styles.filterTrigger}
                  onClick={() => setFiltersOpen((prev) => !prev)}
                >
                  <span className={styles.filterTriggerLabel}>Filters</span>
                  <span className={styles.filterCount}>0</span>
                  <Icon name={filtersOpen ? 'caret-up' : 'caret-down'} size={20} />
                </button>
                <div className={styles.viewSwitcher}>
                  <button
                    className={`${styles.viewButton} ${viewMode === 'expanded' ? styles.viewButtonActive : ''}`}
                    onClick={() => setViewMode('expanded')}
                  >
                    <Icon name="view-expanded" size={20} />
                  </button>
                  <button
                    className={`${styles.viewButton} ${viewMode === 'condensed' ? styles.viewButtonActive : ''}`}
                    onClick={() => setViewMode('condensed')}
                  >
                    <Icon name="view-condensed" size={20} />
                  </button>
                </div>
              </div>
              <div className={styles.actionsDivider}>
                <button className={styles.createButton}>
                  <Icon name="add" size={20} style={{ color: 'white' }} />
                  Create service
                </button>
              </div>
            </div>

            {/* Filters group (conditionally shown) */}
            {filtersOpen && (
              <div className={styles.filtersGroup}>
                <div className={styles.filtersWrapper}>
                  {filterChips.map((chip) => (
                    <button key={chip.label} className={styles.filterChip}>
                      {chip.type === 'checkbox' && <span className={styles.filterCheckbox} />}
                      {chip.type === 'date' && <Icon name="calendar" size={20} />}
                      {chip.label}
                      {chip.type === 'dropdown' && <Icon name="chevron-down" size={20} />}
                    </button>
                  ))}
                </div>
                <button className={styles.resetFilters}>Reset filters</button>
              </div>
            )}

            {/* Table */}
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thStar} />
                    <th
                      className={`${styles.thSortable} ${sortField === 'name' ? styles.thSorted : ''}`}
                      onClick={() => handleSort('name')}
                    >
                      Service
                      <span className={styles.sortIcon}>
                        {sortField === 'name' && sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    </th>
                    <th>Configuration</th>
                    <th
                      className={`${styles.thSortable} ${sortField === 'rps' ? styles.thSorted : ''}`}
                      onClick={() => handleSort('rps')}
                    >
                      Requests per second
                      <span className={styles.sortIcon}>
                        {sortField === 'rps' && sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    </th>
                    <th
                      className={`${styles.thSortable} ${sortField === 'date' ? styles.thSorted : ''}`}
                      onClick={() => handleSort('date')}
                    >
                      Last changed
                      <span className={styles.sortIcon}>
                        {sortField === 'date' && sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    </th>
                    {viewMode === 'expanded' ? (
                      <th className={styles.thChart}>Last hour of requests</th>
                    ) : (
                      <th className={styles.thIcon} />
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sortedServices.map((svc) => (
                    <tr key={svc.id}>
                      <td className={styles.starCell}>
                        <button className={styles.starButton}><Icon name="star" size={20} /></button>
                      </td>
                      <td>
                        <button className={styles.serviceName} onClick={() => onServiceClick?.(svc.name)}>{svc.name}</button>
                        <div className={styles.serviceId}>{svc.id}</div>
                      </td>
                      <td className={styles.configCell}>
                        {svc.configs.map((config, i) => (
                          <div key={i} className={styles.configRow}>
                            <span className={`${styles.pill} ${pillClass(config.type)}`}>
                              {config.type}
                            </span>
                            {config.version && (
                              <span className={styles.versionLink}>Version {config.version}</span>
                            )}
                          </div>
                        ))}
                      </td>
                      <td>{svc.rps.toLocaleString()} R/s</td>
                      <td>{svc.date}</td>
                      {viewMode === 'expanded' ? (
                        <td className={styles.chartCell}>
                          {svc.sparkline ? (
                            <div className={styles.chartHoverable}>
                              <Sparkline data={svc.sparkline} />
                              <div className={styles.chartHoverOverlay}>
                                <div className={styles.chartHoverBtn}>
                                  <Icon name="search" size={20} />
                                  <span>Open in Observability</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className={styles.chartEmpty}>
                              <span className={styles.chartEmptyText}>No traffic in the last 2 hours</span>
                            </div>
                          )}
                        </td>
                      ) : (
                        <td className={styles.iconCell}>
                          <Icon name="observability" size={20} />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className={styles.pagination}>
                <div className={styles.paginationLeft}>
                  <span className={styles.paginationLabel}>Results per page:</span>
                  <button className={styles.pageSelector}>
                    10
                    <Icon name="chevron-down" size={20} />
                  </button>
                </div>
                <div className={styles.paginationRight}>
                  <span className={styles.paginationInfo}>1&ndash;{totalResults} of {totalResults} results</span>
                  <div className={styles.paginationArrows}>
                    <button className={styles.paginationArrow}>
                      <Icon name="chevron-down" size={24} style={{ transform: 'rotate(90deg)' }} />
                    </button>
                    <button className={styles.paginationArrow}>
                      <Icon name="chevron-down" size={24} style={{ transform: 'rotate(-90deg)' }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </main>
    </>
  );
}
