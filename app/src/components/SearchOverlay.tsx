import { useEffect, useRef, useState, useCallback } from 'react';
import { Icon } from './Icon';
import styles from './SearchOverlay.module.css';

interface PageEntry {
  id: string;
  label: string;
  icon: string;
  category?: string;
}

const allPages: PageEntry[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'observability', label: 'Observability', icon: 'observability' },
  { id: 'account-summary', label: 'Account Summary', icon: 'account-summary', category: 'Observability' },
  { id: 'service-overview', label: 'Service overview', icon: 'observability-services', category: 'Observability' },
  { id: 'all-services', label: 'All services', icon: 'observability-services', category: 'Observability' },
  { id: 'obs-domains', label: 'Domains', icon: 'domains', category: 'Observability' },
  { id: 'origins', label: 'Origins', icon: 'origins', category: 'Observability' },
  { id: 'insights', label: 'Insights', icon: 'insights', category: 'Observability' },
  { id: 'explorer', label: 'Explorer', icon: 'logs', category: 'Observability' },
  { id: 'tailing', label: 'Tailing', icon: 'logs', category: 'Observability' },
  { id: 'alerts-overview', label: 'Alerts Overview', icon: 'alerts', category: 'Observability' },
  { id: 'definitions', label: 'Definitions', icon: 'alerts', category: 'Observability' },
  { id: 'integrations', label: 'Integrations', icon: 'alerts', category: 'Observability' },
  { id: 'custom-dashboards', label: 'Custom Dashboards', icon: 'custom-dashboards', category: 'Observability' },
  { id: 'domains', label: 'Domains', icon: 'domains' },
  { id: 'tls-management', label: 'TLS Management', icon: 'tls-management' },
  { id: 'dns-management', label: 'DNS Management', icon: 'domains' },
  { id: 'cdn', label: 'CDN', icon: 'cdn', category: 'Services' },
  { id: 'compute', label: 'Compute', icon: 'compute', category: 'Services' },
  { id: 'next-gen-waf', label: 'Next-Gen WAF', icon: 'next-gen-waf', category: 'Security' },
  { id: 'ddos-protection', label: 'DDoS Protection', icon: 'ddos-protection', category: 'Security' },
  { id: 'ddos-observer', label: 'DDoS Observer', icon: 'ddos-observer', category: 'Security' },
  { id: 'bot-management', label: 'Bot Management', icon: 'bot-management', category: 'Security' },
  { id: 'api-discovery', label: 'API Discovery', icon: 'api-discovery', category: 'Security' },
  { id: 'client-side-protection', label: 'Client-side protection', icon: 'client-side-protection', category: 'Security' },
  { id: 'edge-rate-limiting', label: 'Edge rate limiting', icon: 'edge-rate-limiting', category: 'Security' },
  { id: 'vcl-client-challenges', label: 'VCL client challenges', icon: 'vcl-client-challenges', category: 'Security' },
  { id: 'config-stores', label: 'Config Stores', icon: 'config-stores', category: 'Resources' },
  { id: 'kv-stores', label: 'KV Stores', icon: 'kv-stores', category: 'Resources' },
  { id: 'secret-stores', label: 'Secret Stores', icon: 'secret-stores', category: 'Resources' },
  { id: 'object-storage', label: 'Object Storage', icon: 'object-storage', category: 'Resources' },
  { id: 'access-control-lists', label: 'Access Control Lists', icon: 'access-control-lists', category: 'Resources' },
  { id: 'ai-accelerator', label: 'AI Accelerator', icon: 'ai-accelerator', category: 'Tools' },
  { id: 'dev-tools', label: 'Dev Tools', icon: 'dev-tools', category: 'Tools' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications', category: 'Account' },
  { id: 'company-information', label: 'Company information', icon: 'company-information', category: 'Account' },
  { id: 'user-management', label: 'User management', icon: 'user-management', category: 'Account' },
  { id: 'api-tokens', label: 'API Tokens', icon: 'api-tokens', category: 'Account' },
  { id: 'audit-log', label: 'Audit log', icon: 'audit-log', category: 'Account' },
  { id: 'sustainability-dashboard', label: 'Sustainability dashboard', icon: 'sustainability-dashboard', category: 'Account' },
  { id: 'billing', label: 'Billing', icon: 'billing', category: 'Account' },
  { id: 'billing-overview', label: 'Billing overview', icon: 'billing-overview', category: 'Billing' },
  { id: 'invoices', label: 'Invoices', icon: 'invoices', category: 'Billing' },
  { id: 'plan-usage', label: 'Plan usage', icon: 'plan-usage', category: 'Billing' },
  { id: 'month-to-date', label: 'Month-to-date', icon: 'month-to-date', category: 'Billing' },
  { id: 'spend-alerts', label: 'Spend alerts', icon: 'spend-alerts', category: 'Billing' },
  { id: 'billing-information', label: 'Billing information', icon: 'billing-information', category: 'Billing' },
  { id: 'profile-security', label: 'Profile & Security', icon: 'profile-security', category: 'Account' },
];

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export function SearchOverlay({ isOpen, onClose, onNavigate }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = query.trim()
    ? allPages.filter((p) => {
        const q = query.toLowerCase();
        return p.label.toLowerCase().includes(q) || (p.category?.toLowerCase().includes(q) ?? false);
      })
    : [];

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback((id: string) => {
    onNavigate(id);
    onClose();
  }, [onNavigate, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        handleSelect(results[selectedIndex].id);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, results, selectedIndex, handleSelect]);

  if (!isOpen) return null;

  const showResults = query.trim().length > 0;

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.panel}>
        {/* Search input row */}
        <div className={styles.inputRow}>
          <div className={styles.inputWrapper}>
            <Icon name="search" size={20} style={{ color: 'var(--text-secondary)' }} />
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              placeholder="Search pages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close search">
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className={styles.scrollable}>
          {showResults ? (
            results.length > 0 ? (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Pages</h3>
                <div className={styles.resultList}>
                  {results.map((page, i) => (
                    <button
                      key={page.id}
                      className={`${styles.resultItem} ${i === selectedIndex ? styles.resultItemSelected : ''}`}
                      onClick={() => handleSelect(page.id)}
                      onMouseEnter={() => setSelectedIndex(i)}
                    >
                      <Icon name={page.icon} size={20} />
                      <span className={styles.resultLabel}>{page.label}</span>
                      {page.category && (
                        <span className={styles.resultCategory}>{page.category}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.section}>
                <p className={styles.noResults}>No pages found for "{query}"</p>
              </div>
            )
          ) : (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Type to search pages...</h3>
            </div>
          )}
        </div>

        {/* Quick Links footer */}
        <div className={styles.footer}>
          <span className={styles.footerLabel}>Quick Links</span>
          <a href="#" className={styles.footerLink}>Fastly Docs</a>
          <a href="#" className={styles.footerLink}>Give feedback</a>
        </div>
      </div>
    </div>
  );
}
