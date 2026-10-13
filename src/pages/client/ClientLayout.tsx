import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  Play,
  MessageCircle,
  User,
  LogOut,
  PlayCircle,
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ToastContainer } from '../../components/Toast';
import { LoginModal } from '../../components/auth/LoginModal';

const navItems = [
  { to: '/cliente', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/cliente/planos', label: 'Meus planos', icon: CreditCard, end: false },
  { to: '/cliente/teste', label: 'Teste gratuito', icon: Play, end: false },
  { to: '/cliente/suporte', label: 'Suporte', icon: MessageCircle, end: false },
  { to: '/cliente/perfil', label: 'Meu perfil', icon: User, end: false },
];

export default function ClientLayout() {
  const {
    currentUser,
    logout,
    theme,
    toggleTheme,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notificationLoadingId, setNotificationLoadingId] = useState<
    string | null
  >(null);

  const [markingAllNotifications, setMarkingAllNotifications] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  if (!currentUser) return <Navigate to="/" replace />;
  if (currentUser.role === 'admin') return <Navigate to="/admin" replace />;

  const initials = currentUser.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erro ao sair da conta:', error);
    }
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? 'w-72' : 'w-64'}`}>
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
            <PlayCircle size={18} className="text-white" />
          </div>
          <span className="text-lg font-display font-bold text-foreground">
            Cham<span className="text-primary">Play</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'gradient-bg text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={() => void handleLogout()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </div>
  );
  const formatNotificationDate = (value: string): string => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleNotificationClick = async (
    notificationId: string,
    read: boolean,
    link: string | null
  ): Promise<void> => {
    if (notificationLoadingId) return;

    setNotificationLoadingId(notificationId);

    try {
      if (!read) {
        await markNotificationRead(notificationId);
      }

      setShowNotifs(false);

      if (link) {
        navigate(link);
      }
    } catch (error) {
      console.error('Erro ao abrir notificação:', error);
    } finally {
      setNotificationLoadingId(null);
    }
  };

  const handleMarkAllNotificationsRead = async (): Promise<void> => {
    if (markingAllNotifications || unreadCount === 0) {
      return;
    }

    setMarkingAllNotifications(true);

    try {
      await markAllNotificationsRead();
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    } finally {
      setMarkingAllNotifications(false);
    }
  };
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col bg-card border-r border-border shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative bg-card border-r border-border flex flex-col animate-slide-in-right">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:bg-muted"
            >
              <X size={18} />
            </button>
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="shrink-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            >
              <Menu size={18} />
            </button>
            <span className="text-sm font-medium text-muted-foreground hidden sm:block">
              {currentUser.name.split(' ')[0]}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifs((previous) => !previous)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative"
                aria-label="Abrir notificações"
                aria-expanded={showNotifs}
                title="Notificações"
              >
                <Bell size={16} />

                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 gradient-bg rounded-full flex items-center justify-center text-[9px] text-white font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="fixed top-16 left-4 right-4 sm:absolute sm:top-10 sm:left-auto sm:right-0 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Notificações
                      </p>

                      {unreadCount > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {unreadCount}{' '}
                          {unreadCount === 1
                            ? 'notificação não lida'
                            : 'notificações não lidas'}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => void handleMarkAllNotificationsRead()}
                          disabled={markingAllNotifications}
                          className="text-xs text-primary hover:underline disabled:opacity-50"
                        >
                          {markingAllNotifications
                            ? 'Marcando...'
                            : 'Marcar todas'}
                        </button>
                      )}

                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        onClick={() => setShowNotifs(false)}
                      >
                        Fechar
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                          <Bell size={18} className="text-muted-foreground" />
                        </div>

                        <p className="text-sm font-medium text-foreground">
                          Sem notificações
                        </p>

                        <p className="text-xs text-muted-foreground mt-1">
                          Novas atualizações aparecerão aqui.
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const isLoading =
                          notificationLoadingId === notification.id;

                        return (
                          <button
                            key={notification.id}
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                              void handleNotificationClick(
                                notification.id,
                                notification.read,
                                notification.link
                              )
                            }
                            className={`w-full p-4 text-left border-b border-border last:border-0 transition-colors disabled:opacity-60 ${
                              notification.read
                                ? 'bg-card hover:bg-muted/50'
                                : 'bg-primary/5 hover:bg-primary/10'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                                  notification.read
                                    ? 'bg-transparent'
                                    : 'bg-primary'
                                }`}
                              />

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p
                                    className={`text-sm text-foreground ${
                                      notification.read
                                        ? 'font-medium'
                                        : 'font-semibold'
                                    }`}
                                  >
                                    {notification.title}
                                  </p>

                                  {isLoading && (
                                    <Loader2
                                      size={14}
                                      className="animate-spin text-primary shrink-0"
                                    />
                                  )}
                                </div>

                                <p className="text-xs text-muted-foreground mt-1 break-words">
                                  {notification.message}
                                </p>

                                <p className="text-[11px] text-muted-foreground mt-2">
                                  {formatNotificationDate(
                                    notification.createdAt
                                  )}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div
              className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer"
              onClick={() => navigate('/cliente/perfil')}
            >
              {initials}
            </div>

            <button
              onClick={() => void handleLogout()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden md:block">Sair</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <LoginModal />
      <ToastContainer />
    </div>
  );
}
