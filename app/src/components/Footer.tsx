import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.links}>
        <a href="#" className={styles.link}>Fastly Terms of Service</a>
        <span className={styles.divider}>|</span>
        <a href="#" className={styles.link}>Privacy policy</a>
        <span className={styles.divider}>|</span>
        <a href="#" className={styles.link}>Fastly status</a>
        <span className={styles.divider}>|</span>
        <a href="#" className={styles.link}>Give feedback</a>
      </div>
      <p className={styles.copyright}>
        Copyright &copy; 2026 Fastly Inc. All Rights Reserved.
      </p>
    </footer>
  );
}
