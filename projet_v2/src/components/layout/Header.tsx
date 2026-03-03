import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import RefreshIcon from '@mui/icons-material/Refresh';
import ColorModeIconDropdown from '../../theme/ColorModeIconDropdown';
import type { RHSection } from '../../pages/Dashboard';

const SECTION_LABELS: Record<string, string> = {
  dashboard:  'Tableau de Bord RH',
  resources:  'Ressources',
  chefs:      'Chefs de Projet',
  projects:   'Projets',
  analytics:  'Analytiques',
  payment:    'Paiement',
};

interface Props { breadcrumb?: RHSection; onRefresh?: () => void; }

export default function Header({ breadcrumb = 'dashboard', onRefresh }: Props) {
  const [search, setSearch] = React.useState('');
  const label = SECTION_LABELS[breadcrumb] ?? 'Dashboard';

  return (
    <Box sx={{ display:{ xs:'none',md:'flex' }, width:'100%', alignItems:'center',
      justifyContent:'space-between', py:1.5, borderBottom:'1px solid', borderColor:'divider', mb:2 }}>
      {/* Breadcrumb */}
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Typography sx={{ fontSize:'0.78rem',color:'text.secondary' }}>Home</Typography>
        <NavigateNextRoundedIcon sx={{ fontSize:13,color:'text.disabled' }}/>
        <Typography sx={{ fontSize:'0.78rem',fontWeight:600,color:'text.primary' }}>{label}</Typography>
      </Stack>

      {/* Right */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <FormControl sx={{ width:180 }}>
          <OutlinedInput size="small" value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Rechercher..."
            sx={{ borderRadius:2,height:34,fontSize:'0.78rem','& .MuiOutlinedInput-notchedOutline':{ borderColor:'divider' } }}
            startAdornment={<InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize:15,color:'text.secondary' }}/></InputAdornment>}/>
        </FormControl>
        {onRefresh && (
          <Tooltip title="Actualiser">
            <IconButton size="small" onClick={onRefresh} sx={{ width:32,height:32,border:'1px solid',borderColor:'divider',borderRadius:1.5 }}>
              <RefreshIcon sx={{ fontSize:17 }}/>
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Notifications">
          <IconButton size="small" sx={{ width:32,height:32,border:'1px solid',borderColor:'divider',borderRadius:1.5 }}>
            <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge':{ fontSize:'0.5rem',minWidth:14,height:14,padding:0 } }}>
              <NotificationsRoundedIcon sx={{ fontSize:17 }}/>
            </Badge>
          </IconButton>
        </Tooltip>
        <Tooltip title="Paramètres">
          <IconButton size="small" sx={{ width:32,height:32,border:'1px solid',borderColor:'divider',borderRadius:1.5 }}>
            <SettingsRoundedIcon sx={{ fontSize:17 }}/>
          </IconButton>
        </Tooltip>
        <ColorModeIconDropdown size="small"/>
      </Stack>
    </Box>
  );
}
