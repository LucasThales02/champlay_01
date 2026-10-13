import type { Plan } from '../types';
import { supabase } from '../lib/supabase';

type PlanRow = {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  original_price: number | string;
  current_price: number | string;
  discount: number;
  monthly_equivalent: number | string;
  savings: number | string;
  featured: boolean;
  active: boolean;
  sort_order: number;
  is_trial: boolean;
  period: string;
  button_label: string;
};

export const PLAN_BENEFITS = [
  'Acesso a todos os conteúdos disponíveis e licenciados',
  'Transmissão desenvolvida para oferecer qualidade e estabilidade',
  'Compatibilidade com diversos dispositivos',
  'Atualizações frequentes',
  'Suporte especializado para instalação',
];

function mapPlanRow(row: PlanRow): Plan {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    durationDays: Number(row.duration_days),
    originalPrice: Number(row.original_price),
    currentPrice: Number(row.current_price),
    discount: Number(row.discount),
    monthlyEquivalent: Number(row.monthly_equivalent),
    savings: Number(row.savings),
    featured: row.featured,
    active: row.active,
    sortOrder: Number(row.sort_order),
    isTrial: row.is_trial,
    period: row.period,
    buttonLabel: row.button_label,
  };
}

export async function loadPlans(): Promise<Plan[]> {
  const { data, error } = await supabase
    .from('plans')
    .select(
      `
        id,
        name,
        description,
        duration_days,
        original_price,
        current_price,
        discount,
        monthly_equivalent,
        savings,
        featured,
        active,
        sort_order,
        is_trial,
        period,
        button_label
      `
    )
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Erro ao carregar planos:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    throw new Error('Não foi possível carregar os planos.');
  }

  return ((data ?? []) as PlanRow[]).map(mapPlanRow);
}

export async function getPlanById(id: string): Promise<Plan | undefined> {
  const { data, error } = await supabase
    .from('plans')
    .select(
      `
        id,
        name,
        description,
        duration_days,
        original_price,
        current_price,
        discount,
        monthly_equivalent,
        savings,
        featured,
        active,
        sort_order,
        is_trial,
        period,
        button_label
      `
    )
    .eq('id', id)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar plano:', error.message);
    throw new Error('Não foi possível localizar o plano.');
  }

  return data ? mapPlanRow(data as PlanRow) : undefined;
}

export function findPlanById(plans: Plan[], id: string): Plan | undefined {
  return plans.find((plan) => plan.id === id);
}

export const formatPrice = (value: number): string =>
  value === 0 ? 'Grátis' : `R$ ${value.toFixed(2).replace('.', ',')}`;

export const formatMonthlyPrice = (value: number): string =>
  value === 0 ? 'R$ 0,00/mês' : `R$ ${value.toFixed(2).replace('.', ',')}/mês`;
