import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded';
import { useAuth } from '../../auth/AuthContext';

type NavItem = { text: string; icon: React.ReactNode; badge?: string };

const menuByRole: Record<string, NavItem[]> = {
  RH: [
    { text: 'Vue d\'ensemble',   icon: <DashboardRoundedIcon />   },
    { text: 'Équipes & Ressources', icon: <GroupsRoundedIcon />   },
    { text: 'Projets',           icon: <FolderRoundedIcon />       },
    { text: 'Chefs',             icon: <EngineeringRoundedIcon />  },
    { text: 'Statistiques',      icon: <AnalyticsRoundedIcon />    },
  ],
  CHEF: [
    { text: 'Vue d\'ensemble',   icon: <DashboardRoundedIcon />   },
    { text: 'Mes Projets',       icon: <FolderRoundedIcon />       },
    { text: 'Mon Équipe',        icon: <GroupsRoundedIcon />       },
    { text: 'Tâches',            icon: <AssignmentRoundedIcon />   },
  ],
  RESSOURCE: [
    { text: 'Mon Dashboard',     icon: <DashboardRoundedIcon />   },
    { text: 'Mon Profil',        icon: <PersonRoundedIcon />       },
    { text: 'Mes Projets',       icon: <FolderRoundedIcon />       },
    { text: 'Mon Chef',          icon: <PeopleRoundedIcon />       },
  ],
};

export default function MenuContent() {
  const { user } = useAuth();
  const role = user?.role ?? 'RH';
  const items = menuByRole[role] ?? menuByRole['RH'];

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {items.map((item, i) => (
          <ListItem key={i} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={i === 0}
              sx={{ borderRadius: 1, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
              {item.badge && (
                <Chip label={item.badge} size="small" color="primary" />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
