import { useEffect, useState } from 'react';
import { Loader2, Menu, Moon, Sun, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const NAV_LINKS = [
  { label: 'Home', href: '#inicio' },
  { label: 'Compatibilidade', href: '#compatibilidade' },
  { label: 'Planos', href: '#planos' },
  { label: 'Dúvidas', href: '#duvidas' },
];

export function Header() {
  const {
    theme,
    toggleTheme,
    currentUser,
    authLoading,
    setShowLogin,
    setShowRegister,
  } = useApp();

  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [changingTheme, setChangingTheme] = useState(false);

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollTo = (href: string): void => {
    setMobileOpen(false);

    const element = document.querySelector(href);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      return;
    }

    navigate('/');

    window.setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  const handleCurrentUserClick = (): void => {
    setMobileOpen(false);

    if (!currentUser) {
      setShowRegister(false);
      setShowLogin(true);
      return;
    }

    if (currentUser.role === 'admin') {
      navigate('/admin');
      return;
    }

    navigate('/cliente');
  };

  const handleOpenLogin = (): void => {
    setMobileOpen(false);
    setShowRegister(false);
    setShowLogin(true);
  };

  const handleOpenRegister = (): void => {
    setMobileOpen(false);
    setShowLogin(false);
    setShowRegister(true);
  };

  const handleThemeChange = async (): Promise<void> => {
    if (changingTheme) return;

    setChangingTheme(true);

    try {
      await toggleTheme();
    } catch (error) {
      console.error('Erro ao trocar o tema:', error);
    } finally {
      setChangingTheme(false);
    }
  };

  const accountButtonLabel =
    currentUser?.role === 'admin' ? 'Painel admin' : 'Minha conta';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-card/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            type="button"
            onClick={() => scrollTo('#inicio')}
            className="flex items-center gap-2 group"
            aria-label="Ir para o início"
          >
            <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
              <img
                src="/favicon.svg"
                alt="Logo ChamPlay"
                width={40}
                height={40}
                className="block w-full h-full rounded object-contain"
              />
            </div>

            <span className="text-xl font-display font-bold text-foreground">
              Cham<span className="text-primary">Play</span>
            </span>
          </button>

          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Navegação principal"
          >
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollTo(link.href)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleThemeChange()}
              disabled={changingTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
              aria-label={
                theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'
              }
              title={
                theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'
              }
            >
              {changingTheme ? (
                <Loader2 size={18} className="animate-spin" />
              ) : theme === 'dark' ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

            {authLoading ? (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
                <Loader2 size={16} className="animate-spin" />
                Carregando...
              </div>
            ) : currentUser ? (
              <button
                type="button"
                onClick={handleCurrentUserClick}
                className="hidden md:flex items-center gap-2 px-4 py-2 gradient-bg text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                {accountButtonLabel}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleOpenLogin}
                  className="hidden md:flex px-4 py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                >
                  Entrar
                </button>

                <button
                  type="button"
                  onClick={handleOpenRegister}
                  className="hidden md:flex px-4 py-2 gradient-bg text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Cadastre-se
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((previous) => !previous)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-navigation"
          className="md:hidden bg-card border-b border-border"
        >
          <div className="px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollTo(link.href)}
                className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg text-left transition-colors"
              >
                {link.label}
              </button>
            ))}

            <div className="pt-3 flex flex-col gap-2 border-t border-border mt-2">
              {authLoading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 size={16} className="animate-spin" />
                  Carregando sessão...
                </div>
              ) : currentUser ? (
                <button
                  type="button"
                  onClick={handleCurrentUserClick}
                  className="px-4 py-3 gradient-bg text-white text-sm font-semibold rounded-xl text-center"
                >
                  {accountButtonLabel}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleOpenLogin}
                    className="px-4 py-3 text-sm font-semibold text-foreground border border-border rounded-xl hover:bg-muted transition-colors"
                  >
                    Entrar
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenRegister}
                    className="px-4 py-3 gradient-bg text-white text-sm font-semibold rounded-xl text-center"
                  >
                    Cadastre-se
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
