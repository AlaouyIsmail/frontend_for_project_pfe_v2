import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import WorkIcon from '@mui/icons-material/Work';
import StarIcon from '@mui/icons-material/Star';
import SpeedIcon from '@mui/icons-material/Speed';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useApiData } from '../hooks/useRH';
import { meApi, projectsApi } from '../api/modules';
import { useAuth } from '../auth/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Project { id:number; name:string; status:string; estimated_hours:number; days_remaining:number; start_date:string; end_date:string; }
interface ProjectsResponse { stats:{total:number;active:number;planned:number;finished:number}; projects:Project[]; }

function chargeColor(v:number) { return v>=80?'#ef4444':v>=50?'#f59e0b':'#10b981'; }
function StatusChip({status}:{status:string}) {
  const m:Record<string,any>={active:{label:'Actif',color:'success'},planned:{label:'Planifié',color:'info'},finished:{label:'Terminé',color:'default'}};
  const s=m[status]??{label:status,color:'default'};
  return <Chip size="small" label={s.label} color={s.color} sx={{ height:18,fontSize:'0.65rem' }}/>;
}

export default function ResourceDashboard() {
  const { user } = useAuth();
  const { data:me, loading:meL, refetch:refetchMe } = useApiData<any>(() => meApi.get());
  const { data:projData, loading:projL, refetch:refetchProj } = useApiData<ProjectsResponse>(() => projectsApi.getAll());

  const profile = me?.profile;
  const projects: Project[] = projData?.projects ?? [];
  const pStats = projData?.stats ?? {total:0,active:0,planned:0,finished:0};
  const charge = Math.round(profile?.charge_affectee ?? 0);
  const col = chargeColor(charge);
  const avatarSrc = user?.profile_img ? `${API_BASE}/images/${user.profile_img}` : undefined;
  const initials = `${user?.first_name?.[0]??''}${user?.last_name?.[0]??''}`.toUpperCase();

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb:2.5 }} flexWrap="wrap" gap={2}>
        <Box>
          <Typography sx={{ fontSize:'1.2rem',fontWeight:800,letterSpacing:-0.4 }}>Mon Dashboard</Typography>
          <Typography sx={{ fontSize:'0.73rem',color:'text.secondary' }}>Bonjour {user?.first_name} — Vue de votre activité</Typography>
        </Box>
        <IconButton onClick={()=>{refetchMe();refetchProj();}} size="small" sx={{ border:'1px solid',borderColor:'divider',borderRadius:1.5 }}>
          <RefreshIcon sx={{ fontSize:16 }}/>
        </IconButton>
      </Stack>

      <Grid container spacing={1.5} sx={{ mb:2.5 }}>
        {/* Profile card */}
        <Grid size={{ xs:12, md:3 }}>
          <Card variant="outlined" sx={{ borderRadius:2.5, height:'100%' }}>
            <CardContent>
              <Box sx={{ textAlign:'center', py:1 }}>
                <Avatar src={avatarSrc} sx={{ width:64,height:64,mx:'auto',mb:1.5,bgcolor:col,fontSize:'1.4rem',fontWeight:700,border:'3px solid white',boxShadow:'0 4px 16px rgba(0,0,0,0.12)' }}>
                  {!avatarSrc&&initials}
                </Avatar>
                <Typography sx={{ fontSize:'0.95rem',fontWeight:800 }}>{user?.first_name} {user?.last_name}</Typography>
                <Typography sx={{ fontSize:'0.7rem',color:'text.secondary',mb:1 }}>{user?.email}</Typography>
                <Chip label="Ressource" size="small" sx={{ height:18,fontSize:'0.6rem',bgcolor:'#ede9fe',color:'#6366f1',fontWeight:700 }}/>

                <Box sx={{ mt:2 }}>
                  <Typography sx={{ fontSize:'0.65rem',color:'text.disabled',fontWeight:700,textTransform:'uppercase',letterSpacing:0.8,mb:0.5 }}>Charge actuelle</Typography>
                  <Box sx={{ position:'relative',width:72,height:72,mx:'auto' }}>
                    <svg width={72} height={72} style={{ transform:'rotate(-90deg)',position:'absolute' }}>
                      <circle cx={36} cy={36} r={30} fill="none" stroke="#e5e7eb" strokeWidth={5}/>
                      <circle cx={36} cy={36} r={30} fill="none" stroke={col} strokeWidth={5}
                        strokeDasharray={2*Math.PI*30} strokeDashoffset={2*Math.PI*30-(charge/100)*2*Math.PI*30}
                        strokeLinecap="round" style={{ transition:'stroke-dashoffset 1s ease' }}/>
                    </svg>
                    <Box sx={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center' }}>
                      <Typography sx={{ fontSize:'1rem',fontWeight:900,color:col }}>{charge}%</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats */}
        <Grid size={{ xs:12, md:9 }}>
          <Grid container spacing={1.5} sx={{ height:'100%' }}>
            {[
              { icon:<WorkIcon sx={{ fontSize:20,color:'#6366f1' }}/>, iconBg:'#ede9fe', title:'Projets Actifs', value:pStats.active, sub:`${pStats.planned} planifiés` },
              { icon:<StarIcon sx={{ fontSize:20,color:'#f59e0b' }}/>, iconBg:'#fef3c7', title:'Score Global', value:profile?.score??0, sub:'Performance' },
              { icon:<SpeedIcon sx={{ fontSize:20,color:'#10b981' }}/>, iconBg:'#d1fae5', title:'Compétence', value:`${Math.round(profile?.competence_moyenne??0)}%`, sub:'Niveau moyen' },
              { icon:<AccessTimeIcon sx={{ fontSize:20,color:'#0ea5e9' }}/>, iconBg:'#e0f2fe', title:'Dispo Hebdo', value:`${profile?.disponibilite_hebdo??0}h`, sub:'Disponibilité' },
            ].map((k,i) => (
              <Grid key={i} size={{ xs:12, sm:6 }}>
                <Card variant="outlined" sx={{ borderRadius:2.5,height:'100%',transition:'all 0.2s','&:hover':{ boxShadow:'0 6px 20px rgba(0,0,0,0.08)',transform:'translateY(-2px)' } }}>
                  <CardContent sx={{ p:'14px !important' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ width:40,height:40,borderRadius:2,bgcolor:k.iconBg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>{k.icon}</Box>
                      <Box>
                        <Typography sx={{ fontSize:'0.68rem',color:'text.secondary',fontWeight:600 }}>{k.title}</Typography>
                        {meL||projL ? <Skeleton width={40} height={26}/> : <Typography sx={{ fontSize:'1.3rem',fontWeight:900,lineHeight:1 }}>{k.value}</Typography>}
                        <Typography sx={{ fontSize:'0.65rem',color:'text.secondary' }}>{k.sub}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Projects */}
      <Card variant="outlined" sx={{ borderRadius:2.5 }}>
        <CardContent sx={{ pb:'0 !important' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb:1.5 }}>
            <Typography sx={{ fontSize:'0.85rem',fontWeight:700 }}>Mes Projets</Typography>
            <IconButton size="small"><MoreHorizIcon sx={{ fontSize:16 }}/></IconButton>
          </Stack>
          {projL ? <Skeleton variant="rectangular" height={120} sx={{ borderRadius:1 }}/> :
           <Table size="small">
             <TableHead><TableRow>{['Projet','Statut','Heures','Jours rest.','Période'].map((h,i)=>(
               <TableCell key={i} sx={{ fontSize:'0.62rem',fontWeight:700,color:'text.disabled',textTransform:'uppercase',borderBottom:'1px solid',borderColor:'divider' }}>{h}</TableCell>
             ))}</TableRow></TableHead>
             <TableBody>
               {projects.length===0&&<TableRow><TableCell colSpan={5} align="center" sx={{ py:4 }}><Typography sx={{ fontSize:'0.8rem',color:'text.secondary' }}>Aucun projet assigné</Typography></TableCell></TableRow>}
               {projects.map(p=>(
                 <TableRow key={p.id} hover>
                   <TableCell><Typography sx={{ fontSize:'0.8rem',fontWeight:600 }}>{p.name}</Typography></TableCell>
                   <TableCell><StatusChip status={p.status}/></TableCell>
                   <TableCell><Typography sx={{ fontSize:'0.78rem' }}>{p.estimated_hours}h</Typography></TableCell>
                   <TableCell><Typography sx={{ fontSize:'0.78rem',fontWeight:600,color:p.days_remaining<=3?'#ef4444':'text.primary' }}>{p.days_remaining}j</Typography></TableCell>
                   <TableCell><Typography sx={{ fontSize:'0.7rem',color:'text.secondary' }}>{p.start_date} → {p.end_date}</Typography></TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
          }
        </CardContent>
      </Card>
    </Box>
  );
}
