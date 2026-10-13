export type UserRole = 'client' | 'admin';
export type Theme = 'dark' | 'light';

export type SubscriptionStatus =
  | 'sem_assinatura'
  | 'aguardando_pagamento'
  | 'ativo'
  | 'teste_ativo'
  | 'vencido'
  | 'cancelado'
  | 'suspenso';

export type TrialStatus =
  | 'disponivel'
  | 'aguardando'
  | 'aprovado'
  | 'ativo'
  | 'finalizado'
  | 'expirado'
  | 'indisponivel';

export type TicketStatus =
  | 'aberto'
  | 'aguardando_cliente'
  | 'aguardando_suporte'
  | 'encerrado';

export type TicketCategory =
  | 'instalacao'
  | 'acesso'
  | 'financeiro'
  | 'plano'
  | 'outros';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface User {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  role: UserRole;
  theme: Theme;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  originalPrice: number;
  currentPrice: number;
  discount: number;
  monthlyEquivalent: number;
  savings: number;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  isTrial: boolean;
  period: string;
  buttonLabel: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  contractedPrice: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrialRequest {
  id: string;
  userId: string;
  device: string;
  model: string;
  preferredTime: string;
  status: TrialStatus;
  startDate: string | null;
  endDate: string | null;
  reviewedBy: string | null;
  accessSite: string | null;
  accessUsername: string | null;
  accessPassword: string | null;
  credentialsSentAt: string | null;
  credentialsSentBy: string | null;
  createdAt: string;
}

export interface ClientAccess {
  id: string;
  userId: string;
  adminId: string | null;
  accessSite: string | null;
  accessUsername: string | null;
  accessPassword: string | null;
  credentialsSentAt: string | null;
  credentialsSentBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface Ticket {
  id: string;
  userId: string;
  adminId: string | null;
  category: TicketCategory;
  subject: string;
  status: TicketStatus;
  createdAt: string;
  closedAt: string | null;
}

export interface Message {
  id: string;
  ticketId: string;
  senderId: string;
  content: string;
  attachment: string | null;
  read: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: NotificationType;
  link: string | null;
  createdAt: string;
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface RegisterData {
  name: string;
  email: string;
  whatsapp: string;
  password: string;
}

export interface TrialRequestFormData {
  device: string;
  os: string;
  model: string;
  preferredTime: string;
  notes: string;
}

export interface CreateTicketData {
  category: TicketCategory;
  subject: string;
  initialMessage: string;
}

export interface UpdateProfileData {
  name?: string;
  whatsapp?: string;
  email?: string;
  theme?: Theme;
}
