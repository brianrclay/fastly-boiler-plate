import { useState } from 'react';
import { Icon } from '../components/Icon';
import { Footer } from '../components/Footer';
import styles from './CreateCdnServicePage.module.css';

interface Props {
  onCancel: () => void;
  onCreated: (serviceName: string) => void;
}

export function CreateCdnServicePage({ onCancel, onCreated }: Props) {
  const [serviceName, setServiceName] = useState('Untitled service 1');
  const [domain, setDomain] = useState('');
  const [host, setHost] = useState('');
  const [overrideHost, setOverrideHost] = useState(true);
  const [compression, setCompression] = useState(true);
  const [forceTls, setForceTls] = useState(true);

  return (
    <main className={styles.main}>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create a CDN service</h1>
          <div className={styles.headerActions}>
            <button className={styles.headerLink} onClick={onCancel}>Cancel</button>
            <button className={styles.headerLink} onClick={() => onCreated(serviceName)}>Skip to service configuration</button>
          </div>
        </div>

        <div className={styles.formCard}>
          {/* Name your service */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <h2 className={styles.sectionTitle}>Name your service</h2>
                <button className={styles.actionLink}>Quick start guide <Icon name="export" size={20} /></button>
              </div>
              <p className={styles.sectionDesc}>We recommend naming the service something that relates to how the service will be used.</p>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Service name</label>
              <input
                type="text"
                className={styles.textInput}
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
              <span className={styles.fieldHint}>Example: Fastly Website</span>
            </div>
          </div>

          {/* Add your own domain */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Add your own domain</h2>
              <p className={styles.sectionDesc}>Domains are used to route requests to your service. Customers associate domain names with their origin when provisioning a Fastly service.</p>
            </div>
            <button className={styles.actionLink}>Adding a domain <Icon name="chevron-down" size={20} /></button>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Domain</label>
              <input
                type="text"
                className={styles.textInput}
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder=""
              />
              <span className={styles.fieldHint}>Example: www.your-name.com (you can also use your-name.global.ssl.fastly.net if you don't have a domain yet)</span>
            </div>
            <button className={styles.actionLink}>TLS configuration: Default <Icon name="chevron-down" size={20} /></button>
          </div>

          {/* Add an origin */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Add an origin</h2>
              <p className={styles.sectionDesc}>Origins (also known as "hosts") are used as backends for your site. In addition to the IP address and port, the information is used to uniquely identify a domain.</p>
            </div>
            <button className={styles.actionLink}>Setting up a host guide <Icon name="export" size={20} /></button>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Host</label>
              <input
                type="text"
                className={styles.textInput}
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder=""
              />
              <span className={styles.fieldHint}>Example: origin.example.com</span>
            </div>
          </div>

          {/* Recommended settings */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recommended settings</h2>
              <p className={styles.sectionDesc}>We recommend enabling the settings below for best results.</p>
            </div>
            <div className={styles.toggleRow}>
              <button
                className={overrideHost ? styles.toggleOn : styles.toggleOff}
                onClick={() => setOverrideHost(!overrideHost)}
              >
                <span className={styles.toggleText}>{overrideHost ? 'ON' : 'OFF'}</span>
                <span className={styles.toggleThumb} />
              </button>
              <span className={styles.toggleLabel}>Override default host</span>
              <Icon name="help" size={20} style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div className={styles.toggleRow}>
              <button
                className={compression ? styles.toggleOn : styles.toggleOff}
                onClick={() => setCompression(!compression)}
              >
                <span className={styles.toggleText}>{compression ? 'ON' : 'OFF'}</span>
                <span className={styles.toggleThumb} />
              </button>
              <span className={styles.toggleLabel}>Default compression</span>
              <Icon name="help" size={20} style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div className={styles.toggleRow}>
              <button
                className={forceTls ? styles.toggleOn : styles.toggleOff}
                onClick={() => setForceTls(!forceTls)}
              >
                <span className={styles.toggleText}>{forceTls ? 'ON' : 'OFF'}</span>
                <span className={styles.toggleThumb} />
              </button>
              <span className={styles.toggleLabel}>Force TLS &amp; HSTS</span>
              <Icon name="help" size={20} style={{ color: 'var(--text-secondary)' }} />
            </div>
          </div>

          {/* Actions */}
          <div className={styles.formActions}>
            <button className={styles.activateBtn} onClick={() => onCreated(serviceName)}>Activate</button>
            <button className={styles.saveDraftBtn} onClick={() => onCreated(serviceName)}>Save draft</button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
