import { useMemo, useState } from 'react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronRight,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Play,
  PlayCircle,
  Shield,
  Sun,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ToastContainer } from '../../components/Toast';

type NotificationFilter = 'all' | 'unread';

const adminNavItems = [
  {
    to: '/admin',
    label: 'Visão geral',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/admin/clientes',
    label: 'Clientes',
    icon: Users,
    end: false,
  },
  {
    to: '/admin/testes',
    label: 'Testes',
    icon: Play,
    end: false,
  },
  {
    to: '/admin/chamados',
    label: 'Chamados',
    icon: MessageCircle,
    end: false,
  },
];

export default function AdminLayout() {
  const {
    currentUser,
    authLoading,
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
  const [changingTheme, setChangingTheme] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notificationLoadingId, setNotificationLoadingId] = useState<
    string | null
  >(null);
  const [markingAllNotifications, setMarkingAllNotifications] = useState(false);
  const [notificationFilter, setNotificationFilter] =
    useState<NotificationFilter>('all');

  const visibleNotifications = useMemo(() => {
    const filteredNotifications =
      notificationFilter === 'unread'
        ? notifications.filter((notification) => !notification.read)
        : notifications;

    return filteredNotifications.slice(0, 30);
  }, [notifications, notificationFilter]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-2 bg-background text-muted-foreground">
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

  const initials =
    currentUser.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name.charAt(0))
      .join('')
      .toUpperCase() || 'AD';

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

  const resolveAdminNotificationLink = (link: string | null): string => {
    if (!link || !link.startsWith('/admin')) {
      return '/admin';
    }

    if (
      link === '/admin/assinaturas' ||
      link === '/admin/planos' ||
      link === '/admin/subscriptions'
    ) {
      return '/admin/clientes';
    }

    if (link.startsWith('/admin/assinaturas/')) {
      const userId = link.replace('/admin/assinaturas/', '').trim();

      return userId ? `/admin/clientes/${userId}` : '/admin/clientes';
    }

    if (link.startsWith('/admin/planos/')) {
      const userId = link.replace('/admin/planos/', '').trim();

      return userId ? `/admin/clientes/${userId}` : '/admin/clientes';
    }

    return link;
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

  const handleLogout = async (): Promise<void> => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
      setSidebarOpen(false);
      setShowNotifs(false);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Erro ao sair da conta:', error);
    } finally {
      setLoggingOut(false);
    }
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
      navigate(resolveAdminNotificationLink(link));
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

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
            <PlayCircle size={18} className="text-white" />
          </div>

          <div>
            <span className="text-sm font-display font-bold text-foreground">
              ChamPlay
            </span>

            <div className="flex items-center gap-1 text-[10px] text-warning">
              <Shield size={9} />
              <span>Admin</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {adminNavItems.map(({ to, label, icon: Icon, end }) => (
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
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <button
          type="button"
          onClick={() => void handleThemeChange()}
          disabled={changingTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 transition-all w-full"
        >
          {changingTheme ? (
            <Loader2 size={16} className="animate-spin" />
          ) : theme === 'dark' ? (
            <Sun size={16} />
          ) : (
            <Moon size={16} />
          )}

          {theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
        </button>

        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-all w-full"
        >
          {loggingOut ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <LogOut size={16} />
          )}
          Sair
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <aside className="hidden lg:flex flex-col w-56 bg-card border-r border-border shrink-0">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 w-full h-full bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="relative w-64 bg-card border-r border-border flex flex-col">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Fechar menu lateral"
              className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-muted text-muted-foreground"
            >
              <X size={16} />
            </button>

            <SidebarContent />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="shrink-0 h-14 bg-card border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu lateral"
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted"
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-1.5 text-xs text-warning min-w-0">
              <Shield size={12} className="shrink-0" />
              <span className="font-medium truncate">
                Painel Administrativo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleThemeChange()}
              disabled={changingTheme}
              aria-label={
                theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'
              }
              title={
                theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'
              }
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
            >
              {changingTheme ? (
                <Loader2 size={16} className="animate-spin" />
              ) : theme === 'dark' ? (
                <Sun size={16} />
              ) : (
                <Moon size={16} />
              )}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifs((previous) => !previous)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative"
                aria-label="Abrir notificações administrativas"
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
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        Notificações administrativas
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

                    <div className="flex items-center gap-2 shrink-0">
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

                  <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
                    <button
                      type="button"
                      onClick={() => setNotificationFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        notificationFilter === 'all'
                          ? 'bg-primary text-white'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      Todas
                    </button>

                    <button
                      type="button"
                      onClick={() => setNotificationFilter('unread')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        notificationFilter === 'unread'
                          ? 'bg-primary text-white'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      Não lidas
                      {unreadCount > 0 && ` (${unreadCount})`}
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {visibleNotifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                          <Bell size={18} className="text-muted-foreground" />
                        </div>

                        <p className="text-sm font-medium text-foreground">
                          {notificationFilter === 'unread'
                            ? 'Nenhuma notificação não lida'
                            : 'Sem notificações'}
                        </p>

                        <p className="text-xs text-muted-foreground mt-1">
                          {notificationFilter === 'unread'
                            ? 'Todas as notificações foram lidas.'
                            : 'Novas solicitações aparecerão aqui.'}
                        </p>
                      </div>
                    ) : (
                      visibleNotifications.map((notification) => {
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

            <div
              className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white text-xs font-bold"
              title={currentUser.name}
            >
              {initials}
            </div>

            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors"
            >
              {loggingOut ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <LogOut size={14} />
              )}
              <span className="hidden md:block">Sair</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
