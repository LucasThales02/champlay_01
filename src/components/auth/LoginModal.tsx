import { useEffect, useState, type FormEvent } from 'react';
import { X, Eye, EyeOff, PlayCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

const REMEMBER_EMAIL_KEY = 'cp_remembered_email';

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function LoginModal() {
  const { showLogin, setShowLogin, setShowRegister, login } = useApp();

  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recoveringPassword, setRecoveringPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);

    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRemember(true);
    }
  }, []);

  if (!showLogin) return null;

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    clearMessages();
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    clearMessages();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError('Preencha o e-mail e a senha.');
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      setError('Informe um e-mail válido.');
      return;
    }

    setLoading(true);

    try {
      await login(normalizedEmail, password);

      if (remember) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, normalizedEmail);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      setPassword('');
      setShowLogin(false);
      navigate('/cliente');
    } catch (loginError: unknown) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Não foi possível entrar na conta.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    clearMessages();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError('Informe seu e-mail para recuperar a senha.');
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      setError('Informe um e-mail válido.');
      return;
    }

    setRecoveringPassword(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo: `${window.location.origin}/redefinir-senha`,
        }
      );

      if (resetError) {
        throw resetError;
      }

      setSuccess(
        'Enviamos as instruções de recuperação para o e-mail informado.'
      );
    } catch (resetError: unknown) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : 'Não foi possível enviar o e-mail de recuperação.'
      );
    } finally {
      setRecoveringPassword(false);
    }
  };

  const close = () => {
    if (loading || recoveringPassword) return;

    setShowLogin(false);
    setPassword('');
    setShowPassword(false);
    clearMessages();
  };

  const openRegister = () => {
    if (loading || recoveringPassword) return;

    setShowLogin(false);
    setShowRegister(true);
    setPassword('');
    setShowPassword(false);
    clearMessages();
  };

  const busy = loading || recoveringPassword;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
    >
      <button
        type="button"
        aria-label="Fechar login"
        className="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-sm"
        onClick={close}
        disabled={busy}
      />

      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl animate-fade-in-up p-8 my-8">
        <button
          type="button"
          onClick={close}
          disabled={busy}
          aria-label="Fechar"
          className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
            <PlayCircle size={20} className="text-white" />
          </div>

          <div>
            <h2
              id="login-title"
              className="text-xl font-display font-bold text-foreground"
            >
              Entrar
            </h2>
            <p className="text-xs text-muted-foreground">
              Acesse sua conta ChamPlay
            </p>
          </div>
        </div>

        {error && (
          <div
            className="mb-4 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive"
            role="alert"
          >
            {error}
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
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              E-mail
            </label>

            <input
              id="login-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => handleEmailChange(event.target.value)}
              placeholder="seu@email.com"
              disabled={busy}
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-60 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Senha
            </label>

            <div className="relative">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => handlePasswordChange(event.target.value)}
                placeholder="••••••••"
                disabled={busy}
                className="w-full px-4 py-3 pr-11 bg-muted border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-60 transition-colors"
              />

              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                disabled={busy}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                disabled={busy}
                onChange={(event) => setRemember(event.target.checked)}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="text-sm text-muted-foreground">
                Lembrar e-mail
              </span>
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={busy}
              className="text-sm text-primary hover:underline disabled:opacity-50"
            >
              {recoveringPassword ? 'Enviando...' : 'Esqueci minha senha'}
            </button>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 gradient-bg text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-6">
          Não tem uma conta?{' '}
          <button
            type="button"
            onClick={openRegister}
            disabled={busy}
            className="text-primary hover:underline font-medium disabled:opacity-50"
          >
            Cadastre-se
          </button>
        </p>
      </div>
    </div>
  );
}
