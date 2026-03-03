import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';
import AppTheme from '../theme/AppTheme';
import ColorModeSelect from '../theme/ColorModeSelect';
import { useAuth } from '../auth/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Card = styled(MuiCard)(({ theme }) => ({
  display:'flex', flexDirection:'column', alignSelf:'center', width:'100%',
  padding: theme.spacing(4), gap: theme.spacing(2), margin:'auto',
  [theme.breakpoints.up('sm')]:{ maxWidth:'450px' },
  boxShadow:'hsla(220,30%,5%,.05) 0px 5px 15px,hsla(220,25%,10%,.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark',{ boxShadow:'hsla(220,30%,5%,.5) 0px 5px 15px,hsla(220,25%,10%,.08) 0px 15px 35px -5px' }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height:'calc((1 - var(--template-frame-height,0)) * 100dvh)', minHeight:'100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]:{ padding: theme.spacing(4) },
  '&::before':{ content:'""', display:'block', position:'absolute', zIndex:-1, inset:0,
    backgroundImage:'radial-gradient(ellipse at 50% 50%,hsl(210,100%,97%),hsl(0,0%,100%))', backgroundRepeat:'no-repeat',
    ...theme.applyStyles('dark',{ backgroundImage:'radial-gradient(at 50% 50%,hsla(210,100%,16%,.5),hsl(220,30%,5%))' }) },
}));

function ForgotPasswordDialog({ open, handleClose }: { open:boolean; handleClose:()=>void }) {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState('');
  const [error, setError] = React.useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Email invalide'); return; }
    setLoading(true);
    try {
      const fd = new FormData(); fd.append('email', email);
      const res = await fetch(`${API_URL}/forgot-password`, { method:'POST', body:fd });
      const data = await res.json();
      if (res.ok) { setSuccess('Lien envoyé !'); setTimeout(() => { handleClose(); setSuccess(''); }, 2000); }
      else setError(data.error || 'Erreur');
    } catch { setError('Impossible de joindre le serveur'); } finally { setLoading(false); }
  };
  return (
    <Dialog open={open} onClose={handleClose} slotProps={{ paper:{ component:'form', onSubmit:handleSubmit, sx:{ backgroundImage:'none' } } }}>
      <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
      <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2 }}>
        <DialogContentText>Entrez votre adresse email pour recevoir un lien.</DialogContentText>
        {success && <Alert severity="success">{success}</Alert>}
        {error   && <Alert severity="error">{error}</Alert>}
        <OutlinedInput autoFocus required placeholder="votre@email.com" type="email" fullWidth value={email} onChange={e=>setEmail(e.target.value)} disabled={loading}/>
      </DialogContent>
      <DialogActions sx={{ pb:3, px:3 }}>
        <Button onClick={handleClose} disabled={loading}>Annuler</Button>
        <Button variant="contained" type="submit" disabled={loading}>
          {loading ? <CircularProgress size={20}/> : 'Envoyer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function SignIn(props: { disableCustomTheme?: boolean }) {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const [email, setEmail]       = React.useState('');
  const [password, setPassword] = React.useState('');
  const [emailErr, setEmailErr] = React.useState('');
  const [passErr, setPassErr]   = React.useState('');
  const [loading, setLoading]   = React.useState(false);
  const [error, setError]       = React.useState('');
  const [success, setSuccess]   = React.useState('');
  const [forgotOpen, setForgotOpen] = React.useState(false);

  const validate = () => {
    let ok = true;
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailErr('Adresse email invalide'); ok=false; } else setEmailErr('');
    if (password.length < 4) { setPassErr('Minimum 4 caractères'); ok=false; } else setPassErr('');
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
      setSuccess('Connexion réussie ! Redirection...');
      setTimeout(() => navigate(from, { replace:true }), 900);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || '';
      if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('invalid'))
        setError('Email ou mot de passe incorrect.');
      else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('connect'))
        setError('Impossible de joindre le serveur. Vérifiez votre connexion.');
      else setError(msg || 'Échec de la connexion. Réessayez.');
    } finally { setLoading(false); }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <ColorModeSelect sx={{ position:'fixed', top:'1rem', right:'1rem' }} />
        <Card variant="outlined">
          <Typography component="h1" variant="h4" sx={{ fontSize:'clamp(2rem,10vw,2.15rem)' }}>
            Se connecter
          </Typography>
          {success && <Alert severity="success" sx={{ borderRadius:1.5 }}>{success}</Alert>}
          {error   && <Alert severity="error"   sx={{ borderRadius:1.5 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ display:'flex', flexDirection:'column', gap:2 }}>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField id="email" type="email" placeholder="votre@email.com" autoComplete="email" autoFocus
                required fullWidth size="medium" value={email} onChange={e=>setEmail(e.target.value)}
                error={!!emailErr} helperText={emailErr} disabled={loading}/>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Mot de passe</FormLabel>
              <TextField id="password" type="password" placeholder="••••••" autoComplete="current-password"
                required fullWidth size="medium" value={password} onChange={e=>setPassword(e.target.value)}
                error={!!passErr} helperText={passErr} disabled={loading}/>
            </FormControl>
            <FormControlLabel control={<Checkbox disabled={loading}/>} label="Se souvenir de moi" />
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}
              sx={{ display:'flex', alignItems:'center', gap:1, py:1.5, borderRadius:1.5, fontWeight:700 }}>
              {loading ? <><CircularProgress size={20} color="inherit"/>  Connexion...</> : 'Se connecter'}
            </Button>
            <Link component="button" type="button" variant="body2" sx={{ alignSelf:'center', cursor:'pointer' }}
              onClick={() => setForgotOpen(true)}>
              Mot de passe oublié ?
            </Link>
          </Box>
          <Divider>ou</Divider>
          <Box sx={{ display:'flex', flexDirection:'column', gap:2 }}>
            <Typography sx={{ textAlign:'center' }}>
              Pas de compte ?{' '}
              <Link href="/register" variant="body2" fontWeight={600}>S'inscrire</Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
      <ForgotPasswordDialog open={forgotOpen} handleClose={() => setForgotOpen(false)}/>
    </AppTheme>
  );
}
export default SignIn;
