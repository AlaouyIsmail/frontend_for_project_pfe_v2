import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import { useChartTheme } from '../../hooks/useChartTheme';

const DOUGHNUT_COLORS = [
  'hsl(210,98%,48%)', 'hsl(150,60%,45%)', 'hsl(45,90%,48%)',
  'hsl(0,85%,55%)',   'hsl(270,60%,58%)', 'hsl(195,70%,50%)',
];

// ── LINE CHART ───────────────────────────────────────────────────────────────
interface LineChartCardProps {
  title: string;
  subtitle?: string;
  labels: string[];
  datasets: { label: string; data: number[]; borderColor?: string; backgroundColor?: string; fill?: boolean }[];
  loading?: boolean;
  height?: number;
}

export function LineChartCard({ title, subtitle, labels, datasets, loading = false, height = 250 }: LineChartCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<Chart | null>(null);
  const colors    = useChartTheme();

  useEffect(() => {
    if (!canvasRef.current || loading || !labels.length) return;
    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map((ds, i) => ({
          ...ds,
          borderColor:     ds.borderColor     ?? colors.primary[i % colors.primary.length],
          backgroundColor: ds.backgroundColor ?? `${colors.primary[i % colors.primary.length]}25`,
          fill:    ds.fill ?? false,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 7,
          borderWidth: 2,
        })),
      },
      options: colors.chartOptions as any,
    });

    return () => { chartRef.current?.destroy(); };
  }, [labels, datasets, loading, colors]);

  return (
    <Card variant="outlined" sx={{ width: '100%', height: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>{title}</Typography>
        {subtitle && <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>{subtitle}</Typography>}
        {loading
          ? <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 1 }} />
          : <Box sx={{ height }}><canvas ref={canvasRef} /></Box>
        }
      </CardContent>
    </Card>
  );
}

// ── DOUGHNUT CHART ───────────────────────────────────────────────────────────
interface DoughnutChartCardProps {
  title: string;
  labels: string[];
  data: number[];
  colors?: string[];
  loading?: boolean;
  height?: number;
}

export function DoughnutChartCard({ title, labels, data, colors: customColors, loading = false, height = 260 }: DoughnutChartCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<Chart | null>(null);
  const theme     = useChartTheme();

  useEffect(() => {
    if (!canvasRef.current || loading || !data.length) return;
    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: customColors ?? DOUGHNUT_COLORS,
          borderWidth: 3,
          borderColor: theme.tooltip.backgroundColor,
          hoverBorderWidth: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: theme.tooltip.bodyColor,
              padding: 16,
              font: { family: 'Inter, sans-serif', size: 12 },
              usePointStyle: true,
              pointStyleWidth: 10,
            },
          },
          tooltip: {
            backgroundColor: theme.tooltip.backgroundColor,
            borderColor: theme.tooltip.borderColor,
            borderWidth: 1,
            titleColor: theme.tooltip.titleColor,
            bodyColor: theme.tooltip.bodyColor,
            padding: 12,
          },
        },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [labels, data, loading, theme, customColors]);

  return (
    <Card variant="outlined" sx={{ width: '100%', height: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>{title}</Typography>
        {loading
          ? <Skeleton variant="circular" width={height} height={height} sx={{ mx: 'auto' }} />
          : <Box sx={{ height }}><canvas ref={canvasRef} /></Box>
        }
      </CardContent>
    </Card>
  );
}

// ── HORIZONTAL BAR ──────────────────────────────────────────────────────────
interface HBarChartCardProps {
  title: string;
  labels: string[];
  data: number[];
  maxValue?: number;
  loading?: boolean;
  height?: number;
  color?: string;
}

export function HBarChartCard({ title, labels, data, maxValue, loading = false, height = 250, color }: HBarChartCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<Chart | null>(null);
  const colors    = useChartTheme();

  useEffect(() => {
    if (!canvasRef.current || loading || !data.length) return;
    chartRef.current?.destroy();

    // Color gradient based on value (high = warning/danger)
    const bgColors = data.map(v => {
      const pct = maxValue ? (v / maxValue) * 100 : v;
      if (pct > 80) return 'hsl(0,85%,55%)';
      if (pct > 60) return 'hsl(45,90%,48%)';
      return color ?? colors.primary[0];
    });

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: title,
          data,
          backgroundColor: bgColors,
          borderRadius: 4,
        }],
      },
      options: {
        ...colors.chartOptions,
        indexAxis: 'y' as const,
        scales: {
          x: {
            ...colors.chartOptions.scales.x,
            max: maxValue ?? undefined,
          },
          y: { ...colors.chartOptions.scales.y },
        },
        plugins: {
          ...colors.chartOptions.plugins,
          legend: { display: false },
        },
      } as any,
    });

    return () => { chartRef.current?.destroy(); };
  }, [labels, data, loading, colors, maxValue, color]);

  return (
    <Card variant="outlined" sx={{ width: '100%', height: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>{title}</Typography>
        {loading
          ? <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 1 }} />
          : <Box sx={{ height }}><canvas ref={canvasRef} /></Box>
        }
      </CardContent>
    </Card>
  );
}
