import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AppTheme from '../theme/AppTheme';
import ColorModeIconDropdown from '../theme/ColorModeIconDropdown';
import { useAuth } from '../auth/AuthContext';

const STEPS = ['Informations société', 'Vérification identité', 'Confirmation'];

// ── Step 1 : Company info ─────────────────────────────────────────────────────
function CompanyStep({ data, onChange }: { data: any; onChange: (k: string, v: string) => void }) {
  return (
    <Stack spacing={2.5}>
      <Typography variant="h6" fontWeight={700} color="primary">Informations de votre société</Typography>
      <Typography variant="body2" color="text.secondary">Vérifiez et mettez à jour les informations de facturation annuelles.</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs:12 }}>
          <FormControl fullWidth>
            <FormLabel>Nom de la société *</FormLabel>
            <TextField fullWidth placeholder="Acme Corp" value={data.company} onChange={e => onChange('company', e.target.value)} size="medium" sx={{ mt:0.5 }}/>
          </FormControl>
        </Grid>
        <Grid size={{ xs:12, sm:6 }}>
          <FormControl fullWidth>
            <FormLabel>Prénom *</FormLabel>
            <TextField fullWidth placeholder="Jean" value={data.first_name} onChange={e => onChange('first_name', e.target.value)} size="medium" sx={{ mt:0.5 }}/>
          </FormControl>
        </Grid>
        <Grid size={{ xs:12, sm:6 }}>
          <FormControl fullWidth>
            <FormLabel>Nom *</FormLabel>
            <TextField fullWidth placeholder="Dupont" value={data.last_name} onChange={e => onChange('last_name', e.target.value)} size="medium" sx={{ mt:0.5 }}/>
          </FormControl>
        </Grid>
        <Grid size={{ xs:12 }}>
          <FormControl fullWidth>
            <FormLabel>Email professionnel *</FormLabel>
            <TextField fullWidth type="email" placeholder="contact@société.com" value={data.email} onChange={e => onChange('email', e.target.value)} size="medium" sx={{ mt:0.5 }}/>
          </FormControl>
        </Grid>
        <Grid size={{ xs:12 }}>
          <FormControl fullWidth>
            <FormLabel>Adresse</FormLabel>
            <TextField fullWidth placeholder="123 rue de la Paix, 75001 Paris" value={data.address} onChange={e => onChange('address', e.target.value)} size="medium" sx={{ mt:0.5 }}/>
          </FormControl>
        </Grid>
        <Grid size={{ xs:12, sm:6 }}>
          <FormControl fullWidth>
            <FormLabel>Numéro SIRET</FormLabel>
            <TextField fullWidth placeholder="123 456 789 00012" value={data.siret} onChange={e => onChange('siret', e.target.value)} size="medium" sx={{ mt:0.5 }}/>
          </FormControl>
        </Grid>
        <Grid size={{ xs:12, sm:6 }}>
          <FormControl fullWidth>
            <FormLabel>Secteur d'activité</FormLabel>
            <TextField fullWidth placeholder="Technologie / Services" value={data.sector} onChange={e => onChange('sector', e.target.value)} size="medium" sx={{ mt:0.5 }}/>
          </FormControl>
        </Grid>
      </Grid>
    </Stack>
  );
}

// ── Step 2 : Identity verification ──────────────────────────────────────────
function VerifyStep({ data, onChange }: { data: any; onChange: (k: string, v: string) => void }) {
  return (
    <Stack spacing={2.5}>
      <Typography variant="h6" fontWeight={700} color="primary">Vérification d'identité</Typography>
      <Typography variant="body2" color="text.secondary">
        Cette étape est requise périodiquement pour garantir la sécurité de votre accès à la plateforme.
      </Typography>
      <Alert severity="info" sx={{ borderRadius:2 }}>
        Vérification annuelle requise pour maintenir l'accès au Dashboard RH.
      </Alert>
      <Grid container spacing={2}>
        <Grid size={{ xs:12 }}>
          <FormControl fullWidth>
            <FormLabel>Mot de passe actuel *</FormLabel>
            <TextField fullWidth type="password" placeholder="••••••••" value={data.password} onChange={e => onChange('password', e.target.value)} size="medium" sx={{ mt:0.5 }}/>
          </FormControl>
        </Grid>
        <Grid size={{ xs:12 }}>
          <FormControl fullWidth>
            <FormLabel>Code d'autorisation (envoyé par email)</FormLabel>
            <TextField fullWidth placeholder="XXXX-XXXX" value={data.authCode} onChange={e => onChange('authCode', e.target.value)} size="medium" sx={{ mt:0.5 }}/>
          </FormControl>
        </Grid>
      </Grid>
      <Box sx={{ p:2, borderRadius:2, bgcolor:'action.hover', border:'1px solid', borderColor:'divider' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <VerifiedUserRoundedIcon color="primary" fontSize="small"/>
          <Typography variant="body2" fontWeight={600}>Données chiffrées et sécurisées</Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt:0.5, ml:3.5 }}>
          Vos informations sont protégées par chiffrement AES-256.
        </Typography>
      </Box>
    </Stack>
  );
}

// ── Step 3 : Review & confirm ────────────────────────────────────────────────
function ReviewStep({ companyData }: { companyData: any }) {
  return (
    <Stack spacing={2.5}>
      <Typography variant="h6" fontWeight={700} color="primary">Récapitulatif</Typography>
      <Typography variant="body2" color="text.secondary">Vérifiez les informations avant de confirmer.</Typography>
      <Card variant="outlined" sx={{ borderRadius:2 }}>
        <CardContent>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Société</Typography>
              <Typography variant="body2" fontWeight={600}>{companyData.company || '—'}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Responsable</Typography>
              <Typography variant="body2" fontWeight={600}>{companyData.first_name} {companyData.last_name}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Email</Typography>
              <Typography variant="body2" fontWeight={600}>{companyData.email || '—'}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Prochain renouvellement</Typography>
              <Chip label="Dans 30 jours" size="small" color="success" variant="outlined"/>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      <Alert severity="success" icon={<CheckCircleRoundedIcon />} sx={{ borderRadius:2 }}>
        En confirmant, votre accès au Dashboard sera validé pour les 30 prochains jours.
      </Alert>
    </Stack>
  );
}

// ── Sidebar info ─────────────────────────────────────────────────────────────
function InfoSidebar({ step }: { step: number }) {
  const items = [
    { icon: <BusinessRoundedIcon color="primary"/>, title: 'Mise à jour annuelle', desc: 'Gardez vos informations à jour pour garantir la continuité de service.' },
    { icon: <VerifiedUserRoundedIcon color="primary"/>, title: 'Sécurité renforcée', desc: 'Vérification périodique obligatoire pour protéger votre espace RH.' },
    { icon: <PaymentRoundedIcon color="primary"/>, title: 'Accès garanti', desc: 'Après validation, accès complet au Dashboard pendant 30 jours.' },
  ];
  return (
    <Stack spacing={2}>
      {items.map((it, i) => (
        <Stack key={i} direction="row" spacing={1.5} sx={{ opacity: i <= step ? 1 : 0.5, transition:'opacity 0.3s' }}>
          <Box sx={{ mt:0.3, flexShrink:0 }}>{it.icon}</Box>
          <Box>
            <Typography variant="body2" fontWeight={700}>{it.title}</Typography>
            <Typography variant="caption" color="text.secondary">{it.desc}</Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Checkout(props: { disableCustomTheme?: boolean }) {
  const { user, validatePayment } = useAuth();
  const navigate  = useNavigate();
  const [step, setStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const [companyData, setCompanyData] = React.useState({
    company: user?.company_name ?? '', first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '', email: user?.email ?? '',
    address: '', siret: '', sector: '',
  });
  const [verifyData, setVerifyData] = React.useState({ password: '', authCode: '' });

  const update = (obj: any, setter: any) => (k: string, v: string) => setter((p: any) => ({ ...p, [k]: v }));

  const handleNext = async () => {
    if (step < STEPS.length - 1) { setStep(s => s + 1); return; }
    // Final confirmation
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500)); // simulate API
    validatePayment();
    setLoading(false);
    setDone(true);
    setTimeout(() => navigate('/dashboard', { replace:true }), 2500);
  };

  const canNext = () => {
    if (step === 0) return !!(companyData.company && companyData.first_name && companyData.last_name && companyData.email);
    if (step === 1) return !!verifyData.password;
    return true;
  };

  if (done) return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme/>
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', flexDirection:'column', gap:3 }}>
        <CheckCircleRoundedIcon sx={{ fontSize:80, color:'success.main' }}/>
        <Typography variant="h4" fontWeight={800}>Vérification confirmée !</Typography>
        <Typography color="text.secondary">Redirection vers le Dashboard...</Typography>
        <CircularProgress/>
      </Box>
    </AppTheme>
  );

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme/>
      <Box sx={{ position:'fixed', top:'1rem', right:'1rem', zIndex:9 }}>
        <ColorModeIconDropdown/>
      </Box>
      <Grid container sx={{ minHeight:'100vh' }}>
        {/* Sidebar */}
        <Grid size={{ xs:12, md:4 }} sx={{ bgcolor:'primary.main', color:'white', p:{ xs:4, md:6 }, display:'flex', flexDirection:'column', justifyContent:'center' }}>
          <Stack spacing={1} sx={{ mb:6 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PaymentRoundedIcon sx={{ fontSize:32 }}/>
              <Typography variant="h5" fontWeight={800}>Vérification périodique</Typography>
            </Stack>
            <Typography variant="body2" sx={{ opacity:0.85 }}>
              Mise à jour requise tous les 30 jours pour maintenir l'accès à votre Dashboard RH.
            </Typography>
          </Stack>
          <InfoSidebar step={step}/>
        </Grid>

        {/* Form */}
        <Grid size={{ xs:12, md:8 }} sx={{ p:{ xs:3, sm:6, md:8 }, display:'flex', flexDirection:'column', justifyContent:'center' }}>
          <Box sx={{ maxWidth:580, mx:'auto', width:'100%' }}>
            <Button startIcon={<ArrowBackRoundedIcon/>} onClick={() => navigate('/dashboard')} sx={{ mb:3 }} color="inherit">
              Retour au Dashboard
            </Button>

            <Stepper activeStep={step} sx={{ mb:5 }}>
              {STEPS.map(label => (
                <Step key={label}><StepLabel>{label}</StepLabel></Step>
              ))}
            </Stepper>

            <Box sx={{ mb:4 }}>
              {step === 0 && <CompanyStep data={companyData} onChange={update(companyData, setCompanyData)}/>}
              {step === 1 && <VerifyStep  data={verifyData}  onChange={update(verifyData,  setVerifyData)}/>}
              {step === 2 && <ReviewStep  companyData={companyData}/>}
            </Box>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Button disabled={step === 0 || loading} onClick={() => setStep(s => s - 1)} variant="outlined" sx={{ borderRadius:2 }}>
                Précédent
              </Button>
              <Button variant="contained" size="large" disabled={!canNext() || loading} onClick={handleNext}
                endIcon={loading ? <CircularProgress size={18} color="inherit"/> : <ChevronRightRoundedIcon/>}
                sx={{ borderRadius:2, px:4, fontWeight:700 }}>
                {step === STEPS.length - 1 ? (loading ? 'Validation...' : 'Confirmer') : 'Suivant'}
              </Button>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </AppTheme>
  );
}
