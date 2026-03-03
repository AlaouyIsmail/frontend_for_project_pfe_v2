import * as React from 'react';
import { useRef, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
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
import Skeleton from '@mui/material/Skeleton';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TableContainer from '@mui/material/TableContainer';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EngineeringIcon from '@mui/icons-material/Engineering';
import GroupsIcon from '@mui/icons-material/Groups';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import BarChartIcon from '@mui/icons-material/BarChart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Chart from 'chart.js/auto';
import { useChartTheme } from '../hooks/useChartTheme';
import { useApiData } from '../hooks/useRH';
import { statsApi, dashboardApi, chefApi, ressourceApi, projectsApi, usersApi } from '../api/modules';
import ProfileModal, { ProfileData } from '../components/shared/ProfileModal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import { useToast } from '../components/shared/Toast';
import type { RHSection } from './Dashboard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Statistics { chefs:number; resources:number; projects:Record<string,number>; average_charge:number; }
interface Chef { id:number; first_name:string; last_name:string; email:string; profile_img:string|null; charge_affectee:number; disponibilite_hebdo:number; score:number; }
interface Resource { id:number; first_name:string; last_name:string; email:string; profile_img:string|null; niveau_experience:number; disponibilite_hebdo:number; cout_horaire:number; charge_affectee:number; competence_moyenne:number; score:number; }
interface ChefTeamItem { chef:Chef; resources:Resource[]; }
interface Project { id:number; name:string; description:string; estimated_hours:number; chef_id:number; chef_first_name?:string; chef_last_name?:string; start_date:string; end_date:string; status:'active'|'planned'|'finished'; days_remaining:number; }
interface ProjectsResponse { stats:{total:number;active:number;planned:number;finished:number}; projects:Project[]; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function chargeColor(v:number) { return v>=80?'#ef4444':v>=50?'#f59e0b':'#10b981'; }
function scoreColor(v:number)  { return v>=75?'#10b981':v>=50?'#f59e0b':'#ef4444'; }

function statusLabel(s:string) {
  const m:Record<string,{ label:string; color:string; bg:string }> = {
    active:   { label:'Actif',     color:'#16a34a', bg:'#f0fdf4' },
    planned:  { label:'Planifié',  color:'#2563eb', bg:'#eff6ff' },
    finished: { label:'Terminé',   color:'#6b7280', bg:'#f9fafb' },
  };
  return m[s] ?? { label:s, color:'#6b7280', bg:'#f9fafb' };
}

function SparkBars({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  return (
    <Stack direction="row" alignItems="flex-end" spacing={0.3} sx={{ height: 24, flexShrink: 0 }}>
      {values.map((v, i) => (
        <Box key={i} sx={{ width: 4, borderRadius: 1, minHeight: 3, bgcolor: i === values.length-1 ? color : `${color}55`,
          height: `${Math.round((v/max)*100)}%`, transition: 'height 0.3s ease' }} />
      ))}
    </Stack>
  );
}

// ─── Circular gauge ────────────────────────────────────────────────────────
function CircleGauge({ value, size=44, color }: { value:number; size?:number; color:string }) {
  const r = (size-6)/2;
  const circ = 2*Math.PI*r;
  const off  = circ-(value/100)*circ;
  return (
    <Box sx={{ position:'relative',width:size,height:size,display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)',position:'absolute' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={4}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" style={{ transition:'stroke-dashoffset 1s ease' }}/>
      </svg>
      <Typography sx={{ fontSize:size*0.19,fontWeight:800,color,lineHeight:1,zIndex:1 }}>{value}%</Typography>
    </Box>
  );
}

// ─── Score mini bar ────────────────────────────────────────────────────────
function ScoreBar({ value, color }: { value:number; color:string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.8} sx={{ minWidth:80 }}>
      <Box sx={{ flexGrow:1 }}>
        <LinearProgress variant="determinate" value={Math.min(value,100)}
          sx={{ height:5,borderRadius:3,bgcolor:'#f3f4f6','& .MuiLinearProgress-bar':{ bgcolor:color,borderRadius:3 } }}/>
      </Box>
      <Typography sx={{ fontSize:'0.72rem',fontWeight:700,color,minWidth:28 }}>{Math.round(value)}</Typography>
    </Stack>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────
interface KpiProps { icon:React.ReactNode; iconBg:string; title:string; value:string|number; badge:string; badgePos:boolean; sparkColor:string; loading?:boolean; onClick?:()=>void; }
function KpiCard({ icon,iconBg,title,value,badge,badgePos,sparkColor,loading,onClick }:KpiProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Card variant="elevation" onClick={onClick}
      sx={{ 
        borderRadius:2.5,
        height:'100%',
        cursor:onClick?'pointer':'default',
        transition:'all 0.2s',
        bgcolor: isDark ? '#1e1e2e' : '#ffffff',
        '&:hover':onClick?{ 
          boxShadow:'0 8px 24px rgba(0,0,0,0.15)',
          transform:'translateY(-2px)',
          borderColor:sparkColor 
        }:{} 
      }}>
      <CardContent sx={{ p:'1px !important',height:'100%',display:'flex',flexDirection:'column',justifyContent:'center',justifyItems:"center" }}>
        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb:2 }}>
          <Box sx={{ width:40,height:40,borderRadius:2,bgcolor:iconBg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            {icon}
          </Box>
          <Box sx={{ flexGrow:1,minWidth:0 }}>
            <Typography sx={{ fontSize:'0.68rem',color:'text.secondary',fontWeight:600,lineHeight:1.2 }}>{title}</Typography>
            {loading ? <Skeleton width={40} height={26}/> :
              <Typography sx={{ fontSize:'1.5rem',fontWeight:900,letterSpacing:-0.5,lineHeight:1 }}>{value}</Typography>}
          </Box>
         </Stack>
          <SparkBars values={[1,3, 4, 2, 3]} color={sparkColor} />  
      </CardContent>
    </Card>
  );
}

// ─── Chef row ─────────────────────────────────────────────────────────────
function ChefRow({ team,onProfile,onEdit,onDelete }: {
  team:ChefTeamItem;
  onProfile:()=>void;
  onEdit:()=>void;
  onDelete:()=>void;
}) {
  const { chef } = team;
  const charge = Math.round(chef.charge_affectee??0);
  const col    = chargeColor(charge);
  const avSrc  = chef.profile_img ? `${API_BASE}/images/${chef.profile_img}` : undefined;
  return (
    <TableRow hover sx={{ cursor:'pointer' }}>
      <TableCell onClick={onProfile} sx={{ fontSize:'0.78rem' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar src={avSrc} sx={{ width:32,height:32,fontSize:'0.75rem',bgcolor:'#6366f1',fontWeight:700 }}>
            {!avSrc&&`${chef.first_name[0]}${chef.last_name[0]}`}
          </Avatar>
          <Box sx={{ minWidth:0 }}>
            <Typography sx={{ fontSize:'0.8rem',fontWeight:700,lineHeight:1.2 }}>{chef.first_name} {chef.last_name}</Typography>
            <Typography sx={{ fontSize:'0.62rem',color:'text.secondary',noWrap:true }}>{chef.email}</Typography>
          </Box>
        </Stack>
      </TableCell>
      <TableCell onClick={onProfile} sx={{ fontSize:'0.78rem',textAlign:'center' }}>{team.resources.length}</TableCell>
      <TableCell onClick={onProfile} sx={{ textAlign:'center' }}><CircleGauge value={charge} size={40} color={col}/></TableCell>
      <TableCell onClick={onProfile} sx={{ fontSize:'0.78rem' }}>
        <Chip size="small" label={charge<50?'Disponible':charge<80?'Occupé':'Surchargé'}
          sx={{ height:18,fontSize:'0.6rem',fontWeight:700,
            bgcolor:charge<50?'#f0fdf4':charge<80?'#fffbeb':'#fef2f2',
            color:col, border:`1px solid ${col}44` }}/>
      </TableCell>
      <TableCell align="right" sx={{ p:'8px !important' }}>
        <Stack direction="row" spacing={0.3} justifyContent="flex-end">
          <Tooltip title="Modifier"><IconButton size="small" onClick={onEdit} sx={{ p:'4px' }}><EditIcon sx={{ fontSize:15,color:'#6366f1' }}/></IconButton></Tooltip>
          <Tooltip title="Supprimer"><IconButton size="small" onClick={onDelete} sx={{ p:'4px' }}><DeleteIcon sx={{ fontSize:15,color:'#ef4444' }}/></IconButton></Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

// ─── Resource row ─────────────────────────────────────────────────────────
function ResRow({ res,chefName,onProfile,onEdit,onDelete }: {
  res:Resource; chefName:string;
  onProfile:()=>void; onEdit:()=>void; onDelete:()=>void;
}) {
  const score = Math.round(res.score??0);
  const sCol  = scoreColor(score);
  const avSrc = res.profile_img ? `${API_BASE}/images/${res.profile_img}` : undefined;
  return (
    <TableRow hover sx={{ cursor:'pointer' }}>
      <TableCell onClick={onProfile} sx={{ fontSize:'0.78rem' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar src={avSrc} sx={{ width:30,height:30,fontSize:'0.68rem',bgcolor:'#0ea5e9',fontWeight:700 }}>
            {!avSrc&&`${res.first_name[0]}${res.last_name[0]}`}
          </Avatar>
          <Box sx={{ minWidth:0 }}>
            <Typography sx={{ fontSize:'0.78rem',fontWeight:700,lineHeight:1.2 }}>{res.first_name} {res.last_name}</Typography>
            <Typography sx={{ fontSize:'0.6rem',color:'text.secondary',noWrap:true }}>{res.email}</Typography>
          </Box>
        </Stack>
      </TableCell>
      <TableCell onClick={onProfile} sx={{ fontSize:'0.75rem' }}>{chefName}</TableCell>
      <TableCell onClick={onProfile} sx={{ fontSize:'0.75rem',textAlign:'center' }}>{res.disponibilite_hebdo??0}h</TableCell>
      <TableCell onClick={onProfile} sx={{ fontSize:'0.75rem',textAlign:'center' }}>{res.niveau_experience??0}y</TableCell>
      <TableCell onClick={onProfile}><ScoreBar value={score} color={sCol}/></TableCell>
      <TableCell align="right" sx={{ p:'8px !important' }}>
        <Stack direction="row" spacing={0.3} justifyContent="flex-end">
          <Tooltip title="Modifier"><IconButton size="small" onClick={onEdit} sx={{ p:'4px' }}><EditIcon sx={{ fontSize:15,color:'#6366f1' }}/></IconButton></Tooltip>
          <Tooltip title="Supprimer"><IconButton size="small" onClick={onDelete} sx={{ p:'4px' }}><DeleteIcon sx={{ fontSize:15,color:'#ef4444' }}/></IconButton></Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

// ─── Charts ───────────────────────────────────────────────────────────────
function ChefChargeChart({ labels,values,loading }: { labels:string[];values:number[];loading?:boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<Chart|null>(null);
  const theme     = useChartTheme();
  useEffect(() => {
    if (!canvasRef.current||loading||!labels.length) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current,{
      type:'bar',
      data:{ labels, datasets:[{ label:'Charge (%)', data:values, backgroundColor:values.map(v=>v>=80?'#ef4444':v>=50?'#f59e0b':'#6366f1'), borderRadius:6, borderSkipped:false }] },
      options:{ ...theme.chartOptions as any,
        plugins:{ ...theme.chartOptions.plugins, legend:{ display:false } },
    scales:{
  x:{
    ...theme.chartOptions.scales?.x,
    grid:{ display:false }
  },
  y:{
    ...theme.chartOptions.scales?.y,
    max:100,
    ticks:{
      callback:(v:any)=>`${v}%`
    },
    grid:{ display:true }
  }
}
      } as any,
    });
    return ()=>{ chartRef.current?.destroy(); };
  },[labels,values,loading,theme]);
  if (loading) return <Skeleton variant="rectangular" height={200} sx={{ borderRadius:1 }}/>;
  if (!labels.length) return (
    <Box sx={{ height:200,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:1 }}>
      <BarChartIcon sx={{ fontSize:40,color:'text.disabled' }}/>
      <Typography sx={{ fontSize:'0.8rem',color:'text.secondary' }}>Aucune donnée</Typography>
    </Box>
  );
  return <Box sx={{ height:200,width:'100%',position:'relative' }}><canvas ref={canvasRef}/></Box>;
}

function ProjectDonut({ active,planned,finished,loading }: { active:number;planned:number;finished:number;loading?:boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<Chart|null>(null);
  const theme     = useChartTheme();
  useEffect(() => {
    if (!canvasRef.current||loading) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current,{
      type:'doughnut',
      data:{ labels:['Actifs','Planifiés','Terminés'], datasets:[{ data:[active,planned,finished], backgroundColor:['#10b981','#6366f1','#94a3b8'], borderWidth:3, borderColor:theme.tooltip.backgroundColor }] },
      options:{ responsive:true,maintainAspectRatio:false,cutout:'68%',
        plugins:{ legend:{ position:'bottom', labels:{ color:theme.tooltip.bodyColor,padding:12,font:{size:11},usePointStyle:true,pointStyleWidth:8 } },
          tooltip:{ backgroundColor:theme.tooltip.backgroundColor,titleColor:theme.tooltip.titleColor,bodyColor:theme.tooltip.bodyColor } },
      },
    });
    return ()=>{ chartRef.current?.destroy(); };
  },[active,planned,finished,loading,theme]);
  if (loading) return <Skeleton variant="circular" width={180} height={180} sx={{ mx:'auto' }}/>;
  if (active+planned+finished===0) return (
    <Box sx={{ height:180,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:1 }}>
      <FolderOpenIcon sx={{ fontSize:36,color:'text.disabled' }}/>
      <Typography sx={{ fontSize:'0.78rem',color:'text.secondary' }}>Aucun projet</Typography>
    </Box>
  );
  return <Box sx={{ height:200,width:'100%',position:'relative' }}><canvas ref={canvasRef}/></Box>;
}

// ─── Image Upload ─────────────────────────────────────────────────────────
function ImageUpload({ value,onChange }: { value:File|null;onChange:(f:File|null)=>void }) {
  const [preview,setPreview] = React.useState<string|null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const handleFile = (e:React.ChangeEvent<HTMLInputElement>) => {
    const f=e.target.files?.[0]??null; onChange(f);
    if(f){ const r=new FileReader(); r.onloadend=()=>setPreview(r.result as string); r.readAsDataURL(f); } else setPreview(null);
  };
  return (
    <Box>
      <FormLabel sx={{ display:'block',mb:1,fontSize:'0.85rem',fontWeight:500 }}>Photo de profil</FormLabel>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ flexWrap:'wrap' }}>
        <Avatar src={preview??undefined} sx={{ width:56,height:56,bgcolor:'action.hover',border:'2px dashed',borderColor:'divider',flexShrink:0 }}>
          {!preview&&<PhotoCameraIcon sx={{ color:'text.disabled',fontSize:20 }}/>}
        </Avatar>
        <Box sx={{ flex:1,minWidth:0 }}>
          <Button variant="outlined" size="small" onClick={()=>ref.current?.click()} startIcon={<PhotoCameraIcon/>} sx={{ mb:0.5,textTransform:'none',fontSize:'0.75rem' }}>
            {preview?'Changer':'Ajouter photo'}</Button>
          {preview&&<Button size="small" color="error" onClick={()=>{ onChange(null);setPreview(null); }} sx={{ ml:1,textTransform:'none',fontSize:'0.75rem' }}>Retirer</Button>}
          <Typography sx={{ fontSize:'0.7rem',color:'text.secondary',mt:0.5 }}>JPG, PNG · max 3MB</Typography>
        </Box>
        <input ref={ref} type="file" hidden accept=".jpg,.jpeg,.png" onChange={handleFile}/>
      </Stack>
    </Box>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────
function EmptyState({ icon,title,subtitle,actionLabel,onAction }:{ icon:React.ReactNode;title:string;subtitle?:string;actionLabel?:string;onAction?:()=>void }) {
  return (
    <Box sx={{ py:5,textAlign:'center' }}>
      <Box sx={{ mb:1.5,opacity:0.35 }}>{icon}</Box>
      <Typography sx={{ fontSize:'0.9rem',fontWeight:700 }}>{title}</Typography>
      {subtitle&&<Typography sx={{ fontSize:'0.75rem',color:'text.secondary',mt:0.5 }}>{subtitle}</Typography>}
      {actionLabel&&onAction&&<Button size="small" startIcon={<AddIcon/>} onClick={onAction} variant="outlined" sx={{ mt:2,borderRadius:2,textTransform:'none',fontSize:'0.75rem' }}>{actionLabel}</Button>}
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
interface Props { section: RHSection; }

export default function RHDashboard({ section }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const { data:stats,    loading:statsL,  refetch:refetchStats } = useApiData<Statistics>(()=>statsApi.get());
  const { data:teams,    loading:teamsL,  refetch:refetchTeams } = useApiData<ChefTeamItem[]>(()=>dashboardApi.resources());
  const { data:projData, loading:projL,   refetch:refetchProj  } = useApiData<ProjectsResponse>(()=>projectsApi.getAll());
  const { show:showToast, ToastEl } = useToast();

  const refetchAll = ()=>{ refetchStats(); refetchTeams(); refetchProj(); };

  const [profileModal, setProfileModal] = React.useState<ProfileData|null>(null);
  const [delConfirm, setDelConfirm] = React.useState({ open:false,id:0,name:'',type:'project' as 'project'|'user',loading:false });
  const [viewProj, setViewProj] = React.useState<Project|null>(null);
  const [editChef, setEditChef] = React.useState<Chef|null>(null);
  const [editRes,  setEditRes]  = React.useState<Resource|null>(null);
  const [editProj, setEditProj] = React.useState<Project|null>(null);

  const [chefDlg,  setChefDlg]  = React.useState(false);
  const [chefImg,  setChefImg]  = React.useState<File|null>(null);
  const [chefForm, setChefForm] = React.useState({ first_name:'',last_name:'',email:'',password:'',disponibilite_hebdo:'40' });

  const [resDlg,  setResDlg]  = React.useState(false);
  const [resImg,  setResImg]  = React.useState<File|null>(null);
  const [resForm, setResForm] = React.useState({ first_name:'',last_name:'',email:'',password:'',experience:'2',cost_hour:'50',disponibilite_hebdo:'40',competence_moyenne:'70',chef_id:'' });

  const [projDlg,  setProjDlg]  = React.useState(false);
  const [projForm, setProjForm] = React.useState({ name:'',description:'',estimated_hours:'',chef_id:'',start_date:'',end_date:'' });

  const [busy, setBusy] = React.useState(false);

  const chefList  = teams??[];
  const projList  = projData?.projects??[];
  const projStats = projData?.stats;
  const allRes    = chefList.flatMap(t=>t.resources);

  const availableChefs  = chefList.filter(t=>(t.chef.charge_affectee??0)<50);
  const overloadedChefs = chefList.filter(t=>(t.chef.charge_affectee??0)>=80);

  const chefChartLabels  = chefList.map(t=>`${t.chef.first_name} ${t.chef.last_name[0]}.`);
  const chefChartValues  = chefList.map(t=>Math.round(t.chef.charge_affectee??0));

  // ── Section: Dashboard (default) ─────────────────────────────────────────
  const renderDashboard = () => (
    <>
      <Box sx={{ mb:3}} >
        <Stack direction={{ xs:'column',sm:'row' }} justifyContent="space-between" alignItems={{ xs:'flex-start',sm:'center' }} spacing={2} sx={{ mb:2 }}>
          <Box>
            <Typography sx={{ fontSize:'1.4rem',fontWeight:800,letterSpacing:-0.5 }}>Tableau de Bord RH</Typography>
            <Typography sx={{ fontSize:'0.8rem',color:'text.secondary',mt:0.5 }}>Vue d'ensemble des équipes et projets</Typography>
          </Box>
          <Stack direction={{ xs:'column',sm:'row' }} spacing={1} sx={{ width:{ xs:'100%',sm:'auto' } }}>
            <Button variant="outlined" size="small" startIcon={<RefreshIcon sx={{ fontSize:14 }}/>} onClick={refetchAll} sx={{ borderRadius:2,textTransform:'none',fontSize:'0.75rem',width:{ xs:'100%',sm:'auto' } }}>Actualiser</Button>
            <Button variant="outlined" size="small" startIcon={<PersonAddIcon sx={{ fontSize:14 }}/>} onClick={()=>setChefDlg(true)} sx={{ borderRadius:2,textTransform:'none',fontSize:'0.75rem',width:{ xs:'100%',sm:'auto' } }}>Chef</Button>
            <Button variant="outlined" size="small" startIcon={<PersonAddIcon sx={{ fontSize:14 }}/>} onClick={()=>setResDlg(true)} sx={{ borderRadius:2,textTransform:'none',fontSize:'0.75rem',width:{ xs:'100%',sm:'auto' } }}>Ressource</Button>
            <Button variant="contained" size="small" startIcon={<AddIcon sx={{ fontSize:14 }}/>} onClick={()=>setProjDlg(true)} sx={{ borderRadius:2,textTransform:'none',fontSize:'0.75rem',width:{ xs:'100%',sm:'auto' },background:'linear-gradient(135deg,#6366f1,#8b5cf6)',boxShadow:'none' }}>Projet</Button>
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={2} sx={{ mb:3 }}>
        {[
          { icon:<EngineeringIcon sx={{ fontSize:20,color:'#6366f1' }}/>, iconBg:'#ede9fe', title:'Chefs', value:statsL?'—':(stats?.chefs??0), badge:'+5%', badgePos:true, sparkColor:'#6366f1', loading:statsL },
          { icon:<GroupsIcon sx={{ fontSize:20,color:'#0ea5e9' }}/>, iconBg:'#e0f2fe', title:'Ressources', value:statsL?'—':(stats?.resources??0), badge:'+12%', badgePos:true, sparkColor:'#0ea5e9', loading:statsL },
          { icon:<FolderOpenIcon sx={{ fontSize:20,color:'#f59e0b' }}/>, iconBg:'#fef3c7', title:'Projets', value:projL?'—':(projStats?.total??0), badge:'+2', badgePos:true, sparkColor:'#f59e0b', loading:projL },
          { icon:<CheckCircleIcon sx={{ fontSize:20,color:'#10b981' }}/>, iconBg:'#d1fae5', title:'Actifs', value:projL?'—':(projStats?.active??0), badge:'+1', badgePos:true, sparkColor:'#10b981', loading:projL },
          { icon:<ScheduleIcon sx={{ fontSize:20,color:'#8b5cf6' }}/>, iconBg:'#ede9fe', title:'Planifiés', value:projL?'—':(projStats?.planned??0), badge:'+5%', badgePos:true, sparkColor:'#8b5cf6', loading:projL },
          { icon:<BarChartIcon sx={{ fontSize:20,color:'#ec4899' }}/>, iconBg:'#fce7f3', title:'Disponibilité', value:statsL?'—':`${Math.round(100-(stats?.average_charge??0))}%`, badge:'+3%', badgePos:true, sparkColor:'#ec4899', loading:statsL },
        ].map((k,i)=>(
          <Grid key={i} size={{ xs:12,sm:6,md:4,lg:2 }}>
            <KpiCard icon={k.icon} iconBg={k.iconBg} title={k.title} value={k.value} badge={k.badge} badgePos={k.badgePos} sparkColor={k.sparkColor} loading={k.loading}/>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mb:3 }}>
        <Grid size={{ xs:12,lg:8 }}>
          <Card variant="outlined" sx={{ borderRadius:2.5,height:'100%',bgcolor: isDark ? '#1e1e2e' : '#ffffff' }}>
            <CardContent sx={{ pb:'0 !important' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb:2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <EngineeringIcon sx={{ fontSize:18,color:'#6366f1' }}/>
                  <Typography sx={{ fontSize:'0.9rem',fontWeight:700 }}>Chefs de Projet</Typography>
                  <Box sx={{ width:22,height:22,borderRadius:'50%',bgcolor:'#6366f1',display:'flex',alignItems:'center',justifyContent:'center' }}>
                    <Typography sx={{ fontSize:'0.65rem',color:'white',fontWeight:800 }}>{chefList.length}</Typography>
                  </Box>
                </Stack>
                <Button size="small" startIcon={<AddIcon sx={{ fontSize:12 }}/>} onClick={()=>setChefDlg(true)} sx={{ textTransform:'none',fontSize:'0.75rem',height:28,borderRadius:1.5 }}>Ajouter</Button>
              </Stack>
              {teamsL ? (
                <Stack spacing={1} sx={{ pb:2 }}>{[1,2,3].map(i=><Skeleton key={i} height={52} sx={{ borderRadius:2 }}/>)}</Stack>
              ) : chefList.length===0 ? (
                <EmptyState icon={<EngineeringIcon sx={{ fontSize:48 }}/>} title="Aucun chef" subtitle="Commencez par ajouter un chef" actionLabel="Ajouter" onAction={()=>setChefDlg(true)}/>
              ) : (
                <TableContainer sx={{ maxHeight:400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead><TableRow>
                      {['Chef','Équipe','Charge','Statut',''].map((h,i)=>(
                        <TableCell key={i} sx={{ fontSize:'0.65rem',fontWeight:700,color:'text.disabled',textTransform:'uppercase',borderBottom:'1px solid',borderColor:'divider',py:1 }}>{h}</TableCell>
                      ))}
                    </TableRow></TableHead>
                    <TableBody>
                      {chefList.map((team,i)=>(
                        <ChefRow key={i} team={team}
                          onProfile={()=>setProfileModal({ id:team.chef.id,type:'chef',first_name:team.chef.first_name,last_name:team.chef.last_name,email:team.chef.email,profile_img:team.chef.profile_img,charge_affectee:Math.round(team.chef.charge_affectee??0),score:team.chef.score,disponibilite_hebdo:team.chef.disponibilite_hebdo,resources:team.resources.map(r=>({ id:r.id,first_name:r.first_name,last_name:r.last_name,charge_affectee:Math.round(r.charge_affectee??0) })) })}
                          onEdit={()=>setEditChef(team.chef)}
                          onDelete={()=>setDelConfirm({ open:true,id:team.chef.id,name:`${team.chef.first_name} ${team.chef.last_name}`,type:'user',loading:false })}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs:12,lg:4 }}>
          <Grid container spacing={2} sx={{ height:'100%' }}>
            <Grid size={{ xs:12 }}>
              <Card variant="outlined" sx={{ borderRadius:2.5,height:'100%',bgcolor: isDark ? '#1e1e2e' : '#ffffff' }}>
                <CardContent>
                  <Typography sx={{ fontSize:'0.9rem',fontWeight:700,mb:2 }}>Distribution Projets</Typography>
                  <ProjectDonut active={projStats?.active??0} planned={projStats?.planned??0} finished={projStats?.finished??0} loading={projL}/>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs:12 }}>
              <Card variant="outlined" sx={{ borderRadius:2.5,height:'100%',bgcolor: isDark ? '#1e1e2e' : '#ffffff' }}>
                <CardContent sx={{ pb:'12px !important' }}>
                  <Typography sx={{ fontSize:'0.9rem',fontWeight:700,mb:1.5 }}>
                    Disponibles <Typography component="span" sx={{ fontSize:'0.7rem',color:'#10b981',fontWeight:600 }}>&lt; 50%</Typography>
                  </Typography>
                  {availableChefs.length===0 ? (
                    <Typography sx={{ fontSize:'0.8rem',color:'text.secondary' }}>Aucun chef disponible</Typography>
                  ) : (
                    <Stack spacing={0.8} sx={{ maxHeight:200,overflowY:'auto' }}>
                      {availableChefs.slice(0,4).map((t,i)=>{
                        const charge = Math.round(t.chef.charge_affectee??0);
                        const avSrc  = t.chef.profile_img?`${API_BASE}/images/${t.chef.profile_img}`:undefined;
                        return (
                          <Stack key={i} direction="row" alignItems="center" spacing={1} onClick={()=>setProfileModal({ id:t.chef.id,type:'chef',first_name:t.chef.first_name,last_name:t.chef.last_name,email:t.chef.email,profile_img:t.chef.profile_img,charge_affectee:charge,score:t.chef.score })}
                            sx={{ py:0.8,px:1,borderRadius:1.5,cursor:'pointer','&:hover':{ bgcolor:'action.hover' } }}>
                            <Avatar src={avSrc} sx={{ width:26,height:26,fontSize:'0.6rem',bgcolor:'#10b981',fontWeight:700,flexShrink:0 }}>
                              {!avSrc&&`${t.chef.first_name[0]}${t.chef.last_name[0]}`}
                            </Avatar>
                            <Typography sx={{ fontSize:'0.8rem',fontWeight:600,flexGrow:1,noWrap:true }}>{t.chef.first_name}</Typography>
                            <Typography sx={{ fontSize:'0.75rem',fontWeight:800,color:'#10b981',flexShrink:0 }}>{charge}%</Typography>
                          </Stack>
                        );
                      })}
                    </Stack>
                  )}
                  {overloadedChefs.length>0&&(
                    <>
                      <Divider sx={{ my:1.5 }}/>
                      <Typography sx={{ fontSize:'0.8rem',fontWeight:700,color:'#ef4444',mb:1 }}>⚠ Surchargés &gt;80%</Typography>
                      <Stack spacing={0.6} sx={{ maxHeight:120,overflowY:'auto' }}>
                        {overloadedChefs.slice(0,2).map((t,i)=>{
                          const charge = Math.round(t.chef.charge_affectee??0);
                          return (
                            <Stack key={i} direction="row" alignItems="center" spacing={1} sx={{ py:0.6,px:1,borderRadius:1.5,bgcolor:isDark ? '#2a2a3a' : '#fef2f2' }}>
                              <Avatar sx={{ width:24,height:24,fontSize:'0.55rem',bgcolor:'#ef4444',fontWeight:700,flexShrink:0 }}>
                                {t.chef.first_name[0]}{t.chef.last_name[0]}
                              </Avatar>
                              <Typography sx={{ fontSize:'0.75rem',fontWeight:600,flexGrow:1,noWrap:true }}>{t.chef.first_name}</Typography>
                              <Typography sx={{ fontSize:'0.75rem',fontWeight:800,color:'#ef4444',flexShrink:0 }}>{charge}%</Typography>
                            </Stack>
                          );
                        })}
                      </Stack>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb:3 }}>
        <Grid size={{ xs:12,lg:6 }}>
          <Card variant="outlined" sx={{ borderRadius:2.5,height:'100%',bgcolor: isDark ? '#1e1e2e' : '#ffffff' }}>
            <CardContent>
              <Typography sx={{ fontSize:'0.9rem',fontWeight:700,mb:2 }}>Charge des Chefs</Typography>
              <ChefChargeChart labels={chefChartLabels} values={chefChartValues} loading={teamsL}/>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs:12,lg:6 }}>
          <Card variant="outlined" sx={{ borderRadius:2.5,height:'100%',bgcolor: isDark ? '#1e1e2e' : '#ffffff' }}>
            <CardContent sx={{ pb:'0 !important' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb:2 }}>
                <Typography sx={{ fontSize:'0.9rem',fontWeight:700 }}>Ressources</Typography>
                <Button size="small" startIcon={<AddIcon sx={{ fontSize:12 }}/>} onClick={()=>setResDlg(true)} sx={{ textTransform:'none',fontSize:'0.75rem',height:28,borderRadius:1.5 }}>+ Ressource</Button>
              </Stack>
              {teamsL ? <Skeleton variant="rectangular" height={180} sx={{ borderRadius:1 }}/> :
               allRes.length===0 ? (
                <EmptyState icon={<GroupsIcon sx={{ fontSize:40 }}/>} title="Aucune ressource" actionLabel="Ajouter" onAction={()=>setResDlg(true)}/>
              ) : (
                <TableContainer sx={{ maxHeight:300 }}>
                  <Table size="small" stickyHeader>
                    <TableHead><TableRow>
                      {['Ressource','Chef','Dispo','Exp.','Score',''].map((h,i)=>(
                        <TableCell key={i} sx={{ fontSize:'0.65rem',fontWeight:700,color:'text.disabled',textTransform:'uppercase',borderBottom:'1px solid',borderColor:'divider',py:1 }}>{h}</TableCell>
                      ))}
                    </TableRow></TableHead>
                    <TableBody>
                      {allRes.slice(0,4).map((r,i)=>{
                        const chefTeam = chefList.find(t=>t.resources.some(x=>x.id===r.id));
                        const chefName = chefTeam?`${chefTeam.chef.first_name[0]}.`:'—';
                        return (
                          <ResRow key={i} res={r} chefName={chefName}
                            onProfile={()=>setProfileModal({ id:r.id,type:'ressource',first_name:r.first_name,last_name:r.last_name,email:r.email,profile_img:r.profile_img,charge_affectee:Math.round(r.charge_affectee??0),score:r.score,disponibilite_hebdo:r.disponibilite_hebdo,cout_horaire:r.cout_horaire,niveau_experience:r.niveau_experience,competence_moyenne:Math.round(r.competence_moyenne??0) })}
                            onEdit={()=>setEditRes(r)}
                            onDelete={()=>setDelConfirm({ open:true,id:r.id,name:`${r.first_name} ${r.last_name}`,type:'user',loading:false })}
                          />
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {renderProjectsSection()}
    </>
  );

  // ── Section: Resources ────────────────────────────────────────────────────
  const renderResources = () => (
    <>
      <Stack direction={{ xs:'column',sm:'row' }} justifyContent="space-between" alignItems={{ xs:'flex-start',sm:'center' }} spacing={2} sx={{ mb:3 }}>
        <Box>
          <Typography sx={{ fontSize:'1.4rem',fontWeight:800,letterSpacing:-0.5 }}>Ressources</Typography>
          <Typography sx={{ fontSize:'0.8rem',color:'text.secondary',mt:0.5 }}>Gestion de toutes les ressources</Typography>
        </Box>
        <Stack direction={{ xs:'column',sm:'row' }} spacing={1} sx={{ width:{ xs:'100%',sm:'auto' } }}>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon sx={{ fontSize:14 }}/>} onClick={refetchAll} sx={{ borderRadius:2,textTransform:'none',fontSize:'0.75rem',width:{ xs:'100%',sm:'auto' } }}>Actualiser</Button>
          <Button variant="contained" size="small" startIcon={<AddIcon sx={{ fontSize:14 }}/>} onClick={()=>setResDlg(true)} sx={{ borderRadius:2,textTransform:'none',fontSize:'0.75rem',width:{ xs:'100%',sm:'auto' },background:'linear-gradient(135deg,#6366f1,#8b5cf6)',boxShadow:'none' }}>Ajouter</Button>
        </Stack>
      </Stack>
      <Card variant="outlined" sx={{ borderRadius:2.5,bgcolor: isDark ? '#1e1e2e' : '#ffffff' }}>
        <CardContent sx={{ pb:'0 !important',p:2 }}>
          {teamsL ? <Skeleton variant="rectangular" height={200} sx={{ borderRadius:1 }}/> :
           allRes.length===0 ? (
            <EmptyState icon={<GroupsIcon sx={{ fontSize:56 }}/>} title="Aucune ressource" subtitle="Ajoutez la première ressource" actionLabel="Ajouter" onAction={()=>setResDlg(true)}/>
          ) : (
            <TableContainer sx={{ maxHeight:600 }}>
              <Table stickyHeader>
                <TableHead><TableRow>
                  {['#','Ressource','Chef','Dispo','Exp.','Score',''].map((h,i)=>(
                    <TableCell key={i} sx={{ fontSize:'0.65rem',fontWeight:700,color:'text.disabled',textTransform:'uppercase',borderBottom:'1px solid',borderColor:'divider' }}>{h}</TableCell>
                  ))}
                </TableRow></TableHead>
                <TableBody>
                  {allRes.map((r,i)=>{
                    const score    = Math.round(r.score??0);
                    const sCol     = scoreColor(score);
                    const avSrc    = r.profile_img?`${API_BASE}/images/${r.profile_img}`:undefined;
                    const chefTeam = chefList.find(t=>t.resources.some(x=>x.id===r.id));
                    const chefName = chefTeam?`${chefTeam.chef.first_name} ${chefTeam.chef.last_name[0]}.`:'—';
                    return (
                      <TableRow key={i} hover>
                        <TableCell sx={{ fontSize:'0.75rem',color:'text.secondary' }}>{i+1}</TableCell>
                        <TableCell sx={{ fontSize:'0.78rem' }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ cursor:'pointer',minWidth:0 }}
                            onClick={()=>setProfileModal({ id:r.id,type:'ressource',first_name:r.first_name,last_name:r.last_name,email:r.email,profile_img:r.profile_img,charge_affectee:Math.round(r.charge_affectee??0),score:r.score,disponibilite_hebdo:r.disponibilite_hebdo,cout_horaire:r.cout_horaire,niveau_experience:r.niveau_experience,competence_moyenne:Math.round(r.competence_moyenne??0) })}>
                            <Avatar src={avSrc} sx={{ width:34,height:34,fontSize:'0.75rem',bgcolor:'#0ea5e9',fontWeight:700,flexShrink:0 }}>
                              {!avSrc&&`${r.first_name[0]}${r.last_name[0]}`}
                            </Avatar>
                            <Box sx={{ minWidth:0 }}>
                              <Typography sx={{ fontSize:'0.82rem',fontWeight:700 }}>{r.first_name}</Typography>
                              <Typography sx={{ fontSize:'0.65rem',color:'text.secondary',noWrap:true }}>{r.email}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontSize:'0.78rem' }}>{chefName}</TableCell>
                        <TableCell sx={{ fontSize:'0.78rem',textAlign:'center' }}>{r.disponibilite_hebdo??0}h</TableCell>
                        <TableCell sx={{ fontSize:'0.78rem',textAlign:'center' }}>{r.niveau_experience??0}y</TableCell>
                        <TableCell><ScoreBar value={score} color={sCol}/></TableCell>
                        <TableCell align="right" sx={{ p:'8px !important' }}>
                          <Stack direction="row" spacing={0.3} justifyContent="flex-end">
                            <Tooltip title="Voir"><IconButton size="small" onClick={()=>setProfileModal({ id:r.id,type:'ressource',first_name:r.first_name,last_name:r.last_name,email:r.email,profile_img:r.profile_img,charge_affectee:Math.round(r.charge_affectee??0),score:r.score,disponibilite_hebdo:r.disponibilite_hebdo,cout_horaire:r.cout_horaire,niveau_experience:r.niveau_experience,competence_moyenne:Math.round(r.competence_moyenne??0) })} sx={{ p:'4px' }}><VisibilityIcon sx={{ fontSize:15,color:'#6366f1' }}/></IconButton></Tooltip>
                            <Tooltip title="Modifier"><IconButton size="small" onClick={()=>setEditRes(r)} sx={{ p:'4px' }}><EditIcon sx={{ fontSize:15,color:'#6366f1' }}/></IconButton></Tooltip>
                            <Tooltip title="Supprimer"><IconButton size="small" onClick={()=>setDelConfirm({ open:true,id:r.id,name:`${r.first_name} ${r.last_name}`,type:'user',loading:false })} sx={{ p:'4px' }}><DeleteIcon sx={{ fontSize:15,color:'#ef4444' }}/></IconButton></Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </>
  );

  // ── Section: Chefs ────────────────────────────────────────────────────────
  const renderChefs = () => (
    <>
      <Stack direction={{ xs:'column',sm:'row' }} justifyContent="space-between" alignItems={{ xs:'flex-start',sm:'center' }} spacing={2} sx={{ mb:3 }}>
        <Box>
          <Typography sx={{ fontSize:'1.4rem',fontWeight:800,letterSpacing:-0.5 }}>Chefs de Projet</Typography>
          <Typography sx={{ fontSize:'0.8rem',color:'text.secondary',mt:0.5 }}>Gestion des chefs et équipes</Typography>
        </Box>
        <Stack direction={{ xs:'column',sm:'row' }} spacing={1} sx={{ width:{ xs:'100%',sm:'auto' } }}>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon sx={{ fontSize:14 }}/>} onClick={refetchAll} sx={{ borderRadius:2,textTransform:'none',fontSize:'0.75rem',width:{ xs:'100%',sm:'auto' } }}>Actualiser</Button>
          <Button variant="contained" size="small" startIcon={<AddIcon sx={{ fontSize:14 }}/>} onClick={()=>setChefDlg(true)} sx={{ borderRadius:2,textTransform:'none',fontSize:'0.75rem',width:{ xs:'100%',sm:'auto' },background:'linear-gradient(135deg,#6366f1,#8b5cf6)',boxShadow:'none' }}>Ajouter</Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs:12,lg:5 }}>
          <Card variant="outlined" sx={{ borderRadius:2.5,height:'100%',bgcolor: isDark ? '#1e1e2e' : '#ffffff' }}>
            <CardContent>
              <Typography sx={{ fontSize:'0.9rem',fontWeight:700,mb:2 }}>Charge des Chefs</Typography>
              <ChefChargeChart labels={chefChartLabels} values={chefChartValues} loading={teamsL}/>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs:12,lg:7 }}>
          <Card variant="outlined" sx={{ borderRadius:2.5,height:'100%',bgcolor: isDark ? '#1e1e2e' : '#ffffff' }}>
            <CardContent sx={{ pb:'0 !important' }}>
              <Typography sx={{ fontSize:'0.9rem',fontWeight:700,mb:2 }}>Tous les Chefs</Typography>
              {teamsL ? <Skeleton variant="rectangular" height={200} sx={{ borderRadius:1 }}/> :
               chefList.length===0 ? (
                <EmptyState icon={<EngineeringIcon sx={{ fontSize:56 }}/>} title="Aucun chef" actionLabel="Ajouter" onAction={()=>setChefDlg(true)}/>
              ) : (
                <TableContainer sx={{ maxHeight:400 }}>
                  <Table stickyHeader size="small">
                    <TableHead><TableRow>
                      {['Chef','Email','Équipe','Charge','Statut',''].map((h,i)=>(
                        <TableCell key={i} sx={{ fontSize:'0.65rem',fontWeight:700,color:'text.disabled',textTransform:'uppercase',borderBottom:'1px solid',borderColor:'divider' }}>{h}</TableCell>
                      ))}
                    </TableRow></TableHead>
                    <TableBody>
                      {chefList.map((team,i)=>{
                        const charge = Math.round(team.chef.charge_affectee??0);
                        const col    = chargeColor(charge);
                        const avSrc  = team.chef.profile_img?`${API_BASE}/images/${team.chef.profile_img}`:undefined;
                        return (
                          <TableRow key={i} hover>
                            <TableCell sx={{ fontSize:'0.78rem' }}>
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ cursor:'pointer',minWidth:0 }}
                                onClick={()=>setProfileModal({ id:team.chef.id,type:'chef',first_name:team.chef.first_name,last_name:team.chef.last_name,email:team.chef.email,profile_img:team.chef.profile_img,charge_affectee:charge,score:team.chef.score,disponibilite_hebdo:team.chef.disponibilite_hebdo,resources:team.resources.map(r=>({ id:r.id,first_name:r.first_name,last_name:r.last_name,charge_affectee:Math.round(r.charge_affectee??0) })) })}>
                                <Avatar src={avSrc} sx={{ width:32,height:32,fontSize:'0.72rem',bgcolor:'#6366f1',fontWeight:700,flexShrink:0 }}>{!avSrc&&`${team.chef.first_name[0]}${team.chef.last_name[0]}`}</Avatar>
                                <Typography sx={{ fontSize:'0.8rem',fontWeight:700 }}>{team.chef.first_name}</Typography>
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ fontSize:'0.75rem',color:'text.secondary' }}>{team.chef.email}</TableCell>
                            <TableCell sx={{ fontSize:'0.78rem',textAlign:'center' }}>{team.resources.length}</TableCell>
                            <TableCell sx={{ textAlign:'center' }}><CircleGauge value={charge} size={36} color={col}/></TableCell>
                            <TableCell sx={{ fontSize:'0.78rem' }}>
                              <Chip size="small" label={charge<50?'Dispo':charge<80?'Occupé':'Surchargé'}
                                sx={{ height:18,fontSize:'0.6rem',fontWeight:700,bgcolor:charge<50?'#f0fdf4':charge<80?'#fffbeb':'#fef2f2',color:col,border:`1px solid ${col}44` }}/>
                            </TableCell>
                            <TableCell align="right" sx={{ p:'8px !important' }}>
                              <Stack direction="row" spacing={0.3} justifyContent="flex-end">
                                <Tooltip title="Modifier"><IconButton size="small" onClick={()=>setEditChef(team.chef)} sx={{ p:'4px' }}><EditIcon sx={{ fontSize:15,color:'#6366f1' }}/></IconButton></Tooltip>
                                <Tooltip title="Supprimer"><IconButton size="small" onClick={()=>setDelConfirm({ open:true,id:team.chef.id,name:`${team.chef.first_name} ${team.chef.last_name}`,type:'user',loading:false })} sx={{ p:'4px' }}><DeleteIcon sx={{ fontSize:15,color:'#ef4444' }}/></IconButton></Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );

  // ── Section: Projects ─────────────────────────────────────────────────────
  const renderProjectsSection = () => (
    <>
      {section==='projects'&&(
        <Stack direction={{ xs:'column',sm:'row' }} justifyContent="space-between" alignItems={{ xs:'flex-start',sm:'center' }} spacing={2} sx={{ mb:3 }}>
          <Box>
            <Typography sx={{ fontSize:'1.4rem',fontWeight:800,letterSpacing:-0.5 }}>Projets</Typography>
            <Typography sx={{ fontSize:'0.8rem',color:'text.secondary',mt:0.5 }}>Gestion complète</Typography>
          </Box>
          <Stack direction={{ xs:'column',sm:'row' }} spacing={1} sx={{ width:{ xs:'100%',sm:'auto' } }}>
            <Button variant="outlined" size="small" startIcon={<RefreshIcon sx={{ fontSize:14 }}/>} onClick={refetchProj} sx={{ borderRadius:2,textTransform:'none',fontSize:'0.75rem',width:{ xs:'100%',sm:'auto' } }}>Actualiser</Button>
            <Button variant="contained" size="small" startIcon={<AddIcon sx={{ fontSize:14 }}/>} onClick={()=>setProjDlg(true)} sx={{ borderRadius:2,textTransform:'none',fontSize:'0.75rem',width:{ xs:'100%',sm:'auto' },background:'linear-gradient(135deg,#6366f1,#8b5cf6)',boxShadow:'none' }}>Projet</Button>
          </Stack>
        </Stack>
      )}
      {section==='dashboard'&&(
        <Typography sx={{ fontSize:'1rem',fontWeight:700,mb:2,mt:1 }}>Tous les Projets</Typography>
      )}
      <Card variant="outlined" sx={{ borderRadius:2.5,bgcolor: isDark ? '#1e1e2e' : '#ffffff' }}>
        <CardContent sx={{ pb:'0 !important',p:2 }}>
          {projL ? <Skeleton variant="rectangular" height={200} sx={{ borderRadius:1 }}/> :
           projList.length===0 ? (
            <EmptyState icon={<FolderOpenIcon sx={{ fontSize:56 }}/>} title="Aucun projet" subtitle="Créez le premier projet" actionLabel="Créer" onAction={()=>setProjDlg(true)}/>
          ) : (
            <TableContainer sx={{ maxHeight:600,overflowX:'auto' }}>
              <Table stickyHeader size="small">
                <TableHead><TableRow>
                  {['Projet','Chef','Statut','Progression','Début','Fin',''].map((h,i)=>(
                    <TableCell key={i} sx={{ fontSize:'0.65rem',fontWeight:700,color:'text.disabled',textTransform:'uppercase',borderBottom:'1px solid',borderColor:'divider',whiteSpace:'nowrap' }}>{h}</TableCell>
                  ))}
                </TableRow></TableHead>
                <TableBody>
                  {projList.map((p,i)=>{
                    const st      = statusLabel(p.status);
                    const progPct = p.estimated_hours>0 ? Math.min(100,Math.max(0,100-Math.round((p.days_remaining/90)*100))) : 0;
                    const chefTeam = chefList.find(t=>t.chef.id===p.chef_id);
                    const chefName = p.chef_first_name ? `${p.chef_first_name} ${p.chef_last_name??''}`.trim()
                      : chefTeam ? `${chefTeam.chef.first_name[0]}.` : '—';
                    return (
                      <TableRow key={i} hover>
                        <TableCell sx={{ fontSize:'0.78rem',minWidth:120 }}>
                          <Typography sx={{ fontSize:'0.82rem',fontWeight:700 }}>{p.name}</Typography>
                          {p.description&&<Typography sx={{ fontSize:'0.65rem',color:'text.secondary',noWrap:true }}>{p.description.substring(0,30)}</Typography>}
                        </TableCell>
                        <TableCell sx={{ fontSize:'0.78rem',minWidth:80,textAlign:'center' }}>
                          {chefTeam&&<Avatar sx={{ width:22,height:22,fontSize:'0.5rem',bgcolor:'#6366f1',fontWeight:700,mx:'auto',mb:0.3 }}>{chefTeam.chef.first_name[0]}{chefTeam.chef.last_name[0]}</Avatar>}
                          {chefName}
                        </TableCell>
                        <TableCell sx={{ minWidth:80 }}>
                          <Chip size="small" label={st.label}
                            sx={{ height:18,fontSize:'0.62rem',fontWeight:700,bgcolor:st.bg,color:st.color,border:`1px solid ${st.color}30`,borderRadius:1 }}/>
                        </TableCell>
                        <TableCell sx={{ minWidth:100 }}>
                          <Stack direction="row" alignItems="center" spacing={0.8}>
                            <LinearProgress variant="determinate" value={progPct} sx={{ flexGrow:1,height:5,borderRadius:3,bgcolor:'#f3f4f6','& .MuiLinearProgress-bar':{ bgcolor:'#6366f1',borderRadius:3 } }}/>
                            <Typography sx={{ fontSize:'0.7rem',fontWeight:700,minWidth:25 }}>{progPct}%</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontSize:'0.75rem',minWidth:75 }}>{p.start_date||'—'}</TableCell>
                        <TableCell sx={{ fontSize:'0.75rem',minWidth:75 }}>
                          <Typography sx={{ color:p.days_remaining<=3&&p.status==='active'?'#ef4444':'text.primary',fontWeight:p.days_remaining<=3?700:400 }}>
                            {p.end_date||'—'}
                            {p.days_remaining<=3&&p.status==='active'&&<Typography component="span" sx={{ fontSize:'0.62rem',color:'#ef4444',ml:0.3 }}>({p.days_remaining}j)</Typography>}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ p:'8px !important' }}>
                          <Stack direction="row" spacing={0.3} justifyContent="flex-end">
                            <Tooltip title="Voir"><IconButton size="small" onClick={()=>setViewProj(p)} sx={{ p:'4px' }}><VisibilityIcon sx={{ fontSize:15,color:'#6366f1' }}/></IconButton></Tooltip>
                            <Tooltip title="Modifier"><IconButton size="small" onClick={()=>setEditProj(p)} sx={{ p:'4px' }}><EditIcon sx={{ fontSize:15,color:'#6366f1' }}/></IconButton></Tooltip>
                            <Tooltip title="Supprimer"><IconButton size="small" onClick={()=>setDelConfirm({ open:true,id:p.id,name:p.name,type:'project',loading:false })} sx={{ p:'4px' }}><DeleteIcon sx={{ fontSize:15,color:'#ef4444' }}/></IconButton></Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </>
  );

  // ── CRUD operations ────────────────────────────────────────────────────────
  const addChef = async () => {
    if(!chefForm.first_name||!chefForm.email||!chefForm.password){ showToast('Champs requis manquants','error'); return; }
    setBusy(true);
    const fd=new FormData(); Object.entries(chefForm).forEach(([k,v])=>fd.append(k,v));
    if(chefImg) fd.append('profile_img',chefImg);
    try { await chefApi.create(fd); showToast('Chef ajouté ✓'); setChefDlg(false); setChefForm({ first_name:'',last_name:'',email:'',password:'',disponibilite_hebdo:'40' }); setChefImg(null); refetchAll(); }
    catch(e:any){ showToast(e?.response?.data?.error||'Erreur','error'); }
    finally{ setBusy(false); }
  };

  const addRes = async () => {
    if(!resForm.first_name||!resForm.email||!resForm.password){ showToast('Champs requis manquants','error'); return; }
    setBusy(true);
    const fd=new FormData(); Object.entries(resForm).forEach(([k,v])=>v&&fd.append(k,v));
    if(resImg) fd.append('profile_img',resImg);
    try { await ressourceApi.create(fd); showToast('Ressource ajoutée ✓'); setResDlg(false); setResForm({ first_name:'',last_name:'',email:'',password:'',experience:'2',cost_hour:'50',disponibilite_hebdo:'40',competence_moyenne:'70',chef_id:'' }); setResImg(null); refetchAll(); }
    catch(e:any){ showToast(e?.response?.data?.error||'Erreur','error'); }
    finally{ setBusy(false); }
  };

  const addProj = async () => {
    if(!projForm.name||!projForm.chef_id){ showToast('Nom et chef requis','error'); return; }
    setBusy(true);
    const fd=new FormData(); Object.entries(projForm).forEach(([k,v])=>v&&fd.append(k,v));
    try { await projectsApi.create(fd); showToast('Projet créé ✓'); setProjDlg(false); setProjForm({ name:'',description:'',estimated_hours:'',chef_id:'',start_date:'',end_date:'' }); refetchAll(); }
    catch(e:any){ showToast(e?.response?.data?.error||'Erreur','error'); }
    finally{ setBusy(false); }
  };

  const saveEditChef = async () => {
    if(!editChef) return; setBusy(true);
    const fd=new FormData(); Object.entries(editChef).forEach(([k,v])=>fd.append(k,String(v)));
    try { await usersApi.update(editChef.id,fd); showToast('Chef modifié ✓'); setEditChef(null); refetchAll(); }
    catch(e:any){ showToast(e?.response?.data?.error||'Erreur','error'); }
    finally{ setBusy(false); }
  };

  const saveEditRes = async () => {
    if(!editRes) return; setBusy(true);
    const fd=new FormData(); Object.entries(editRes).forEach(([k,v])=>fd.append(k,String(v)));
    try { await usersApi.update(editRes.id,fd); showToast('Ressource modifiée ✓'); setEditRes(null); refetchAll(); }
    catch(e:any){ showToast(e?.response?.data?.error||'Erreur','error'); }
    finally{ setBusy(false); }
  };

  const saveEditProj = async () => {
    if(!editProj) return; setBusy(true);
    const fd=new FormData(); Object.entries(editProj).forEach(([k,v])=>fd.append(k,String(v)));
    try { await projectsApi.update(editProj.id,fd); showToast('Projet modifié ✓'); setEditProj(null); refetchAll(); }
    catch(e:any){ showToast(e?.response?.data?.error||'Erreur','error'); }
    finally{ setBusy(false); }
  };

  const doDelete = async () => {
    setDelConfirm(s=>({...s,loading:true}));
    try {
      if(delConfirm.type==='project') await projectsApi.delete(delConfirm.id);
      else await usersApi.delete(delConfirm.id);
      showToast('Supprimé ✓');
      setDelConfirm(s=>({...s,open:false,loading:false}));
      refetchAll();
    } catch(e:any){ showToast(e?.response?.data?.error||'Erreur','error'); setDelConfirm(s=>({...s,loading:false})); }
  };

  // ─── RENDER SECTION ────────────────────────────────────────────────────────
  const renderSection = () => {
    switch(section){
      case 'resources': return renderResources();
      case 'chefs':     return renderChefs();
      case 'projects':  return renderProjectsSection();
      default:          return renderDashboard();
    }
  };

  return (
    <Box sx={{ 
      p:{ xs:1.5,sm:2,lg:3 },
      bgcolor: isDark ? '#0f0f1e' : '#00000000',
      minHeight:'100vh' 
    }}>
      {renderSection()}

      {/* ═══ Dialogs - Same as before but with proper spacing ═══ */}
      <Dialog open={chefDlg} onClose={()=>setChefDlg(false)} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:3, bgcolor: isDark ? '#1e1e2e' : '#ffffff' } }}>
        <DialogTitle sx={{ fontWeight:800 }}>Nouveau Chef de Projet</DialogTitle>
        <DialogContent sx={{ pt:'16px !important' }}>
          <Stack spacing={2.5}>
            <ImageUpload value={chefImg} onChange={setChefImg}/>
            <Divider/>
            <Grid container spacing={2}>
              <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Prénom *</FormLabel><TextField fullWidth value={chefForm.first_name} onChange={e=>setChefForm(p=>({...p,first_name:e.target.value}))} placeholder="Jean" size="small"/></FormControl></Grid>
              <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Nom *</FormLabel><TextField fullWidth value={chefForm.last_name} onChange={e=>setChefForm(p=>({...p,last_name:e.target.value}))} placeholder="Dupont" size="small"/></FormControl></Grid>
              <Grid size={{ xs:12 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Email *</FormLabel><TextField fullWidth type="email" value={chefForm.email} onChange={e=>setChefForm(p=>({...p,email:e.target.value}))} placeholder="chef@email.com" size="small"/></FormControl></Grid>
              <Grid size={{ xs:12 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Mot de passe *</FormLabel><TextField fullWidth type="password" value={chefForm.password} onChange={e=>setChefForm(p=>({...p,password:e.target.value}))} placeholder="••••••" size="small"/></FormControl></Grid>
              <Grid size={{ xs:12 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Disponibilité hebdo (h)</FormLabel><TextField fullWidth type="number" value={chefForm.disponibilite_hebdo} onChange={e=>setChefForm(p=>({...p,disponibilite_hebdo:e.target.value}))} placeholder="40" size="small"/></FormControl></Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px:3,pb:2.5,gap:1 }}>
          <Button onClick={()=>setChefDlg(false)} variant="outlined" sx={{ borderRadius:2,textTransform:'none' }}>Annuler</Button>
          <Button variant="contained" onClick={addChef} disabled={busy} sx={{ borderRadius:2,textTransform:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',boxShadow:'none' }}>{busy?'Ajout...':'Ajouter'}</Button>
        </DialogActions>
      </Dialog>

      {/* Additional dialogs with dark mode support... (similar pattern) */}
      <Dialog open={!!editChef} onClose={()=>setEditChef(null)} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:3, bgcolor: isDark ? '#1e1e2e' : '#ffffff' } }}>
        <DialogTitle sx={{ fontWeight:800 }}>Modifier le Chef</DialogTitle>
        <DialogContent sx={{ pt:'16px !important' }}>
          {editChef&&(
            <Grid container spacing={2}>
              <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Prénom</FormLabel><TextField fullWidth value={editChef.first_name} onChange={e=>setEditChef(p=>p?{...p,first_name:e.target.value}:p)} size="small"/></FormControl></Grid>
              <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Nom</FormLabel><TextField fullWidth value={editChef.last_name} onChange={e=>setEditChef(p=>p?{...p,last_name:e.target.value}:p)} size="small"/></FormControl></Grid>
              <Grid size={{ xs:12 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Email</FormLabel><TextField fullWidth type="email" value={editChef.email} onChange={e=>setEditChef(p=>p?{...p,email:e.target.value}:p)} size="small"/></FormControl></Grid>
              <Grid size={{ xs:12 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Disponibilité hebdo (h)</FormLabel><TextField fullWidth type="number" value={editChef.disponibilite_hebdo??40} onChange={e=>setEditChef(p=>p?{...p,disponibilite_hebdo:Number(e.target.value)}:p)} size="small"/></FormControl></Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px:3,pb:2.5,gap:1 }}>
          <Button onClick={()=>setEditChef(null)} variant="outlined" sx={{ borderRadius:2,textTransform:'none' }}>Annuler</Button>
          <Button variant="contained" onClick={saveEditChef} disabled={busy} sx={{ borderRadius:2,textTransform:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',boxShadow:'none' }}>{busy?'Sauvegarde...':'Enregistrer'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resDlg} onClose={()=>setResDlg(false)} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:3, bgcolor: isDark ? '#1e1e2e' : '#ffffff' } }}>
        <DialogTitle sx={{ fontWeight:800 }}>Nouvelle Ressource</DialogTitle>
        <DialogContent sx={{ pt:'16px !important' }}>
          <Stack spacing={2.5}>
            <ImageUpload value={resImg} onChange={setResImg}/>
            <Divider/>
            <Grid container spacing={2}>
              <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Prénom *</FormLabel><TextField fullWidth value={resForm.first_name} onChange={e=>setResForm(p=>({...p,first_name:e.target.value}))} placeholder="Marie" size="small"/></FormControl></Grid>
              <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Nom *</FormLabel><TextField fullWidth value={resForm.last_name} onChange={e=>setResForm(p=>({...p,last_name:e.target.value}))} placeholder="Martin" size="small"/></FormControl></Grid>
              <Grid size={{ xs:12 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Email *</FormLabel><TextField fullWidth type="email" value={resForm.email} onChange={e=>setResForm(p=>({...p,email:e.target.value}))} placeholder="ressource@email.com" size="small"/></FormControl></Grid>
              <Grid size={{ xs:12 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Mot de passe *</FormLabel><TextField fullWidth type="password" value={resForm.password} onChange={e=>setResForm(p=>({...p,password:e.target.value}))} placeholder="••••••" size="small"/></FormControl></Grid>
              <Grid size={{ xs:12 }}><FormControl fullWidth size="small"><InputLabel>Chef assigné</InputLabel>
                <Select value={resForm.chef_id} label="Chef assigné" onChange={e=>setResForm(p=>({...p,chef_id:String(e.target.value)}))}>
                  <MenuItem value=""><em>Aucun</em></MenuItem>
                  {chefList.map(t=><MenuItem key={t.chef.id} value={t.chef.id}>{t.chef.first_name} {t.chef.last_name}</MenuItem>)}
                </Select>
              </FormControl></Grid>
              <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Expérience (ans)</FormLabel><TextField fullWidth type="number" value={resForm.experience} onChange={e=>setResForm(p=>({...p,experience:e.target.value}))} size="small"/></FormControl></Grid>
              <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Coût/h (€)</FormLabel><TextField fullWidth type="number" value={resForm.cost_hour} onChange={e=>setResForm(p=>({...p,cost_hour:e.target.value}))} size="small"/></FormControl></Grid>
              <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Dispo hebdo (h)</FormLabel><TextField fullWidth type="number" value={resForm.disponibilite_hebdo} onChange={e=>setResForm(p=>({...p,disponibilite_hebdo:e.target.value}))} size="small"/></FormControl></Grid>
              <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Compétence (/100)</FormLabel><TextField fullWidth type="number" value={resForm.competence_moyenne} onChange={e=>setResForm(p=>({...p,competence_moyenne:e.target.value}))} size="small"/></FormControl></Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px:3,pb:2.5,gap:1 }}>
          <Button onClick={()=>setResDlg(false)} variant="outlined" sx={{ borderRadius:2,textTransform:'none' }}>Annuler</Button>
          <Button variant="contained" onClick={addRes} disabled={busy} sx={{ borderRadius:2,textTransform:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',boxShadow:'none' }}>{busy?'Ajout...':'Ajouter'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editRes} onClose={()=>setEditRes(null)} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:3, bgcolor: isDark ? '#1e1e2e' : '#ffffff' } }}>
        <DialogTitle sx={{ fontWeight:800 }}>Modifier la Ressource</DialogTitle>
        <DialogContent sx={{ pt:'16px !important' }}>
          {editRes&&(
            <Grid container spacing={2}>
              <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Prénom</FormLabel><TextField fullWidth value={editRes.first_name} onChange={e=>setEditRes(p=>p?{...p,first_name:e.target.value}:p)} size="small"/></FormControl></Grid>
              <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Nom</FormLabel><TextField fullWidth value={editRes.last_name} onChange={e=>setEditRes(p=>p?{...p,last_name:e.target.value}:p)} size="small"/></FormControl></Grid>
              <Grid size={{ xs:12 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Email</FormLabel><TextField fullWidth type="email" value={editRes.email} onChange={e=>setEditRes(p=>p?{...p,email:e.target.value}:p)} size="small"/></FormControl></Grid>
              <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Dispo hebdo (h)</FormLabel><TextField fullWidth type="number" value={editRes.disponibilite_hebdo??40} onChange={e=>setEditRes(p=>p?{...p,disponibilite_hebdo:Number(e.target.value)}:p)} size="small"/></FormControl></Grid>
              <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Compétence</FormLabel><TextField fullWidth type="number" value={editRes.competence_moyenne??0} onChange={e=>setEditRes(p=>p?{...p,competence_moyenne:Number(e.target.value)}:p)} size="small"/></FormControl></Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px:3,pb:2.5,gap:1 }}>
          <Button onClick={()=>setEditRes(null)} variant="outlined" sx={{ borderRadius:2,textTransform:'none' }}>Annuler</Button>
          <Button variant="contained" onClick={saveEditRes} disabled={busy} sx={{ borderRadius:2,textTransform:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',boxShadow:'none' }}>{busy?'Sauvegarde...':'Enregistrer'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={projDlg} onClose={()=>setProjDlg(false)} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:3, bgcolor: isDark ? '#1e1e2e' : '#ffffff' } }}>
        <DialogTitle sx={{ fontWeight:800 }}>Nouveau Projet</DialogTitle>
        <DialogContent sx={{ pt:'16px !important' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs:12 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Nom *</FormLabel><TextField fullWidth value={projForm.name} onChange={e=>setProjForm(p=>({...p,name:e.target.value}))} placeholder="Refonte SI" size="small"/></FormControl></Grid>
            <Grid size={{ xs:12 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Description</FormLabel><TextField fullWidth multiline rows={2} value={projForm.description} onChange={e=>setProjForm(p=>({...p,description:e.target.value}))} placeholder="Objectifs..." size="small"/></FormControl></Grid>
            <Grid size={{ xs:12 }}><FormControl fullWidth size="small"><InputLabel>Chef assigné *</InputLabel>
              <Select value={projForm.chef_id} label="Chef assigné *" onChange={e=>setProjForm(p=>({...p,chef_id:String(e.target.value)}))}>
                {chefList.map(t=><MenuItem key={t.chef.id} value={t.chef.id}>{t.chef.first_name} {t.chef.last_name}</MenuItem>)}
              </Select>
            </FormControl></Grid>
            <Grid size={{ xs:12 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Heures estimées</FormLabel><TextField fullWidth type="number" value={projForm.estimated_hours} onChange={e=>setProjForm(p=>({...p,estimated_hours:e.target.value}))} placeholder="120" size="small"/></FormControl></Grid>
            <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Date début</FormLabel><TextField fullWidth type="date" value={projForm.start_date} onChange={e=>setProjForm(p=>({...p,start_date:e.target.value}))} InputLabelProps={{ shrink:true }} size="small"/></FormControl></Grid>
            <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Date fin</FormLabel><TextField fullWidth type="date" value={projForm.end_date} onChange={e=>setProjForm(p=>({...p,end_date:e.target.value}))} InputLabelProps={{ shrink:true }} size="small"/></FormControl></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3,pb:2.5,gap:1 }}>
          <Button onClick={()=>setProjDlg(false)} variant="outlined" sx={{ borderRadius:2,textTransform:'none' }}>Annuler</Button>
          <Button variant="contained" onClick={addProj} disabled={busy} sx={{ borderRadius:2,textTransform:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',boxShadow:'none' }}>{busy?'Création...':'Créer'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editProj} onClose={()=>setEditProj(null)} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:3, bgcolor: isDark ? '#1e1e2e' : '#ffffff' } }}>
        <DialogTitle sx={{ fontWeight:800 }}>Modifier le Projet</DialogTitle>
        <DialogContent sx={{ pt:'16px !important' }}>
          {editProj&&(
            <Grid container spacing={2}>
              <Grid size={{ xs:12 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Nom</FormLabel><TextField fullWidth value={editProj.name} onChange={e=>setEditProj(p=>p?{...p,name:e.target.value}:p)} size="small"/></FormControl></Grid>
              <Grid size={{ xs:12 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Description</FormLabel><TextField fullWidth multiline rows={2} value={editProj.description||''} onChange={e=>setEditProj(p=>p?{...p,description:e.target.value}:p)} size="small"/></FormControl></Grid>
              <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Heures estimées</FormLabel><TextField fullWidth type="number" value={editProj.estimated_hours} onChange={e=>setEditProj(p=>p?{...p,estimated_hours:Number(e.target.value)}:p)} size="small"/></FormControl></Grid>
              <Grid size={{ xs:6 }}><FormControl fullWidth size="small"><InputLabel>Statut</InputLabel>
                <Select value={editProj.status} label="Statut" onChange={e=>setEditProj(p=>p?{...p,status:e.target.value as any}:p)}>
                  <MenuItem value="planned">Planifié</MenuItem><MenuItem value="active">Actif</MenuItem><MenuItem value="finished">Terminé</MenuItem>
                </Select>
              </FormControl></Grid>
              <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Date début</FormLabel><TextField fullWidth type="date" value={editProj.start_date} onChange={e=>setEditProj(p=>p?{...p,start_date:e.target.value}:p)} InputLabelProps={{ shrink:true }} size="small"/></FormControl></Grid>
              <Grid size={{ xs:6 }}><FormControl fullWidth><FormLabel sx={{ mb:0.5,fontSize:'0.82rem' }}>Date fin</FormLabel><TextField fullWidth type="date" value={editProj.end_date} onChange={e=>setEditProj(p=>p?{...p,end_date:e.target.value}:p)} InputLabelProps={{ shrink:true }} size="small"/></FormControl></Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px:3,pb:2.5,gap:1 }}>
          <Button onClick={()=>setEditProj(null)} variant="outlined" sx={{ borderRadius:2,textTransform:'none' }}>Annuler</Button>
          <Button variant="contained" onClick={saveEditProj} disabled={busy} sx={{ borderRadius:2,textTransform:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',boxShadow:'none' }}>{busy?'Sauvegarde...':'Enregistrer'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!viewProj} onClose={()=>setViewProj(null)} maxWidth="xs" fullWidth PaperProps={{ sx:{ borderRadius:3, bgcolor: isDark ? '#1e1e2e' : '#ffffff' } }}>
        <DialogTitle sx={{ fontWeight:800 }}>Détails du Projet</DialogTitle>
        <DialogContent sx={{ pt:'16px !important' }}>
          {viewProj&&(
            <Stack spacing={1.5}>
              <Box><Typography sx={{ fontSize:'0.75rem',color:'text.secondary',fontWeight:700,mb:0.3 }}>NOM</Typography><Typography sx={{ fontWeight:700 }}>{viewProj.name}</Typography></Box>
              {viewProj.description&&<Box><Typography sx={{ fontSize:'0.75rem',color:'text.secondary',fontWeight:700,mb:0.3 }}>DESCRIPTION</Typography><Typography sx={{ fontSize:'0.9rem' }}>{viewProj.description}</Typography></Box>}
              <Box sx={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:1.5,mt:1 }}>
                <Box><Typography sx={{ fontSize:'0.75rem',color:'text.secondary',fontWeight:700,mb:0.3 }}>STATUT</Typography>
                  <Chip size="small" label={statusLabel(viewProj.status).label} sx={{ height:20,fontSize:'0.65rem',bgcolor:statusLabel(viewProj.status).bg,color:statusLabel(viewProj.status).color }}/></Box>
                <Box><Typography sx={{ fontSize:'0.75rem',color:'text.secondary',fontWeight:700,mb:0.3 }}>HEURES</Typography><Typography sx={{ fontWeight:700 }}>{viewProj.estimated_hours}h</Typography></Box>
                <Box><Typography sx={{ fontSize:'0.75rem',color:'text.secondary',fontWeight:700,mb:0.3 }}>DÉBUT</Typography><Typography sx={{ fontSize:'0.85rem' }}>{viewProj.start_date||'—'}</Typography></Box>
                <Box><Typography sx={{ fontSize:'0.75rem',color:'text.secondary',fontWeight:700,mb:0.3 }}>FIN</Typography><Typography sx={{ fontSize:'0.85rem' }}>{viewProj.end_date||'—'}</Typography></Box>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px:3,pb:2.5 }}>
          <Button onClick={()=>{ setViewProj(null); setEditProj(viewProj); }} variant="outlined" startIcon={<EditIcon/>} sx={{ borderRadius:2,textTransform:'none' }}>Modifier</Button>
          <Button onClick={()=>setViewProj(null)} variant="contained" sx={{ borderRadius:2,textTransform:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',boxShadow:'none' }}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Profile Modal */}
      <ProfileModal open={!!profileModal} onClose={()=>setProfileModal(null)} data={profileModal}/>

      {/* Confirm delete */}
      <ConfirmDialog
        open={delConfirm.open}
        title="Confirmer la suppression"
        message={`Supprimer "${delConfirm.name}" définitivement ?`}
        onConfirm={doDelete}
        onClose={()=>setDelConfirm(s=>({...s,open:false}))}
        loading={delConfirm.loading}
        confirmLabel="Supprimer"
      />

      {ToastEl}
    </Box>
  );
}