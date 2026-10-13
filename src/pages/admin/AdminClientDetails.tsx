import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  MessageCircle,
  Play,
  RefreshCw,
  Save,
  UserRound,
  X,
} from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import type {
  Subscription,
  SubscriptionStatus,
  TrialRequest,
  User,
} from '../../types';

type ProfileRow = {
  id: string;
  name: string | null;
  whatsapp: string | null;
  role: string | null;
  theme: string | null;
  admin_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type Credentials = {
  site: string;
  username: string;
  password: string;
};

const subscriptionStatuses: SubscriptionStatus[] = [
  'aguardando_pagamento',
  'ativo',
  'teste_ativo',
  'vencido',
  'cancelado',
  'suspenso',
  'sem_assinatura',
];

const subscriptionStatusLabels: Record<SubscriptionStatus, string> = {
  sem_assinatura: 'Sem assinatura',
  aguardando_pagamento: 'Aguardando pagamento',
  ativo: 'Ativo',
  teste_ativo: 'Teste ativo',
  vencido: 'Vencido',
  cancelado: 'Cancelado',
  suspenso: 'Suspenso',
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return fallback;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Não informado';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Não informado';
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function normalizeExternalUrl(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) return '#';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  return `https://${trimmed}`;
}

function getSubscriptionBadgeClass(status: SubscriptionStatus): string {
  if (status === 'ativo') {
    return 'bg-success/10 text-success border-success/20';
  }

  if (status === 'aguardando_pagamento') {
    return 'bg-warning/10 text-warning border-warning/20';
  }

  if (status === 'cancelado' || status === 'vencido') {
    return 'bg-destructive/10 text-destructive border-destructive/20';
  }

  return 'bg-muted text-muted-foreground border-border';
}

export default function AdminClientDetails() {
  const {
    currentUser,
    authLoading,
    plans,
    allClientAccesses,
    allSubscriptions,
    allTrialRequests,
    allTickets,
    saveClientAccess,
    adminUpdateSubscription,
    reloadOperationalData,
    addToast,
  } = useApp();

  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [client, setClient] = useState<User | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingAccess, setSavingAccess] = useState(false);
  const [updatingSubscription, setUpdatingSubscription] = useState(false);
  const [editingAccess, setEditingAccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState<Credentials>({
    site: '',
    username: '',
    password: '',
  });

  const subscription = useMemo<Subscription | null>(
    () => allSubscriptions.find((item) => item.userId === userId) ?? null,
    [allSubscriptions, userId]
  );

  const trial = useMemo<TrialRequest | null>(
    () => allTrialRequests.find((item) => item.userId === userId) ?? null,
    [allTrialRequests, userId]
  );

  const clientAccess = useMemo(
    () => allClientAccesses.find((item) => item.userId === userId) ?? null,
    [allClientAccesses, userId]
  );

  const clientTickets = useMemo(
    () => allTickets.filter((item) => item.userId === userId),
    [allTickets, userId]
  );

  const currentPlan = useMemo(
    () =>
      subscription
        ? plans.find((plan) => plan.id === subscription.planId) ?? null
        : null,
    [plans, subscription]
  );

  useEffect(() => {
    const loadClient = async (): Promise<void> => {
      if (!userId || !currentUser || currentUser.role !== 'admin') {
        setClient(null);
        setLoadingClient(false);
        return;
      }

      setLoadingClient(true);
      setError('');

      try {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, whatsapp, role, theme, created_at, updated_at')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!data) {
          setClient(null);
          return;
        }

        const profile = data as ProfileRow;

        setClient({
          id: profile.id,
          name: profile.name || 'Usuário sem nome',
          email: '',
          whatsapp: profile.whatsapp || '',
          role: profile.role === 'admin' ? 'admin' : 'client',
          theme: profile.theme === 'light' ? 'light' : 'dark',
          createdAt: profile.created_at || new Date().toISOString(),
          updatedAt:
            profile.updated_at ||
            profile.created_at ||
            new Date().toISOString(),
        });
      } catch (loadError) {
        console.error('Erro ao carregar cliente:', loadError);
        setClient(null);
        setError(
          getErrorMessage(loadError, 'Não foi possível carregar o cliente.')
        );
      } finally {
        setLoadingClient(false);
      }
    };

    void loadClient();
  }, [currentUser, userId]);

  useEffect(() => {
    setCredentials({
      site: clientAccess?.accessSite ?? '',
      username: clientAccess?.accessUsername ?? '',
      password: clientAccess?.accessPassword ?? '',
    });
  }, [clientAccess]);

  const handleRefresh = async (): Promise<void> => {
    if (refreshing) return;

    setRefreshing(true);
    setError('');

    try {
      await reloadOperationalData();
      addToast('Dados do cliente atualizados.', 'success');
    } catch (refreshError) {
      setError(
        getErrorMessage(refreshError, 'Não foi possível atualizar os dados.')
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopy = async (
    value: string | null | undefined,
    label: string
  ): Promise<void> => {
    const normalizedValue = String(value ?? '').trim();

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

  const handleSaveAccess = async (): Promise<void> => {
    if (!userId || savingAccess) return;

    const site = credentials.site.trim();
    const username = credentials.username.trim();
    const password = credentials.password.trim();

    if (!site || !username || !password) {
      setError('Informe o site, o usuário e a senha.');
      return;
    }

    setSavingAccess(true);
    setError('');

    try {
      await saveClientAccess(userId, {
        site,
        username,
        password,
      });

      setEditingAccess(false);
      setShowPassword(false);
      addToast('Acesso do cliente salvo com sucesso.', 'success');
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Não foi possível salvar o acesso.'));
    } finally {
      setSavingAccess(false);
    }
  };

  const handleSubscriptionStatus = async (
    status: SubscriptionStatus
  ): Promise<void> => {
    if (!subscription || updatingSubscription) return;

    setUpdatingSubscription(true);
    setError('');

    try {
      let startDate: string | undefined;
      let endDate: string | undefined;

      if (status === 'ativo' && subscription.status !== 'ativo') {
        const durationDays = currentPlan?.durationDays ?? 30;
        const start = new Date();
        const end = new Date(
          start.getTime() + durationDays * 24 * 60 * 60 * 1000
        );

        startDate = start.toISOString();
        endDate = end.toISOString();
      }

      await adminUpdateSubscription(
        subscription.id,
        status,
        startDate,
        endDate
      );

      addToast('Assinatura atualizada.', 'success');
    } catch (updateError) {
      setError(
        getErrorMessage(updateError, 'Não foi possível atualizar a assinatura.')
      );
    } finally {
      setUpdatingSubscription(false);
    }
  };

  if (authLoading || loadingClient) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        Carregando cliente...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (currentUser.role !== 'admin') {
    return <Navigate to="/cliente" replace />;
  }

  if (!userId || !client) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <button
          type="button"
          onClick={() => navigate('/admin/clientes')}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft size={16} />
          Voltar para clientes
        </button>

        <div className="mt-6 p-10 bg-card border border-border rounded-2xl text-center">
          <UserRound size={32} className="mx-auto text-muted-foreground" />
          <h1 className="mt-3 text-lg font-display font-bold text-foreground">
            Cliente não encontrado
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            O cliente pode ter sido removido ou o endereço está incorreto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/clientes')}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft size={16} />
            Voltar para clientes
          </button>

          <h1 className="mt-3 text-2xl font-display font-bold text-foreground">
            {client.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Informações, assinatura e acesso do cliente.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-50"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        <section className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 card-glow">
          <div className="flex items-center gap-2 mb-4">
            <UserRound size={18} className="text-primary" />
            <h2 className="font-display font-bold text-foreground">
              Dados do cliente
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Nome</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {client.name}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">WhatsApp</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {client.whatsapp || 'Não informado'}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Cadastrado em</p>
              <p className="mt-1 text-sm text-foreground">
                {formatDate(client.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Identificador</p>
              <p className="mt-1 text-xs font-mono text-foreground break-all">
                {client.id}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-5 card-glow">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={18} className="text-primary" />
            <h2 className="font-display font-bold text-foreground">
              Atendimentos
            </h2>
          </div>

          <p className="text-3xl font-display font-black text-foreground">
            {clientTickets.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {clientTickets.length === 1
              ? 'atendimento registrado'
              : 'atendimentos registrados'}
          </p>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        <section className="bg-card border border-border rounded-2xl p-5 card-glow">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={18} className="text-primary" />
            <h2 className="font-display font-bold text-foreground">
              Assinatura
            </h2>
          </div>

          {subscription ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Plano</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {currentPlan?.name || subscription.planId}
                  </p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${getSubscriptionBadgeClass(
                    subscription.status
                  )}`}
                >
                  {subscriptionStatusLabels[subscription.status]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted rounded-xl">
                  <p className="text-xs text-muted-foreground">Valor</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {formatCurrency(subscription.contractedPrice)}
                  </p>
                </div>

                <div className="p-3 bg-muted rounded-xl">
                  <p className="text-xs text-muted-foreground">Vencimento</p>
                  <p className="mt-1 text-sm text-foreground">
                    {formatDate(subscription.endDate)}
                  </p>
                </div>
              </div>

              <label className="block">
                <span className="text-xs text-muted-foreground">
                  Alterar status
                </span>
                <select
                  value={subscription.status}
                  disabled={updatingSubscription}
                  onChange={(event) =>
                    void handleSubscriptionStatus(
                      event.target.value as SubscriptionStatus
                    )
                  }
                  className="mt-1.5 w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground disabled:opacity-50"
                >
                  {subscriptionStatuses.map((status) => (
                    <option key={status} value={status}>
                      {subscriptionStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>

              {updatingSubscription && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  Atualizando assinatura...
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Este cliente não possui assinatura.
            </p>
          )}
        </section>

        <section className="bg-card border border-border rounded-2xl p-5 card-glow">
          <div className="flex items-center gap-2 mb-4">
            <Play size={18} className="text-primary" />
            <h2 className="font-display font-bold text-foreground">
              Teste gratuito
            </h2>
          </div>

          {trial ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold text-foreground">
                  {trial.status}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Dispositivo</span>
                <span className="text-foreground text-right">
                  {trial.device}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Modelo</span>
                <span className="text-foreground text-right">
                  {trial.model || 'Não informado'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/admin/testes/${trial.id}`)}
                className="w-full mt-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary hover:text-white transition-colors"
              >
                Abrir solicitação de teste
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Este cliente não possui solicitação de teste.
            </p>
          )}
        </section>
      </div>

      <section className="bg-card border border-border rounded-2xl p-5 card-glow">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-foreground">
              Credenciais de acesso
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Site, usuário e senha exibidos na área do cliente.
            </p>
          </div>

          {!editingAccess && (
            <button
              type="button"
              onClick={() => setEditingAccess(true)}
              className="px-3 py-2 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary hover:text-white transition-colors"
            >
              {clientAccess ? 'Editar acesso' : 'Informar acesso'}
            </button>
          )}
        </div>

        {editingAccess ? (
          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="text"
              inputMode="url"
              value={credentials.site}
              onChange={(event) =>
                setCredentials((previous) => ({
                  ...previous,
                  site: event.target.value,
                }))
              }
              placeholder="Site ou servidor"
              className="px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground"
            />

            <input
              type="text"
              value={credentials.username}
              onChange={(event) =>
                setCredentials((previous) => ({
                  ...previous,
                  username: event.target.value,
                }))
              }
              placeholder="Usuário"
              autoComplete="off"
              className="px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground"
            />

            <input
              type="text"
              value={credentials.password}
              onChange={(event) =>
                setCredentials((previous) => ({
                  ...previous,
                  password: event.target.value,
                }))
              }
              placeholder="Senha"
              autoComplete="off"
              className="px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground"
            />

            <div className="md:col-span-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingAccess(false);
                  setCredentials({
                    site: clientAccess?.accessSite ?? '',
                    username: clientAccess?.accessUsername ?? '',
                    password: clientAccess?.accessPassword ?? '',
                  });
                }}
                disabled={savingAccess}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-medium text-foreground disabled:opacity-50"
              >
                <X size={15} />
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => void handleSaveAccess()}
                disabled={
                  savingAccess ||
                  !credentials.site.trim() ||
                  !credentials.username.trim() ||
                  !credentials.password.trim()
                }
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {savingAccess ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                {savingAccess ? 'Salvando...' : 'Salvar acesso'}
              </button>
            </div>
          </div>
        ) : clientAccess ? (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="p-3 bg-muted border border-border rounded-xl">
              <p className="text-xs text-muted-foreground">Site</p>
              <div className="mt-1 flex items-center gap-1">
                <a
                  href={normalizeExternalUrl(clientAccess.accessSite ?? '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1 text-sm text-primary font-medium break-all hover:underline"
                >
                  {clientAccess.accessSite || 'Não informado'}
                </a>
                <button
                  type="button"
                  onClick={() =>
                    void handleCopy(clientAccess.accessSite, 'Site')
                  }
                  className="p-1.5 text-muted-foreground hover:text-foreground"
                  title="Copiar site"
                >
                  <Copy size={14} />
                </button>
                <a
                  href={normalizeExternalUrl(clientAccess.accessSite ?? '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-muted-foreground hover:text-primary"
                  title="Abrir site"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            <div className="p-3 bg-muted border border-border rounded-xl">
              <p className="text-xs text-muted-foreground">Usuário</p>
              <div className="mt-1 flex items-center gap-1">
                <p className="min-w-0 flex-1 text-sm font-medium text-foreground break-all">
                  {clientAccess.accessUsername || 'Não informado'}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    void handleCopy(clientAccess.accessUsername, 'Usuário')
                  }
                  className="p-1.5 text-muted-foreground hover:text-foreground"
                  title="Copiar usuário"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <div className="p-3 bg-muted border border-border rounded-xl">
              <p className="text-xs text-muted-foreground">Senha</p>
              <div className="mt-1 flex items-center gap-1">
                <p className="min-w-0 flex-1 text-sm font-mono font-semibold text-foreground break-all">
                  {showPassword
                    ? clientAccess.accessPassword || 'Não informada'
                    : '••••••••••••'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="p-1.5 text-muted-foreground hover:text-foreground"
                  title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void handleCopy(clientAccess.accessPassword, 'Senha')
                  }
                  className="p-1.5 text-muted-foreground hover:text-foreground"
                  title="Copiar senha"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <div className="md:col-span-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
              <Check size={14} className="text-success" />
              Credenciais atualizadas em{' '}
              {formatDate(clientAccess.updatedAt ?? clientAccess.createdAt)}.
            </div>
          </div>
        ) : (
          <div className="p-6 bg-muted border border-border rounded-xl text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma credencial cadastrada para este cliente.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
