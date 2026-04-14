export interface ServiceConfig {
  type: 'Production' | 'Staging' | 'Draft' | 'Locked';
  version?: string;
}

export interface Service {
  name: string;
  id: string;
  configs: ServiceConfig[];
  rps: number;
  date: string;
  sparkline: number[] | null;
}

export const services: Service[] = [
  { name: 'Maple 1', id: 'h8H89gG78H89g8G8G8gH9', configs: [{ type: 'Production', version: '999,999' }, { type: 'Staging', version: '90' }], rps: 14342, date: '2025-09-21', sparkline: [40, 35, 42, 38, 50, 45, 55, 48, 52, 58, 55, 60, 62, 58, 65, 60, 58, 62, 68, 65] },
  { name: 'Unnamed service 14', id: 'j9J90hH79J9h9H9H9hJ0', configs: [{ type: 'Production', version: '91' }, { type: 'Staging', version: '92' }], rps: 11459, date: '2025-09-22', sparkline: [30, 32, 28, 35, 33, 38, 40, 37, 42, 45, 43, 47, 50, 48, 52, 50, 55, 53, 58, 56] },
  { name: 'Atlas', id: 'k0K01iI80K0i0I0I0iK1', configs: [{ type: 'Production', version: '93' }], rps: 9875, date: '2025-09-23', sparkline: [25, 28, 30, 27, 32, 35, 33, 38, 40, 36, 42, 38, 45, 43, 47, 45, 50, 48, 52, 50] },
  { name: 'Fast GTM', id: 'g7G7898H89G8giuhiugGUYG', configs: [{ type: 'Production', version: '87' }], rps: 6891, date: '2025-09-20', sparkline: [20, 22, 25, 23, 28, 30, 26, 32, 30, 35, 33, 38, 36, 40, 38, 42, 40, 44, 42, 45] },
  { name: 'Staging', id: 'l1L12jJ81L1j1J1J1jL2', configs: [{ type: 'Draft', version: '1' }], rps: 5124, date: '2025-09-24', sparkline: [15, 18, 22, 20, 25, 23, 28, 26, 30, 28, 32, 30, 35, 33, 38, 40, 36, 42, 38, 35] },
  { name: 'auth0 test', id: 'm2M23kK82M2k2K2K2kM3', configs: [{ type: 'Production', version: '97' }, { type: 'Staging', version: '98' }], rps: 4234, date: '2025-09-25', sparkline: [10, 12, 15, 13, 18, 20, 16, 22, 20, 25, 23, 28, 26, 30, 28, 32, 30, 35, 33, 35] },
  { name: 'A/B test login', id: 'n3N34lL83N3l3L3L3lN4', configs: [{ type: 'Production', version: '99' }, { type: 'Staging', version: '100' }], rps: 678, date: '2025-09-26', sparkline: [5, 8, 10, 6, 12, 10, 15, 13, 18, 16, 20, 18, 22, 25, 20, 28, 23, 30, 26, 30] },
  { name: 'www.fastly.com', id: 'p5P56nN85P5n5N5N5nP6', configs: [{ type: 'Locked' }], rps: 0, date: '2025-09-28', sparkline: null },
  { name: 'Edge browser ID', id: 'q6Q67oO86Q6o6O6O6oQ7', configs: [{ type: 'Draft', version: '1' }], rps: 0, date: '2025-09-29', sparkline: null },
  { name: 'www.manage.fastly.com', id: 'o4O45mM84O4m4M4M4mO5', configs: [{ type: 'Draft', version: '1' }], rps: 0, date: '2025-09-27', sparkline: null },
];
