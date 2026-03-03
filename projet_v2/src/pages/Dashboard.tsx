import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import RHDashboard       from './RHDashboard';
import ChefDashboard     from './ChefDashboard';
import ResourceDashboard from './ResourceDashboard';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export type RHSection = 'dashboard' | 'resources' | 'chefs' | 'projects' | 'analytics' | 'payment';

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  const getSection = (): RHSection => {
    const p = location.pathname;
    if (p.includes('/resources')) return 'resources';
    if (p.includes('/chefs'))     return 'chefs';
    if (p.includes('/projects'))  return 'projects';
    if (p.includes('/analytics')) return 'analytics';
    if (p.includes('/payment'))   return 'payment';
    return 'dashboard';
  };

  const section = getSection();

  if (isLoading) return (
    <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>
      <CircularProgress />
    </Box>
  );

  const render = () => {
    switch (user?.role) {
      case 'RH':        return <RHDashboard section={section} />;
      case 'CHEF':      return <ChefDashboard />;
      case 'RESSOURCE': return <ResourceDashboard />;
      default: return (
        <Box sx={{ p:4 }}>
          <Typography color="error">Rôle non reconnu : {user?.role ?? '—'}</Typography>
        </Box>
      );
    }
  };

  return <DashboardLayout section={section}>{render()}</DashboardLayout>;
}
