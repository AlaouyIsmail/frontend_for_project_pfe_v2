import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Divider, { dividerClasses } from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';
import { paperClasses } from '@mui/material/Paper';
import { listClasses } from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon, { listItemIconClasses } from '@mui/material/ListItemIcon';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import MenuButton from './MenuButton';
import { useAuth } from '../../auth/AuthContext';

const MenuItem = styled(MuiMenuItem)({ margin: '2px 0' });

export default function OptionsMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null|HTMLElement>(null);
  const { logout } = useAuth();
  const navigate   = useNavigate();

  return (
    <React.Fragment>
      <MenuButton onClick={e => setAnchorEl(e.currentTarget)} sx={{ borderColor:'transparent' }}>
        <MoreVertRoundedIcon />
      </MenuButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        onClick={() => setAnchorEl(null)}
        transformOrigin={{ horizontal:'right', vertical:'top' }}
        anchorOrigin={{ horizontal:'right', vertical:'bottom' }}
        sx={{ [`& .${listClasses.root}`]:{ padding:'4px' }, [`& .${paperClasses.root}`]:{ padding:0 }, [`& .${dividerClasses.root}`]:{ margin:'4px -4px' } }}>
        <MenuItem onClick={() => navigate('/checkout')}>
          <ListItemIcon><PaymentRoundedIcon fontSize="small"/></ListItemIcon>
          <ListItemText>Paiement / Vérification</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { logout(); navigate('/login', { replace:true }); }}
          sx={{ color:'error.main', [`& .${listItemIconClasses.root}`]:{ color:'error.main' } }}>
          <ListItemIcon><LogoutRoundedIcon fontSize="small"/></ListItemIcon>
          <ListItemText>Se déconnecter</ListItemText>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
