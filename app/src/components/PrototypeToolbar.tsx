import { useState } from 'react';
import { usePrototype, roles } from '../context/PrototypeContext';
import type { RoleId } from '../context/PrototypeContext';
import styles from './PrototypeToolbar.module.css';

export function PrototypeToolbar() {
  const { role, setRole, isBrandNew, setIsBrandNew } = usePrototype();
  const [roleOpen, setRoleOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  const currentRole = roles.find((r) => r.id === role);

  return (
    <div className={styles.toolbar}>
      <span className={styles.label}>Prototype Controls</span>
      <div className={styles.sep} />

      <div className={styles.control}>
        <span className={styles.controlLabel}>Role:</span>
        <div className={styles.dropdownWrap}>
          <button className={styles.dropdownBtn} onClick={() => setRoleOpen(!roleOpen)}>
            {currentRole?.label || 'Superuser'}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          {roleOpen && (
            <div className={styles.dropdown}>
              {roles.map((r) => (
                <button
                  key={r.id}
                  className={`${styles.dropdownItem} ${r.id === role ? styles.dropdownItemActive : ''}`}
                  onClick={() => { setRole(r.id as RoleId); setRoleOpen(false); }}
                >
                  <span className={styles.dropdownItemLabel}>{r.label}</span>
                  <span className={styles.dropdownItemDesc}>{r.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.sep} />

      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={isBrandNew}
          onChange={(e) => setIsBrandNew(e.target.checked)}
          className={styles.toggleInput}
        />
        <span className={`${styles.toggleTrack} ${isBrandNew ? styles.toggleTrackOn : ''}`}>
          <span className={styles.toggleThumb} />
        </span>
        <span className={styles.controlLabel}>Brand new user</span>
      </label>

      <div className={styles.spacer} />
      <button className={styles.hideBtn} onClick={() => setHidden(true)}>Hide</button>
    </div>
  );
}
