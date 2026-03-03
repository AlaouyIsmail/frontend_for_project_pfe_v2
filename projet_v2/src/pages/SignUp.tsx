import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import MuiCard from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import AppTheme from '../theme/AppTheme';
import ColorModeSelect from '../theme/ColorModeSelect';
import SvgIcon from '@mui/material/SvgIcon';

// ========================================
// API CONFIGURATION
// ========================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ========================================
// GOOGLE ICON
// ========================================

export function GoogleIcon() {
  return (
    <SvgIcon>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15.68 8.18182C15.68 7.61455 15.6291 7.06909 15.5345 6.54545H8V9.64364H12.3055C12.1164 10.64 11.5491 11.4836 10.6982 12.0509V14.0655H13.2945C14.8073 12.6691 15.68 10.6182 15.68 8.18182Z"
          fill="#4285F4"
        />
        <path
          d="M8 16C10.16 16 11.9709 15.2873 13.2945 14.0655L10.6982 12.0509C9.98545 12.5309 9.07636 12.8218 8 12.8218C5.92 12.8218 4.15273 11.4182 3.52 9.52727H0.858182V11.5927C2.17455 14.2036 4.87273 16 8 16Z"
          fill="#34A853"
        />
        <path
          d="M3.52 9.52C3.36 9.04 3.26545 8.53091 3.26545 8C3.26545 7.46909 3.36 6.96 3.52 6.48V4.41455H0.858182C0.312727 5.49091 0 6.70545 0 8C0 9.29455 0.312727 10.5091 0.858182 11.5855L2.93091 9.97091L3.52 9.52Z"
          fill="#FBBC05"
        />
        <path
          d="M8 3.18545C9.17818 3.18545 10.2255 3.59273 11.0618 4.37818L13.3527 2.08727C11.9636 0.792727 10.16 0 8 0C4.87273 0 2.17455 1.79636 0.858182 4.41455L3.52 6.48C4.15273 4.58909 5.92 3.18545 8 3.18545Z"
          fill="#EA4335"
        />
      </svg>
    </SvgIcon>
  );
}

// ========================================
// STYLED COMPONENTS
// ========================================

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '600px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

// ========================================
// MAIN COMPONENT
// ========================================

export default function SignUp(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  // ========== VALIDATION ERRORS ==========
  const [companyNameError, setCompanyNameError] = React.useState(false);
  const [companyNameErrorMessage, setCompanyNameErrorMessage] = React.useState('');

  const [firstNameError, setFirstNameError] = React.useState(false);
  const [firstNameErrorMessage, setFirstNameErrorMessage] = React.useState('');

  const [lastNameError, setLastNameError] = React.useState(false);
  const [lastNameErrorMessage, setLastNameErrorMessage] = React.useState('');

  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');

  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');

  // ========== API STATES ==========
  const [loading, setLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');

  // ========== PROFILE IMAGE ==========
  const [profileImg, setProfileImg] = React.useState<File | null>(null);
  const [profileImgPreview, setProfileImgPreview] = React.useState<string | null>(null);

  // ========== FORM REF ==========
  const formRef = React.useRef<HTMLFormElement>(null);

  // ========================================
  // VALIDATION FUNCTIONS
  // ========================================

  const validateEmail = (email: string): boolean => {
    return /^\S+@\S+\.\S+$/.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateName = (name: string): boolean => {
    return name.trim().length >= 1;
  };

  const validateCompanyName = (name: string): boolean => {
    return name.trim().length >= 2;
  };

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select a valid image file');
        return;
      }

      // Validate file size (3MB max based on Flask config)
      if (file.size > 3 * 1024 * 1024) {
        setErrorMessage('Image size must be less than 3MB');
        return;
      }

      setProfileImg(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImgPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateAllFields = (): boolean => {
    let isValid = true;

    // Validate company name
    const companyNameInput = document.getElementById('company_name') as HTMLInputElement;
    if (!companyNameInput.value || !validateCompanyName(companyNameInput.value)) {
      setCompanyNameError(true);
      setCompanyNameErrorMessage('Company name must be at least 2 characters');
      isValid = false;
    } else {
      setCompanyNameError(false);
      setCompanyNameErrorMessage('');
    }

    // Validate first name
    const firstNameInput = document.getElementById('first_name') as HTMLInputElement;
    if (!firstNameInput.value || !validateName(firstNameInput.value)) {
      setFirstNameError(true);
      setFirstNameErrorMessage('First name is required');
      isValid = false;
    } else {
      setFirstNameError(false);
      setFirstNameErrorMessage('');
    }

    // Validate last name
    const lastNameInput = document.getElementById('last_name') as HTMLInputElement;
    if (!lastNameInput.value || !validateName(lastNameInput.value)) {
      setLastNameError(true);
      setLastNameErrorMessage('Last name is required');
      isValid = false;
    } else {
      setLastNameError(false);
      setLastNameErrorMessage('');
    }

    // Validate email
    const emailInput = document.getElementById('email') as HTMLInputElement;
    if (!emailInput.value || !validateEmail(emailInput.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    // Validate password
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (!passwordInput.value || !validatePassword(passwordInput.value)) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Clear messages
    setSuccessMessage('');
    setErrorMessage('');

    // Validate
    if (!validateAllFields()) {
      return;
    }

    setLoading(true);

    try {
      // Get form values
      const companyName = (document.getElementById('company_name') as HTMLInputElement).value;
      const firstName = (document.getElementById('first_name') as HTMLInputElement).value;
      const lastName = (document.getElementById('last_name') as HTMLInputElement).value;
      const email = (document.getElementById('email') as HTMLInputElement).value;
      const password = (document.getElementById('password') as HTMLInputElement).value;

      // Create FormData
      const formData = new FormData();
      formData.append('company_name', companyName);
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('email', email);
      formData.append('password', password);

      if (profileImg) {
        formData.append('profile_img', profileImg);
      }

      // Send to Flask
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('✓ Account created successfully! Redirecting to login...');

        // Reset form
        if (formRef.current) {
          formRef.current.reset();
        }
        setProfileImg(null);
        setProfileImgPreview(null);

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } else {
        setErrorMessage(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage('Failed to connect to server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RENDER
  // ========================================

return (
  <AppTheme {...props}>
    <CssBaseline enableColorScheme />
    <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
    <SignUpContainer direction="column" justifyContent="space-between">
      <Card variant="outlined" >
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', mb: 2 }}
        >
          Sign up
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Box
          component="form"
          ref={formRef}
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Grid container spacing={2} sx={{ display:"flex",justifyItems:"center", justifyContent:"center"}}>
            <Grid>
              <FormControl fullWidth>
                <FormLabel htmlFor="company_name">Company Name *</FormLabel>
                <TextField
                  name="company_name"
                  required
                  fullWidth
                  id="company_name"
                  placeholder="Your Company Inc."
                  error={companyNameError}
                  helperText={companyNameErrorMessage}
                  disabled={loading}
                />
              </FormControl>
            </Grid>
            <Grid >
              <FormControl fullWidth>
                <FormLabel htmlFor="first_name">First Name *</FormLabel>
                <TextField
                  name="first_name"
                  required
                  fullWidth
                  id="first_name"
                  placeholder="John"
                  error={firstNameError}
                  helperText={firstNameErrorMessage}
                  disabled={loading}
                />
              </FormControl>
            </Grid>

            <Grid >
              <FormControl fullWidth>
                <FormLabel htmlFor="last_name">Last Name *</FormLabel>
                <TextField
                  name="last_name"
                  required
                  fullWidth
                  id="last_name"
                  placeholder="Doe"
                  error={lastNameError}
                  helperText={lastNameErrorMessage}
                  disabled={loading}
                />
              </FormControl>
            </Grid>
            <Grid>
              <FormControl fullWidth>
                <FormLabel htmlFor="email">Email *</FormLabel>
                <TextField
                  required
                  fullWidth
                  id="email"
                  placeholder="your@email.com"
                  name="email"
                  error={emailError}
                  helperText={emailErrorMessage}
                  disabled={loading}
                />
              </FormControl>
            </Grid>

            <Grid >
              <FormControl fullWidth>
                <FormLabel htmlFor="password">Password *</FormLabel>
                <TextField
                  required
                  fullWidth
                  name="password"
                  placeholder="••••••"
                  type="password"
                  id="password"
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  disabled={loading}
                />
              </FormControl>
            </Grid>
            <Grid >
              <FormControl fullWidth>
                <FormLabel htmlFor="profile_img">Profile Image (Optional)</FormLabel>
               <Button variant="outlined" component="label" sx={{width:"220PX"}}>
          Upload profile image
          <input
            type="file"
            id="profile_img"
            name="profile_img"
            hidden
            accept=".jpg,.jpeg,.png"
            onChange={handleProfileImageChange}
             disabled={loading}
          />
        </Button> 
              </FormControl>
            </Grid>


          </Grid>
          <FormControlLabel
            control={<Checkbox value="allowExtraEmails" color="primary" disabled={loading} />}
            label="I want to receive updates via email"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ padding: '12px', fontSize: '1rem' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign up'}
          </Button>
        </Box>

        <Divider >
          <Typography sx={{ color: 'text.secondary' }}>or</Typography>
        </Divider>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => alert('Sign up with Google')}
            startIcon={<GoogleIcon />}
            disabled={loading}
          >
            Sign up with Google
          </Button>
          <Typography sx={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <Link href="/login" variant="body2">
              Sign in
            </Link>
          </Typography>
        </Box>
      </Card>
    </SignUpContainer>
  </AppTheme>
);
}