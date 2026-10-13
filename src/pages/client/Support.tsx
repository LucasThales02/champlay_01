import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ChevronLeft,
  Circle,
  Loader2,
  Plus,
  RefreshCw,
  Send,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { TicketCategory, TicketStatus } from '../../types';

const categoryLabels: Record<TicketCategory, string> = {
  instalacao: 'Instalação',
  acesso: 'Acesso',
  financeiro: 'Financeiro',
  plano: 'Plano',
  outros: 'Outros',
};

const ticketStatusConfig: Record<
  TicketStatus,
  { label: string; color: string }
> = {
  aberto: {
    label: 'Aberto',
    color: 'text-success bg-success/10',
  },
  aguardando_cliente: {
    label: 'Aguardando você',
    color: 'text-warning bg-warning/10',
  },
  aguardando_suporte: {
    label: 'Aguardando suporte',
    color: 'text-accent bg-accent/10',
  },
  encerrado: {
    label: 'Encerrado',
    color: 'text-muted-foreground bg-muted',
  },
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Data indisponível';
  }

  return date.toLocaleDateString('pt-BR');
}

function formatMessageDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Horário indisponível';
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function NewTicketForm({ onSuccess }: { onSuccess: (id: string) => void }) {
  const { createTicket } = useApp();
  const [form, setForm] = useState({
    category: '' as TicketCategory | '',
    subject: '',
    initialMessage: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const validate = (): Record<string, string> => {
    const nextErrors: Record<string, string> = {};

    if (!form.category) {
      nextErrors.category = 'Selecione uma categoria.';
    }

    if (!form.subject.trim()) {
      nextErrors.subject = 'Informe o assunto.';
    } else if (form.subject.trim().length < 3) {
      nextErrors.subject = 'O assunto deve ter pelo menos 3 caracteres.';
    }

    if (!form.initialMessage.trim()) {
      nextErrors.initialMessage = 'Escreva uma mensagem inicial.';
    } else if (form.initialMessage.trim().length < 3) {
      nextErrors.initialMessage =
        'A mensagem deve ter pelo menos 3 caracteres.';
    }

    return nextErrors;
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    if (loading) return;

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      const id = await createTicket({
        category: form.category as TicketCategory,
        subject: form.subject.trim(),
        initialMessage: form.initialMessage.trim(),
      });

      onSuccess(id);
    } catch (error) {
      console.error('Erro ao abrir atendimento:', error);
      setSubmitError(
        getErrorMessage(
          error,
          'Não foi possível abrir o atendimento. Tente novamente.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <h3 className="text-base font-display font-semibold text-foreground">
        Novo atendimento
      </h3>

      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-2 px-3 py-3 rounded-xl border border-destructive/20 bg-destructive/10 text-sm text-destructive"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="ticket-category"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Categoria
        </label>
        <select
          id="ticket-category"
          value={form.category}
          disabled={loading}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              category: event.target.value as TicketCategory,
            }));
            setErrors((previous) => ({ ...previous, category: '' }));
            setSubmitError('');
          }}
          className={`w-full px-4 py-3 bg-muted border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors disabled:opacity-60 ${
            errors.category
              ? 'border-destructive'
              : 'border-border focus:border-primary'
          }`}
        >
          <option value="">Selecione...</option>
          {Object.entries(categoryLabels).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-xs text-destructive mt-1">{errors.category}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="ticket-subject"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Assunto
        </label>
        <input
          id="ticket-subject"
          type="text"
          value={form.subject}
          disabled={loading}
          maxLength={120}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              subject: event.target.value,
            }));
            setErrors((previous) => ({ ...previous, subject: '' }));
            setSubmitError('');
          }}
          placeholder="Descreva brevemente o problema"
          className={`w-full px-4 py-3 bg-muted border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors disabled:opacity-60 ${
            errors.subject
              ? 'border-destructive'
              : 'border-border focus:border-primary'
          }`}
        />
        {errors.subject && (
          <p className="text-xs text-destructive mt-1">{errors.subject}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="ticket-message"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Mensagem inicial
        </label>
        <textarea
          id="ticket-message"
          value={form.initialMessage}
          disabled={loading}
          maxLength={3000}
          onChange={(event) => {
            setForm((previous) => ({
              ...previous,
              initialMessage: event.target.value,
            }));
            setErrors((previous) => ({
              ...previous,
              initialMessage: '',
            }));
            setSubmitError('');
          }}
          placeholder="Descreva em detalhes o que está acontecendo..."
          rows={4}
          className={`w-full px-4 py-3 bg-muted border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors resize-none disabled:opacity-60 ${
            errors.initialMessage
              ? 'border-destructive'
              : 'border-border focus:border-primary'
          }`}
        />
        <div className="flex items-start justify-between gap-3 mt-1">
          {errors.initialMessage ? (
            <p className="text-xs text-destructive">{errors.initialMessage}</p>
          ) : (
            <span />
          )}
          <span className="text-[10px] text-muted-foreground">
            {form.initialMessage.length}/3000
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 gradient-bg text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={17} className="animate-spin" />}
        {loading ? 'Abrindo...' : 'Abrir atendimento'}
      </button>
    </form>
  );
}

function Conversation({
  ticketId,
  onBack,
}: {
  ticketId: string;
  onBack: () => void;
}) {
  const {
    currentUser,
    myTickets,
    getMessages,
    sendMessage,
    reloadOperationalData,
  } = useApp();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sendError, setSendError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const ticket = myTickets.find((item) => item.id === ticketId);
  const messages = getMessages(ticketId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (!ticket) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
        <AlertCircle size={32} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Este atendimento não foi encontrado ou não está mais disponível.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 gradient-bg text-white text-sm font-semibold rounded-xl"
        >
          Voltar aos atendimentos
        </button>
      </div>
    );
  }

  const statusConfig = ticketStatusConfig[ticket.status];

  const handleRefresh = async (): Promise<void> => {
    if (refreshing) return;

    setRefreshing(true);
    setSendError('');

    try {
      await reloadOperationalData();
    } catch (error) {
      console.error('Erro ao atualizar conversa:', error);
      setSendError(
        getErrorMessage(error, 'Não foi possível atualizar a conversa.')
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleSend = async (): Promise<void> => {
    const content = text.trim();

    if (!content || ticket.status === 'encerrado' || sending) return;

    setSending(true);
    setSendError('');

    try {
      await sendMessage(ticketId, content);
      setText('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setSendError(
        getErrorMessage(
          error,
          'Não foi possível enviar a mensagem. Tente novamente.'
        )
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-5rem)]">
      <div className="shrink-0 p-4 border-b border-border flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
          aria-label="Voltar aos atendimentos"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {ticket.subject}
          </p>
          <p className="text-xs text-muted-foreground">
            {categoryLabels[ticket.category]}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={refreshing}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-50"
          aria-label="Atualizar conversa"
          title="Atualizar conversa"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>

        <span
          className={`text-[11px] font-semibold px-2 py-1 rounded-full ${statusConfig.color}`}
        >
          {statusConfig.label}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full min-h-48 flex items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma mensagem foi encontrada neste atendimento.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === currentUser?.id;

            return (
              <div
                key={message.id}
                className={`flex ${
                  isCurrentUser ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs sm:max-w-md lg:max-w-lg ${
                    isCurrentUser ? 'order-2' : ''
                  }`}
                >
                  {!isCurrentUser && (
                    <p className="text-xs text-muted-foreground mb-1 ml-1">
                      Suporte
                    </p>
                  )}

                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      isCurrentUser
                        ? 'gradient-bg text-white rounded-tr-sm'
                        : 'bg-card border border-border text-foreground rounded-tl-sm'
                    }`}
                  >
                    {message.content}
                  </div>

                  <p
                    className={`text-[10px] text-muted-foreground mt-1 px-1 ${
                      isCurrentUser ? 'text-right' : 'text-left'
                    }`}
                  >
                    {formatMessageDate(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      {sendError && (
        <div
          role="alert"
          className="mx-4 mb-2 flex items-start gap-2 px-3 py-2 rounded-xl border border-destructive/20 bg-destructive/10 text-xs text-destructive"
        >
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{sendError}</span>
        </div>
      )}

      {ticket.status === 'encerrado' ? (
        <div className="shrink-0 p-4 border-t border-border text-center text-sm text-muted-foreground">
          Este atendimento foi encerrado.
        </div>
      ) : (
        <div className="shrink-0 p-4 border-t border-border flex items-end gap-2">
          <textarea
            value={text}
            disabled={sending}
            maxLength={3000}
            onChange={(event) => {
              setText(event.target.value);
              setSendError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            rows={1}
            className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-colors disabled:opacity-60"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />

          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!text.trim() || sending}
            className="p-3 gradient-bg text-white rounded-xl hover:opacity-90 disabled:opacity-40 transition-all shrink-0"
            aria-label="Enviar mensagem"
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Support() {
  const { myTickets, dataLoading, reloadOperationalData } = useApp();
  const [activeTicket, setActiveTicket] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState('');

  const openTickets = myTickets.filter(
    (ticket) => ticket.status !== 'encerrado'
  );
  const closedTickets = myTickets.filter(
    (ticket) => ticket.status === 'encerrado'
  );

  const handleRefresh = async (): Promise<void> => {
    if (refreshing) return;

    setRefreshing(true);
    setPageError('');

    try {
      await reloadOperationalData();
    } catch (error) {
      console.error('Erro ao atualizar atendimentos:', error);
      setPageError(
        getErrorMessage(error, 'Não foi possível atualizar os atendimentos.')
      );
    } finally {
      setRefreshing(false);
    }
  };

  if (activeTicket) {
    return (
      <div className="h-full">
        <Conversation
          ticketId={activeTicket}
          onBack={() => setActiveTicket(null)}
        />
      </div>
    );
  }

  if (showNew) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => setShowNew(false)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft size={16} />
          Voltar
        </button>

        <div className="bg-card border border-border rounded-2xl card-glow">
          <NewTicketForm
            onSuccess={(id) => {
              setShowNew(false);
              setActiveTicket(id);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Suporte
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Acompanhe seus atendimentos.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={refreshing || dataLoading}
            className="p-2.5 bg-muted border border-border text-muted-foreground rounded-xl hover:text-foreground disabled:opacity-50"
            aria-label="Atualizar atendimentos"
            title="Atualizar atendimentos"
          >
            <RefreshCw
              size={16}
              className={refreshing || dataLoading ? 'animate-spin' : ''}
            />
          </button>

          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 gradient-bg text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Novo atendimento
          </button>
        </div>
      </div>

      {pageError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl border border-destructive/20 bg-destructive/10 text-sm text-destructive"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{pageError}</span>
        </div>
      )}

      {dataLoading && myTickets.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-16 bg-card border border-border rounded-2xl card-glow text-sm text-muted-foreground">
          <Loader2 size={18} className="animate-spin" />
          Carregando atendimentos...
        </div>
      ) : myTickets.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl card-glow">
          <Circle
            size={40}
            className="text-muted-foreground mx-auto mb-3 opacity-30"
          />
          <p className="text-muted-foreground mb-4">
            Você não possui atendimentos.
          </p>
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="px-4 py-2 gradient-bg text-white text-sm font-semibold rounded-xl hover:opacity-90"
          >
            Abrir primeiro atendimento
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {openTickets.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Em andamento ({openTickets.length})
              </h2>

              <div className="space-y-3">
                {openTickets.map((ticket) => {
                  const status = ticketStatusConfig[ticket.status];

                  return (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => setActiveTicket(ticket.id)}
                      className="w-full p-4 bg-card border border-border rounded-2xl card-glow hover:border-primary/40 transition-all text-left flex items-center gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {ticket.subject}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {categoryLabels[ticket.category]} ·{' '}
                          {formatDate(ticket.createdAt)}
                        </p>
                      </div>

                      <span
                        className={`text-[11px] font-semibold px-2 py-1 rounded-full shrink-0 ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {closedTickets.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Encerrados ({closedTickets.length})
              </h2>

              <div className="space-y-3">
                {closedTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setActiveTicket(ticket.id)}
                    className="w-full p-4 bg-card border border-border rounded-2xl opacity-70 hover:opacity-100 transition-all text-left flex items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {ticket.subject}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {categoryLabels[ticket.category]} ·{' '}
                        {formatDate(ticket.createdAt)}
                      </p>
                    </div>

                    <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-muted text-muted-foreground shrink-0">
                      Encerrado
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
