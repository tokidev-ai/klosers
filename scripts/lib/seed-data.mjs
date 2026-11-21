// Sample data for local development, in Spanish, typed against the shared data model
// (`shared/src`). `npm run typecheck` checks every record below against those types.
// Every document has a fixed ID, so seeding twice gives the same result.

/** @typedef {import('@klosers/shared').AppSettings} AppSettings */
/** @typedef {import('@klosers/shared').Availability} Availability */
/** @typedef {import('@klosers/shared').Client} Client */
/** @typedef {import('@klosers/shared').Service} Service */
/** @typedef {import('@klosers/shared').Team} Team */
/** @typedef {import('@klosers/shared').UserProfile} UserProfile */
/** @typedef {import('@klosers/shared').WeeklyHours} WeeklyHours */

export const SEED_PASSWORD = 'klosers-local-123';

const DAY = 24 * 60 * 60 * 1000;

/**
 * Today's date in La Paz (UTC-4, no daylight saving), as YYYY-MM-DD.
 * @param {Date} [now]
 */
export const laPazDate = (now = new Date()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

const todayAt10LaPaz = new Date(`${laPazDate()}T14:00:00Z`);

/**
 * A date relative to today at 10:00 La Paz time, so overdue and today's follow-ups stay meaningful.
 * @param {number} n
 */
export const daysFromToday = (n) => new Date(todayAt10LaPaz.getTime() + n * DAY);

/** @param {string} iso */
const fixedDate = (iso) => new Date(`${iso}T14:00:00Z`);

/** @type {AppSettings} */
export const settings = {
  companyName: 'Klosers',
  currency: 'Bs',
  exchangeRate: 6.96,
  timezone: 'America/La_Paz',
  pipelineStages: [
    { id: 'new', name: 'Nuevo', color: '#eceff1', order: 1, kind: 'open' },
    { id: 'contacted', name: 'Contactado', color: '#e1f5fe', order: 2, kind: 'open' },
    { id: 'qualified', name: 'Calificado', color: '#e3f2fd', order: 3, kind: 'open' },
    { id: 'proposal', name: 'Propuesta', color: '#f3e5f5', order: 4, kind: 'open' },
    { id: 'negotiation', name: 'Negociación', color: '#fff3e0', order: 5, kind: 'open' },
    { id: 'won', name: 'Ganado', color: '#e8f5e9', order: 6, kind: 'won' },
    { id: 'lost', name: 'Perdido', color: '#ffebee', order: 7, kind: 'lost' },
  ],
  lossReasons: [
    'Precio',
    'Eligió a la competencia',
    'Sin presupuesto',
    'Sin respuesta',
    'No es el perfil',
    'Mal momento',
    'Otro',
  ],
  bookingRules: { minNoticeHours: 24, maxDaysAhead: 30, bufferMinutes: 10 },
};

/** @type {Array<{ id: string } & Omit<Team, 'memberCount'>>} */
export const teams = [
  { id: 'corporativo', name: 'Corporativo', leadUid: 'seed-lead-camila' },
  { id: 'pymes', name: 'Pymes', leadUid: 'seed-lead-valentina' },
];

/**
 * Roles are admin, team_lead and member, shown as Administrador, Líder de equipo and Vendedor.
 * @type {Array<{ uid: string } & Pick<UserProfile, 'displayName' | 'email' | 'role' | 'teamIds' | 'primaryTeamId'>>}
 */
export const users = [
  {
    uid: 'seed-admin',
    displayName: 'Rafael Montaño',
    email: 'admin@klosers.test',
    role: 'admin',
    teamIds: [],
    primaryTeamId: null,
  },
  {
    uid: 'seed-lead-camila',
    displayName: 'Camila Flores',
    email: 'camila.flores@klosers.test',
    role: 'team_lead',
    teamIds: ['corporativo'],
    primaryTeamId: 'corporativo',
  },
  {
    uid: 'seed-lead-valentina',
    displayName: 'Valentina Cruz',
    email: 'valentina.cruz@klosers.test',
    role: 'team_lead',
    teamIds: ['pymes'],
    primaryTeamId: 'pymes',
  },
  {
    uid: 'seed-member-sofia',
    displayName: 'Sofía Rojas',
    email: 'sofia.rojas@klosers.test',
    role: 'member',
    teamIds: ['corporativo'],
    primaryTeamId: 'corporativo',
  },
  // Sells in both teams with one account; bookings without a service go to her primary team.
  {
    uid: 'seed-member-mariana',
    displayName: 'Mariana Vaca',
    email: 'mariana.vaca@klosers.test',
    role: 'member',
    teamIds: ['corporativo', 'pymes'],
    primaryTeamId: 'pymes',
  },
];

/**
 * Each service belongs to exactly one team.
 * @type {Array<{ id: string } & Omit<Service, 'materialUrls'>>}
 */
export const services = [
  {
    id: 'svc-desarrollo-web',
    teamId: 'corporativo',
    name: 'Desarrollo web',
    description: 'Sitio web con formularios de contacto y estadísticas.',
    priceMin: 4000,
    priceMax: 18000,
    currency: '$us',
    category: 'Desarrollo',
    active: true,
  },
  {
    id: 'svc-tienda-en-linea',
    teamId: 'corporativo',
    name: 'Tienda en línea',
    description: 'Catálogo, pagos y correos de pedido.',
    priceMin: 6500,
    priceMax: 25000,
    currency: '$us',
    category: 'Desarrollo',
    active: true,
  },
  {
    id: 'svc-identidad-marca',
    teamId: 'corporativo',
    name: 'Identidad de marca',
    description: 'Logo, colores, tipografía y una guía corta.',
    priceMin: 10500,
    priceMax: 34800,
    currency: 'Bs',
    category: 'Diseño',
    active: false,
  },
  {
    id: 'svc-seo-mensual',
    teamId: 'pymes',
    name: 'SEO mensual',
    description: 'Posicionamiento en buscadores con reporte mensual.',
    priceMin: 4200,
    priceMax: 8400,
    currency: 'Bs',
    category: 'Marketing',
    active: true,
  },
  {
    id: 'svc-publicidad',
    teamId: 'pymes',
    name: 'Gestión de publicidad',
    description: 'Campañas en Google y Meta, revisadas cada semana.',
    priceMin: 2800,
    priceMax: 2800,
    currency: 'Bs',
    category: 'Marketing',
    active: true,
  },
];

/**
 * @typedef {Omit<Client, 'country' | 'nextFollowUpAt' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'searchTokens'>
 *   & { id: string, nextFollowUpAt: Date | null, createdAt: Date }} SeedClient
 */

/** @type {SeedClient[]} */
export const clients = [
  {
    id: 'cli-andes-logistica',
    companyName: 'Andes Logística',
    contactName: 'Marco Quiroga',
    email: 'marco@andeslogistica.example',
    phone: '+591 4 452 1180',
    website: 'https://andeslogistica.example',
    instagram: 'andeslogistica',
    industry: 'Logística',
    city: 'Cochabamba',
    stage: 'proposal',
    ownerUid: 'seed-member-sofia',
    teamId: 'corporativo',
    serviceIds: ['svc-desarrollo-web'],
    estimatedValue: 12000,
    closedValue: null,
    valueCurrency: '$us',
    lossReason: null,
    source: 'booking',
    tags: ['B2B'],
    nextFollowUpAt: daysFromToday(-3),
    createdAt: fixedDate('2026-11-03'),
  },
  {
    id: 'cli-lumbreras-cafe',
    companyName: 'Lumbreras Café',
    contactName: 'Ana Lumbreras',
    email: 'ana@lumbreras.example',
    phone: '+591 4 452 7710',
    website: 'https://lumbreras.example',
    instagram: 'lumbrerascafe',
    industry: 'Gastronomía',
    city: 'Cochabamba',
    stage: 'contacted',
    ownerUid: 'seed-member-sofia',
    teamId: 'corporativo',
    serviceIds: ['svc-desarrollo-web'],
    estimatedValue: 5000,
    closedValue: null,
    valueCurrency: '$us',
    lossReason: null,
    source: 'booking',
    tags: [],
    nextFollowUpAt: daysFromToday(0),
    createdAt: fixedDate('2026-11-10'),
  },
  {
    id: 'cli-hotel-mirador',
    companyName: 'Hotel Mirador',
    contactName: 'Carla Antezana',
    email: 'carla@hotelmirador.example',
    phone: '+591 2 241 3390',
    website: 'https://hotelmirador.example',
    instagram: null,
    industry: 'Hotelería',
    city: 'La Paz',
    stage: 'negotiation',
    ownerUid: 'seed-lead-camila',
    teamId: 'corporativo',
    serviceIds: ['svc-tienda-en-linea'],
    estimatedValue: 15000,
    closedValue: null,
    valueCurrency: '$us',
    lossReason: null,
    source: 'manual',
    tags: ['Prioridad'],
    nextFollowUpAt: daysFromToday(4),
    createdAt: fixedDate('2026-10-21'),
  },
  {
    id: 'cli-estudio-kallpa',
    companyName: 'Estudio Kallpa',
    contactName: 'Rocío Mamani',
    email: 'rocio@kallpa.example',
    phone: '+591 2 279 4410',
    website: 'https://kallpa.example',
    instagram: 'estudiokallpa',
    industry: 'Arquitectura',
    city: 'La Paz',
    stage: 'won',
    ownerUid: 'seed-member-sofia',
    teamId: 'corporativo',
    serviceIds: ['svc-desarrollo-web'],
    estimatedValue: 9000,
    closedValue: 8500,
    valueCurrency: '$us',
    lossReason: null,
    source: 'import',
    tags: [],
    nextFollowUpAt: null,
    createdAt: fixedDate('2026-09-15'),
  },
  {
    id: 'cli-cafe-botanico',
    companyName: 'Café Botánico',
    contactName: 'Valeria Soto',
    email: 'valeria@cafebotanico.example',
    phone: '+591 3 336 2245',
    website: 'https://cafebotanico.example',
    instagram: 'cafebotanico',
    industry: 'Gastronomía',
    city: 'Santa Cruz',
    stage: 'qualified',
    ownerUid: 'seed-member-mariana',
    teamId: 'pymes',
    serviceIds: ['svc-seo-mensual'],
    estimatedValue: 6300,
    closedValue: null,
    valueCurrency: 'Bs',
    lossReason: null,
    source: 'scraper',
    tags: [],
    nextFollowUpAt: daysFromToday(-1),
    createdAt: fixedDate('2026-11-12'),
  },
  {
    id: 'cli-ferreteria-el-puente',
    companyName: 'Ferretería El Puente',
    contactName: 'Jorge Méndez',
    email: 'jorge@elpuente.example',
    phone: '+591 3 344 9012',
    website: null,
    instagram: null,
    industry: 'Comercio',
    city: 'Santa Cruz',
    stage: 'new',
    ownerUid: 'seed-member-mariana',
    teamId: 'pymes',
    serviceIds: ['svc-publicidad'],
    estimatedValue: 2800,
    closedValue: null,
    valueCurrency: 'Bs',
    lossReason: null,
    source: 'manual',
    tags: [],
    nextFollowUpAt: daysFromToday(3),
    createdAt: fixedDate('2026-11-18'),
  },
  {
    id: 'cli-clinica-tunari',
    companyName: 'Clínica Tunari',
    contactName: 'Lucía Paz',
    email: 'lucia@clinicatunari.example',
    phone: '+591 4 425 6631',
    website: 'https://clinicatunari.example',
    instagram: 'clinicatunari',
    industry: 'Salud',
    city: 'Cochabamba',
    stage: 'won',
    ownerUid: 'seed-member-mariana',
    teamId: 'pymes',
    serviceIds: ['svc-seo-mensual'],
    estimatedValue: 8400,
    closedValue: 8400,
    valueCurrency: 'Bs',
    lossReason: null,
    source: 'manual',
    tags: [],
    nextFollowUpAt: null,
    createdAt: fixedDate('2026-10-02'),
  },
  {
    id: 'cli-cafe-yungas',
    companyName: 'Café Yungas',
    contactName: 'Paola Ríos',
    email: 'paola@cafeyungas.example',
    phone: '+591 2 211 7788',
    website: null,
    instagram: 'cafeyungas',
    industry: 'Gastronomía',
    city: 'La Paz',
    stage: 'lost',
    ownerUid: 'seed-lead-valentina',
    teamId: 'pymes',
    serviceIds: ['svc-publicidad'],
    estimatedValue: 2800,
    closedValue: null,
    valueCurrency: 'Bs',
    lossReason: 'Precio',
    source: 'scraper',
    tags: [],
    nextFollowUpAt: null,
    createdAt: fixedDate('2026-10-28'),
  },
];

const weekday = [
  { start: '09:00', end: '12:00' },
  { start: '14:00', end: '18:00' },
];
const morning = [{ start: '09:00', end: '13:00' }];
/** @type {WeeklyHours} */
const workWeek = {
  mon: weekday,
  tue: weekday,
  wed: morning,
  thu: weekday,
  fri: morning,
  sat: [],
  sun: [],
};

/**
 * One availability per seller, shared across all of their teams.
 * @type {Array<{ uid: string } & Availability>}
 */
export const availability = [
  {
    uid: 'seed-member-sofia',
    bookingSlug: 'sofia-rojas',
    meetingUrl: 'https://meet.example.com/sofia-rojas',
  },
  {
    uid: 'seed-member-mariana',
    bookingSlug: 'mariana-vaca',
    meetingUrl: 'https://meet.example.com/mariana-vaca',
  },
  { uid: 'seed-lead-camila', bookingSlug: 'camila-flores', meetingUrl: null },
].map((a) => ({
  ...a,
  timezone: 'America/La_Paz',
  weeklyHours: workWeek,
  slotMinutes: 30,
  daysOff: ['2026-12-24', '2026-12-25', '2026-12-26'],
  paused: false,
}));

/**
 * Lowercase word prefixes without accents, as the P1-10 trigger will store them.
 * @param {...(string | null)} values
 */
export function searchTokens(...values) {
  const words = values
    .filter(Boolean)
    .flatMap((v) =>
      String(v)
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .split(/[^a-z0-9]+/),
    )
    .filter((w) => w.length >= 2);
  const tokens = new Set();
  for (const w of words) for (let i = 2; i <= Math.min(w.length, 20); i++) tokens.add(w.slice(0, i));
  return [...tokens].sort();
}
