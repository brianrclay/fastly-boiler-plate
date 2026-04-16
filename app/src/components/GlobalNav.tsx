import { useEffect, useState, useCallback, useRef } from 'react';
import { Icon } from './Icon';
import { navigationData, isSection } from '../data/navigation';
import type { NavItem, NavSection } from '../data/navigation';
import { observabilityNavData } from '../data/observabilityNav';
import { billingNavData } from '../data/billingNav';
import { dnsNavData } from '../data/dnsNav';
import type { L2NavItem } from '../data/observabilityNav';
import styles from './GlobalNav.module.css';

const l2NavMap: Record<string, { title: string; icon: string; data: L2NavItem[] }> = {
  'observability': { title: 'Observability', icon: 'observability', data: observabilityNavData },
  'billing': { title: 'Billing', icon: 'billing', data: billingNavData },
  'dns-management': { title: 'DNS Management', icon: 'domains', data: dnsNavData },
};

interface GlobalNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem: string;
  onItemClick: (id: string) => void;
  onL2Navigate: (pageId: string, subId: string) => void;
  expandedSections: Record<string, boolean>;
  onToggleSection: (sectionId: string) => void;
  pinnedItemIds: string[];
  onTogglePin: (itemId: string) => void;
}

export function GlobalNav({
  isOpen,
  onClose,
  activeItem,
  onItemClick,
  onL2Navigate,
  expandedSections,
  onToggleSection,
  pinnedItemIds,
  onTogglePin,
}: GlobalNavProps) {
  const [mobileL2Target, setMobileL2Target] = useState<string | null>(null);
  const [l2Expanded, setL2Expanded] = useState<Record<string, boolean>>({});

  // When nav opens, show L2 directly if already on an L2 page (mobile only)
  useEffect(() => {
    if (isOpen) {
      if (l2NavMap[activeItem] && window.matchMedia('(max-width: 767px)').matches) {
        setMobileL2Target(activeItem);
      } else {
        setMobileL2Target(null);
      }
      setL2Expanded({});
    }
  }, [isOpen, activeItem]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleItemClick = useCallback((id: string) => {
    // On mobile, if item has L2 nav, show L2 panel instead of navigating
    if (l2NavMap[id] && window.matchMedia('(max-width: 767px)').matches) {
      setMobileL2Target(id);
      setL2Expanded({});
      return;
    }
    onItemClick(id);
  }, [onItemClick]);

  const handleL2SubItemClick = useCallback((subId: string) => {
    if (mobileL2Target) {
      onL2Navigate(mobileL2Target, subId);
    }
  }, [mobileL2Target, onL2Navigate]);

  const handleBackToMain = useCallback(() => {
    setMobileL2Target(null);
  }, []);

  const toggleL2Expanded = useCallback((id: string) => {
    setL2Expanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Collect all pinned items (preserving pin order)
  const pinnedSet = new Set(pinnedItemIds);
  const allSectionItems = navigationData.filter(isSection).flatMap((s) => s.items);
  const pinnedItems = pinnedItemIds
    .map((id) => allSectionItems.find((item) => item.id === id))
    .filter((item): item is NavItem => !!item);

  const l2Data = mobileL2Target ? l2NavMap[mobileL2Target] : null;

  const [animating, setAnimating] = useState(false);
  const wasOpenRef = useRef(false);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      setAnimating(false);
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      setAnimating(true);
      const el = panelRef.current;
      if (el) {
        const onEnd = () => { setAnimating(false); el.removeEventListener('transitionend', onEnd); };
        el.addEventListener('transitionend', onEnd);
        return () => el.removeEventListener('transitionend', onEnd);
      }
      const fallback = setTimeout(() => setAnimating(false), 400);
      return () => clearTimeout(fallback);
    }
  }, [isOpen]);

  const showOverlay = isOpen || animating;

  return (
    <div className={`${styles.overlay} ${showOverlay ? styles.overlayVisible : ''}`}>
      <div className={styles.scrim} onClick={onClose} />
      <nav ref={panelRef} className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}>
        <NavHeader onClose={onClose} />
        <div className={styles.panelBody}>
          {/* Global nav pane */}
          <div className={`${styles.slidePane} ${mobileL2Target ? styles.slidePaneOut : ''}`}>
            <div className={styles.menuContent}>
              {/* Top-level items (Home, Observability) — not pinnable */}
              {navigationData.map((entry) => {
                if (!isSection(entry)) {
                  return (
                    <NavMenuItem
                      key={entry.id}
                      item={entry}
                      isActive={activeItem === entry.id}
                      onClick={() => handleItemClick(entry.id)}
                      isPinned={false}
                      canPin={false}
                      onTogglePin={() => {}}
                      hasL2={!!l2NavMap[entry.id]}
                    />
                  );
                }
                return null;
              })}

              {/* Pins section */}
              {pinnedItems.length > 0 && (
                <div className={styles.section}>
                  <button
                    className={styles.sectionHeader}
                    onClick={() => onToggleSection('pins-section')}
                  >
                    <span className={styles.sectionLabel}>Pins</span>
                    <span className={`${styles.sectionChevron} ${expandedSections['pins-section'] !== false ? styles.sectionChevronOpen : ''}`}>
                      <Icon name="caret-up" size={20} />
                    </span>
                  </button>
                  <div className={`${styles.sectionCollapsible} ${expandedSections['pins-section'] !== false ? styles.sectionCollapsibleOpen : ''}`}>
                    <div className={styles.sectionCollapsibleInner}>
                      {pinnedItems.map((item) => (
                        <NavMenuItem
                          key={`pin-${item.id}`}
                          item={item}
                          isActive={activeItem === item.id}
                          onClick={() => handleItemClick(item.id)}
                          isPinned={true}
                          canPin={true}
                          onTogglePin={() => onTogglePin(item.id)}
                          hasL2={!!l2NavMap[item.id]}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sections with pinned items filtered out */}
              {navigationData.map((entry) => {
                if (!isSection(entry)) return null;

                const unpinnedItems = entry.items.filter((item) => !pinnedSet.has(item.id));
                if (unpinnedItems.length === 0) return null;

                return (
                  <NavSectionGroup
                    key={entry.id}
                    section={{ ...entry, items: unpinnedItems }}
                    activeItem={activeItem}
                    onItemClick={handleItemClick}
                    isExpanded={expandedSections[entry.id] !== false}
                    onToggle={() => onToggleSection(entry.id)}
                    pinnedSet={pinnedSet}
                    onTogglePin={onTogglePin}
                  />
                );
              })}
            </div>
          </div>

          {/* L2 nav pane (mobile only) */}
          <div className={`${styles.slidePane} ${styles.slidePaneSecond} ${mobileL2Target ? styles.slidePaneIn : ''}`}>
            {l2Data && (
              <div className={styles.l2MenuContent}>
                <button className={styles.backButton} onClick={handleBackToMain}>
                  <Icon name="arrow-left" size={20} />
                  <span className={styles.backLabel}>Main menu</span>
                </button>
                <div className={styles.l2Items}>
                  {l2Data.data.map((item) => (
                    <MobileL2Item
                      key={item.id}
                      item={item}
                      onItemClick={handleL2SubItemClick}
                      isExpanded={!!l2Expanded[item.id]}
                      onToggleExpand={() => toggleL2Expanded(item.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}

function NavHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.header}>
      <button className={styles.closeButton} onClick={onClose} aria-label="Close navigation">
        <Icon name="close" size={24} />
      </button>
      <div className={styles.headerLogo}>
        <Icon name="fastly-logo" size={24} />
      </div>
      <div className={styles.headerSeparator} />
      <span className={styles.headerCompany}>Acme Co.</span>
    </div>
  );
}

interface NavSectionGroupProps {
  section: NavSection;
  activeItem: string;
  onItemClick: (id: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
  pinnedSet: Set<string>;
  onTogglePin: (itemId: string) => void;
}

function NavSectionGroup({ section, activeItem, onItemClick, isExpanded, onToggle, pinnedSet, onTogglePin }: NavSectionGroupProps) {
  return (
    <div className={styles.section}>
      <button className={styles.sectionHeader} onClick={onToggle}>
        <span className={styles.sectionLabel}>{section.label}</span>
        <span className={`${styles.sectionChevron} ${isExpanded ? styles.sectionChevronOpen : ''}`}>
          <Icon name="caret-up" size={20} />
        </span>
      </button>
      <div className={`${styles.sectionCollapsible} ${isExpanded ? styles.sectionCollapsibleOpen : ''}`}>
        <div className={styles.sectionCollapsibleInner}>
          {section.items.map((item) => (
            <NavMenuItem
              key={item.id}
              item={item}
              isActive={activeItem === item.id}
              onClick={() => onItemClick(item.id)}
              isPinned={pinnedSet.has(item.id)}
              canPin={true}
              onTogglePin={() => onTogglePin(item.id)}
              hasL2={!!l2NavMap[item.id]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface NavMenuItemProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
  isPinned: boolean;
  canPin: boolean;
  onTogglePin: () => void;
  hasL2?: boolean;
}

function NavMenuItem({ item, isActive, onClick, isPinned, canPin, onTogglePin, hasL2 }: NavMenuItemProps) {
  return (
    <div className={styles.menuItemWrapper}>
      <button
        className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}
        onClick={onClick}
      >
        <Icon
          name={item.icon}
          size={20}
          style={{ color: isActive ? 'var(--text-action)' : 'var(--text-primary)' }}
        />
        <span className={`${styles.menuItemLabel} ${isActive ? styles.menuItemLabelActive : ''}`}>
          {item.label}
        </span>
        {hasL2 && (
          <span className={styles.l2Arrow}>
            <Icon name="chevron-right" size={20} />
          </span>
        )}
        {canPin && !hasL2 && (
          <span
            className={`${styles.pinButton} ${isPinned ? styles.pinButtonVisible : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
            role="button"
            aria-label={isPinned ? 'Unpin' : 'Pin'}
          >
            <Icon name={isPinned ? 'pin-filled' : 'pin-outline'} size={20} />
          </span>
        )}
      </button>
    </div>
  );
}

interface MobileL2ItemProps {
  item: L2NavItem;
  onItemClick: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function MobileL2Item({ item, onItemClick, isExpanded, onToggleExpand }: MobileL2ItemProps) {
  const hasChildren = !!item.children?.length;

  if (hasChildren) {
    return (
      <div className={styles.l2ItemGroup}>
        <div className={styles.l2ItemExpandable}>
          <button
            className={styles.l2ItemButton}
            onClick={() => { if (!isExpanded) onToggleExpand(); onItemClick(item.children![0].id); }}
          >
            <Icon name={item.icon} size={20} />
            <span className={styles.l2ItemLabel}>{item.label}</span>
          </button>
          <button
            className={`${styles.l2Chevron} ${isExpanded ? '' : styles.l2ChevronCollapsed}`}
            onClick={onToggleExpand}
          >
            <Icon name="chevron-down" size={20} />
          </button>
        </div>
        <div className={`${styles.l2Children} ${isExpanded ? styles.l2ChildrenOpen : ''}`}>
          <div className={styles.l2ChildrenInner}>
            {item.children!.map((child) => (
              <button
                key={child.id}
                className={styles.l2ChildItem}
                onClick={() => onItemClick(child.id)}
              >
                {child.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      className={styles.l2ItemButton}
      onClick={() => onItemClick(item.id)}
    >
      <Icon name={item.icon} size={20} />
      <span className={styles.l2ItemLabel}>{item.label}</span>
    </button>
  );
}
