export type BusinessType = 'RETAIL' | 'SERVICES' | 'FLORIST' | 'ELECTRONICS';

export const tenantContext = {
  tenantName: 'Comercial La Estrella',
  tenantSlug: 'comercial-estrella',
  businessType: 'RETAIL' as BusinessType,
  plan: 'Growth',
  city: 'Managua, Nicaragua',
};

export const businessTypeLabels: Record<BusinessType, string> = {
  RETAIL: 'Retail',
  SERVICES: 'Servicios',
  FLORIST: 'Floristería',
  ELECTRONICS: 'Electrónica',
};

export const summaryKpis = [
  { label: 'Ventas del mes', value: 'C$ 182,450', trend: '+12.4%', tone: 'positive' },
  { label: 'Facturas emitidas', value: '268', trend: '+18', tone: 'positive' },
  { label: 'Clientes activos', value: '1,024', trend: '+5.1%', tone: 'positive' },
  { label: 'Tickets soporte', value: '3 abiertos', trend: '2 críticos', tone: 'warning' },
] as const;

export const inventoryAlerts = [
  { name: 'Arroz 80/20 25lb', stock: 4, min: 10 },
  { name: 'Aceite 900ml', stock: 7, min: 15 },
  { name: 'Azúcar 1kg', stock: 5, min: 12 },
];

export const recentInvoices = [
  { number: 'INV-1028', customer: 'Ferretería López', total: 'C$ 8,930', status: 'Pagada' },
  { number: 'INV-1027', customer: 'María Campos', total: 'C$ 2,180', status: 'Pendiente' },
  { number: 'INV-1026', customer: 'Restaurante El Patio', total: 'C$ 5,760', status: 'Vencida' },
  { number: 'INV-1025', customer: 'Taller Álvarez', total: 'C$ 3,420', status: 'Pagada' },
];

export const revenueSeries = [
  { label: 'Sem 1', value: 32500 },
  { label: 'Sem 2', value: 44200 },
  { label: 'Sem 3', value: 48600 },
  { label: 'Sem 4', value: 57150 },
];

export const recentActivity = [
  {
    type: 'invoice',
    icon: '🧾',
    title: 'Invoice INV-1031 paid',
    detail: 'Distribuidora Norte · C$ 14,200 acreditados a caja principal',
    time: '12 min',
  },
  {
    type: 'customer',
    icon: '👤',
    title: 'New customer registered',
    detail: 'Librería San Lucas · segmento minorista',
    time: '36 min',
  },
  {
    type: 'inventory',
    icon: '⚠',
    title: 'Inventory low for product',
    detail: 'Aceite 900ml cayó por debajo de stock mínimo (7/15)',
    time: '58 min',
  },
  {
    type: 'support',
    icon: '💬',
    title: 'Support ticket opened',
    detail: 'Integración de impresora fiscal · prioridad media',
    time: '1h 25m',
  },
  {
    type: 'order',
    icon: '📦',
    title: 'Large order detected',
    detail: 'Pedido mayorista C$ 32,900 · cliente B2B',
    time: '2h 04m',
  },
] as const;

export const businessInsights = [
  {
    title: 'Sales increased vs last week',
    text: 'Las ventas crecieron 14% respecto a la semana anterior, impulsadas por consumo rápido y ticket medio más alto.',
    tag: 'Growth Signal',
    confidence: 'Alta confianza · 92%',
  },
  {
    title: 'Customers at risk of churn',
    text: '14 clientes de alto valor no compran hace más de 45 días; se recomienda campaña de retención en 48h.',
    tag: 'Retention Risk',
    confidence: 'Media-alta · 81%',
  },
  {
    title: 'Inventory risk prediction',
    text: '3 SKU podrían agotarse en menos de 72 horas según salida promedio y pedidos pendientes.',
    tag: 'Inventory Forecast',
    confidence: 'Alta · 89%',
  },
  {
    title: 'Unusual sales activity detected',
    text: 'Incremento atípico de compras B2B entre 8:00 y 10:00 AM, potencial señal de demanda mayorista.',
    tag: 'Anomaly',
    confidence: 'Media · 74%',
  },
] as const;
