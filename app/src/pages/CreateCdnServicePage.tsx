import { useState, useEffect, useCallback } from 'react';
import { Icon } from '../components/Icon';
import { Footer } from '../components/Footer';
import styles from './CreateCdnServicePage.module.css';

type Step = 'form' | 'created' | 'dns' | 'verifying' | 'live';

interface Props {
  onCancel: () => void;
  onCreated: (serviceName: string) => void;
}

export function CreateCdnServicePage({ onCancel, onCreated }: Props) {
  const [step, setStep] = useState<Step>('form');
  const [serviceName, setServiceName] = useState('Untitled service 1');
  const [domain, setDomain] = useState('');
  const [host, setHost] = useState('');
  const [overrideHost, setOverrideHost] = useState(true);
  const [compression, setCompression] = useState(true);
  const [forceTls, setForceTls] = useState(true);
  const [dnsVerified, setDnsVerified] = useState(false);

  const handleActivate = useCallback(() => {
    setStep('created');
  }, []);

  useEffect(() => {
    if (step !== 'verifying') return;
    const timer = setTimeout(() => {
      setDnsVerified(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (step !== 'verifying' || !dnsVerified) return;
    const timer = setTimeout(() => {
      setStep('live');
    }, 2000);
    return () => clearTimeout(timer);
  }, [step, dnsVerified]);

  const domainName = domain || 'fastly.com';

  return (
    <main className={styles.main}>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create a CDN service</h1>
          <div className={styles.headerActions}>
            {step === 'form' && <button className={styles.headerLink} onClick={onCancel}>Cancel</button>}
            {(step === 'form' || step === 'created') && (
              <button className={styles.headerLink} onClick={() => onCreated(serviceName)}>Skip to service configuration</button>
            )}
          </div>
        </div>

        {step === 'form' && (
          <div className={styles.formCard}>
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
                <input type="text" className={styles.textInput} value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
                <span className={styles.fieldHint}>Example: Fastly Website</span>
              </div>
            </div>
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Add your own domain</h2>
                <p className={styles.sectionDesc}>Domains are used to route requests to your service. Customers associate domain names with their origin when provisioning a Fastly service.</p>
              </div>
              <button className={styles.actionLink}>Adding a domain <Icon name="chevron-down" size={20} /></button>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Domain</label>
                <input type="text" className={styles.textInput} value={domain} onChange={(e) => setDomain(e.target.value)} />
                <span className={styles.fieldHint}>Example: www.your-name.com (you can also use your-name.global.ssl.fastly.net if you don't have a domain yet)</span>
              </div>
              <button className={styles.actionLink}>TLS configuration: Default <Icon name="chevron-down" size={20} /></button>
            </div>
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Add an origin</h2>
                <p className={styles.sectionDesc}>Origins (also known as "hosts") are used as backends for your site. In addition to the IP address and port, the information is used to uniquely identify a domain.</p>
              </div>
              <button className={styles.actionLink}>Setting up a host guide <Icon name="export" size={20} /></button>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Host</label>
                <input type="text" className={styles.textInput} value={host} onChange={(e) => setHost(e.target.value)} />
                <span className={styles.fieldHint}>Example: origin.example.com</span>
              </div>
            </div>
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Recommended settings</h2>
                <p className={styles.sectionDesc}>We recommend enabling the settings below for best results.</p>
              </div>
              <div className={styles.toggleRow}>
                <button className={overrideHost ? styles.toggleOn : styles.toggleOff} onClick={() => setOverrideHost(!overrideHost)}>
                  <span className={styles.toggleText}>{overrideHost ? 'ON' : 'OFF'}</span>
                  <span className={styles.toggleThumb} />
                </button>
                <span className={styles.toggleLabel}>Override default host</span>
                <Icon name="help" size={20} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div className={styles.toggleRow}>
                <button className={compression ? styles.toggleOn : styles.toggleOff} onClick={() => setCompression(!compression)}>
                  <span className={styles.toggleText}>{compression ? 'ON' : 'OFF'}</span>
                  <span className={styles.toggleThumb} />
                </button>
                <span className={styles.toggleLabel}>Default compression</span>
                <Icon name="help" size={20} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div className={styles.toggleRow}>
                <button className={forceTls ? styles.toggleOn : styles.toggleOff} onClick={() => setForceTls(!forceTls)}>
                  <span className={styles.toggleText}>{forceTls ? 'ON' : 'OFF'}</span>
                  <span className={styles.toggleThumb} />
                </button>
                <span className={styles.toggleLabel}>Force TLS &amp; HSTS</span>
                <Icon name="help" size={20} style={{ color: 'var(--text-secondary)' }} />
              </div>
            </div>
            <div className={styles.formActions}>
              <button className={styles.activateBtn} onClick={handleActivate}>Activate</button>
              <button className={styles.saveDraftBtn} onClick={() => onCreated(serviceName)}>Save draft</button>
            </div>
          </div>
        )}

        {step === 'created' && (
          <div className={styles.stepCard}>
            <div className={styles.successIcon}>
              <Icon name="check-circle-filled" size={48} />
            </div>
            <h2 className={styles.stepTitle}>Your service has been created</h2>
            <p className={styles.stepDesc}>Now let's get your DNS settings configured and issue a TLS certificate</p>
            <button className={styles.activateBtn} onClick={() => setStep('dns')}>Configure DNS settings</button>
            <button className={styles.stepLink} onClick={() => onCreated(serviceName)}>I'll do this later</button>
          </div>
        )}

        {step === 'dns' && (
          <div className={styles.formCard}>
            <div className={styles.formSection} style={{ paddingBottom: 0 }}>
              <h2 className={styles.sectionTitle}>Configure DNS records</h2>
              <p className={styles.sectionDesc}>To route traffic to a Fastly service using your domain name, you must associate the domain with your Fastly service and update your domain's CNAME record to point to Fastly.</p>
              <div className={styles.infoBanner}>
                <Icon name="info-filled" size={20} />
                <span>Changing these records may cause your site to become unavailable for a few minutes.</span>
                <button className={styles.infoBannerClose}><Icon name="close" size={16} /></button>
              </div>
            </div>
            <div className={styles.formSection}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Your domain provider</label>
                <div className={styles.selectInput}>
                  <span>GoDaddy</span>
                  <Icon name="chevron-down" size={20} style={{ color: 'var(--text-secondary)' }} />
                </div>
              </div>
              <p className={styles.sectionDesc}>You can get detailed instructions for how to set up your DNS records for GoDaddy using the links below.</p>
              <div className={styles.dnsLinks}>
                <button className={styles.activateBtn}>GoDaddy DNS settings documentation <Icon name="export" size={16} style={{ color: 'white' }} /></button>
                <button className={styles.actionLink}>Fastly DNS set up guide <Icon name="export" size={20} /></button>
              </div>
            </div>
            <div className={styles.formSection} style={{ paddingBottom: 0 }}>
              <table className={styles.dnsTable}>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Name</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>CNAME</td>
                    <td>_acme-challenge.{domainName} <Icon name="copy" size={16} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} /></td>
                    <td>12jfdasfdsa.fastly-validations.com <Icon name="copy" size={16} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} /></td>
                  </tr>
                  <tr>
                    <td>A</td>
                    <td>{domainName} <Icon name="copy" size={16} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} /></td>
                    <td>151.101.3.52 <Icon name="copy" size={16} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={styles.formActions}>
              <button className={styles.activateBtn} onClick={() => setStep('verifying')}>I'm done, check my domain</button>
            </div>
          </div>
        )}

        {step === 'verifying' && (
          <div className={styles.stepCard}>
            <h2 className={styles.stepTitleLeft}>Verifying your DNS settings and issuing TLS certificate</h2>
            <p className={styles.stepDescLeft}>It should take just a minute to verify your domain. Issuing a TLS certificate will take several minutes.</p>
            <div className={styles.statusRow}>
              <div className={`${styles.spinner} ${dnsVerified ? styles.spinnerDone : ''}`}>
                {dnsVerified ? <Icon name="check-circle-filled" size={20} /> : <div className={styles.spinnerCircle} />}
              </div>
              <span className={styles.statusLabel}>{dnsVerified ? 'Issuing TLS certificate' : 'Checking DNS settings'}</span>
            </div>
            {dnsVerified && (
              <div className={styles.successBanner}>
                <Icon name="check-circle-filled" size={20} />
                <div className={styles.successBannerText}>
                  <strong>DNS settings verified</strong>
                  <span>You can continue while we finish issuing your TLS certificate. We'll email you when the certificate is issued.</span>
                </div>
              </div>
            )}
            {dnsVerified && (
              <button className={styles.activateBtn} onClick={() => onCreated(serviceName)}>Skip to service configuration</button>
            )}
            {!dnsVerified && (
              <button className={styles.saveDraftBtn} onClick={() => setStep('dns')}>Back</button>
            )}
          </div>
        )}

        {step === 'live' && (
          <div className={styles.stepCard}>
            <div className={styles.successIcon}>
              <Icon name="check-circle-filled" size={48} />
            </div>
            <h2 className={styles.stepTitle}>Your site is now live</h2>
            <p className={styles.stepDesc}>{domainName} is now pointed to Fastly and your TLS certificate is issued</p>
            <div className={styles.liveActions}>
              <button className={styles.saveDraftBtn}>Visit site <Icon name="export" size={20} /></button>
              <button className={styles.activateBtn} onClick={() => onCreated(serviceName)}>Finish</button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
