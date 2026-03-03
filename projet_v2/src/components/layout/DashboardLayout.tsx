import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import SideMenu from './SideMenu';
import AppNavbar from './AppNavbar';
import Header from './Header';
import type { RHSection } from '../../pages/Dashboard';

interface Props {
  children: React.ReactNode;
  section?: RHSection;
}

export default function DashboardLayout({ children, section = 'dashboard' }: Props) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <SideMenu activeSection={section} />
      <AppNavbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          mt: { xs: 'calc(var(--template-frame-height, 0px) + 64px)', md: 0 },
        }}
      >
        <Stack sx={{ mx: { xs: 2, md: 3 }, pb: 6, mt: { xs: 4, md: 0 } }}>
          <Header breadcrumb={section} />
          <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
            {children}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
