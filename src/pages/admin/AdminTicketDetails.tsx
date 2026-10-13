import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CircleCheck,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  UserRound,
} from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import type { TicketStatus } from '../../types';

type ProfileRow = {
  id: string;
  name: string | null;
  whatsapp: string | null;
};

const statusLabels: Partial<Record<TicketStatus, string>> = {
  aberto: 'Aberto',
  aguardando_cliente: 'Aguardando cliente',
  encerrado: 'Encerrado',
};

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

function getStatusClass(status: TicketStatus): string {
  if (status === 'encerrado') {
    return 'bg-success/10 text-success border-success/20';
  }

  if (status === 'aguardando_cliente') {
    return 'bg-warning/10 text-warning border-warning/20';
  }

  return 'bg-primary/10 text-primary border-primary/20';
}

export default function AdminTicketDetails() {
  const {
    currentUser,
    authLoading,
    dataLoading,
    allTickets,
    getMessages,
    adminSendMessage,
    adminCloseTicket,
    reloadOperationalData,
    addToast,
  } = useApp();

  const navigate = useNavigate();

  const { ticketId } = useParams<{
    ticketId: string;
  }>();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [client, setClient] = useState<ProfileRow | null>(null);

  const [clientLoading, setClientLoading] = useState(true);

  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState('');

  const ticket = useMemo(
    () => allTickets.find((item) => item.id === ticketId) ?? null,
    [allTickets, ticketId]
  );

  const ticketMessages = useMemo(
    () => (ticket ? getMessages(ticket.id) : []),
    [getMessages, ticket]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [ticketMessages.length]);

  useEffect(() => {
    const loadClient = async (): Promise<void> => {
      if (!ticket?.userId || !currentUser || currentUser.role !== 'admin') {
        setClient(null);
        setClientLoading(false);
        return;
      }

      setClientLoading(true);

      try {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, whatsapp')
          .eq('id', ticket.userId)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        setClient((data as ProfileRow | null) ?? null);
      } catch (loadError) {
        console.error('Erro ao carregar cliente do chamado:', loadError);

        setClient(null);

        setError(
          getErrorMessage(
            loadError,
            'Não foi possível carregar os dados do cliente.'
          )
        );
      } finally {
        setClientLoading(false);
      }
    };

    void loadClient();
  }, [currentUser, ticket?.userId]);

  const handleRefresh = async (): Promise<void> => {
    if (refreshing) return;

    setRefreshing(true);
    setError('');

    try {
      await reloadOperationalData();

      addToast('Chamado atualizado.', 'success');
    } catch (refreshError) {
      setError(
        getErrorMessage(refreshError, 'Não foi possível atualizar o chamado.')
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleSend = async (): Promise<void> => {
    if (!ticket || sending || ticket.status === 'encerrado') {
      return;
    }

    const content = reply.trim();

    if (!content) {
      setError('Digite uma resposta antes de enviar.');
      return;
    }

    setSending(true);
    setError('');

    try {
      await adminSendMessage(ticket.id, content);

      setReply('');

      addToast('Resposta enviada.', 'success');
    } catch (sendError) {
      setError(
        getErrorMessage(sendError, 'Não foi possível enviar a resposta.')
      );
    } finally {
      setSending(false);
    }
  };

  const handleClose = async (): Promise<void> => {
    if (!ticket || closing || ticket.status === 'encerrado') {
      return;
    }

    setClosing(true);
    setError('');

    try {
      await adminCloseTicket(ticket.id);

      addToast('Chamado encerrado.', 'success');
    } catch (closeError) {
      setError(
        getErrorMessage(closeError, 'Não foi possível encerrar o chamado.')
      );
    } finally {
      setClosing(false);
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

  if (dataLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        Carregando chamado...
      </div>
    );
  }

  if (!ticketId || !ticket) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <button
          type="button"
          onClick={() => navigate('/admin/chamados')}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft size={16} />
          Voltar para chamados
        </button>

        <div className="mt-6 rounded-2xl border border-border bg-card p-10 text-center">
          <MessageCircle size={32} className="mx-auto text-muted-foreground" />

          <h1 className="mt-3 text-lg font-display font-bold text-foreground">
            Chamado não encontrado
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            O chamado pode ter sido transferido, excluído ou não pertence a este
            administrador.
          </p>
        </div>
      </div>
    );
  }

  const closed = ticket.status === 'encerrado';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate('/admin/chamados')}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft size={16} />
            Voltar para chamados
          </button>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-foreground">
              {ticket.subject}
            </h1>

            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                ticket.status
              )}`}
            >
              {statusLabels[ticket.status] || ticket.status}
            </span>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Categoria: {ticket.category}
            {' · '}
            Aberto em {formatDate(ticket.createdAt)}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={refreshing || sending || closing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted px-4 py-2.5 text-sm font-medium text-foreground disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Atualizar
          </button>

          {!closed && (
            <button
              type="button"
              onClick={() => void handleClose()}
              disabled={closing || sending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-success/10 px-4 py-2.5 text-sm font-semibold text-success hover:bg-success hover:text-white disabled:opacity-50"
            >
              {closing ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <CircleCheck size={15} />
              )}

              {closing ? 'Encerrando...' : 'Encerrar chamado'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="overflow-hidden rounded-2xl border border-border bg-card card-glow">
          <div className="border-b border-border p-4">
            <h2 className="font-display font-bold text-foreground">Conversa</h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {ticketMessages.length}{' '}
              {ticketMessages.length === 1 ? 'mensagem' : 'mensagens'}
            </p>
          </div>

          <div className="max-h-[520px] min-h-[320px] space-y-4 overflow-y-auto bg-muted/20 p-4">
            {ticketMessages.length === 0 ? (
              <div className="flex min-h-[280px] items-center justify-center text-center">
                <div>
                  <MessageCircle
                    size={28}
                    className="mx-auto text-muted-foreground"
                  />

                  <p className="mt-3 text-sm text-muted-foreground">
                    Nenhuma mensagem disponível.
                  </p>
                </div>
              </div>
            ) : (
              ticketMessages.map((message) => {
                const sentByAdmin = message.senderId === currentUser.id;

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      sentByAdmin ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        sentByAdmin
                          ? 'gradient-bg text-white'
                          : 'border border-border bg-card text-foreground'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm">
                        {message.content}
                      </p>

                      <p
                        className={`mt-2 text-[10px] ${
                          sentByAdmin
                            ? 'text-white/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {sentByAdmin ? 'Você' : client?.name || 'Cliente'}
                        {' · '}
                        {formatDate(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border p-4">
            {closed ? (
              <div className="rounded-xl border border-success/20 bg-success/10 p-4 text-center text-sm text-success">
                Este chamado foi encerrado em {formatDate(ticket.closedAt)}.
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();

                      void handleSend();
                    }
                  }}
                  rows={4}
                  placeholder="Digite sua resposta..."
                  disabled={sending || closing}
                  className="w-full resize-none rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary disabled:opacity-50"
                />

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    Enter envia. Shift + Enter cria uma nova linha.
                  </p>

                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={sending || closing || !reply.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl gradient-bg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {sending ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Send size={15} />
                    )}

                    {sending ? 'Enviando...' : 'Enviar resposta'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5 card-glow">
            <div className="flex items-center gap-2">
              <UserRound size={18} className="text-primary" />

              <h2 className="font-display font-bold text-foreground">
                Cliente
              </h2>
            </div>

            {clientLoading ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 size={15} className="animate-spin" />
                Carregando...
              </div>
            ) : client ? (
              <div className="mt-4">
                <p className="text-sm font-semibold text-foreground">
                  {client.name || 'Usuário sem nome'}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {client.whatsapp || 'WhatsApp não informado'}
                </p>

                <button
                  type="button"
                  onClick={() => navigate(`/admin/clientes/${client.id}`)}
                  className="mt-4 w-full rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
                >
                  Abrir cliente
                </button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Cliente não encontrado.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 card-glow">
            <h2 className="font-display font-bold text-foreground">
              Dados do chamado
            </h2>

            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-xs text-muted-foreground">Identificador</dt>

                <dd className="mt-1 break-all font-mono text-xs text-foreground">
                  {ticket.id}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-muted-foreground">Categoria</dt>

                <dd className="mt-1 text-sm text-foreground">
                  {ticket.category}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>

                <dd className="mt-1 text-sm text-foreground">
                  {statusLabels[ticket.status] || ticket.status}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-muted-foreground">Criado em</dt>

                <dd className="mt-1 text-sm text-foreground">
                  {formatDate(ticket.createdAt)}
                </dd>
              </div>

              {ticket.closedAt && (
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Encerrado em
                  </dt>

                  <dd className="mt-1 text-sm text-foreground">
                    {formatDate(ticket.closedAt)}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
