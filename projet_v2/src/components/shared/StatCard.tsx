// import { useTheme } from '@mui/material/styles';
// import Box from '@mui/material/Box';
// import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
// import Chip from '@mui/material/Chip';
// import Stack from '@mui/material/Stack';
// import Typography from '@mui/material/Typography';
// import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
// import { areaElementClasses } from '@mui/x-charts/LineChart';

// export type StatCardProps = {
//   title: string;
//   value: string;
//   interval: string;
//   trend: 'up' | 'down' | 'neutral';
//   data: number[];
// };

// function getDaysInMonth(month: number, year: number) {
//   const date = new Date(year, month, 0);
//   const monthName = date.toLocaleDateString('en-US', {
//     month: 'short',
//   });
//   const daysInMonth = date.getDate();
//   const days = [];
//   let i = 1;
//   while (days.length < daysInMonth) {
//     days.push(`${monthName} ${i}`);
//     i += 1;
//   }
//   return days;
// }

// function AreaGradient({ color, id }: { color: string; id: string }) {
//   return (
//     <defs>
//       <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
//         <stop offset="0%" stopColor={color} stopOpacity={0.3} />
//         <stop offset="100%" stopColor={color} stopOpacity={0} />
//       </linearGradient>
//     </defs>
//   );
// }

// export default function StatCard({
//   title,
//   value,
//   interval,
//   trend,
//   data,
// }: StatCardProps) {
//   const theme = useTheme();
//   const daysInWeek = getDaysInMonth(4, 2024);

//   const trendColors = {
//     up:
//       theme.palette.mode === 'light'
//         ? theme.palette.success.main
//         : theme.palette.success.dark,
//     down:
//       theme.palette.mode === 'light'
//         ? theme.palette.error.main
//         : theme.palette.error.dark,
//     neutral:
//       theme.palette.mode === 'light'
//         ? theme.palette.grey[400]
//         : theme.palette.grey[700],
//   };

//   const labelColors = {
//     up: 'success' as const,
//     down: 'error' as const,
//     neutral: 'default' as const,
//   };

//   const color = labelColors[trend];
//   const chartColor = trendColors[trend];
//   const trendValues = { up: '+25%', down: '-25%', neutral: '+5%' };

//   return (
//     <Card variant="outlined" sx={{ height: '100%', flexGrow: 1 }}>
//       <CardContent>
//         <Typography component="h2" variant="subtitle2" gutterBottom>
//           {title}
//         </Typography>
//         <Stack
//           direction="column"
//           sx={{ justifyContent: 'space-between', flexGrow: '1', gap: 1 }}
//         >
//           <Stack sx={{ justifyContent: 'space-between' }}>
//             <Stack
//               direction="row"
//               sx={{ justifyContent: 'space-between', alignItems: 'center' }}
//             >
//               <Typography variant="h4" component="p">
//                 {value}
//               </Typography>
//               <Chip size="small" color={color} label={trendValues[trend]} />
//             </Stack>
//             <Typography variant="caption" sx={{ color: 'text.secondary' }}>
//               {interval}
//             </Typography>
//           </Stack>
//           <Box sx={{ width: '100%', height: 50 }}>
//             <SparkLineChart
//               color={chartColor}
//               data={data}
//               area
//               showHighlight
//               showTooltip
//               xAxis={{
//                 scaleType: 'band',
//                 data: daysInWeek, // Use the correct property 'data' for xAxis
//               }}
//               sx={{
//                 [`& .${areaElementClasses.root}`]: {
//                   fill: `url(#area-gradient-${value})`,
//                 },
//               }}
//             >
//               <AreaGradient color={chartColor} id={`area-gradient-${value}`} />
//             </SparkLineChart>
//           </Box>
//         </Stack>
//       </CardContent>
//     </Card>
//   );
// }


import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { areaElementClasses } from '@mui/x-charts/LineChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

export type StatCardProps = {
  title: string;
  value: string;
  interval: string;
  trend: 'up' | 'down' | 'neutral';
  data: number[];
};

// Fonction corrigée pour générer exactement le bon nombre de jours
function generateDaysLabels(dataLength: number) {
  const labels = [];
  for (let i = 1; i <= dataLength; i++) {
    labels.push(`Jour ${i}`);
  }
  return labels;
}

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0.05} />
      </linearGradient>
    </defs>
  );
}

export default function StatCard({
  title,
  value,
  interval,
  trend,
  data,
}: StatCardProps) {
  const theme = useTheme();
  
  // Génère les labels en fonction de la longueur réelle des données
  const xAxisLabels = generateDaysLabels(data.length);

  // Calcul du pourcentage de variation
  const calculateTrendPercentage = () => {
    if (data.length < 2) return '0%';
    const firstValue = data[0];
    const lastValue = data[data.length - 1];
    
    // Éviter la division par zéro
    if (firstValue === 0) return '0%';
    
    const percentage = ((lastValue - firstValue) / firstValue) * 100;
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  const trendColors = {
    up:
      theme.palette.mode === 'light'
        ? theme.palette.success.main
        : theme.palette.success.dark,
    down:
      theme.palette.mode === 'light'
        ? theme.palette.error.main
        : theme.palette.error.dark,
    neutral:
      theme.palette.mode === 'light'
        ? theme.palette.info.main
        : theme.palette.info.dark,
  };

  const labelColors = {
    up: 'success' as const,
    down: 'error' as const,
    neutral: 'info' as const,
  };

  const trendIcons = {
    up: <TrendingUpIcon sx={{ fontSize: 16 }} />,
    down: <TrendingDownIcon sx={{ fontSize: 16 }} />,
    neutral: <TrendingFlatIcon sx={{ fontSize: 16 }} />,
  };

  const color = labelColors[trend];
  const chartColor = trendColors[trend];
  const trendPercentage = calculateTrendPercentage();
  const trendIcon = trendIcons[trend];

  // Génère un ID unique et valide pour le gradient
  const gradientId = `area-gradient-${title.replace(/[^a-zA-Z0-9]/g, '-')}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: '100%', 
        flexGrow: 1,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)',
        }
      }}
    >
      <CardContent>
        <Stack
          direction="column"
          sx={{ justifyContent: 'space-between', height: '100%', gap: 2 }}
        >
          {/* En-tête de la carte */}
          <Box>
            <Typography 
              component="h3" 
              variant="subtitle2" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 500,
                mb: 1
              }}
            >
              {title}
            </Typography>
            <Stack
              direction="row"
              sx={{ 
                justifyContent: 'space-between', 
                alignItems: 'baseline',
                mb: 0.5 
              }}
            >
              <Typography 
                variant="h3" 
                component="p"
                sx={{ 
                  fontWeight: 700,
                  color: 'text.primary'
                }}
              >
                {value}
              </Typography>
              <Chip 
                size="small" 
                color={color} 
                label={trendPercentage}
                icon={trendIcon}
                sx={{ 
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    marginLeft: '4px'
                  }
                }}
              />
            </Stack>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                display: 'block'
              }}
            >
              {interval}
            </Typography>
          </Box>

          {/* Graphique */}
          <Box sx={{ width: '100%', height: 60, mt: 'auto' }}>
            <SparkLineChart
              // colors={[chartColor]}
              data={data}
              area
              showHighlight
              showTooltip
              curve="natural"
              xAxis={{
                scaleType: 'band',
                data: xAxisLabels,
              }}
              sx={{
                [`& .${areaElementClasses.root}`]: {
                  fill: `url(#${gradientId})`,
                },
                '& .MuiLineElement-root': {
                  strokeWidth: 2,
                },
              }}
            >
              <AreaGradient 
                color={chartColor} 
                id={gradientId} 
              />
            </SparkLineChart>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
// ```

// ## 🔑 **Corrections apportées :**

// 1. **Fonction `generateDaysLabels(dataLength)`** :
//    - Génère exactement le même nombre de labels que de points de données
//    - Plus de problème de correspondance entre axe X et données

// 2. **Protection contre division par zéro** :
//    - Vérifie si `firstValue === 0` avant de calculer le pourcentage

// 3. **ID de gradient unique** :
//    - Utilise le titre + un nombre aléatoire pour éviter les conflits d'ID
//    - Remplace les caractères spéciaux par des tirets

// 4. **Suppression de `getDaysInMonth`** :
//    - Cette fonction causait le problème car elle générait un nombre variable de jours

// ## 📝 **Pourquoi l'erreur se produisait :**
// ```
// data.length = 30  (vos données ont 30 points)
// xAxis.data.length = 28  (février a 28 jours)
// ❌ 28 < 30 → ERREUR!
// ```

// Maintenant :
// ```
// data.length = 30
// xAxis.data.length = 30  (generateDaysLabels crée 30 labels)
// ✅ 30 = 30 → Ça marche!