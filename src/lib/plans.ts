import { catalog, asList } from '@/lib/api/resources';
import type { ApiPlan } from '@/lib/api/types';
import type { Plan, PlanId } from '@/data/site';

const DEFAULT_CURRENCY = 'USD';

function priceFor(plan: ApiPlan, currency = DEFAULT_CURRENCY): number | null {
  const table = plan.displayPrices ?? plan.amounts ?? {};
  const amount = table[currency] ?? table.USD ?? Object.values(table)[0];
  return typeof amount === 'number' && Number.isFinite(amount) ? amount : null;
}

function periodFrom(plan: ApiPlan) {
  const code = String(plan.code || plan.id || '').toLowerCase();
  const name = String(plan.name || '').toLowerCase();
  if (code.includes('quarter') || name.includes('quarter')) return 'quarter';
  if (code.includes('month') || name.includes('month')) return 'month';
  if (code.includes('week') || name.includes('week')) return 'week';
  if (code.includes('day') || code.includes('daily') || name.includes('day')) return 'day';
  if (plan.interval) return String(plan.interval).toLowerCase().replace(/ly$/, '');
  const hours = plan.passDurationHours;
  if (hours === 24) return 'day';
  if (hours === 168) return 'week';
  if (hours) return `${hours}h`;
  return 'period';
}

function cadenceFrom(plan: ApiPlan, period: string) {
  if (plan.kind === 'PASS') {
    if (period === 'quarter') return 'Three months of access';
    if (period === 'week') return 'Seven days of access';
    const hours = plan.passDurationHours;
    if (hours === 24 || period === 'day') return '24-hour access';
    if (hours) return `${hours}-hour access`;
    return 'Limited-time access';
  }
  if (period === 'quarter') return 'Billed every three months';
  if (period === 'week') return 'Billed every week';
  if (period === 'month') return 'Billed every month';
  if (period === 'day') return 'Billed daily';
  return 'Recurring';
}

function blurbFrom(plan: ApiPlan, cadence: string) {
  const text = plan.description?.trim();
  if (text) return text;
  const channels = (plan.channels ?? []).filter(Boolean);
  if (channels.length) {
    const pretty = channels
      .map((channel) => (channel === 'sms' ? 'SMS' : channel === 'email' ? 'Email' : channel))
      .join(' and ');
    return `${cadence} · ${pretty}`;
  }
  return cadence;
}

export function mapCatalogPlan(plan: ApiPlan, featuredId?: string): Plan {
  const id = String(plan.code || plan.id || '').toLowerCase();
  const period = periodFrom(plan);
  const cadence = cadenceFrom(plan, period);
  return {
    id,
    name: plan.name || id,
    price: priceFor(plan),
    currency: DEFAULT_CURRENCY,
    period,
    cadence,
    blurb: blurbFrom(plan, cadence),
    featured: Boolean(plan.featured) || (featuredId ? id === featuredId : false),
    channels: plan.channels ?? [],
    kind: plan.kind ?? undefined,
  };
}

function featuredCode(plans: ApiPlan[]) {
  const marked = plans.find((plan) => plan.featured);
  if (marked?.code || marked?.id) return String(marked.code || marked.id).toLowerCase();
  return undefined;
}

export async function getCatalogPlans(): Promise<Plan[]> {
  const rows = asList<ApiPlan>(await catalog.plans());
  const featured = featuredCode(rows);
  return rows.map((row) => mapCatalogPlan(row, featured)).filter((plan) => plan.id);
}

export function planFromList(plans: Plan[], id: PlanId | null | undefined) {
  if (!id) return null;
  return plans.find((plan) => plan.id === id) ?? null;
}
