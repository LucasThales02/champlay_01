import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Play,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { TrialStatus } from '../../types';

const statusInfo: Record<
  TrialStatus,
  {
    title: string;
    description: string;
    color: string;
    icon: React.ReactNode;
  }
> = {
  disponivel: {
    title: 'Teste disponível',
    description:
      'Preencha o formulário abaixo para solicitar seu teste gratuito de 4 horas.',
    color: 'text-success',
    icon: <Play size={20} />,
  },
  aguardando: {
    title: 'Aguardando análise',
    description:
      'Sua solicitação foi recebida e está sendo analisada pela equipe. Aguarde a confirmação do horário.',
    color: 'text-warning',
    icon: <Clock size={20} />,
  },
  aprovado: {
    title: 'Teste aprovado',
    description:
      'Seu teste foi aprovado. Aguarde a equipe informar os dados de acesso e ativar o período de teste.',
    color: 'text-accent',
    icon: <CheckCircle size={20} />,
  },
  ativo: {
    title: 'Teste ativo',
    description:
      'Seu teste está ativo. Use os dados de acesso abaixo durante o período liberado.',
    color: 'text-success',
    icon: <Play size={20} />,
  },
  finalizado: {
    title: 'Teste finalizado',
    description:
      'Seu período de teste foi concluído. Assine um dos planos para continuar utilizando o serviço.',
    color: 'text-muted-foreground',
    icon: <CheckCircle size={20} />,
  },
  expirado: {
    title: 'Teste expirado',
    description:
      'O período do seu teste gratuito expirou. Assine um dos planos para continuar utilizando o serviço.',
    color: 'text-destructive',
    icon: <AlertCircle size={20} />,
  },
  indisponivel: {
    title: 'Teste indisponível',
    description:
      'O teste gratuito está disponível apenas uma vez por cliente e não está disponível para esta conta.',
    color: 'text-destructive',
    icon: <AlertCircle size={20} />,
  },
};

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Não informado';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? 'Não informado'
    : date.toLocaleDateString('pt-BR');
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return 'Não informado';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? 'Não informado'
    : date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

function normalizeExternalUrl(value: string): string {
  const trimmed = value.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export default function FreeTrial() {
  const {
    myTrialRequest,
    submitTrialRequest,
    addToast,
    reloadOperationalData,
  } = useApp();
  const [form, setForm] = useState({
    device: '',
    os: '',
    model: '',
    preferredTime: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const trialStatus: TrialStatus = myTrialRequest
    ? myTrialRequest.status
    : 'disponivel';
  const info = statusInfo[trialStatus];

  const hasCredentials = Boolean(
    myTrialRequest?.status === 'ativo' &&
      myTrialRequest.accessSite?.trim() &&
      myTrialRequest.accessUsername?.trim() &&
      myTrialRequest.accessPassword?.trim()
  );

  const remainingTime = useMemo(() => {
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

  const setField = (field: string, value: string): void => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: '' }));
  };

  const validate = (): Record<string, string> => {
    const nextErrors: Record<string, string> = {};

    if (!form.device) {
      nextErrors.device = 'Selecione o dispositivo.';
    }

    if (!form.os.trim()) {
      nextErrors.os = 'Informe o sistema operacional.';
    }

    if (!form.model.trim()) {
      nextErrors.model = 'Informe o modelo do dispositivo.';
    }

    if (!form.preferredTime.trim()) {
      nextErrors.preferredTime = 'Informe o melhor horário.';
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

    try {
      await submitTrialRequest({
        ...form,
        os: form.os.trim(),
        model: form.model.trim(),
        preferredTime: form.preferredTime.trim(),
        notes: form.notes.trim(),
      });
      addToast('Solicitação de teste enviada!', 'success');
    } catch (error: unknown) {
      addToast(
        error instanceof Error ? error.message : 'Erro ao enviar solicitação.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (): Promise<void> => {
    if (refreshing) return;

    setRefreshing(true);

    try {
      await reloadOperationalData();
      addToast('Status do teste atualizado.', 'success');
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar o teste.',
        'error'
      );
    } finally {
      setRefreshing(false);
    }
  };

  const copyValue = async (
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Teste gratuito
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            4 horas de acesso à plataforma sem custo.
          </p>
        </div>

        {myTrialRequest && (
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={refreshing}
            className="shrink-0 inline-flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-xl text-xs text-foreground hover:bg-secondary disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Atualizar
          </button>
        )}
      </div>

      <div className="p-5 bg-card border border-border rounded-2xl card-glow mb-6 flex items-start gap-4">
        <div className={`shrink-0 ${info.color}`}>{info.icon}</div>
        <div className="min-w-0 flex-1">
          <p className={`font-display font-semibold ${info.color} mb-1`}>
            {info.title}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {info.description}
          </p>

          {myTrialRequest && (
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <p>
                Dispositivo:{' '}
                <span className="text-foreground">{myTrialRequest.device}</span>
              </p>
              <p>
                Modelo:{' '}
                <span className="text-foreground">
                  {myTrialRequest.model || 'Não informado'}
                </span>
              </p>
              <p>
                Horário desejado:{' '}
                <span className="text-foreground">
                  {myTrialRequest.preferredTime || 'Não informado'}
                </span>
              </p>
              <p>
                Solicitado em:{' '}
                <span className="text-foreground">
                  {formatDate(myTrialRequest.createdAt)}
                </span>
              </p>

              {myTrialRequest.startDate && (
                <p>
                  Início:{' '}
                  <span className="text-foreground">
                    {formatDateTime(myTrialRequest.startDate)}
                  </span>
                </p>
              )}

              {myTrialRequest.endDate && (
                <p>
                  Término:{' '}
                  <span className="text-foreground">
                    {formatDateTime(myTrialRequest.endDate)}
                  </span>
                </p>
              )}

              {remainingTime && (
                <p className="pt-1 font-semibold text-primary">
                  {remainingTime}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {myTrialRequest?.status === 'ativo' && !hasCredentials && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-2xl">
          <Clock size={18} className="text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Aguardando dados de acesso
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              O teste já está ativo, mas os dados de acesso ainda não foram
              disponibilizados. Clique em Atualizar após a confirmação da
              equipe.
            </p>
          </div>
        </div>
      )}

      {hasCredentials && myTrialRequest && (
        <div className="mb-6 p-5 bg-card border border-primary/30 rounded-2xl card-glow">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={19} className="text-success" />
            <h2 className="text-base font-display font-semibold text-foreground">
              Dados de acesso ao teste
            </h2>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-muted border border-border rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Site</p>
              <div className="flex items-center gap-2">
                <a
                  href={normalizeExternalUrl(myTrialRequest.accessSite!)}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 flex-1 text-sm text-primary font-medium break-all hover:underline"
                >
                  {myTrialRequest.accessSite}
                </a>
                <button
                  type="button"
                  onClick={() =>
                    void copyValue(myTrialRequest.accessSite, 'Site')
                  }
                  className="p-2 text-muted-foreground hover:text-foreground"
                  aria-label="Copiar site"
                  title="Copiar site"
                >
                  <Copy size={15} />
                </button>
                <a
                  href={normalizeExternalUrl(myTrialRequest.accessSite!)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-muted-foreground hover:text-primary"
                  aria-label="Abrir site"
                  title="Abrir site"
                >
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>

            <div className="p-3 bg-muted border border-border rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Usuário</p>
              <div className="flex items-center gap-2">
                <p className="min-w-0 flex-1 text-sm text-foreground font-medium break-all">
                  {myTrialRequest.accessUsername}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    void copyValue(myTrialRequest.accessUsername, 'Usuário')
                  }
                  className="p-2 text-muted-foreground hover:text-foreground"
                  aria-label="Copiar usuário"
                  title="Copiar usuário"
                >
                  <Copy size={15} />
                </button>
              </div>
            </div>

            <div className="p-3 bg-muted border border-border rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Senha</p>
              <div className="flex items-center gap-2">
                <p className="min-w-0 flex-1 text-sm text-foreground font-mono font-semibold break-all">
                  {showPassword
                    ? myTrialRequest.accessPassword
                    : '••••••••••••'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="p-2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void copyValue(myTrialRequest.accessPassword, 'Senha')
                  }
                  className="p-2 text-muted-foreground hover:text-foreground"
                  aria-label="Copiar senha"
                  title="Copiar senha"
                >
                  <Copy size={15} />
                </button>
              </div>
            </div>
          </div>

          {myTrialRequest.credentialsSentAt && (
            <p className="mt-3 text-[11px] text-muted-foreground">
              Dados liberados em{' '}
              {formatDateTime(myTrialRequest.credentialsSentAt)}.
            </p>
          )}

          {myTrialRequest.endDate && (
            <div className="mt-4 pt-3 border-t border-border flex items-start gap-2 text-xs text-muted-foreground">
              <Clock size={14} className="shrink-0 mt-0.5" />
              <span>
                Acesso disponível até{' '}
                <strong className="text-foreground">
                  {formatDateTime(myTrialRequest.endDate)}
                </strong>
                .
              </span>
            </div>
          )}
        </div>
      )}

      <div className="p-4 bg-muted rounded-2xl mb-6">
        <p className="text-sm font-semibold text-foreground mb-2">
          Regras do teste gratuito
        </p>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            Disponível apenas uma vez por cliente.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>O acesso é de 4 horas
            contínuas.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>O teste não inicia
            automaticamente; é ativado pela equipe.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>O horário de início é
            definido com base na disponibilidade.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>Não exige pagamento.
          </li>
        </ul>
      </div>

      {trialStatus === 'disponivel' && (
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 card-glow space-y-4"
        >
          <h2 className="text-base font-display font-semibold text-foreground mb-2">
            Formulário de solicitação
          </h2>

          <div>
            <label
              htmlFor="trial-device"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Dispositivo que será utilizado
            </label>
            <select
              id="trial-device"
              value={form.device}
              disabled={loading}
              onChange={(event) => setField('device', event.target.value)}
              className={`w-full px-4 py-3 bg-muted border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors disabled:opacity-60 ${
                errors.device
                  ? 'border-destructive'
                  : 'border-border focus:border-primary'
              }`}
            >
              <option value="">Selecione...</option>
              <option>Android TV</option>
              <option>Android TV Stick</option>
              <option>Smart TV Samsung</option>
              <option>Smart TV LG</option>
              <option>Roku TV / Roku Express</option>
              <option>Navegador Web</option>
              <option>Outro</option>
            </select>
            {errors.device && (
              <p className="text-xs text-destructive mt-1">{errors.device}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="trial-os"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Sistema operacional
            </label>
            <input
              id="trial-os"
              type="text"
              value={form.os}
              disabled={loading}
              maxLength={80}
              onChange={(event) => setField('os', event.target.value)}
              placeholder="Ex: Android 11, WebOS 6.0, Tizen 6"
              className={`w-full px-4 py-3 bg-muted border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors disabled:opacity-60 ${
                errors.os
                  ? 'border-destructive'
                  : 'border-border focus:border-primary'
              }`}
            />
            {errors.os && (
              <p className="text-xs text-destructive mt-1">{errors.os}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="trial-model"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Modelo do dispositivo
            </label>
            <input
              id="trial-model"
              type="text"
              value={form.model}
              disabled={loading}
              maxLength={120}
              onChange={(event) => setField('model', event.target.value)}
              placeholder="Ex: Samsung QN43Q60CAG, LG 55UN7300"
              className={`w-full px-4 py-3 bg-muted border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors disabled:opacity-60 ${
                errors.model
                  ? 'border-destructive'
                  : 'border-border focus:border-primary'
              }`}
            />
            {errors.model && (
              <p className="text-xs text-destructive mt-1">{errors.model}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="trial-time"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Melhor horário para ativação
            </label>
            <input
              id="trial-time"
              type="text"
              value={form.preferredTime}
              disabled={loading}
              maxLength={120}
              onChange={(event) =>
                setField('preferredTime', event.target.value)
              }
              placeholder="Ex: Segunda a sexta, das 18h às 22h"
              className={`w-full px-4 py-3 bg-muted border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors disabled:opacity-60 ${
                errors.preferredTime
                  ? 'border-destructive'
                  : 'border-border focus:border-primary'
              }`}
            />
            {errors.preferredTime && (
              <p className="text-xs text-destructive mt-1">
                {errors.preferredTime}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="trial-notes"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Observação (opcional)
            </label>
            <textarea
              id="trial-notes"
              value={form.notes}
              disabled={loading}
              maxLength={1000}
              onChange={(event) => setField('notes', event.target.value)}
              placeholder="Informações adicionais que possam ajudar na ativação..."
              rows={3}
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none disabled:opacity-60"
            />
            <p className="mt-1 text-right text-[10px] text-muted-foreground">
              {form.notes.length}/1000
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 gradient-bg text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Enviando...' : 'Solicitar teste gratuito'}
          </button>
        </form>
      )}
    </div>
  );
}
