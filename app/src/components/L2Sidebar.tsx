import { useState, useCallback } from 'react';
import { Icon } from './Icon';
import type { L2NavItem } from '../data/observabilityNav';
import styles from './L2Sidebar.module.css';

interface L2SidebarProps {
  title: string;
  icon: string;
  navData: L2NavItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
  defaultExpanded?: Record<string, boolean>;
}

export function L2Sidebar({ title, icon, navData, activeItem, onItemClick, defaultExpanded = {} }: L2SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(defaultExpanded);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
    setIsHovered(false);
  }, []);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Auto-expand parent when navigating to a child
  const handleItemClick = useCallback((id: string) => {
    for (const item of navData) {
      if (item.children?.some(child => child.id === id)) {
        setExpandedItems((prev) => ({ ...prev, [item.id]: true }));
        break;
      }
    }
    onItemClick(id);
  }, [navData, onItemClick]);

  return (
    <div
      className={styles.sidebarContainer}
      onMouseEnter={() => { if (isCollapsed) setIsHovered(true); }}
      onMouseLeave={() => { if (isCollapsed) setIsHovered(false); }}
    >
      {/* Main sidebar (animates width) */}
      <div className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
        {/* Expanded view (hidden via overflow when collapsed) */}
        {!isCollapsed && (
          <>
            <div className={styles.header}>
              <Icon name={icon} size={24} />
              <span className={styles.headerTitle}>{title}</span>
            </div>
            <div className={styles.menuContent}>
              <ExpandedMenuItems
                navData={navData}
                activeItem={activeItem}
                onItemClick={handleItemClick}
                expandedItems={expandedItems}
                onToggleExpand={toggleExpanded}
                collapseSubItems={false}
              />
            </div>
            <button className={styles.trigger} onClick={toggleCollapse}>
              <span className={styles.triggerIcon}>
                <Icon name="collapse-menu" size={20} />
              </span>
              <span className={styles.triggerLabel}>Collapse menu</span>
            </button>
          </>
        )}

        {/* Collapsed view (icon-only) */}
        {isCollapsed && (
          <>
            <div className={styles.header}>
              <Icon name={icon} size={24} />
            </div>
            <div className={styles.menuContent}>
              <div className={styles.collapsedItems}>
                {navData.map((item) => {
                  const isItemActive = activeItem === item.id || (item.children?.some(child => activeItem === child.id) ?? false);
                  return (
                    <div key={item.id} className={styles.collapsedItemWrapper}>
                      <button
                        className={`${styles.collapsedItem} ${isItemActive ? styles.collapsedItemActive : ''}`}
                        onClick={() => onItemClick(item.id)}
                      >
                        <Icon
                          name={item.icon}
                          size={20}
                          style={{ color: isItemActive ? 'var(--text-action)' : 'var(--text-primary)' }}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <button className={`${styles.trigger} ${styles.triggerCollapsed}`} onClick={toggleCollapse}>
              <span className={`${styles.triggerIcon} ${styles.triggerIconRotated}`}>
                <Icon name="collapse-menu" size={20} />
              </span>
            </button>
          </>
        )}
      </div>

      {/* Hover overlay (positioned absolute, overlays everything including footer) */}
      <div className={`${styles.hoverOverlay} ${isCollapsed && isHovered ? styles.hoverOverlayVisible : ''}`}>
        <div className={styles.header}>
          <Icon name={icon} size={24} />
          <span className={styles.headerTitle}>{title}</span>
        </div>
        <div className={styles.menuContent}>
          <ExpandedMenuItems
            navData={navData}
            activeItem={activeItem}
            onItemClick={onItemClick}
            expandedItems={expandedItems}
            onToggleExpand={toggleExpanded}
            collapseSubItems={false}
          />
        </div>
        <button className={styles.trigger} onClick={toggleCollapse}>
          <span className={`${styles.triggerIcon} ${styles.triggerIconRotated}`}>
            <Icon name="collapse-menu" size={20} />
          </span>
          <span className={styles.triggerLabel}>Expand menu</span>
        </button>
      </div>
    </div>
  );
}

/* Shared expanded menu items component */
interface ExpandedMenuItemsProps {
  navData: L2NavItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
  expandedItems: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  collapseSubItems: boolean;
}

function ExpandedMenuItems({ navData, activeItem, onItemClick, expandedItems, onToggleExpand, collapseSubItems }: ExpandedMenuItemsProps) {
  return (
    <div className={styles.menuItems}>
      {navData.map((item) => (
        <L2MenuItem
          key={item.id}
          item={item}
          activeItem={activeItem}
          onItemClick={onItemClick}
          isExpanded={!!expandedItems[item.id]}
          onToggleExpand={() => onToggleExpand(item.id)}
          collapseSubItems={collapseSubItems}
        />
      ))}
    </div>
  );
}

interface L2MenuItemProps {
  item: L2NavItem;
  activeItem: string;
  onItemClick: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  collapseSubItems: boolean;
}

function L2MenuItem({ item, activeItem, onItemClick, isExpanded, onToggleExpand, collapseSubItems }: L2MenuItemProps) {
  const isActive = activeItem === item.id;
  const hasChildren = !!item.children?.length;
  const hasActiveChild = hasChildren && item.children!.some(child => activeItem === child.id);

  if (hasChildren) {
    const showChildren = isExpanded && !collapseSubItems;
    const blockOpenClass = showChildren
      ? (hasActiveChild ? styles.expandableBlockOpenActive : styles.expandableBlockOpen)
      : '';
    const headerClass = [
      styles.expandableHeader,
      showChildren ? styles.expandableHeaderOpen : '',
      !showChildren && hasActiveChild ? styles.expandableHeaderActive : '',
    ].filter(Boolean).join(' ');

    const firstChildId = item.children![0].id;

    return (
      <div className={styles.expandableOuter}>
        <div className={`${styles.expandableBlock} ${blockOpenClass}`}>
          <div className={headerClass}>
            <button
              className={styles.expandableHeaderNav}
              onClick={() => { if (!isExpanded) onToggleExpand(); onItemClick(firstChildId); }}
            >
              <Icon
                name={item.icon}
                size={20}
                style={hasActiveChild ? { color: 'var(--text-action)' } : undefined}
              />
              <span className={styles.menuItemLabel}>{item.label}</span>
            </button>
            <button
              className={`${styles.chevronButton} ${showChildren ? '' : styles.chevronButtonCollapsed}`}
              onClick={onToggleExpand}
              aria-label={showChildren ? 'Collapse section' : 'Expand section'}
            >
              <Icon name="chevron-down" size={20} />
            </button>
          </div>
          <div className={`${styles.childrenCollapsible} ${showChildren ? styles.childrenCollapsibleOpen : ''}`}>
            <div className={styles.childrenInner}>
              {item.children?.map((child) => {
                const isChildActive = activeItem === child.id;
                return (
                  <button
                    key={child.id}
                    className={`${styles.childItem} ${isChildActive ? styles.childItemActive : ''}`}
                    onClick={() => onItemClick(child.id)}
                  >
                    {isChildActive && (
                      <span className={styles.childDot}>
                        <span className={styles.childDotInner} />
                      </span>
                    )}
                    <span className={`${styles.childLabel} ${isChildActive ? styles.childLabelActive : ''}`}>
                      {child.label}
                    </span>
                  </button>
                );
              })}
              <div className={styles.childBottomSpacer} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.menuItemOuter}>
      <button
        className={`${styles.menuItemSimple} ${isActive ? styles.menuItemActive : ''}`}
        onClick={() => onItemClick(item.id)}
      >
        <Icon
          name={item.icon}
          size={20}
          style={{ color: isActive ? 'var(--text-action)' : 'var(--text-primary)' }}
        />
        <span className={`${styles.menuItemLabel} ${isActive ? styles.menuItemLabelActive : ''}`}>
          {item.label}
        </span>
      </button>
    </div>
  );
}
