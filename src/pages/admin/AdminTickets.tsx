import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronRight,
  CircleCheck,
  Clock3,
  Loader2,
  MessageCircle,
  RefreshCw,
  Search,
  UserRound,
} from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import type { TicketStatus } from '../../types';

type ProfileRow = {
  id: string;
  name: string | null;
  whatsapp: string | null;
};

type TicketFilter = 'todos' | 'abertos' | 'aguardando_cliente' | 'encerrados';

const statusLabels: Partial<Record<TicketStatus, string>> = {
  aberto: 'Aberto',
  aguardando_cliente: 'Aguardando cliente',
  encerrado: 'Encerrado',
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
  if (Number.isNaN(date.getTime())) return 'Não informado';

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusClass(status: TicketStatus): string {
  if (status === 'encerrado') {
    return 'bg-success/10 text-success border-success/20';
  }

  if (status === 'aguardando_cliente') {
    return 'bg-warning/10 text-warning border-warning/20';
  }

  return 'bg-primary/10 text-primary border-primary/20';
}

export default function AdminTickets() {
  const {
    currentUser,
    authLoading,
    dataLoading,
    allTickets,
    reloadOperationalData,
    addToast,
  } = useApp();

  const navigate = useNavigate();

  const [clientsById, setClientsById] = useState<Map<string, ProfileRow>>(
    new Map()
  );
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TicketFilter>('abertos');

  const loadTicketClients = useCallback(async (): Promise<void> => {
    if (!currentUser || currentUser.role !== 'admin') {
      setClientsById(new Map());
      setProfilesLoading(false);
      return;
    }

    setProfilesLoading(true);

    try {
      const clientIds = Array.from(
        new Set(allTickets.map((ticket) => ticket.userId).filter(Boolean))
      );

      if (clientIds.length === 0) {
        setClientsById(new Map());
        return;
      }

      const { data, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, whatsapp')
        .in('id', clientIds);

      if (profilesError) throw profilesError;

      const profiles = (data ?? []) as ProfileRow[];
      setClientsById(new Map(profiles.map((profile) => [profile.id, profile])));
    } catch (loadError) {
      console.error('Erro ao carregar clientes dos chamados:', loadError);
      setClientsById(new Map());
      setError(
        getErrorMessage(
          loadError,
          'Não foi possível carregar os clientes dos chamados.'
        )
      );
    } finally {
      setProfilesLoading(false);
    }
  }, [allTickets, currentUser]);

  useEffect(() => {
    void loadTicketClients();
  }, [loadTicketClients]);

  const statistics = useMemo(
    () => ({
      total: allTickets.length,
      open: allTickets.filter((ticket) => ticket.status === 'aberto').length,
      waiting: allTickets.filter(
        (ticket) => ticket.status === 'aguardando_cliente'
      ).length,
      closed: allTickets.filter((ticket) => ticket.status === 'encerrado')
        .length,
    }),
    [allTickets]
  );

  const filteredTickets = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');

    return [...allTickets]
      .filter((ticket) => {
        if (filter === 'abertos' && ticket.status === 'encerrado') return false;
        if (
          filter === 'aguardando_cliente' &&
          ticket.status !== 'aguardando_cliente'
        ) {
          return false;
        }
        if (filter === 'encerrados' && ticket.status !== 'encerrado')
          return false;

        if (!term) return true;

        const client = clientsById.get(ticket.userId);
        return [
          ticket.id,
          ticket.subject,
          ticket.category,
          client?.name,
          client?.whatsapp,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLocaleLowerCase('pt-BR').includes(term)
          );
      })
      .sort(
        (first, second) =>
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime()
      );
  }, [allTickets, clientsById, filter, search]);

  const handleRefresh = async (): Promise<void> => {
    if (refreshing) return;

    setRefreshing(true);
    setError('');

    try {
      await reloadOperationalData();
      addToast('Chamados atualizados.', 'success');
    } catch (refreshError) {
      setError(
        getErrorMessage(refreshError, 'Não foi possível atualizar os chamados.')
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

  if (!currentUser) return <Navigate to="/" replace />;
  if (currentUser.role !== 'admin') return <Navigate to="/cliente" replace />;

  const loading = dataLoading || profilesLoading || refreshing;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Chamados
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualize, responda e encerre os atendimentos atribuídos a você.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => setFilter('todos')}
          className="rounded-2xl border border-border bg-card p-4 text-left card-glow hover:border-primary/50"
        >
          <MessageCircle size={18} className="text-primary" />
          <p className="mt-3 text-2xl font-display font-black text-foreground">
            {statistics.total}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Total</p>
        </button>

        <button
          type="button"
          onClick={() => setFilter('abertos')}
          className="rounded-2xl border border-border bg-card p-4 text-left card-glow hover:border-primary/50"
        >
          <MessageCircle size={18} className="text-primary" />
          <p className="mt-3 text-2xl font-display font-black text-foreground">
            {statistics.open}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Abertos</p>
        </button>

        <button
          type="button"
          onClick={() => setFilter('aguardando_cliente')}
          className="rounded-2xl border border-border bg-card p-4 text-left card-glow hover:border-warning/50"
        >
          <Clock3 size={18} className="text-warning" />
          <p className="mt-3 text-2xl font-display font-black text-foreground">
            {statistics.waiting}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Aguardando cliente
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFilter('encerrados')}
          className="rounded-2xl border border-border bg-card p-4 text-left card-glow hover:border-success/50"
        >
          <CircleCheck size={18} className="text-success" />
          <p className="mt-3 text-2xl font-display font-black text-foreground">
            {statistics.closed}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Encerrados</p>
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card card-glow">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
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
              placeholder="Buscar por cliente, assunto, categoria ou ID..."
              className="admin-search-input min-w-0 flex-1 border-0 bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:outline-none focus:ring-0"
            />
          </div>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as TicketFilter)}
            className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-foreground lg:w-auto"
          >
            <option value="todos">Todos</option>
            <option value="abertos">Não encerrados</option>
            <option value="aguardando_cliente">Aguardando cliente</option>
            <option value="encerrados">Encerrados</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground">
            <Loader2 size={18} className="animate-spin" />
            Carregando chamados...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <MessageCircle
              size={32}
              className="mx-auto text-muted-foreground"
            />
            <p className="mt-3 text-sm font-semibold text-foreground">
              Nenhum chamado encontrado
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Altere a busca ou o filtro selecionado.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredTickets.map((ticket) => {
              const client = clientsById.get(ticket.userId);

              return (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => navigate(`/admin/chamados/${ticket.id}`)}
                  className="flex w-full flex-col gap-3 p-4 text-left transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UserRound size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {ticket.subject}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {client?.name || 'Cliente não encontrado'} ·{' '}
                        {ticket.category}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Aberto em {formatDate(ticket.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                        ticket.status
                      )}`}
                    >
                      {statusLabels[ticket.status] || ticket.status}
                    </span>
                    <ChevronRight size={15} className="text-muted-foreground" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
