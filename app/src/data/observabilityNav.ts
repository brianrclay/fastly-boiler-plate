export interface L2NavItem {
  id: string;
  label: string;
  icon: string;
  children?: { id: string; label: string }[];
}

export const observabilityNavData: L2NavItem[] = [
  { id: 'account-summary', label: 'Account Summary', icon: 'account-summary' },
  {
    id: 'services',
    label: 'Services',
    icon: 'observability-services',
    children: [
      { id: 'service-overview', label: 'Service overview' },
      { id: 'all-services', label: 'All services' },
    ],
  },
  { id: 'obs-domains', label: 'Domains', icon: 'domains' },
  { id: 'origins', label: 'Origins', icon: 'origins' },
  { id: 'insights', label: 'Insights', icon: 'insights' },
  {
    id: 'logs',
    label: 'Logs',
    icon: 'logs',
    children: [
      { id: 'explorer', label: 'Explorer' },
      { id: 'tailing', label: 'Tailing' },
    ],
  },
  {
    id: 'alerts',
    label: 'Alerts',
    icon: 'alerts',
    children: [
      { id: 'alerts-overview', label: 'Overview' },
      { id: 'definitions', label: 'Definitions' },
      { id: 'integrations', label: 'Integrations' },
    ],
  },
  { id: 'custom-dashboards', label: 'Custom Dashboards', icon: 'custom-dashboards' },
];
