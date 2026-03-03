import { useTheme } from '@mui/material/styles';

export function useChartTheme() {
  const theme = useTheme();
  return {
    primary: [
      theme.palette.primary.main, theme.palette.primary.light, theme.palette.primary.dark,
      theme.palette.success.main, theme.palette.warning.main,  theme.palette.error.main,
    ],
    tooltip: {
      backgroundColor: theme.palette.background.paper,
      borderColor:     theme.palette.divider,
      titleColor:      theme.palette.text.primary,
      bodyColor:       theme.palette.text.secondary,
    },
    chartOptions: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: theme.palette.text.secondary, font: { family: 'Inter, sans-serif', size: 12 } },
        },
        tooltip: {
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.divider, borderWidth: 1,
          titleColor: theme.palette.text.primary, bodyColor: theme.palette.text.secondary, padding: 10,
        },
      },
      scales: {
        x: { ticks: { color: theme.palette.text.secondary }, grid: { color: theme.palette.divider } },
        y: { ticks: { color: theme.palette.text.secondary }, grid: { color: theme.palette.divider } },
      },
    },
  };
}
