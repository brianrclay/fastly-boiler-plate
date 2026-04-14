import { createTheme } from '@mantine/core';

/**
 * Mantine theme configured with Fastly Uniform design tokens (aspen theme).
 * CSS custom properties are defined in styles/tokens.css.
 */
export const theme = createTheme({
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fontFamilyMonospace: "'IBMPlexMono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
  primaryColor: 'blue',
  radius: {
    xs: '0px',
    sm: '0.125rem',   /* --LAYOUT--border-radius--sm */
    md: '0.25rem',    /* --LAYOUT--border-radius--md */
    lg: '0.5rem',     /* --LAYOUT--border-radius--lg */
    xl: '1rem',       /* --LAYOUT--border-radius--xl */
  },
  spacing: {
    xs: '0.25rem',    /* --LAYOUT--spacing--2 */
    sm: '0.5rem',     /* --LAYOUT--spacing--3 */
    md: '1rem',       /* --LAYOUT--spacing--5 */
    lg: '1.5rem',     /* --LAYOUT--spacing--6 */
    xl: '2rem',       /* --LAYOUT--spacing--7 */
  },
});
