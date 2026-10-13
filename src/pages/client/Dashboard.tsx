import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  MessageCircle,
  Monitor,
  PauseCircle,
  Play,
  RefreshCw,
  User,
  Wifi,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../data/plans';
import type { SubscriptionStatus, TrialStatus } from '../../types';

type SubscriptionStatusConfig = {
  label: string;
  color: string;
  icon: React.ReactNode;
};

const subscriptionStatusConfig: Record<
  SubscriptionStatus,
  SubscriptionStatusConfig
> = {
  sem_assinatura: {
    label: 'Sem assinatura',
    color: 'text-muted-foreground',
    icon: <XCircle size={16} />,
  },
  aguardando_pagamento: {
    label: 'Aguardando pagamento',
    color: 'text-warning',
    icon: <Clock size={16} />,
  },
  ativo: {
    label: 'Ativo',
    color: 'text-success',
    icon: <CheckCircle size={16} />,
  },
  teste_ativo: {
    label: 'Teste ativo',
    color: 'text-accent',
    icon: <Play size={16} />,
  },
  vencido: {
    label: 'Vencido',
    color: 'text-destructive',
    icon: <AlertCircle size={16} />,
  },
  cancelado: {
    label: 'Cancelado',
    color: 'text-destructive',
    icon: <XCircle size={16} />,
  },
  suspenso: {
    label: 'Suspenso',
    color: 'text-warning',
    icon: <PauseCircle size={16} />,
  },
};

const trialStatusConfig: Record<
  TrialStatus,
  {
    label: string;
    color: string;
  }
> = {
  disponivel: {
    label: 'Disponível',
    color: 'text-success',
  },
  aguardando: {
    label: 'Aguardando análise',
    color: 'text-warning',
  },
  aprovado: {
    label: 'Aprovado',
    color: 'text-accent',
  },
  ativo: {
    label: 'Ativo',
    color: 'text-success',
  },
  finalizado: {
    label: 'Finalizado',
    color: 'text-muted-foreground',
  },
  expirado: {
    label: 'Expirado',
    color: 'text-destructive',
  },
  indisponivel: {
    label: 'Indisponível',
    color: 'text-destructive',
  },
};

function formatDate(value: string | null): string {
  if (!value) return '—';

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

function getDaysLeft(endDate: string | null): number | null {
  if (!endDate) return null;

  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return null;

  return Math.ceil((end.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

function getFirstName(name: string | undefined): string {
  const firstName = name?.trim().split(/\s+/)[0];
  return firstName || 'cliente';
}

function normalizeExternalUrl(value: string): string {
  const trimmed = value.trim();

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function Dashboard() {
  const {
    currentUser,
    plans,
    plansLoading,
    plansError,
    reloadPlans,
    mySubscription,
    myTrialRequest,
    reloadOperationalData,
    addToast,
  } = useApp();

  const navigate = useNavigate();
  const [showTrialPassword, setShowTrialPassword] = useState(false);
  const [refreshingTrial, setRefreshingTrial] = useState(false);

  const currentPlan = useMemo(
    () =>
      mySubscription
        ? plans.find((plan) => plan.id === mySubscription.planId) || null
        : null,
    [mySubscription, plans]
  );

  const subscriptionStatus: SubscriptionStatus =
    mySubscription?.status || 'sem_assinatura';
  const subscriptionStatusDetails =
    subscriptionStatusConfig[subscriptionStatus];

  const daysRemaining = mySubscription
    ? getDaysLeft(mySubscription.endDate)
    : null;

  const trialStatus: TrialStatus = myTrialRequest
    ? myTrialRequest.status
    : 'disponivel';
  const trialStatusDetails = trialStatusConfig[trialStatus] ?? {
    label: 'Status desconhecido',
    color: 'text-muted-foreground',
  };

  const hasTrialCredentials = Boolean(
    myTrialRequest?.status === 'ativo' &&
      myTrialRequest.accessSite?.trim() &&
      myTrialRequest.accessUsername?.trim() &&
      myTrialRequest.accessPassword?.trim()
  );

  const accessIsActive =
    mySubscription?.status === 'ativo' ||
    mySubscription?.status === 'teste_ativo' ||
    trialStatus === 'ativo';

  const trialRemainingTime = useMemo(() => {
    if (!myTrialRequest?.endDate || myTrialRequest.status !== 'ativo') {
      return null;
    }

    const endTime = new Date(myTrialRequest.endDate).getTime();
    const difference = endTime - Date.now();

    if (Number.isNaN(endTime) || difference <= 0) {
      return 'Período encerrado';
    }

    const hours = Math.floor(difference / (60 * 60 * 1000));
    const minutes = Math.max(
      0,
      Math.ceil((difference % (60 * 60 * 1000)) / (60 * 1000))
    );

    return `${hours}h ${minutes}min restantes`;
  }, [myTrialRequest?.endDate, myTrialRequest?.status]);

  const quickActions = [
    { icon: CreditCard, label: 'Ver planos', to: '/cliente/planos' },
    { icon: Play, label: 'Solicitar teste', to: '/cliente/teste' },
    { icon: MessageCircle, label: 'Falar com suporte', to: '/cliente/suporte' },
    { icon: User, label: 'Atualizar perfil', to: '/cliente/perfil' },
  ];

  const copyTrialValue = async (
    value: string | null | undefined,
    label: string
  ): Promise<void> => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      addToast(`${label} copiado.`, 'success');
    } catch {
      addToast(`Não foi possível copiar ${label.toLowerCase()}.`, 'error');
    }
  };

  const handleRefreshTrial = async (): Promise<void> => {
    if (refreshingTrial) return;

    setRefreshingTrial(true);

    try {
      await reloadOperationalData();
      addToast('Informações do teste atualizadas.', 'success');
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar o teste.',
        'error'
      );
    } finally {
      setRefreshingTrial(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Olá, {getFirstName(currentUser?.name)}! 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Bem-vindo(a) à sua área exclusiva ChamPlay.
        </p>
      </div>

      {plansLoading && (
        <div className="mb-6 p-4 bg-card border border-border rounded-2xl flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={18} className="animate-spin" />
          Carregando informações dos planos...
        </div>
      )}

      {!plansLoading && plansError && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-destructive">{plansError}</p>
          <button
            type="button"
            onClick={() => void reloadPlans()}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 gradient-bg text-white text-sm font-semibold rounded-xl hover:opacity-90"
          >
            <RefreshCw size={14} />
            Tentar novamente
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 card-glow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-primary" />
              <h2 className="text-base font-display font-semibold text-foreground">
                Minha assinatura
              </h2>
            </div>
            <div
              className={`flex items-center gap-1.5 text-sm font-medium ${subscriptionStatusDetails.color}`}
            >
              {subscriptionStatusDetails.icon}
              <span>{subscriptionStatusDetails.label}</span>
            </div>
          </div>

          {mySubscription ? (
            currentPlan ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Plano
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {currentPlan.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Início
                    </p>
                    <p className="text-sm text-foreground">
                      {formatDate(mySubscription.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Vencimento
                    </p>
                    <p className="text-sm text-foreground">
                      {formatDate(mySubscription.endDate)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Valor contratado
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatPrice(mySubscription.contractedPrice)}
                    </p>
                  </div>
                  {daysRemaining !== null && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Dias restantes
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          daysRemaining <= 7 ? 'text-warning' : 'text-success'
                        }`}
                      >
                        {daysRemaining > 0
                          ? `${daysRemaining} dias`
                          : 'Vencido'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/cliente/planos')}
                    className="flex-1 py-2 text-sm font-medium bg-muted hover:bg-secondary rounded-xl transition-colors text-foreground"
                  >
                    Ver detalhes
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/cliente/planos')}
                    className="flex-1 py-2 text-sm font-medium gradient-bg text-white rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Renovar plano
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle
                  size={36}
                  className="text-warning mx-auto mb-3 opacity-70"
                />
                <p className="text-sm text-warning mb-2">
                  O plano vinculado à assinatura não está disponível na lista de
                  planos ativos.
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Código do plano: {mySubscription.planId}
                </p>
                <button
                  type="button"
                  onClick={() => void reloadPlans()}
                  className="px-4 py-2 bg-muted text-foreground text-sm font-semibold rounded-xl hover:bg-secondary"
                >
                  Atualizar planos
                </button>
              </div>
            )
          ) : (
            <div className="text-center py-6">
              <CreditCard
                size={36}
                className="text-muted-foreground mx-auto mb-3 opacity-40"
              />
              <p className="text-sm text-muted-foreground mb-4">
                Você ainda não possui uma assinatura.
              </p>
              <button
                type="button"
                onClick={() => navigate('/cliente/planos')}
                className="px-4 py-2 gradient-bg text-white text-sm font-semibold rounded-xl hover:opacity-90"
              >
                Ver planos
              </button>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 card-glow">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Play size={18} className="text-primary" />
              <h2 className="text-base font-display font-semibold text-foreground">
                Teste gratuito
              </h2>
            </div>

            {myTrialRequest && (
              <button
                type="button"
                onClick={() => void handleRefreshTrial()}
                disabled={refreshingTrial}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-50"
                aria-label="Atualizar teste"
                title="Atualizar teste"
              >
                <RefreshCw
                  size={14}
                  className={refreshingTrial ? 'animate-spin' : ''}
                />
              </button>
            )}
          </div>

          <div
            className={`text-sm font-semibold mb-3 ${trialStatusDetails.color}`}
          >
            {trialStatusDetails.label}
          </div>

          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            {trialStatus === 'disponivel'
              ? '4 horas de acesso sem custo. Experimente a plataforma antes de assinar.'
              : trialStatus === 'aguardando'
              ? 'Sua solicitação está sendo analisada pela equipe.'
              : trialStatus === 'aprovado'
              ? 'Seu teste foi aprovado. Aguarde o envio dos dados de acesso.'
              : trialStatus === 'ativo'
              ? hasTrialCredentials
                ? 'Seu teste está ativo. Utilize os dados de acesso abaixo.'
                : 'Seu teste está ativo, mas os dados de acesso ainda não foram liberados.'
              : trialStatus === 'expirado'
              ? 'O período do seu teste expirou. Assine um plano para continuar utilizando a plataforma.'
              : trialStatus === 'finalizado'
              ? 'Seu período de teste foi finalizado. Assine um plano para continuar.'
              : trialStatus === 'indisponivel'
              ? 'O teste gratuito não está disponível para esta conta.'
              : 'Não foi possível identificar o status atual do teste.'}
          </p>

          {(trialStatus === 'ativo' || trialStatus === 'expirado') && (
            <div className="mb-4 space-y-1 text-xs text-muted-foreground">
              {myTrialRequest?.startDate && (
                <p>
                  Início:{' '}
                  <span className="text-foreground">
                    {formatDateTime(myTrialRequest.startDate)}
                  </span>
                </p>
              )}

              {myTrialRequest?.endDate && (
                <p>
                  Término:{' '}
                  <span className="text-foreground">
                    {formatDateTime(myTrialRequest.endDate)}
                  </span>
                </p>
              )}

              {trialStatus === 'ativo' && trialRemainingTime && (
                <p className="font-semibold text-primary pt-1">
                  {trialRemainingTime}
                </p>
              )}

              {trialStatus === 'expirado' && (
                <p className="font-semibold text-destructive pt-1">
                  Período encerrado
                </p>
              )}
            </div>
          )}
          {hasTrialCredentials && myTrialRequest && (
            <div className="mb-4 space-y-2">
              <div className="p-3 bg-muted border border-border rounded-xl">
                <p className="text-[10px] text-muted-foreground mb-1">Site</p>
                <div className="flex items-center gap-1">
                  <a
                    href={normalizeExternalUrl(myTrialRequest.accessSite!)}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 flex-1 text-xs text-primary font-medium break-all hover:underline"
                  >
                    {myTrialRequest.accessSite}
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      void copyTrialValue(myTrialRequest.accessSite, 'Site')
                    }
                    className="p-1.5 text-muted-foreground hover:text-foreground"
                    aria-label="Copiar site"
                  >
                    <Copy size={13} />
                  </button>
                  <a
                    href={normalizeExternalUrl(myTrialRequest.accessSite!)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-muted-foreground hover:text-primary"
                    aria-label="Abrir site"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              <div className="p-3 bg-muted border border-border rounded-xl">
                <p className="text-[10px] text-muted-foreground mb-1">
                  Usuário
                </p>
                <div className="flex items-center gap-1">
                  <p className="min-w-0 flex-1 text-xs text-foreground font-medium break-all">
                    {myTrialRequest.accessUsername}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      void copyTrialValue(
                        myTrialRequest.accessUsername,
                        'Usuário'
                      )
                    }
                    className="p-1.5 text-muted-foreground hover:text-foreground"
                    aria-label="Copiar usuário"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-muted border border-border rounded-xl">
                <p className="text-[10px] text-muted-foreground mb-1">Senha</p>
                <div className="flex items-center gap-1">
                  <p className="min-w-0 flex-1 text-xs text-foreground font-mono font-semibold break-all">
                    {showTrialPassword
                      ? myTrialRequest.accessPassword
                      : '••••••••••••'}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setShowTrialPassword((previous) => !previous)
                    }
                    className="p-1.5 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showTrialPassword ? 'Ocultar senha' : 'Mostrar senha'
                    }
                  >
                    {showTrialPassword ? (
                      <EyeOff size={13} />
                    ) : (
                      <Eye size={13} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void copyTrialValue(
                        myTrialRequest.accessPassword,
                        'Senha'
                      )
                    }
                    className="p-1.5 text-muted-foreground hover:text-foreground"
                    aria-label="Copiar senha"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {trialStatus === 'disponivel' && (
            <button
              type="button"
              onClick={() => navigate('/cliente/teste')}
              className="w-full py-2.5 gradient-bg text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Solicitar teste
            </button>
          )}

          {(trialStatus === 'aguardando' ||
            trialStatus === 'aprovado' ||
            trialStatus === 'ativo') && (
            <button
              type="button"
              onClick={() => navigate('/cliente/teste')}
              className="w-full py-2.5 bg-muted text-foreground text-sm font-semibold rounded-xl hover:bg-secondary transition-colors"
            >
              Ver detalhes do teste
            </button>
          )}

          {(trialStatus === 'finalizado' || trialStatus === 'expirado') && (
            <button
              type="button"
              onClick={() => navigate('/cliente/planos')}
              className="w-full py-2.5 bg-muted text-foreground text-sm font-semibold rounded-xl hover:bg-secondary transition-colors"
            >
              Ver planos
            </button>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-2xl p-6 card-glow">
          <div className="flex items-center gap-2 mb-4">
            <Wifi size={18} className="text-primary" />
            <h2 className="text-base font-display font-semibold text-foreground">
              Acesso
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  accessIsActive ? 'bg-success' : 'bg-muted-foreground'
                }`}
              />
              <div>
                <p className="text-xs text-muted-foreground">
                  Status do acesso
                </p>
                <p className="text-sm text-foreground font-medium">
                  {accessIsActive ? 'Ativo' : 'Inativo'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Monitor size={16} className="text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Dispositivo principal
                </p>
                <p className="text-sm text-foreground">
                  {myTrialRequest?.status === 'ativo'
                    ? myTrialRequest.device
                    : 'Não configurado'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Última atualização
                </p>
                <p className="text-sm text-foreground">
                  {myTrialRequest?.credentialsSentAt
                    ? formatDateTime(myTrialRequest.credentialsSentAt)
                    : new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/cliente/suporte')}
            className="w-full mt-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors"
          >
            Ver instruções de instalação
          </button>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 card-glow">
          <h2 className="text-base font-display font-semibold text-foreground mb-4">
            Atalhos
          </h2>

          <div className="space-y-2">
            {quickActions.map(({ icon: Icon, label, to }) => (
              <button
                key={to}
                type="button"
                onClick={() => navigate(to)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon size={15} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {label}
                  </span>
                </div>
                <ArrowRight
                  size={14}
                  className="text-muted-foreground group-hover:text-primary transition-colors"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
