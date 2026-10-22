import { catalog, asList } from '@/lib/api/resources';
import type { ApiPlan } from '@/lib/api/types';
import type { Plan, PlanId } from '@/data/site';

const DEFAULT_CURRENCY = 'USD';

function centsToAmount(cents: number) {
  return Math.round(cents) / 100;
}

function priceFor(plan: ApiPlan, currency = DEFAULT_CURRENCY) {
  const table = plan.displayPrices ?? plan.amounts ?? {};
  const cents = table[currency] ?? table.USD ?? Object.values(table)[0];
  return typeof cents === 'number' ? centsToAmount(cents) : 0;
}

function periodFrom(plan: ApiPlan) {
  const code = String(plan.code || plan.id || '').toLowerCase();
  if (code.includes('quarter')) return 'quarter';
  if (code.includes('month')) return 'month';
  if (code.includes('week')) return 'week';
  if (code.includes('day') || code.includes('daily')) return 'day';
  if (plan.interval) return String(plan.interval).toLowerCase().replace(/ly$/, '');
  const hours = plan.passDurationHours;
  if (hours === 24) return 'day';
  if (hours === 168) return 'week';
  if (hours) return `${hours}h`;
  return 'period';
}

function cadenceFrom(plan: ApiPlan, period: string) {
  if (period === 'quarter') return 'Billed every three months';
  if (period === 'week') return 'Billed every week';
  if (period === 'month') return 'Billed every month';
  if (plan.kind === 'PASS') {
    const hours = plan.passDurationHours;
    if (hours === 24 || period === 'day') return '24-hour access';
    if (hours) return `${hours}-hour access`;
    return 'Limited-time access';
  }
  if (period === 'day') return 'Billed daily';
  return 'Recurring';
}

function blurbFrom(plan: ApiPlan, period: string) {
  const text = plan.description?.trim();
  if (text) return text;
  if (period === 'day') return 'Numbers, the draw, email, and SMS for one day.';
  if (period === 'quarter') return 'A season of forecasts at a lower rate.';
  if (period === 'week') return 'A short run of daily forecasts, renewed each week.';
  if (period === 'month') return 'The regular desk. One forecast every publishing day.';
  return 'Unlock the forecast and the draw.';
}

export function mapCatalogPlan(plan: ApiPlan, featuredId?: string): Plan {
  const id = String(plan.code || plan.id || '').toLowerCase();
  const period = periodFrom(plan);
  return {
    id,
    name: plan.name || id,
    price: priceFor(plan),
    currency: DEFAULT_CURRENCY,
    period,
    cadence: cadenceFrom(plan, period),
    blurb: blurbFrom(plan, period),
    featured: Boolean(plan.featured) || id === featuredId,
    channels: plan.channels ?? [],
    kind: plan.kind ?? undefined,
  };
}

function featuredCode(plans: ApiPlan[]) {
  const marked = plans.find((plan) => plan.featured);
  if (marked?.code) return String(marked.code).toLowerCase();
  const preferred = ['monthly', 'quarterly', 'weekly', 'daily'];
  for (const code of preferred) {
    if (plans.some((plan) => String(plan.code || '').toLowerCase() === code)) return code;
  }
  return String(plans[0]?.code || plans[0]?.id || '').toLowerCase();
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
