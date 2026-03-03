import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface ToastProps {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export function Toast({ open, message, severity, onClose }: ToastProps) {
  return (
    <Snackbar open={open} autoHideDuration={4000} onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <Alert severity={severity} variant="filled" onClose={onClose}
        sx={{ borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', fontWeight: 600 }}>
        {message}
      </Alert>
    </Snackbar>
  );
}

export function useToast() {
  const [toast, setToast] = React.useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' | 'warning' | 'info' });
  const show  = (msg: string, sev: 'success' | 'error' | 'warning' | 'info' = 'success') => setToast({ open: true, msg, sev });
  const close = () => setToast(t => ({ ...t, open: false }));
  const ToastEl = <Toast open={toast.open} message={toast.msg} severity={toast.sev} onClose={close} />;
  return { show, ToastEl };
}
