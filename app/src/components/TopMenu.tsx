import { useState, useCallback, useEffect } from 'react';
import { Icon } from './Icon';
import { HelpMenu } from './HelpMenu';
import { AvatarMenu } from './AvatarMenu';
import { AppSwitcher } from './AppSwitcher';
import { SearchOverlay } from './SearchOverlay';
import styles from './TopMenu.module.css';

interface TopMenuProps {
  onMenuClick: () => void;
  onBellClick: () => void;
  onLogoClick: () => void;
  onNavigate: (id: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export function TopMenu({ onMenuClick, onBellClick, onLogoClick, onNavigate, isDark, onToggleDark }: TopMenuProps) {
  const [helpOpen, setHelpOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [appSwitcherOpen, setAppSwitcherOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const closeAll = () => {
    setHelpOpen(false);
    setAvatarOpen(false);
    setAppSwitcherOpen(false);
  };

  const toggleHelp = useCallback(() => {
    closeAll();
    setHelpOpen((prev) => !prev);
  }, []);

  const toggleAvatar = useCallback(() => {
    closeAll();
    setAvatarOpen((prev) => !prev);
  }, []);

  const toggleAppSwitcher = useCallback(() => {
    closeAll();
    setAppSwitcherOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/') return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      e.preventDefault();
      setSearchOpen(true);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className={styles.topMenu}>
      <div className={styles.left}>
        <button
          className={styles.menuButton}
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Icon name="hamburger" size={24} />
        </button>

        <button className={styles.logo} onClick={onLogoClick} aria-label="Go to home page">
          <Icon name="fastly-logo" size={24} />
        </button>

        <div className={styles.separator} />

        <div>
          <span className={styles.companyName}>Acme Co.</span>
        </div>
      </div>

      {/* Desktop-only centered search */}
      <div className={styles.searchWrapper} onClick={() => setSearchOpen(true)}>
        <Icon name="search" size={20} style={{ color: 'var(--text-secondary)' }} />
        <span className={styles.searchPlaceholder}>Search</span>
        <span className={styles.searchShortcut}>/</span>
      </div>

      <div className={styles.right}>
        {/* Feedback - hidden on mobile */}
        <button className={styles.feedbackButton}>Feedback</button>

        {/* Help */}
        <div className={styles.dropdownWrapper}>
          <button className={styles.iconButton} aria-label="Help" onClick={toggleHelp}>
            <Icon name="help" size={24} />
          </button>
          <HelpMenu isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
        </div>

        {/* Search icon - tablet/mobile only */}
        <button className={`${styles.iconButton} ${styles.searchIconButton}`} aria-label="Search" onClick={() => setSearchOpen(true)}>
          <Icon name="search" size={24} />
        </button>

        {/* Notifications - hidden on mobile */}
        <button className={`${styles.iconButton} ${styles.bellButton}`} aria-label="Notifications" onClick={onBellClick}>
          <Icon name="bell" size={24} />
        </button>

        {/* App Switcher - hidden on mobile */}
        <div className={`${styles.dropdownWrapper} ${styles.appSwitcherWrapper}`}>
          <button className={styles.iconButton} aria-label="App switcher" onClick={toggleAppSwitcher}>
            <Icon name="waffle" size={24} />
          </button>
          <AppSwitcher isOpen={appSwitcherOpen} onClose={() => setAppSwitcherOpen(false)} />
        </div>

        {/* Avatar */}
        <div className={styles.dropdownWrapper}>
          <button className={styles.avatar} onClick={toggleAvatar}>
            <span>A</span>
          </button>
          <AvatarMenu
            isOpen={avatarOpen}
            onClose={() => setAvatarOpen(false)}
            onNavigate={onNavigate}
            isDark={isDark}
            onToggleDark={onToggleDark}
          />
        </div>
      </div>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={onNavigate} />
    </header>
  );
}
