import { createBrowserRouter } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';

import ClientLayout from './pages/client/ClientLayout';
import Dashboard from './pages/client/Dashboard';
import MyPlans from './pages/client/MyPlans';
import FreeTrial from './pages/client/FreeTrial';
import Support from './pages/client/Support';
import Profile from './pages/client/Profile';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminClients from './pages/admin/AdminClients';
import AdminClientDetails from './pages/admin/AdminClientDetails';
import AdminTrials from './pages/admin/AdminTrials';
import AdminTrialDetails from './pages/admin/AdminTrialDetails';
import AdminTickets from './pages/admin/AdminTickets';
import AdminTicketDetails from './pages/admin/AdminTicketDetails';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: LandingPage,
  },
  {
    path: '/cliente',
    Component: ClientLayout,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: 'planos',
        Component: MyPlans,
      },
      {
        path: 'teste',
        Component: FreeTrial,
      },
      {
        path: 'suporte',
        Component: Support,
      },
      {
        path: 'perfil',
        Component: Profile,
      },
    ],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      {
        index: true,
        Component: AdminDashboard,
      },
      {
        path: 'clientes',
        Component: AdminClients,
      },
      {
        path: 'clientes/:userId',
        Component: AdminClientDetails,
      },
      {
        path: 'testes',
        Component: AdminTrials,
      },
      {
        path: 'testes/:trialId',
        Component: AdminTrialDetails,
      },
      {
        path: 'chamados',
        Component: AdminTickets,
      },
      {
        path: 'chamados/:ticketId',
        Component: AdminTicketDetails,
      },
    ],
  },
  {
    path: '*',
    Component: NotFound,
  },
]);
