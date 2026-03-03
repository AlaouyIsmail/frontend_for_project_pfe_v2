import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import CloseIcon from '@mui/icons-material/Close';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ColorModeIconDropdown from '../../theme/ColorModeIconDropdown';
import { useAuth } from '../../auth/AuthContext';
import type { RHSection } from '../../pages/Dashboard';

const DRAWER_W = 226;
const Drawer = styled(MuiDrawer)({
  width: DRAWER_W, flexShrink: 0, boxSizing: 'border-box',
  [`& .${drawerClasses.paper}`]: { width: DRAWER_W, boxSizing: 'border-box', borderRight: 'none' },
});

type NavItem = { text: string; icon: React.ReactNode; path: string; section: string; };

const menuByRole: Record<string, NavItem[]> = {
  RH: [
    { text: 'Dashboard',       icon: <DashboardRoundedIcon fontSize="small"/>,   path: '/dashboard',            section: 'dashboard' },
    { text: 'Ressources',      icon: <GroupsRoundedIcon fontSize="small"/>,       path: '/dashboard/resources',  section: 'resources' },
    { text: 'Chefs',           icon: <EngineeringRoundedIcon fontSize="small"/>,  path: '/dashboard/chefs',      section: 'chefs'     },
    { text: 'Projets',         icon: <FolderRoundedIcon fontSize="small"/>,       path: '/dashboard/projects',   section: 'projects'  },
    { text: 'Analytiques',     icon: <AnalyticsRoundedIcon fontSize="small"/>,    path: '/dashboard/analytics',  section: 'analytics' },
    { text: 'Paiement',        icon: <PaymentRoundedIcon fontSize="small"/>,      path: '/checkout',             section: 'payment'   },
  ],
  CHEF: [
    { text: 'Dashboard',    icon: <DashboardRoundedIcon fontSize="small"/>,  path: '/dashboard',           section: 'dashboard' },
    { text: 'Mon Équipe',   icon: <GroupsRoundedIcon fontSize="small"/>,     path: '/dashboard/resources', section: 'resources' },
    { text: 'Mes Projets',  icon: <FolderRoundedIcon fontSize="small"/>,     path: '/dashboard/projects',  section: 'projects'  },
    { text: 'Tâches',       icon: <AssignmentRoundedIcon fontSize="small"/>, path: '/dashboard',           section: 'tasks'     },
    { text: 'Paiement',     icon: <PaymentRoundedIcon fontSize="small"/>,    path: '/checkout',            section: 'payment'   },
  ],
  RESSOURCE: [
    { text: 'Mon Dashboard', icon: <DashboardRoundedIcon fontSize="small"/>, path: '/dashboard',           section: 'dashboard' },
    { text: 'Mon Profil',    icon: <PersonRoundedIcon fontSize="small"/>,    path: '/dashboard/resources', section: 'resources' },
    { text: 'Mes Projets',   icon: <FolderRoundedIcon fontSize="small"/>,    path: '/dashboard/projects',  section: 'projects'  },
    { text: 'Mon Chef',      icon: <PeopleRoundedIcon fontSize="small"/>,    path: '/dashboard/chefs',     section: 'chefs'     },
    { text: 'Paiement',      icon: <PaymentRoundedIcon fontSize="small"/>,   path: '/checkout',            section: 'payment'   },
  ],
};

const ROLE_COLOR: Record<string, string> = { RH: '#6366f1', CHEF: '#0ea5e9', RESSOURCE: '#10b981' };
const ROLE_LABEL: Record<string, string> = { RH: 'Responsable RH', CHEF: 'Chef de Projet', RESSOURCE: 'Ressource' };

// ─── HR Profile Modal ──────────────────────────────────────────────────────
function HRProfileModal({ open, onClose, stats }: {
  open: boolean; onClose: () => void;
  stats?: { chefs:number; resources:number; projects:number };
}) {
  const { user } = useAuth();
  const apiBase   = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
  const avatarSrc = user?.profile_img ? `${apiBase}/images/${user.profile_img}` : undefined;
  const initials  = `${user?.first_name?.[0]??''}${user?.last_name?.[0]??''}`.toUpperCase();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
      <Box sx={{ height: 80, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', position: 'relative', flexShrink: 0 }}>
        <IconButton onClick={onClose} size="small"
          sx={{ position:'absolute', top:10, right:10, color:'white', bgcolor:'rgba(255,255,255,0.2)',
            '&:hover':{ bgcolor:'rgba(255,255,255,0.35)' } }}>
          <CloseIcon fontSize="small"/>
        </IconButton>
      </Box>
      <DialogContent sx={{ pt:0, pb:3, px:3 }}>
        <Box sx={{ display:'flex', gap:3, mt:-5, flexDirection:{ xs:'column', sm:'row' } }}>
          {/* Left */}
          <Box sx={{ flexShrink:0, minWidth:160, textAlign:'center' }}>
            <Avatar src={avatarSrc}
              sx={{ width:80, height:80, mx:'auto', mb:1.5, fontSize:'1.8rem', fontWeight:800,
                bgcolor:'#6366f1', border:'4px solid white', boxShadow:'0 4px 20px rgba(0,0,0,0.15)' }}>
              {!avatarSrc && initials}
            </Avatar>
            <Typography sx={{ fontSize:'1.05rem', fontWeight:800, lineHeight:1.2 }}>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Chip label="Responsable RH" size="small"
              sx={{ mt:0.5, mb:2, bgcolor:'#ede9fe', color:'#6366f1', fontWeight:700, fontSize:'0.65rem' }}/>
            <Stack spacing={1.2} sx={{ textAlign:'left' }}>
              {[
                { icon:<EmailRoundedIcon sx={{ fontSize:14,color:'text.secondary' }}/>, text: user?.email },
                { icon:<BadgeRoundedIcon sx={{ fontSize:14,color:'text.secondary' }}/>, text: `ID #${user?.id}` },
                { icon:<BusinessRoundedIcon sx={{ fontSize:14,color:'text.secondary' }}/>, text: user?.company_name ?? '—' },
              ].map((row,i)=>(
                <Stack key={i} direction="row" spacing={1} alignItems="center">
                  {row.icon}
                  <Typography sx={{ fontSize:'0.72rem',color:'text.secondary',wordBreak:'break-all' }}>{row.text}</Typography>
                </Stack>
              ))}
            </Stack>
            <Divider sx={{ my:2 }}/>
            <Stack spacing={1}>
              <Button variant="outlined" size="small" startIcon={<EditRoundedIcon sx={{ fontSize:13 }}/>} fullWidth
                sx={{ borderRadius:2, textTransform:'none', fontSize:'0.75rem' }}>Modifier le profil</Button>
              <Button variant="outlined" size="small" startIcon={<SettingsRoundedIcon sx={{ fontSize:13 }}/>} fullWidth
                sx={{ borderRadius:2, textTransform:'none', fontSize:'0.75rem' }}>Paramètres</Button>
            </Stack>
          </Box>
          {/* Right */}
          <Box sx={{ flexGrow:1, mt:{ xs:0, sm:2 } }}>
            <Typography sx={{ fontSize:'0.68rem',fontWeight:700,color:'text.disabled',textTransform:'uppercase',letterSpacing:1.2,mb:1.5 }}>
              Récapitulatif système
            </Typography>
            <Box sx={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1.2, mb:2 }}>
              {[
                { label:'Chefs',      value:stats?.chefs??'—',      color:'#6366f1', bg:'#ede9fe' },
                { label:'Ressources', value:stats?.resources??'—',  color:'#10b981', bg:'#d1fae5' },
                { label:'Projets',    value:stats?.projects??'—',   color:'#f59e0b', bg:'#fef3c7' },
              ].map((s,i)=>(
                <Box key={i} sx={{ p:1.5, borderRadius:2, bgcolor:s.bg, textAlign:'center', border:`1px solid ${s.color}25` }}>
                  <Typography sx={{ fontSize:'1.5rem',fontWeight:900,color:s.color,lineHeight:1 }}>{s.value}</Typography>
                  <Typography sx={{ fontSize:'0.63rem',color:'text.secondary',mt:0.3 }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ p:2, borderRadius:2, bgcolor:'action.hover', border:'1px solid', borderColor:'divider' }}>
              <Typography sx={{ fontSize:'0.78rem',fontWeight:700,mb:0.8 }}>🔐 Accès Complet</Typography>
              {['Créer / modifier / supprimer des Chefs','Gérer toutes les Ressources','Gérer tous les Projets','Accès aux statistiques globales'].map((p,i)=>(
                <Stack key={i} direction="row" spacing={0.8} alignItems="center" sx={{ mb:0.4 }}>
                  <Box sx={{ width:5,height:5,borderRadius:'50%',bgcolor:'#10b981',flexShrink:0 }}/>
                  <Typography sx={{ fontSize:'0.7rem',color:'text.secondary' }}>{p}</Typography>
                </Stack>
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main SideMenu ──────────────────────────────────────────────────────────
interface Props { activeSection?: string; }

export default function SideMenu({ activeSection = 'dashboard' }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [profileStats, setProfileStats] = React.useState<{ chefs:number; resources:number; projects:number }|undefined>();

  const role     = user?.role ?? 'RH';
  const items    = menuByRole[role] ?? menuByRole.RH;
  const color    = ROLE_COLOR[role];
  const apiBase  = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
  const avatarSrc = user?.profile_img ? `${apiBase}/images/${user.profile_img}` : undefined;
  const initials  = `${user?.first_name?.[0]??''}${user?.last_name?.[0]??''}`.toUpperCase()||'?';

  const handleOpenProfile = async () => {
    setProfileOpen(true);
    if (!profileStats) {
      try {
        const ax = await import('../../api/axios');
        const r  = await ax.default.get('/statistics');
        const d  = r.data;
        const totalProj = typeof d.projects==='object' ? Object.values(d.projects as Record<string,number>).reduce((a,b)=>a+b,0) : 0;
        setProfileStats({ chefs:d.chefs, resources:d.resources, projects:totalProj });
      } catch {}
    }
  };

  return (
    <>
      <Drawer variant="permanent"
        sx={{ display:{ xs:'none',md:'block' }, [`& .${drawerClasses.paper}`]: { bgcolor:'background.paper', boxShadow:'1px 0 0 0 rgba(0,0,0,0.06)', display:'flex', flexDirection:'column' } }}>

        {/* Brand */}
        <Box sx={{ px:2, pt:2, pb:1.5, display:'flex', alignItems:'center', gap:1.5, flexShrink:0 }}>
          <Box sx={{ width:34,height:34,borderRadius:1.5,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
            <Typography sx={{ color:'#fff',fontWeight:900,fontSize:'0.72rem' }}>AI</Typography>
          </Box>
          <Box sx={{ flexGrow:1,minWidth:0 }}>
            <Typography fontWeight={800} noWrap sx={{ fontSize:'0.84rem',lineHeight:1.2 }}>HR Manager</Typography>
            <Typography color="text.disabled" noWrap sx={{ fontSize:'0.62rem' }}>Système RH</Typography>
          </Box>
          <ColorModeIconDropdown size="small"/>
        </Box>
        <Divider/>

        {/* Clickable Profile Card */}
        <Tooltip title="Voir mon profil" placement="right">
          <Box onClick={handleOpenProfile}
            sx={{ mx:1.5, mt:1.5, mb:0.5, p:1.5, borderRadius:2, bgcolor:'action.hover', cursor:'pointer',
              transition:'all 0.18s ease',
              '&:hover':{ bgcolor:`${color}14`, boxShadow:`inset 0 0 0 1.5px ${color}35`, transform:'scale(1.01)' } }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar src={avatarSrc} sx={{ width:40,height:40,bgcolor:color,fontSize:'0.9rem',fontWeight:700,flexShrink:0,boxShadow:`0 0 0 2px ${color}40` }}>
                {!avatarSrc&&initials}
              </Avatar>
              <Box sx={{ minWidth:0,flexGrow:1 }}>
                <Typography sx={{ fontSize:'0.8rem',fontWeight:700,lineHeight:1.3 }} noWrap>
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize:'0.62rem',display:'block' }} noWrap>{user?.email}</Typography>
                <Box sx={{ mt:0.4,display:'inline-flex',px:0.8,py:0.1,borderRadius:10,bgcolor:`${color}20`,border:`1px solid ${color}40` }}>
                  <Typography sx={{ fontSize:'0.58rem',color,fontWeight:700,lineHeight:1.6 }}>{ROLE_LABEL[role]}</Typography>
                </Box>
              </Box>
            </Stack>
          </Box>
        </Tooltip>
        <Divider sx={{ mx:1.5,mb:1 }}/>

        <Typography sx={{ px:2.5,mb:0.5,fontSize:'0.58rem',fontWeight:700,color:'text.disabled',textTransform:'uppercase',letterSpacing:1.4,flexShrink:0 }}>
          Navigation
        </Typography>

        {/* Nav Items */}
        <Box sx={{ flexGrow:1,overflowY:'auto',px:1,pb:1 }}>
          <List dense disablePadding>
            {items.map((item,idx)=>{
              const active = item.section === activeSection;
              return (
                <ListItem key={idx} disablePadding sx={{ mb:0.25 }}>
                  <ListItemButton selected={active} onClick={()=>navigate(item.path)}
                    sx={{ borderRadius:1.5,py:0.7,px:1.5,minHeight:36,transition:'all 0.15s ease',
                      '&:hover':{ bgcolor:`${color}12`,transform:'translateX(3px)','& .nav-icon':{ color } },
                      '&.Mui-selected':{ bgcolor:`${color}16`,'& .nav-icon':{ color },'& .nav-text':{ color,fontWeight:700 } },
                      '&.Mui-selected:hover':{ bgcolor:`${color}22` },
                    }}>
                    <ListItemIcon className="nav-icon" sx={{ minWidth:28,color:active?color:'text.secondary',transition:'color 0.15s' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} classes={{ primary:'nav-text' }}
                      primaryTypographyProps={{ fontSize:'0.8rem',fontWeight:active?700:400,lineHeight:1.4 }}/>
                    {item.section==='payment'&&(
                      <Box sx={{ width:6,height:6,borderRadius:'50%',bgcolor:'#f59e0b',flexShrink:0 }}/>
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Divider sx={{ mx:1.5 }}/>
        <Box sx={{ px:1,py:1.5,flexShrink:0 }}>
          <ListItemButton onClick={()=>{ logout(); navigate('/login',{replace:true}); }}
            sx={{ borderRadius:1.5,py:0.7,px:1.5,color:'#ef4444',transition:'all 0.15s ease',
              '&:hover':{ bgcolor:'#fef2f2',transform:'translateX(3px)' } }}>
            <ListItemIcon sx={{ minWidth:28,color:'#ef4444' }}><LogoutRoundedIcon fontSize="small"/></ListItemIcon>
            <ListItemText primary="Se déconnecter" primaryTypographyProps={{ fontSize:'0.8rem',fontWeight:600 }}/>
          </ListItemButton>
        </Box>
      </Drawer>

      <HRProfileModal open={profileOpen} onClose={()=>setProfileOpen(false)} stats={profileStats}/>
    </>
  );
}
