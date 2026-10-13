import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

import type {
  User,
  Plan,
  ClientAccess,
  Subscription,
  TrialRequest,
  Ticket,
  Message,
  Notification,
  Toast,
  Theme,
  SubscriptionStatus,
  TrialStatus,
  TicketStatus,
  RegisterData,
  TrialRequestFormData,
  CreateTicketData,
  UpdateProfileData,
  ToastType,
} from '../types';
import { loadPlans, findPlanById } from '../data/plans';
import { supabase } from '../lib/supabase';

const THEME_KEY = 'cp_theme';
const uid = (): string =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const now = (): string => new Date().toISOString();

function errorMessage(error: unknown, fallback: string): string {
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

function mapClientAccess(row: Record<string, unknown>): ClientAccess {
  return {
    id: typeof row.id === 'string' ? row.id : '',
    userId: typeof row.user_id === 'string' ? row.user_id : '',
    adminId: typeof row.admin_id === 'string' ? row.admin_id : null,
    accessSite:
      typeof row.access_site === 'string' ? row.access_site.trim() : null,
    accessUsername:
      typeof row.access_username === 'string'
        ? row.access_username.trim()
        : null,
    accessPassword:
      typeof row.access_password === 'string'
        ? row.access_password.trim()
        : null,
    credentialsSentAt:
      typeof row.credentials_sent_at === 'string'
        ? row.credentials_sent_at
        : null,
    credentialsSentBy:
      typeof row.credentials_sent_by === 'string'
        ? row.credentials_sent_by
        : null,
    createdAt: typeof row.created_at === 'string' ? row.created_at : now(),
    updatedAt: typeof row.updated_at === 'string' ? row.updated_at : null,
  };
}

function mapSubscription(row: Record<string, unknown>): Subscription {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    planId: String(row.plan_id),
    status: row.status as SubscriptionStatus,
    contractedPrice: Number(row.contracted_price ?? 0),
    startDate: typeof row.start_date === 'string' ? row.start_date : null,
    endDate: typeof row.end_date === 'string' ? row.end_date : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapTrial(row: Record<string, unknown>): TrialRequest {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    device: String(row.device ?? ''),
    model: String(row.model ?? ''),
    preferredTime: String(row.preferred_time ?? ''),
    status: row.status as TrialStatus,
    startDate: typeof row.start_date === 'string' ? row.start_date : null,
    endDate: typeof row.end_date === 'string' ? row.end_date : null,
    reviewedBy: typeof row.reviewed_by === 'string' ? row.reviewed_by : null,
    accessSite: typeof row.access_site === 'string' ? row.access_site : null,
    accessUsername:
      typeof row.access_username === 'string' ? row.access_username : null,
    accessPassword:
      typeof row.access_password === 'string' ? row.access_password : null,
    credentialsSentAt:
      typeof row.credentials_sent_at === 'string'
        ? row.credentials_sent_at
        : null,
    credentialsSentBy:
      typeof row.credentials_sent_by === 'string'
        ? row.credentials_sent_by
        : null,
    createdAt: String(row.created_at),
  };
}

function mapTicket(row: Record<string, unknown>): Ticket {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    adminId: typeof row.admin_id === 'string' ? row.admin_id : null,
    category: row.category as Ticket['category'],
    subject: String(row.subject ?? ''),
    status: row.status as TicketStatus,
    createdAt: typeof row.created_at === 'string' ? row.created_at : now(),
    closedAt: typeof row.closed_at === 'string' ? row.closed_at : null,
  };
}

function mapMessage(row: Record<string, unknown>): Message {
  return {
    id: String(row.id),
    ticketId: String(row.ticket_id),
    senderId: String(row.sender_id),
    content: String(row.content),
    attachment: typeof row.attachment === 'string' ? row.attachment : null,
    read: Boolean(row.read),
    createdAt: String(row.created_at),
  };
}

function mapNotification(row: Record<string, unknown>): Notification {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    title: String(row.title),
    message: String(row.message),
    read: Boolean(row.read),
    type: row.type as Notification['type'],
    link: typeof row.link === 'string' ? row.link : null,
    createdAt: String(row.created_at),
  };
}

interface AppContextType {
  currentUser: User | null;
  authLoading: boolean;
  dataLoading: boolean;
  theme: Theme;
  toggleTheme: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  showLogin: boolean;
  showRegister: boolean;
  setShowLogin: (value: boolean) => void;
  setShowRegister: (value: boolean) => void;
  plans: Plan[];
  plansLoading: boolean;
  plansError: string;
  reloadPlans: () => Promise<void>;
  reloadOperationalData: () => Promise<void>;
  myClientAccess: ClientAccess | null;
  allClientAccesses: ClientAccess[];
  saveClientAccess: (
    userId: string,
    credentials: { site: string; username: string; password: string }
  ) => Promise<void>;
  mySubscription: Subscription | null;
  requestPlan: (planId: string) => Promise<void>;
  myTrialRequest: TrialRequest | null;
  submitTrialRequest: (data: TrialRequestFormData) => Promise<void>;
  myTickets: Ticket[];
  createTicket: (data: CreateTicketData) => Promise<string>;
  getMessages: (ticketId: string) => Message[];
  sendMessage: (ticketId: string, content: string) => Promise<void>;
  notifications: Notification[];
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  unreadCount: number;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  toasts: Toast[];
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
  allUsers: User[];
  allSubscriptions: Subscription[];
  allTrialRequests: TrialRequest[];
  allTickets: Ticket[];
  adminUpdateTrial: (
    id: string,
    status: TrialStatus,
    startDate?: string,
    endDate?: string,
    credentials?: { site: string; username: string; password: string }
  ) => Promise<void>;
  deleteTrialRequest: (id: string) => Promise<void>;
  adminUpdateSubscription: (
    id: string,
    status: SubscriptionStatus,
    startDate?: string,
    endDate?: string
  ) => Promise<void>;
  adminCloseTicket: (id: string) => Promise<void>;
  adminSendMessage: (ticketId: string, content: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [clientAccesses, setClientAccesses] = useState<ClientAccess[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [trials, setTrials] = useState<TrialRequest[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [theme, setTheme] = useState<Theme>(() =>
    localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'
  );
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const currentUserId = currentUser?.id ?? null;

  const addToast = useCallback((message: string, type: ToastType): void => {
    const id = uid();
    setToasts((previous) => [...previous, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((previous) => previous.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string): void => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const clearOperationalData = useCallback((): void => {
    setClientAccesses([]);
    setSubscriptions([]);
    setTrials([]);
    setTickets([]);
    setMessages([]);
    setNotifs([]);
  }, []);

  const reloadPlans = useCallback(async (): Promise<void> => {
    setPlansLoading(true);
    setPlansError('');
    try {
      setPlans(await loadPlans());
    } catch (error) {
      setPlans([]);
      setPlansError(
        errorMessage(error, 'Não foi possível carregar os planos.')
      );
    } finally {
      setPlansLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadPlans();
  }, [reloadPlans]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const mapSupabaseUser = useCallback((authUser: SupabaseUser): User => {
    const metadata = authUser.user_metadata || {};
    const savedTheme = localStorage.getItem(THEME_KEY);
    return {
      id: authUser.id,
      name: typeof metadata.name === 'string' ? metadata.name : '',
      email: authUser.email || '',
      whatsapp: typeof metadata.whatsapp === 'string' ? metadata.whatsapp : '',
      role: 'client',
      theme:
        savedTheme === 'light' || savedTheme === 'dark'
          ? savedTheme
          : metadata.theme === 'light'
          ? 'light'
          : 'dark',
      createdAt: authUser.created_at || now(),
      updatedAt: authUser.updated_at || authUser.created_at || now(),
    };
  }, []);

  const loadUserProfile = useCallback(
    async (authUser: SupabaseUser): Promise<User> => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, name, whatsapp, role, theme, created_at, updated_at')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error || !profile) {
        if (error) console.error('Erro ao carregar perfil:', error);
        return mapSupabaseUser(authUser);
      }

      return {
        id: authUser.id,
        name: profile.name || '',
        email: authUser.email || '',
        whatsapp: profile.whatsapp || '',
        role: profile.role === 'admin' ? 'admin' : 'client',
        theme: profile.theme === 'light' ? 'light' : 'dark',
        createdAt: profile.created_at || authUser.created_at || now(),
        updatedAt:
          profile.updated_at ||
          authUser.updated_at ||
          authUser.created_at ||
          now(),
      };
    },
    [mapSupabaseUser]
  );

  const loadOperationalData = useCallback(
    async (operationalUser: User): Promise<void> => {
      setDataLoading(true);

      try {
        const isAdmin = operationalUser.role === 'admin';

        let clientAccessQuery = supabase
          .from('client_access')
          .select('*')
          .order('created_at', { ascending: false });

        let subscriptionsQuery = supabase
          .from('subscriptions')
          .select('*')
          .order('created_at', { ascending: false });

        let trialsQuery = supabase
          .from('trial_requests')
          .select('*')
          .order('created_at', { ascending: false });

        let ticketsQuery = supabase
          .from('tickets')
          .select('*')
          .order('created_at', { ascending: false });

        const notificationsQuery = supabase
          .from('notifications')
          .select('*')
          .eq('user_id', operationalUser.id)
          .order('created_at', { ascending: false });

        if (isAdmin) {
          clientAccessQuery = clientAccessQuery.eq(
            'admin_id',
            operationalUser.id
          );

          subscriptionsQuery = subscriptionsQuery.eq(
            'admin_id',
            operationalUser.id
          );

          trialsQuery = trialsQuery.eq('admin_id', operationalUser.id);

          ticketsQuery = ticketsQuery.eq('admin_id', operationalUser.id);
        } else {
          clientAccessQuery = clientAccessQuery.eq(
            'user_id',
            operationalUser.id
          );

          subscriptionsQuery = subscriptionsQuery.eq(
            'user_id',
            operationalUser.id
          );

          trialsQuery = trialsQuery.eq('user_id', operationalUser.id);

          ticketsQuery = ticketsQuery.eq('user_id', operationalUser.id);
        }

        const [
          accessResult,
          subscriptionsResult,
          trialsResult,
          ticketsResult,
          notificationsResult,
        ] = await Promise.all([
          clientAccessQuery,
          subscriptionsQuery,
          trialsQuery,
          ticketsQuery,
          notificationsQuery,
        ]);

        if (accessResult.error) {
          console.error('Erro ao carregar client_access:', accessResult.error);
          setClientAccesses([]);
        } else {
          setClientAccesses(
            (accessResult.data ?? [])
              .map((row) => mapClientAccess(row as Record<string, unknown>))
              .filter((item) => Boolean(item.id && item.userId))
          );
        }

        if (subscriptionsResult.error) {
          console.error(
            'Erro ao carregar subscriptions:',
            subscriptionsResult.error
          );
          setSubscriptions([]);
        } else {
          setSubscriptions(
            (subscriptionsResult.data ?? []).map((row) =>
              mapSubscription(row as Record<string, unknown>)
            )
          );
        }

        if (trialsResult.error) {
          console.error('Erro ao carregar trial_requests:', trialsResult.error);
          setTrials([]);
        } else {
          setTrials(
            (trialsResult.data ?? []).map((row) =>
              mapTrial(row as Record<string, unknown>)
            )
          );
        }

        if (ticketsResult.error) {
          console.error('Erro ao carregar tickets:', ticketsResult.error);
          setTickets([]);
          setMessages([]);
        } else {
          const mappedTickets = (ticketsResult.data ?? []).map((row) =>
            mapTicket(row as Record<string, unknown>)
          );

          setTickets(mappedTickets);

          const ticketIds = mappedTickets
            .map((ticket) => ticket.id)
            .filter(Boolean);

          if (ticketIds.length === 0) {
            setMessages([]);
          } else {
            const { data: messagesData, error: messagesError } = await supabase
              .from('ticket_messages')
              .select('*')
              .in('ticket_id', ticketIds)
              .order('created_at', {
                ascending: true,
              });

            if (messagesError) {
              console.error('Erro ao carregar ticket_messages:', messagesError);
              setMessages([]);
            } else {
              setMessages(
                (messagesData ?? []).map((row) =>
                  mapMessage(row as Record<string, unknown>)
                )
              );
            }
          }
        }

        if (notificationsResult.error) {
          console.error(
            'Erro ao carregar notifications:',
            notificationsResult.error
          );
          setNotifs([]);
        } else {
          setNotifs(
            (notificationsResult.data ?? []).map((row) =>
              mapNotification(row as Record<string, unknown>)
            )
          );
        }
      } catch (error) {
        console.error('Erro ao carregar dados operacionais:', error);
        clearOperationalData();
      } finally {
        setDataLoading(false);
      }
    },
    [clearOperationalData]
  );

  const reloadOperationalData = useCallback(async (): Promise<void> => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    if (!session?.user) {
      clearOperationalData();
      return;
    }
    const appUser = await loadUserProfile(session.user);
    await loadOperationalData(appUser);
  }, [clearOperationalData, loadOperationalData, loadUserProfile]);

  useEffect(() => {
    let active = true;

    const applySession = async (
      authUser: SupabaseUser | null
    ): Promise<void> => {
      if (!active) return;
      if (!authUser) {
        setCurrentUser(null);
        setUsers([]);
        clearOperationalData();
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      try {
        const appUser = await loadUserProfile(authUser);
        if (!active) return;
        setCurrentUser(appUser);
        setUsers([appUser]);
        setTheme(appUser.theme);
        await loadOperationalData(appUser);
      } catch (error) {
        console.error('Erro ao aplicar sessão:', error);
        if (active) {
          const fallback = mapSupabaseUser(authUser);
          setCurrentUser(fallback);
          setUsers([fallback]);
          setTheme(fallback.theme);
          clearOperationalData();
        }
      } finally {
        if (active) setAuthLoading(false);
      }
    };

    const restoreSession = async (): Promise<void> => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (!active) return;
        if (error) throw error;
        await applySession(session?.user ?? null);
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error);
        if (active) {
          setCurrentUser(null);
          setUsers([]);
          clearOperationalData();
          setAuthLoading(false);
        }
      }
    };

    void restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        window.setTimeout(() => void applySession(null), 0);
        return;
      }
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        window.setTimeout(() => void applySession(session?.user ?? null), 0);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [
    clearOperationalData,
    loadOperationalData,
    loadUserProfile,
    mapSupabaseUser,
  ]);

  const toggleTheme = async (): Promise<void> => {
    const previousTheme = theme;
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (!currentUser) return;
    const updatedUser = { ...currentUser, theme: nextTheme, updatedAt: now() };
    setCurrentUser(updatedUser);
    setUsers([updatedUser]);
    try {
      const { error } = await supabase.rpc('update_my_profile', {
        profile_name: currentUser.name,
        profile_whatsapp: currentUser.whatsapp,
        profile_theme: nextTheme,
      });
      if (error) throw error;
      await supabase.auth.updateUser({ data: { theme: nextTheme } });
    } catch {
      setTheme(previousTheme);
      setCurrentUser(currentUser);
      setUsers([currentUser]);
      throw new Error('Não foi possível salvar o tema.');
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password)
      throw new Error('Informe o e-mail e a senha.');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (error)
      throw new Error(
        error.message.includes('Invalid')
          ? 'E-mail ou senha incorretos.'
          : error.message
      );
    if (!data.user || !data.session)
      throw new Error('Não foi possível iniciar a sessão.');
    const appUser = await loadUserProfile(data.user);
    setCurrentUser(appUser);
    setUsers([appUser]);
    setTheme(appUser.theme);
    await loadOperationalData(appUser);
    addToast(
      `Bem-vindo(a), ${appUser.name.split(' ')[0] || 'cliente'}!`,
      'success'
    );
    return appUser;
  };

  const register = async (data: RegisterData): Promise<void> => {
    const { data: result, error } = await supabase.auth.signUp({
      email: data.email.trim().toLowerCase(),
      password: data.password,
      options: {
        data: {
          name: data.name.trim(),
          whatsapp: data.whatsapp.replace(/\D/g, ''),
          theme,
        },
        emailRedirectTo: `${window.location.origin}/cliente`,
      },
    });
    if (error) throw new Error(error.message);
    if (!result.user) throw new Error('Não foi possível criar o usuário.');
    if (!result.session) {
      addToast('Conta criada. Verifique seu e-mail.', 'success');
      return;
    }
    const appUser = await loadUserProfile(result.user);
    setCurrentUser(appUser);
    setUsers([appUser]);
    setTheme(appUser.theme);
    await loadOperationalData(appUser);
    addToast('Conta criada com sucesso!', 'success');
  };

  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error('Não foi possível sair da conta.');
    setCurrentUser(null);
    setUsers([]);
    clearOperationalData();
  };

  const myClientAccess = useMemo(() => {
    if (!currentUserId) return null;
    return (
      [...clientAccesses]
        .filter((item) => item.userId === currentUserId)
        .sort(
          (a, b) =>
            new Date(b.credentialsSentAt ?? b.createdAt).getTime() -
            new Date(a.credentialsSentAt ?? a.createdAt).getTime()
        )[0] ?? null
    );
  }, [clientAccesses, currentUserId]);

  const mySubscription = useMemo(
    () => subscriptions.find((item) => item.userId === currentUserId) ?? null,
    [subscriptions, currentUserId]
  );

  const myTrialRequest = useMemo(
    () => trials.find((item) => item.userId === currentUserId) ?? null,
    [trials, currentUserId]
  );

  const myTickets = useMemo(() => {
    if (!currentUser) return [];

    if (currentUser.role === 'admin') {
      return tickets.filter((ticket) => ticket.adminId === currentUser.id);
    }

    return tickets.filter((ticket) => ticket.userId === currentUser.id);
  }, [tickets, currentUser]);

  const userNotifs = useMemo(
    () => notifs.filter((item) => item.userId === currentUserId),
    [notifs, currentUserId]
  );

  const unreadCount = useMemo(
    () => userNotifs.filter((item) => !item.read).length,
    [userNotifs]
  );

  const saveClientAccess = async (
    userId: string,
    credentials: { site: string; username: string; password: string }
  ): Promise<void> => {
    if (!currentUser || currentUser.role !== 'admin')
      throw new Error('Ação permitida somente para administradores.');
    const { data, error } = await supabase
      .from('client_access')
      .upsert(
        {
          user_id: userId,
          admin_id: currentUser.id,
          access_site: credentials.site.trim(),
          access_username: credentials.username.trim(),
          access_password: credentials.password.trim(),
          credentials_sent_at: now(),
          credentials_sent_by: currentUser.id,
        },
        { onConflict: 'user_id' }
      )
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    const updated = mapClientAccess(data as Record<string, unknown>);
    setClientAccesses((previous) => [
      updated,
      ...previous.filter((item) => item.userId !== updated.userId),
    ]);
  };

  const requestPlan = async (planId: string): Promise<void> => {
    if (!currentUser) throw new Error('Usuário não autenticado.');
    const plan = findPlanById(plans, planId);
    if (!plan) throw new Error('Plano não encontrado ou inativo.');
    const existing = subscriptions.find(
      (item) => item.userId === currentUser.id
    );
    const query = existing
      ? supabase
          .from('subscriptions')
          .update({
            plan_id: planId,
            status: 'aguardando_pagamento',
            contracted_price: plan.currentPrice,
          })
          .eq('id', existing.id)
      : supabase.from('subscriptions').insert({
          user_id: currentUser.id,
          plan_id: planId,
          status: 'aguardando_pagamento',
          contracted_price: plan.currentPrice,
        });
    const { data, error } = await query.select('*').single();
    if (error) throw new Error(error.message);
    const updated = mapSubscription(data as Record<string, unknown>);
    setSubscriptions((previous) => [
      updated,
      ...previous.filter((item) => item.id !== updated.id),
    ]);
    addToast('Solicitação enviada! Aguarde a confirmação.', 'success');
  };

  const submitTrialRequest = async (
    form: TrialRequestFormData
  ): Promise<void> => {
    if (!currentUser) throw new Error('Usuário não autenticado.');
    const { data, error } = await supabase
      .from('trial_requests')
      .insert({
        user_id: currentUser.id,
        device: form.device,
        model: form.model ?? '',
        preferred_time: form.preferredTime ?? '',
        status: 'aguardando',
      })
      .select('*')
      .single();
    if (error)
      throw new Error(
        error.code === '23505'
          ? 'Você já solicitou um teste gratuito.'
          : error.message
      );
    setTrials((previous) => [
      mapTrial(data as Record<string, unknown>),
      ...previous,
    ]);
  };

  const createTicket = async (form: CreateTicketData): Promise<string> => {
    if (!currentUser) throw new Error('Usuário não autenticado.');
    const { data: ticketData, error } = await supabase
      .from('tickets')
      .insert({
        user_id: currentUser.id,
        category: form.category,
        subject: form.subject.trim(),
        status: 'aberto',
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    const ticket = mapTicket(ticketData as Record<string, unknown>);
    const { data: messageData, error: messageError } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticket.id,
        sender_id: currentUser.id,
        content: form.initialMessage.trim(),
      })
      .select('*')
      .single();
    if (messageError) {
      await loadOperationalData(currentUser);
      throw new Error(
        'O atendimento foi criado, mas a mensagem não foi enviada.'
      );
    }
    setTickets((previous) => [ticket, ...previous]);
    setMessages((previous) => [
      ...previous,
      mapMessage(messageData as Record<string, unknown>),
    ]);
    return ticket.id;
  };

  const getMessages = useCallback(
    (ticketId: string) => messages.filter((item) => item.ticketId === ticketId),
    [messages]
  );

  const sendMessage = async (
    ticketId: string,
    content: string
  ): Promise<void> => {
    if (!currentUser) throw new Error('Usuário não autenticado.');
    const { data, error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: currentUser.id,
        content: content.trim(),
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    setMessages((previous) => [
      ...previous,
      mapMessage(data as Record<string, unknown>),
    ]);
  };

  const markNotificationRead = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    if (error) throw new Error(error.message);
    setNotifs((previous) =>
      previous.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const markAllNotificationsRead = async (): Promise<void> => {
    if (!currentUser) throw new Error('Usuário não autenticado.');
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', currentUser.id)
      .eq('read', false);
    if (error) throw new Error(error.message);
    setNotifs((previous) =>
      previous.map((item) =>
        item.userId === currentUser.id ? { ...item, read: true } : item
      )
    );
  };

  const updateProfile = async (form: UpdateProfileData): Promise<void> => {
    if (!currentUser) throw new Error('Usuário não autenticado.');
    const name = form.name ?? currentUser.name;
    const whatsapp = form.whatsapp ?? currentUser.whatsapp;
    const nextTheme = form.theme ?? currentUser.theme;
    const { error } = await supabase.rpc('update_my_profile', {
      profile_name: name,
      profile_whatsapp: whatsapp,
      profile_theme: nextTheme,
    });
    if (error) throw new Error(error.message);
    const updated = {
      ...currentUser,
      name,
      whatsapp,
      theme: nextTheme,
      updatedAt: now(),
    };
    setCurrentUser(updated);
    setUsers([updated]);
    setTheme(nextTheme);
  };

  const changePassword = async (
    current: string,
    next: string
  ): Promise<void> => {
    if (!currentUser) throw new Error('Usuário não autenticado.');
    const { error: validation } = await supabase.auth.signInWithPassword({
      email: currentUser.email,
      password: current,
    });
    if (validation) throw new Error('Senha atual incorreta.');
    const { error } = await supabase.auth.updateUser({ password: next });
    if (error) throw new Error(error.message);
  };

  const adminUpdateTrial = async (
    id: string,
    status: TrialStatus,
    startDate?: string,
    endDate?: string,
    credentials?: { site: string; username: string; password: string }
  ): Promise<void> => {
    if (!currentUser || currentUser.role !== 'admin')
      throw new Error('Ação permitida somente para administradores.');
    const changes: Record<string, unknown> = {
      status,
      reviewed_by: currentUser.id,
    };
    if (startDate !== undefined) changes.start_date = startDate || null;
    if (endDate !== undefined) changes.end_date = endDate || null;
    if (credentials) {
      changes.access_site = credentials.site.trim();
      changes.access_username = credentials.username.trim();
      changes.access_password = credentials.password.trim();
      changes.credentials_sent_at = now();
      changes.credentials_sent_by = currentUser.id;
    }
    const { data, error } = await supabase
      .from('trial_requests')
      .update(changes)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    const updated = mapTrial(data as Record<string, unknown>);
    setTrials((previous) =>
      previous.map((item) => (item.id === updated.id ? updated : item))
    );
  };
  const deleteTrialRequest = async (id: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('Usuário não autenticado.');
    }

    if (currentUser.role !== 'admin') {
      throw new Error('Ação permitida somente para administradores.');
    }

    const normalizedId = id.trim();

    if (!normalizedId) {
      throw new Error('Identificador do teste inválido.');
    }

    const existingTrial = trials.find((item) => item.id === normalizedId);

    if (!existingTrial) {
      throw new Error('Solicitação de teste não encontrada no estado atual.');
    }

    const { data, error } = await supabase
      .from('trial_requests')
      .delete()
      .eq('id', normalizedId)
      .select('id');

    if (error) {
      console.error('Erro ao excluir solicitação de teste:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        trialId: normalizedId,
        adminId: currentUser.id,
      });

      throw new Error(
        error.message || 'Não foi possível excluir a solicitação de teste.'
      );
    }

    if (!data || data.length === 0) {
      throw new Error(
        'Nenhum registro foi excluído. Verifique a política RLS de DELETE para administradores.'
      );
    }

    setTrials((previous) =>
      previous.filter((item) => item.id !== normalizedId)
    );
  };

  const adminUpdateSubscription = async (
    id: string,
    status: SubscriptionStatus,
    startDate?: string,
    endDate?: string
  ): Promise<void> => {
    if (!currentUser || currentUser.role !== 'admin')
      throw new Error('Ação permitida somente para administradores.');
    const changes: Record<string, unknown> = { status };
    if (startDate !== undefined) changes.start_date = startDate || null;
    if (endDate !== undefined) changes.end_date = endDate || null;
    const { data, error } = await supabase
      .from('subscriptions')
      .update(changes)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    const updated = mapSubscription(data as Record<string, unknown>);
    setSubscriptions((previous) =>
      previous.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const adminCloseTicket = async (id: string): Promise<void> => {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Ação permitida somente para administradores.');
    }

    const { data, error } = await supabase
      .from('tickets')
      .update({
        status: 'encerrado',
        closed_at: now(),
      })
      .eq('id', id)
      .eq('admin_id', currentUser.id)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const updated = mapTicket(data as Record<string, unknown>);

    setTickets((previous) =>
      previous.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const adminSendMessage = async (
    ticketId: string,
    content: string
  ): Promise<void> => {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Ação permitida somente para administradores.');
    }

    const ticket = tickets.find((item) => item.id === ticketId);

    if (!ticket) {
      throw new Error('Chamado não encontrado.');
    }

    if (ticket.adminId !== currentUser.id) {
      throw new Error('Este chamado pertence a outro administrador.');
    }

    const normalizedContent = content.trim();

    if (!normalizedContent) {
      throw new Error('Digite uma mensagem.');
    }

    const { data: messageData, error: messageError } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: currentUser.id,
        content: normalizedContent,
      })
      .select('*')
      .single();

    if (messageError) {
      throw new Error(messageError.message);
    }

    const newMessage = mapMessage(messageData as Record<string, unknown>);

    setMessages((previous) => [...previous, newMessage]);

    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .update({
        status: 'aguardando_cliente',
      })
      .eq('id', ticketId)
      .eq('admin_id', currentUser.id)
      .select('*')
      .single();

    if (ticketError) {
      await loadOperationalData(currentUser);

      throw new Error('Mensagem enviada, mas o status não foi atualizado.');
    }

    const updatedTicket = mapTicket(ticketData as Record<string, unknown>);

    setTickets((previous) =>
      previous.map((item) =>
        item.id === updatedTicket.id ? updatedTicket : item
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        authLoading,
        dataLoading,
        theme,
        toggleTheme,
        login,
        register,
        logout,
        showLogin,
        showRegister,
        setShowLogin,
        setShowRegister,
        plans,
        plansLoading,
        plansError,
        reloadPlans,
        reloadOperationalData,
        myClientAccess,
        allClientAccesses: clientAccesses,
        saveClientAccess,
        mySubscription,
        requestPlan,
        myTrialRequest,
        submitTrialRequest,
        myTickets,
        createTicket,
        getMessages,
        sendMessage,
        notifications: userNotifs,
        markNotificationRead,
        markAllNotificationsRead,
        unreadCount,
        updateProfile,
        changePassword,
        toasts,
        addToast,
        removeToast,
        allUsers: users,
        allSubscriptions: subscriptions,
        allTrialRequests: trials,
        allTickets: tickets,
        adminUpdateTrial,
        deleteTrialRequest,
        adminUpdateSubscription,
        adminCloseTicket,
        adminSendMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
