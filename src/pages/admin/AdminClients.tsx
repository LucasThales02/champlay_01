import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckSquare,
  ChevronRight,
  CreditCard,
  KeyRound,
  Loader2,
  MessageCircle,
  Play,
  RefreshCw,
  Search,
  Send,
  Square,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import type { SubscriptionStatus, TrialStatus, User } from '../../types';

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

type AdminOption = {
  id: string;
  name: string;
};

type StatusFilter = 'all' | 'active' | 'pending' | 'without-subscription';
type ResponsibleFilter = 'all' | 'unassigned' | string;

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
  if (Number.isNaN(date.getTime())) return 'Não informado';

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getSubscriptionBadgeClass(status: SubscriptionStatus): string {
  if (status === 'ativo') {
    return 'bg-success/10 text-success border-success/20';
  }

  if (status === 'aguardando_pagamento') {
    return 'bg-warning/10 text-warning border-warning/20';
  }

  if (status === 'cancelado' || status === 'vencido' || status === 'suspenso') {
    return 'bg-destructive/10 text-destructive border-destructive/20';
  }

  return 'bg-muted text-muted-foreground border-border';
}

function getTrialBadgeClass(status: TrialStatus): string {
  if (status === 'ativo') {
    return 'bg-success/10 text-success border-success/20';
  }

  if (status === 'aguardando' || status === 'aprovado') {
    return 'bg-warning/10 text-warning border-warning/20';
  }

  if (status === 'indisponivel') {
    return 'bg-destructive/10 text-destructive border-destructive/20';
  }

  return 'bg-muted text-muted-foreground border-border';
}

export default function AdminClients() {
  const {
    currentUser,
    authLoading,
    allClientAccesses,
    allSubscriptions,
    allTrialRequests,
    allTickets,
    reloadOperationalData,
    addToast,
  } = useApp();

  const navigate = useNavigate();

  const [clients, setClients] = useState<User[]>([]);
  const [clientAdminIds, setClientAdminIds] = useState<
    Record<string, string | null>
  >({});
  const [admins, setAdmins] = useState<AdminOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [responsibleFilter, setResponsibleFilter] =
    useState<ResponsibleFilter>('all');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [targetAdminId, setTargetAdminId] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);

  const isMainAdmin = currentUser?.id === MAIN_ADMIN_ID;

  const loadClientsAndAdmins = useCallback(async (): Promise<void> => {
    if (!currentUser || currentUser.role !== 'admin') {
      setClients([]);
      setAdmins([]);
      setClientAdminIds({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      let clientsQuery = supabase
        .from('profiles')
        .select(
          'id, name, whatsapp, role, theme, admin_id, created_at, updated_at'
        )
        .eq('role', 'client')
        .order('created_at', { ascending: false });

      if (currentUser.id !== MAIN_ADMIN_ID) {
        clientsQuery = clientsQuery.eq('admin_id', currentUser.id);
      }

      const adminsQuery = supabase
        .from('profiles')
        .select('id, name, role')
        .eq('role', 'admin')
        .order('name', { ascending: true });

      const [clientsResult, adminsResult] = await Promise.all([
        clientsQuery,
        adminsQuery,
      ]);

      if (clientsResult.error) throw clientsResult.error;
      if (adminsResult.error) throw adminsResult.error;

      const profileRows = (clientsResult.data ?? []) as ProfileRow[];

      setClients(
        profileRows.map((profile) => ({
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

      setClientAdminIds(
        Object.fromEntries(
          profileRows.map((profile) => [profile.id, profile.admin_id])
        )
      );

      setAdmins(
        (
          (adminsResult.data ?? []) as Array<{
            id: string;
            name: string | null;
            role: string | null;
          }>
        ).map((admin) => ({
          id: admin.id,
          name: admin.name || 'Administrador sem nome',
        }))
      );
    } catch (loadError) {
      console.error('Erro ao carregar clientes e administradores:', loadError);
      setClients([]);
      setAdmins([]);
      setClientAdminIds({});
      setError(
        getErrorMessage(
          loadError,
          'Não foi possível carregar clientes e administradores.'
        )
      );
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    void loadClientsAndAdmins();
  }, [loadClientsAndAdmins]);

  useEffect(() => {
    setSelectedClientIds([]);
  }, [responsibleFilter]);

  useEffect(() => {
    setSelectedClientIds([]);
  }, [responsibleFilter, statusFilter]);

  const adminsById = useMemo(
    () => new Map(admins.map((admin) => [admin.id, admin.name])),
    [admins]
  );

  const clientRows = useMemo(
    () =>
      clients.map((client) => {
        const subscription =
          allSubscriptions.find((item) => item.userId === client.id) ?? null;
        const trial =
          allTrialRequests.find((item) => item.userId === client.id) ?? null;
        const access =
          allClientAccesses.find((item) => item.userId === client.id) ?? null;
        const tickets = allTickets.filter((item) => item.userId === client.id);
        const openTickets = tickets.filter(
          (item) => item.status !== 'encerrado'
        ).length;
        const assignedAdminId = clientAdminIds[client.id] ?? null;

        return {
          client,
          subscription,
          trial,
          assignedAdminId,
          assignedAdminName: assignedAdminId
            ? adminsById.get(assignedAdminId) || 'Administrador não encontrado'
            : 'Sem responsável',
          ticketsCount: tickets.length,
          openTickets,
          hasCompleteAccess: Boolean(
            access?.accessSite?.trim() &&
              access.accessUsername?.trim() &&
              access.accessPassword?.trim()
          ),
        };
      }),
    [
      clients,
      allClientAccesses,
      allSubscriptions,
      allTickets,
      allTrialRequests,
      clientAdminIds,
      adminsById,
    ]
  );

  const filteredRows = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');

    return clientRows.filter((row) => {
      const matchesSearch =
        !term ||
        [
          row.client.name,
          row.client.whatsapp,
          row.client.id,
          row.assignedAdminName,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLocaleLowerCase('pt-BR').includes(term)
          );

      if (!matchesSearch) {
        return false;
      }

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && row.subscription?.status === 'ativo') ||
        (statusFilter === 'pending' &&
          row.subscription?.status === 'aguardando_pagamento') ||
        (statusFilter === 'without-subscription' && !row.subscription);

      if (!matchesStatus) {
        return false;
      }

      if (!isMainAdmin) {
        return true;
      }

      const matchesResponsible =
        responsibleFilter === 'all' ||
        (responsibleFilter === 'unassigned' && !row.assignedAdminId) ||
        row.assignedAdminId === responsibleFilter;

      return matchesResponsible;
    });
  }, [clientRows, search, statusFilter, responsibleFilter, isMainAdmin]);

  const visibleClientIds = useMemo(
    () => filteredRows.map((row) => row.client.id),
    [filteredRows]
  );

  const selectedIdSet = useMemo(
    () => new Set(selectedClientIds),
    [selectedClientIds]
  );

  const allVisibleSelected =
    visibleClientIds.length > 0 &&
    visibleClientIds.every((id) => selectedIdSet.has(id));

  const someVisibleSelected =
    !allVisibleSelected && visibleClientIds.some((id) => selectedIdSet.has(id));

  const selectedClients = useMemo(
    () => clients.filter((client) => selectedIdSet.has(client.id)),
    [clients, selectedIdSet]
  );

  const statistics = useMemo(
    () => ({
      total: clientRows.length,
      active: clientRows.filter((row) => row.subscription?.status === 'ativo')
        .length,
      pending: clientRows.filter(
        (row) => row.subscription?.status === 'aguardando_pagamento'
      ).length,
      withAccess: clientRows.filter((row) => row.hasCompleteAccess).length,
    }),
    [clientRows]
  );

  const handleRefresh = async (): Promise<void> => {
    if (refreshing) return;

    setRefreshing(true);
    setError('');

    try {
      await Promise.all([loadClientsAndAdmins(), reloadOperationalData()]);
      setSelectedClientIds([]);
      addToast('Lista de clientes atualizada.', 'success');
    } catch (refreshError) {
      setError(
        getErrorMessage(refreshError, 'Não foi possível atualizar a lista.')
      );
    } finally {
      setRefreshing(false);
    }
  };

  const toggleClientSelection = (clientId: string): void => {
    setSelectedClientIds((previous) =>
      previous.includes(clientId)
        ? previous.filter((id) => id !== clientId)
        : [...previous, clientId]
    );
  };

  const toggleAllVisible = (): void => {
    setSelectedClientIds((previous) => {
      const next = new Set(previous);

      if (allVisibleSelected) {
        visibleClientIds.forEach((id) => next.delete(id));
      } else {
        visibleClientIds.forEach((id) => next.add(id));
      }

      return Array.from(next);
    });
  };

  const openTransferModal = (): void => {
    if (selectedClientIds.length === 0) {
      addToast('Selecione pelo menos um cliente.', 'error');
      return;
    }

    setTargetAdminId('');
    setShowTransferModal(true);
  };

  const handleBulkTransfer = async (): Promise<void> => {
    if (
      !currentUser ||
      currentUser.id !== MAIN_ADMIN_ID ||
      transferring ||
      selectedClientIds.length === 0 ||
      !targetAdminId
    ) {
      return;
    }

    const targetAdmin = admins.find((admin) => admin.id === targetAdminId);

    if (!targetAdmin) {
      setError('Administrador de destino inválido.');
      return;
    }

    setTransferring(true);
    setError('');

    try {
      const { data, error: transferError } = await supabase.rpc(
        'transfer_clients_to_admin',
        {
          p_client_ids: selectedClientIds,
          p_target_admin_id: targetAdminId,
        }
      );

      if (transferError) throw transferError;

      const transferredCount = Number(data ?? 0);

      if (
        !Number.isFinite(transferredCount) ||
        transferredCount !== selectedClientIds.length
      ) {
        throw new Error(
          `Foram transferidos ${transferredCount} de ${selectedClientIds.length} clientes.`
        );
      }

      await reloadOperationalData();
      await loadClientsAndAdmins();

      setSelectedClientIds([]);
      setShowTransferModal(false);
      setTargetAdminId('');

      addToast(
        `${transferredCount} ${
          transferredCount === 1
            ? 'cliente transferido'
            : 'clientes transferidos'
        } para ${targetAdmin.name}.`,
        'success'
      );
    } catch (transferError) {
      console.error('Erro ao transferir clientes:', transferError);
      setError(
        getErrorMessage(
          transferError,
          'Não foi possível transferir os clientes.'
        )
      );
      setShowTransferModal(false);
    } finally {
      setTransferring(false);
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
  if (currentUser.role !== 'admin') {
    return <Navigate to="/cliente" replace />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Clientes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isMainAdmin
              ? 'Consulte e distribua clientes entre os administradores.'
              : 'Consulte os clientes atribuídos ao seu usuário.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {isMainAdmin && selectedClientIds.length > 0 && (
            <button
              type="button"
              onClick={openTransferModal}
              disabled={transferring}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              <Send size={15} />
              Transferir selecionados ({selectedClientIds.length})
            </button>
          )}

          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={refreshing || loading ? 'animate-spin' : ''}
            />
            Atualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-2xl p-4 card-glow">
          <Users size={18} className="text-primary" />
          <p className="mt-3 text-2xl font-display font-black text-foreground">
            {statistics.total}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Total de clientes
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 card-glow">
          <CreditCard size={18} className="text-success" />
          <p className="mt-3 text-2xl font-display font-black text-foreground">
            {statistics.active}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Assinaturas ativas
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 card-glow">
          <Play size={18} className="text-warning" />
          <p className="mt-3 text-2xl font-display font-black text-foreground">
            {statistics.pending}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Aguardando pagamento
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 card-glow">
          <KeyRound size={18} className="text-primary" />
          <p className="mt-3 text-2xl font-display font-black text-foreground">
            {statistics.withAccess}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Com acesso configurado
          </p>
        </div>
      </div>

      {isMainAdmin && selectedClientIds.length > 0 && (
        <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {selectedClientIds.length}{' '}
              {selectedClientIds.length === 1
                ? 'cliente selecionado'
                : 'clientes selecionados'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              A operação sincroniza profiles, testes, tickets, assinaturas,
              pagamentos e acessos.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedClientIds([])}
              className="px-3 py-2 bg-muted border border-border rounded-xl text-xs font-semibold text-foreground"
            >
              Limpar seleção
            </button>
            <button
              type="button"
              onClick={openTransferModal}
              className="inline-flex items-center gap-2 px-3 py-2 gradient-bg text-white rounded-xl text-xs font-semibold"
            >
              <Send size={13} />
              Transferir
            </button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden card-glow">
        <div className="p-4 border-b border-border flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-full items-center gap-3 rounded-xl border border-border bg-muted px-4 xl:max-w-md">
            <Search
              size={16}
              aria-hidden="true"
              className="shrink-0 text-muted-foreground"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, WhatsApp, admin ou ID..."
              className="admin-search-input min-w-0 flex-1 border-0 bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:outline-none focus:ring-0"
            />
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
            {isMainAdmin && (
              <select
                value={responsibleFilter}
                onChange={(event) => setResponsibleFilter(event.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground sm:min-w-[220px]"
              >
                <option value="all">Todos os responsáveis</option>

                <option value="unassigned">Sem responsável</option>

                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name}
                    {admin.id === MAIN_ADMIN_ID ? ' (principal)' : ''}
                  </option>
                ))}
              </select>
            )}

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground sm:min-w-[200px]"
            >
              <option value="all">Todos os clientes</option>

              <option value="active">Assinatura ativa</option>

              <option value="pending">Aguardando pagamento</option>

              <option value="without-subscription">Sem assinatura</option>
            </select>
          </div>
        </div>
        {(search || statusFilter !== 'all' || responsibleFilter !== 'all') && (
          <div className="flex flex-col gap-2 border-b border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {filteredRows.length}{' '}
              {filteredRows.length === 1
                ? 'cliente encontrado'
                : 'clientes encontrados'}
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setResponsibleFilter('all');
              }}
              className="text-left text-xs font-semibold text-primary hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
        {loading ? (
          <div className="p-12 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 size={18} className="animate-spin" />
            Carregando clientes...
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-12 text-center">
            <UserRound size={32} className="mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              Nenhum cliente encontrado
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
                  {isMainAdmin && (
                    <th className="w-12 px-4 py-3 text-left">
                      <button
                        type="button"
                        onClick={toggleAllVisible}
                        className="p-1 text-muted-foreground hover:text-primary"
                        title={
                          allVisibleSelected
                            ? 'Desmarcar resultados visíveis'
                            : 'Selecionar resultados visíveis'
                        }
                      >
                        {allVisibleSelected ? (
                          <CheckSquare size={17} className="text-primary" />
                        ) : someVisibleSelected ? (
                          <CheckSquare size={17} className="text-warning" />
                        ) : (
                          <Square size={17} />
                        )}
                      </button>
                    </th>
                  )}
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Cliente
                  </th>
                  {isMainAdmin && (
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                      Responsável
                    </th>
                  )}
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Assinatura
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Teste
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Acesso
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Atendimentos
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Cadastro
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Ação
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => {
                  const selected = selectedIdSet.has(row.client.id);

                  return (
                    <tr
                      key={row.client.id}
                      className={`border-b border-border/50 last:border-b-0 transition-colors ${
                        selected ? 'bg-primary/5' : 'hover:bg-muted/30'
                      }`}
                    >
                      {isMainAdmin && (
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => toggleClientSelection(row.client.id)}
                            className="p-1 text-muted-foreground hover:text-primary"
                            aria-label={
                              selected
                                ? `Desmarcar ${row.client.name}`
                                : `Selecionar ${row.client.name}`
                            }
                          >
                            {selected ? (
                              <CheckSquare size={17} className="text-primary" />
                            ) : (
                              <Square size={17} />
                            )}
                          </button>
                        </td>
                      )}

                      <td className="px-4 py-3 min-w-[210px]">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/clientes/${row.client.id}`)
                          }
                          className="text-left"
                        >
                          <p className="font-semibold text-foreground hover:text-primary transition-colors">
                            {row.client.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {row.client.whatsapp || 'WhatsApp não informado'}
                          </p>
                        </button>
                      </td>

                      {isMainAdmin && (
                        <td className="px-4 py-3 min-w-[180px]">
                          <p className="text-xs font-medium text-foreground">
                            {row.assignedAdminName}
                          </p>
                        </td>
                      )}

                      <td className="px-4 py-3 min-w-[180px]">
                        {row.subscription ? (
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full border text-[11px] font-semibold ${getSubscriptionBadgeClass(
                              row.subscription.status
                            )}`}
                          >
                            {subscriptionStatusLabels[row.subscription.status]}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Sem assinatura
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 min-w-[150px]">
                        {row.trial ? (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/admin/testes/${row.trial!.id}`)
                            }
                            className={`inline-flex px-2.5 py-1 rounded-full border text-[11px] font-semibold hover:opacity-80 ${getTrialBadgeClass(
                              row.trial.status
                            )}`}
                          >
                            {trialStatusLabels[row.trial.status]}
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Sem solicitação
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 min-w-[150px]">
                        {row.hasCompleteAccess ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                            <KeyRound size={13} />
                            Configurado
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Não informado
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 min-w-[150px]">
                        <div className="flex items-center gap-2">
                          <MessageCircle
                            size={14}
                            className={
                              row.openTickets > 0
                                ? 'text-warning'
                                : 'text-muted-foreground'
                            }
                          />
                          <span className="text-sm text-foreground">
                            {row.ticketsCount}
                          </span>
                          {row.openTickets > 0 && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-warning/10 text-warning">
                              {row.openTickets}{' '}
                              {row.openTickets === 1 ? 'aberto' : 'abertos'}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                        {formatDate(row.client.createdAt)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/clientes/${row.client.id}`)
                          }
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary hover:text-white transition-colors"
                        >
                          Ver cliente
                          <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showTransferModal && isMainAdmin && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-transfer-title"
        >
          <button
            type="button"
            className="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-sm"
            onClick={() => {
              if (!transferring) setShowTransferModal(false);
            }}
            disabled={transferring}
            aria-label="Cancelar transferência"
          />

          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6">
            <button
              type="button"
              onClick={() => setShowTransferModal(false)}
              disabled={transferring}
              className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>

            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Send size={20} />
            </div>

            <h2
              id="bulk-transfer-title"
              className="text-lg font-display font-bold text-foreground"
            >
              Transferir clientes
            </h2>

            <p className="text-sm text-muted-foreground mt-2">
              {selectedClientIds.length}{' '}
              {selectedClientIds.length === 1
                ? 'cliente será transferido'
                : 'clientes serão transferidos'}{' '}
              para o administrador selecionado.
            </p>

            <div className="mt-4 max-h-36 overflow-y-auto bg-muted border border-border rounded-xl divide-y divide-border">
              {selectedClients.map((client) => (
                <div key={client.id} className="px-3 py-2.5">
                  <p className="text-sm font-medium text-foreground">
                    {client.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {client.whatsapp || client.id}
                  </p>
                </div>
              ))}
            </div>

            <label className="block mt-4">
              <span className="text-xs font-medium text-muted-foreground">
                Administrador de destino
              </span>
              <select
                value={targetAdminId}
                onChange={(event) => setTargetAdminId(event.target.value)}
                disabled={transferring}
                className="mt-1.5 w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground disabled:opacity-50"
              >
                <option value="">Selecione o administrador</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name}
                    {admin.id === MAIN_ADMIN_ID ? ' (principal)' : ''}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-xl">
              <p className="text-xs text-warning">
                A transferência atualizará o administrador em profiles,
                trial_requests, tickets, subscriptions, payments e
                client_access.
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                disabled={transferring}
                className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-medium text-foreground disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => void handleBulkTransfer()}
                disabled={transferring || !targetAdminId}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {transferring ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                {transferring ? 'Transferindo...' : 'Confirmar transferência'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
