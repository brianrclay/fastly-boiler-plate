export interface L2NavItem {
  id: string;
  label: string;
  icon: string;
  children?: { id: string; label: string }[];
}

export const billingNavData: L2NavItem[] = [
  { id: 'billing-overview', label: 'Billing overview', icon: 'billing-overview' },
  { id: 'invoices', label: 'Invoices', icon: 'invoices' },
  { id: 'plan-usage', label: 'Plan usage', icon: 'plan-usage' },
  { id: 'month-to-date', label: 'Month-to-date', icon: 'month-to-date' },
  { id: 'spend-alerts', label: 'Spend alerts', icon: 'spend-alerts' },
  { id: 'billing-information', label: 'Billing information', icon: 'billing-information' },
];
