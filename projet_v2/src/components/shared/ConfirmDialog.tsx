import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

interface Props {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
  confirmLabel?: string;
  confirmColor?: 'error' | 'warning' | 'primary';
}

export default function ConfirmDialog({ open, title, message, onConfirm, onClose, loading, confirmLabel = 'Confirmer', confirmColor = 'error' }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: `${confirmColor}.main`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <WarningAmberRoundedIcon sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Typography fontWeight={800} sx={{ fontSize: '0.95rem' }}>{title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }} disabled={loading}>Annuler</Button>
        <Button variant="contained" color={confirmColor} onClick={onConfirm} disabled={loading}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
          {loading ? 'En cours...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
