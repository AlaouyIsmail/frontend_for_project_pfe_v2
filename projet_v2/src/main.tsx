import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppTheme from './theme/AppTheme';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import CssBaseline from '@mui/material/CssBaseline';
import MarketingPage from './pages/MarketingPage';
import SignIn        from './pages/SignIn';
import SignUp        from './pages/SignUp';
import Checkout      from './pages/Checkout';
import Dashboard     from './pages/Dashboard';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppTheme>
      <CssBaseline enableColorScheme />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"         element={<MarketingPage />} />
            <Route path="/login"    element={<SignIn />} />
            <Route path="/register" element={<SignUp />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout"              element={<Checkout />} />
              <Route path="/dashboard"             element={<Dashboard />} />
              <Route path="/dashboard/resources"   element={<Dashboard />} />
              <Route path="/dashboard/chefs"       element={<Dashboard />} />
              <Route path="/dashboard/projects"    element={<Dashboard />} />
              <Route path="/dashboard/analytics"   element={<Dashboard />} />
              <Route path="/dashboard/payment"     element={<Dashboard />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AppTheme>
  </React.StrictMode>
);
