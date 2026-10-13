import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Play,
  RefreshCw,
  Save,
  Smartphone,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import type { TrialRequest, TrialStatus, User } from '../../types';

type ProfileRow = {
  id: string;
  name: string | null;
  whatsapp: string | null;
  role: string | null;
  theme: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type Credentials = {
  site: string;
  username: string;
  password: string;
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

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toDateTimeLocal(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000
  );

  return localDate.toISOString().slice(0, 16);
}

function fromDateTimeLocal(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function normalizeExternalUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '#';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
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

export default function AdminTrialDetails() {
  const {
    currentUser,
    authLoading,
    allTrialRequests,
    adminUpdateTrial,
    deleteTrialRequest,
    reloadOperationalData,
    addToast,
  } = useApp();

  const navigate = useNavigate();
  const { trialId } = useParams<{ trialId: string }>();

  const [client, setClient] = useState<User | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingCredentials, setEditingCredentials] = useState(false);
  const [editingEndDate, setEditingEndDate] = useState(false);
  const [endDateInput, setEndDateInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState<Credentials>({
    site: '',
    username: '',
    password: '',
  });

  const trial = useMemo<TrialRequest | null>(
    () => allTrialRequests.find((item) => item.id === trialId) ?? null,
    [allTrialRequests, trialId]
  );

  const hasCredentials = Boolean(
    trial?.accessSite?.trim() &&
      trial.accessUsername?.trim() &&
      trial.accessPassword?.trim()
  );

  useEffect(() => {
    setCredentials({
      site: trial?.accessSite ?? '',
      username: trial?.accessUsername ?? '',
      password: trial?.accessPassword ?? '',
    });
  }, [trial]);

  useEffect(() => {
    setEndDateInput(toDateTimeLocal(trial?.endDate));
  }, [trial?.endDate]);

  useEffect(() => {
    const loadClient = async (): Promise<void> => {
      if (!trial?.userId || !currentUser || currentUser.role !== 'admin') {
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
          .eq('id', trial.userId)
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
        console.error('Erro ao carregar cliente do teste:', loadError);
        setClient(null);
        setError(
          getErrorMessage(
            loadError,
            'Não foi possível carregar os dados do cliente.'
          )
        );
      } finally {
        setLoadingClient(false);
      }
    };

    void loadClient();
  }, [currentUser, trial?.userId]);

  const handleRefresh = async (): Promise<void> => {
    if (refreshing) return;
    setRefreshing(true);
    setError('');

    try {
      await reloadOperationalData();
      addToast('Solicitação de teste atualizada.', 'success');
    } catch (refreshError) {
      setError(
        getErrorMessage(
          refreshError,
          'Não foi possível atualizar a solicitação.'
        )
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

  const handleStatusChange = async (status: TrialStatus): Promise<void> => {
    if (!trial || updating || deleting) return;
    setUpdating(true);
    setError('');

    try {
      await adminUpdateTrial(
        trial.id,
        status,
        trial.startDate ?? undefined,
        trial.endDate ?? undefined
      );
      addToast(
        `Teste alterado para ${trialStatusLabels[status].toLocaleLowerCase(
          'pt-BR'
        )}.`,
        'success'
      );
    } catch (updateError) {
      setError(
        getErrorMessage(updateError, 'Não foi possível atualizar o teste.')
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveEndDate = async (): Promise<void> => {
    if (!trial || updating || deleting) return;

    const normalizedEndDate = fromDateTimeLocal(endDateInput);
    if (!normalizedEndDate) {
      setError('Informe uma data e hora de término válidas.');
      return;
    }

    const newEndDate = new Date(normalizedEndDate);
    const startDate = trial.startDate ? new Date(trial.startDate) : null;

    if (
      startDate &&
      !Number.isNaN(startDate.getTime()) &&
      newEndDate.getTime() <= startDate.getTime()
    ) {
      setError('O término deve ser posterior ao início do teste.');
      return;
    }

    let nextStatus: TrialStatus = trial.status;
    if (newEndDate.getTime() <= Date.now()) {
      nextStatus = 'expirado';
    } else if (trial.status === 'expirado') {
      nextStatus = 'ativo';
    }

    setUpdating(true);
    setError('');

    try {
      await adminUpdateTrial(
        trial.id,
        nextStatus,
        trial.startDate ?? undefined,
        normalizedEndDate
      );

      setEditingEndDate(false);
      addToast(
        nextStatus === 'expirado'
          ? 'Término atualizado e teste marcado como expirado.'
          : trial.status === 'expirado' && nextStatus === 'ativo'
          ? 'Término atualizado e teste reativado.'
          : 'Data de término atualizada.',
        'success'
      );
    } catch (saveError) {
      setError(
        getErrorMessage(
          saveError,
          'Não foi possível atualizar o término do teste.'
        )
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveCredentials = async (): Promise<void> => {
    if (!trial || updating || deleting) return;

    const site = credentials.site.trim();
    const username = credentials.username.trim();
    const password = credentials.password.trim();

    if (!site || !username || !password) {
      setError('Informe o site, o usuário e a senha.');
      return;
    }

    setUpdating(true);
    setError('');

    try {
      const keepCurrentPeriod = Boolean(trial.startDate && trial.endDate);
      const startDate = keepCurrentPeriod
        ? trial.startDate!
        : new Date().toISOString();
      const endDate = keepCurrentPeriod
        ? trial.endDate!
        : new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

      await adminUpdateTrial(trial.id, 'ativo', startDate, endDate, {
        site,
        username,
        password,
      });

      setEditingCredentials(false);
      setShowPassword(false);
      addToast('Teste ativado e credenciais enviadas.', 'success');
    } catch (saveError) {
      setError(
        getErrorMessage(
          saveError,
          'Não foi possível salvar as credenciais do teste.'
        )
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!trial || deleting || updating) return;
    setDeleting(true);
    setError('');

    try {
      await deleteTrialRequest(trial.id);
      addToast('Solicitação de teste excluída.', 'success');
      navigate('/admin/testes', { replace: true });
    } catch (deleteError) {
      setShowDeleteModal(false);
      setError(
        getErrorMessage(
          deleteError,
          'Não foi possível excluir a solicitação de teste.'
        )
      );
    } finally {
      setDeleting(false);
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

  if (!trialId || !trial) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <button
          type="button"
          onClick={() => navigate('/admin/testes')}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft size={16} />
          Voltar para testes
        </button>
        <div className="mt-6 p-10 bg-card border border-border rounded-2xl text-center">
          <Play size={32} className="mx-auto text-muted-foreground" />
          <h1 className="mt-3 text-lg font-display font-bold text-foreground">
            Solicitação não encontrada
          </h1>
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
            onClick={() => navigate('/admin/testes')}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft size={16} />
            Voltar para testes
          </button>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-foreground">
              Solicitação de teste
            </h1>
            <span
              className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${getTrialBadgeClass(
                trial.status
              )}`}
            >
              {trialStatusLabels[trial.status] || trial.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Analise a solicitação e gerencie o acesso temporário.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={refreshing || updating || deleting}
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
            <Smartphone size={18} className="text-primary" />
            <h2 className="font-display font-bold text-foreground">
              Dados da solicitação
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Dispositivo</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {trial.device}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Modelo</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {trial.model || 'Não informado'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Solicitado em</p>
              <p className="mt-1 text-sm text-foreground">
                {formatDate(trial.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Horário preferido</p>
              <p className="mt-1 text-sm text-foreground">
                {trial.preferredTime || 'Não informado'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Início</p>
              <p className="mt-1 text-sm text-foreground">
                {formatDate(trial.startDate)}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">Término</p>
                {!editingEndDate && (
                  <button
                    type="button"
                    onClick={() => {
                      setEndDateInput(toDateTimeLocal(trial.endDate));
                      setEditingEndDate(true);
                      setError('');
                    }}
                    disabled={updating || deleting || !trial.startDate}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                  >
                    <Pencil size={12} />
                    Alterar
                  </button>
                )}
              </div>

              {editingEndDate ? (
                <div className="mt-2 space-y-2">
                  <input
                    type="datetime-local"
                    value={endDateInput}
                    onChange={(event) => setEndDateInput(event.target.value)}
                    disabled={updating || deleting}
                    step={60}
                    aria-label="Nova data e hora de término"
                    className="w-full min-w-0 rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 [color-scheme:light] dark:[color-scheme:dark]"
                  />
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEndDate(false);
                        setEndDateInput(toDateTimeLocal(trial.endDate));
                        setError('');
                      }}
                      disabled={updating}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-2 text-xs font-medium text-foreground disabled:opacity-50"
                    >
                      <X size={13} />
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSaveEndDate()}
                      disabled={updating || deleting || !endDateInput}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg gradient-bg px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {updating ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Save size={13} />
                      )}
                      {updating ? 'Salvando...' : 'Salvar término'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-sm text-foreground">
                  {formatDate(trial.endDate)}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Identificador</p>
              <p className="mt-1 text-xs font-mono text-foreground break-all">
                {trial.id}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-5 card-glow">
          <div className="flex items-center gap-2 mb-4">
            <UserRound size={18} className="text-primary" />
            <h2 className="font-display font-bold text-foreground">Cliente</h2>
          </div>
          {loadingClient ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={15} className="animate-spin" />
              Carregando cliente...
            </div>
          ) : client ? (
            <div>
              <p className="text-sm font-semibold text-foreground">
                {client.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {client.whatsapp || 'WhatsApp não informado'}
              </p>
              <button
                type="button"
                onClick={() => navigate(`/admin/clientes/${client.id}`)}
                className="w-full mt-4 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary hover:text-white transition-colors"
              >
                Abrir cliente
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Cliente não encontrado.
            </p>
          )}
        </section>
      </div>

      <section className="bg-card border border-border rounded-2xl p-5 card-glow mb-6">
        <h2 className="font-display font-bold text-foreground">
          Ações do teste
        </h2>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Altere o status ou configure o acesso temporário.
        </p>
        <div className="flex flex-wrap gap-2">
          {trial.status === 'aguardando' && (
            <>
              <button
                type="button"
                onClick={() => void handleStatusChange('aprovado')}
                disabled={updating || deleting}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-success/10 text-success rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                <Check size={15} /> Aprovar
              </button>
              <button
                type="button"
                onClick={() => void handleStatusChange('indisponivel')}
                disabled={updating || deleting}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-destructive/10 text-destructive rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                <X size={15} /> Recusar
              </button>
            </>
          )}

          {(trial.status === 'aprovado' ||
            trial.status === 'ativo' ||
            trial.status === 'expirado') && (
            <button
              type="button"
              onClick={() => setEditingCredentials(true)}
              disabled={updating || deleting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              <Save size={15} />
              {hasCredentials ? 'Editar acesso' : 'Informar acesso'}
            </button>
          )}

          {trial.status === 'ativo' && (
            <button
              type="button"
              onClick={() => void handleStatusChange('finalizado')}
              disabled={updating || deleting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-semibold text-foreground disabled:opacity-50"
            >
              <Check size={15} /> Finalizar teste
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            disabled={updating || deleting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-destructive/10 text-destructive rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            <Trash2 size={15} /> Excluir
          </button>
        </div>
      </section>

      <section className="bg-card border border-border rounded-2xl p-5 card-glow">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-foreground">
              Credenciais do teste
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              O período padrão do teste é de 4 horas.
            </p>
          </div>
          {!editingCredentials &&
            (trial.status === 'aprovado' ||
              trial.status === 'ativo' ||
              trial.status === 'expirado') && (
              <button
                type="button"
                onClick={() => setEditingCredentials(true)}
                className="px-3 py-2 bg-primary/10 text-primary rounded-xl text-sm font-semibold"
              >
                {hasCredentials ? 'Editar credenciais' : 'Informar credenciais'}
              </button>
            )}
        </div>

        {editingCredentials ? (
          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="text"
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
              className="px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground"
            />
            <div className="md:col-span-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingCredentials(false);
                  setCredentials({
                    site: trial.accessSite ?? '',
                    username: trial.accessUsername ?? '',
                    password: trial.accessPassword ?? '',
                  });
                }}
                disabled={updating}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-medium text-foreground"
              >
                <X size={15} /> Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleSaveCredentials()}
                disabled={
                  updating ||
                  !credentials.site.trim() ||
                  !credentials.username.trim() ||
                  !credentials.password.trim()
                }
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {updating ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                {updating ? 'Salvando...' : 'Ativar e enviar'}
              </button>
            </div>
          </div>
        ) : hasCredentials ? (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="p-3 bg-muted border border-border rounded-xl">
              <p className="text-xs text-muted-foreground">Site</p>
              <div className="mt-1 flex items-center gap-1">
                <a
                  href={normalizeExternalUrl(trial.accessSite ?? '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1 text-sm text-primary font-medium break-all hover:underline"
                >
                  {trial.accessSite}
                </a>
                <button
                  type="button"
                  onClick={() => void handleCopy(trial.accessSite, 'Site')}
                  className="p-1.5 text-muted-foreground"
                >
                  <Copy size={14} />
                </button>
                <a
                  href={normalizeExternalUrl(trial.accessSite ?? '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-muted-foreground"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
            <div className="p-3 bg-muted border border-border rounded-xl">
              <p className="text-xs text-muted-foreground">Usuário</p>
              <div className="mt-1 flex items-center gap-1">
                <p className="min-w-0 flex-1 text-sm font-medium text-foreground break-all">
                  {trial.accessUsername}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    void handleCopy(trial.accessUsername, 'Usuário')
                  }
                  className="p-1.5 text-muted-foreground"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
            <div className="p-3 bg-muted border border-border rounded-xl">
              <p className="text-xs text-muted-foreground">Senha</p>
              <div className="mt-1 flex items-center gap-1">
                <p className="min-w-0 flex-1 text-sm font-mono font-semibold text-foreground break-all">
                  {showPassword ? trial.accessPassword : '••••••••••••'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="p-1.5 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => void handleCopy(trial.accessPassword, 'Senha')}
                  className="p-1.5 text-muted-foreground"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-muted border border-border rounded-xl text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma credencial cadastrada para esta solicitação.
            </p>
          </div>
        )}
      </section>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-sm"
            onClick={() => !deleting && setShowDeleteModal(false)}
            disabled={deleting}
            aria-label="Cancelar exclusão"
          />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6">
            <Trash2 size={20} className="text-destructive" />
            <h2 className="mt-4 text-lg font-display font-bold text-foreground">
              Excluir solicitação de teste?
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              A solicitação de {client?.name || 'cliente não encontrado'} será
              excluída permanentemente.
            </p>
            <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-medium text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="btn-danger flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
              >
                {deleting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Trash2 size={15} />
                )}
                {deleting ? 'Excluindo...' : 'Excluir teste'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
