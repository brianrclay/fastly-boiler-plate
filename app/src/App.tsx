import { useState, useCallback, useRef, useEffect } from 'react';
import { MantineProvider } from '@mantine/core';
import { TopMenu } from './components/TopMenu';
import { GlobalNav } from './components/GlobalNav';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ObservabilityPage } from './pages/ObservabilityPage';
import { BillingPage } from './pages/BillingPage';
import { DnsManagementPage } from './pages/DnsManagementPage';
import { CdnPage } from './pages/CdnPage';
import { ComputePage } from './pages/ComputePage';
import { ServiceSummaryPage } from './pages/ServiceSummaryPage';
import { CreateCdnServicePage } from './pages/CreateCdnServicePage';
import { PrototypeProvider } from './context/PrototypeContext';
import { PrototypeToolbar } from './components/PrototypeToolbar';
import { theme } from './theme';
import styles from './App.module.css';
import { Retune } from 'retune';

const PAGE_FADE_MS = 150;

const defaultSubItems: Record<string, string> = {
  'observability': 'account-summary',
  'billing': 'billing-overview',
  'dns-management': 'dns-zones',
};

function idToPath(pageId: string, subId?: string): string {
  if (pageId === 'home') return '/';
  if (subId && defaultSubItems[pageId] !== subId) return `/${pageId}/${subId}`;
  return `/${pageId}`;
}

const pageTitles: Record<string, string> = {
  'home': 'Home',
  'cdn': 'CDN',
  'compute': 'Compute',
  'domains': 'Domains',
  'tls-management': 'TLS Management',
  'next-gen-waf': 'Next-Gen WAF',
  'ddos-protection': 'DDoS Protection',
  'ddos-observer': 'DDoS Observer',
  'bot-management': 'Bot Management',
  'api-discovery': 'API Discovery',
  'client-side-protection': 'Client-side protection',
  'edge-rate-limiting': 'Edge rate limiting',
  'vcl-client-challenges': 'VCL client challenges',
  'config-stores': 'Config Stores',
  'kv-stores': 'KV Stores',
  'secret-stores': 'Secret Stores',
  'object-storage': 'Object Storage',
  'access-control-lists': 'Access Control Lists',
  'ai-accelerator': 'AI Accelerator',
  'dev-tools': 'Dev Tools',
  'notifications': 'Notifications',
  'company-information': 'Company information',
  'user-management': 'User management',
  'api-tokens': 'API Tokens',
  'audit-log': 'Audit log',
  'sustainability-dashboard': 'Sustainability dashboard',
  'profile-security': 'Profile & Security',
};

const VALID_PAGE_IDS = new Set([
  ...Object.keys(pageTitles),
  'observability',
  'billing',
  'dns-management',
  'service-summary',
  'compute',
  'create-cdn-service',
]);

function parseUrl(): { pageId: string; subId?: string } {
  const segments = window.location.pathname.split('/').filter(Boolean);
  if (segments.length === 0) return { pageId: 'home' };
  const pageId = segments[0];
  if (!VALID_PAGE_IDS.has(pageId)) return { pageId: 'home' };
  return { pageId, subId: segments[1] ? decodeURIComponent(segments[1]) : undefined };
}

export default function App() {
  const [navOpen, setNavOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(() => parseUrl().pageId);
  const [displayedItem, setDisplayedItem] = useState(() => parseUrl().pageId);
  const [activeSubItem, setActiveSubItem] = useState<string | undefined>(() => parseUrl().subId);
  const [pageVisible, setPageVisible] = useState(true);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeItemRef = useRef(activeItem);
  activeItemRef.current = activeItem;
  const [isDark, setIsDark] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'pins-section': true,
    'domains-section': true,
    'services-section': true,
    'security-section': true,
    'resources-section': true,
    'tools-section': true,
    'account-section': true,
  });
  const [pinnedItemIds, setPinnedItemIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('pinnedNavItems') || '[]'); } catch { return []; }
  });
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => { localStorage.setItem('pinnedNavItems', JSON.stringify(pinnedItemIds)); }, [pinnedItemIds]);

  // Apply data-theme to the root element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Sync navigation with browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const { pageId, subId } = parseUrl();
      if (pageId !== activeItemRef.current) {
        setActiveItem(pageId);
        setActiveSubItem(subId);
        if (transitionTimer.current) {
          clearTimeout(transitionTimer.current);
        }
        setPageVisible(false);
        transitionTimer.current = setTimeout(() => {
          setDisplayedItem(pageId);
          requestAnimationFrame(() => setPageVisible(true));
          transitionTimer.current = null;
        }, PAGE_FADE_MS);
      } else {
        setActiveSubItem(subId);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleToggleDark = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const handleBellClick = useCallback(() => {
    setNotificationsOpen(true);
  }, []);

  const handleNotificationsClose = useCallback(() => {
    setNotificationsOpen(false);
  }, []);

  const handleMenuClick = useCallback(() => {
    setNavOpen(true);
  }, []);

  const handleNavClose = useCallback(() => {
    setNavOpen(false);
  }, []);

  const handleItemClick = useCallback((id: string) => {
    if (id.startsWith('service:')) {
      const serviceName = id.slice(8);
      setActiveItem('service-summary');
      setActiveSubItem(serviceName);
      setNavOpen(false);

      const newPath = `/service-summary/${encodeURIComponent(serviceName)}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState(null, '', newPath);
      }

      if ('service-summary' === displayedItem) return;

      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      setPageVisible(false);
      transitionTimer.current = setTimeout(() => {
        setDisplayedItem('service-summary');
        requestAnimationFrame(() => setPageVisible(true));
        transitionTimer.current = null;
      }, PAGE_FADE_MS);
      return;
    }
    setActiveItem(id);
    setActiveSubItem(undefined);

    if (transitionTimer.current) {
      clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }

    // Close nav immediately
    setNavOpen(false);

    // Update URL
    const newPath = idToPath(id);
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }

    if (id === displayedItem) return;

    // Fade out, swap, fade in — no delay
    setPageVisible(false);
    transitionTimer.current = setTimeout(() => {
      setDisplayedItem(id);
      requestAnimationFrame(() => {
        setPageVisible(true);
      });
      transitionTimer.current = null;
    }, PAGE_FADE_MS);
  }, [displayedItem]);

  const handleSubItemChange = useCallback((subId: string) => {
    setActiveSubItem(subId);
    const path = idToPath(activeItemRef.current, subId);
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, []);

  const handleL2Navigate = useCallback((pageId: string, subId: string) => {
    setActiveItem(pageId);
    setActiveSubItem(subId);
    setNavOpen(false);

    const newPath = idToPath(pageId, subId);
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }

    if (pageId === displayedItem) return;

    if (transitionTimer.current) {
      clearTimeout(transitionTimer.current);
    }
    setPageVisible(false);
    transitionTimer.current = setTimeout(() => {
      setDisplayedItem(pageId);
      requestAnimationFrame(() => setPageVisible(true));
      transitionTimer.current = null;
    }, PAGE_FADE_MS);
  }, [displayedItem]);

  const handleServiceClick = useCallback((serviceName: string) => {
    setActiveItem('service-summary');
    setActiveSubItem(serviceName);
    setNavOpen(false);

    const newPath = `/service-summary/${encodeURIComponent(serviceName)}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }

    if ('service-summary' === displayedItem) return;

    if (transitionTimer.current) {
      clearTimeout(transitionTimer.current);
    }
    setPageVisible(false);
    transitionTimer.current = setTimeout(() => {
      setDisplayedItem('service-summary');
      requestAnimationFrame(() => setPageVisible(true));
      transitionTimer.current = null;
    }, PAGE_FADE_MS);
  }, [displayedItem]);

  const handleToggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId] === false ? true : false,
    }));
  }, []);

  const handleTogglePin = useCallback((itemId: string) => {
    setPinnedItemIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      }
      return [...prev, itemId];
    });
  }, []);

  const renderPage = () => {
    switch (displayedItem) {
      case 'observability':
        return <ObservabilityPage pageVisible={pageVisible} activeSubItem={activeSubItem} onSubItemChange={handleSubItemChange} />;
      case 'billing':
        return <BillingPage pageVisible={pageVisible} activeSubItem={activeSubItem} onSubItemChange={handleSubItemChange} />;
      case 'dns-management':
        return <DnsManagementPage pageVisible={pageVisible} activeSubItem={activeSubItem} onSubItemChange={handleSubItemChange} />;
      case 'cdn':
        return <CdnPage pageVisible={pageVisible} onServiceClick={handleServiceClick} onCreateService={() => handleItemClick('create-cdn-service')} />;
      case 'compute':
        return <ComputePage pageVisible={pageVisible} onServiceClick={handleServiceClick} />;
      case 'service-summary':
        return <ServiceSummaryPage serviceName={activeSubItem || 'Service'} pageVisible={pageVisible} onNavigate={handleItemClick} />;
      case 'create-cdn-service':
        return <CreateCdnServicePage onCancel={() => handleItemClick('cdn')} onCreated={(name) => handleServiceClick(name)} />;
      default:
        return (
          <main className={styles.main}>
            <HomePage title={pageTitles[displayedItem] || displayedItem} pageVisible={pageVisible} onNavigate={handleItemClick} onServiceClick={handleServiceClick} onCreateService={() => handleItemClick('create-cdn-service')} />
            <Footer />
          </main>
        );
    }
  };

  return (
    <PrototypeProvider>
    <MantineProvider theme={theme}>
      <Retune />
      <div className={styles.layout}>
        <PrototypeToolbar />
        <TopMenu onMenuClick={handleMenuClick} onBellClick={handleBellClick} onLogoClick={() => handleItemClick('home')} onNavigate={handleItemClick} isDark={isDark} onToggleDark={handleToggleDark} />
        <div className={styles.pageTransition}>
          {renderPage()}
        </div>
        <GlobalNav
          isOpen={navOpen}
          onClose={handleNavClose}
          activeItem={activeItem}
          activeSubItem={activeSubItem}
          onItemClick={handleItemClick}
          onL2Navigate={handleL2Navigate}
          expandedSections={expandedSections}
          onToggleSection={handleToggleSection}
          pinnedItemIds={pinnedItemIds}
          onTogglePin={handleTogglePin}
          onReorderPins={setPinnedItemIds}
        />
        <NotificationsDrawer
          isOpen={notificationsOpen}
          onClose={handleNotificationsClose}
          onNavigate={handleItemClick}
        />
      </div>
    </MantineProvider>
    </PrototypeProvider>
  );
}
