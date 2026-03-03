import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import { useChartTheme } from '../../hooks/useChartTheme';

interface BarChartCardProps {
  title: string;
  subtitle?: string;
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor?: string | string[]; borderColor?: string }[];
  loading?: boolean;
  height?: number;
  stacked?: boolean;
}

export default function BarChartCard({
  title, subtitle, labels, datasets,
  loading = false, height = 250, stacked = false,
}: BarChartCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<Chart | null>(null);
  const colors    = useChartTheme();

  useEffect(() => {
    if (!canvasRef.current || loading || !labels.length) return;
    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: datasets.map((ds, i) => ({
          ...ds,
          backgroundColor: ds.backgroundColor ?? colors.primary[i % colors.primary.length],
          borderRadius: 4,
          borderSkipped: false,
        })),
      },
      options: {
        ...colors.chartOptions,
        scales: {
          ...colors.chartOptions.scales,
          x: { ...colors.chartOptions.scales.x, stacked },
          y: { ...colors.chartOptions.scales.y, stacked },
        },
      } as any,
    });

    return () => { chartRef.current?.destroy(); };
  }, [labels, datasets, loading, colors, stacked]);

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
