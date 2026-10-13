import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ElementType } from 'react';
import {
  AlertCircle,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  KeyRound,
  Loader2,
  MessageCircle,
  Play,
  RefreshCw,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import type { SubscriptionStatus, TrialStatus, User } from '../../types';

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

type StatCardProps = {
  icon: ElementType;
  label: string;
  value: number | string;
  color: string;
  onClick?: () => void;
};

const subscriptionStatusLabels: Record<SubscriptionStatus, string> = {
  sem_assinatura: 'Sem assinatura',
  aguardando_pagamento: 'Aguardando pagamento',
  ativo: 'Ativo',
  teste_ativo: 'Teste ativo',
  vencido: 'Vencido',
  cancelado: 'Cancelado',
  suspenso: 'Suspenso',
};

const trialStatusLabels: Record<TrialStatus, string> = {
  disponivel: 'Disponível',
  aguardando: 'Aguardando',
  aprovado: 'Aprovado',
  ativo: 'Ativo',
  finalizado: 'Finalizado',
  expirado: 'Expirado',
  indisponivel: 'Indisponível',
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

function getTrialBadgeClass(status: TrialStatus): string {
  if (status === 'ativo') {
    return 'bg-success/10 text-success border-success/20';
  }

  if (status === 'aguardando' || status === 'aprovado') {
    return 'bg-warning/10 text-warning border-warning/20';
  }

  if (status === 'expirado' || status === 'indisponivel') {
    return 'bg-destructive/10 text-destructive border-destructive/20';
  }

  return 'bg-muted text-muted-foreground border-border';
}

function StatCard({ icon: Icon, label, value, color, onClick }: StatCardProps) {
  const content = (
    <>
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}
      >
        <Icon size={18} className="text-white" />
      </div>

      <p className="text-2xl font-display font-black text-foreground">
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full bg-card border border-border rounded-2xl p-5 card-glow text-left hover:border-primary/50 hover:-translate-y-0.5 transition-all"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 card-glow">
      {content}
    </div>
  );
}

export default function AdminDashboard() {
  const {
    currentUser,
    authLoading,
    plansLoading,
    plansError,
    reloadPlans,
    reloadOperationalData,
    allClientAccesses,
    allSubscriptions,
    allTrialRequests,
    allTickets,
    addToast,
  } = useApp();

  const navigate = useNavigate();

  const [clients, setClients] = useState<User[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clientsError, setClientsError] = useState('');
  const [actionError, setActionError] = useState('');

  const loadClients = useCallback(async (): Promise<void> => {
    if (!currentUser || currentUser.role !== 'admin') {
      setClients([]);
      setClientsLoading(false);
      return;
    }

    setClientsLoading(true);
    setClientsError('');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'id, name, whatsapp, role, theme, admin_id, created_at, updated_at'
        )
        .eq('role', 'client')
        .eq('admin_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setClients(
        ((data ?? []) as ProfileRow[]).map((profile) => ({
          id: profile.id,
          name: profile.name || 'Usuário sem nome',
          email: '',
          whatsapp: profile.whatsapp || '',
          role: 'client',
          theme: profile.theme === 'light' ? 'light' : 'dark',
          createdAt: profile.created_at || new Date().toISOString(),
          updatedAt:
            profile.updated_at ||
            profile.created_at ||
            new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setClients([]);
      setClientsError(
        getErrorMessage(error, 'Não foi possível carregar os clientes.')
      );
    } finally {
      setClientsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  const clientsById = useMemo(
    () => new Map(clients.map((client) => [client.id, client])),
    [clients]
  );

  const activeSubscriptions = useMemo(
    () =>
      allSubscriptions.filter(
        (subscription) => subscription.status === 'ativo'
      ),
    [allSubscriptions]
  );

  const pendingSubscriptions = useMemo(
    () =>
      allSubscriptions.filter(
        (subscription) => subscription.status === 'aguardando_pagamento'
      ),
    [allSubscriptions]
  );

  const pendingTrials = useMemo(
    () => allTrialRequests.filter((trial) => trial.status === 'aguardando'),
    [allTrialRequests]
  );

  const activeTrials = useMemo(
    () => allTrialRequests.filter((trial) => trial.status === 'ativo'),
    [allTrialRequests]
  );

  const openTickets = useMemo(
    () => allTickets.filter((ticket) => ticket.status !== 'encerrado'),
    [allTickets]
  );

  const clientsWithAccess = useMemo(
    () =>
      allClientAccesses.filter(
        (access) =>
          Boolean(access.accessSite?.trim()) &&
          Boolean(access.accessUsername?.trim()) &&
          Boolean(access.accessPassword?.trim())
      ),
    [allClientAccesses]
  );

  const estimatedRevenue = useMemo(
    () =>
      activeSubscriptions.reduce(
        (total, subscription) => total + subscription.contractedPrice,
        0
      ),
    [activeSubscriptions]
  );

  const recentClients = useMemo(() => clients.slice(0, 5), [clients]);

  const recentTrials = useMemo(
    () =>
      [...allTrialRequests]
        .sort(
          (first, second) =>
            new Date(second.createdAt).getTime() -
            new Date(first.createdAt).getTime()
        )
        .slice(0, 5),
    [allTrialRequests]
  );

  const recentPendingSubscriptions = useMemo(
    () =>
      [...pendingSubscriptions]
        .sort(
          (first, second) =>
            new Date(second.createdAt).getTime() -
            new Date(first.createdAt).getTime()
        )
        .slice(0, 5),
    [pendingSubscriptions]
  );

  const getClientName = (userId: string): string =>
    clientsById.get(userId)?.name || 'Cliente não encontrado';

  const handleRefresh = async (): Promise<void> => {
    if (refreshing) return;

    setRefreshing(true);
    setActionError('');

    try {
      await Promise.all([
        loadClients(),
        reloadPlans(),
        reloadOperationalData(),
      ]);

      addToast('Painel atualizado.', 'success');
    } catch (error) {
      setActionError(
        getErrorMessage(error, 'Não foi possível atualizar o painel.')
      );
    } finally {
      setRefreshing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        Carregando sessão...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (currentUser.role !== 'admin') {
    return <Navigate to="/cliente" replace />;
  }

  const firstName = currentUser.name.trim().split(/\s+/)[0] || 'Admin';
  const loading = clientsLoading || plansLoading || refreshing;
  const visibleErrors = [clientsError, plansError, actionError].filter(Boolean);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Painel administrativo
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Olá, {firstName}. Veja os principais dados e pendências da
            plataforma.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Atualizar painel
        </button>
      </div>

      {visibleErrors.length > 0 && (
        <div className="mb-6 space-y-2">
          {visibleErrors.map((error, index) => (
            <div
              key={`${error}-${index}`}
              className="px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive"
            >
              {error}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard
          icon={Users}
          label="Total de clientes"
          value={clients.length}
          color="gradient-bg"
          onClick={() => navigate('/admin/clientes')}
        />

        <StatCard
          icon={CreditCard}
          label="Assinaturas ativas"
          value={activeSubscriptions.length}
          color="bg-success"
          onClick={() => navigate('/admin/clientes')}
        />

        <StatCard
          icon={Clock3}
          label="Pagamentos pendentes"
          value={pendingSubscriptions.length}
          color="bg-warning"
          onClick={() => navigate('/admin/clientes')}
        />

        <StatCard
          icon={Play}
          label="Testes aguardando"
          value={pendingTrials.length}
          color="bg-accent"
          onClick={() => navigate('/admin/testes')}
        />

        <StatCard
          icon={AlertCircle}
          label="Testes ativos"
          value={activeTrials.length}
          color="bg-primary"
          onClick={() => navigate('/admin/testes')}
        />

        <StatCard
          icon={TrendingUp}
          label="Receita estimada*"
          value={formatCurrency(estimatedRevenue)}
          color="bg-primary"
        />
      </div>

      <p className="text-xs text-muted-foreground mb-6">
        *Soma dos valores contratados das assinaturas ativas. Não representa
        receita confirmada por gateway de pagamento.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <button
          type="button"
          onClick={() => navigate('/admin/clientes')}
          className="bg-card border border-border rounded-2xl p-5 card-glow text-left hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users size={18} />
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </div>
          <p className="mt-4 font-display font-bold text-foreground">
            Gerenciar clientes
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Consulte assinaturas, acessos e atendimentos.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/testes')}
          className="bg-card border border-border rounded-2xl p-5 card-glow text-left hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <Play size={18} />
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </div>
          <p className="mt-4 font-display font-bold text-foreground">
            Gerenciar testes
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Aprove, ative, finalize ou exclua solicitações.
          </p>
        </button>

        <div className="bg-card border border-border rounded-2xl p-5 card-glow">
          <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
            <KeyRound size={18} />
          </div>
          <p className="mt-4 text-2xl font-display font-black text-foreground">
            {clientsWithAccess.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            clientes com credenciais configuradas
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/chamados')}
          className="bg-card border border-border rounded-2xl p-5 card-glow text-left hover:border-warning/50 transition-colors"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
              <MessageCircle size={18} />
            </div>

            <ChevronRight size={18} className="text-muted-foreground" />
          </div>

          <p className="mt-4 text-2xl font-display font-black text-foreground">
            {openTickets.length}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            atendimentos ainda não encerrados
          </p>
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2 mb-6">
        <section className="bg-card border border-border rounded-2xl overflow-hidden card-glow">
          <div className="p-4 border-b border-border flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display font-bold text-foreground">
                Clientes recentes
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Últimos cadastros realizados.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/admin/clientes')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Ver todos
              <ChevronRight size={13} />
            </button>
          </div>

          {clientsLoading ? (
            <div className="p-10 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 size={17} className="animate-spin" />
              Carregando clientes...
            </div>
          ) : recentClients.length === 0 ? (
            <div className="p-10 text-center">
              <UserRound size={28} className="mx-auto text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                Nenhum cliente cadastrado.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentClients.map((client) => {
                const subscription = allSubscriptions.find(
                  (item) => item.userId === client.id
                );

                return (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => navigate(`/admin/clientes/${client.id}`)}
                    className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="w-9 h-9 shrink-0 rounded-full gradient-bg text-white text-xs font-bold flex items-center justify-center">
                        {client.name
                          .trim()
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((part) => part.charAt(0))
                          .join('')
                          .toUpperCase() || 'CL'}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {client.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {client.whatsapp || 'WhatsApp não informado'}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      <span className="hidden sm:inline text-[11px] text-muted-foreground">
                        {subscription
                          ? subscriptionStatusLabels[subscription.status]
                          : 'Sem assinatura'}
                      </span>
                      <ChevronRight
                        size={15}
                        className="text-muted-foreground"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="bg-card border border-border rounded-2xl overflow-hidden card-glow">
          <div className="p-4 border-b border-border flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display font-bold text-foreground">
                Testes recentes
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Solicitações mais recentes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/admin/testes')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Ver todos
              <ChevronRight size={13} />
            </button>
          </div>

          {recentTrials.length === 0 ? (
            <div className="p-10 text-center">
              <Play size={28} className="mx-auto text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                Nenhuma solicitação de teste.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentTrials.map((trial) => (
                <button
                  key={trial.id}
                  type="button"
                  onClick={() => navigate(`/admin/testes/${trial.id}`)}
                  className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {getClientName(trial.userId)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {trial.device}
                      {trial.model ? ` · ${trial.model}` : ''}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <span
                      className={`px-2 py-1 border rounded-full text-[10px] font-semibold ${getTrialBadgeClass(
                        trial.status
                      )}`}
                    >
                      {trialStatusLabels[trial.status]}
                    </span>
                    <ChevronRight size={15} className="text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="bg-card border border-border rounded-2xl overflow-hidden card-glow">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <CircleDollarSign size={18} className="text-warning" />
            <h2 className="font-display font-bold text-foreground">
              Solicitações de plano pendentes
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Clientes aguardando confirmação de pagamento ou ativação.
          </p>
        </div>

        {recentPendingSubscriptions.length === 0 ? (
          <div className="p-10 text-center">
            <CreditCard size={28} className="mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              Não há solicitações de plano pendentes.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentPendingSubscriptions.map((subscription) => (
              <button
                key={subscription.id}
                type="button"
                onClick={() =>
                  navigate(`/admin/clientes/${subscription.userId}`)
                }
                className="w-full p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-left hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {getClientName(subscription.userId)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Solicitado em {formatDate(subscription.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(subscription.contractedPrice)}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-warning/10 text-warning text-[10px] font-semibold">
                    Aguardando pagamento
                  </span>
                  <ChevronRight size={15} className="text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
