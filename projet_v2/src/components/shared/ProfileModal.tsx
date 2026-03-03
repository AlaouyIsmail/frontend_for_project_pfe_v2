import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import CloseIcon from '@mui/icons-material/Close';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface ProfileData {
  id: number;
  type: 'chef' | 'ressource';
  first_name: string;
  last_name: string;
  email: string;
  profile_img: string | null;
  charge_affectee?: number;
  score?: number;
  disponibilite_hebdo?: number;
  cout_horaire?: number;
  niveau_experience?: number;
  competence_moyenne?: number;
  projects?: Array<{ id: number; name: string; status: string; estimated_hours: number; }>;
  resources?: Array<{ id: number; first_name: string; last_name: string; charge_affectee: number; }>;
}

function chargeColor(v: number) {
  if (v >= 80) return '#ef4444';
  if (v >= 50) return '#f59e0b';
  return '#10b981';
}

function CircularScore({ value, size = 64, color }: { value: number; size?: number; color: string }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <Box sx={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={5} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <Typography sx={{ fontSize: size * 0.22, fontWeight: 800, color, lineHeight: 1, zIndex: 1 }}>
        {value}%
      </Typography>
    </Box>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  data: ProfileData | null;
}

export default function ProfileModal({ open, onClose, data }: Props) {
  if (!data) return null;

  const charge = data.charge_affectee ?? 0;
  const score  = data.score ?? 0;
  const color  = chargeColor(charge);
  const avatarSrc = data.profile_img ? `${API_BASE}/images/${data.profile_img}` : undefined;
  const initials  = `${data.first_name?.[0] ?? ''}${data.last_name?.[0] ?? ''}`.toUpperCase();

  const statusColors: Record<string, any> = {
    active: { label: 'Actif', color: 'success' },
    planned: { label: 'Planifié', color: 'info' },
    finished: { label: 'Terminé', color: 'default' },
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>

      {/* Header gradient banner */}
      <Box sx={{ height: 80, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', position: 'relative' }}>
        <IconButton onClick={onClose} size="small"
          sx={{ position: 'absolute', top: 10, right: 10, color: 'white', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 0, pb: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, mt: -5, flexDirection: { xs: 'column', sm: 'row' } }}>

          {/* ── LEFT: Identity ── */}
          <Box sx={{ width: { sm: 200 }, flexShrink: 0 }}>
            <Avatar src={avatarSrc}
              sx={{ width: 80, height: 80, fontSize: '1.8rem', fontWeight: 800, bgcolor: color, border: '4px solid white', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', mb: 1.5 }}>
              {!avatarSrc && initials}
            </Avatar>
            <Typography variant="h6" fontWeight={800} lineHeight={1.2}>{data.first_name} {data.last_name}</Typography>
            <Chip
              label={data.type === 'chef' ? 'Chef de Projet' : 'Ressource'}
              size="small"
              sx={{ mt: 0.5, mb: 1.5, bgcolor: '#6366f110', color: '#6366f1', fontWeight: 700, fontSize: '0.65rem' }}
            />

            <Stack spacing={1.2} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EmailRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', wordBreak: 'break-all' }}>{data.email}</Typography>
              </Stack>
              {data.disponibilite_hebdo && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTimeRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{data.disponibilite_hebdo}h / semaine</Typography>
                </Stack>
              )}
              {data.cout_horaire && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <WorkRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{data.cout_horaire} €/h</Typography>
                </Stack>
              )}
              {data.niveau_experience && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <StarRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{data.niveau_experience} ans d'exp.</Typography>
                </Stack>
              )}
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Charge score */}
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Charge Actuelle
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <CircularScore value={charge} size={72} color={color} />
            </Box>
            <LinearProgress variant="determinate" value={Math.min(charge, 100)} sx={{ borderRadius: 2, height: 6, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { bgcolor: color } }} />
          </Box>

          {/* ── RIGHT: Details ── */}
          <Box sx={{ flexGrow: 1, mt: { xs: 0, sm: 2 } }}>

            {/* Stats row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 2.5 }}>
              {[
                { label: 'Score', value: score, icon: <StarRoundedIcon sx={{ fontSize: 16, color: '#f59e0b' }} /> },
                { label: 'Compétence', value: `${data.competence_moyenne ?? 0}%`, icon: <SpeedRoundedIcon sx={{ fontSize: 16, color: '#6366f1' }} /> },
                { label: 'Projets', value: data.projects?.length ?? data.resources?.length ?? 0, icon: <WorkRoundedIcon sx={{ fontSize: 16, color: '#10b981' }} /> },
              ].map((s, i) => (
                <Box key={i} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover', textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>{s.icon}</Box>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>

            {/* Projects list */}
            {data.projects && data.projects.length > 0 && (
              <>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Projets Assignés
                </Typography>
                <Stack spacing={1} sx={{ mb: 2 }}>
                  {data.projects.map((p) => {
                    const sc = statusColors[p.status] ?? { label: p.status, color: 'default' };
                    return (
                      <Stack key={p.id} direction="row" justifyContent="space-between" alignItems="center"
                        sx={{ p: 1.2, borderRadius: 1.5, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarTodayRoundedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{p.name}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{p.estimated_hours}h</Typography>
                          <Chip label={sc.label} size="small" color={sc.color} sx={{ height: 18, fontSize: '0.6rem' }} />
                        </Stack>
                      </Stack>
                    );
                  })}
                </Stack>
              </>
            )}

            {/* Team resources (for chefs) */}
            {data.resources && data.resources.length > 0 && (
              <>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Équipe
                </Typography>
                <Stack spacing={0.8}>
                  {data.resources.map((r) => (
                    <Stack key={r.id} direction="row" justifyContent="space-between" alignItems="center"
                      sx={{ p: 1, borderRadius: 1.5, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.6rem', bgcolor: chargeColor(r.charge_affectee) }}>
                          {r.first_name[0]}{r.last_name[0]}
                        </Avatar>
                        <Typography sx={{ fontSize: '0.78rem' }}>{r.first_name} {r.last_name}</Typography>
                      </Stack>
                      <Chip size="small" label={`${r.charge_affectee}%`}
                        sx={{ height: 18, fontSize: '0.6rem', bgcolor: `${chargeColor(r.charge_affectee)}15`, color: chargeColor(r.charge_affectee), fontWeight: 700 }} />
                    </Stack>
                  ))}
                </Stack>
              </>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
