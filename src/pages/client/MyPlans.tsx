import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Star,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  PLAN_BENEFITS,
  formatMonthlyPrice,
  formatPrice,
} from '../../data/plans';
import type { Plan } from '../../types';

type ConfirmModalProps = {
  plan: Plan;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

type AccessCardProps = {
  title: string;
  description: string;
  badge: string;
  site: string;
  username: string;
  password: string;
  startDate: string | null | undefined;
  endDate: string | null | undefined;
  endDateLabel: string;
  showPassword: boolean;
  onTogglePassword: () => void;
  onCopy: (value: string | null | undefined, label: string) => Promise<void>;
  borderClass: string;
};

function normalizeStatus(value: string | null | undefined): string {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function normalizeCredential(value: string | null | undefined): string {
  return String(value ?? '').trim();
}

function normalizeExternalUrl(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) return '#';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  return `https://${trimmed}`;
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return 'Não informado';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Não informado';

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSubscriptionStatus(status: string | null | undefined): string {
  const normalizedStatus = normalizeStatus(status);

  const labels: Record<string, string> = {
    sem_assinatura: 'Sem assinatura',
    aguardando_pagamento: 'Aguardando pagamento',
    ativo: 'Ativo',
    teste_ativo: 'Teste ativo',
    vencido: 'Vencido',
    cancelado: 'Cancelado',
    suspenso: 'Suspenso',
  };

  return labels[normalizedStatus] || String(status ?? 'Não informado');
}

function AccessCard({
  title,
  description,
  badge,
  site,
  username,
  password,
  startDate,
  endDate,
  endDateLabel,
  showPassword,
  onTogglePassword,
  onCopy,
  borderClass,
}: AccessCardProps) {
  const siteUrl = normalizeExternalUrl(site);

  return (
    <section
      className={`mb-6 p-5 bg-card border rounded-2xl card-glow ${borderClass}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Check size={18} className="text-success" />
            <h2 className="text-base font-display font-semibold text-foreground">
              {title}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>

        <span className="self-start text-[11px] font-semibold px-2 py-1 rounded-full bg-success/10 text-success">
          {badge}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="p-3 bg-muted border border-border rounded-xl">
          <p className="text-xs text-muted-foreground mb-1">Site</p>

          <div className="flex items-center gap-1">
            {site ? (
              <>
                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1 text-sm text-primary font-medium break-all hover:underline"
                >
                  {site}
                </a>

                <button
                  type="button"
                  onClick={() => void onCopy(site, 'Site')}
                  className="p-1.5 text-muted-foreground hover:text-foreground"
                  aria-label="Copiar site"
                  title="Copiar site"
                >
                  <Copy size={14} />
                </button>

                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-muted-foreground hover:text-primary"
                  aria-label="Abrir site"
                  title="Abrir site"
                >
                  <ExternalLink size={14} />
                </a>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Não informado</p>
            )}
          </div>
        </div>

        <div className="p-3 bg-muted border border-border rounded-xl">
          <p className="text-xs text-muted-foreground mb-1">Usuário</p>

          <div className="flex items-center gap-1">
            <p className="min-w-0 flex-1 text-sm text-foreground font-medium break-all">
              {username || 'Não informado'}
            </p>

            {username && (
              <button
                type="button"
                onClick={() => void onCopy(username, 'Usuário')}
                className="p-1.5 text-muted-foreground hover:text-foreground"
                aria-label="Copiar usuário"
                title="Copiar usuário"
              >
                <Copy size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="p-3 bg-muted border border-border rounded-xl">
          <p className="text-xs text-muted-foreground mb-1">Senha</p>

          <div className="flex items-center gap-1">
            <p className="min-w-0 flex-1 text-sm text-foreground font-mono font-semibold break-all">
              {!password
                ? 'Não informada'
                : showPassword
                ? password
                : '••••••••••••'}
            </p>

            {password && (
              <>
                <button
                  type="button"
                  onClick={onTogglePassword}
                  className="p-1.5 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>

                <button
                  type="button"
                  onClick={() => void onCopy(password, 'Senha')}
                  className="p-1.5 text-muted-foreground hover:text-foreground"
                  aria-label="Copiar senha"
                  title="Copiar senha"
                >
                  <Copy size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
        <p>
          Início:{' '}
          <span className="text-foreground font-medium">
            {formatDateTime(startDate)}
          </span>
        </p>

        <p>
          {endDateLabel}:{' '}
          <span className="text-foreground font-medium">
            {formatDateTime(endDate)}
          </span>
        </p>
      </div>
    </section>
  );
}

function ConfirmModal({ plan, onClose, onConfirm }: ConfirmModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async (): Promise<void> => {
    if (!agreed || loading) return;

    setLoading(true);
    setError('');

    try {
      await onConfirm();
      onClose();
    } catch (confirmError: unknown) {
      setError(
        confirmError instanceof Error
          ? confirmError.message
          : 'Não foi possível solicitar o plano.'
      );
    } finally {
      setLoading(false);
    }
  };

  const startDate = new Date().toLocaleDateString('pt-BR');
  const endDate =
    plan.durationDays > 0
      ? new Date(
          Date.now() + plan.durationDays * 24 * 60 * 60 * 1000
        ).toLocaleDateString('pt-BR')
      : '—';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-plan-title"
    >
      <button
        type="button"
        aria-label="Fechar confirmação"
        className="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        disabled={loading}
      />

      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl animate-fade-in-up p-6">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Fechar"
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-50"
        >
          <X size={16} />
        </button>

        <h3
          id="confirm-plan-title"
          className="text-lg font-display font-bold text-foreground mb-1"
        >
          Confirmar solicitação
        </h3>

        <p className="text-sm text-muted-foreground mb-5">
          Revise os detalhes antes de confirmar.
        </p>

        {error && (
          <div
            className="mb-4 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="space-y-3 mb-5 p-4 bg-muted rounded-xl">
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Plano</span>
            <span className="font-semibold text-foreground text-right">
              {plan.name}
            </span>
          </div>

          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Período</span>
            <span className="text-foreground text-right">{plan.period}</span>
          </div>

          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Valor total</span>
            <span className="font-bold text-foreground text-right">
              {formatPrice(plan.currentPrice)}
            </span>
          </div>

          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Equivalente/mês</span>
            <span className="text-foreground text-right">
              {formatMonthlyPrice(plan.monthlyEquivalent)}
            </span>
          </div>

          <div className="flex justify-between gap-4 text-sm border-t border-border pt-3">
            <span className="text-muted-foreground">Início estimado</span>
            <span className="text-foreground text-right">{startDate}</span>
          </div>

          {plan.durationDays > 0 && (
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Término estimado</span>
              <span className="text-foreground text-right">{endDate}</span>
            </div>
          )}
        </div>

        <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl text-xs text-muted-foreground mb-5">
          Esta solicitação ficará com status{' '}
          <strong className="text-warning">Aguardando pagamento</strong>. O
          acesso será liberado após a confirmação do pagamento.
        </div>

        <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            disabled={loading}
            onChange={(event) => setAgreed(event.target.checked)}
            className="w-4 h-4 accent-primary mt-0.5 shrink-0"
          />

          <span className="text-sm text-muted-foreground">
            Concordo com os termos e condições do plano selecionado.
          </span>
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-medium bg-muted rounded-xl hover:bg-secondary disabled:opacity-50 transition-colors text-foreground"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={!agreed || loading}
            className="flex-1 py-2.5 text-sm font-semibold gradient-bg text-white rounded-xl hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Enviando...' : 'Confirmar solicitação'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyPlans() {
  const {
    plans,
    plansLoading,
    plansError,
    reloadPlans,
    mySubscription,
    myTrialRequest,
    myClientAccess,
    requestPlan,
    addToast,
  } = useApp();

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showTrialPassword, setShowTrialPassword] = useState(false);
  const [showSubscriptionPassword, setShowSubscriptionPassword] =
    useState(false);

  const paidPlans = useMemo(
    () => plans.filter((plan) => !plan.isTrial && plan.active),
    [plans]
  );

  const currentPlan = useMemo(
    () =>
      mySubscription
        ? plans.find((plan) => plan.id === mySubscription.planId) || null
        : null,
    [mySubscription, plans]
  );

  const subscriptionStatus = normalizeStatus(mySubscription?.status);
  const trialStatus = normalizeStatus(myTrialRequest?.status);

  const subscriptionCredentials = useMemo(
    () => ({
      site: normalizeCredential(myClientAccess?.accessSite),
      username: normalizeCredential(myClientAccess?.accessUsername),
      password: normalizeCredential(myClientAccess?.accessPassword),
    }),
    [
      myClientAccess?.accessSite,
      myClientAccess?.accessUsername,
      myClientAccess?.accessPassword,
    ]
  );

  const trialCredentials = useMemo(
    () => ({
      site: normalizeCredential(myTrialRequest?.accessSite),
      username: normalizeCredential(myTrialRequest?.accessUsername),
      password: normalizeCredential(myTrialRequest?.accessPassword),
    }),
    [
      myTrialRequest?.accessSite,
      myTrialRequest?.accessUsername,
      myTrialRequest?.accessPassword,
    ]
  );

  const isSubscriptionActive = subscriptionStatus === 'ativo';
  const isTrialActive =
    trialStatus === 'ativo' || trialStatus === 'teste_ativo';

  const hasAnySubscriptionCredential = Boolean(
    subscriptionCredentials.site ||
      subscriptionCredentials.username ||
      subscriptionCredentials.password
  );

  const hasAnyTrialCredential = Boolean(
    trialCredentials.site ||
      trialCredentials.username ||
      trialCredentials.password
  );

  const showSubscriptionAccess =
    Boolean(mySubscription) &&
    Boolean(myClientAccess) &&
    isSubscriptionActive &&
    hasAnySubscriptionCredential;

  const showTrialAccess =
    !showSubscriptionAccess &&
    Boolean(myTrialRequest) &&
    isTrialActive &&
    hasAnyTrialCredential;

  const subscriptionHasNoCredentials =
    Boolean(mySubscription) &&
    isSubscriptionActive &&
    !hasAnySubscriptionCredential;

  const trialHasNoCredentials =
    !showSubscriptionAccess &&
    Boolean(myTrialRequest) &&
    isTrialActive &&
    !hasAnyTrialCredential;

  const handleSelect = (plan: Plan): void => {
    if (plan.isTrial || !plan.active) return;
    setSelectedPlan(plan);
  };

  const copyValue = async (
    value: string | null | undefined,
    label: string
  ): Promise<void> => {
    const normalizedValue = normalizeCredential(value);

    if (!normalizedValue) {
      addToast(`${label} não está disponível.`, 'error');
      return;
    }

    try {
      await navigator.clipboard.writeText(normalizedValue);
      addToast(`${label} copiado.`, 'success');
    } catch {
      addToast(`Não foi possível copiar ${label.toLowerCase()}.`, 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Meus planos
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Compare os planos e escolha o melhor para você.
        </p>
      </div>

      {plansLoading && (
        <div
          className="min-h-56 flex items-center justify-center gap-2 text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <Loader2 size={20} className="animate-spin" />
          Carregando planos...
        </div>
      )}

      {!plansLoading && plansError && (
        <div
          className="max-w-lg mx-auto text-center bg-card border border-destructive/30 rounded-2xl p-8"
          role="alert"
        >
          <p className="text-sm text-destructive mb-4">{plansError}</p>

          <button
            type="button"
            onClick={() => void reloadPlans()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 gradient-bg text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={15} />
            Tentar novamente
          </button>
        </div>
      )}

      {!plansLoading && !plansError && (
        <>
          {showSubscriptionAccess && mySubscription && (
            <AccessCard
              title="Acesso da assinatura"
              description="Credenciais do seu plano ativo."
              badge="Assinatura ativa"
              site={subscriptionCredentials.site}
              username={subscriptionCredentials.username}
              password={subscriptionCredentials.password}
              startDate={mySubscription.startDate}
              endDate={mySubscription.endDate}
              endDateLabel="Vencimento"
              showPassword={showSubscriptionPassword}
              onTogglePassword={() =>
                setShowSubscriptionPassword((previous) => !previous)
              }
              onCopy={copyValue}
              borderClass="border-success/30"
            />
          )}

          {subscriptionHasNoCredentials && (
            <div
              className="mb-6 p-4 bg-warning/10 border border-warning/30 rounded-2xl flex items-start gap-3"
              role="alert"
            >
              <AlertCircle size={20} className="text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Credenciais ainda não disponíveis
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  A assinatura está ativa, mas as credenciais ainda não foram
                  localizadas para este usuário.
                </p>
              </div>
            </div>
          )}

          {showTrialAccess && myTrialRequest && (
            <AccessCard
              title="Acesso do teste gratuito"
              description="Utilize estas credenciais durante o período de teste."
              badge="Teste ativo"
              site={trialCredentials.site}
              username={trialCredentials.username}
              password={trialCredentials.password}
              startDate={myTrialRequest.startDate}
              endDate={myTrialRequest.endDate}
              endDateLabel="Término"
              showPassword={showTrialPassword}
              onTogglePassword={() =>
                setShowTrialPassword((previous) => !previous)
              }
              onCopy={copyValue}
              borderClass="border-primary/30"
            />
          )}

          {trialHasNoCredentials && (
            <div
              className="mb-6 p-4 bg-warning/10 border border-warning/30 rounded-2xl flex items-start gap-3"
              role="alert"
            >
              <AlertCircle size={20} className="text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Credenciais do teste ainda não disponíveis
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  O teste está ativo, mas as credenciais ainda não foram
                  localizadas para este usuário.
                </p>
              </div>
            </div>
          )}

          {mySubscription && currentPlan && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3">
              <Check size={18} className="text-primary shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Plano atual:{' '}
                  <span className="text-primary">{currentPlan.name}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Status: {formatSubscriptionStatus(mySubscription.status)} ·{' '}
                  Valor: {formatPrice(mySubscription.contractedPrice)}
                </p>
              </div>
            </div>
          )}

          {mySubscription && !currentPlan && (
            <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-2xl">
              <p className="text-sm text-warning">
                O plano da assinatura atual não está disponível na lista de
                planos ativos.
              </p>
            </div>
          )}

          {paidPlans.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum plano pago está disponível no momento.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {paidPlans.map((plan) => {
                const isCurrent = mySubscription?.planId === plan.id;

                return (
                  <article
                    key={plan.id}
                    className={`relative flex flex-col rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                      isCurrent
                        ? 'border-success bg-card'
                        : plan.featured
                        ? 'card-glow-featured bg-card border-primary'
                        : 'card-glow bg-card border-border hover:border-primary/30'
                    }`}
                  >
                    {isCurrent ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <div className="px-3 py-1 bg-success rounded-full text-white text-[10px] font-bold whitespace-nowrap">
                          Plano atual
                        </div>
                      </div>
                    ) : (
                      plan.featured && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <div className="flex items-center gap-1 px-3 py-1 gradient-bg rounded-full text-white text-[10px] font-bold whitespace-nowrap">
                            <Star size={9} fill="currentColor" />
                            Mais escolhido
                          </div>
                        </div>
                      )
                    )}

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-base font-display font-bold text-foreground mb-1">
                        {plan.name}
                      </h3>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                        <Clock size={11} />
                        <span>{plan.period}</span>
                      </div>

                      <div className="mb-4">
                        {plan.discount > 0 && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(plan.originalPrice)}
                            </span>
                            <span className="text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-full">
                              -{plan.discount}%
                            </span>
                          </div>
                        )}

                        <div className="text-2xl font-display font-black text-foreground">
                          {formatPrice(plan.currentPrice)}
                        </div>

                        <div className="text-xs text-muted-foreground mt-1">
                          {formatMonthlyPrice(plan.monthlyEquivalent)}
                        </div>

                        {plan.savings > 0 && (
                          <div className="text-xs text-success mt-0.5">
                            Economia: {formatPrice(plan.savings)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 mb-5">
                        <ul className="space-y-1.5">
                          {PLAN_BENEFITS.map((benefit) => (
                            <li
                              key={benefit}
                              className="flex items-start gap-1.5 text-xs text-muted-foreground"
                            >
                              <Check
                                size={12}
                                className="text-primary shrink-0 mt-0.5"
                              />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelect(plan)}
                        disabled={isCurrent}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          plan.featured && !isCurrent
                            ? 'gradient-bg text-white hover:opacity-90'
                            : 'bg-secondary text-foreground hover:bg-primary hover:text-white border border-border'
                        }`}
                      >
                        {isCurrent ? 'Plano atual' : plan.buttonLabel}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {selectedPlan && (
        <ConfirmModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onConfirm={() => requestPlan(selectedPlan.id)}
        />
      )}
    </div>
  );
}
