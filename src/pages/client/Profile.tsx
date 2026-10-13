import { useState } from 'react';
import { User, Lock, Palette, Calendar, Trash2, LogOut, Loader2, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Theme } from '../../types';

function maskWhatsApp(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function Profile() {
  const { currentUser, updateProfile, changePassword, logout, theme, toggleTheme, addToast } = useApp();
  const [nameForm, setNameForm] = useState({ name: currentUser?.name || '', whatsapp: currentUser?.whatsapp || '' });
  const [nameLoading, setNameLoading] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);

  if (!currentUser) return null;

  const initials = currentUser.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
  const joined = new Date(currentUser.createdAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameForm.name.trim()) { addToast('Nome não pode ser vazio.', 'error'); return; }
    setNameLoading(true);
    try { await updateProfile({ name: nameForm.name, whatsapp: nameForm.whatsapp }); }
    finally { setNameLoading(false); }
  };

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!pwForm.current) errs.current = 'Informe a senha atual.';
    if (pwForm.next.length < 8) errs.next = 'Mínimo de 8 caracteres.';
    if (pwForm.next !== pwForm.confirm) errs.confirm = 'Senhas não coincidem.';
    if (Object.keys(errs).length > 0) { setPwErrors(errs); return; }
    setPwLoading(true);
    try {
      await changePassword(pwForm.current, pwForm.next);
      setPwForm({ current: '', next: '', confirm: '' });
      setPwErrors({});
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Erro ao alterar senha.', 'error');
    } finally { setPwLoading(false); }
  };

  const handleThemeChange = (t: Theme) => {
    if (t !== theme) toggleTheme();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Meu perfil</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie suas informações e preferências.</p>
      </div>

      {/* Avatar & info */}
      <div className="flex items-center gap-4 p-5 bg-card border border-border rounded-2xl card-glow mb-5">
        <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-lg font-display font-bold text-foreground">{currentUser.name}</p>
          <p className="text-sm text-muted-foreground">{currentUser.email}</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <Calendar size={12} />
            <span>Membro desde {joined}</span>
          </div>
        </div>
      </div>

      {/* Personal data */}
      <div className="bg-card border border-border rounded-2xl card-glow p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <User size={16} className="text-primary" />
          <h2 className="text-base font-display font-semibold text-foreground">Dados pessoais</h2>
        </div>
        <form onSubmit={handleSaveName} className="space-y-4">
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-foreground mb-1.5">Nome completo</label>
            <input
              id="profile-name"
              type="text"
              value={nameForm.name}
              onChange={(e) => setNameForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label htmlFor="profile-wa" className="block text-sm font-medium text-foreground mb-1.5">WhatsApp</label>
            <input
              id="profile-wa"
              type="tel"
              value={nameForm.whatsapp}
              onChange={(e) => setNameForm((p) => ({ ...p, whatsapp: maskWhatsApp(e.target.value) }))}
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">E-mail</label>
            <input
              type="email"
              value={currentUser.email}
              disabled
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">Para alterar o e-mail, entre em contato com o suporte.</p>
          </div>
          <button
            type="submit"
            disabled={nameLoading}
            className="px-5 py-2.5 gradient-bg text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-60 flex items-center gap-2 transition-all"
          >
            {nameLoading && <Loader2 size={14} className="animate-spin" />}
            Salvar alterações
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-card border border-border rounded-2xl card-glow p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={16} className="text-primary" />
          <h2 className="text-base font-display font-semibold text-foreground">Alterar senha</h2>
        </div>
        <form onSubmit={handleChangePw} className="space-y-4">
          {(['current', 'next', 'confirm'] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {field === 'current' ? 'Senha atual' : field === 'next' ? 'Nova senha' : 'Confirmar nova senha'}
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pwForm[field]}
                  onChange={(e) => { setPwForm((p) => ({ ...p, [field]: e.target.value })); setPwErrors((p) => ({ ...p, [field]: '' })); }}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-11 bg-muted border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${pwErrors[field] ? 'border-destructive' : 'border-border focus:border-primary'}`}
                />
                {field === 'current' && (
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
              {pwErrors[field] && <p className="text-xs text-destructive mt-1">{pwErrors[field]}</p>}
            </div>
          ))}
          <button
            type="submit"
            disabled={pwLoading}
            className="px-5 py-2.5 bg-secondary text-foreground text-sm font-semibold rounded-xl hover:bg-muted border border-border transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {pwLoading && <Loader2 size={14} className="animate-spin" />}
            Alterar senha
          </button>
        </form>
      </div>

      {/* Theme */}
      <div className="bg-card border border-border rounded-2xl card-glow p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={16} className="text-primary" />
          <h2 className="text-base font-display font-semibold text-foreground">Tema</h2>
        </div>
        <div className="flex gap-3">
          {(['dark', 'light'] as Theme[]).map((t) => (
            <button
              key={t}
              onClick={() => handleThemeChange(t)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${
                theme === t
                  ? 'gradient-bg text-white border-transparent'
                  : 'bg-muted text-muted-foreground border-border hover:border-primary/30'
              }`}
            >
              {t === 'dark' ? '🌙 Escuro' : '☀️ Claro'}
            </button>
          ))}
        </div>
      </div>

      {/* Account actions */}
      <div className="bg-card border border-border rounded-2xl card-glow p-5 space-y-3">
        <h2 className="text-base font-display font-semibold text-foreground mb-2">Conta</h2>
        <button
          onClick={() => { logout(); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          <LogOut size={16} className="text-muted-foreground" />
          Encerrar sessão atual
        </button>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          onClick={() => addToast('Para solicitar a exclusão da conta, entre em contato com o suporte.', 'info')}
        >
          <Trash2 size={16} />
          Solicitar exclusão da conta
        </button>
      </div>
    </div>
  );
}
