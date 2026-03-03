import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { motion } from "framer-motion";
const StyledBox = styled('div')(({ theme }) => ({
  alignSelf: 'center',
  width: '100%',
  height: 420,
  marginTop: theme.spacing(8),
  borderRadius: "10PX",
  outline: '6px solid',
  outlineColor: 'hsla(220, 25%, 80%, 0.2)',
  border: '1px solid',
  borderColor: (theme.vars || theme).palette.grey[200],
  boxShadow: '0 0 12px 8px hsla(220, 25%, 80%, 0.2)',
  backgroundImage: `url('/img/dash_light.png')`,
  backgroundSize: 'cover',
  [theme.breakpoints.up('sm')]: {
    marginTop: theme.spacing(10),
   
  },
  ...theme.applyStyles('dark', {
    boxShadow: '0 0 24px 12px hsla(210, 100%, 25%, 0.2)',
  backgroundImage: `url('/img/dash_dark1.png')`,
    outlineColor: 'hsla(220, 20%, 42%, 0.1)',
    borderColor: (theme.vars || theme).palette.grey[700],
  }),
}));

export default function HeroMotion() {
  return (
    <Box
      id="hero"
      sx={(theme) => ({
        width: '100%',
        backgroundRepeat: 'no-repeat',
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)',
        ...theme.applyStyles('dark', {
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)',
        }),
      })}
    >
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: 14, sm: 20 },
          pb: { xs: 8, sm: 12 },
        }}
      >
        <Stack
          spacing={2}
          useFlexGap
          
          sx={{ alignItems: 'center', width: { xs: '100%', sm: '70%', marginBlock:"125PX"} }}
        >
          {/* ===== Title ===== */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Typography
              variant="h1"
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                fontSize: 'clamp(3rem, 10vw, 3.5rem)',
              }}
            >
              Smart&nbsp;HR&nbsp;
              <Typography
                component="span"
                variant="h1"
                sx={(theme) => ({
                  fontSize: 'inherit',
                  color: 'primary.main',
                  ...theme.applyStyles('dark', {
                    color: 'primary.light',
                  }),
                })}

              >
                Made&nbsp;Easy
              </Typography>
            </Typography>
          </motion.div>

          {/* ===== Subtitle ===== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
           
          >
           <div style={{display: "flex",
                    justifyContent: "center", }}>
            <Typography
              sx={{
                textAlign: 'center',
                      color: 'text.secondary',
                width: { sm: '100%', md: '88%' },
               
              }}
            >
      <b>FlowHR</b> est une plateforme RH de nouvelle génération conçue pour simplifier la gestion du personnel. Grâce à des tableaux de bord intelligents et des flux de travail optimisés, elle permet d'améliorer la productivité et de transformer la gestion des talents de manière personnalisée.            </Typography>
            </div>
          </motion.div>

          {/* ===== Input + Button ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            {/* <Stack
              spacing={1}
              sx={{ pt: 2, width: { xs: '100%', sm: '350px',textAlign:"center" } }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{ minWidth: 'fit-content',p:"14PX" }}
              >
                Start now
              </Button>
            </Stack> */}
          </motion.div> 
        </Stack>

        {/* ===== Image Hero ===== */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95,width:"100%"}}
          animate={{ opacity: 1, y: 0, scale: 1}}
          transition={{ duration: 1, delay: 0.8 }}
        >
           <div data-aos="zoom-in">
          <StyledBox id="image" />
        </div>
        </motion.div>
      </Container>
    </Box>
  );
}
