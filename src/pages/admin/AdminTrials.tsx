import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  KeyRound,
  Loader2,
  Play,
  RefreshCw,
  Search,
  Smartphone,
  XCircle,
} from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import type { TrialRequest, TrialStatus, User } from '../../types';

const MAIN_ADMIN_ID = '865d67d0-ca9c-4476-92bd-72262388fe67';

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

type TrialStatusFilter = 'all' | TrialStatus;

const trialStatusLabels: Record<TrialStatus, string> = {
  disponivel: 'Disponível',
  aguardando: 'Aguardando',
  aprovado: 'Aprovado',
  ativo: 'Ativo',
  finalizado: 'Finalizado',
  expirado: 'Expirado',
  indisponivel: 'Indisponível',
};

const statusFilters: Array<{
  value: TrialStatusFilter;
  label: string;
}> = [
  { value: 'all', label: 'Todos os testes' },
  { value: 'aguardando', label: 'Aguardando' },
  { value: 'aprovado', label: 'Aprovados' },
  { value: 'ativo', label: 'Ativos' },
  { value: 'finalizado', label: 'Finalizados' },
  { value: 'expirado', label: 'Expirados' },
  { value: 'indisponivel', label: 'Indisponíveis' },
  { value: 'disponivel', label: 'Disponíveis' },
];

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

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

function getInitials(name: string | undefined): string {
  if (!name) return 'CL';

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  return initials || 'CL';
}

export default function AdminTrials() {
  const {
    currentUser,
    authLoading,
    allTrialRequests,
    reloadOperationalData,
    addToast,
  } = useApp();

  const navigate = useNavigate();

  const [clients, setClients] = useState<User[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TrialStatusFilter>('all');

  const loadClients = useCallback(async (): Promise<void> => {
    if (!currentUser || currentUser.role !== 'admin') {
      setClients([]);
      setClientsLoading(false);
      return;
    }

    setClientsLoading(true);
    setError('');

    try {
      let profilesQuery = supabase
        .from('profiles')
        .select(
          'id, name, whatsapp, role, theme, admin_id, created_at, updated_at'
        )
        .eq('role', 'client')
        .order('created_at', { ascending: false });

      if (currentUser.id !== MAIN_ADMIN_ID) {
        profilesQuery = profilesQuery.eq('admin_id', currentUser.id);
      }

      const { data, error: profilesError } = await profilesQuery;

      if (profilesError) throw profilesError;

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
    } catch (loadError) {
      console.error('Erro ao carregar clientes dos testes:', loadError);
      setClients([]);
      setError(
        getErrorMessage(
          loadError,
          'Não foi possível carregar os clientes dos testes.'
        )
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

  const sortedTrials = useMemo(
    () =>
      [...allTrialRequests].sort(
        (first, second) =>
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime()
      ),
    [allTrialRequests]
  );

  const trialRows = useMemo(
    () =>
      sortedTrials.map((trial) => {
        const client = clientsById.get(trial.userId) ?? null;
        const hasCredentials = Boolean(
          trial.accessSite?.trim() &&
            trial.accessUsername?.trim() &&
            trial.accessPassword?.trim()
        );

        return {
          trial,
          client,
          hasCredentials,
        };
      }),
    [sortedTrials, clientsById]
  );

  const filteredRows = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');

    return trialRows.filter(({ trial, client }) => {
      const matchesStatus =
        statusFilter === 'all' || trial.status === statusFilter;

      if (!matchesStatus) return false;
      if (!term) return true;

      return [
        client?.name,
        client?.whatsapp,
        trial.device,
        trial.model,
        trial.id,
        trial.userId,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLocaleLowerCase('pt-BR').includes(term)
        );
    });
  }, [trialRows, search, statusFilter]);

  const statistics = useMemo(
    () => ({
      total: allTrialRequests.length,
      waiting: allTrialRequests.filter((trial) => trial.status === 'aguardando')
        .length,
      active: allTrialRequests.filter((trial) => trial.status === 'ativo')
        .length,
      finished: allTrialRequests.filter(
        (trial) => trial.status === 'finalizado'
      ).length,
      expired: allTrialRequests.filter((trial) => trial.status === 'expirado')
        .length,
      unavailable: allTrialRequests.filter(
        (trial) => trial.status === 'indisponivel'
      ).length,
      withCredentials: allTrialRequests.filter(
        (trial) =>
          Boolean(trial.accessSite?.trim()) &&
          Boolean(trial.accessUsername?.trim()) &&
          Boolean(trial.accessPassword?.trim())
      ).length,
    }),
    [allTrialRequests]
  );

  const handleRefresh = async (): Promise<void> => {
    if (refreshing) return;

    setRefreshing(true);
    setError('');

    try {
      await Promise.all([loadClients(), reloadOperationalData()]);
      addToast('Lista de testes atualizada.', 'success');
    } catch (refreshError) {
      setError(
        getErrorMessage(
          refreshError,
          'Não foi possível atualizar a lista de testes.'
        )
      );
    } finally {
      setRefreshing(false);
    }
  };

  const openTrial = (trial: TrialRequest): void => {
    navigate(`/admin/testes/${trial.id}`);
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

  const loading = clientsLoading || refreshing;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Testes gratuitos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Consulte e gerencie todas as solicitações de teste.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className="bg-card border border-border rounded-2xl p-4 card-glow text-left hover:border-primary/50 transition-colors"
        >
          <Play size={18} className="text-primary" />
          <p className="mt-3 text-2xl font-display font-black text-foreground">
            {statistics.total}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total de testes</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('aguardando')}
          className="bg-card border border-border rounded-2xl p-4 card-glow text-left hover:border-warning/50 transition-colors"
        >
          <Clock3 size={18} className="text-warning" />
          <p className="mt-3 text-2xl font-display font-black text-foreground">
            {statistics.waiting}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Aguardando análise
          </p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('ativo')}
          className="bg-card border border-border rounded-2xl p-4 card-glow text-left hover:border-success/50 transition-colors"
        >
          <CheckCircle2 size={18} className="text-success" />
          <p className="mt-3 text-2xl font-display font-black text-foreground">
            {statistics.active}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Testes ativos</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('finalizado')}
          className="bg-card border border-border rounded-2xl p-4 card-glow text-left hover:border-primary/50 transition-colors"
        >
          <CheckCircle2 size={18} className="text-primary" />
          <p className="mt-3 text-2xl font-display font-black text-foreground">
            {statistics.finished}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Finalizados</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('expirado')}
          className="bg-card border border-border rounded-2xl p-4 card-glow text-left hover:border-destructive/50 transition-colors"
        >
          <Clock3 size={18} className="text-destructive" />
          <p className="mt-3 text-2xl font-display font-black text-foreground">
            {statistics.expired}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Expirados</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('indisponivel')}
          className="bg-card border border-border rounded-2xl p-4 card-glow text-left hover:border-destructive/50 transition-colors"
        >
          <XCircle size={18} className="text-destructive" />
          <p className="mt-3 text-2xl font-display font-black text-foreground">
            {statistics.unavailable}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Indisponíveis</p>
        </button>

        <div className="bg-card border border-border rounded-2xl p-4 card-glow">
          <KeyRound size={18} className="text-accent" />
          <p className="mt-3 text-2xl font-display font-black text-foreground">
            {statistics.withCredentials}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Com credenciais</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden card-glow">
        <div className="p-4 border-b border-border flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full items-center gap-3 rounded-xl border border-border bg-muted px-4 lg:max-w-md">
            <Search
              size={16}
              aria-hidden="true"
              className="shrink-0 text-muted-foreground"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar cliente, dispositivo ou ID"
              className="admin-search-input min-w-0 flex-1 border-0 bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:outline-none focus:ring-0"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as TrialStatusFilter)
            }
            className="w-full lg:w-auto px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground"
          >
            {statusFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>

        {clientsLoading ? (
          <div className="p-12 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 size={18} className="animate-spin" />
            Carregando testes...
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-12 text-center">
            <Play size={32} className="mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              Nenhum teste encontrado
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Altere a busca ou o filtro selecionado.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Dispositivo
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Credenciais
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Período
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Solicitação
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Ação
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map(({ trial, client, hasCredentials }) => (
                  <tr
                    key={trial.id}
                    className="border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 min-w-[210px]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 shrink-0 rounded-full gradient-bg text-white flex items-center justify-center text-xs font-bold">
                          {getInitials(client?.name)}
                        </div>

                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (client) {
                                navigate(`/admin/clientes/${client.id}`);
                              }
                            }}
                            disabled={!client}
                            className="block max-w-[180px] truncate text-left font-semibold text-foreground hover:text-primary disabled:hover:text-foreground"
                          >
                            {client?.name || 'Cliente não encontrado'}
                          </button>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {client?.whatsapp || 'WhatsApp não informado'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 min-w-[180px]">
                      <div className="flex items-start gap-2">
                        <Smartphone
                          size={14}
                          className="mt-0.5 shrink-0 text-muted-foreground"
                        />
                        <div>
                          <p className="text-sm text-foreground">
                            {trial.device}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {trial.model || 'Modelo não informado'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 min-w-[140px]">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full border text-[11px] font-semibold ${getTrialBadgeClass(
                          trial.status
                        )}`}
                      >
                        {trialStatusLabels[trial.status] || trial.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 min-w-[150px]">
                      {hasCredentials ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                          <KeyRound size={13} />
                          Configuradas
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Não informadas
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 min-w-[220px] text-xs text-muted-foreground">
                      <p>
                        <span className="font-medium text-foreground">
                          Início:
                        </span>{' '}
                        {formatDate(trial.startDate)}
                      </p>
                      <p className="mt-1">
                        <span className="font-medium text-foreground">
                          Fim:
                        </span>{' '}
                        {formatDate(trial.endDate)}
                      </p>
                    </td>

                    <td className="px-4 py-3 min-w-[150px] text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(trial.createdAt)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openTrial(trial)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary hover:text-white transition-colors"
                      >
                        Gerenciar
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
