import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { BranchProvider } from './context/BranchContext';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BranchProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </BranchProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
