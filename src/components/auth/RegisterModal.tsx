import { useState, type FormEvent, type ReactNode } from 'react';
import { X, Eye, EyeOff, PlayCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

type FormData = {
  name: string;
  email: string;
  whatsapp: string;
  password: string;
  confirm: string;
};

type FormField = keyof FormData;

type FormErrors = Partial<Record<FormField | 'terms' | 'global', string>>;

type FieldProps = {
  id: FormField;
  label: string;
  error?: string;
  children: ReactNode;
};

const INITIAL_FORM: FormData = {
  name: '',
  email: '',
  whatsapp: '',
  password: '',
  confirm: '',
};

function maskWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Este componente precisa permanecer fora de RegisterModal.
// Assim, o React não desmonta e recria os inputs em cada tecla digitada.
function Field({ id, label, error, children }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-foreground mb-1.5"
      >
        {label}
      </label>

      {children}

      {error && (
        <p className="text-xs text-destructive mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function RegisterModal() {
  const { showRegister, setShowRegister, setShowLogin, register } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState('');

  if (!showRegister) return null;

  const setField = (field: FormField, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
      global: undefined,
    }));

    setSuccess('');
  };

  const validate = (): FormErrors => {
    const validationErrors: FormErrors = {};

    if (!form.name.trim()) {
      validationErrors.name = 'Nome obrigatório.';
    }

    if (!validateEmail(form.email)) {
      validationErrors.email = 'E-mail inválido.';
    }

    const whatsappDigits = form.whatsapp.replace(/\D/g, '');
    if (whatsappDigits.length < 10 || whatsappDigits.length > 11) {
      validationErrors.whatsapp = 'WhatsApp inválido.';
    }

    if (form.password.length < 8) {
      validationErrors.password = 'Mínimo de 8 caracteres.';
    }

    if (form.password !== form.confirm) {
      validationErrors.confirm = 'Senhas não coincidem.';
    }

    if (!acceptTerms) {
      validationErrors.terms = 'Aceite os termos para continuar.';
    }

    return validationErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess('');

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        whatsapp: form.whatsapp.replace(/\D/g, ''),
        password: form.password,
      });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setSuccess(
          'Cadastro realizado. Verifique seu e-mail para confirmar sua conta.'
        );
        setForm(INITIAL_FORM);
        setAcceptTerms(false);
        setShowPassword(false);
        return;
      }

      setShowRegister(false);
      navigate('/cliente');
    } catch (error: unknown) {
      setErrors({
        global:
          error instanceof Error
            ? error.message
            : 'Não foi possível realizar o cadastro.',
      });
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    if (loading) return;

    setShowRegister(false);
    setErrors({});
    setSuccess('');
  };

  const openLogin = () => {
    if (loading) return;

    setShowRegister(false);
    setShowLogin(true);
    setErrors({});
    setSuccess('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-title"
    >
      <button
        type="button"
        aria-label="Fechar cadastro"
        className="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-sm"
        onClick={close}
        disabled={loading}
      />

      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl animate-fade-in-up p-8 my-8">
        <button
          type="button"
          onClick={close}
          disabled={loading}
          aria-label="Fechar"
          className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
              <img
                src="/favicon.svg"
                alt="Logo ChamPlay"
                width={40}
                height={40}
                className="block w-full h-full rounded object-contain"
              />
            </div>

          <div>
            <h2
              id="register-title"
              className="text-xl font-display font-bold text-foreground"
            >
              Criar conta
            </h2>
            <p className="text-xs text-muted-foreground">
              Comece sua experiência ChamPlay
            </p>
          </div>
        </div>

        {errors.global && (
          <div
            className="mb-4 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive"
            role="alert"
          >
            {errors.global}
          </div>
        )}

        {success && (
          <div
            className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-600"
            role="status"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Field id="name" label="Nome completo" error={errors.name}>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(event) => setField('name', event.target.value)}
              placeholder="Seu nome completo"
              disabled={loading}
              aria-invalid={Boolean(errors.name)}
              className={`w-full px-4 py-3 bg-muted border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors disabled:opacity-60 ${
                errors.name
                  ? 'border-destructive'
                  : 'border-border focus:border-primary'
              }`}
            />
          </Field>

          <Field id="email" label="E-mail" error={errors.email}>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setField('email', event.target.value)}
              placeholder="seu@email.com"
              disabled={loading}
              aria-invalid={Boolean(errors.email)}
              className={`w-full px-4 py-3 bg-muted border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors disabled:opacity-60 ${
                errors.email
                  ? 'border-destructive'
                  : 'border-border focus:border-primary'
              }`}
            />
          </Field>

          <Field
            id="whatsapp"
            label="WhatsApp (com DDD)"
            error={errors.whatsapp}
          >
            <input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={form.whatsapp}
              onChange={(event) =>
                setField('whatsapp', maskWhatsApp(event.target.value))
              }
              placeholder="(11) 99999-9999"
              maxLength={15}
              disabled={loading}
              aria-invalid={Boolean(errors.whatsapp)}
              className={`w-full px-4 py-3 bg-muted border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors disabled:opacity-60 ${
                errors.whatsapp
                  ? 'border-destructive'
                  : 'border-border focus:border-primary'
              }`}
            />
          </Field>

          <Field
            id="password"
            label="Senha (mínimo 8 caracteres)"
            error={errors.password}
          >
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => setField('password', event.target.value)}
                placeholder="••••••••"
                minLength={8}
                disabled={loading}
                aria-invalid={Boolean(errors.password)}
                className={`w-full px-4 py-3 pr-11 bg-muted border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors disabled:opacity-60 ${
                  errors.password
                    ? 'border-destructive'
                    : 'border-border focus:border-primary'
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                disabled={loading}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          <Field id="confirm" label="Confirmar senha" error={errors.confirm}>
            <input
              id="confirm"
              name="confirm"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.confirm}
              onChange={(event) => setField('confirm', event.target.value)}
              placeholder="••••••••"
              minLength={8}
              disabled={loading}
              aria-invalid={Boolean(errors.confirm)}
              className={`w-full px-4 py-3 bg-muted border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors disabled:opacity-60 ${
                errors.confirm
                  ? 'border-destructive'
                  : 'border-border focus:border-primary'
              }`}
            />
          </Field>

          <div>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                disabled={loading}
                onChange={(event) => {
                  setAcceptTerms(event.target.checked);
                  setErrors((previous) => ({
                    ...previous,
                    terms: undefined,
                    global: undefined,
                  }));
                  setSuccess('');
                }}
                className="w-4 h-4 accent-primary mt-0.5 shrink-0"
              />

              <span className="text-sm text-muted-foreground">
                Li e aceito os{' '}
                <a
                  href="/termos"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Termos de Uso
                </a>{' '}
                e a{' '}
                <a
                  href="/privacidade"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Política de Privacidade
                </a>
                .
              </span>
            </label>

            {errors.terms && (
              <p className="text-xs text-destructive mt-1" role="alert">
                {errors.terms}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 gradient-bg text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Criando conta...' : 'Criar minha conta'}
          </button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-6">
          Já tem uma conta?{' '}
          <button
            type="button"
            onClick={openLogin}
            disabled={loading}
            className="text-primary hover:underline font-medium disabled:opacity-50"
          >
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}
