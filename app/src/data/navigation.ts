export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

export type NavEntry = NavItem | NavSection;

export const navigationData: NavEntry[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'observability', label: 'Observability', icon: 'observability' },
  {
    id: 'domains-section',
    label: 'Domains',
    items: [
      { id: 'domains', label: 'Domains', icon: 'domains' },
      { id: 'tls-management', label: 'TLS Management', icon: 'tls-management' },
      { id: 'dns-management', label: 'DNS Management', icon: 'domains' },
    ],
  },
  {
    id: 'services-section',
    label: 'Services',
    items: [
      { id: 'cdn', label: 'CDN', icon: 'cdn' },
      { id: 'compute', label: 'Compute', icon: 'compute' },
    ],
  },
  {
    id: 'security-section',
    label: 'Security',
    items: [
      { id: 'next-gen-waf', label: 'Next-Gen WAF', icon: 'next-gen-waf' },
      { id: 'ddos-protection', label: 'DDoS Protection', icon: 'ddos-protection' },
      { id: 'ddos-observer', label: 'DDoS Observer', icon: 'ddos-observer' },
      { id: 'bot-management', label: 'Bot Management', icon: 'bot-management' },
      { id: 'api-discovery', label: 'API Discovery', icon: 'api-discovery' },
      { id: 'client-side-protection', label: 'Client-side protection', icon: 'client-side-protection' },
      { id: 'edge-rate-limiting', label: 'Edge rate limiting', icon: 'edge-rate-limiting' },
      { id: 'vcl-client-challenges', label: 'VCL client challenges', icon: 'vcl-client-challenges' },
    ],
  },
  {
    id: 'resources-section',
    label: 'Resources',
    items: [
      { id: 'config-stores', label: 'Config Stores', icon: 'config-stores' },
      { id: 'kv-stores', label: 'KV Stores', icon: 'kv-stores' },
      { id: 'secret-stores', label: 'Secret Stores', icon: 'secret-stores' },
      { id: 'object-storage', label: 'Object Storage', icon: 'object-storage' },
      { id: 'access-control-lists', label: 'Access Control Lists', icon: 'access-control-lists' },
    ],
  },
  {
    id: 'tools-section',
    label: 'Tools',
    items: [
      { id: 'ai-accelerator', label: 'AI Accelerator', icon: 'ai-accelerator' },
      { id: 'dev-tools', label: 'Dev Tools', icon: 'dev-tools' },
    ],
  },
  {
    id: 'account-section',
    label: 'Account',
    items: [
      { id: 'notifications', label: 'Notifications', icon: 'notifications' },
      { id: 'company-information', label: 'Company information', icon: 'company-information' },
      { id: 'user-management', label: 'User management', icon: 'user-management' },
      { id: 'api-tokens', label: 'API Tokens', icon: 'api-tokens' },
      { id: 'audit-log', label: 'Audit log', icon: 'audit-log' },
      { id: 'sustainability-dashboard', label: 'Sustainability dashboard', icon: 'sustainability-dashboard' },
      { id: 'billing', label: 'Billing', icon: 'billing' },
      { id: 'profile-security', label: 'Profile & Security', icon: 'profile-security' },
    ],
  },
];

export function isSection(entry: NavEntry): entry is NavSection {
  return 'items' in entry;
}
