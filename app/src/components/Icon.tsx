import { useEffect, useState } from 'react';

// Map nav item IDs to actual SVG filenames in the icons folder
const iconFileMap: Record<string, string> = {
  // Navigation icons
  'home': '/icons/navigation/Home.svg',
  'home-filled': '/icons/navigation/Home Filled.svg',
  'observability': '/icons/navigation/Observability.svg',
  'observability-filled': '/icons/navigation/Observability Filled.svg',
  'domains': '/icons/navigation/Domains.svg',
  'tls-management': '/icons/navigation/TLS management.svg',
  'cdn': '/icons/navigation/CDN Services.svg',
  'compute': '/icons/navigation/Compute.svg',
  'next-gen-waf': '/icons/navigation/Next-gen WAF.svg',
  'ddos-protection': '/icons/navigation/DDoS mitigation.svg',
  'ddos-observer': '/icons/navigation/DDoS Observer.svg',
  'bot-management': '/icons/navigation/Bot protection.svg',
  'api-discovery': '/icons/navigation/API Discovery.svg',
  'client-side-protection': '/icons/navigation/Security.svg',
  'edge-rate-limiting': '/icons/navigation/Edge rate limiting.svg',
  'vcl-client-challenges': '/icons/navigation/VCL Client Challenges.svg',
  'config-stores': '/icons/navigation/Config stores.svg',
  'kv-stores': '/icons/navigation/KV stores.svg',
  'secret-stores': '/icons/navigation/Secret stores.svg',
  'object-storage': '/icons/navigation/Object storage.svg',
  'access-control-lists': '/icons/navigation/Access control lists.svg',
  'ai-accelerator': '/icons/navigation/AI Accelerator.svg',
  'dev-tools': '/icons/navigation/Dev tools.svg',
  'notifications': '/icons/navigation/Notifications.svg',
  'company-information': '/icons/navigation/Company settings.svg',
  'user-management': '/icons/navigation/User management.svg',
  'api-tokens': '/icons/navigation/Account tokens.svg',
  'audit-log': '/icons/navigation/Audit log.svg',
  'sustainability-dashboard': '/icons/navigation/Environmental impact.svg',
  'billing': '/icons/navigation/Billing.svg',
  'profile-security': '/icons/navigation/Personal Profile.svg',
  // L2 Observability nav icons
  'account-summary': '/icons/navigation/Account Summary.svg',
  'observability-services': '/icons/navigation/Observability Services.svg',
  'origins': '/icons/navigation/Origins.svg',
  'insights': '/icons/navigation/Insights.svg',
  'logs': '/icons/navigation/Logs.svg',
  'alerts': '/icons/navigation/Alerts.svg',
  'custom-dashboards': '/icons/navigation/Dashboards.svg',
  'billing-overview': '/icons/navigation/Billing.svg',
  'invoices': '/icons/navigation/Invoices.svg',
  'plan-usage': '/icons/navigation/Insights.svg',
  'month-to-date': '/icons/navigation/Month to date.svg',
  'spend-alerts': '/icons/navigation/Spend alert.svg',
  'billing-information': '/icons/navigation/Billing information.svg',
  'collapse-menu': '/icons/core/Collapse sidebar.svg',
  'pin-filled': '/icons/core/Pin filled.svg',
  'pin-outline': '/icons/core/Pin outline.svg',
  // Help menu icons
  'documentation': '/icons/navigation/Documentation.svg',
  'developer-hub': '/icons/navigation/Developer hub.svg',
  'community': '/icons/navigation/Learn.svg',
  'academy': '/icons/navigation/Learn.svg',
  'fastly-status': '/icons/navigation/Edge Observer.svg',
  'contact-sales': '/icons/navigation/Contact sales.svg',
  'support': '/icons/navigation/Support.svg',
  // Avatar menu icons
  'account-nav': '/icons/core/User.svg',
  'profile-nav': '/icons/navigation/Personal Profile.svg',
  'billing-nav': '/icons/navigation/Billing.svg',
  'switch-account': '/icons/navigation/Switch account.svg',
  'sign-out': '/icons/core/Log out.svg',
  'dark-mode': '/icons/navigation/Dark mode.svg',
  'light-mode': '/icons/navigation/Light mode.svg',
  'export': '/icons/core/Export.svg',
  'waffle': '/icons/core/Waffle.svg',
  'notifications-empty': '/icons/illustrations/Notifications empty.svg',
  // Core icons
  'add': '/icons/core/Add.svg',
  'check': '/icons/core/Check.svg',
  'edit': '/icons/core/Edit.svg',
  'edit-comment': '/icons/core/Edit comment.svg',
  'copy': '/icons/core/Copy.svg',
  'deactivate': '/icons/core/Minus Circle.svg',
  'trash': '/icons/core/Trash.svg',
  'more': '/icons/core/More.svg',
  'star': '/icons/core/Star.svg',
  'star-filled': '/icons/core/Star filled.svg',
  'view-condensed': '/icons/core/View condensed.svg',
  'view-expanded': '/icons/core/View expanded.svg', 
  'hamburger': '/icons/core/Hamburger.svg',
  'close': '/icons/core/Close.svg',
  'search': '/icons/core/Search.svg',
  'caret-down': '/icons/core/Caret Down.svg',
  'caret-up': '/icons/core/Caret Up.svg',
  'chevron-down': '/icons/core/Chevron down.svg',
  'chevron-up': '/icons/core/Chevron up.svg',
  'chevron-right': '/icons/core/Chevron right.svg',
  'chevron-left': '/icons/core/Chevron left.svg',
  'arrow-left': '/icons/core/Arrow left.svg',
  'arrow-up': '/icons/core/Arrow up.svg',
  'arrow-down': '/icons/core/Arrow down.svg',
  'move': '/icons/core/Move.svg',
  'info-filled': '/icons/core/Info filled.svg',
  'help': '/icons/core/Help.svg',
  'bell': '/icons/navigation/Notifications.svg',
  'calendar': '/icons/core/Calendar.svg',
  // Logo
  'fastly-logo': '/icons/logo/Fastly Logo.svg',
  // Product Lines
  'network-services-colorful': '/icons/product-lines/Network services Colorful.svg',
  'compute-colorful': '/icons/product-lines/Compute Colorful.svg',
  'security-colorful': '/icons/product-lines/Security Colorful.svg',
  'observability-colorful': '/icons/product-lines/Observability Colorful.svg',
  'platform': '/icons/product-lines/Platform.svg',
  'platform-colorful': '/icons/product-lines/Platform Colorful.svg',
  // Additional core icons
  'attention-filled': '/icons/core/Attention filled.svg',
  'attention': '/icons/core/Attention.svg',
  'show-vcl': '/icons/core/Show VCL.svg',
  'fullscreen': '/icons/core/Full screen.svg',
  'download': '/icons/core/Download.svg',
  'diff': '/icons/core/Diff.svg',
  'lock': '/icons/core/Blocking on.svg',
  'check-circle-filled': '/icons/core/Check circle filled.svg',
  //Illustrations
  'image-optimizer-illustration': '/icons/illustrations/Image Optimization.svg',
  'ddos-protection-illustration': '/icons/illustrations/Shield attack.svg',
  'devops-illustration': '/icons/illustrations/Devops.svg',
  'compatibility-2-illustration': '/icons/illustrations/Compatibility 2.svg',
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Icons that should preserve their original fill colors (e.g., branded logos)
const preserveColorIcons = new Set(['fastly-logo', 'security-colorful', 'notifications-empty', 'compute-colorful', 'network-services-colorful', 'image-optimizer-illustration', 'ddos-protection-illustration', 'platform-colorful', 'observability-colorful', 'cdn-colorful', 'next-gen-waf-colorful', 'ddos-protection-colorful', 'ddos-observer-colorful', 'bot-management-colorful', 'attention-filled', 'attention', 'devops-illustration', 'compatibility-2-illustration', 'info-filled']);

export function Icon({ name, size = 20, className, style }: IconProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);

  useEffect(() => {
    setSvgContent(null);
    const path = iconFileMap[name];
    if (!path) return;

    fetch(path, { cache: 'no-cache' })
      .then((res) => res.text())
      .then((text) => {
        // Remove width/height attributes and add 100% sizing so the SVG fills its container
        let processed = text
          .replace(/width="[^"]*"/, '')
          .replace(/height="[^"]*"/, '')
          .replace('<svg ', '<svg width="100%" height="100%" ');
        // Replace hardcoded fill colors with currentColor for dynamic coloring
        // (unless this is a preserved-color icon like the Fastly logo)
        if (!preserveColorIcons.has(name)) {
          processed = processed.replace(/fill="#[0-9A-Fa-f]{6}"/g, 'fill="currentColor"');
          processed = processed.replace(/fill="#[0-9A-Fa-f]{3}"/g, 'fill="currentColor"');
        } else if (name === 'fastly-logo') {
          // Only the Fastly logo gets brand red
          processed = processed.replace(/fill="#3A424A"/gi, 'fill="var(--color-brand-fastly)"');
        }
        // All other preserveColorIcons keep their original fills untouched
        setSvgContent(processed);
      })
      .catch(() => setSvgContent(null));
  }, [name]);

  if (!svgContent) {
    return <span className={className} style={{ display: 'inline-block', width: size, height: size, ...style }} />;
  }

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
