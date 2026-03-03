import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormLabel from '@mui/material/FormLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import GroupsIcon from '@mui/icons-material/Groups';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useApiData } from '../hooks/useRH';
import { dashboardApi, projectsApi, ressourceApi, tasksApi } from '../api/modules';
import { useAuth } from '../auth/AuthContext';
import ProfileModal, { ProfileData } from '../components/shared/ProfileModal';
import { useToast } from '../components/shared/Toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Resource { id:number; first_name:string; last_name:string; email:string; charge_affectee:number; score:number; niveau_experience:number; disponibilite_hebdo:number; cout_horaire:number; competence_moyenne:number; profile_img:string|null; }
interface Project  { id:number; name:string; status:string; estimated_hours:number; days_remaining:number; start_date:string; end_date:string; }
interface ProjectsResponse { stats:{total:number;active:number;planned:number;finished:number}; projects:Project[]; }

function chargeColor(v:number) { return v>=80?'#ef4444':v>=50?'#f59e0b':'#10b981'; }

function StatusChip({status}:{status:string}) {
  const m:Record<string,any>={active:{label:'Actif',color:'success'},planned:{label:'Planifié',color:'info'},finished:{label:'Terminé',color:'default'}};
  const s=m[status]??{label:status,color:'default'};
  return <Chip size="small" label={s.label} color={s.color} sx={{ height:18, fontSize:'0.65rem' }}/>;
}

function KpiCard({icon,iconBg,title,value,sub,loading}:{icon:React.ReactNode;iconBg:string;title:string;value:any;sub:string;loading?:boolean}) {
  return (
    <Card variant="outlined" sx={{ borderRadius:2.5, height:'100%', transition:'all 0.2s', '&:hover':{ boxShadow:'0 6px 20px rgba(0,0,0,0.08)', transform:'translateY(-2px)' } }}>
      <CardContent sx={{ p:'14px !important' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width:42,height:42,borderRadius:2,bgcolor:iconBg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>{icon}</Box>
          <Box>
            <Typography sx={{ fontSize:'0.68rem',color:'text.secondary',fontWeight:600 }}>{title}</Typography>
            {loading ? <Skeleton width={40} height={28}/> : <Typography sx={{ fontSize:'1.4rem',fontWeight:900,letterSpacing:-0.5,lineHeight:1 }}>{value}</Typography>}
            <Typography sx={{ fontSize:'0.65rem',color:'text.secondary' }}>{sub}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ChefDashboard() {
  const { user } = useAuth();
  const { data:teamRaw, loading:teamL, refetch:refetchTeam } = useApiData<any>(() => dashboardApi.resources());
  const { data:projData, loading:projL, refetch:refetchProj } = useApiData<ProjectsResponse>(() => projectsApi.getAll());
  const { show:showToast, ToastEl } = useToast();

  const [profileModal, setProfileModal] = React.useState<ProfileData|null>(null);
  const [resDlg,setResDlg] = React.useState(false);
  const [resForm,setResForm] = React.useState({first_name:'',last_name:'',email:'',password:'',experience:'2',cost_hour:'50',disponibilite_hebdo:'40',competence_moyenne:'70'});
  const [taskDlg,setTaskDlg] = React.useState(false);
  const [taskForm,setTaskForm] = React.useState({title:'',description:'',project_id:'',assigned_to:'',priority:'medium',estimated_hours:'',due_date:''});
  const [busy,setBusy] = React.useState(false);

  // The dashboardApi returns either [{chef,resources}] or a flat array depending on role
  const rawData = teamRaw as any;
  const resources: Resource[] = Array.isArray(rawData)
    ? (rawData[0]?.resources ? rawData.flatMap((t:any) => t.resources) : rawData)
    : [];
  const projects: Project[] = projData?.projects ?? [];
  const pStats = projData?.stats ?? {total:0,active:0,planned:0,finished:0};

  const addRes = async () => {
    if(!resForm.first_name||!resForm.email||!resForm.password){showToast('Champs requis manquants','error');return;}
    setBusy(true);
    const fd=new FormData(); Object.entries(resForm).forEach(([k,v])=>fd.append(k,v));
    try { await ressourceApi.create(fd); showToast('Ressource ajoutée ✓'); setResDlg(false); setResForm({first_name:'',last_name:'',email:'',password:'',experience:'2',cost_hour:'50',disponibilite_hebdo:'40',competence_moyenne:'70'}); refetchTeam(); }
    catch(e:any){showToast(e?.response?.data?.error||'Erreur','error');}
    finally{setBusy(false);}
  };

  const createTask = async () => {
    if(!taskForm.title||!taskForm.project_id||!taskForm.assigned_to){showToast('Champs requis manquants','error');return;}
    setBusy(true);
    const fd=new FormData(); Object.entries(taskForm).forEach(([k,v])=>fd.append(k,v));
    try { await tasksApi.create(fd); showToast('Tâche créée ✓'); setTaskDlg(false); setTaskForm({title:'',description:'',project_id:'',assigned_to:'',priority:'medium',estimated_hours:'',due_date:''}); }
    catch(e:any){showToast(e?.response?.data?.error||'Erreur','error');}
    finally{setBusy(false);}
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb:2.5 }} flexWrap="wrap" gap={2}>
        <Box>
          <Typography sx={{ fontSize:'1.2rem', fontWeight:800, letterSpacing:-0.4 }}>Tableau de Bord Chef</Typography>
          <Typography sx={{ fontSize:'0.73rem', color:'text.secondary' }}>Bonjour, {user?.first_name} — Gestion équipe et projets</Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          <IconButton onClick={()=>{refetchTeam();refetchProj();}} size="small" sx={{ border:'1px solid', borderColor:'divider', borderRadius:1.5 }}>
            <RefreshIcon sx={{ fontSize:16 }}/>
          </IconButton>
          <Button variant="outlined" size="small" startIcon={<PersonAddIcon sx={{ fontSize:14 }}/>} onClick={()=>setResDlg(true)}
            sx={{ borderRadius:2, textTransform:'none', fontSize:'0.73rem', height:30 }}>+ Ressource</Button>
          <Button variant="contained" size="small" startIcon={<AssignmentIcon sx={{ fontSize:14 }}/>} onClick={()=>setTaskDlg(true)}
            sx={{ borderRadius:2, textTransform:'none', fontSize:'0.73rem', height:30, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow:'none' }}>
            + Tâche
          </Button>
        </Stack>
      </Stack>

      {/* KPIs */}
      <Grid container spacing={1.5} sx={{ mb:2.5 }}>
        <Grid size={{ xs:12, sm:3 }}>
          <KpiCard icon={<GroupsIcon sx={{ fontSize:20, color:'#6366f1' }}/>} iconBg="#ede9fe" title="Mon Équipe" value={resources.length} sub="Ressources actives" loading={teamL}/>
        </Grid>
        <Grid size={{ xs:12, sm:3 }}>
          <KpiCard icon={<FolderOpenIcon sx={{ fontSize:20, color:'#10b981' }}/>} iconBg="#d1fae5" title="Projets Actifs" value={pStats.active} sub={`${pStats.planned} planifiés`} loading={projL}/>
        </Grid>
        <Grid size={{ xs:12, sm:3 }}>
          <KpiCard icon={<CheckCircleIcon sx={{ fontSize:20, color:'#0ea5e9' }}/>} iconBg="#e0f2fe" title="Terminés" value={pStats.finished} sub="Ce trimestre" loading={projL}/>
        </Grid>
        <Grid size={{ xs:12, sm:3 }}>
          <KpiCard icon={<AssignmentIcon sx={{ fontSize:20, color:'#f59e0b' }}/>} iconBg="#fef3c7" title="Total Projets" value={pStats.total} sub="Tous statuts" loading={projL}/>
        </Grid>
      </Grid>

      {/* Team */}
      <Card variant="outlined" sx={{ borderRadius:2.5, mb:1.5 }}>
        <CardContent sx={{ pb:'0 !important' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb:1.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <GroupsIcon sx={{ fontSize:16, color:'#6366f1' }}/>
              <Typography sx={{ fontSize:'0.85rem', fontWeight:700 }}>Mon Équipe</Typography>
              <Box sx={{ width:20,height:20,borderRadius:'50%',bgcolor:'#6366f1',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Typography sx={{ fontSize:'0.6rem',color:'white',fontWeight:800 }}>{resources.length}</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={0.5}>
              <Button size="small" startIcon={<AddIcon sx={{ fontSize:12 }}/>} onClick={()=>setResDlg(true)} sx={{ textTransform:'none', fontSize:'0.7rem', height:26, borderRadius:1.5 }}>Ajouter</Button>
              <IconButton size="small"><MoreHorizIcon sx={{ fontSize:16 }}/></IconButton>
            </Stack>
          </Stack>
          {teamL ? <Skeleton variant="rectangular" height={120} sx={{ borderRadius:1, mb:2 }}/> :
           resources.length === 0 ? (
            <Box sx={{ py:4,textAlign:'center',mb:2 }}>
              <GroupsIcon sx={{ fontSize:40,color:'text.disabled',mb:1 }}/>
              <Typography sx={{ fontSize:'0.8rem',color:'text.secondary' }}>Aucune ressource</Typography>
            </Box>
           ) : (
            <Table size="small" sx={{ mb:0 }}>
              <TableHead>
                <TableRow>
                  {['Ressource','Score','Dispo','Compétence','Charge',''].map((h,i)=>(
                    <TableCell key={i} sx={{ fontSize:'0.62rem',fontWeight:700,color:'text.disabled',textTransform:'uppercase',borderBottom:'1px solid',borderColor:'divider' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {resources.map((r,i) => {
                  const charge = Math.round(r.charge_affectee??0);
                  const col    = chargeColor(charge);
                  const avSrc  = r.profile_img ? `${API_BASE}/images/${r.profile_img}` : undefined;
                  return (
                    <TableRow key={i} hover onClick={() => setProfileModal({ id:r.id,type:'ressource',first_name:r.first_name,last_name:r.last_name,email:r.email,profile_img:r.profile_img,charge_affectee:charge,score:r.score,disponibilite_hebdo:r.disponibilite_hebdo,cout_horaire:r.cout_horaire,niveau_experience:r.niveau_experience,competence_moyenne:Math.round(r.competence_moyenne??0) })} sx={{ cursor:'pointer' }}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar src={avSrc} sx={{ width:28,height:28,fontSize:'0.65rem',bgcolor:col,fontWeight:700 }}>{!avSrc&&`${r.first_name[0]}${r.last_name[0]}`}</Avatar>
                          <Box><Typography sx={{ fontSize:'0.78rem',fontWeight:600,lineHeight:1.2 }}>{r.first_name} {r.last_name}</Typography>
                            <Typography sx={{ fontSize:'0.6rem',color:'text.secondary' }}>{r.email}</Typography></Box>
                        </Stack>
                      </TableCell>
                      <TableCell><Typography sx={{ fontSize:'0.75rem',fontWeight:700,color:'#f59e0b' }}>{r.score??0}</Typography></TableCell>
                      <TableCell><Typography sx={{ fontSize:'0.75rem' }}>{r.disponibilite_hebdo??0}h</Typography></TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <LinearProgress variant="determinate" value={Math.min(r.competence_moyenne??0,100)} sx={{ width:40,height:4,borderRadius:2,bgcolor:'#f3f4f6','& .MuiLinearProgress-bar':{bgcolor:'#6366f1'} }}/>
                          <Typography sx={{ fontSize:'0.7rem',fontWeight:700 }}>{Math.round(r.competence_moyenne??0)}%</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <LinearProgress variant="determinate" value={Math.min(charge,100)} sx={{ width:40,height:4,borderRadius:2,bgcolor:'#f3f4f6','& .MuiLinearProgress-bar':{bgcolor:col} }}/>
                          <Typography sx={{ fontSize:'0.7rem',fontWeight:700,color:col }}>{charge}%</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={charge<80?'Actif':'Chargé'}
                          sx={{ height:18,fontSize:'0.6rem',fontWeight:700,bgcolor:charge<80?'#f0fdf4':'#fef2f2',color:charge<80?'#16a34a':'#dc2626',border:`1px solid ${charge<80?'#bbf7d0':'#fecaca'}` }}/>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
           )}
        </CardContent>
      </Card>

      {/* Projects */}
      <Card variant="outlined" sx={{ borderRadius:2.5 }}>
        <CardContent sx={{ pb:'0 !important' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb:1.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <FolderOpenIcon sx={{ fontSize:16,color:'#10b981' }}/>
              <Typography sx={{ fontSize:'0.85rem',fontWeight:700 }}>Mes Projets</Typography>
            </Stack>
            <IconButton size="small"><MoreHorizIcon sx={{ fontSize:16 }}/></IconButton>
          </Stack>
          {projL ? <Skeleton variant="rectangular" height={120} sx={{ borderRadius:1 }}/> :
           <Table size="small">
             <TableHead><TableRow>{['Projet','Statut','Heures','Jours rest.','Période'].map((h,i)=>(
               <TableCell key={i} sx={{ fontSize:'0.62rem',fontWeight:700,color:'text.disabled',textTransform:'uppercase',borderBottom:'1px solid',borderColor:'divider' }}>{h}</TableCell>
             ))}</TableRow></TableHead>
             <TableBody>
               {projects.length===0&&<TableRow><TableCell colSpan={5} align="center" sx={{ py:3 }}><Typography sx={{ fontSize:'0.8rem',color:'text.secondary' }}>Aucun projet</Typography></TableCell></TableRow>}
               {projects.map(p=>(
                 <TableRow key={p.id} hover>
                   <TableCell><Typography sx={{ fontSize:'0.8rem',fontWeight:600 }}>{p.name}</Typography></TableCell>
                   <TableCell><StatusChip status={p.status}/></TableCell>
                   <TableCell><Typography sx={{ fontSize:'0.78rem' }}>{p.estimated_hours}h</Typography></TableCell>
                   <TableCell><Typography sx={{ fontSize:'0.78rem',fontWeight:600,color:p.days_remaining<=3&&p.status==='active'?'#ef4444':'text.primary' }}>{p.days_remaining}j</Typography></TableCell>
                   <TableCell><Typography sx={{ fontSize:'0.7rem',color:'text.secondary' }}>{p.start_date} → {p.end_date}</Typography></TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
          }
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={resDlg} onClose={()=>setResDlg(false)} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:3 } }}>
        <DialogTitle sx={{ fontWeight:800 }}>Ajouter une Ressource</DialogTitle>
        <DialogContent sx={{ pt:'16px !important' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Prénom *</FormLabel><TextField fullWidth value={resForm.first_name} onChange={e=>setResForm(p=>({...p,first_name:e.target.value}))} placeholder="Marie"/></FormControl></Grid>
            <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Nom *</FormLabel><TextField fullWidth value={resForm.last_name} onChange={e=>setResForm(p=>({...p,last_name:e.target.value}))} placeholder="Martin"/></FormControl></Grid>
            <Grid size={{ xs:12 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Email *</FormLabel><TextField fullWidth type="email" value={resForm.email} onChange={e=>setResForm(p=>({...p,email:e.target.value}))} placeholder="ressource@email.com"/></FormControl></Grid>
            <Grid size={{ xs:12 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Mot de passe *</FormLabel><TextField fullWidth type="password" value={resForm.password} onChange={e=>setResForm(p=>({...p,password:e.target.value}))} placeholder="••••••"/></FormControl></Grid>
            <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Expérience (ans)</FormLabel><TextField fullWidth type="number" value={resForm.experience} onChange={e=>setResForm(p=>({...p,experience:e.target.value}))}/></FormControl></Grid>
            <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Coût/h (€)</FormLabel><TextField fullWidth type="number" value={resForm.cost_hour} onChange={e=>setResForm(p=>({...p,cost_hour:e.target.value}))}/></FormControl></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3,pb:2.5,gap:1 }}>
          <Button onClick={()=>setResDlg(false)} variant="outlined" sx={{ borderRadius:2,textTransform:'none' }}>Annuler</Button>
          <Button variant="contained" onClick={addRes} disabled={busy} sx={{ borderRadius:2,textTransform:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',boxShadow:'none' }}>{busy?'Ajout...':'Ajouter'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={taskDlg} onClose={()=>setTaskDlg(false)} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:3 } }}>
        <DialogTitle sx={{ fontWeight:800 }}>Nouvelle Tâche</DialogTitle>
        <DialogContent sx={{ pt:'16px !important' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs:12 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Titre *</FormLabel><TextField fullWidth value={taskForm.title} onChange={e=>setTaskForm(p=>({...p,title:e.target.value}))} placeholder="Titre de la tâche"/></FormControl></Grid>
            <Grid size={{ xs:12 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Description</FormLabel><TextField fullWidth multiline rows={2} value={taskForm.description} onChange={e=>setTaskForm(p=>({...p,description:e.target.value}))}/></FormControl></Grid>
            <Grid size={{ xs:6 }}><FormControl fullWidth><InputLabel>Projet *</InputLabel><Select value={taskForm.project_id} label="Projet *" onChange={e=>setTaskForm(p=>({...p,project_id:String(e.target.value)}))}>{projects.map(p=><MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}</Select></FormControl></Grid>
            <Grid size={{ xs:6 }}><FormControl fullWidth><InputLabel>Assigné à *</InputLabel><Select value={taskForm.assigned_to} label="Assigné à *" onChange={e=>setTaskForm(p=>({...p,assigned_to:String(e.target.value)}))}>{resources.map(r=><MenuItem key={r.id} value={r.id}>{r.first_name} {r.last_name}</MenuItem>)}</Select></FormControl></Grid>
            <Grid size={{ xs:6 }}><FormControl fullWidth><InputLabel>Priorité</InputLabel><Select value={taskForm.priority} label="Priorité" onChange={e=>setTaskForm(p=>({...p,priority:e.target.value}))}>{['low','medium','high','urgent'].map(x=><MenuItem key={x} value={x}>{x}</MenuItem>)}</Select></FormControl></Grid>
            <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Échéance</FormLabel><TextField fullWidth type="date" value={taskForm.due_date} onChange={e=>setTaskForm(p=>({...p,due_date:e.target.value}))} InputLabelProps={{ shrink:true }}/></FormControl></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3,pb:2.5,gap:1 }}>
          <Button onClick={()=>setTaskDlg(false)} variant="outlined" sx={{ borderRadius:2,textTransform:'none' }}>Annuler</Button>
          <Button variant="contained" onClick={createTask} disabled={busy} sx={{ borderRadius:2,textTransform:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',boxShadow:'none' }}>{busy?'Création...':'Créer'}</Button>
        </DialogActions>
      </Dialog>

      <ProfileModal open={!!profileModal} onClose={()=>setProfileModal(null)} data={profileModal}/>
      {ToastEl}
    </Box>
  );
}
